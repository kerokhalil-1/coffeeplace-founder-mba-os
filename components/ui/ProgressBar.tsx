interface ProgressBarProps {
  value: number // 0-100
  height?: number
  color?: string
  showLabel?: boolean
}

export function ProgressBar({ value, height = 6, color = 'var(--accent)', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height, borderRadius: height,
        background: 'var(--secondary)', overflow: 'hidden'
      }}>
        <div style={{
          width: `${clamped}%`, height: '100%',
          borderRadius: height, background: color,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', minWidth: 28, textAlign: 'right' }}>
          {clamped}%
        </span>
      )}
    </div>
  )
}
