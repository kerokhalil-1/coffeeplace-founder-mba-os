import { Sidebar } from './Sidebar'
import { ToastProvider } from '@/components/ui/Toast'
import { DiagnosticsProvider } from '@/components/debug/DiagnosticsPanel'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiagnosticsProvider>
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ToastProvider>
    </DiagnosticsProvider>
  )
}
