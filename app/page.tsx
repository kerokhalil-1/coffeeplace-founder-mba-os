'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Coffee, FileText, CalendarCheck, GraduationCap, Library, ClipboardList, BookMarked, Rocket, TrendingUp, CheckCircle2, Zap, Star } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/lib/storage'
import { SEED_MBA_MONTHS } from '@/lib/seed-data'
import { SEED_KNOWLEDGE, SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { SEED_CASE_STUDIES } from '@/lib/seed-case-studies'
import { SEED_BOOKS } from '@/lib/seed-books'
import { SEED_EXAMS } from '@/lib/seed-exams'
import { Course, MBAMonth, Note, CoffeeApplication, WeeklyReview, SkillScore, KnowledgeCategory, Book, Assignment, ExamAttempt, CaseStudy, Settings } from '@/lib/types'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate, truncate, calculateFounderScore } from '@/lib/utils'

const PAGE = { padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }

const CAT_ICONS: Record<string,string> = {
  Finance:'💰',Accounting:'📊',Marketing:'📣',Branding:'✨',Operations:'⚙️',
  Leadership:'🎯',HR:'👥',Entrepreneurship:'🚀',Strategy:'♟️',Analytics:'📈',
  Negotiation:'🤝',Sales:'💼','Customer Experience':'⭐',Expansion:'🏗️',
}

function scoreColor(s: number) {
  if (s >= 75) return '#15803D'
  if (s >= 50) return '#1D4ED8'
  if (s >= 25) return '#D97706'
  return '#DC2626'
}

