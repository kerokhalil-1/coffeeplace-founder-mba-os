'use client'
import { useState, useMemo } from 'react'
import { Plus, BookOpen, ExternalLink, Edit3, Trash2, Filter, Search } from 'lucide-react'
import { useFirestore } from '@/hooks/useFirestore'
import { SEED_SKILL_SCORES } from '@/lib/seed-knowledge'
import { STORAGE_KEYS } from '@/lib/storage'
import { Course, CourseCategory, CourseStatus, SkillScore } from '@/lib/types'
import { awardCourseCompletion } from '@/lib/skillTracker'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select, FormField } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate, truncate } from '@/lib/utils'

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 1050, margin: '0 auto' }

const CATEGORIES: CourseCategory[] = ['Finance','Accounting','Marketing','Branding','Operations','Leadership','HR','Entrepreneurship','Strategy','Analytics','Negotiation','Sales','Customer Experience','Expansion','Other']
const STATUSES: CourseStatus[] = ['not_started','in_progress','completed','paused']

const EMPTY_COURSE: Omit<Course, 'id'|'createdAt'|'updatedAt'> = {
  name: '', platform: '', instructor: '', link: '', category: 'Strategy', duration: '', status: 'not_started',
  progress: 0, topicsCovered: [], keyLessons: [], notes: '', actionItems: [], coffeeApplication: '', rating: 0,
}

