'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Map, BookOpen, FileText, Coffee, CalendarCheck,
  Network, BarChart3, ClipboardList, BookMarked, GraduationCap,
  Library, CalendarDays, Rocket, Star, HardDrive, Settings as SettingsIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFirestore } from '@/hooks/useFirestore'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/lib/storage'
import type { Settings } from '@/lib/types'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/readiness', label: 'Founder Readiness', icon: Rocket },
      { href: '/skills', label: 'Skill Scorecard', icon: Star },
    ]
  },
  {
    label: 'MBA Learning',
    items: [
      { href: '/knowledge', label: 'Knowledge Map', icon: Network },
      { href: '/roadmap', label: 'MBA Roadmap', icon: Map },
      { href: '/courses', label: 'Courses', icon: BookOpen },
      { href: '/books', label: 'Books', icon: Library },
      { href: '/exams', label: 'Exams', icon: GraduationCap },
      { href: '/case-studies', label: 'Case Studies', icon: BookMarked },
      { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    ]
  },
  {
    label: 'CoffeePlace',
    items: [
      { href: '/notes', label: 'Notes', icon: FileText },
      { href: '/applications', label: 'CP Applications', icon: Coffee },
    ]
  },
  {
    label: 'Reviews',
    items: [
      { href: '/weekly-review', label: 'Weekly Review', icon: CalendarCheck },
      { href: '/monthly-review', label: 'Monthly Review', icon: CalendarDays },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [settings] = useFirestore<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Coffee size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.2 }}>{settings.brandName}</div>
            <div style={{ fontSize: 9.5, color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Founder MBA OS</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.09em', textTransform: 'uppercase', padding: '3px 8px 7px' }}>
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '6px 10px', borderRadius: 7, marginBottom: 1,
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                    background: active ? 'var(--secondary)' : 'transparent',
                    textDecoration: 'none', transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--secondary)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: 'var(--secondary)' }}>
          <div style={{ width: 27, height: 27, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{(settings.founderName || 'K').charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{settings.founderName}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Founder & CEO</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
