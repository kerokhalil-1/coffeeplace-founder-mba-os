'use client'
import { useState, useMemo } from 'react'
import { Plus, CalendarDays, ChevronDown, ChevronRight, Trash2, Edit3, TrendingUp, Sparkles, BookOpen, Library, ClipboardList, GraduationCap, Clock, BarChart2, Star, Target, Zap, AlertTriangle, Coffee, ArrowUp, Minus } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_BOOKS } from '@/lib/seed-books'
import { SEED_EXAMS } from '@/lib/seed-exams'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { MonthlyReview, SkillScoreSnapshot, Course, Book, Assignment, ExamAttempt, WeeklyReview, SkillScore } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, FormField } from '@/components/ui/Input'
import { generateId, formatDate, toLocalDateStr } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 960, margin: '0 auto' }

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } for a calendar month */
function monthRange(monthNumber: number, year: number): { start: string; end: string } {
  const start = new Date(year, monthNumber - 1, 1)
  const end = new Date(year, monthNumber, 0) // day 0 of next month = last day of this month
  const fmt = (d: Date) => toLocalDateStr(d)
  return { start: fmt(start), end: fmt(end) }
}

/** Compare only the YYYY-MM-DD portion so ISO timestamps work correctly */
function inRange(dateStr: string | undefined, start: string, end: string): boolean {
  if (!dateStr) return false
  const d = dateStr.slice(0, 10)
  return d >= start && d <= end
}

// ─── Auto-population engine ───────────────────────────────────────────────────

interface AutoResult {
  coursesCompleted: string[]
  booksRead: string[]
  assignmentsFinished: string[]
  examsTaken: string[]
  hoursStudied: number
  skillScoreChanges: SkillScoreSnapshot[]
  avgExamScore: number
  totalSkillPointsGained: number
  mostImprovedSkill: string
  leastImprovedSkill: string
  biggestWin: string
  biggestWeakness: string
  recommendedFocus: string
}

