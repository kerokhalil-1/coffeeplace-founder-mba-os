'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Target, Clock, Edit3, Save, X, ExternalLink, GraduationCap, Library, ClipboardList, FileText } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_KNOWLEDGE, SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { SEED_BOOKS } from '@/lib/seed-books'
import { SEED_EXAMS } from '@/lib/seed-exams'
import { KnowledgeCategory, KnowledgeTopic, DifficultyLevel, Course, Assignment, Exam, Note, Book, CourseCategory } from '@/lib/types'
import { findRelated, RelatedResult } from '@/lib/relationships'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

const PAGE = { padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }

const DIFF_STYLE: Record<DifficultyLevel, { bg: string; color: string; label: string }> = {
  beginner:     { bg: '#F0FDF4', color: '#15803D', label: 'Beginner' },
  intermediate: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Intermediate' },
  advanced:     { bg: '#FDF4FF', color: '#7E22CE', label: 'Advanced' },
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useFirestore<KnowledgeCategory[]>(STORAGE_KEYS.KNOWLEDGE, SEED_KNOWLEDGE)
  // Entity collections for knowledge linking
  const [courses]     = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [assignments] = useFirestore<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
  const [exams]       = useFirestore<Exam[]>(STORAGE_KEYS.EXAMS, SEED_EXAMS)
  const [notes]       = useFirestore<Note[]>(STORAGE_KEYS.NOTES, [])
  const [books]       = useFirestore<Book[]>(STORAGE_KEYS.BOOKS, SEED_BOOKS)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [filterDiff, setFilterDiff] = useState<DifficultyLevel | 'all'>('all')

  const overallStats = useMemo(() => {
    const allTopics = knowledge.flatMap(k => k.topics)
    const completed = allTopics.filter(t => t.completed).length
    const total = allTopics.length
    const totalHours = allTopics.reduce((s, t) => s + t.estimatedHours, 0)
    const completedHours = allTopics.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0)
    return { completed, total, pct: total ? Math.round(completed / total * 100) : 0, totalHours, completedHours }
  }, [knowledge])

  const categoriesWithPct = useMemo(() =>
    knowledge.map(cat => {
      const total = cat.topics.length
      const done = cat.topics.filter(t => t.completed).length
      return { ...cat, completionPercentage: total ? Math.round(done / total * 100) : 0 }
    }), [knowledge])

  const activeKnowledge = categoriesWithPct.find(k => k.id === activeCategory)

  const toggleTopic = (catId: string, topicId: string) => {
    setKnowledge(prev => prev.map(cat => cat.id !== catId ? cat : {
      ...cat,
      topics: cat.topics.map(t => t.id !== topicId ? t : { ...t, completed: !t.completed }),
      updatedAt: new Date().toISOString(),
    }))
  }

  const saveTopicNotes = (catId: string, topicId: string, notes: string) => {
    setKnowledge(prev => prev.map(cat => cat.id !== catId ? cat : {
      ...cat,
      topics: cat.topics.map(t => t.id !== topicId ? t : { ...t, notes }),
      updatedAt: new Date().toISOString(),
    }))
    setEditingTopicId(null)
  }

  const filteredTopics = activeKnowledge?.topics.filter(t =>
    filterDiff === 'all' || t.difficulty === filterDiff
  ) ?? []

  return (
    <div style={PAGE}>
      <PageHeader
        title="MBA Knowledge Map"
        description="14 disciplines. Every topic tracked. Every skill built intentionally."
        badge={`${overallStats.pct}% Complete`}
      />

      {/* Overall Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Topics Completed', value: `${overallStats.completed}/${overallStats.total}` },
          { label: 'Hours Completed', value: `${overallStats.completedHours}h` },
          { label: 'Total Curriculum', value: `${overallStats.totalHours}h` },
          { label: 'Disciplines', value: '14' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', padding: '0 4px', marginBottom: 4 }}>
            Disciplines
          </div>
          {categoriesWithPct.map(cat => {
            const active = activeCategory === cat.id
            return (
              <div
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveTopic(null); setEditingTopicId(null) }}
                style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: active ? 'var(--primary)' : 'var(--card)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 15 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: active ? 'white' : 'var(--foreground)' }}>{cat.name}</span>
                  <span style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}>
                    {cat.completionPercentage}%
                  </span>
                </div>
                <ProgressBar
                  value={cat.completionPercentage}
                  height={3}
                  color={active ? 'rgba(255,255,255,0.8)' : 'var(--accent)'}
                />
              </div>
            )
          })}
        </div>

        {/* Topic Detail */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {!activeKnowledge ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12, color: 'var(--muted-foreground)' }}>
              <BookOpen size={36} />
              <span style={{ fontSize: 14 }}>Select a discipline to explore topics</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{activeKnowledge.icon}</span>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{activeKnowledge.name}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {(['all','beginner','intermediate','advanced'] as const).map(d => (
                      <button key={d} onClick={() => setFilterDiff(d)} style={{
                        padding: '4px 10px', fontSize: 11, borderRadius: 6,
                        background: filterDiff === d ? 'var(--primary)' : 'var(--card)',
                        color: filterDiff === d ? 'white' : 'var(--muted-foreground)',
                        border: '1px solid var(--border)', cursor: 'pointer', textTransform: 'capitalize',
                      }}>{d}</button>
                    ))}
                  </div>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--muted-foreground)' }}>{activeKnowledge.description}</p>
                <ProgressBar value={activeKnowledge.completionPercentage} height={6} showLabel />
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
                  {activeKnowledge.topics.filter(t => t.completed).length}/{activeKnowledge.topics.length} topics completed ·{' '}
                  {activeKnowledge.topics.reduce((s, t) => s + t.estimatedHours, 0)}h total curriculum
                </div>
              </div>

              {/* Topics */}
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                {filteredTopics.map(topic => {
                  const isExpanded = activeTopic === topic.id
                  const isEditing = editingTopicId === topic.id
                  const diff = DIFF_STYLE[topic.difficulty]
                  return (
                    <div key={topic.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      {/* Topic row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', cursor: 'pointer',
                        background: isExpanded ? 'var(--secondary)' : 'transparent' }}
                        onClick={() => setActiveTopic(isExpanded ? null : topic.id)}>
                        <button onClick={e => { e.stopPropagation(); toggleTopic(activeKnowledge.id, topic.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                          {topic.completed
                            ? <CheckCircle2 size={18} style={{ color: '#15803D' }} />
                            : <Circle size={18} style={{ color: 'var(--muted-foreground)' }} />}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, textDecoration: topic.completed ? 'line-through' : 'none', color: topic.completed ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                              {topic.name}
                            </span>
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: diff.bg, color: diff.color }}>{diff.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                            {topic.subtopics.length} subtopics · ~{topic.estimatedHours}h
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronDown size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                          : <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div style={{ padding: '0 24px 20px', background: 'var(--secondary)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            {/* Subtopics */}
                            <div>
                              <SectionLabel>Subtopics</SectionLabel>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {topic.subtopics.map((s, i) => (
                                  <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--card)', border: '1px solid var(--border)' }}>{s}</span>
                                ))}
                              </div>
                            </div>
                            {/* Learning Objectives */}
                            <div>
                              <SectionLabel><Target size={11} style={{ display: 'inline', marginRight: 4 }} />Learning Objectives</SectionLabel>
                              {topic.learningObjectives.map((o, i) => (
                                <div key={i} style={{ fontSize: 12.5, padding: '3px 0', display: 'flex', gap: 6 }}>
                                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span> {o}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Required Skills */}
                          {topic.requiredSkills.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <SectionLabel>Prerequisites</SectionLabel>
                              <div style={{ display: 'flex', gap: 5 }}>
                                {topic.requiredSkills.map((s, i) => (
                                  <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {isEditing ? (
                            <TopicNoteEditor
                              topicId={topic.id}
                              initialNotes={topic.notes}
                              onSave={(notes) => saveTopicNotes(activeKnowledge.id, topic.id, notes)}
                              onCancel={() => setEditingTopicId(null)}
                            />
                          ) : (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <SectionLabel>My Notes</SectionLabel>
                                <button onClick={() => setEditingTopicId(topic.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                  <Edit3 size={11} /> Edit
                                </button>
                              </div>
                              <div style={{ fontSize: 13, color: topic.notes ? 'var(--foreground)' : 'var(--muted-foreground)', fontStyle: topic.notes ? 'normal' : 'italic', lineHeight: 1.6, minHeight: 32 }}>
                                {topic.notes || 'No notes yet. Click Edit to add your notes, insights, and CoffeePlace connections.'}
                              </div>
                            </div>
                          )}

                          {/* Related Items */}
                          <RelatedItems
                            topic={topic}
                            category={activeKnowledge.name}
                            courses={courses}
                            assignments={assignments}
                            exams={exams}
                            notes={notes}
                            books={books}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function TopicNoteEditor({ topicId, initialNotes, onSave, onCancel }: {
  topicId: string; initialNotes: string; onSave: (n: string) => void; onCancel: () => void
}) {
  const [notes, setNotes] = useState(initialNotes)
  return (
    <div>
      <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
        placeholder="Add your notes, key insights, and how this connects to CoffeePlace…" />
      <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={onCancel}><X size={12} /> Cancel</Button>
        <Button size="sm" onClick={() => onSave(notes)}><Save size={12} /> Save</Button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 8 }}>
      {children}
    </div>
  )
}

// ─── Related Items ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', in_progress: 'In progress', completed: 'Completed',
  paused: 'Paused', want_to_read: 'Want to read', reading: 'Reading', dropped: 'Dropped',
}
const STATUS_COLOR: Record<string, string> = {
  completed: '#15803D', reading: '#1D4ED8', in_progress: '#1D4ED8',
  graded: '#15803D', not_started: '#78716C', paused: '#78716C',
  want_to_read: '#78716C', dropped: '#DC2626',
}

function RelatedItems({ topic, category, courses, assignments, exams, notes, books }: {
  topic: KnowledgeTopic
  category: CourseCategory
  courses: Course[]
  assignments: Assignment[]
  exams: Exam[]
  notes: Note[]
  books: Book[]
}) {
  const related = useMemo(
    () => findRelated(topic, category, { courses, assignments, exams, notes, books }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topic.id, category, courses, assignments, exams, notes, books],
  )

  const total =
    related.courses.length + related.assignments.length +
    related.exams.length + related.notes.length + related.books.length

  if (total === 0) return null

  return (
    <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)' }}>
          Related
        </div>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--border)', color: 'var(--muted-foreground)', fontWeight: 600 }}>
          {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Courses */}
        {related.courses.length > 0 && (
          <RelatedGroup icon={<BookOpen size={11} />} label="Courses" href="/courses" count={related.courses.length}>
            {related.courses.map(c => (
              <Link key={c.id} href="/courses" style={{ textDecoration: 'none' }}>
                <RelatedRow
                  title={c.name}
                  meta={c.platform || c.instructor || c.category}
                  badge={STATUS_LABEL[c.status] ?? c.status}
                  badgeColor={STATUS_COLOR[c.status] ?? '#78716C'}
                  sub={c.coffeeApplication ? `☕ ${c.coffeeApplication.slice(0, 55)}…` : undefined}
                />
              </Link>
            ))}
          </RelatedGroup>
        )}

        {/* Assignments */}
        {related.assignments.length > 0 && (
          <RelatedGroup icon={<ClipboardList size={11} />} label="Assignments" href="/assignments" count={related.assignments.length}>
            {related.assignments.map(a => {
              const pct = a.score != null ? ` · ${Math.round((a.score / a.maxScore) * 100)}%` : ''
              return (
                <Link key={a.id} href="/assignments" style={{ textDecoration: 'none' }}>
                  <RelatedRow
                    title={a.title}
                    meta={a.topicName ? `${a.category} · ${a.topicName}` : a.category}
                    badge={(STATUS_LABEL[a.status] ?? a.status) + pct}
                    badgeColor={STATUS_COLOR[a.status] ?? '#78716C'}
                  />
                </Link>
              )
            })}
          </RelatedGroup>
        )}

        {/* Exams */}
        {related.exams.length > 0 && (
          <RelatedGroup icon={<GraduationCap size={11} />} label="Exams" href="/exams" count={related.exams.length}>
            {related.exams.map(e => (
              <Link key={e.id} href="/exams" style={{ textDecoration: 'none' }}>
                <RelatedRow
                  title={e.title}
                  meta={`${e.questions.length} questions · pass ${e.passingScore}%`}
                />
              </Link>
            ))}
          </RelatedGroup>
        )}

        {/* Books */}
        {related.books.length > 0 && (
          <RelatedGroup icon={<Library size={11} />} label="Books" href="/books" count={related.books.length}>
            {related.books.map(b => (
              <Link key={b.id} href="/books" style={{ textDecoration: 'none' }}>
                <RelatedRow
                  title={b.name}
                  meta={b.author}
                  badge={STATUS_LABEL[b.status] ?? b.status}
                  badgeColor={STATUS_COLOR[b.status] ?? '#78716C'}
                />
              </Link>
            ))}
          </RelatedGroup>
        )}

        {/* Notes */}
        {related.notes.length > 0 && (
          <RelatedGroup icon={<FileText size={11} />} label="Notes" href="/notes" count={related.notes.length}>
            {related.notes.slice(0, 5).map(n => (
              <Link key={n.id} href="/notes" style={{ textDecoration: 'none' }}>
                <RelatedRow
                  title={n.title || 'Untitled'}
                  meta={n.tags.slice(0, 3).join(' · ') || 'No tags'}
                  sub={n.content ? n.content.slice(0, 70) + (n.content.length > 70 ? '…' : '') : undefined}
                />
              </Link>
            ))}
            {related.notes.length > 5 && (
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', padding: '4px 0', fontStyle: 'italic' }}>
                +{related.notes.length - 5} more notes — open Notes page to see all
              </div>
            )}
          </RelatedGroup>
        )}
      </div>
    </div>
  )
}

function RelatedGroup({ icon, label, href, count, children }: {
  icon: React.ReactNode; label: string; href: string; count: number; children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? 6 : 0 }}
      >
        <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 8, background: 'var(--border)', color: 'var(--muted-foreground)', fontWeight: 600 }}>
          {count}
        </span>
        <Link href={href} onClick={e => e.stopPropagation()} style={{ marginLeft: 4, color: 'var(--muted-foreground)', display: 'flex' }}>
          <ExternalLink size={9} />
        </Link>
        <span style={{ marginLeft: 2, color: 'var(--muted-foreground)' }}>
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function RelatedRow({ title, meta, badge, badgeColor, sub }: {
  title: string; meta?: string; badge?: string; badgeColor?: string; sub?: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px',
      background: 'var(--card)', borderRadius: 7, border: '1px solid var(--border)',
      cursor: 'pointer', transition: 'border-color 0.12s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--foreground)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--secondary)', color: badgeColor ?? 'var(--muted-foreground)', fontWeight: 500 }}>
              {badge}
            </span>
          )}
        </div>
        {meta && (
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>{meta}</div>
        )}
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.4, fontStyle: 'italic' }}>{sub}</div>
        )}
      </div>
      <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }} />
    </div>
  )
}
