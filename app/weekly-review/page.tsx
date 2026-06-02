'use client'
import { useState, useMemo } from 'react'
import { Plus, CalendarCheck, ChevronRight, ChevronDown, Zap, AlertTriangle, Lightbulb, Coffee, Target, Trash2, BookOpen, ClipboardList, GraduationCap, Library, Sparkles, TrendingUp, Brain, Flame, CheckCircle2 } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_BOOKS } from '@/lib/seed-books'
import { SEED_EXAMS } from '@/lib/seed-exams'
import { WeeklyReview, Course, Assignment, ExamAttempt, Book } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea, Input } from '@/components/ui/Input'
import { generateId, formatDate, getWeekNumber, getWeekRange } from '@/lib/utils'

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 960, margin: '0 auto' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function inRange(dateStr: string | undefined, start: string, end: string): boolean {
  if (!dateStr) return false
  return dateStr >= start && dateStr <= end + 'T23:59:59'
}

function makeEmptyReview(): Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'> {
  const today = new Date()
  const monday = getMondayOfWeek(today)
  const range = getWeekRange(monday)
  return {
    weekNumber: getWeekNumber(today),
    weekStartDate: range.start,
    weekEndDate: range.end,
    // Learning activity
    hoursStudied: 0,
    coursesCompleted: [],
    assignmentsCompleted: [],
    examsTaken: [],
    booksRead: [],
    // Concepts
    conceptsLearned: [],
    conceptsStrong: [],
    conceptsWeak: [],
    // CoffeePlace
    coffeeImplementations: [],
    coffeeDecisions: [],
    // Reflection
    wins: [],
    challenges: [],
    lessonsLearned: [],
    // Next week
    nextWeekFocus: [],
    nextWeekGoals: [],
    // Scores
    energyLevel: 3,
    overallRating: 3,
    notes: '',
  }
}

/** Auto-suggest learning activity that fell within the review's date range */
function suggestActivity(
  start: string,
  end: string,
  courses: Course[],
  assignments: Assignment[],
  attempts: ExamAttempt[],
  books: Book[],
) {
  return {
    coursesCompleted: courses
      .filter(c => c.status === 'completed' && inRange(c.completedAt ?? c.updatedAt, start, end))
      .map(c => c.name),
    assignmentsCompleted: assignments
      .filter(a => a.status === 'graded' && inRange(a.gradedAt ?? a.updatedAt, start, end))
      .map(a => a.title),
    examsTaken: attempts
      .filter(a => inRange(a.completedAt, start, end))
      .map(a => `${a.examTitle} (${a.score}%${a.passed ? ' ✓' : ''})`),
    booksRead: books
      .filter(b => b.status === 'completed' && inRange(b.completedAt ?? b.updatedAt, start, end))
      .map(b => b.name),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Mode = 'list' | 'new' | { edit: WeeklyReview }

export default function WeeklyReviewPage() {
  const [reviews, setReviews] = useFirestore<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, [])
  const [courses] = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [assignments] = useFirestore<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
  const [attempts] = useFirestore<ExamAttempt[]>(STORAGE_KEYS.EXAM_ATTEMPTS, [])
  const [books] = useFirestore<Book[]>(STORAGE_KEYS.BOOKS, SEED_BOOKS)
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('list')

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)),
    [reviews],
  )

  const handleSave = (data: Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    if (typeof mode === 'object' && 'edit' in mode) {
      setReviews(prev => prev.map(r => r.id === mode.edit.id ? { ...r, ...data, updatedAt: now } : r))
      toast.success('Weekly review updated')
    } else {
      setReviews(prev => [{ ...data, id: generateId(), createdAt: now, updatedAt: now }, ...prev])
    }
    toast.success('Weekly review saved')
    setMode('list')
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this review?')) { setReviews(prev => prev.filter(r => r.id !== id)); toast.success('Review deleted') }
  }

  if (mode !== 'list') {
    const initial = typeof mode === 'object' && 'edit' in mode ? mode.edit : makeEmptyReview()
    return (
      <div style={PAGE_STYLE}>
        <PageHeader
          title={typeof mode === 'object' ? 'Edit Review' : 'Weekly Learning Review'}
          description="Document what you studied, what you built at CoffeePlace, and what to focus on next"
          action={<Button variant="secondary" onClick={() => setMode('list')}>← Back</Button>}
        />
        <ReviewForm
          initial={initial}
          isEdit={typeof mode === 'object'}
          courses={courses}
          assignments={assignments}
          attempts={attempts}
          books={books}
          onSave={handleSave}
          onCancel={() => setMode('list')}
        />
      </div>
    )
  }

  return (
    <div style={PAGE_STYLE}>
      <PageHeader
        title="Weekly Learning Reviews"
        description="Track your MBA progress, CoffeePlace implementations, and learning velocity week by week"
        action={<Button onClick={() => setMode('new')}><Plus size={14} /> New Review</Button>}
      />

      {sorted.length === 0 ? (
        <EmptyState onNew={() => setMode('new')} />
      ) : (
        <>
          <TrendSection reviews={sorted} />
          <ReviewList reviews={sorted} onEdit={r => setMode({ edit: r })} onDelete={handleDelete} />
        </>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <CalendarCheck size={36} style={{ color: 'var(--muted-foreground)', marginBottom: 12 }} />
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No reviews yet</div>
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 20 }}>
        30 minutes every Friday. The discipline that compounds faster than any course.
      </div>
      <Button onClick={onNew}><Plus size={14} /> Start Your First Review</Button>
    </div>
  )
}

