'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Layers,
  CalendarDays,
  Bell,
  Umbrella,
  Download,
  Plug,
  ShieldCheck,
  FileText,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Organisation',      href: '/manager/settings/organisation',  icon: Building2   },
  { label: 'Postes & rôles',   href: '/manager/settings/postes',        icon: Layers      },
  { label: 'Planning',          href: '/manager/settings/regles',        icon: CalendarDays },
  { label: 'Contrats & RH',    href: '/manager/settings/contrats',      icon: FileText    },
  { label: 'Notifications',     href: '/manager/settings/notifications', icon: Bell        },
  { label: 'Congés & absences', href: '/manager/settings/conges',        icon: Umbrella    },
  { label: 'Exports & paie',    href: '/manager/settings/exports',       icon: Download    },
  { label: 'Intégrations',      href: '/manager/settings/integrations',  icon: Plug        },
  { label: 'Données & RGPD',    href: '/manager/settings/rgpd',          icon: ShieldCheck },
]

export default function SettingsSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile: horizontal scrollable strip */}
      <div
        className="md:hidden"
        style={{
          position: 'sticky', top: 56, zIndex: 20,
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', minWidth: 'max-content' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 150ms',
                }}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop: left sidebar */}
      <div
        className="hidden md:flex"
        style={{
          flexDirection: 'column',
          width: 200,
          flexShrink: 0,
          position: 'sticky',
          top: 44,
          height: 'calc(100vh - 44px)',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: 10, fontWeight: 700,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0 16px',
          marginBottom: 8,
        }}>
          Paramètres
        </p>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--accent-light)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                transition: 'all 150ms',
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
