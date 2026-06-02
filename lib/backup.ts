/**
 * Backup Engine
 *
 * Pure functions for exporting, importing, validating, and clearing
 * all CoffeePlace Founder MBA OS localStorage data.
 *
 * Design decisions:
 * - All write operations (`restoreBackup`, `clearAllData`) call
 *   `window.location.reload()` at the end so all React state re-hydrates
 *   cleanly from the new localStorage state.
 * - `downloadBackup` uses a temporary <a> element — no external libs.
 * - `BACKUP_META_KEY` is intentionally outside STORAGE_KEYS so it
 *   does not appear in backup files (no point backing up the backup timestamp).
 */

import { STORAGE_KEYS } from './storage'

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKUP_VERSION = '1.0'
export const APP_NAME = 'CoffeePlace Founder MBA OS'
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
  keys: string[]                    // storage keys included
  counts: Record<string, number>    // record count per key
  totalRecords: number
  storageBytes: number              // estimated bytes at export time
}

export interface BackupFile {
  version: string                   // BACKUP_VERSION
  appName: string                   // APP_NAME
  exportedAt: string                // ISO 8601
  manifest: BackupManifest
  data: Record<string, unknown>     // key → parsed JSON value
}

export interface StorageStats {
  counts: Record<string, number>    // key → record count
  totalRecords: number
  storageBytes: number              // estimated (UTF-16 × 2 per char)
  lastBackup: string | null         // ISO string or null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  preview?: {                       // populated if valid
    exportedAt: string
    version: string
    totalRecords: number
    keys: string[]
  }
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

function readKey(key: string): unknown | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return null
    return JSON.parse(raw)
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

/** Read current storage usage and record counts. Safe to call server-side (returns zeros). */
export function getStorageStats(): StorageStats {
  if (typeof window === 'undefined') {
    return { counts: {}, totalRecords: 0, storageBytes: 0, lastBackup: null }
  }

  let totalRecords = 0
  let storageBytes = 0
  const counts: Record<string, number> = {}

  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key)
    if (raw) {
      storageBytes += raw.length * 2 // UTF-16
      const parsed = readKey(key)
      const count = countRecords(parsed)
      counts[key] = count
      totalRecords += count
    } else {
      counts[key] = 0
    }
  }

  const lastBackup = window.localStorage.getItem(BACKUP_META_KEY)
  return { counts, totalRecords, storageBytes, lastBackup }
}

// ─── Export ───────────────────────────────────────────────────────────────────

/** Collect all app data from localStorage into a BackupFile object. */
export function createBackup(): BackupFile {
  const data: Record<string, unknown> = {}
  const counts: Record<string, number> = {}
  const keys: string[] = []
  let totalRecords = 0
  let storageBytes = 0

  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key)
    if (raw != null) {
      const parsed = readKey(key)
      data[key] = parsed
      keys.push(key)
      const count = countRecords(parsed)
      counts[key] = count
      totalRecords += count
      storageBytes += raw.length * 2
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

/** Trigger a browser file download for the backup. Updates the last-backup meta key. */
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
  // Record the backup timestamp
  window.localStorage.setItem(BACKUP_META_KEY, backup.exportedAt)
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validate a parsed JSON object as a CoffeePlace backup file. */
export function validateBackup(raw: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['File is not a valid JSON object'], warnings }
  }

  const b = raw as Record<string, unknown>

  // Required top-level fields
  if (typeof b.version !== 'string') {
    errors.push('Missing or invalid "version" field')
  }
  if (b.appName !== APP_NAME) {
    errors.push(`Invalid app name: "${b.appName}". Expected "${APP_NAME}". This backup may be from a different application.`)
  }
  if (typeof b.exportedAt !== 'string') {
    errors.push('Missing or invalid "exportedAt" field')
  }
  if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) {
    errors.push('Missing or invalid "data" field — expected an object')
  }
  if (!b.manifest || typeof b.manifest !== 'object' || Array.isArray(b.manifest)) {
    errors.push('Missing or invalid "manifest" field')
  }

  if (errors.length > 0) return { valid: false, errors, warnings }

  // Manifest checks
  const manifest = b.manifest as Record<string, unknown>
  const data = b.data as Record<string, unknown>

  if (!Array.isArray(manifest.keys)) {
    errors.push('"manifest.keys" is not an array')
    return { valid: false, errors, warnings }
  }

  // Check each declared key has data
  for (const key of manifest.keys as string[]) {
    if (!(key in data)) {
      errors.push(`Data missing for declared key: "${key}"`)
    }
  }

  // Version compatibility warning (not blocking)
  if (typeof b.version === 'string' && b.version !== BACKUP_VERSION) {
    warnings.push(`Backup version ${b.version} differs from current ${BACKUP_VERSION}. Import should work but some fields may differ.`)
  }

  // Keys in backup that aren't in current STORAGE_KEYS (may be legacy)
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

/**
 * Restore a validated backup to localStorage.
 * Steps:
 *   1. Clear all existing coffeeplace_* keys
 *   2. Write all keys from backup.data
 *   3. Update last-backup meta timestamp
 *   4. Reload the page so all React hooks re-hydrate
 *
 * Only call this after the user has confirmed overwrite.
 */
export function restoreBackup(backup: BackupFile): void {
  // Step 1: wipe current data
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key)
  }

  // Step 2: write backup data
  for (const [key, value] of Object.entries(backup.data)) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`[backup] Failed to restore key "${key}":`, err)
    }
  }

  // Step 3: record restore timestamp as last backup
  window.localStorage.setItem(BACKUP_META_KEY, backup.exportedAt)

  // Step 4: reload so all hooks re-hydrate from new localStorage state
  window.location.reload()
}

// ─── Clear ────────────────────────────────────────────────────────────────────

/**
 * Remove ALL coffeeplace_* keys from localStorage and reload.
 * Only call this after the user has passed multi-step confirmation.
 */
export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key)
  }
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
