import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13.5,
  background: 'var(--secondary)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--foreground)',
  outline: 'none', transition: 'border-color 0.12s ease',
  fontFamily: 'inherit',
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ style, onFocus, onBlur, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      style={{ ...inputStyle, ...style }}
      onFocus={e => { e.target.style.borderColor = 'var(--ring)'; onFocus?.(e) }}
      onBlur={e => { e.target.style.borderColor = 'var(--border)'; onBlur?.(e) }}
    />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ style, onFocus, onBlur, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      style={{ ...inputStyle, resize: 'vertical', minHeight: 80, ...style }}
      onFocus={e => { e.target.style.borderColor = 'var(--ring)'; onFocus?.(e) }}
      onBlur={e => { e.target.style.borderColor = 'var(--border)'; onBlur?.(e) }}
    />
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export function Select({ options, style, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, cursor: 'pointer', ...style }}
      onFocus={e => { e.target.style.borderColor = 'var(--ring)'; props.onFocus?.(e) }}
      onBlur={e => { e.target.style.borderColor = 'var(--border)'; props.onBlur?.(e) }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        color: 'var(--foreground)', marginBottom: 6, letterSpacing: '0.01em'
      }}>
        {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