function autoPopulate(
  monthNumber: number,
  year: number,
  courses: Course[],
  books: Book[],
  assignments: Assignment[],
  attempts: ExamAttempt[],
  weeklyReviews: WeeklyReview[],
  skills: SkillScore[],
): AutoResult {
  const { start, end } = monthRange(monthNumber, year)

  // ── Activity lists ──
  const completedCourses = courses
    .filter(c => c.status === 'completed' && inRange(c.completedAt ?? c.updatedAt, start, end))
    .map(c => c.name)

  const completedBooks = books
    .filter(b => b.status === 'completed' && inRange(b.completedAt ?? b.updatedAt, start, end))
    .map(b => `${b.name} by ${b.author}`)

  const gradedAssignments = assignments
    .filter(a => a.status === 'graded' && inRange(a.gradedAt ?? a.updatedAt, start, end))
    .map(a => {
      const pct = a.score != null ? ` (${Math.round((a.score / a.maxScore) * 100)}%)` : ''
      return `${a.title}${pct}`
    })

  const monthAttempts = attempts.filter(a => inRange(a.completedAt, start, end))
  const completedExams = monthAttempts.map(
    a => `${a.examTitle} — ${a.score}%${a.passed ? ' ✓' : ' ✗'}`,
  )

  // ── Hours studied — sum weekly reviews whose weekStartDate falls in the month ──
  const weeklyHours = weeklyReviews
    .filter(r => inRange(r.weekStartDate, start, end))
    .reduce((sum, r) => sum + (r.hoursStudied ?? 0), 0)

  // ── Skill score changes — sum evidence.date in month per skill ──
  const skillChanges: SkillScoreSnapshot[] = skills
    .map(skill => {
      const monthEvidence = skill.evidence.filter(e => inRange(e.date, start, end))
      const delta = monthEvidence.reduce((sum, e) => sum + e.pointsAdded, 0)
      if (delta === 0) return null
      return {
        category: skill.category,
        scoreAtStart: Math.max(0, skill.currentScore - delta),
        scoreAtEnd: skill.currentScore,
        delta,
      } as SkillScoreSnapshot
    })
    .filter((c): c is SkillScoreSnapshot => c !== null)
    .sort((a, b) => b.delta - a.delta)

  // ── Calculated stats ──
  const avgExamScore = monthAttempts.length > 0
    ? Math.round(monthAttempts.reduce((s, a) => s + a.score, 0) / monthAttempts.length)
    : 0

  const totalSkillPointsGained = skillChanges.reduce((s, c) => s + c.delta, 0)

  // ── Most / Least improved ──
  const mostImprovedSkill = skillChanges[0]?.category ?? ''
  const leastImprovedSkill = skillChanges[skillChanges.length - 1]?.category ?? ''

  // ── Editorial auto-suggestions ──
  // Biggest Win: first non-empty win from weekly reviews in the month
  const weekWins = weeklyReviews
    .filter(r => inRange(r.weekStartDate, start, end))
    .flatMap(r => r.wins ?? [])
    .filter(Boolean)
  const biggestWin = weekWins[0] ?? (completedCourses[0] ? `Completed: ${completedCourses[0]}` : '')

  // Biggest Weakness: first conceptsWeak from weekly reviews
  const weekWeaknesses = weeklyReviews
    .filter(r => inRange(r.weekStartDate, start, end))
    .flatMap(r => r.conceptsWeak ?? [])
    .filter(Boolean)
  const biggestWeakness =
    weekWeaknesses[0] ??
    (leastImprovedSkill ? `Low skill growth in ${leastImprovedSkill}` : '')

  // Recommended Focus: derive from least improved skill or unattempted exams
  const recommendedFocus = leastImprovedSkill
    ? `Deepen ${leastImprovedSkill} — lowest evidence earned this month`
    : ''

  return {
    coursesCompleted: completedCourses,
    booksRead: completedBooks,
    assignmentsFinished: gradedAssignments,
    examsTaken: completedExams,
    hoursStudied: weeklyHours,
    skillScoreChanges: skillChanges,
    avgExamScore,
    totalSkillPointsGained,
    mostImprovedSkill,
    leastImprovedSkill,
    biggestWin,
    biggestWeakness,
    recommendedFocus,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Mode = 'list' | 'new' | { edit: MonthlyReview }

export default function MonthlyReviewPage() {
  const [reviews, setReviews] = useFirestore<MonthlyReview[]>(STORAGE_KEYS.MONTHLY_REVIEWS, [])
  // Source entities for auto-population
  const [courses]       = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [books]         = useFirestore<Book[]>(STORAGE_KEYS.BOOKS, SEED_BOOKS)
  const [assignments]   = useFirestore<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
  const [attempts]      = useFirestore<ExamAttempt[]>(STORAGE_KEYS.EXAM_ATTEMPTS, [])
  const [weeklyReviews] = useFirestore<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, [])
  const [skills]        = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)

  const toast = useToast()
  const [mode, setMode] = useState<Mode>('list')

  const sorted = useMemo(() =>
    [...reviews].sort((a, b) => a.year !== b.year ? b.year - a.year : b.monthNumber - a.monthNumber),
    [reviews],
  )

  const handleSave = (data: Omit<MonthlyReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    if (typeof mode === 'object' && 'edit' in mode) {
      setReviews(prev => prev.map(r => r.id === mode.edit.id ? { ...r, ...data, updatedAt: now } : r))
      toast.success('Monthly review updated')
    } else {
      setReviews(prev => [...prev, { ...data, id: generateId(), createdAt: now, updatedAt: now }])
    }
    toast.success('Monthly review saved')
    setMode('list')
  }

  if (mode !== 'list') {
    const initial = typeof mode === 'object' && 'edit' in mode ? mode.edit : makeEmpty()
    return (
      <div style={PAGE}>
        <PageHeader
          title={typeof mode === 'object' ? 'Edit Monthly Review' : 'New Monthly Review'}
          description="Auto-populate your monthly MBA performance summary — then edit and save"
          action={<Button variant="secondary" onClick={() => setMode('list')}>← Back</Button>}
        />
        <MonthlyReviewForm
          initial={initial}
          isEdit={typeof mode === 'object'}
          courses={courses}
          books={books}
          assignments={assignments}
          attempts={attempts}
          weeklyReviews={weeklyReviews}
          skills={skills}
          onSave={handleSave}
          onCancel={() => setMode('list')}
        />
      </div>
    )
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="Monthly MBA Review"
        description="Automatic performance summaries — courses, books, exams, skill growth, and CoffeePlace progress"
        action={<Button onClick={() => setMode('new')}><Plus size={14} /> New Review</Button>}
      />
      {reviews.length === 0 ? (
        <EmptyState onNew={() => setMode('new')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(r => (
            <ReviewCard key={r.id} review={r}
              onEdit={() => setMode({ edit: r })}
              onDelete={() => { if (confirm('Delete this review?')) { setReviews(prev => prev.filter(x => x.id !== r.id)); toast.success('Review deleted') } }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function makeEmpty(): Omit<MonthlyReview, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date()
  return {
    monthNumber: now.getMonth() + 1,
    year: now.getFullYear(),
    mbaMonthName: '',
    topicsCompleted: [],
    coursesCompleted: [],
    booksRead: [],
    assignmentsFinished: [],
    examsTaken: [],
    hoursStudied: 0,
    skillScoreChanges: [],
    keyLessons: [],
    coffeeImprovements: [],
    overallRating: 3,
    notes: '',
    biggestWin: '',
    biggestWeakness: '',
    mostImprovedSkill: '',
    leastImprovedSkill: '',
    recommendedFocus: '',
    avgExamScore: 0,
    totalSkillPointsGained: 0,
  }
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <CalendarDays size={36} style={{ color: 'var(--muted-foreground)', marginBottom: 12 }} />
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No monthly reviews yet</div>
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 20 }}>
        45 minutes at month end. Auto-populated from all your activity.
      </div>
      <Button onClick={onNew}><Plus size={14} /> Create First Monthly Review</Button>
    </div>
  )
}

// ─── Review Card (history) ────────────────────────────────────────────────────

function ReviewCard({ review: r, onEdit, onDelete }: {
  review: MonthlyReview; onEdit: () => void; onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const stars = Array(5).fill(0).map((_, i) => i < r.overallRating ? '★' : '☆').join('')

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0, lineHeight: 1.3 }}>
          {MONTH_NAMES[r.monthNumber - 1].slice(0, 3)}<br />{r.year}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            {MONTH_NAMES[r.monthNumber - 1]} {r.year}
            {r.mbaMonthName && <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 8 }}>· {r.mbaMonthName}</span>}
          </div>
          {/* Stats strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--muted-foreground)' }}>
            {r.coursesCompleted.filter(Boolean).length > 0 && <span>🎓 {r.coursesCompleted.filter(Boolean).length} courses</span>}
            {r.booksRead.filter(Boolean).length > 0 && <span>📖 {r.booksRead.filter(Boolean).length} books</span>}
            {r.assignmentsFinished.filter(Boolean).length > 0 && <span>✅ {r.assignmentsFinished.filter(Boolean).length} assignments</span>}
            {r.examsTaken.filter(Boolean).length > 0 && <span>📝 {r.examsTaken.filter(Boolean).length} exams</span>}
            {r.hoursStudied > 0 && <span>⏱ {r.hoursStudied}h</span>}
            {(r.avgExamScore ?? 0) > 0 && <span>📊 {r.avgExamScore}% avg</span>}
            {(r.totalSkillPointsGained ?? 0) > 0 && <span style={{ color: '#15803D' }}>⬆ +{r.totalSkillPointsGained} skill pts</span>}
            <span style={{ color: '#F59E0B' }}>{stars}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2 }}><Edit3 size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}><Trash2 size={13} /></button>
          {expanded ? <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', background: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Activity grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <CardListSection title="📚 Courses" items={r.coursesCompleted} />
            <CardListSection title="📖 Books" items={r.booksRead} />
            <CardListSection title="✅ Assignments" items={r.assignmentsFinished} />
            <CardListSection title="📝 Exams" items={r.examsTaken} />
            <CardListSection title="🧠 Topics" items={r.topicsCompleted} />
            <CardListSection title="🔑 Key Lessons" items={r.keyLessons} />
          </div>

          {/* Skill changes */}
          {r.skillScoreChanges.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 8 }}>Skill Growth</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.skillScoreChanges.map(sc => (
                  <span key={sc.category} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                    {sc.category} +{sc.delta}pts ({sc.scoreAtStart}→{sc.scoreAtEnd})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          {(r.biggestWin || r.biggestWeakness || r.mostImprovedSkill || r.recommendedFocus) && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 10 }}>Performance Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {r.biggestWin && <SummaryItem icon="⚡" label="Biggest Win" value={r.biggestWin} color="#F59E0B" />}
                {r.biggestWeakness && <SummaryItem icon="⚠️" label="Biggest Weakness" value={r.biggestWeakness} color="#DC2626" />}
                {r.mostImprovedSkill && <SummaryItem icon="⬆" label="Most Improved" value={r.mostImprovedSkill} color="#15803D" />}
                {r.leastImprovedSkill && <SummaryItem icon="⬇" label="Least Improved" value={r.leastImprovedSkill} color="#92400E" />}
              </div>
              {r.recommendedFocus && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: '#EFF6FF', borderRadius: 7, fontSize: 12.5, color: '#1D4ED8' }}>
                  🎯 <strong>Next Month Focus:</strong> {r.recommendedFocus}
                </div>
              )}
            </div>
          )}

          {/* CoffeePlace */}
          {r.coffeeImprovements.filter(Boolean).length > 0 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>☕ CoffeePlace Improvements</div>
              {r.coffeeImprovements.filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 12.5, color: '#78350F', padding: '2px 0', display: 'flex', gap: 5 }}><span>→</span>{item}</div>
              ))}
            </div>
          )}

          {r.notes && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>{r.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

function CardListSection({ title, items }: { title: string; items: string[] }) {
  const clean = items.filter(Boolean)
  if (clean.length === 0) return null
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 5 }}>{title}</div>
      {clean.map((item, i) => (
        <div key={i} style={{ fontSize: 12.5, padding: '2px 0', display: 'flex', gap: 5, lineHeight: 1.4 }}>
          <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>•</span>{item}
        </div>
      ))}
    </div>
  )
}

