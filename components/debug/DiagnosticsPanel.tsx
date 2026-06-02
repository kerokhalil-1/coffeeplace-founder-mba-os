'use client'
import {
  createContext, useContext, useState, useEffect, useLayoutEffect,
  useCallback, useRef, ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { Bug, X, Copy, CheckCircle2, Trash2, ChevronDown, ChevronUp, Zap, AlertTriangle, Clock, Cpu } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ErrorKind = 'js' | 'promise' | 'console' | 'react'

interface DiagError {
  id: string
  kind: ErrorKind
  message: string
  stack?: string
  time: string       // HH:MM:SS
  url: string
}

interface NavEntry {
  path: string
  ms: number         // ms from pathname change to layout paint
  time: string
}

interface DiagState {
  errors: DiagError[]
  navs: NavEntry[]
}

interface DiagCtx {
  addError: (e: Omit<DiagError, 'id' | 'time' | 'url'>) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<DiagCtx>({ addError: () => {} })
export function useDiagnostics() { return useContext(Ctx) }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}
function nowISO() { return new Date().toISOString() }
function uid() { return Math.random().toString(36).slice(2, 8) }

// ─── Provider + Panel ─────────────────────────────────────────────────────────

export function DiagnosticsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DiagState>({ errors: [], navs: [] })
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [section, setSection] = useState<'errors' | 'perf'>('errors')
  const pathname = usePathname()
  const navStartRef = useRef<number>(performance.now())
  const prevPathRef = useRef<string>(pathname)

  // Hook into history.pushState so the clock starts at click-time, not page-render-time
  useEffect(() => {
    const origPush = history.pushState.bind(history)
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      navStartRef.current = performance.now()
      return origPush(...args)
    }
    const origReplace = history.replaceState.bind(history)
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      navStartRef.current = performance.now()
      return origReplace(...args)
    }
    return () => {
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  // After layout paint — record navigation duration from click to render
  useLayoutEffect(() => {
    const ms = Math.round(performance.now() - navStartRef.current)
    const from = prevPathRef.current
    prevPathRef.current = pathname
    if (from === pathname) return   // skip initial mount
    setState(prev => ({
      ...prev,
      navs: [{ path: pathname, ms, time: nowTime() }, ...prev.navs].slice(0, 30),
    }))
  }, [pathname])

  const addError = useCallback((e: Omit<DiagError, 'id' | 'time' | 'url'>) => {
    setState(prev => {
      // Deduplicate identical consecutive messages
      if (prev.errors[0]?.message === e.message) return prev
      return {
        ...prev,
        errors: [
          { ...e, id: uid(), time: nowTime(), url: window.location.pathname },
          ...prev.errors,
        ].slice(0, 50),
      }
    })
  }, [])

  // ── Global error listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      addError({ kind: 'js', message: ev.message, stack: ev.error?.stack })
    }
    const onUnhandled = (ev: PromiseRejectionEvent) => {
      const msg = ev.reason instanceof Error ? ev.reason.message : String(ev.reason)
      const stack = ev.reason instanceof Error ? ev.reason.stack : undefined
      addError({ kind: 'promise', message: `Unhandled promise: ${msg}`, stack })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)

    // Monkey-patch console.error (non-destructive)
    const origError = console.error.bind(console)
    console.error = (...args: unknown[]) => {
      origError(...args)
      const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
      // Skip React's own dev warnings that are not real errors
      if (!msg.includes('Warning:') && !msg.includes('Each child')) {
        addError({ kind: 'console', message: msg.slice(0, 300) })
      }
    }
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
      console.error = origError
    }
  }, [addError])

  // ── Copy report ─────────────────────────────────────────────────────────────
  const copyReport = () => {
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    const lines: string[] = [
      '=== CoffeePlace Founder MBA OS — Diagnostics Report ===',
      `Generated : ${nowISO()}`,
      `Page      : ${pathname}`,
      `User Agent: ${navigator.userAgent}`,
      `Memory    : ${mem ? `${Math.round(mem.usedJSHeapSize / 1048576)}MB used / ${Math.round(mem.jsHeapSizeLimit / 1048576)}MB limit` : 'unavailable'}`,
      '',
      `=== ERRORS (${state.errors.length}) ===`,
    ]
    if (state.errors.length === 0) {
      lines.push('  No errors captured.')
    } else {
      state.errors.forEach((e, i) => {
        lines.push(`\n[${i + 1}] ${e.time} [${e.kind.toUpperCase()}] on ${e.url}`)
        lines.push(`    ${e.message}`)
        if (e.stack) {
          e.stack.split('\n').slice(0, 6).forEach(l => lines.push(`    ${l.trim()}`))
        }
      })
    }
    lines.push('', `=== PAGE TIMINGS (${state.navs.length}) ===`)
    if (state.navs.length === 0) {
      lines.push('  No navigations recorded yet — click a page in the sidebar.')
    } else {
      state.navs.forEach(n => {
        const speed = n.ms < 500 ? '✓ fast' : n.ms < 2000 ? '⚡ ok' : '🐢 slow'
        lines.push(`  ${n.time}  ${n.path.padEnd(30)} ${n.ms}ms  ${speed}`)
      })
    }
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const errorCount = state.errors.length
  const avgNav = state.navs.length
    ? Math.round(state.navs.reduce((s, n) => s + n.ms, 0) / state.navs.length)
    : null

  return (
    <Ctx.Provider value={{ addError }}>
      {children}

      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Open diagnostics"
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 9990,
          width: 38, height: 38, borderRadius: '50%',
          background: errorCount > 0 ? '#FEF2F2' : 'var(--secondary)',
          border: `1px solid ${errorCount > 0 ? '#FECACA' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.15s ease',
        }}
      >
        <Bug size={16} color={errorCount > 0 ? '#DC2626' : 'var(--muted-foreground)'} />
        {errorCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#DC2626', color: '#fff',
            fontSize: 9, fontWeight: 700,
            borderRadius: '50%', width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {errorCount > 9 ? '9+' : errorCount}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 66, left: 20, zIndex: 9991,
          width: 460, maxHeight: '70vh',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--secondary)',
          }}>
            <Bug size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Diagnostics</span>
            {/* Stats pills */}
            <span style={pillStyle(errorCount > 0 ? '#DC2626' : '#15803D')}>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
            {avgNav !== null && (
              <span style={pillStyle(avgNav > 2000 ? '#DC2626' : avgNav > 800 ? '#92400E' : '#15803D')}>
                avg {avgNav}ms
              </span>
            )}
            <button onClick={() => setState({ errors: [], navs: [] })}
              title="Clear" style={iconBtn}>
              <Trash2 size={13} />
            </button>
            <button onClick={copyReport} title="Copy full report" style={{
              ...iconBtn,
              background: copied ? '#F0FDF4' : 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6, padding: '3px 8px',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600,
              color: copied ? '#15803D' : 'var(--foreground)',
            }}>
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => setOpen(false)} style={iconBtn}>
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {(['errors', 'perf'] as const).map(tab => (
              <button key={tab} onClick={() => setSection(tab)} style={{
                flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 500,
                background: section === tab ? 'var(--card)' : 'var(--secondary)',
                border: 'none', cursor: 'pointer',
                borderBottom: section === tab ? '2px solid var(--accent)' : '2px solid transparent',
                color: section === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                {tab === 'errors' ? <AlertTriangle size={11} /> : <Clock size={11} />}
                {tab === 'errors' ? `Errors (${errorCount})` : `Page Timing (${state.navs.length})`}
              </button>
            ))}
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '10px 14px' }}>
            {section === 'errors' ? (
              state.errors.length === 0 ? (
                <Empty icon={<CheckCircle2 size={18} />} text="No errors captured" color="#15803D" />
              ) : (
                state.errors.map(e => <ErrorRow key={e.id} e={e} />)
              )
            ) : (
              state.navs.length === 0 ? (
                <Empty icon={<Clock size={18} />} text="Navigate to a page to see timing" color="var(--muted-foreground)" />
              ) : (
                state.navs.map((n, i) => <NavRow key={i} n={n} />)
              )
            )}
          </div>

          {/* Footer hint */}
          <div style={{
            padding: '8px 14px', borderTop: '1px solid var(--border)',
            fontSize: 10.5, color: 'var(--muted-foreground)',
            background: 'var(--secondary)',
          }}>
            Press <strong>Copy</strong> to copy the full report and paste it to Claude.
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorRow({ e }: { e: DiagError }) {
  const [expanded, setExpanded] = useState(false)
  const kindColor: Record<ErrorKind, string> = {
    js: '#DC2626', promise: '#F59E0B', console: '#6366F1', react: '#EC4899',
  }
  return (
    <div style={{
      marginBottom: 8, border: '1px solid var(--border)', borderRadius: 8,
      overflow: 'hidden', fontSize: 12,
    }}>
      <div
        onClick={() => setExpanded(x => !x)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
          cursor: 'pointer', background: 'var(--secondary)',
        }}
      >
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
          background: kindColor[e.kind], color: '#fff',
          borderRadius: 4, padding: '2px 5px', flexShrink: 0, marginTop: 1,
        }}>
          {e.kind.toUpperCase()}
        </span>
        <span style={{ flex: 1, lineHeight: 1.4, color: 'var(--foreground)', wordBreak: 'break-word' }}>
          {e.message}
        </span>
        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', flexShrink: 0 }}>{e.time}</span>
        {e.stack && (expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
      </div>
      {expanded && e.stack && (
        <pre style={{
          margin: 0, padding: '8px 10px', fontSize: 10.5, lineHeight: 1.5,
          overflowX: 'auto', background: 'var(--card)',
          color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {e.stack.split('\n').slice(0, 8).join('\n')}
        </pre>
      )}
    </div>
  )
}

function NavRow({ n }: { n: NavEntry }) {
  const ms = n.ms
  const color = ms < 500 ? '#15803D' : ms < 2000 ? '#92400E' : '#DC2626'
  const label = ms < 500 ? 'fast' : ms < 2000 ? 'ok' : 'slow'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px', borderRadius: 7, marginBottom: 5,
      background: 'var(--secondary)', fontSize: 12,
    }}>
      <Zap size={11} color={color} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--foreground)', fontFamily: 'monospace' }}>{n.path}</span>
      <span style={{
        fontWeight: 700, color, minWidth: 60, textAlign: 'right', fontFamily: 'monospace',
      }}>{ms}ms</span>
      <span style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
        background: color, color: '#fff', borderRadius: 4, padding: '2px 5px',
      }}>{label}</span>
      <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{n.time}</span>
    </div>
  )
}

function Empty({ icon, text, color }: { icon: ReactNode; text: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '28px 0', gap: 8, color,
    }}>
      {icon}
      <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{text}</span>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted-foreground)', padding: 3, display: 'flex',
  alignItems: 'center', borderRadius: 4,
}

function pillStyle(color: string): React.CSSProperties {
  return {
    fontSize: 10, fontWeight: 600, color,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    borderRadius: 5, padding: '2px 7px',
  }
}
