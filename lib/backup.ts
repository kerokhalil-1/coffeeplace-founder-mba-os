import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { STORAGE_KEYS } from './storage'

const COLLECTION = 'data'
const USER_ID = 'kero'

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKUP_VERSION = '1.0'
export const APP_NAME = 'CoffeePlace Founder MBA OS'
// Stored in localStorage only — it's metadata, not app data
export const BACKUP_META_KEY = 'coffeeplace_meta_last_backup'

/** Human-readable labels for each storage key */
export const KEY_LABELS: Record<string, string> = {
  [STORAGE_KEYS.COURSES]:         'Courses',
  [STORAGE_KEYS.MBA_MONTHS]:      'MBA Months',
  [STORAGE_KEYS.NOTES]:           'Notes',
  [STORAGE_KEYS.APPLICATIONS]:    'CP Applications',
  [STORAGE_KEYS.WEEKLY_REVIEWS]:  'Weekly Reviews',
  [STORAGE_KEYS.SETTINGS]:        'Settings',
  [STORAGE_KEYS.KNOWLEDGE]:       'Knowledge Map',
  [STORAGE_KEYS.SKILL_SCORES]:    'Skill Scores',
  [STORAGE_KEYS.ASSIGNMENTS]:     'Assignments',
  [STORAGE_KEYS.CASE_STUDIES]:    'Case Studies',
  [STORAGE_KEYS.EXAMS]:           'Exams',
  [STORAGE_KEYS.EXAM_ATTEMPTS]:   'Exam Attempts',
  [STORAGE_KEYS.BOOKS]:           'Books',
  [STORAGE_KEYS.MONTHLY_REVIEWS]: 'Monthly Reviews',
  [STORAGE_KEYS.READINESS]:       'Readiness Snapshots',
  [STORAGE_KEYS.WEEKLY_LEARNING]: 'Weekly Learning (legacy)',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackupManifest {
  keys: string[]
  counts: Record<string, number>
  totalRecords: number
  storageBytes: number
}

export interface BackupFile {
  version: string
  appName: string
  exportedAt: string
  manifest: BackupManifest
  data: Record<string, unknown>
}

export interface StorageStats {
  counts: Record<string, number>
  totalRecords: number
  storageBytes: number
  lastBackup: string | null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  preview?: {
    exportedAt: string
    version: string
    totalRecords: number
    keys: string[]
  }
}

// ─── Firestore helpers ────────────────────────────────────────────────────────

async function readKey(key: string): Promise<unknown> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, `${USER_ID}_${key}`))
    if (!snap.exists()) return null
    return snap.data().value ?? null
  } catch {
    return null
  }
}

function countRecords(value: unknown): number {
  if (value == null) return 0
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') return 1
  return 0
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStorageStats(): Promise<StorageStats> {
  let totalRecords = 0
  let storageBytes = 0
  const counts: Record<string, number> = {}

  for (const key of Object.values(STORAGE_KEYS)) {
    const value = await readKey(key)
    const count = countRecords(value)
    counts[key] = count
    totalRecords += count
    if (value != null) storageBytes += JSON.stringify(value).length * 2
  }

  const lastBackup = typeof window !== 'undefined'
    ? window.localStorage.getItem(BACKUP_META_KEY)
    : null

  return { counts, totalRecords, storageBytes, lastBackup }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function createBackup(): Promise<BackupFile> {
  const data: Record<string, unknown> = {}
  const counts: Record<string, number> = {}
  const keys: string[] = []
  let totalRecords = 0
  let storageBytes = 0

  for (const key of Object.values(STORAGE_KEYS)) {
    const value = await readKey(key)
    if (value != null) {
      data[key] = value
      keys.push(key)
      const count = countRecords(value)
      counts[key] = count
      totalRecords += count
      storageBytes += JSON.stringify(value).length * 2
    }
  }

  return {
    version: BACKUP_VERSION,
    appName: APP_NAME,
    exportedAt: new Date().toISOString(),
    manifest: { keys, counts, totalRecords, storageBytes },
    data,
  }
}

export function downloadBackup(backup: BackupFile): void {
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const dateStr = new Date(backup.exportedAt).toISOString().split('T')[0]
  const a = document.createElement('a')
  a.href = url
  a.download = `coffeeplace_backup_${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  window.localStorage.setItem(BACKUP_META_KEY, backup.exportedAt)
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateBackup(raw: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['File is not a valid JSON object'], warnings }
  }

  const b = raw as Record<string, unknown>

  if (typeof b.version !== 'string') errors.push('Missing or invalid "version" field')
  if (b.appName !== APP_NAME) {
    errors.push(`Invalid app name: "${b.appName}". Expected "${APP_NAME}". This backup may be from a different application.`)
  }
  if (typeof b.exportedAt !== 'string') errors.push('Missing or invalid "exportedAt" field')
  if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) {
    errors.push('Missing or invalid "data" field — expected an object')
  }
  if (!b.manifest || typeof b.manifest !== 'object' || Array.isArray(b.manifest)) {
    errors.push('Missing or invalid "manifest" field')
  }

  if (errors.length > 0) return { valid: false, errors, warnings }

  const manifest = b.manifest as Record<string, unknown>
  const data = b.data as Record<string, unknown>

  if (!Array.isArray(manifest.keys)) {
    errors.push('"manifest.keys" is not an array')
    return { valid: false, errors, warnings }
  }

  for (const key of manifest.keys as string[]) {
    if (!(key in data)) errors.push(`Data missing for declared key: "${key}"`)
  }

  if (typeof b.version === 'string' && b.version !== BACKUP_VERSION) {
    warnings.push(`Backup version ${b.version} differs from current ${BACKUP_VERSION}. Import should work but some fields may differ.`)
  }

  const knownKeys = new Set(Object.values(STORAGE_KEYS))
  for (const key of manifest.keys as string[]) {
    if (!(knownKeys as Set<string>).has(key)) {
      warnings.push(`Unknown key "${key}" will be imported but may not be used by the current app version.`)
    }
  }

  if (errors.length > 0) return { valid: false, errors, warnings }

  const totalRecords =
    typeof manifest.totalRecords === 'number' ? manifest.totalRecords : 0

  return {
    valid: true,
    errors: [],
    warnings,
    preview: {
      exportedAt: b.exportedAt as string,
      version: b.version as string,
      totalRecords,
      keys: manifest.keys as string[],
    },
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restoreBackup(backup: BackupFile): Promise<void> {
  // Clear existing Firestore documents
  await Promise.all(
    Object.values(STORAGE_KEYS).map(key =>
      deleteDoc(doc(db, COLLECTION, `${USER_ID}_${key}`)).catch(() => {})
    )
  )

  // Write backup data to Firestore
  await Promise.all(
    Object.entries(backup.data).map(([key, value]) =>
      setDoc(doc(db, COLLECTION, `${USER_ID}_${key}`), { value }).catch(err =>
        console.error(`[backup] Failed to restore key "${key}":`, err)
      )
    )
  )

  window.localStorage.setItem(BACKUP_META_KEY, backup.exportedAt)
  window.location.reload()
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  await Promise.all(
    Object.values(STORAGE_KEYS).map(key =>
      deleteDoc(doc(db, COLLECTION, `${USER_ID}_${key}`)).catch(() => {})
    )
  )
  window.localStorage.removeItem(BACKUP_META_KEY)
  window.location.reload()
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
