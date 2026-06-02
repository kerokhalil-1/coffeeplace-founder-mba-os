import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  badge?: string
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 28, gap: 16,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: description ? 4 : 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--foreground)', margin: 0, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {badge && (
            <span style={{
              fontSize: 11, fontWeight: 500, color: 'var(--accent)',
              background: '#FEF3C7', padding: '2px 8px', borderRadius: 20,
              border: '1px solid #FDE68A'
            }}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
