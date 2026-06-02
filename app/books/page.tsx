'use client'
import { useState, useMemo } from 'react'
import { Plus, BookOpen, Edit3, Trash2, Search, Star } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_BOOKS } from '@/lib/seed-books'
import { Book, CourseCategory, ALL_MBA_CATEGORIES, SkillScore } from '@/lib/types'
import { awardBookCompletion } from '@/lib/skillTracker'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const STATUS_MAP = {
  want_to_read: { label: 'Want to Read', bg: '#F5F5F4', color: '#78716C' },
  reading:      { label: 'Reading', bg: '#EFF6FF', color: '#1D4ED8' },
  completed:    { label: 'Completed', bg: '#F0FDF4', color: '#15803D' },
  dropped:      { label: 'Dropped', bg: '#FEF2F2', color: '#DC2626' },
}

const EMPTY: Omit<Book,'id'|'createdAt'|'updatedAt'> = {
  name: '', author: '', category: 'Strategy', progress: 0, status: 'want_to_read',
  summary: '', notes: '', actionItems: [''], coffeeApplications: [''], rating: 0,
}

export default function BooksPage() {
  const [books, setBooks] = useFirestore<Book[]>(STORAGE_KEYS.BOOKS, SEED_BOOKS)
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Book['status'] | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [activeBook, setActiveBook] = useState<string | null>(null)

  const filtered = useMemo(() => books.filter(b => {
    const ms = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
    const mst = filterStatus === 'all' || b.status === filterStatus
    return ms && mst
  }), [books, search, filterStatus])

  const stats = useMemo(() => ({
    total: books.length,
    completed: books.filter(b => b.status === 'completed').length,
    reading: books.filter(b => b.status === 'reading').length,
    wantToRead: books.filter(b => b.status === 'want_to_read').length,
  }), [books])

  const handleSave = (data: Omit<Book,'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    if (editing) {
      const wasCompleted = editing.status === 'completed'
      setBooks(prev => prev.map(b => b.id === editing.id ? { ...b, ...data, updatedAt: now } : b))
      toast.success('Book updated')
      if (data.status === 'completed' && !wasCompleted) {
        const updated = awardBookCompletion(skills, editing.id, data.name, data.category)
        if (updated) { setSkills(updated); toast.success(`+6 ${data.category} skill points earned`) }
      }
    } else {
      const bookId = generateId()
      setBooks(prev => [...prev, { ...data, id: bookId, createdAt: now, updatedAt: now }])
      toast.success('Book added')
      if (data.status === 'completed') {
        const updated = awardBookCompletion(skills, bookId, data.name, data.category)
        if (updated) { setSkills(updated); toast.success(`+6 ${data.category} skill points earned`) }
      }
    }
    setModalOpen(false); setEditing(null)
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="Reading System"
        description="Track every book, extract the insights, and apply them to CoffeePlace"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={14} /> Add Book</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total }, { label: 'Completed', value: stats.completed },
          { label: 'Reading', value: stats.reading }, { label: 'Want to Read', value: stats.wantToRead },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <Input placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['all','want_to_read','reading','completed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '7px 12px', fontSize: 12, background: filterStatus === s ? 'var(--primary)' : 'transparent',
              color: filterStatus === s ? 'white' : 'var(--muted-foreground)',
              border: 'none', cursor: 'pointer', textTransform: 'capitalize',
            }}>{s === 'want_to_read' ? 'Wishlist' : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g,' ')}</button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map(book => {
          const st = STATUS_MAP[book.status]
          return (
            <div key={book.id}
              onClick={() => setActiveBook(activeBook === book.id ? null : book.id)}
              style={{ background: 'var(--card)', border: `1px solid ${activeBook === book.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.12s' }}>
              {/* Book header */}
              <div style={{ padding: '16px 18px', borderBottom: activeBook === book.id ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{book.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{book.author}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <button onClick={e => { e.stopPropagation(); setEditing(book); setModalOpen(true) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2 }}><Edit3 size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) { setBooks(prev => prev.filter(b => b.id !== book.id)); toast.success('Book deleted') } }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}><Trash2 size={12} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{book.category}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
                </div>

                <ProgressBar value={book.progress} height={4} />
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4 }}>{book.progress}% complete</div>

                {book.rating > 0 && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={12} style={{ color: i <= book.rating ? '#F59E0B' : 'var(--border)', fill: i <= book.rating ? '#F59E0B' : 'transparent' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {activeBook === book.id && (
                <div style={{ padding: '14px 18px', background: 'var(--secondary)' }}>
                  {book.summary && (
                    <div style={{ marginBottom: 12 }}>
                      <Label>Summary</Label>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{book.summary}</p>
                    </div>
                  )}
                  {book.actionItems.filter(Boolean).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <Label>Action Items</Label>
                      {book.actionItems.filter(Boolean).map((a,i) => <div key={i} style={{ fontSize: 12, padding: '2px 0', display:'flex', gap:5 }}><span>→</span>{a}</div>)}
                    </div>
                  )}
                  {book.coffeeApplications.filter(Boolean).length > 0 && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px' }}>
                      <Label>☕ CoffeePlace Applications</Label>
                      {book.coffeeApplications.filter(Boolean).map((a,i) => <div key={i} style={{ fontSize: 12, color: '#78350F', padding: '2px 0', display:'flex', gap:5 }}><span>→</span>{a}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={<BookOpen size={22} />} title="No books found" description="Add books from your reading list"
          action={<Button onClick={() => setModalOpen(true)}><Plus size={14} /> Add Book</Button>} />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Book' : 'Add Book'} width={560}>
        <BookForm initial={editing || EMPTY} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} />
      </Modal>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 6 }}>{children}</div>
}

function BookForm({ initial, onSave, onCancel }: {
  initial: Omit<Book,'id'|'createdAt'|'updatedAt'> | Book
  onSave: (d: Omit<Book,'id'|'createdAt'|'updatedAt'>) => void
  onCancel: () => void
}) {
  const [d, setD] = useState({ ...initial })
  const set = (k: string, v: unknown) => setD(p => ({ ...p, [k]: v }))
  const setList = (k: keyof typeof d, i: number, v: string) => {
    const arr = [...(d[k] as string[])]; arr[i] = v; set(k, arr)
  }
  const addItem = (k: keyof typeof d) => set(k, [...(d[k] as string[]), ''])
  return (
    <form onSubmit={e => { e.preventDefault(); if (d.name) onSave(d as Omit<Book,'id'|'createdAt'|'updatedAt'>) }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Book Title" required><Input value={d.name} onChange={e => set('name',e.target.value)} required /></FormField>
        </div>
        <FormField label="Author"><Input value={d.author} onChange={e => set('author',e.target.value)} /></FormField>
        <FormField label="Category">
          <Select value={d.category} onChange={e => set('category',e.target.value)}
            options={ALL_MBA_CATEGORIES.filter(c=>c!=='Other').map(c=>({ value:c,label:c }))} />
        </FormField>
        <FormField label="Status">
          <Select value={d.status} onChange={e => set('status',e.target.value)}
            options={Object.entries(STATUS_MAP).map(([v,{label}])=>({ value:v,label }))} />
        </FormField>
        <FormField label={`Progress: ${d.progress}%`}>
          <input type="range" min={0} max={100} value={d.progress} onChange={e => set('progress',Number(e.target.value))}
            style={{ width:'100%', accentColor:'var(--accent)' }} />
        </FormField>
        <FormField label={`Rating: ${d.rating}/5`}>
          <div style={{ display:'flex', gap:6, paddingTop:6 }}>
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" onClick={() => set('rating', d.rating===i ? 0 : i)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                <Star size={20} style={{ color: i<=d.rating ? '#F59E0B' : 'var(--border)', fill: i<=d.rating ? '#F59E0B' : 'transparent' }} />
              </button>
            ))}
          </div>
        </FormField>
      </div>
      <FormField label="Summary">
        <Textarea value={d.summary} onChange={e => set('summary',e.target.value)} rows={3} placeholder="Key themes and takeaways…" />
      </FormField>
      <FormField label="Action Items">
        {d.actionItems.map((item,i) => (
          <div key={i} style={{ display:'flex',gap:6,marginBottom:5 }}>
            <Input value={item} onChange={e => setList('actionItems',i,e.target.value)} placeholder="Action item…" />
            {d.actionItems.length>1 && <button type="button" onClick={() => set('actionItems',d.actionItems.filter((_,idx)=>idx!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted-foreground)' }}>×</button>}
          </div>
        ))}
        <button type="button" onClick={() => addItem('actionItems')} style={{ fontSize:11,color:'var(--muted-foreground)',background:'none',border:'1px dashed var(--border)',padding:'4px 10px',borderRadius:6,cursor:'pointer' }}>+ Add</button>
      </FormField>
      <FormField label="CoffeePlace Applications">
        {d.coffeeApplications.map((item,i) => (
          <div key={i} style={{ display:'flex',gap:6,marginBottom:5 }}>
            <Input value={item} onChange={e => setList('coffeeApplications',i,e.target.value)} placeholder="How to apply this at CoffeePlace…" />
            {d.coffeeApplications.length>1 && <button type="button" onClick={() => set('coffeeApplications',d.coffeeApplications.filter((_,idx)=>idx!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted-foreground)' }}>×</button>}
          </div>
        ))}
        <button type="button" onClick={() => addItem('coffeeApplications')} style={{ fontSize:11,color:'var(--muted-foreground)',background:'none',border:'1px dashed var(--border)',padding:'4px 10px',borderRadius:6,cursor:'pointer' }}>+ Add</button>
      </FormField>
      <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{('id' in initial) ? 'Save Changes' : 'Add Book'}</Button>
      </div>
    </form>
  )
}
