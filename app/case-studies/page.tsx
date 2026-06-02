'use client'
import { useState, useMemo } from 'react'
import { Plus, BookOpen, Edit3, Trash2, Search, ChevronDown, ChevronRight, Coffee } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_CASE_STUDIES } from '@/lib/seed-case-studies'
import { CaseStudy, CourseCategory, ALL_MBA_CATEGORIES } from '@/lib/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const EMPTY: Omit<CaseStudy,'id'|'createdAt'|'updatedAt'> = {
  company: '', industry: 'Specialty Coffee', category: 'Strategy',
  summary: '', keyLessons: [''], strengths: [''], weaknesses: [''], coffeeApplications: [''],
  isSeeded: false,
}

export default function CaseStudiesPage() {
  const [cases, setCases] = useFirestore<CaseStudy[]>(STORAGE_KEYS.CASE_STUDIES, SEED_CASE_STUDIES)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<CourseCategory | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CaseStudy | null>(null)

  const filtered = useMemo(() =>
    cases.filter(c => {
      const ms = !search || c.company.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase())
      const mc = filterCategory === 'all' || c.category === filterCategory
      return ms && mc
    }), [cases, search, filterCategory])

  const handleSave = (data: Omit<CaseStudy,'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    if (editing) {
      setCases(prev => prev.map(c => c.id === editing.id ? { ...c, ...data, updatedAt: now } : c))
    } else {
      setCases(prev => [...prev, { ...data, id: generateId(), createdAt: now, updatedAt: now }])
    }
    setModalOpen(false); setEditing(null)
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="Case Study Library"
        description="Learn from the best — and connect every lesson to CoffeePlace"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={14} /> Add Case Study</Button>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <Input placeholder="Search companies, lessons…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value as CourseCategory | 'all')}
          options={[{ value: 'all', label: 'All Categories' }, ...ALL_MBA_CATEGORIES.filter(c=>c!=='Other').map(c=>({ value: c, label: c }))]}
          style={{ width: 180 }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpen size={22} />} title="No case studies" description="Add your first case study" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(cs => (
            <CaseCard key={cs.id} cs={cs}
              isExpanded={expanded === cs.id}
              onToggle={() => setExpanded(expanded === cs.id ? null : cs.id)}
              onEdit={() => { setEditing(cs); setModalOpen(true) }}
              onDelete={() => { if (confirm('Delete?')) setCases(prev => prev.filter(c => c.id !== cs.id)) }}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Case Study' : 'Add Case Study'} width={640}>
        <CaseForm initial={editing || EMPTY} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} />
      </Modal>
    </div>
  )
}

function CaseCard({ cs, isExpanded, onToggle, onEdit, onDelete }: {
  cs: CaseStudy; isExpanded: boolean
  onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', cursor: 'pointer',
        background: isExpanded ? 'var(--secondary)' : 'transparent' }} onClick={onToggle}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {cs.company.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{cs.company}</span>
            <span style={{ fontSize: 11, background: 'var(--secondary)', padding: '2px 7px', borderRadius: 4, color: 'var(--muted-foreground)' }}>{cs.category}</span>
            {cs.founded && <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Est. {cs.founded}</span>}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
            {cs.summary.slice(0, 160)}{cs.summary.length > 160 ? '…' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2 }}><Edit3 size={13} /></button>
          {!cs.isSeeded && <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}><Trash2 size={13} /></button>}
          {isExpanded ? <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={15} style={{ color: 'var(--muted-foreground)' }} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 16, paddingTop: 16 }}>
            <SectionLabel>Full Summary</SectionLabel>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--foreground)', lineHeight: 1.7 }}>{cs.summary}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <BulletSection title="✅ Strengths" items={cs.strengths} color="#15803D" />
            <BulletSection title="⚠️ Weaknesses" items={cs.weaknesses} color="#DC2626" />
            <div style={{ gridColumn: '1/-1' }}>
              <BulletSection title="🔑 Key Lessons" items={cs.keyLessons} color="#1D4ED8" />
            </div>
          </div>
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', gap: 6 }}>
              <Coffee size={12} style={{ marginTop: 1 }} /> CoffeePlace Applications
            </div>
            {cs.coffeeApplications.map((a, i) => (
              <div key={i} style={{ fontSize: 13, color: '#78350F', padding: '3px 0', display: 'flex', gap: 6 }}>
                <span>→</span> {a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BulletSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {items.filter(Boolean).map((item, i) => (
        <div key={i} style={{ fontSize: 12.5, padding: '3px 0', display: 'flex', gap: 6 }}>
          <span style={{ color, flexShrink: 0 }}>•</span> {item}
        </div>
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 8 }}>{children}</div>
}

function CaseForm({ initial, onSave, onCancel }: {
  initial: Omit<CaseStudy,'id'|'createdAt'|'updatedAt'> | CaseStudy
  onSave: (d: Omit<CaseStudy,'id'|'createdAt'|'updatedAt'>) => void
  onCancel: () => void
}) {
  const [d, setD] = useState({ ...initial })
  const set = (k: string, v: unknown) => setD(p => ({ ...p, [k]: v }))
  const setList = (k: keyof typeof d, i: number, v: string) => {
    const arr = [...(d[k] as string[])]; arr[i] = v; set(k, arr)
  }
  const addItem = (k: keyof typeof d) => set(k, [...(d[k] as string[]), ''])
  const removeItem = (k: keyof typeof d, i: number) => set(k, (d[k] as string[]).filter((_,idx)=>idx!==i))

  const ListEditor = ({ field, label }: { field: keyof typeof d; label: string }) => (
    <FormField label={label}>
      {(d[field] as string[]).map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
          <Input value={item} onChange={e => setList(field, i, e.target.value)} />
          {(d[field] as string[]).length > 1 && (
            <button type="button" onClick={() => removeItem(field, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>×</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addItem(field)} style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'none', border: '1px dashed var(--border)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>+ Add</button>
    </FormField>
  )

  return (
    <form onSubmit={e => { e.preventDefault(); if (d.company) onSave(d as Omit<CaseStudy,'id'|'createdAt'|'updatedAt'>) }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Company Name" required>
            <Input value={d.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Starbucks" required />
          </FormField>
        </div>
        <FormField label="Industry"><Input value={d.industry} onChange={e => set('industry', e.target.value)} /></FormField>
        <FormField label="Category">
          <Select value={d.category} onChange={e => set('category', e.target.value)}
            options={ALL_MBA_CATEGORIES.filter(c=>c!=='Other').map(c=>({ value: c, label: c }))} />
        </FormField>
        <FormField label="Founded"><Input value={d.founded||''} onChange={e => set('founded', e.target.value)} placeholder="Year" /></FormField>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Summary">
            <Textarea value={d.summary} onChange={e => set('summary', e.target.value)} rows={4} placeholder="Company overview and strategic narrative…" />
          </FormField>
        </div>
      </div>
      <ListEditor field="keyLessons" label="Key Lessons" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <ListEditor field="strengths" label="Strengths" />
        <ListEditor field="weaknesses" label="Weaknesses" />
      </div>
      <ListEditor field="coffeeApplications" label="CoffeePlace Applications" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{('id' in initial) ? 'Save Changes' : 'Add Case Study'}</Button>
      </div>
    </form>
  )
}
