'use client'
import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Edit3, Coffee, Target, BookOpen, Save, X, Plus, Trash2 } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_MBA_MONTHS } from '@/lib/seed-data'
import { MBAMonth, ChecklistItem, Assignment } from '@/lib/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Textarea, Input, FormField } from '@/components/ui/Input'
import { generateId, formatDate } from '@/lib/utils'

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 900, margin: '0 auto' }

export default function RoadmapPage() {
  const [months, setMonths] = useFirestore<MBAMonth[]>(STORAGE_KEYS.MBA_MONTHS, SEED_MBA_MONTHS)
  const [expandedId, setExpandedId] = useState<string | null>('month-1')
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const toggleChecklist = useCallback((monthId: string, itemId: string) => {
    setMonths(prev => prev.map(m => m.id !== monthId ? m : {
      ...m,
      checklist: m.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c),
      updatedAt: new Date().toISOString(),
    }))
  }, [setMonths])

  const saveMonth = useCallback((updated: MBAMonth) => {
    setMonths(prev => prev.map(m => m.id === updated.id ? updated : m))
    setEditingId(null)
  }, [setMonths])

  const totalItems = months.reduce((sum, m) => sum + m.checklist.length, 0)
  const completedItems = months.reduce((sum, m) => sum + m.checklist.filter(c => c.completed).length, 0)
  const overallPct = totalItems > 0 ? Math.round(completedItems / totalItems * 100) : 0

  return (
    <div style={PAGE_STYLE}>
      <PageHeader
        title="6-Month MBA Roadmap"
        description="Your structured journey from founder to CEO — one month at a time"
        badge={`${overallPct}% Complete`}
      />

      {/* Overall Progress */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '18px 22px', marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Overall MBA Progress</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{completedItems} / {totalItems} items</span>
        </div>
        <ProgressBar value={overallPct} height={8} showLabel />
      </div>

      {/* Month Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {months.map(month => {
          const pct = month.checklist.length > 0
            ? Math.round(month.checklist.filter(c => c.completed).length / month.checklist.length * 100) : 0
          const isExpanded = expandedId === month.id
          const isEditing = editingId === month.id

          return (
            <div key={month.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              {/* Month Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', cursor: 'pointer',
                  background: isExpanded ? 'var(--secondary)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onClick={() => toggleExpand(month.id)}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: pct === 100 ? 'var(--accent)' : (isExpanded ? '#1C1917' : 'var(--secondary)'),
                  color: pct === 100 || isExpanded ? 'white' : 'var(--muted-foreground)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700,
                }}>
                  {month.monthNumber}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    Month {month.monthNumber}: {month.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, maxWidth: 280 }}>
                      <ProgressBar value={pct} height={5} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                      {month.checklist.filter(c => c.completed).length}/{month.checklist.length} done
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setEditingId(month.id); setExpandedId(month.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted-foreground)' }}
                  >
                    <Edit3 size={14} />
                  </button>
                  {isExpanded ? <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px' }}>
                  {isEditing ? (
                    <MonthEditor month={month} onSave={saveMonth} onCancel={() => setEditingId(null)} />
                  ) : (
                    <MonthDetail month={month} onToggleChecklist={(itemId) => toggleChecklist(month.id, itemId)} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Month Detail (read) ──────────────────────────────────────────────────────

function MonthDetail({ month, onToggleChecklist }: { month: MBAMonth; onToggleChecklist: (id: string) => void }) {
  return (
    <div style={{ paddingTop: 16 }}>
      {/* Focus */}
      <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--secondary)', borderRadius: 8, fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
        🎯 {month.focus}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Goals */}
        <Section icon={<Target size={13} />} title="Goals">
          {month.goals.map((g, i) => (
            <div key={i} style={{ fontSize: 13, padding: '4px 0', color: 'var(--foreground)', display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--accent)', marginTop: 3 }}>•</span> {g}
            </div>
          ))}
        </Section>

        {/* Topics */}
        <Section icon={<BookOpen size={13} />} title="Topics">
          {month.topics.map((t, i) => (
            <div key={i}>
              <div style={{ fontSize: 13, fontWeight: 500, padding: '3px 0' }}>{t}</div>
              {month.subtopics[t] && (
                <div style={{ paddingLeft: 10, marginBottom: 4 }}>
                  {month.subtopics[t].map((s, j) => (
                    <div key={j} style={{ fontSize: 11.5, color: 'var(--muted-foreground)', padding: '1px 0' }}>— {s}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      </div>

      {/* CoffeePlace Implementation */}
      <div style={{ marginBottom: 20, padding: '14px 16px', background: '#FEF3C7', borderRadius: 8, border: '1px solid #FDE68A' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <Coffee size={13} style={{ color: 'var(--accent)', marginTop: 2 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CoffeePlace Implementation</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>{month.coffeeImplementation}</p>
      </div>

      {/* Assignments */}
      {month.assignments.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Assignments</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {month.assignments.map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'var(--secondary)', borderRadius: 8, gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 2 }}>{a.description}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      <div>
        <SectionTitle>Completion Checklist</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {month.checklist.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                background: item.completed ? '#F0FDF4' : 'var(--secondary)',
                border: `1px solid ${item.completed ? '#BBF7D0' : 'transparent'}`,
                transition: 'all 0.12s',
              }}
              onClick={() => onToggleChecklist(item.id)}
            >
              {item.completed
                ? <CheckCircle2 size={15} style={{ color: '#15803D', flexShrink: 0 }} />
                : <Circle size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              }
              <span style={{
                fontSize: 13,
                color: item.completed ? '#15803D' : 'var(--foreground)',
                textDecoration: item.completed ? 'line-through' : 'none',
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Month Editor ─────────────────────────────────────────────────────────────

function MonthEditor({ month, onSave, onCancel }: { month: MBAMonth; onSave: (m: MBAMonth) => void; onCancel: () => void }) {
  const [data, setData] = useState<MBAMonth>({ ...month, goals: [...month.goals], topics: [...month.topics] })
  const [newGoal, setNewGoal] = useState('')
  const [newCheckItem, setNewCheckItem] = useState('')

  const update = (key: keyof MBAMonth, value: unknown) =>
    setData(prev => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }))

  const addGoal = () => { if (newGoal.trim()) { update('goals', [...data.goals, newGoal.trim()]); setNewGoal('') } }
  const removeGoal = (i: number) => update('goals', data.goals.filter((_, idx) => idx !== i))
  const addCheckItem = () => {
    if (newCheckItem.trim()) {
      update('checklist', [...data.checklist, { id: generateId(), label: newCheckItem.trim(), completed: false }])
      setNewCheckItem('')
    }
  }
  const removeCheckItem = (id: string) => update('checklist', data.checklist.filter(c => c.id !== id))

  return (
    <div style={{ paddingTop: 16 }}>
      <FormField label="Focus / Theme">
        <Textarea value={data.focus} onChange={e => update('focus', e.target.value)} rows={2} />
      </FormField>

      <FormField label="Goals">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {data.goals.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <Input value={g} onChange={e => {
                const goals = [...data.goals]; goals[i] = e.target.value; update('goals', goals)
              }} />
              <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0 4px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Input placeholder="Add a goal…" value={newGoal} onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()} />
          <Button variant="secondary" size="sm" onClick={addGoal}><Plus size={13} /></Button>
        </div>
      </FormField>

      <FormField label="CoffeePlace Implementation">
        <Textarea value={data.coffeeImplementation} onChange={e => update('coffeeImplementation', e.target.value)} rows={3} />
      </FormField>

      <FormField label="Checklist Items">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
          {data.checklist.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Input value={item.label} onChange={e => {
                update('checklist', data.checklist.map(c => c.id === item.id ? { ...c, label: e.target.value } : c))
              }} />
              <button onClick={() => removeCheckItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0 4px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Input placeholder="Add checklist item…" value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCheckItem()} />
          <Button variant="secondary" size="sm" onClick={addCheckItem}><Plus size={13} /></Button>
        </div>
      </FormField>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Button>
        <Button onClick={() => onSave(data)}><Save size={14} /> Save Changes</Button>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 10 }}>{children}</div>
}