export default function Dashboard() {
  const [courses] = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [months] = useFirestore<MBAMonth[]>(STORAGE_KEYS.MBA_MONTHS, SEED_MBA_MONTHS)
  const [notes] = useFirestore<Note[]>(STORAGE_KEYS.NOTES, [])
  const [apps] = useFirestore<CoffeeApplication[]>(STORAGE_KEYS.APPLICATIONS, [])
  const [reviews] = useFirestore<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, [])
  const [skills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const [knowledge] = useFirestore<KnowledgeCategory[]>(STORAGE_KEYS.KNOWLEDGE, SEED_KNOWLEDGE)
  const [books] = useFirestore<Book[]>(STORAGE_KEYS.BOOKS, SEED_BOOKS)
  const [caseStudies] = useFirestore<CaseStudy[]>(STORAGE_KEYS.CASE_STUDIES, SEED_CASE_STUDIES)
  const [assignments] = useFirestore<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
  const [attempts] = useFirestore<ExamAttempt[]>(STORAGE_KEYS.EXAM_ATTEMPTS, [])
  const [settings] = useFirestore<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

  // Weighted Founder Score — uses shared formula from lib/utils.ts
  const founderScore = useMemo(() => calculateFounderScore(skills), [skills])

  const mbaProgress = useMemo(() => {
    const total = months.reduce((s,m) => s+m.checklist.length, 0)
    const done = months.reduce((s,m) => s+m.checklist.filter(c=>c.completed).length, 0)
    return total ? Math.round(done/total*100) : 0
  }, [months])

  const knowledgePct = useMemo(() => {
    const allTopics = knowledge.flatMap(k=>k.topics)
    return allTopics.length ? Math.round(allTopics.filter(t=>t.completed).length/allTopics.length*100) : 0
  }, [knowledge])

  const examAvg = useMemo(() => attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.score,0)/attempts.length) : null, [attempts])

  const completedCourses = courses.filter(c=>c.status==='completed').length
  const completedBooks = books.filter(b=>b.status==='completed').length
  const completedAssignments = assignments.filter(a=>a.status==='graded').length
  const implementedApps = apps.filter(a=>a.status==='implemented').length

  const topSkills = [...skills].sort((a,b)=>b.currentScore-a.currentScore).slice(0,5)
  const weakSkills = [...skills].sort((a,b)=>a.currentScore-b.currentScore).slice(0,3)
  const lastReview = [...reviews].sort((a,b)=>b.weekStartDate.localeCompare(a.weekStartDate))[0]
  const recentCourses = [...courses].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3)
  const today = new Date()
  const hour = today.getHours()
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'

  return (
    <div style={PAGE}>
      <PageHeader
        title={`${greeting}, ${settings.founderName.split(' ')[0]} 👋`}
        description={`${today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · CoffeePlace Founder MBA OS`}
      />

      {/* Top Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:22 }}>
        <div style={{ background:'var(--primary)', borderRadius:12, padding:'18px 20px', color:'white', gridColumn:'span 1' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Founder Score</div>
          <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color: founderScore>=60?'#86EFAC':founderScore>=30?'#FDE68A':'#FCA5A5' }}>{founderScore}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:4 }}>
            {founderScore>=80?'Expert':founderScore>=60?'Proficient':founderScore>=40?'Developing':founderScore>0?'Beginner':'Not Started'}
          </div>
        </div>
        <StatCard label="MBA Progress" value={`${mbaProgress}%`} sub="6-month roadmap" />
        <StatCard label="Knowledge Map" value={`${knowledgePct}%`} sub={`${knowledge.flatMap(k=>k.topics).filter(t=>t.completed).length} topics done`} />
        <StatCard label="Courses" value={courses.length} sub={`${completedCourses} completed`} icon={<BookOpen size={14} />} />
        <StatCard label="Exam Average" value={examAvg != null ? `${examAvg}%` : '—'} sub={`${attempts.length} attempts`} icon={<GraduationCap size={14} />} />
      </div>

      {/* Second Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24 }}>
        <StatCard label="Books" value={books.length} sub={`${completedBooks} completed`} icon={<Library size={14} />} />
        <StatCard label="Assignments" value={assignments.length} sub={`${completedAssignments} graded`} icon={<ClipboardList size={14} />} />
        <StatCard label="Case Studies" value={caseStudies.length} sub="companies studied" icon={<BookMarked size={14} />} />
        <StatCard label="Notes" value={notes.length} sub="insights captured" icon={<FileText size={14} />} />
        <StatCard label="Implemented" value={implementedApps} sub="CP applications" icon={<Coffee size={14} />} />
      </div>

      {/* Main Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 340px', gap:18 }}>
        {/* Left: Skill Scores */}
        <Card title="Top Skills" action={<NavLink href="/skills">View All</NavLink>}>
          {topSkills.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:14, width:20 }}>{CAT_ICONS[s.category]||'📌'}</span>
              <span style={{ fontSize:12.5, flex:1 }}>{s.category}</span>
              <div style={{ width:100 }}><ProgressBar value={s.currentScore} height={5} color={scoreColor(s.currentScore)} /></div>
              <span style={{ fontSize:11, fontWeight:700, color:scoreColor(s.currentScore), width:24, textAlign:'right' }}>{s.currentScore}</span>
            </div>
          ))}
          {weakSkills.length > 0 && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted-foreground)', marginBottom:8 }}>Focus Areas</div>
              {weakSkills.map(s => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:13, width:20 }}>{CAT_ICONS[s.category]||'📌'}</span>
                  <span style={{ fontSize:12, flex:1, color:'var(--muted-foreground)' }}>{s.category}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:'#DC2626' }}>{s.currentScore}/100</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Middle: MBA Roadmap + Knowledge */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card title="6-Month Roadmap" action={<NavLink href="/roadmap">View</NavLink>}>
            {months.map(m => {
              const pct = m.checklist.length ? Math.round(m.checklist.filter(c=>c.completed).length/m.checklist.length*100) : 0
              return (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
                  <div style={{ width:24, height:24, borderRadius:5, flexShrink:0, background:pct===100?'var(--accent)':'var(--secondary)', color:pct===100?'white':'var(--muted-foreground)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>{m.monthNumber}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, marginBottom:3 }}>{m.name}</div>
                    <ProgressBar value={pct} height={4} />
                  </div>
                  <span style={{ fontSize:11, color:'var(--muted-foreground)', width:28, textAlign:'right' }}>{pct}%</span>
                </div>
              )
            })}
          </Card>

          <Card title="Knowledge Map" action={<NavLink href="/knowledge">Explore</NavLink>}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {knowledge.slice(0,8).map(cat => {
                const pct = cat.topics.length ? Math.round(cat.topics.filter(t=>t.completed).length/cat.topics.length*100) : 0
                return (
                  <div key={cat.id} style={{ padding:'8px 10px', background:'var(--secondary)', borderRadius:7 }}>
                    <div style={{ fontSize:12, marginBottom:4 }}>{cat.icon} {cat.name}</div>
                    <ProgressBar value={pct} height={3} />
                    <div style={{ fontSize:10, color:'var(--muted-foreground)', marginTop:3 }}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Quick Actions */}
          <Card title="Quick Actions">
            {[
              { href:'/knowledge', icon:'🗺️', label:'Study a topic' },
              { href:'/courses', icon:'📚', label:'Add a course' },
              { href:'/assignments', icon:'✏️', label:'Work on assignment' },
              { href:'/exams', icon:'🎓', label:'Take an exam' },
              { href:'/books', icon:'📖', label:'Update reading' },
              { href:'/applications', icon:'☕', label:'Log implementation' },
              { href:'/readiness', icon:'🚀', label:'Check readiness' },
              { href:'/weekly-review', icon:'📅', label:'Weekly review' },
            ].map(({href,icon,label}) => (
              <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 10px', borderRadius:7, textDecoration:'none', color:'var(--foreground)', fontSize:12.5, transition:'background 0.1s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--secondary)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <span>{icon}</span>{label}
                <ArrowRight size={10} style={{ marginLeft:'auto', color:'var(--muted-foreground)' }} />
              </Link>
            ))}
          </Card>

          {/* Last Review */}
          {lastReview && (
            <Card title="Last Weekly Review" action={<NavLink href="/weekly-review">All</NavLink>}>
              <div style={{ fontSize:11, color:'var(--muted-foreground)', marginBottom:8 }}>
                Week {lastReview.weekNumber} · {formatDate(lastReview.weekStartDate)}
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                <Pill label="⚡" value={`${lastReview.energyLevel}/5`} />
                <Pill label="★" value={`${lastReview.overallRating}/5`} />
                {(lastReview.hoursStudied ?? 0) > 0 && <Pill label="📚" value={`${lastReview.hoursStudied}h`} />}
              </div>
              {/* Learning counts */}
              {((lastReview.coursesCompleted?.length ?? 0) + (lastReview.examsTaken?.length ?? 0) + (lastReview.booksRead?.length ?? 0) + (lastReview.assignmentsCompleted?.length ?? 0)) > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                  {(lastReview.coursesCompleted?.length ?? 0) > 0 && (
                    <span style={{ fontSize:11, background:'#EFF6FF', color:'#1D4ED8', borderRadius:5, padding:'2px 7px' }}>
                      🎓 {lastReview.coursesCompleted!.length} course{lastReview.coursesCompleted!.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {(lastReview.examsTaken?.length ?? 0) > 0 && (
                    <span style={{ fontSize:11, background:'#FEF2F2', color:'#DC2626', borderRadius:5, padding:'2px 7px' }}>
                      📝 {lastReview.examsTaken!.length} exam{lastReview.examsTaken!.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {(lastReview.booksRead?.length ?? 0) > 0 && (
                    <span style={{ fontSize:11, background:'#F0FDF4', color:'#15803D', borderRadius:5, padding:'2px 7px' }}>
                      📖 {lastReview.booksRead!.length} book{lastReview.booksRead!.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {(lastReview.assignmentsCompleted?.length ?? 0) > 0 && (
                    <span style={{ fontSize:11, background:'#FDF4FF', color:'#7E22CE', borderRadius:5, padding:'2px 7px' }}>
                      ✅ {lastReview.assignmentsCompleted!.length} assignment{lastReview.assignmentsCompleted!.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
              {lastReview.wins.filter(Boolean).slice(0,2).map((w,i) => (
                <div key={i} style={{ fontSize:12, padding:'4px 0', borderBottom:'1px solid var(--border)', display:'flex', gap:5 }}>
                  <Zap size={10} style={{ color:'#F59E0B', marginTop:3, flexShrink:0 }} />
                  {truncate(w,50)}
                </div>
              ))}
              {lastReview.nextWeekFocus?.filter(Boolean).slice(0,1).map((f,i) => (
                <div key={i} style={{ fontSize:11, color:'#10B981', padding:'6px 0 0', display:'flex', gap:4 }}>
                  <span>🎯</span>{truncate(f,46)}
                </div>
              ))}
            </Card>
          )}

          {/* Recent Courses */}
          {recentCourses.length > 0 && (
            <Card title="Recent Courses" action={<NavLink href="/courses">All</NavLink>}>
              {recentCourses.map(c => (
                <div key={c.id} style={{ padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:12.5, fontWeight:500, marginBottom:3 }}>{truncate(c.name,32)}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--muted-foreground)' }}>{c.platform}</span>
                    <div style={{ width:60 }}><ProgressBar value={c.progress} height={4} /></div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, action }: { title:string; children:React.ReactNode; action?:React.ReactNode }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <span style={{ fontSize:12.5, fontWeight:600, letterSpacing:'-0.01em' }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function NavLink({ href, children }: { href:string; children:React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize:11.5, color:'var(--muted-foreground)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
      {children} <ArrowRight size={10} />
    </Link>
  )
}

function Pill({ label, value }: { label:string; value:string }) {
  return (
    <div style={{ background:'var(--secondary)', borderRadius:6, padding:'4px 8px', fontSize:11, display:'flex', gap:3 }}>
      <span>{label}</span><span style={{ fontWeight:600 }}>{value}</span>
    </div>
  )
}
