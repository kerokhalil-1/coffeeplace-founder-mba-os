'use client'
import { useState, useMemo } from 'react'
import { Zap, Target, TrendingUp, Coffee, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS } from '@/lib/storage'
import { SkillScore, ReadinessAssessment, ReadinessDimension, CourseCategory, ALL_MBA_CATEGORIES } from '@/lib/types'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { generateId, weightedScore, calculateFounderScore, FOUNDER_WEIGHTS, LAUNCH_WEIGHTS } from '@/lib/utils'

const PAGE = { padding: '32px 36px', maxWidth: 900, margin: '0 auto' }

// calculateFounderScore, weightedScore, FOUNDER_WEIGHTS, LAUNCH_WEIGHTS — from lib/utils.ts

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

function RadarBar({ category, score, weight, icon }: { category: string; score: number; weight: number; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{ width: 20, textAlign: 'center', fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12.5, width: 160, flexShrink: 0 }}>{category}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--secondary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(score), width: 32, textAlign: 'right' }}>{score}</span>
      <span style={{ fontSize: 10, color: 'var(--muted-foreground)', width: 32, textAlign: 'right' }}>{weight}%</span>
    </div>
  )
}

function ScoreDial({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const offset = arc - (score / 100) * arc
  const color = scoreColor(score)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size * 0.85} style={{ overflow: 'visible' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={10}
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset + circ * 0.125}
          strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x={size/2} y={size/2 - 2} textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.22} fontWeight="800" fill={color}>{score}</text>
        <text x={size/2} y={size/2 + size*0.16} textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.1} fill="var(--muted-foreground)">/ 100</text>
      </svg>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)' }}>{label}</div>
      <div style={{ fontSize: 11, color: scoreColor(score), fontWeight: 500 }}>
        {score >= 80 ? 'Ready' : score >= 60 ? 'Near Ready' : score >= 40 ? 'Developing' : score >= 20 ? 'Early Stage' : 'Not Started'}
      </div>
    </div>
  )
}