export default function CoursesPage() {
  const [courses, setCourses] = useFirestore<Course[]>(STORAGE_KEYS.COURSES, [])
  const [skills, setSkills] = useFirestore<SkillScore[]>(STORAGE_KEYS.SKILL_SCORES, SEED_SKILL_SCORES)
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<CourseStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<CourseCategory | 'all'>('all')

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.platform.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || c.status === filterStatus
      const matchCat = filterCategory === 'all' || c.category === filterCategory
      return matchSearch && matchStatus && matchCat
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [courses, search, filterStatus, filterCategory])

  const stats = useMemo(() => ({
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'in_progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    avgProgress: courses.length ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length) : 0,
  }), [courses])

  const openAdd = () => { setEditingCourse(null); setModalOpen(true) }
  const openEdit = (course: Course) => { setEditingCourse(course); setModalOpen(true) }

  const handleSave = (data: Omit<Course, 'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    let courseId: string
    if (editingCourse) {
      courseId = editingCourse.id
      const wasCompleted = editingCourse.status === 'completed'
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...data, updatedAt: now } : c))
      toast.success('Course updated')
      // Award only if status changed TO completed (not already completed)
      if (data.status === 'completed' && !wasCompleted) {
        const updated = awardCourseCompletion(skills, courseId, data.name, data.category)
        if (updated) { setSkills(updated); toast.success(`+10 ${data.category} skill points earned`) }
      }
    } else {
      courseId = generateId()
      setCourses(prev => [...prev, { ...data, id: courseId, createdAt: now, updatedAt: now }])
      toast.success('Course added')
      // Award immediately if created as completed
      if (data.status === 'completed') {
        const updated = awardCourseCompletion(skills, courseId, data.name, data.category)
        if (updated) { setSkills(updated); toast.success(`+10 ${data.category} skill points earned`) }
      }
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this course?')) { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('Course deleted') }
  }

  return (
    <div style={PAGE_STYLE}>
      <PageHeader
        title="Course Tracker"
        description="Track every course, link it to CoffeePlace, and measure your progress"
        action={<Button onClick={openAdd}><Plus size={14} /> Add Course</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Completed', value: stats.completed },
          { label: 'Avg Progress', value: `${stats.avgProgress}%` },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <Input placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <Select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as CourseStatus | 'all')}
          options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))]}
          style={{ width: 160 }}
        />
        <Select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as CourseCategory | 'all')}
          options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          style={{ width: 160 }}
        />
      </div>

      {/* Course List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title={courses.length === 0 ? "No courses yet" : "No courses match your filters"}
          description={courses.length === 0 ? "Add your first course to start tracking your MBA journey" : "Try adjusting your search or filters"}
          action={courses.length === 0 ? <Button onClick={openAdd}><Plus size={14} /> Add Course</Button> : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(course => (
            <CourseRow key={course.id} course={course} onEdit={() => openEdit(course)} onDelete={() => handleDelete(course.id)} />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        width={620}
      >
        <CourseForm
          initial={editingCourse || EMPTY_COURSE}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

// ─── Course Row ───────────────────────────────────────────────────────────────

function CourseRow({ course, onEdit, onDelete }: { course: Course; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Summary Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{course.name}</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '2px 7px', borderRadius: 4 }}>
              {course.category}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{course.platform}</span>
            <div style={{ width: 120 }}>
              <ProgressBar value={course.progress} height={4} showLabel />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StatusBadge status={course.status} />
          {course.link && (
            <a href={course.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              style={{ color: 'var(--muted-foreground)', display: 'flex' }}>
              <ExternalLink size={13} />
            </a>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 2 }}>
            <Edit3 size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', padding: 2 }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--secondary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {course.topicsCovered.length > 0 && (
              <DetailSection title="Topics Covered">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {course.topicsCovered.map((t, i) => (
                    <span key={i} style={{ fontSize: 11, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 7px' }}>{t}</span>
                  ))}
                </div>
              </DetailSection>
            )}
            {course.coffeeApplication && (
              <DetailSection title="CoffeePlace Application">
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{course.coffeeApplication}</p>
              </DetailSection>
            )}
            {course.notes && (
              <DetailSection title="Notes" full>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{course.notes}</p>
              </DetailSection>
            )}
          </div>
          {(course.startedAt || course.completedAt) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--muted-foreground)' }}>
              {course.startedAt && <span>Started: {formatDate(course.startedAt)}</span>}
              {course.completedAt && <span>Completed: {formatDate(course.completedAt)}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailSection({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
}

// ─── Course Form ──────────────────────────────────────────────────────────────

function CourseForm({ initial, onSave, onCancel }: {
  initial: Omit<Course, 'id'|'createdAt'|'updatedAt'> | Course
  onSave: (d: Omit<Course, 'id'|'createdAt'|'updatedAt'>) => void
  onCancel: () => void
}) {
  const [data, setData] = useState({ ...initial })
  const [topicInput, setTopicInput] = useState('')

  const set = (k: string, v: unknown) => setData(prev => ({ ...prev, [k]: v }))

  const addTopic = () => {
    if (topicInput.trim()) { set('topicsCovered', [...(data.topicsCovered || []), topicInput.trim()]); setTopicInput('') }
  }
  const removeTopic = (i: number) => set('topicsCovered', (data.topicsCovered||[]).filter((_: string, idx: number) => idx !== i))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.name.trim()) return
    onSave(data as Omit<Course, 'id'|'createdAt'|'updatedAt'>)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <FormField label="Course Name" required>
            <Input value={data.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Financial Modeling Bootcamp" required />
          </FormField>
        </div>
        <FormField label="Platform">
          <Input value={data.platform} onChange={e => set('platform', e.target.value)} placeholder="Coursera, Udemy, YouTube…" />
        </FormField>
        <FormField label="Course Link">
          <Input type="url" value={data.link} onChange={e => set('link', e.target.value)} placeholder="https://…" />
        </FormField>
        <FormField label="Category">
          <Select value={data.category} onChange={e => set('category', e.target.value)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))} />
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={e => set('status', e.target.value)}
            options={STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))} />
        </FormField>
        <div style={{ gridColumn: '1 / -1' }}>
          <FormField label={`Progress: ${data.progress}%`}>
            <input type="range" min={0} max={100} value={data.progress}
              onChange={e => set('progress', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </FormField>
        </div>
      </div>

      <FormField label="Topics Covered">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {data.topicsCovered?.map((t, i) => (
            <span key={i} style={{ fontSize: 11.5, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
              {t}
              <button type="button" onClick={() => removeTopic(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Input placeholder="Add topic (press Enter)…" value={topicInput} onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }} />
          <Button type="button" variant="secondary" size="sm" onClick={addTopic}><Plus size={13} /></Button>
        </div>
      </FormField>

      <FormField label="CoffeePlace Application">
        <Textarea value={data.coffeeApplication} onChange={e => set('coffeeApplication', e.target.value)}
          placeholder="How will you apply this course at CoffeePlace?…" rows={3} />
      </FormField>

      <FormField label="Personal Notes">
        <Textarea value={data.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Key takeaways, insights, action items…" rows={3} />
      </FormField>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{('id' in initial) ? 'Save Changes' : 'Add Course'}</Button>
      </div>
    </form>
  )
}
