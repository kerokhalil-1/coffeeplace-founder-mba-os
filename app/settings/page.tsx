'use client'
import { useState, useEffect, useRef } from 'react'
import { Download, Upload, Trash2, ShieldCheck, AlertTriangle, HardDrive, CheckCircle2, XCircle, RefreshCw, Clock, User } from 'lucide-react'
import {
  createBackup, downloadBackup, validateBackup, restoreBackup, clearAllData,
  getStorageStats, formatBytes, formatTimestamp,
  KEY_LABELS, BACKUP_VERSION,
  type StorageStats, type ValidationResult, type BackupFile,
} from '@/lib/backup'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/lib/storage'
import { useFirestore } from '@/hooks/useFirestore'
import { Input, FormField } from '@/components/ui/Input'
import { Settings } from '@/lib/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

const PAGE = { padding: '32px 36px', maxWidth: 860, margin: '0 auto' }

export default function SettingsPage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [importResult, setImportResult] = useState<ValidationResult | null>(null)
  const [importedBackup, setImportedBackup] = useState<BackupFile | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0)  // 0=idle, 1=confirm, 2=type
  const [clearInput, setClearInput] = useState('')
  const [exportDone, setExportDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // ── Profile / Settings ─────────────────────────────────────────────────────
  const [saved, setSaved, settingsInitialized] = useFirestore<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  const [form, setForm] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...saved }))
  const [profileSaved, setProfileSaved] = useState(false)

  // Sync form once localStorage finishes hydrating — prevents default overwrite
  useEffect(() => {
    if (settingsInitialized) setForm({ ...DEFAULT_SETTINGS, ...saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsInitialized])

  const setField = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSaveProfile = () => {
    setSaved(form)
    setProfileSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setProfileSaved(false), 2500)
  }

  // Load stats on mount (client-only)
  useEffect(() => {
    getStorageStats().then(setStats)
  }, [])

  const refreshStats = () => { getStorageStats().then(setStats) }

  // ── Export ──────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    const backup = await createBackup()
    downloadBackup(backup)
    toast.success('Backup downloaded')
    setExportDone(true)
    refreshStats()
    setTimeout(() => setExportDone(false), 3000)
  }

  // ── Import ──────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportResult(null)
    setImportedBackup(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        const result = validateBackup(raw)
        setImportResult(result)
        if (result.valid) setImportedBackup(raw as BackupFile)
      } catch {
        setImportResult({ valid: false, errors: ['File is not valid JSON'], warnings: [] })
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleRestoreConfirm = async () => {
    if (!importedBackup) return
    toast.success('Backup restored — reloading…')
    await restoreBackup(importedBackup)
  }

  // ── Clear ───────────────────────────────────────────────────────────────────

  const handleClearConfirm = async () => {
    if (clearInput.trim().toUpperCase() !== 'DELETE') return
    await clearAllData()
  }

  const closeClearModal = () => {
    setClearStep(0)
    setClearInput('')
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const ORDERED_KEYS = [
    STORAGE_KEYS.COURSES, STORAGE_KEYS.BOOKS, STORAGE_KEYS.ASSIGNMENTS,
    STORAGE_KEYS.EXAMS, STORAGE_KEYS.EXAM_ATTEMPTS, STORAGE_KEYS.NOTES,
    STORAGE_KEYS.KNOWLEDGE, STORAGE_KEYS.SKILL_SCORES, STORAGE_KEYS.APPLICATIONS,
    STORAGE_KEYS.WEEKLY_REVIEWS, STORAGE_KEYS.MONTHLY_REVIEWS, STORAGE_KEYS.READINESS,
    STORAGE_KEYS.MBA_MONTHS, STORAGE_KEYS.CASE_STUDIES, STORAGE_KEYS.SETTINGS,
  ]

  return (
    <div style={PAGE}>
      <PageHeader
        title="Settings"
        description="Manage your founder profile and data backup"
      />

      {/* ── Profile Section ── */}
      <Section title="Founder Profile" icon={<User size={15} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <FormField label="Founder Name">
            <Input value={form.founderName} onChange={e => setField('founderName', e.target.value)} placeholder="Your full name" />
          </FormField>
          <FormField label="Brand Name">
            <Input value={form.brandName} onChange={e => setField('brandName', e.target.value)} placeholder="Your brand name" />
          </FormField>
          <FormField label="MBA Start Date">
            <Input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
          </FormField>
          <FormField label={`Current MBA Month: ${form.currentMonth}`}>
            <input type="range" min={1} max={6} step={1} value={form.currentMonth}
              onChange={e => setField('currentMonth', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
              <span>Month 1</span><span>Month 6</span>
            </div>
          </FormField>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button onClick={handleSaveProfile} disabled={profileSaved}>
            {profileSaved ? <><CheckCircle2 size={14} /> Saved!</> : 'Save Profile'}
          </Button>
        </div>
      </Section>

      {/* ── Section 1: Data Overview ── */}
      <div id="backup" style={{ scrollMarginTop: 24 }} />
      <Section title="Data Overview" icon={<HardDrive size={15} />}>
        {stats ? (
          <>
            {/* Summary pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <SummaryPill label="Total Records" value={String(stats.totalRecords)} color="#1D4ED8" />
              <SummaryPill label="Storage Used" value={formatBytes(stats.storageBytes)} color="#7E22CE" />
              <SummaryPill label="Backup Version" value={BACKUP_VERSION} color="#92400E" />
              {stats.lastBackup
                ? <SummaryPill label="Last Backup" value={formatTimestamp(stats.lastBackup)} color="#15803D" />
                : <SummaryPill label="Last Backup" value="Never" color="#DC2626" />
              }
            </div>

            {/* Per-key counts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {ORDERED_KEYS.map(key => {
                const count = stats.counts[key] ?? 0
                if (count === 0) return null
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--secondary)', borderRadius: 7, fontSize: 12 }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{KEY_LABELS[key] ?? key}</span>
                    <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{count}</span>
                  </div>
                )
              })}
            </div>

            <button onClick={refreshStats} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)', padding: 0 }}>
              <RefreshCw size={11} /> Refresh stats
            </button>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Loading…</div>
        )}
      </Section>

      {/* ── Section 2: Export ── */}
      <Section title="Export Backup" icon={<Download size={15} />}>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Downloads a single JSON file containing all your data. Store it somewhere safe — Google Drive, Dropbox, or your desktop.
          The backup includes all 15 data collections with full metadata.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button onClick={handleExport} disabled={exportDone}>
            {exportDone ? <><CheckCircle2 size={14} /> Downloaded!</> : <><Download size={14} /> Download Backup</>}
          </Button>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            File: <code style={{ fontSize: 11, background: 'var(--secondary)', padding: '2px 6px', borderRadius: 4 }}>
              coffeeplace_backup_YYYY-MM-DD.json
            </code>
          </span>
        </div>
        {exportDone && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#15803D', display: 'flex', gap: 6, alignItems: 'center' }}>
            <CheckCircle2 size={13} /> Backup saved. Store this file safely — it is your only recovery option.
          </div>
        )}
      </Section>

      {/* ── Section 3: Import ── */}
      <Section title="Import & Restore" icon={<Upload size={15} />}>
        <div style={{ padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#92400E', flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: '#78350F', lineHeight: 1.5 }}>
            Restoring a backup will <strong>overwrite all current data</strong>. This cannot be undone.
            Export a backup of your current data first if you want to preserve it.
          </p>
        </div>

        {/* File picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: importResult ? 14 : 0 }}>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Choose Backup File
          </Button>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            Accepts .json files exported from this app
          </span>
        </div>

        {/* Validation result */}
        {importResult && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {importResult.valid ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <CheckCircle2 size={15} style={{ color: '#15803D' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#15803D' }}>Valid backup file</span>
                </div>
                {importResult.preview && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <InfoTag label="Exported" value={formatTimestamp(importResult.preview.exportedAt)} />
                    <InfoTag label="Version" value={importResult.preview.version} />
                    <InfoTag label="Records" value={String(importResult.preview.totalRecords)} />
                    <InfoTag label="Collections" value={String(importResult.preview.keys.length)} />
                  </div>
                )}
                {importResult.warnings.length > 0 && (
                  <div style={{ fontSize: 12, color: '#92400E', marginBottom: 10 }}>
                    {importResult.warnings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 5, padding: '2px 0' }}>
                        <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: 2 }} /> {w}
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={() => setRestoreOpen(true)}>
                  <Upload size={14} /> Restore This Backup
                </Button>
              </div>
            ) : (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <XCircle size={15} style={{ color: '#DC2626' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>Invalid backup file</span>
                </div>
                {importResult.errors.map((e, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: '#991B1B', padding: '2px 0', display: 'flex', gap: 5 }}>
                    <span style={{ flexShrink: 0 }}>•</span> {e}
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>
                  Choose a different file or export a fresh backup from a working device.
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Section 4: Danger Zone ── */}
      <Section title="Danger Zone" icon={<Trash2 size={15} />} danger>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Permanently delete all data and reset to factory defaults. Seed data (MBA months, knowledge map, exams, books) will be restored on next page load.
          All user-created records (courses, notes, assignments, reviews, skill scores) will be <strong>permanently lost</strong>.
        </p>
        <Button variant="danger" onClick={() => setClearStep(1)}>
          <Trash2 size={14} /> Clear All Data
        </Button>
      </Section>

      {/* ── Restore Confirm Modal ── */}
      <Modal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        title="Confirm Restore"
        width={500}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>
            <strong>This will overwrite all current data.</strong> Your current courses, notes, skill scores, reviews, and all other records will be replaced with the backup contents. This cannot be undone.
          </div>
          {importResult?.preview && (
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Backup from <strong>{formatTimestamp(importResult.preview.exportedAt)}</strong> containing{' '}
              <strong>{importResult.preview.totalRecords}</strong> records across{' '}
              <strong>{importResult.preview.keys.length}</strong> collections will be restored.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setRestoreOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleRestoreConfirm}>
              <Upload size={14} /> Yes, Restore Backup
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Clear Step 1: First confirmation ── */}
      <Modal
        open={clearStep === 1}
        onClose={closeClearModal}
        title="Clear All Data?"
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
            <strong>Warning:</strong> This will permanently delete all your courses, notes, skill progress, assignments, reviews, exam attempts, and all other user-created data. Seed data (knowledge map, exams, books) will reload automatically, but everything you have entered will be gone.
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            Before continuing, we strongly recommend downloading a backup.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={closeClearModal}>Cancel</Button>
            <Button variant="secondary" onClick={handleExport}><Download size={13} /> Download Backup First</Button>
            <Button variant="danger" onClick={() => setClearStep(2)}>Continue →</Button>
          </div>
        </div>
      </Modal>

      {/* ── Clear Step 2: Type DELETE to confirm ── */}
      <Modal
        open={clearStep === 2}
        onClose={closeClearModal}
        title="Final Confirmation"
        width={440}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13.5, color: 'var(--foreground)', lineHeight: 1.6 }}>
            Type <strong style={{ color: '#DC2626', fontFamily: 'monospace' }}>DELETE</strong> to confirm permanent data deletion.
          </div>
          <input
            autoFocus
            value={clearInput}
            onChange={e => setClearInput(e.target.value)}
            placeholder="Type DELETE here…"
            style={{
              width: '100%', padding: '10px 12px', fontSize: 14,
              background: 'var(--secondary)', border: `1px solid ${clearInput.trim().toUpperCase() === 'DELETE' ? '#DC2626' : 'var(--border)'}`,
              borderRadius: 8, color: 'var(--foreground)', outline: 'none',
              fontFamily: 'monospace', letterSpacing: '0.05em', boxSizing: 'border-box',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && clearInput.trim().toUpperCase() === 'DELETE') handleClearConfirm() }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={closeClearModal}>Cancel</Button>
            <Button
              variant="danger"
              disabled={clearInput.trim().toUpperCase() !== 'DELETE'}
              onClick={handleClearConfirm}
            >
              <Trash2 size={14} /> Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, icon, danger, children }: {
  title: string; icon: React.ReactNode; danger?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${danger ? '#FECACA' : 'var(--border)'}`,
      borderRadius: 12, padding: '20px 22px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color: danger ? '#DC2626' : 'var(--muted-foreground)' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: danger ? '#DC2626' : 'var(--foreground)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function SummaryPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '8px 14px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 9 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: 11.5, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 9px' }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}: </span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  )
}
