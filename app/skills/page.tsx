'use client'
import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Plus, Edit3, Save, X, Award } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { SkillScore, SkillEvidence, CourseCategory, ALL_MBA_CATEGORIES } from '@/lib/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { generateId, calculateFounderScore } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const CAT_ICONS: Record<string, string> = {
  Finance:'💰', Accounting:'📊', Marketing:'📣', Branding:'✨', Operations:'⚙️',
  Leadership:'🎯', HR:'👥', Entrepreneurship:'🚀', Strategy:'♟️', Analytics:'📈',
  Negotiation:'🤝', Sales:'💼', 'Customer Experience':'⭐', Expansion:'🏗️',
}

function scoreColor(s: number) {
  if (s >= 75) return '#15803D'
  if (s >= 50) return '#1D4ED8'
  if (s >= 25) return '#D97706'
  return '#DC2626'
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Expert'
  if (s >= 60) return 'Proficient'
  if (s >= 40) return 'Developing'
  if (s >= 20) return 'Beginner'
  return 'Not Started'
}

function ScoreArc({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ * 0.75
  const color = scoreColor(score)
  return (
    <svg width={size} height={size * 0.8} style={{ overflow: 'visible' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--secondary)"
        strokeWidth={6} strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={circ * 0.125} strokeLinecap="round"
        transform={`rotate(135 ${size/2} ${size/2})`} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={6} strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={offset + circ * 0.125} strokeLinecap="round"
        transform={`rotate(135 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.2} fontWeight="700" fill={color}>{score}</text>
    </svg>
  )
}

export default function SkillsPage() {
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const [selectedSkill, setSelectedSkill] = useState<SkillScore | null>(null)
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false)
  const [manualScoreOpen, setManualScoreOpen] = useState(false)
  const toast = useToast()

  // Weighted Founder Score — shared formula from lib/utils.ts
  const founderScore = useMemo(() => calculateFounderScore(skills), [skills])

  const sorted = useMemo(() =>
    [...skills].sort((a, b) => b.currentScore - a.currentScore), [skills])

  const weakest = sorted.filter(s => s.currentScore < 40).slice(-3).reverse()
  const strongest = sorted.filter(s => s.currentScore >= 60).slice(0, 3)

  const addEvidence = (skillId: string, evidence: Omit<SkillEvidence, 'id'>) => {
    setSkills(prev => prev.map(s => {
      if (s.id !== skillId) return s
      const newEvidence = { ...evidence, id: generateId() }
      const newScore = Math.min(100, s.currentScore + evidence.pointsAdded)
      return {
        ...s,
        previousScore: s.currentScore,
        currentScore: newScore,
        evidence: [...s.evidence, newEvidence],
        lastUpdated: new Date().toISOString(),
      }
    }))
    setAddEvidenceOpen(false)
    toast.success(`Evidence added · +${evidence.pointsAdded} pts`)
  }

  const setManualScore = (skillId: string, score: number, target: number) => {
    setSkills(prev => prev.map(s => s.id !== skillId ? s : {
      ...s, previousScore: s.currentScore, currentScore: score, targetScore: target,
      lastUpdated: new Date().toISOString(),
    }))
    setManualScoreOpen(false)
    toast.success('Skill score updated')
  }

  return (
    <div style={PAGE}>
      <PageHeader
        title="Founder Skill Scorecard"
        description="Your honest MBA skills assessment — 0 to 100 across every discipline"
      />

      {/* Founder Score hero */}
      <div style={{
        background: 'var(--primary)', borderRadius: 14, padding: '24px 28px',
        marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24, color: 'white',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ScoreArc score={founderScore} size={100} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Score</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{scoreLabel(founderScore)}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 1.5 }}>
            Average across {skills.length} MBA disciplines. Complete courses, assignments, and exams to raise your scores.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {strongest.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Strongest</div>
                {strongest.map(s => (
                  <div key={s.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 6, marginBottom: 2 }}>
                    <span>{CAT_ICONS[s.category] || '📌'}</span> {s.category} ({s.currentScore})
                  </div>
                ))}
              </div>
            )}
            {weakest.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Focus Areas</div>
                {weakest.map(s => (
                  <div key={s.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 6, marginBottom: 2 }}>
                    <span>{CAT_ICONS[s.category] || '📌'}</span> {s.category} ({s.currentScore})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {sorted.map(skill => {
          const trend = skill.currentScore - skill.previousScore
          const pctToTarget = skill.targetScore > 0
            ? Math.round(skill.currentScore / skill.targetScore * 100) : 0
          return (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              style={{
                background: 'var(--card)', border: `1px solid ${selectedSkill?.id === skill.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{CAT_ICONS[skill.category] || '📌'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{skill.category}</div>
                  <div style={{ fontSize: 11, color: scoreColor(skill.currentScore), fontWeight: 500 }}>{scoreLabel(skill.currentScore)}</div>
                </div>
                <ScoreArc score={skill.currentScore} size={60} />
              </div>

              {/* Gap to target */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--muted-foreground)' }}>
                  <span>Progress to target ({skill.targetScore})</span>
                  <span>{Math.min(pctToTarget, 100)}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--secondary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pctToTarget, 100)}%`, height: '100%', background: scoreColor(skill.currentScore), borderRadius: 4, transition: 'width 0.4s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{skill.evidence.length} evidence items</span>
                {trend !== 0 && (
                  <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 2, color: trend > 0 ? '#15803D' : '#DC2626' }}>
                    {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trend > 0 ? '+' : ''}{trend}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <Modal open={!!selectedSkill} onClose={() => setSelectedSkill(null)}
          title={`${CAT_ICONS[selectedSkill.category]} ${selectedSkill.category}`} width={560}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <ScoreArc score={selectedSkill.currentScore} size={80} />
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Current</div>
              </div>
              <div style={{ fontSize: 24, color: 'var(--muted-foreground)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <ScoreArc score={selectedSkill.targetScore} size={80} />
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Target</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Button size="sm" onClick={() => setAddEvidenceOpen(true)}><Plus size={12} /> Add Evidence</Button>
                <Button size="sm" variant="secondary" onClick={() => setManualScoreOpen(true)}><Edit3 size={12} /> Set Score</Button>
              </div>
            </div>

            {/* Evidence List */}
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 10 }}>
              Evidence ({selectedSkill.evidence.length})
            </div>
            {selectedSkill.evidence.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                No evidence yet. Complete courses, assignments, or exams in this category to earn points.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                {[...selectedSkill.evidence].reverse().map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--secondary)', borderRadius: 7 }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{ev.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{ev.type} · {new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>+{ev.pointsAdded}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Evidence Modal */}
      {selectedSkill && (
        <Modal open={addEvidenceOpen} onClose={() => setAddEvidenceOpen(false)} title="Add Skill Evidence" width={440}>
          <AddEvidenceForm skillId={selectedSkill.id} onAdd={addEvidence} onCancel={() => setAddEvidenceOpen(false)} />
        </Modal>
      )}

      {/* Manual Score Modal */}
      {selectedSkill && (
        <Modal open={manualScoreOpen} onClose={() => setManualScoreOpen(false)} title="Set Score Manually" width={380}>
          <ManualScoreForm skill={selectedSkill} onSave={setManualScore} onCancel={() => setManualScoreOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

function AddEvidenceForm({ skillId, onAdd, onCancel }: {
  skillId: string
  onAdd: (id: string, e: Omit<SkillEvidence, 'id'>) => void
  onCancel: () => void
}) {
  const [desc, setDesc] = useState('')
  const [type, setType] = useState<SkillEvidence['type']>('manual')
  const [points, setPoints] = useState(5)
  return (
    <div>
      <FormField label="Description" required>
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Completed Financial Modeling course" />
      </FormField>
      <FormField label="Evidence Type">
        <Select value={type} onChange={e => setType(e.target.value as SkillEvidence['type'])}
          options={['course','assignment','exam','implementation','reading','manual'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }))} />
      </FormField>
      <FormField label={`Points to Add: +${points}`}>
        <input type="range" min={1} max={20} value={points} onChange={e => setPoints(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)' }}>
          <span>+1 (minor)</span><span>+10 (significant)</span><span>+20 (major)</span>
        </div>
      </FormField>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (desc) onAdd(skillId, { type, description: desc, pointsAdded: points, date: new Date().toISOString() }) }}>
          Add Evidence
        </Button>
      </div>
    </div>
  )
}

function ManualScoreForm({ skill, onSave, onCancel }: {
  skill: SkillScore; onSave: (id: string, s: number, t: number) => void; onCancel: () => void
}) {
  const [score, setScore] = useState(skill.currentScore)
  const [target, setTarget] = useState(skill.targetScore)
  return (
    <div>
      <FormField label={`Current Score: ${score}`}>
        <input type="range" min={0} max={100} value={score} onChange={e => setScore(Number(e.target.value))}
          style={{ width: '100%', accentColor: scoreColor(score) }} />
      </FormField>
      <FormField label={`Target Score: ${target}`}>
        <input type="range" min={score} max={100} value={target} onChange={e => setTarget(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
      </FormField>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(skill.id, score, target)}>Save Score</Button>
      </div>
    </div>
  )
}
