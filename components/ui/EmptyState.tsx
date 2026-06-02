interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, color: 'var(--muted-foreground)'
        }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--foreground)', marginBottom: 6 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', maxWidth: 280, marginBottom: 20 }}>
          {description}
        </div>
      )}
      {action}
    </div>
  )
}
