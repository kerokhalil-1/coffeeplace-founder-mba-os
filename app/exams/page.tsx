'use client'
import { useState, useMemo } from 'react'
import { Play, CheckCircle2, XCircle, Clock, Award, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_EXAMS } from '@/lib/seed-exams'
import { Exam, ExamAttempt, ExamQuestion, RubricCriterion, SkillScore } from '@/lib/types'
import { awardExamPass } from '@/lib/skillTracker'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { generateId, formatDate } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 900, margin: '0 auto' }

type Mode = 'list' | { exam: Exam } | { review: ExamAttempt; exam: Exam }

// ─── Score helpers ────────────────────────────────────────────────────────────

/** Points earned from rubric self-assessment for one question */
function calcRubricPts(q: ExamQuestion, scores: Record<string, number>): number {
  if (!q.rubricCriteria?.length) return 0
  return q.rubricCriteria.reduce((total, c) => {
    const s = scores[c.id] ?? 0
    return total + Math.round((s / 5) * c.maxPoints)
  }, 0)
}

/** Recalculate attempt score from MCQ results + rubric scores */
function recalcScore(
  exam: Exam,
  answers: Record<string, string>,
  rubricScores: Record<string, Record<string, number>>,
): { score: number; passed: boolean } {
  const totalPts = exam.questions.reduce((s, q) => s + q.points, 0)
  let earned = 0
  exam.questions.forEach(q => {
    if (q.type === 'mcq') {
      if (answers[q.id] === q.correctAnswer) earned += q.points
    } else {
      earned += calcRubricPts(q, rubricScores[q.id] ?? {})
    }
  })
  const score = Math.round((earned / totalPts) * 100)
  return { score, passed: score >= exam.passingScore }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [exams] = useFirestore<Exam[]>(STORAGE_KEYS.EXAMS, SEED_EXAMS)
  const [attempts, setAttempts] = useFirestore<ExamAttempt[]>(STORAGE_KEYS.EXAM_ATTEMPTS, [])
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('list')

  const examAttemptMap = useMemo(() => {
    const map: Record<string, ExamAttempt[]> = {}
    attempts.forEach(a => { if (!map[a.examId]) map[a.examId] = []; map[a.examId].push(a) })
    return map
  }, [attempts])

  // Called when ExamRunner completes — save attempt with MCQ-only score (rubric pending)
  const handleComplete = (attempt: Omit<ExamAttempt, 'id'>) => {
    const full: ExamAttempt = { ...attempt, id: generateId(), rubricScores: {}, reflectionNotes: {}, rubricCompleted: false }
    setAttempts(prev => [...prev, full])
    toast.info('Exam submitted — complete rubric below to see your final score')
    setMode({ review: full, exam: (mode as { exam: Exam }).exam })
  }

  // Called when user saves rubric self-assessment in ExamReview
  const handleRubricSave = (updatedAttempt: ExamAttempt) => {
    setAttempts(prev => prev.map(a => a.id === updatedAttempt.id ? updatedAttempt : a))
    if (!updatedAttempt.passed) toast.info(`Assessment saved — ${updatedAttempt.score}% · Keep studying!`)
    // Award skill evidence now that rubric is complete — duplicate prevention handles re-saves
    if (updatedAttempt.passed) {
      const updated = awardExamPass(skills, updatedAttempt.id, updatedAttempt.examTitle, updatedAttempt.category)
      if (updated) { setSkills(updated); toast.success(`Exam passed! +10 ${updatedAttempt.category} skill points`) }
    }
  }

  if (typeof mode === 'object' && 'exam' in mode && !('review' in mode)) {
    return <ExamRunner exam={mode.exam} onComplete={handleComplete} onExit={() => setMode('list')} />
  }
  if (typeof mode === 'object' && 'review' in mode) {
    return (
      <ExamReview
        attempt={mode.review}
        exam={mode.exam}
        onBack={() => setMode('list')}
        onRubricSave={handleRubricSave}
      />
    )
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="MBA Exam System"
        description="Test your understanding with real questions — MCQ auto-graded, practical questions self-assessed with rubric"
      />

      {attempts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Exams Taken', value: attempts.length },
            { label: 'Passed', value: attempts.filter(a => a.passed).length },
            { label: 'Avg Score', value: `${Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)}%` },
            { label: 'Best Score', value: `${Math.max(...attempts.map(a => a.score))}%` },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {exams.map(exam => {
          const examAttempts = examAttemptMap[exam.id] || []
          const bestAttempt = examAttempts.sort((a, b) => b.score - a.score)[0]
          const passed = bestAttempt?.passed
          const totalPoints = exam.questions.reduce((s, q) => s + q.points, 0)
          const lastAttempt = examAttempts.sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
          const pendingRubric = lastAttempt && !lastAttempt.rubricCompleted

          return (
            <div key={exam.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{exam.title}</h3>
                    {passed && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#F0FDF4', color: '#15803D', fontWeight: 600 }}>✓ PASSED</span>}
                    {pendingRubric && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>⏳ RUBRIC PENDING</span>}
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{exam.category}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{exam.description}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted-foreground)' }}>
                    <span>📝 {exam.questions.length} questions</span>
                    <span>🎯 {totalPoints} pts</span>
                    <span>✅ Pass: {exam.passingScore}%</span>
                    {exam.timeLimit && <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{exam.timeLimit} min</span>}
                    {examAttempts.length > 0 && <span>🔄 {examAttempts.length} attempt{examAttempts.length > 1 ? 's' : ''}</span>}
                    {bestAttempt && <span>🏆 Best: {bestAttempt.score}%</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <Button onClick={() => setMode({ exam })}>
                    <Play size={13} /> {examAttempts.length > 0 ? 'Retake' : 'Start Exam'}
                  </Button>
                  {examAttempts.length > 0 && (
                    <Button variant="secondary" onClick={() => setMode({ review: lastAttempt, exam })}>
                      {pendingRubric ? '📝 Complete Rubric' : 'View Last'}
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {(['mcq', 'practical', 'case'] as const).map(type => {
                  const count = exam.questions.filter(q => q.type === type).length
                  if (!count) return null
                  return (
                    <span key={type} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
                      {type === 'mcq' ? '🔘' : type === 'practical' ? '✏️' : '📋'} {count} {type}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exam Runner ──────────────────────────────────────────────────────────────

function ExamRunner({ exam, onComplete, onExit }: {
  exam: Exam
  onComplete: (a: Omit<ExamAttempt, 'id'>) => void
  onExit: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const startTime = useMemo(() => Date.now(), [])

  const q = exam.questions[currentQ]
  const totalPoints = exam.questions.reduce((s, q) => s + q.points, 0)

  const handleSubmit = () => {
    let earned = 0
    const weak: string[] = []
    const strong: string[] = []

    exam.questions.forEach(q => {
      if (q.type === 'mcq') {
        if (answers[q.id] === q.correctAnswer) {
          earned += q.points
          strong.push(q.question.slice(0, 40))
        } else {
          weak.push(q.question.slice(0, 40))
        }
        // practical / case: 0 pts at submit — rubric phase determines actual score
      }
    })

    const score = Math.round((earned / totalPoints) * 100)
    onComplete({
      examId: exam.id,
      examTitle: exam.title,
      category: exam.category,
      answers,
      score,
      passed: false, // will be recalculated after rubric
      weakAreas: weak,
      strongAreas: strong,
      timeTaken: Math.round((Date.now() - startTime) / 60000),
      completedAt: new Date().toISOString(),
    })
  }

  const answered = Object.keys(answers).length
  const progress = Math.round((answered / exam.questions.length) * 100)

  return (
    <div style={{ ...PAGE, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>{exam.title}</h1>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{answered}/{exam.questions.length} answered</div>
        </div>
        <Button variant="ghost" onClick={onExit}>← Exit</Button>
      </div>

      <div style={{ height: 4, background: 'var(--secondary)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {exam.questions.map((q, i) => (
          <button key={q.id} onClick={() => setCurrentQ(i)} style={{
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)',
            background: i === currentQ ? 'var(--primary)' : answers[q.id] ? '#F0FDF4' : 'var(--card)',
            color: i === currentQ ? 'white' : answers[q.id] ? '#15803D' : 'var(--muted-foreground)',
            cursor: 'pointer', fontWeight: 600, fontSize: 12,
          }}>{i + 1}</button>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
            Q{currentQ + 1} of {exam.questions.length}
          </span>
          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: q.type === 'mcq' ? '#EFF6FF' : q.type === 'practical' ? '#FEF3C7' : '#FDF4FF', color: q.type === 'mcq' ? '#1D4ED8' : q.type === 'practical' ? '#92400E' : '#7E22CE' }}>
            {q.type.toUpperCase()} · {q.points} pts
          </span>
          {q.type !== 'mcq' && (
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: '#F0FDF4', color: '#15803D' }}>
              Self-assessed with rubric after submit
            </span>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{q.question}</div>

        {q.type === 'mcq' && q.options ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                borderRadius: 8, border: `1px solid ${answers[q.id] === opt ? 'var(--primary)' : 'var(--border)'}`,
                background: answers[q.id] === opt ? 'var(--secondary)' : 'transparent',
                cursor: 'pointer', fontSize: 13.5, lineHeight: 1.5,
              }}>
                <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt}
                  onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  style={{ marginTop: 3, accentColor: 'var(--primary)' }} />
                {opt}
              </label>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8 }}>
              Write your full answer below. You will self-assess this answer against rubric criteria after submitting.
            </div>
            <Textarea
              value={answers[q.id] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              rows={9}
              placeholder="Write your detailed answer here…"
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button variant="secondary" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
          ← Previous
        </Button>
        {currentQ < exam.questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(currentQ + 1)}>Next →</Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Award size={14} /> Submit Exam
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Rubric Panel (per practical / case question) ─────────────────────────────

const SCORE_LABELS: Record<number, string> = {
  0: 'No attempt',
  1: 'Very weak',
  2: 'Partial',
  3: 'Adequate',
  4: 'Good',
  5: 'Excellent',
}

function RubricPanel({ question, answer, rubricScores, reflectionNote, onChange, onReflectionChange, saved }: {
  question: ExamQuestion
  answer: string
  rubricScores: Record<string, number>
  reflectionNote: string
  onChange: (criterionId: string, score: number) => void
  onReflectionChange: (note: string) => void
  saved: boolean
}) {
  const [modelOpen, setModelOpen] = useState(false)
  const [answerOpen, setAnswerOpen] = useState(true)
  const criteria = question.rubricCriteria ?? []
  const earnedPts = calcRubricPts(question, rubricScores)

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Question header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: question.type === 'practical' ? '#FFFBF0' : '#FDF4FF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: question.type === 'practical' ? '#FEF3C7' : '#F3E8FF', color: question.type === 'practical' ? '#92400E' : '#7E22CE', fontWeight: 600 }}>
            {question.type === 'practical' ? '✏️ PRACTICAL' : '📋 CASE STUDY'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{question.points} pts total</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: earnedPts > 0 ? '#15803D' : 'var(--muted-foreground)', marginLeft: 'auto' }}>
            Self-assessed: {earnedPts} / {question.points} pts
          </span>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{question.question}</div>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Your answer (collapsible) */}
        <div>
          <button onClick={() => setAnswerOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', padding: 0, marginBottom: 6 }}>
            {answerOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            YOUR ANSWER
          </button>
          {answerOpen && (
            <div style={{ background: 'var(--secondary)', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
              {answer || <em style={{ color: 'var(--muted-foreground)' }}>No answer written</em>}
            </div>
          )}
        </div>

        {/* Model answer (collapsible — revealed on demand) */}
        {question.correctAnswer && (
          <div>
            <button onClick={() => setModelOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#92400E', padding: 0, marginBottom: 6 }}>
              {modelOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              ☕ MODEL ANSWER {!modelOpen && '(click to reveal)'}
            </button>
            {modelOpen && (
              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#78350F', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {question.correctAnswer}
                {question.explanation && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #FDE68A', fontSize: 12, color: '#92400E', fontStyle: 'italic' }}>
                    💡 {question.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rubric criteria */}
        {criteria.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Self-Assessment Rubric
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criteria.map(c => {
                const score = rubricScores[c.id] ?? 0
                return (
                  <div key={c.id} style={{ background: 'var(--secondary)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.4 }}>{c.description}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', flexShrink: 0, marginLeft: 12 }}>
                        {Math.round((score / 5) * c.maxPoints)} / {c.maxPoints} pts
                      </div>
                    </div>
                    {/* 0–5 score buttons */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                      {[0, 1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => !saved && onChange(c.id, val)}
                          disabled={saved}
                          style={{
                            width: 34, height: 34, borderRadius: 7,
                            border: `2px solid ${score === val ? 'var(--primary)' : 'var(--border)'}`,
                            background: score === val ? 'var(--primary)' : 'var(--card)',
                            color: score === val ? 'white' : 'var(--foreground)',
                            cursor: saved ? 'default' : 'pointer',
                            fontWeight: 700, fontSize: 13,
                            transition: 'all 0.15s',
                          }}
                        >{val}</button>
                      ))}
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 4 }}>
                        {SCORE_LABELS[score]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reflection note */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Reflection Notes
          </div>
          <Textarea
            value={reflectionNote}
            onChange={e => !saved && onReflectionChange(e.target.value)}
            rows={3}
            placeholder="What did you miss? What would you do differently? What concept do you need to revisit?"
            disabled={saved}
            style={{ opacity: saved ? 0.7 : 1 }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Exam Review ──────────────────────────────────────────────────────────────

function ExamReview({ attempt, exam, onBack, onRubricSave }: {
  attempt: ExamAttempt
  exam: Exam
  onBack: () => void
  onRubricSave: (updated: ExamAttempt) => void
}) {
  const [rubricScores, setRubricScores] = useState<Record<string, Record<string, number>>>(attempt.rubricScores ?? {})
  const [reflectionNotes, setReflectionNotes] = useState<Record<string, string>>(attempt.reflectionNotes ?? {})
  const [saved, setSaved] = useState(attempt.rubricCompleted ?? false)

  const nonMcqQuestions = exam.questions.filter(q => q.type !== 'mcq')
  const hasPractical = nonMcqQuestions.length > 0

  // Live-calculate current total score as user adjusts rubric
  const { score: liveScore, passed: livePassed } = useMemo(
    () => recalcScore(exam, attempt.answers, rubricScores),
    [exam, attempt.answers, rubricScores]
  )

  // MCQ-only score (what was stored at submit time)
  const mcqScore = attempt.rubricCompleted ? null : attempt.score

  const handleCriterionChange = (questionId: string, criterionId: string, score: number) => {
    setRubricScores(prev => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? {}), [criterionId]: score },
    }))
  }

  const handleReflectionChange = (questionId: string, note: string) => {
    setReflectionNotes(prev => ({ ...prev, [questionId]: note }))
  }

  const handleSaveAssessment = () => {
    const updatedAttempt: ExamAttempt = {
      ...attempt,
      score: liveScore,
      passed: livePassed,
      rubricScores,
      reflectionNotes,
      rubricCompleted: true,
    }
    setSaved(true)
    onRubricSave(updatedAttempt)
  }

  const displayScore = saved ? liveScore : (hasPractical ? liveScore : attempt.score)
  const displayPassed = saved ? livePassed : (hasPractical ? livePassed : attempt.passed)

  return (
    <div style={{ ...PAGE, maxWidth: 740 }}>
      {/* Score card */}
      <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{displayPassed ? '🎉' : hasPractical && !saved ? '✏️' : '📚'}</div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: displayPassed ? '#15803D' : hasPractical && !saved ? '#92400E' : '#DC2626' }}>
          {displayScore}%
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
          {displayPassed ? 'Passed!' : hasPractical && !saved ? 'MCQ portion complete — complete rubric below' : 'Not yet — keep studying'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          Passing score: {exam.passingScore}%
          {attempt.timeTaken ? ` · Time: ${attempt.timeTaken} min` : ''}
          {hasPractical && !saved && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#92400E', background: '#FEF3C7', display: 'inline-block', padding: '4px 10px', borderRadius: 6 }}>
              MCQ-only score shown · self-assess practicals below to finalise
            </div>
          )}
        </div>
      </div>

      {/* MCQ strong / weak areas */}
      {(attempt.strongAreas.length > 0 || attempt.weakAreas.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {attempt.strongAreas.length > 0 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#15803D', marginBottom: 8 }}>✅ Strong (MCQ)</div>
              {attempt.strongAreas.map((a, i) => <div key={i} style={{ fontSize: 12, color: '#166534', padding: '2px 0' }}>• {a}</div>)}
            </div>
          )}
          {attempt.weakAreas.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>⚠️ Review These (MCQ)</div>
              {attempt.weakAreas.map((a, i) => <div key={i} style={{ fontSize: 12, color: '#991B1B', padding: '2px 0' }}>• {a}</div>)}
            </div>
          )}
        </div>
      )}

      {/* MCQ question-by-question review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {exam.questions.filter(q => q.type === 'mcq').map(q => {
          const userAnswer = attempt.answers[q.id]
          const correct = userAnswer === q.correctAnswer
          return (
            <div key={q.id} style={{ background: 'var(--card)', border: `1px solid ${correct ? '#BBF7D0' : '#FECACA'}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                {correct ? <CheckCircle2 size={16} style={{ color: '#15803D', flexShrink: 0 }} /> : <XCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />}
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{q.question}</span>
              </div>
              {!correct && (
                <div style={{ fontSize: 12.5, paddingLeft: 26 }}>
                  <div style={{ color: '#DC2626', marginBottom: 3 }}>Your answer: {userAnswer || 'Not answered'}</div>
                  <div style={{ color: '#15803D', marginBottom: 6 }}>Correct: {q.correctAnswer}</div>
                  {q.explanation && <div style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>{q.explanation}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Practical / Case rubric panels */}
      {hasPractical && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            ✏️ Practical & Case Self-Assessment
            {saved && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#F0FDF4', color: '#15803D', fontWeight: 600 }}>✓ SAVED</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 16, lineHeight: 1.5 }}>
            Compare your written answer to the model answer. Rate yourself 0–5 on each criterion.
            {!saved && ' Click <strong>Save Assessment</strong> when done — this finalises your score.'}
          </div>

          {nonMcqQuestions.map(q => (
            <RubricPanel
              key={q.id}
              question={q}
              answer={attempt.answers[q.id] ?? ''}
              rubricScores={rubricScores[q.id] ?? {}}
              reflectionNote={reflectionNotes[q.id] ?? ''}
              onChange={(cid, score) => handleCriterionChange(q.id, cid, score)}
              onReflectionChange={note => handleReflectionChange(q.id, note)}
              saved={saved}
            />
          ))}

          {/* Running total */}
          <div style={{ background: 'var(--secondary)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Current Total Score</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: livePassed ? '#15803D' : '#DC2626' }}>
              {liveScore}% {livePassed ? '✓ Pass' : `· need ${exam.passingScore}%`}
            </span>
          </div>

          {!saved ? (
            <Button onClick={handleSaveAssessment} style={{ width: '100%' }}>
              <Award size={14} /> Save Assessment & Finalise Score
            </Button>
          ) : (
            <div style={{ textAlign: 'center', fontSize: 13, color: '#15803D', padding: '12px', background: '#F0FDF4', borderRadius: 8 }}>
              ✓ Assessment saved · Final score: {liveScore}% · {livePassed ? 'PASSED' : 'Not passed — retake when ready'}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="secondary" onClick={onBack}>← All Exams</Button>
      </div>
    </div>
  )
}
