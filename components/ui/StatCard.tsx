interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  icon?: React.ReactNode
}

export function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div style={{
      background: accent ? 'var(--accent)' : 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: accent ? 'rgba(254,243,199,0.8)' : 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          {label}
        </span>
        {icon && <span style={{ color: accent ? 'rgba(254,243,199,0.7)' : 'var(--muted-foreground)' }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em',
        color: accent ? 'white' : 'var(--foreground)', lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: accent ? 'rgba(254,243,199,0.7)' : 'var(--muted-foreground)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
