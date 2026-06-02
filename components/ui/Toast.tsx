'use client'
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  success: (msg: string) => void
  error:   (msg: string) => void
  info:    (msg: string) => void
  warning: (msg: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error:   () => {},
  info:    () => {},
  warning: () => {},
})

export function useToast(): ToastContextType {
  return useContext(ToastContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 3500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev.slice(-2), { id, message, type }]) // max 3 visible
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
  }, [dismiss])

  const ctx = useMemo<ToastContextType>(() => ({
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
    warning: (msg) => add(msg, 'warning'),
  }), [add])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toaster — fixed bottom-right */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <ToastBubble key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: ReactNode }> = {
  success: {
    bg: '#F0FDF4', border: '#BBF7D0', color: '#166534',
    icon: <CheckCircle2 size={15} style={{ flexShrink: 0 }} />,
  },
  error: {
    bg: '#FEF2F2', border: '#FECACA', color: '#991B1B',
    icon: <XCircle size={15} style={{ flexShrink: 0 }} />,
  },
  info: {
    bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF',
    icon: <Info size={15} style={{ flexShrink: 0 }} />,
  },
  warning: {
    bg: '#FFFBEB', border: '#FDE68A', color: '#92400E',
    icon: <AlertTriangle size={15} style={{ flexShrink: 0 }} />,
  },
}

function ToastBubble({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const s = TOAST_STYLES[toast.type]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        color: s.color,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.4,
        maxWidth: 320,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        animation: 'toast-in 0.2s ease',
        pointerEvents: 'auto',
        cursor: 'default',
      }}
    >
      {s.icon}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 2, color: s.color, opacity: 0.6, display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={13} />
      </button>
    </div>
  )
}
