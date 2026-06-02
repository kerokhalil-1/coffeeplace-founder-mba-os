'use client'
import { useState, useMemo } from 'react'
import { Plus, ClipboardList, Edit3, Trash2, Search, CheckCircle2, Star } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { STORAGE_KEYS } from '@/lib/storage'
import { Assignment, AssignmentStatus, CourseCategory, ALL_MBA_CATEGORIES, SkillScore } from '@/lib/types'
import { awardAssignmentGrade } from '@/lib/skillTracker'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }
const STATUSES: AssignmentStatus[] = ['pending','in_progress','submitted','graded']

const STATUS_COLORS: Record<AssignmentStatus, { bg: string; color: string }> = {
  pending:     { bg: '#F5F5F4', color: '#78716C' },
  in_progress: { bg: '#EFF6FF', color: '#1D4ED8' },
  submitted:   { bg: '#FEF3C7', color: '#92400E' },
  graded:      { bg: '#F0FDF4', color: '#15803D' },
}

const EMPTY: Omit<Assignment, 'id'|'createdAt'|'updatedAt'> = {
  title: '', topicName: '', categoryId: 'Finance', category: 'Finance',
  description: '', status: 'pending', maxScore: 100,
  notes: '', coffeeImplementation: '',
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useFirestore<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<CourseCategory | 'all'>('all')

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const ms = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
      const mst = filterStatus === 'all' || a.status === filterStatus
      const mc = filterCategory === 'all' || a.category === filterCategory
      return ms && mst && mc
    }).sort((a, b) => {
      const statusOrder = { graded: 4, submitted: 3, in_progress: 2, pending: 1 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
  }, [assignments, search, filterStatus, filterCategory])

  const stats = useMemo(() => ({
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    avgScore: (() => {
      const graded = assignments.filter(a => a.score != null && a.status === 'graded')
      return graded.length ? Math.round(graded.reduce((s, a) => s + (a.score ?? 0), 0) / graded.length) : null
    })(),
  }), [assignments])

  const handleSave = (data: Omit<Assignment, 'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    let assignmentId: string
    if (editing) {
      assignmentId = editing.id
      const wasGraded = editing.status === 'graded'
      setAssignments(prev => prev.map(a => a.id === editing.id ? { ...a, ...data, updatedAt: now } : a))
      toast.success('Assignment updated')
      // Award if graded with a score (duplicate prevention handles repeat saves)
      if (data.status === 'graded' && data.score != null && !wasGraded) {
        const updated = awardAssignmentGrade(skills, assignmentId, data.title, data.category, data.score, data.maxScore)
        if (updated) { setSkills(updated); const pct = data.score != null ? Math.round((data.score/data.maxScore)*100) : 0; toast.success(`+${pct >= 90 ? 10 : pct >= 75 ? 8 : 5} ${data.category} skill points earned`) }
      }
    } else {
      assignmentId = generateId()
      setAssignments(prev => [...prev, { ...data, id: assignmentId, createdAt: now, updatedAt: now }])
      toast.success('Assignment created')
      // Award immediately if created as graded with a score
      if (data.status === 'graded' && data.score != null) {
        const updated = awardAssignmentGrade(skills, assignmentId, data.title, data.category, data.score, data.maxScore)
        if (updated) { setSkills(updated); const pct = data.score != null ? Math.round((data.score/data.maxScore)*100) : 0; toast.success(`+${pct >= 90 ? 10 : pct >= 75 ? 8 : 5} ${data.category} skill points earned`) }
      }
    }
    setModalOpen(false); setEditing(null)
  }

  const handleStatusChange = (id: string, newStatus: AssignmentStatus) => {
    const now = new Date().toISOString()
    setAssignments(prev => prev.map(x => x.id !== id ? x : { ...x, status: newStatus, updatedAt: now }))
    // Award when advancing to graded (if assignment already has a score set)
    if (newStatus === 'graded') {
      const assignment = assignments.find(x => x.id === id)
      if (assignment && assignment.score != null) {
        const updated = awardAssignmentGrade(skills, id, assignment.title, assignment.category, assignment.score, assignment.maxScore)
        if (updated) { setSkills(updated); toast.success(`Assignment graded · ${assignment.category} skill points earned`) }
      }
    }
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="Assignments"
        description="Every MBA concept tested through real CoffeePlace implementation tasks"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={14} /> New Assignment</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Graded', value: stats.graded },
          { label: 'Avg Score', value: stats.avgScore != null ? `${stats.avgScore}%` : '—' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <Input placeholder="Search assignments…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AssignmentStatus | 'all')}
          options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }))]}
          style={{ width: 160 }} />
        <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value as CourseCategory | 'all')}
          options={[{ value: 'all', label: 'All Categories' }, ...ALL_MBA_CATEGORIES.filter(c=>c!=='Other').map(c => ({ value: c, label: c }))]}
          style={{ width: 180 }} />
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={<ClipboardList size={22} />} title="No assignments yet"
          description="Create assignments for each MBA topic to test your understanding through CoffeePlace implementation"
          action={<Button onClick={() => setModalOpen(true)}><Plus size={14}/> Create First Assignment</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={18} />} title="No matches" description="Try adjusting your filters" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => (
            <AssignmentRow key={a.id} assignment={a}
              onEdit={() => { setEditing(a); setModalOpen(true) }}
              onDelete={() => { if (confirm('Delete?')) { setAssignments(prev => prev.filter(x => x.id !== a.id)); toast.success('Assignment deleted') } }}
              onStatusChange={(s) => handleStatusChange(a.id, s)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Assignment' : 'New Assignment'} width={600}>
        <AssignmentForm initial={editing || EMPTY} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} />
      </Modal>
    </div>
  )
}