// ─── Trend Section ────────────────────────────────────────────────────────────

function TrendSection({ reviews }: { reviews: WeeklyReview[] }) {
  const last8 = reviews.slice(0, 8).reverse()

  const hours = last8.map(r => r.hoursStudied ?? 0)
  const energy = last8.map(r => r.energyLevel)
  const rating = last8.map(r => r.overallRating)
  const labels = last8.map(r => `W${r.weekNumber}`)

  const avgHours = hours.length ? (hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(1) : '0'
  const avgEnergy = energy.length ? (energy.reduce((a, b) => a + b, 0) / energy.length).toFixed(1) : '0'
  const avgRating = rating.length ? (rating.reduce((a, b) => a + b, 0) / rating.length).toFixed(1) : '0'

  if (last8.length < 2) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
      <TrendCard title="Study Hours / Week" value={`${avgHours}h avg`} data={hours} max={40} color="#1D4ED8" labels={labels} icon={<Brain size={13} />} />
      <TrendCard title="Energy Level" value={`${avgEnergy}/5 avg`} data={energy} max={5} color="#F59E0B" labels={labels} icon={<Zap size={13} />} />
      <TrendCard title="Week Rating" value={`${avgRating}/5 avg`} data={rating} max={5} color="#92400E" labels={labels} icon={<TrendingUp size={13} />} />
    </div>
  )
}

function TrendCard({ title, value, data, max, color, labels, icon }: {
  title: string; value: string; data: number[]; max: number; color: string; labels: string[]; icon: React.ReactNode
}) {
  const W = 240, H = 56, PAD = 4
  const pts = data.map((v, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2)
    const y = H - PAD - ((v / max) * (H - PAD * 2))
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ')
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const trend = last > prev ? '↑' : last < prev ? '↓' : '→'
  const trendColor = last > prev ? '#15803D' : last < prev ? '#DC2626' : 'var(--muted-foreground)'

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
        <span style={{ fontSize: 13, color: trendColor, fontWeight: 600 }}>{trend}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 48 }}>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
        {data.map((v, i) => {
          const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2)
          const y = H - PAD - ((v / max) * (H - PAD * 2))
          return <circle key={i} cx={x} cy={y} r="3" fill={color} opacity={i === data.length - 1 ? 1 : 0.5} />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--muted-foreground)', marginTop: 2 }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  )
}

// ─── Review List ──────────────────────────────────────────────────────────────