function SummaryItem({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color, marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{value}</div>
    </div>
  )
}

// ─── Review Form ──────────────────────────────────────────────────────────────

type FormData = Omit<MonthlyReview, 'id' | 'createdAt' | 'updatedAt'>

function MonthlyReviewForm({ initial, isEdit, courses, books, assignments, attempts, weeklyReviews, skills, onSave, onCancel }: {
  initial: FormData | MonthlyReview
  isEdit: boolean
  courses: Course[]
  books: Book[]
  assignments: Assignment[]
  attempts: ExamAttempt[]
  weeklyReviews: WeeklyReview[]
  skills: SkillScore[]
  onSave: (d: FormData) => void
  onCancel: () => void
}) {
  const [d, setD] = useState<FormData>(() => ({
    monthNumber: (initial as MonthlyReview).monthNumber ?? new Date().getMonth() + 1,
    year: (initial as MonthlyReview).year ?? new Date().getFullYear(),
    mbaMonthName: initial.mbaMonthName ?? '',
    topicsCompleted: initial.topicsCompleted ?? [],
    coursesCompleted: initial.coursesCompleted ?? [],
    booksRead: initial.booksRead ?? [],
    assignmentsFinished: initial.assignmentsFinished ?? [],
    examsTaken: initial.examsTaken ?? [],
    hoursStudied: initial.hoursStudied ?? 0,
    skillScoreChanges: initial.skillScoreChanges ?? [],
    keyLessons: initial.keyLessons ?? [],
    coffeeImprovements: initial.coffeeImprovements ?? [],
    overallRating: initial.overallRating ?? 3,
    notes: initial.notes ?? '',
    biggestWin: initial.biggestWin ?? '',
    biggestWeakness: initial.biggestWeakness ?? '',
    mostImprovedSkill: initial.mostImprovedSkill ?? '',
    leastImprovedSkill: initial.leastImprovedSkill ?? '',
    recommendedFocus: initial.recommendedFocus ?? '',
    avgExamScore: initial.avgExamScore ?? 0,
    totalSkillPointsGained: initial.totalSkillPointsGained ?? 0,
  }))
  const [populated, setPopulated] = useState(isEdit && (initial.coursesCompleted?.length ?? 0) > 0)

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setD(p => ({ ...p, [k]: v }))
  const setList = (k: keyof FormData, i: number, v: string) => {
    const arr = [...(d[k] as string[])]; arr[i] = v; set(k, arr as FormData[typeof k])
  }
  const addItem = (k: keyof FormData) => set(k, [...(d[k] as string[]), ''] as FormData[typeof k])
  const removeItem = (k: keyof FormData, i: number) =>
    set(k, (d[k] as string[]).filter((_, idx) => idx !== i) as FormData[typeof k])

  const handleAutoPopulate = () => {
    const result = autoPopulate(d.monthNumber, d.year, courses, books, assignments, attempts, weeklyReviews, skills)
    setD(prev => ({
      ...prev,
      coursesCompleted: result.coursesCompleted.length ? result.coursesCompleted : prev.coursesCompleted,
      booksRead: result.booksRead.length ? result.booksRead : prev.booksRead,
      assignmentsFinished: result.assignmentsFinished.length ? result.assignmentsFinished : prev.assignmentsFinished,
      examsTaken: result.examsTaken.length ? result.examsTaken : prev.examsTaken,
      hoursStudied: result.hoursStudied > 0 ? result.hoursStudied : prev.hoursStudied,
      skillScoreChanges: result.skillScoreChanges.length ? result.skillScoreChanges : prev.skillScoreChanges,
      avgExamScore: result.avgExamScore,
      totalSkillPointsGained: result.totalSkillPointsGained,
      mostImprovedSkill: result.mostImprovedSkill || prev.mostImprovedSkill,
      leastImprovedSkill: result.leastImprovedSkill || prev.leastImprovedSkill,
      biggestWin: result.biggestWin || prev.biggestWin,
      biggestWeakness: result.biggestWeakness || prev.biggestWeakness,
      recommendedFocus: result.recommendedFocus || prev.recommendedFocus,
    }))
    setPopulated(true)
  }

  // Derived stats from current form state (for the stats bar)
  const statCounts = {
    courses: d.coursesCompleted.filter(Boolean).length,
    books: d.booksRead.filter(Boolean).length,
    assignments: d.assignmentsFinished.filter(Boolean).length,
    exams: d.examsTaken.filter(Boolean).length,
    skillsWithGrowth: d.skillScoreChanges.length,
  }

  const ListInput = ({ field, label, icon, placeholder }: {
    field: keyof FormData; label: string; icon: React.ReactNode; placeholder: string
  }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {(d[field] as string[]).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 5 }}>
            <Input value={item} onChange={e => setList(field, i, e.target.value)} placeholder={placeholder} />
            <button type="button" onClick={() => removeItem(field, i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0 4px', fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => addItem(field)} style={{
          background: 'none', border: '1px dashed var(--border)', borderRadius: 7,
          padding: '5px 10px', fontSize: 11, color: 'var(--muted-foreground)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content',
        }}>
          <Plus size={10} /> Add
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Section 1: Month Setup ── */}
      <FormSection title="Month Setup" icon={<CalendarDays size={14} />} color="#1C1917">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr', gap: '0 14px' }}>
          <FormField label="Month">
            <select value={d.monthNumber} onChange={e => set('monthNumber', Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', outline: 'none' }}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Year">
            <Input type="number" value={d.year} onChange={e => set('year', Number(e.target.value))} />
          </FormField>
          <FormField label="MBA Month Name (optional)">
            <Input value={d.mbaMonthName ?? ''} onChange={e => set('mbaMonthName', e.target.value)} placeholder="e.g. Business Foundations" />
          </FormField>
          <FormField label={`Overall Rating: ${'★'.repeat(d.overallRating)}${'☆'.repeat(5 - d.overallRating)}`}>
            <input type="range" min={1} max={5} value={d.overallRating}
              onChange={e => set('overallRating', Number(e.target.value) as 1|2|3|4|5)}
              style={{ width: '100%', accentColor: '#F59E0B', marginTop: 8 }} />
          </FormField>
        </div>
      </FormSection>

      {/* ── Section 2: Auto-Populate ── */}
      <FormSection title="Auto-Populate from Activity" icon={<Sparkles size={14} />} color="#7E22CE" bg="#FDF4FF" border="#E9D5FF">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.5 }}>
              Pulls all completed courses, books, graded assignments, exams, weekly study hours, and skill evidence for{' '}
              <strong>{MONTH_NAMES[d.monthNumber - 1]} {d.year}</strong>.
            </p>
            <div style={{ fontSize: 11.5, color: '#7E22CE' }}>
              Change month/year above, then click Auto-Populate. You can edit all fields after.
            </div>
          </div>
          <Button type="button" onClick={handleAutoPopulate} style={{ flexShrink: 0 }}>
            <Sparkles size={13} /> {populated ? 'Re-Populate' : 'Auto-Populate'}
          </Button>
        </div>

        {/* Stats bar — shown after populate */}
        {populated && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, padding: '12px 14px', background: 'var(--card)', borderRadius: 10, border: '1px solid #E9D5FF' }}>
            <StatPill icon={<BookOpen size={11} />} label="Courses" value={statCounts.courses} color="#7E22CE" />
            <StatPill icon={<Library size={11} />} label="Books" value={statCounts.books} color="#0891B2" />
            <StatPill icon={<ClipboardList size={11} />} label="Assignments" value={statCounts.assignments} color="#15803D" />
            <StatPill icon={<GraduationCap size={11} />} label="Exams" value={statCounts.exams} color="#DC2626" />
            <StatPill icon={<Clock size={11} />} label="Hours" value={`${d.hoursStudied}h`} color="#1D4ED8" />
            {(d.avgExamScore ?? 0) > 0 && <StatPill icon={<BarChart2 size={11} />} label="Avg Exam" value={`${d.avgExamScore}%`} color="#92400E" />}
            {(d.totalSkillPointsGained ?? 0) > 0 && <StatPill icon={<TrendingUp size={11} />} label="Skill pts" value={`+${d.totalSkillPointsGained}`} color="#15803D" />}
          </div>
        )}
      </FormSection>

      {/* ── Section 3: Learning Activity ── */}
      <FormSection title="Learning Activity" icon={<BookOpen size={14} />} color="#1D4ED8">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListInput field="coursesCompleted" label="Courses Completed" icon={<BookOpen size={12} style={{ color: '#7E22CE' }} />} placeholder="Course name…" />
          <ListInput field="booksRead" label="Books Completed" icon={<Library size={12} style={{ color: '#0891B2' }} />} placeholder="Book title…" />
          <ListInput field="assignmentsFinished" label="Assignments Graded" icon={<ClipboardList size={12} style={{ color: '#15803D' }} />} placeholder="Assignment title…" />
          <ListInput field="examsTaken" label="Exams Taken" icon={<GraduationCap size={12} style={{ color: '#DC2626' }} />} placeholder="Exam name (score%)…" />
          <ListInput field="topicsCompleted" label="Knowledge Topics Completed" icon={<Star size={12} style={{ color: '#F59E0B' }} />} placeholder="Topic name…" />
          <div>
            <FormField label={`Total Study Hours: ${d.hoursStudied}h`}>
              <input type="range" min={0} max={200} step={0.5} value={d.hoursStudied}
                onChange={e => set('hoursStudied', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1D4ED8', marginTop: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
                <span>0h</span><span>200h</span>
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* ── Section 4: Skill Growth ── */}
      <FormSection title="Skill Growth This Month" icon={<TrendingUp size={14} />} color="#15803D">
        {d.skillScoreChanges.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)' }}>
            No skill evidence recorded for this month. Run Auto-Populate to check, or add courses/exams/assignments to earn skill points.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.skillScoreChanges.map(sc => (
              <div key={sc.category} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{sc.category}</span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{sc.scoreAtStart} → {sc.scoreAtEnd}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D', background: '#F0FDF4', padding: '2px 8px', borderRadius: 6 }}>+{sc.delta} pts</span>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* ── Section 5: Performance Summary ── */}
      <FormSection title="Monthly Performance Summary" icon={<BarChart2 size={14} />} color="#92400E" bg="#FEF9F0" border="#FDE68A">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <FormField label="⚡ Biggest Win">
            <Input value={d.biggestWin ?? ''} onChange={e => set('biggestWin', e.target.value)} placeholder="Your biggest achievement this month…" />
          </FormField>
          <FormField label="⚠️ Biggest Weakness / Gap">
            <Input value={d.biggestWeakness ?? ''} onChange={e => set('biggestWeakness', e.target.value)} placeholder="Where did you struggle or fall short?…" />
          </FormField>
          <FormField label="⬆ Most Improved Skill">
            <Input value={d.mostImprovedSkill ?? ''} onChange={e => set('mostImprovedSkill', e.target.value)} placeholder="e.g. Finance (auto-calculated)" />
          </FormField>
          <FormField label="⬇ Least Improved Skill">
            <Input value={d.leastImprovedSkill ?? ''} onChange={e => set('leastImprovedSkill', e.target.value)} placeholder="e.g. Analytics (auto-calculated)" />
          </FormField>
        </div>
        <FormField label="🎯 Recommended Focus Next Month">
          <Textarea value={d.recommendedFocus ?? ''} onChange={e => set('recommendedFocus', e.target.value)} rows={2}
            placeholder="What should you prioritise next month based on this data?…" />
        </FormField>
      </FormSection>

      {/* ── Section 6: Insights & CoffeePlace ── */}
      <FormSection title="Insights & CoffeePlace" icon={<Coffee size={14} />} color="#92400E">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <ListInput field="keyLessons" label="Key Lessons This Month" icon={<Star size={12} style={{ color: '#F59E0B' }} />} placeholder="A lesson that will stick…" />
          <ListInput field="coffeeImprovements" label="CoffeePlace Improvements" icon={<Coffee size={12} style={{ color: '#92400E' }} />} placeholder="What you implemented at CoffeePlace…" />
        </div>
        <FormField label="Monthly Reflection Notes">
          <Textarea value={d.notes} onChange={e => set('notes', e.target.value)} rows={3}
            placeholder="Context, commitments, what this month meant for the business…" />
        </FormField>
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={() => onSave(d)}>{isEdit ? 'Save Changes' : 'Save Monthly Review'}</Button>
      </div>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function FormSection({ title, icon, color, bg, border, children }: {
  title: string; icon: React.ReactNode; color: string; bg?: string; border?: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: bg ?? 'var(--secondary)', border: `1px solid ${border ?? 'var(--border)'}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--secondary)', borderRadius: 8, fontSize: 12 }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
    </div>
  )
}