export default function ReadinessPage() {
  const [skills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const [assessments, setAssessments] = useFirestore<ReadinessAssessment[]>(STORAGE_KEYS.READINESS, [])

  const founderScore = useMemo(() => calculateFounderScore(skills), [skills])
  const launchScore = useMemo(() => weightedScore(skills, LAUNCH_WEIGHTS), [skills])

  const sortedByScore = useMemo(() => [...skills].sort((a,b) => b.currentScore - a.currentScore), [skills])
  const strengths = sortedByScore.filter(s => s.currentScore >= 60).slice(0, 4)
  const weaknesses = sortedByScore.filter(s => s.currentScore < 40).slice(-4).reverse()

  const recommendations = useMemo(() => {
    const recs: string[] = []
    weaknesses.forEach(w => {
      if (w.category === 'Finance') recs.push('Take a financial modeling course and build CoffeePlace P&L from scratch')
      else if (w.category === 'Operations') recs.push('Write 5 core SOPs this week — start with opening and closing procedures')
      else if (w.category === 'Marketing') recs.push('Define your ICP and launch your first structured marketing campaign')
      else if (w.category === 'Leadership') recs.push('Read The Hard Thing About Hard Things and write your leadership principles')
      else if (w.category === 'Strategy') recs.push("Complete Porter's Five Forces analysis for your local coffee market")
      else recs.push(`Focus on ${w.category} — complete at least one course or assignment this week`)
    })
    return recs.slice(0, 4)
  }, [weaknesses])

  const saveSnapshot = () => {
    const now = new Date().toISOString()
    const assessment: ReadinessAssessment = {
      id: generateId(),
      founderReadinessScore: founderScore,
      launchReadinessScore: launchScore,
      dimensions: skills.map(s => ({
        category: s.category,
        score: s.currentScore,
        weight: FOUNDER_WEIGHTS[s.category] ?? 0,
        evidence: `${s.evidence.length} evidence items`,
      })),
      strengths: strengths.map(s => `${s.category}: ${s.currentScore}/100`),
      weaknesses: weaknesses.map(s => `${s.category}: ${s.currentScore}/100`),
      recommendations,
      nextMilestone: founderScore < 40
        ? 'Complete Month 1 MBA curriculum and achieve 40+ in Finance & Operations'
        : founderScore < 60
        ? 'Complete Month 3 MBA curriculum and achieve 60+ in Marketing & Strategy'
        : 'Prepare for multi-branch expansion — target 75+ across all dimensions',
      createdAt: now,
    }
    setAssessments(prev => [...prev, assessment])
  }

  const lastSnapshot = [...assessments].sort((a,b) => b.createdAt.localeCompare(a.createdAt))[0]

  return (
    <div style={PAGE}>
      <PageHeader
        title="Founder Readiness"
        description="Your honest assessment of readiness to run and scale CoffeePlace"
        action={<Button onClick={saveSnapshot}><Zap size={14} /> Save Snapshot</Button>}
      />

      {/* Dual Score */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 24 }}>
          <ScoreDial score={founderScore} label="Founder Readiness Score" size={140} />
          <div style={{ width: 1, height: 120, background: 'var(--border)' }} />
          <ScoreDial score={launchScore} label="CoffeePlace Launch Readiness" size={140} />
        </div>

        <div style={{ padding: '14px 16px', background: 'var(--secondary)', borderRadius: 10, fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600 }}>Next Milestone: </span>
          {lastSnapshot?.nextMilestone ||
            (founderScore < 40
              ? 'Complete Month 1 MBA curriculum and achieve 40+ in Finance & Operations'
              : founderScore < 60
              ? 'Complete Month 3 MBA curriculum and achieve 60+ in Marketing & Strategy'
              : 'Prepare for multi-branch expansion — target 75+ across all dimensions')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Founder Score breakdown */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>🎯 Founder Score Breakdown</div>
          {skills.filter(s => FOUNDER_WEIGHTS[s.category]).sort((a,b) => (FOUNDER_WEIGHTS[b.category]??0)-(FOUNDER_WEIGHTS[a.category]??0)).map(s => (
            <RadarBar key={s.id} category={s.category} score={s.currentScore} weight={FOUNDER_WEIGHTS[s.category]??0} icon={CAT_ICONS[s.category]||'📌'} />
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Launch Score */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>☕ Launch Readiness Breakdown</div>
            {skills.filter(s => LAUNCH_WEIGHTS[s.category]).sort((a,b) => (LAUNCH_WEIGHTS[b.category]??0)-(LAUNCH_WEIGHTS[a.category]??0)).map(s => (
              <RadarBar key={s.id} category={s.category} score={s.currentScore} weight={LAUNCH_WEIGHTS[s.category]??0} icon={CAT_ICONS[s.category]||'📌'} />
            ))}
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#15803D', marginBottom: 10 }}>✅ Your Strengths</div>
              {strengths.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span>{CAT_ICONS[s.category]} {s.category}</span>
                  <span style={{ fontWeight: 600, color: '#15803D' }}>{s.currentScore}/100</span>
                </div>
              ))}
            </div>
          )}

          {/* Focus Areas */}
          {weaknesses.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 10 }}>⚠️ Focus Areas</div>
              {weaknesses.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span>{CAT_ICONS[s.category]} {s.category}</span>
                  <span style={{ fontWeight: 600, color: '#DC2626' }}>{s.currentScore}/100</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>🚀 Recommended Next Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
              <span style={{ fontSize: 13, lineHeight: 1.5 }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot history */}
      {assessments.length > 0 && (
        <div style={{ marginTop: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>📈 Readiness History</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[...assessments].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).map(a => (
              <div key={a.id} style={{ background: 'var(--secondary)', borderRadius: 8, padding: '10px 14px', minWidth: 120 }}>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  {new Date(a.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(a.founderReadinessScore) }}>F: {a.founderReadinessScore}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(a.launchReadinessScore) }}>L: {a.launchReadinessScore}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