function ReviewList({ reviews, onEdit, onDelete }: {
  reviews: WeeklyReview[]
  onEdit: (r: WeeklyReview) => void
  onDelete: (id: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {reviews.map(r => {
        const isExp = expandedId === r.id
        const hasLearning = (r.hoursStudied ?? 0) > 0 || (r.coursesCompleted?.length ?? 0) > 0
        return (
          <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
              onClick={() => setExpandedId(isExp ? null : r.id)}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>W{r.weekNumber}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>Week {r.weekNumber} · {formatDate(r.weekStartDate)}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(r.hoursStudied ?? 0) > 0 && <MiniPill label={`📚 ${r.hoursStudied}h studied`} />}
                  {(r.coursesCompleted?.length ?? 0) > 0 && <MiniPill label={`🎓 ${r.coursesCompleted!.length} course${r.coursesCompleted!.length > 1 ? 's' : ''}`} />}
                  {(r.examsTaken?.length ?? 0) > 0 && <MiniPill label={`📝 ${r.examsTaken!.length} exam${r.examsTaken!.length > 1 ? 's' : ''}`} />}
                  {(r.booksRead?.length ?? 0) > 0 && <MiniPill label={`📖 ${r.booksRead!.length} book${r.booksRead!.length > 1 ? 's' : ''}`} />}
                  {(r.assignmentsCompleted?.length ?? 0) > 0 && <MiniPill label={`✅ ${r.assignmentsCompleted!.length} assignment${r.assignmentsCompleted!.length > 1 ? 's' : ''}`} />}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <RatingPill label="⚡" value={r.energyLevel} />
                <RatingPill label="★" value={r.overallRating} />
                <button onClick={e => { e.stopPropagation(); onEdit(r) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted-foreground)', fontSize: 12 }}>Edit</button>
                <button onClick={e => { e.stopPropagation(); onDelete(r.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#DC2626' }}><Trash2 size={13} /></button>
                {isExp ? <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />}
              </div>
            </div>

            {/* Expanded */}
            {isExp && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Learning Activity */}
                {hasLearning && (
                  <ExpandSection title="Learning Activity" icon={<Brain size={12} />} color="#1D4ED8">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {(r.hoursStudied ?? 0) > 0 && (
                        <div style={{ padding: '8px 10px', background: '#EFF6FF', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8', marginBottom: 2 }}>Hours Studied</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#1D4ED8' }}>{r.hoursStudied}h</div>
                        </div>
                      )}
                      <ListDisplay title="Courses" items={r.coursesCompleted ?? []} icon="🎓" />
                      <ListDisplay title="Assignments" items={r.assignmentsCompleted ?? []} icon="✅" />
                      <ListDisplay title="Exams" items={r.examsTaken ?? []} icon="📝" />
                      <ListDisplay title="Books" items={r.booksRead ?? []} icon="📖" />
                    </div>
                  </ExpandSection>
                )}

                {/* Concepts */}
                {((r.conceptsLearned?.length ?? 0) + (r.conceptsStrong?.length ?? 0) + (r.conceptsWeak?.length ?? 0)) > 0 && (
                  <ExpandSection title="Knowledge & Concepts" icon={<Lightbulb size={12} />} color="#8B5CF6">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      <ListDisplay title="Concepts Learned" items={r.conceptsLearned ?? []} icon="💡" />
                      <ListDisplay title="Concepts Strong" items={r.conceptsStrong ?? []} icon="💪" />
                      <ListDisplay title="Concepts Weak" items={r.conceptsWeak ?? []} icon="⚠️" />
                    </div>
                  </ExpandSection>
                )}

                {/* CoffeePlace */}
                {((r.coffeeImplementations?.length ?? 0) + (r.coffeeDecisions?.length ?? 0)) > 0 && (
                  <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Coffee size={11} /> CoffeePlace This Week
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <ListDisplay title="Implementations" items={r.coffeeImplementations ?? []} icon="🔨" textColor="#78350F" />
                      <ListDisplay title="Decisions Made" items={r.coffeeDecisions ?? []} icon="🎯" textColor="#78350F" />
                    </div>
                  </div>
                )}

                {/* Reflection */}
                <ExpandSection title="Reflection" icon={<Zap size={12} />} color="#F59E0B">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <ListDisplay title="Wins" items={r.wins.filter(Boolean)} icon="⚡" />
                    <ListDisplay title="Challenges" items={r.challenges.filter(Boolean)} icon="🔴" />
                    <ListDisplay title="Lessons Learned" items={r.lessonsLearned?.filter(Boolean) ?? []} icon="💡" />
                    <ListDisplay title="Next Week Focus" items={r.nextWeekFocus ?? []} icon="🎯" />
                    <ListDisplay title="Next Week Goals" items={r.nextWeekGoals?.filter(Boolean) ?? []} icon="✓" />
                  </div>
                </ExpandSection>

                {r.notes && (
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {r.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExpandSection({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function ListDisplay({ title, items, icon, textColor }: { title: string; items: string[]; icon: string; textColor?: string }) {
  if (items.length === 0) return null
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>{icon} {title}</div>
      {items.filter(Boolean).map((item, i) => (
        <div key={i} style={{ fontSize: 12.5, padding: '2px 0', color: textColor ?? 'var(--foreground)', lineHeight: 1.4 }}>• {item}</div>
      ))}
    </div>
  )
}

function MiniPill({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 11, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--muted-foreground)' }}>
      {label}
    </span>
  )
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'var(--secondary)', borderRadius: 6, padding: '4px 8px', fontSize: 11, display: 'flex', gap: 3 }}>
      <span>{label}</span><span style={{ fontWeight: 600 }}>{value}/5</span>
    </div>
  )
}

// ─── Review Form ──────────────────────────────────────────────────────────────

type FormData = Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'>

function ReviewForm({ initial, isEdit, courses, assignments, attempts, books, onSave, onCancel }: {
  initial: FormData | WeeklyReview
  isEdit: boolean
  courses: Course[]
  assignments: Assignment[]
  attempts: ExamAttempt[]
  books: Book[]
  onSave: (d: FormData) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<FormData>(() => ({
    weekNumber: (initial as WeeklyReview).weekNumber ?? getWeekNumber(new Date()),
    weekStartDate: initial.weekStartDate,
    weekEndDate: initial.weekEndDate,
    hoursStudied: initial.hoursStudied ?? 0,
    coursesCompleted: initial.coursesCompleted ?? [],
    assignmentsCompleted: initial.assignmentsCompleted ?? [],
    examsTaken: initial.examsTaken ?? [],
    booksRead: initial.booksRead ?? [],
    conceptsLearned: initial.conceptsLearned ?? [],
    conceptsStrong: initial.conceptsStrong ?? [],
    conceptsWeak: initial.conceptsWeak ?? [],
    coffeeImplementations: initial.coffeeImplementations ?? [],
    coffeeDecisions: initial.coffeeDecisions ?? [],
    wins: initial.wins?.length ? initial.wins : [],
    challenges: initial.challenges?.length ? initial.challenges : [],
    lessonsLearned: initial.lessonsLearned ?? [],
    nextWeekFocus: initial.nextWeekFocus ?? [],
    nextWeekGoals: initial.nextWeekGoals ?? [],
    energyLevel: initial.energyLevel,
    overallRating: initial.overallRating,
    notes: initial.notes ?? '',
  }))
  const [suggested, setSuggested] = useState(false)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData(prev => ({ ...prev, [key]: value }))

  const handleAutoSuggest = () => {
    const s = suggestActivity(data.weekStartDate, data.weekEndDate, courses, assignments, attempts, books)
    setData(prev => ({
      ...prev,
      coursesCompleted: [...new Set([...(prev.coursesCompleted ?? []), ...s.coursesCompleted])],
      assignmentsCompleted: [...new Set([...(prev.assignmentsCompleted ?? []), ...s.assignmentsCompleted])],
      examsTaken: [...new Set([...(prev.examsTaken ?? []), ...s.examsTaken])],
      booksRead: [...new Set([...(prev.booksRead ?? []), ...s.booksRead])],
    }))
    setSuggested(true)
  }

  const total = [
    ...(data.coursesCompleted ?? []),
    ...(data.assignmentsCompleted ?? []),
    ...(data.examsTaken ?? []),
    ...(data.booksRead ?? []),
  ].filter(Boolean).length

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(data) }}>

      {/* ── Section 1: Week Setup ── */}
      <FormSection title="Week Setup" icon={<CalendarCheck size={14} />} color="#1C1917">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <FormField label="Week Start">
            <Input type="date" value={data.weekStartDate}
              onChange={e => set('weekStartDate', e.target.value)} />
          </FormField>
          <FormField label="Week End">
            <Input type="date" value={data.weekEndDate}
              onChange={e => set('weekEndDate', e.target.value)} />
          </FormField>
          <FormField label={`Hours Studied: ${data.hoursStudied}h`}>
            <input type="range" min={0} max={60} step={0.5} value={data.hoursStudied ?? 0}
              onChange={e => set('hoursStudied', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1D4ED8', marginTop: 6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
              <span>0h</span><span>60h</span>
            </div>
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 4 }}>
          <FormField label={`Energy Level: ${data.energyLevel}/5`}>
            <input type="range" min={1} max={5} value={data.energyLevel}
              onChange={e => set('energyLevel', Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              style={{ width: '100%', accentColor: '#F59E0B' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
              <span>Drained</span><span>⚡ Energised</span>
            </div>
          </FormField>
          <FormField label={`Week Rating: ${data.overallRating}/5`}>
            <input type="range" min={1} max={5} value={data.overallRating}
              onChange={e => set('overallRating', Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
              <span>Rough week</span><span>★ Outstanding</span>
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* ── Section 2: Learning Activity ── */}
      <FormSection title="Learning Activity This Week" icon={<Brain size={14} />} color="#1D4ED8">
        {/* Auto-suggest bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: suggested ? '#F0FDF4' : '#EFF6FF', borderRadius: 10, marginBottom: 16, border: `1px solid ${suggested ? '#BBF7D0' : '#BFDBFE'}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: suggested ? '#15803D' : '#1D4ED8' }}>
              {suggested
                ? `✓ Auto-populated ${total} item${total !== 1 ? 's' : ''} — edit freely below`
                : 'Auto-populate from your learning activity this week'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
              Pulls courses, assignments, exams, and books completed between {data.weekStartDate} and {data.weekEndDate}
            </div>
          </div>
          <Button type="button" variant={suggested ? 'secondary' : 'primary'} onClick={handleAutoSuggest}>
            <Sparkles size={13} /> {suggested ? 'Re-run' : 'Auto-Suggest'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListEditor label="Courses Completed" icon={<BookOpen size={13} />} color="#1D4ED8"
            items={data.coursesCompleted ?? []} placeholder="Course name…"
            onChange={v => set('coursesCompleted', v)} />
          <ListEditor label="Assignments Completed" icon={<ClipboardList size={13} />} color="#8B5CF6"
            items={data.assignmentsCompleted ?? []} placeholder="Assignment title…"
            onChange={v => set('assignmentsCompleted', v)} />
          <ListEditor label="Exams Taken" icon={<GraduationCap size={13} />} color="#DC2626"
            items={data.examsTaken ?? []} placeholder="Exam name (score%)…"
            onChange={v => set('examsTaken', v)} />
          <ListEditor label="Books Finished" icon={<Library size={13} />} color="#0891B2"
            items={data.booksRead ?? []} placeholder="Book title…"
            onChange={v => set('booksRead', v)} />
        </div>
      </FormSection>

      {/* ── Section 3: Knowledge & Concepts ── */}
      <FormSection title="Knowledge & Concepts" icon={<Lightbulb size={14} />} color="#8B5CF6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 24px' }}>
          <ListEditor label="Concepts Learned" icon={<Brain size={13} />} color="#8B5CF6"
            items={data.conceptsLearned ?? []} placeholder="e.g. Break-even analysis…"
            onChange={v => set('conceptsLearned', v)} />
          <ListEditor label="Concepts Strong 💪" icon={<CheckCircle2 size={13} />} color="#15803D"
            items={data.conceptsStrong ?? []} placeholder="Where you feel confident…"
            onChange={v => set('conceptsStrong', v)} />
          <ListEditor label="Concepts Weak ⚠️" icon={<AlertTriangle size={13} />} color="#DC2626"
            items={data.conceptsWeak ?? []} placeholder="Where you need work…"
            onChange={v => set('conceptsWeak', v)} />
        </div>
      </FormSection>

      {/* ── Section 4: CoffeePlace ── */}
      <FormSection title="CoffeePlace This Week" icon={<Coffee size={14} />} color="#92400E" bg="#FEF3C7" border="#FDE68A">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListEditor label="MBA Concepts Implemented at CoffeePlace" icon={<Flame size={13} />} color="#92400E"
            items={data.coffeeImplementations ?? []} placeholder="e.g. Launched Profit First system…"
            onChange={v => set('coffeeImplementations', v)} />
          <ListEditor label="Key Business Decisions Made" icon={<Target size={13} />} color="#78350F"
            items={data.coffeeDecisions ?? []} placeholder="e.g. Negotiated new supplier terms…"
            onChange={v => set('coffeeDecisions', v)} />
        </div>
      </FormSection>

      {/* ── Section 5: Reflection ── */}
      <FormSection title="Weekly Reflection" icon={<Zap size={14} />} color="#F59E0B">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListEditor label="Wins This Week ⚡" icon={<Zap size={13} />} color="#F59E0B"
            items={data.wins ?? []} placeholder="What went well?"
            onChange={v => set('wins', v)} />
          <ListEditor label="Challenges Faced" icon={<AlertTriangle size={13} />} color="#EF4444"
            items={data.challenges ?? []} placeholder="What was hard?"
            onChange={v => set('challenges', v)} />
          <ListEditor label="Lessons Learned 💡" icon={<Lightbulb size={13} />} color="#8B5CF6"
            items={data.lessonsLearned ?? []} placeholder="What would you do differently?"
            onChange={v => set('lessonsLearned', v)} />
        </div>
        <FormField label="Reflection Notes">
          <Textarea value={data.notes} rows={3} placeholder="Any other context, decisions, mindset notes…"
            onChange={e => set('notes', e.target.value)} />
        </FormField>
      </FormSection>

      {/* ── Section 6: Next Week ── */}
      <FormSection title="Next Week" icon={<Target size={14} />} color="#10B981">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListEditor label="Learning Focus 🎯" icon={<Brain size={13} />} color="#10B981"
            items={data.nextWeekFocus ?? []} placeholder="e.g. Master financial modelling…"
            onChange={v => set('nextWeekFocus', v)} />
          <ListEditor label="Business Goals" icon={<Target size={13} />} color="#0891B2"
            items={data.nextWeekGoals ?? []} placeholder="e.g. Meet supplier Wednesday…"
            onChange={v => set('nextWeekGoals', v)} />
        </div>
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEdit ? 'Save Changes' : 'Save Review'}</Button>
      </div>
    </form>
  )
}

// ─── Form Section ─────────────────────────────────────────────────────────────

function FormSection({ title, icon, color, bg, border, children }: {
  title: string; icon: React.ReactNode; color: string; bg?: string; border?: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: bg ?? 'var(--secondary)', border: `1px solid ${border ?? 'var(--border)'}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

// ─── List Editor ──────────────────────────────────────────────────────────────

function ListEditor({ label, icon, color, items, placeholder, onChange }: {
  label: string; icon: React.ReactNode; color: string
  items: string[]; placeholder: string; onChange: (v: string[]) => void
}) {
  const set = (i: number, v: string) => { const a = [...items]; a[i] = v; onChange(a) }
  const add = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ color, fontSize: 14, flexShrink: 0, lineHeight: 1 }}>•</span>
            <Input value={item} onChange={e => set(i, e.target.value)} placeholder={placeholder} />
            {items.length > 0 && (
              <button type="button" onClick={() => remove(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0 2px', fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={add} style={{
          background: 'none', border: '1px dashed var(--border)', cursor: 'pointer',
          padding: '5px 10px', borderRadius: 7, fontSize: 11, color: 'var(--muted-foreground)',
          display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', marginTop: 2,
        }}>
          <Plus size={10} /> Add
        </button>
      </div>
    </div>
  )
}
