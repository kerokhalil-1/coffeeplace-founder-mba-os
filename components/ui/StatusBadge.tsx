import { CourseStatus, AppStatus, AssignmentStatus } from '@/lib/types'

type AnyStatus = CourseStatus | AppStatus | AssignmentStatus

const COLORS: Record<string, { bg: string; color: string }> = {
  not_started:  { bg: '#F5F5F4', color: '#78716C' },
  in_progress:  { bg: '#EFF6FF', color: '#1D4ED8' },
  completed:    { bg: '#F0FDF4', color: '#15803D' },
  paused:       { bg: '#FFF7ED', color: '#C2410C' },
  idea:         { bg: '#F5F3FF', color: '#6D28D9' },
  planning:     { bg: '#FEF3C7', color: '#92400E' },
  implemented:  { bg: '#F0FDF4', color: '#15803D' },
  dropped:      { bg: '#FEF2F2', color: '#991B1B' },
  pending:      { bg: '#F5F5F4', color: '#78716C' },
}

const LABELS: Record<string, string> = {
  not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed',
  paused: 'Paused', idea: 'Idea', planning: 'Planning', implemented: 'Implemented',
  dropped: 'Dropped', pending: 'Pending',
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const style = COLORS[status] || COLORS.not_started
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20,
      background: style.bg, color: style.color, whiteSpace: 'nowrap'
    }}>
      {LABELS[status] || status}
    </span>
  )
}
