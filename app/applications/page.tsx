'use client'
import { useState, useMemo } from 'react'
import { Plus, Coffee, Edit3, Trash2, TrendingUp, Search, ArrowRight } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { STORAGE_KEYS } from '@/lib/storage'
import { CoffeeApplication, Course, AppStatus, CourseCategory, ImpactLevel, SkillScore } from '@/lib/types'
import { awardAppImplemented } from '@/lib/skillTracker'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate } from '@/lib/utils'

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const STATUSES: AppStatus[] = ['idea','planning','in_progress','implemented','dropped']
const CATEGORIES = ['Finance','Operations','Marketing','Strategy','Leadership','Sales','Entrepreneurship','Other']
const IMPACTS: ImpactLevel[] = ['low','medium','high']

const EMPTY_APP: Omit<CoffeeApplication, 'id'|'createdAt'|'updatedAt'> = {
  title: '', description: '', category: 'Operations', status: 'idea',
  impact: 'medium', expectedOutcome: '', actualOutcome: '',
}

const IMPACT_COLORS: Record<ImpactLevel, { bg: string; color: string; label: string }> = {
  low:    { bg: '#F5F5F4', color: '#78716C', label: 'Low Impact' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Medium Impact' },
  high:   { bg: '#F0FDF4', color: '#15803D', label: 'High Impact' },
}

const STATUS_ORDER: Record<AppStatus, number> = { idea: 0, planning: 1, in_progress: 2, implemented: 3, dropped: 4 }

export default function ApplicationsPage() {
  const [apps, setApps] = useFirestore<CoffeeApplication[]>(STORAGE_KEYS.APPLICATIONS, [])
  const [courses] = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<CoffeeApplication | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || a.status === filterStatus
      const matchCat = filterCategory === 'all' || a.category === filterCategory
      return matchSearch && matchStatus && matchCat
    })
  }, [apps, search, filterStatus, filterCategory])

  const byStatus = useMemo(() => {
    const map: Record<AppStatus, CoffeeApplication[]> = { idea: [], planning: [], in_progress: [], implemented: [], dropped: [] }
    filtered.forEach(a => map[a.status].push(a))
    return map
  }, [filtered])

  const stats = useMemo(() => ({
    total: apps.length,
    implemented: apps.filter(a => a.status === 'implemented').length,
    inProgress: apps.filter(a => a.status === 'in_progress').length,
    high: apps.filter(a => a.impact === 'high').length,
  }), [apps])

  const openAdd = () => { setEditingApp(null); setModalOpen(true) }
  const openEdit = (app: CoffeeApplication) => { setEditingApp(app); setModalOpen(true) }

  const handleSave = (data: Omit<CoffeeApplication, 'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    if (editingApp) {
      const wasImplemented = editingApp.status === 'implemented'
      setApps(prev => prev.map(a => a.id === editingApp.id ? { ...a, ...data, updatedAt: now } : a))
      toast.success('Application updated')
      if (data.status === 'implemented' && !wasImplemented) {
        const updated = awardAppImplemented(skills, editingApp.id, data.title, data.category)
        if (updated) { setSkills(updated); toast.success(`+8 ${data.category} skill points — CP implementation logged`) }
      }
    } else {
      const appId = generateId()
      setApps(prev => [...prev, { ...data, id: appId, createdAt: now, updatedAt: now }])
      toast.success('Application logged')
      if (data.status === 'implemented') {
        const updated = awardAppImplemented(skills, appId, data.title, data.category)
        if (updated) { setSkills(updated); toast.success(`+8 ${data.category} skill points — CP implementation logged`) }
      }
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this application?')) { setApps(prev => prev.filter(a => a.id !== id)); toast.success('Application deleted') }
  }

  const updateStatus = (id: string, status: AppStatus) => {
    setApps(prev => prev.map(a => a.id !== id ? a : { ...a, status, updatedAt: new Date().toISOString() }))
    if (status === 'implemented') {
      const app = apps.find(a => a.id === id)
      if (app) {
        const updated = awardAppImplemented(skills, id, app.title, app.category)
        if (updated) { setSkills(updated); toast.success(`+8 ${app.category} skill points — application implemented!`) }
      }
    }
  }

  return (
    <div style={PAGE_STYLE}>
      <PageHeader
        title="CoffeePlace Applications"
        description="Every MBA lesson applied to building CoffeePlace — tracked from idea to implementation"
        action={<Button onClick={openAdd}><Plus size={14} /> Log Application</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total, sub: 'all applications' },
          { label: 'Implemented', value: stats.implemented, sub: 'live at CoffeePlace' },
          { label: 'In Progress', value: stats.inProgress, sub: 'being worked on' },
          { label: 'High Impact', value: stats.high, sub: 'major initiatives' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <Input placeholder="Search applications…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AppStatus | 'all')}
          options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))]}
          style={{ width: 150 }} />
        <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          style={{ width: 160 }} />
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['kanban', 'list'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '6px 12px', fontSize: 12, background: viewMode === mode ? 'var(--primary)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--muted-foreground)',
              border: 'none', cursor: 'pointer', textTransform: 'capitalize',
            }}>{mode}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {apps.length === 0 ? (
        <EmptyState
          icon={<Coffee size={22} />}
          title="No applications yet"
          description="Start logging how you're applying MBA concepts to CoffeePlace"
          action={<Button onClick={openAdd}><Plus size={14} /> Log Application</Button>}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanView byStatus={byStatus} courses={courses} onEdit={openEdit} onDelete={handleDelete} onStatusChange={updateStatus} />
      ) : (
        <ListView apps={filtered} courses={courses} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingApp ? 'Edit Application' : 'Log CoffeePlace Application'} width={580}>
        <AppForm initial={editingApp || EMPTY_APP} courses={courses} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

// ─── Kanban View ──────────────────────────────────────────────────────────────

const KANBAN_COLS: { status: AppStatus; label: string }[] = [
  { status: 'idea', label: '💡 Ideas' },
  { status: 'planning', label: '📋 Planning' },
  { status: 'in_progress', label: '🔧 In Progress' },
  { status: 'implemented', label: '✅ Implemented' },
]

function KanbanView({ byStatus, courses, onEdit, onDelete, onStatusChange }: {
  byStatus: Record<AppStatus, CoffeeApplication[]>
  courses: Course[]
  onEdit: (a: CoffeeApplication) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, s: AppStatus) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {KANBAN_COLS.map(col => (
        <div key={col.status} style={{ background: 'var(--secondary)', borderRadius: 10, padding: '12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{col.label}</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'var(--card)', padding: '1px 6px', borderRadius: 10 }}>
              {byStatus[col.status].length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {byStatus[col.status].map(app => (
              <AppCard key={app.id} app={app} courses={courses} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AppCard({ app, courses, onEdit, onDelete, onStatusChange }: {
  app: CoffeeApplication
  courses: Course[]
  onEdit: (a: CoffeeApplication) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, s: AppStatus) => void
}) {
  const impact = IMPACT_COLORS[app.impact]
  const linkedCourse = courses.find(c => c.id === app.courseId)
  const nextStatus = STATUSES[STATUSES.indexOf(app.status) + 1]

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, flex: 1 }}>{app.title}</span>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button onClick={() => onEdit(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--muted-foreground)' }}>
            <Edit3 size={11} />
          </button>
          <button onClick={() => onDelete(app.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#DC2626' }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginBottom: 8, lineHeight: 1.4 }}>
        {app.description.slice(0, 80)}{app.description.length > 80 ? '…' : ''}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: nextStatus ? 8 : 0 }}>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{app.category}</span>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: impact.bg, color: impact.color }}>{impact.label}</span>
      </div>

      {linkedCourse && (
        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 6 }}>📚 {linkedCourse.name.slice(0, 30)}</div>
      )}

      {nextStatus && (
        <button onClick={() => onStatusChange(app.id, nextStatus)} style={{
          width: '100%', padding: '5px 0', fontSize: 10.5, fontWeight: 500,
          background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 5,
          cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
        }}>
          Move to {nextStatus.replace(/_/g,' ')} <ArrowRight size={10} />
        </button>
      )}
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ apps, courses, onEdit, onDelete }: {
  apps: CoffeeApplication[]
  courses: Course[]
  onEdit: (a: CoffeeApplication) => void
  onDelete: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {apps.map(app => {
        const impact = IMPACT_COLORS[app.impact]
        const linkedCourse = courses.find(c => c.id === app.courseId)
        return (
          <div key={app.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{app.title}</span>
                  <StatusBadge status={app.status} />
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: impact.bg, color: impact.color }}>{impact.label}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{app.description}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted-foreground)' }}>
                  <span>📂 {app.category}</span>
                  {linkedCourse && <span>📚 {linkedCourse.name.slice(0, 30)}</span>}
                  <span>🕒 {formatDate(app.updatedAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => onEdit(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted-foreground)' }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => onDelete(app.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#DC2626' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── App Form ─────────────────────────────────────────────────────────────────

function AppForm({ initial, courses, onSave, onCancel }: {
  initial: Omit<CoffeeApplication, 'id'|'createdAt'|'updatedAt'> | CoffeeApplication
  courses: Course[]
  onSave: (d: Omit<CoffeeApplication, 'id'|'createdAt'|'updatedAt'>) => void
  onCancel: () => void
}) {
  const [data, setData] = useState({ ...initial })
  const set = (k: string, v: unknown) => setData(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.title.trim()) return
    onSave(data as Omit<CoffeeApplication, 'id'|'createdAt'|'updatedAt'>)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Title" required>
        <Input value={data.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Build monthly P&L dashboard" required />
      </FormField>
      <FormField label="Description">
        <Textarea value={data.description} onChange={e => set('description', e.target.value)}
          placeholder="What exactly will you implement? How does it apply to CoffeePlace?…" rows={3} />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
        <FormField label="Category">
          <Select value={data.category} onChange={e => set('category', e.target.value)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))} />
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={e => set('status', e.target.value)}
            options={['idea','planning','in_progress','implemented','dropped'].map(s => ({ value: s, label: s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()) }))} />
        </FormField>
        <FormField label="Impact">
          <Select value={data.impact} onChange={e => set('impact', e.target.value as ImpactLevel)}
            options={IMPACTS.map(i => ({ value: i, label: i.charAt(0).toUpperCase() + i.slice(1) }))} />
        </FormField>
      </div>
      {courses.length > 0 && (
        <FormField label="Source Course (optional)">
          <Select value={data.courseId || ''} onChange={e => set('courseId', e.target.value || undefined)}
            options={[{ value: '', label: '— None —' }, ...courses.map(c => ({ value: c.id, label: c.name }))]} />
        </FormField>
      )}
      <FormField label="Expected Outcome">
        <Textarea value={data.expectedOutcome} onChange={e => set('expectedOutcome', e.target.value)}
          placeholder="What result do you expect from implementing this?" rows={2} />
      </FormField>
      {data.status === 'implemented' && (
        <FormField label="Actual Outcome">
          <Textarea value={data.actualOutcome || ''} onChange={e => set('actualOutcome', e.target.value)}
            placeholder="What actually happened? How did it compare to expectations?" rows={2} />
        </FormField>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{('id' in initial) ? 'Save Changes' : 'Log Application'}</Button>
      </div>
    </form>
  )
}