function AssignmentRow({ assignment: a, onEdit, onDelete, onStatusChange }: {
  assignment: Assignment; onEdit: () => void; onDelete: () => void
  onStatusChange: (s: AssignmentStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const sc = STATUS_COLORS[a.status]
  const nextStatus = STATUSES[STATUSES.indexOf(a.status) + 1]
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</span>
            <span style={{ fontSize: 11, background: 'var(--secondary)', padding: '2px 7px', borderRadius: 4, color: 'var(--muted-foreground)' }}>{a.category}</span>
            {a.topicName && <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>· {a.topicName}</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            {a.dueDate && `Due: ${formatDate(a.dueDate)} · `}
            Max: {a.maxScore} pts
            {a.score != null && ` · Score: ${a.score}/${a.maxScore} (${Math.round(a.score/a.maxScore*100)}%)`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 500 }}>
            {a.status.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
          </span>
          {nextStatus && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(nextStatus) }}
              style={{ fontSize: 11, padding: '3px 8px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--muted-foreground)' }}>
              → {nextStatus.replace(/_/g,' ')}
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2 }}><Edit3 size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}><Trash2 size={13} /></button>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--secondary)' }}>
          {a.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6 }}>{a.description}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {a.coffeeImplementation && (
              <div style={{ padding: '10px 12px', background: '#FEF3C7', borderRadius: 8, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>☕ CoffeePlace Implementation</div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#78350F', lineHeight: 1.5 }}>{a.coffeeImplementation}</p>
              </div>
            )}
            {a.notes && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Notes</div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{a.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AssignmentForm({ initial, onSave, onCancel }: {
  initial: Omit<Assignment,'id'|'createdAt'|'updatedAt'> | Assignment
  onSave: (d: Omit<Assignment,'id'|'createdAt'|'updatedAt'>) => void
  onCancel: () => void
}) {
  const [d, setD] = useState({ ...initial })
  const set = (k: string, v: unknown) => setD(p => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); if (d.title) onSave(d as Omit<Assignment,'id'|'createdAt'|'updatedAt'>) }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Assignment Title" required>
            <Input value={d.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Build CoffeePlace Break-even Model" required />
          </FormField>
        </div>
        <FormField label="Category">
          <Select value={d.category} onChange={e => set('category', e.target.value)}
            options={ALL_MBA_CATEGORIES.filter(c=>c!=='Other').map(c => ({ value: c, label: c }))} />
        </FormField>
        <FormField label="Topic (optional)">
          <Input value={d.topicName || ''} onChange={e => set('topicName', e.target.value)} placeholder="e.g. Break-even Analysis" />
        </FormField>
        <FormField label="Status">
          <Select value={d.status} onChange={e => set('status', e.target.value)}
            options={STATUSES.map(s => ({ value: s, label: s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }))} />
        </FormField>
        <FormField label="Due Date">
          <Input type="date" value={d.dueDate || ''} onChange={e => set('dueDate', e.target.value)} />
        </FormField>
        <FormField label={`Max Score: ${d.maxScore}`}>
          <input type="range" min={10} max={100} step={5} value={d.maxScore} onChange={e => set('maxScore', Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </FormField>
        {d.status === 'graded' && (
          <FormField label={`Score: ${d.score ?? 0}/${d.maxScore}`}>
            <input type="range" min={0} max={d.maxScore} value={d.score ?? 0} onChange={e => set('score', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#15803D' }} />
          </FormField>
        )}
      </div>
      <FormField label="Description">
        <Textarea value={d.description} onChange={e => set('description', e.target.value)} rows={3}
          placeholder="What needs to be done? What will you produce?" />
      </FormField>
      <FormField label="CoffeePlace Implementation">
        <Textarea value={d.coffeeImplementation} onChange={e => set('coffeeImplementation', e.target.value)} rows={2}
          placeholder="How does completing this assignment improve CoffeePlace?" />
      </FormField>
      <FormField label="Notes">
        <Textarea value={d.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Resources, references, approach…" />
      </FormField>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{('id' in initial) ? 'Save Changes' : 'Create Assignment'}</Button>
      </div>
    </form>
  )
}
