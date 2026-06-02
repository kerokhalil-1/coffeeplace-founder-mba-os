'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, FileText, Pin, PinOff, Trash2, Search, Tag, X } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { Note, Course } from '@/lib/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate, truncate } from '@/lib/utils'

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const EMPTY_NOTE: Omit<Note, 'id'|'createdAt'|'updatedAt'> = {
  title: '', content: '', tags: [], isPinned: false,
}

export default function NotesPage() {
  const [notes, setNotes] = useFirestore<Note[]>(STORAGE_KEYS.NOTES, [])
  const [courses] = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [activeId, setActiveId] = useState<string | 'new' | null>(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    notes.forEach(n => n.tags.forEach(t => tags.add(t)))
    return Array.from(tags)
  }, [notes])

  const filtered = useMemo(() => {
    const pinned = notes.filter(n => n.isPinned)
    const rest = notes.filter(n => !n.isPinned)
    const all = [...pinned, ...rest]
    return all.filter(n => {
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
      const matchTag = filterTag === 'all' || n.tags.includes(filterTag)
      return matchSearch && matchTag
    })
  }, [notes, search, filterTag])

  const activeNote = activeId === 'new' ? null : notes.find(n => n.id === activeId)

  const createNote = () => {
    const now = new Date().toISOString()
    const note: Note = { ...EMPTY_NOTE, id: generateId(), tags: [], createdAt: now, updatedAt: now }
    setNotes(prev => [note, ...prev])
    setActiveId(note.id)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id !== id ? n : { ...n, ...updates, updatedAt: new Date().toISOString() }))
  }

  const deleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
      if (activeId === id) setActiveId(null)
    }
  }

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id !== id ? n : { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }))
  }

  return (
    <div style={PAGE_STYLE}>
      <PageHeader
        title="Notes"
        description="Capture insights, link them to courses, and build your knowledge base"
        action={<Button onClick={createNote}><Plus size={14} /> New Note</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 180px)' }}>
        {/* Left panel — list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Search + filter */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <Input placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <TagPill label="All" active={filterTag === 'all'} onClick={() => setFilterTag('all')} />
              {allTags.map(t => <TagPill key={t} label={t} active={filterTag === t} onClick={() => setFilterTag(t)} />)}
            </div>
          )}

          {/* Note list */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
                {notes.length === 0 ? 'No notes yet' : 'No matches'}
              </div>
            ) : (
              filtered.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: activeId === note.id ? 'var(--primary)' : 'var(--card)',
                    border: `1px solid ${activeId === note.id ? 'var(--primary)' : 'var(--border)'}`,
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: activeId === note.id ? 'white' : 'var(--foreground)',
                      lineHeight: 1.3, flex: 1
                    }}>
                      {note.title || 'Untitled'}
                      {note.isPinned && <Pin size={10} style={{ marginLeft: 4, display: 'inline', color: activeId === note.id ? '#FDE68A' : 'var(--accent)' }} />}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: activeId === note.id ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)', marginTop: 3 }}>
                    {formatDate(note.updatedAt)}
                  </div>
                  {note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
                      {note.tags.slice(0, 3).map(t => (
                        <span key={t} style={{
                          fontSize: 10, padding: '1px 5px', borderRadius: 3,
                          background: activeId === note.id ? 'rgba(255,255,255,0.15)' : 'var(--secondary)',
                          color: activeId === note.id ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)',
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel — editor */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {activeNote ? (
            <NoteEditor
              note={activeNote}
              courses={courses}
              onChange={updates => updateNote(activeNote.id, updates)}
              onDelete={() => deleteNote(activeNote.id)}
              onTogglePin={() => togglePin(activeNote.id)}
            />
          ) : (
            <EmptyState
              icon={<FileText size={22} />}
              title="Select a note"
              description="Choose a note from the list or create a new one"
              action={<Button onClick={createNote}><Plus size={14} /> New Note</Button>}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Note Editor ──────────────────────────────────────────────────────────────

function NoteEditor({ note, courses, onChange, onDelete, onTogglePin }: {
  note: Note
  courses: Course[]
  onChange: (updates: Partial<Note>) => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  const [tagInput, setTagInput] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !note.tags.includes(t)) {
      onChange({ tags: [...note.tags, t] })
      setTagInput('')
    }
  }
  const removeTag = (t: string) => onChange({ tags: note.tags.filter(x => x !== t) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid var(--border)', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Tag size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              placeholder="Add tag…"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              style={{
                fontSize: 12, padding: '5px 8px 5px 26px',
                background: 'var(--secondary)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--foreground)', outline: 'none', width: 140,
              }}
            />
          </div>
          {note.tags.map(t => (
            <span key={t} style={{ fontSize: 11, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t}
              <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onTogglePin}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: note.isPinned ? 'var(--accent)' : 'var(--muted-foreground)' }}>
            {note.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          <button onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#DC2626' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Link to course */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
        <select
          value={note.courseId || ''}
          onChange={e => onChange({ courseId: e.target.value || undefined })}
          style={{ fontSize: 11.5, padding: '4px 8px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted-foreground)', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">— Link to course (optional) —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Title */}
      <input
        ref={titleRef}
        value={note.title}
        onChange={e => onChange({ title: e.target.value })}
        placeholder="Untitled"
        style={{
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
          padding: '18px 22px 8px', border: 'none', outline: 'none',
          background: 'transparent', color: 'var(--foreground)', fontFamily: 'inherit',
          width: '100%',
        }}
      />

      {/* Date */}
      <div style={{ padding: '0 22px 12px', fontSize: 11, color: 'var(--muted-foreground)' }}>
        Last edited {formatDate(note.updatedAt)}
      </div>

      {/* Content */}
      <textarea
        value={note.content}
        onChange={e => onChange({ content: e.target.value })}
        placeholder="Start writing…"
        style={{
          flex: 1, padding: '4px 22px 22px', fontSize: 14, lineHeight: 1.7,
          border: 'none', outline: 'none', resize: 'none',
          background: 'transparent', color: 'var(--foreground)', fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

function TagPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 5,
      background: active ? 'var(--primary)' : 'var(--secondary)',
      color: active ? 'white' : 'var(--muted-foreground)',
      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}
