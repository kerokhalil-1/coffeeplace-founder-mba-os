import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const VARIANTS = {
  primary: {
    background: 'var(--primary)', color: 'var(--primary-foreground)',
    border: '1px solid var(--primary)',
    hover: { background: '#2C2417' },
  },
  secondary: {
    background: 'var(--secondary)', color: 'var(--foreground)',
    border: '1px solid var(--border)',
    hover: { background: '#EBEBEB' },
  },
  ghost: {
    background: 'transparent', color: 'var(--muted-foreground)',
    border: '1px solid transparent',
    hover: { background: 'var(--secondary)' },
  },
  danger: {
    background: '#FEF2F2', color: '#DC2626',
    border: '1px solid #FECACA',
    hover: { background: '#FEE2E2' },
  },
}

const SIZES = {
  sm: { padding: '5px 10px', fontSize: 12, borderRadius: 7 },
  md: { padding: '8px 14px', fontSize: 13.5, borderRadius: 8 },
  lg: { padding: '10px 18px', fontSize: 14, borderRadius: 9 },
}

export function Button({ variant = 'primary', size = 'md', children, style, onMouseEnter, onMouseLeave, ...props }: ButtonProps) {
  const v = VARIANTS[variant]
  const s = SIZES[size]
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, fontWeight: 500, cursor: 'pointer',
        background: v.background, color: v.color, border: v.border,
        padding: s.padding, fontSize: s.fontSize, borderRadius: s.borderRadius,
        transition: 'all 0.12s ease', whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => { Object.assign((e.currentTarget as HTMLElement).style, v.hover); onMouseEnter?.(e) }}
      onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, { background: v.background }); onMouseLeave?.(e) }}
    >
      {children}
    </button>
  )
}
