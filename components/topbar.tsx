'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getInitials, getEstablishmentInitials } from '@/lib/planning-utils'
import {
  LogOut, Sun, Moon, ChevronsUpDown, Check, Plus, Settings, CreditCard,
} from 'lucide-react'
import { NotificationsBell } from './notifications-bell'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EstablishmentEntry {
  id: string
  name: string
}

interface NavItem {
  label: string
  href: string
  badge?: number
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_ESTABLISHMENTS: EstablishmentEntry[] = [
  { id: 'est-1', name: 'La Boulangerie du Soleil' },
]

// ── Nav definitions ───────────────────────────────────────────────────────────

function buildManagerNav(pendingLeavesCount: number, alertsCount: number): NavItem[] {
  return [
    { label: 'Planning',     href: '/manager/planning' },
    { label: 'Employés',     href: '/manager/employees' },
    { label: 'Rapport',      href: '/manager/rapport' },
    { label: 'Analytiques',  href: '/manager/analytics' },
    { label: 'Conformité',   href: '/manager/compliance' },
    { label: 'Congés',       href: '/manager/conges',   badge: pendingLeavesCount },
    { label: 'Échanges',     href: '/manager/echanges' },
    { label: 'Marketplace',  href: '/manager/marketplace' },
    { label: 'Alertes',      href: '/manager/alertes',  badge: alertsCount },
    { label: 'Présences',    href: '/manager/presences' },
    { label: 'Paramètres',   href: '/manager/settings' },
    { label: 'Aide',         href: '/manager/help' },
  ]
}

const employeeNav: NavItem[] = [
  { label: 'Mon planning', href: '/employee/planning' },
  { label: 'Mes congés',   href: '/employee/conges' },
  { label: 'Badgeuse',     href: '/employee/badgeuse' },
  { label: 'Échanges',     href: '/employee/echanges' },
  { label: 'Marketplace',  href: '/employee/marketplace' },
]

// ── Account dropdown ──────────────────────────────────────────────────────────

function AccountDropdown({ userName, userEmail, role }: {
  userName: string
  userEmail: string
  role: 'manager' | 'employee' | 'supervisor'
}) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('dp-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('dp-theme', 'light')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--accent-light)] transition-colors duration-150"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #4A8FD4 100%)' }}>
          <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
            {getInitials(userName || userEmail)}
          </span>
        </div>
        <span className="text-[13px] text-[var(--text-secondary)] truncate max-w-[100px]">
          {userName || userEmail}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg overflow-hidden z-50"
          style={{ animation: 'dropdownIn 0.15s ease' }}
        >
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{userName}</p>
            <p className="text-[11px] text-[var(--text-tertiary)] truncate">{userEmail}</p>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            {dark
              ? <Sun className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              : <Moon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            }
            {dark ? 'Mode clair' : 'Mode sombre'}
          </button>

          {(role === 'manager' || role === 'supervisor') && (
            <Link
              href="/manager/settings"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)] transition-colors duration-150"
            >
              <Settings className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              Paramètres
            </Link>
          )}

          {(role === 'manager' || role === 'supervisor') && (
            <button
              onClick={() => setOpen(false)}
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-tertiary)] cursor-not-allowed opacity-60"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Changer de plan
              <span className="ml-auto text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-1.5 py-0.5 rounded-full font-medium">
                Bientôt
              </span>
            </button>
          )}

          <div className="mx-3 my-1 border-t border-[var(--border)]" />

          <button
            onClick={() => { setOpen(false); alert('🎭 Mode démo — déconnexion désactivée') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[rgba(255,107,107,0.1)] hover:text-[#FF6B6B] transition-colors duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}

// ── Nav link ──────────────────────────────────────────────────────────────────

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-1.5 h-full px-0.5 text-[13px] transition-colors duration-150 whitespace-nowrap',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
      )}
    >
      {item.label}
      {item.badge !== undefined && item.badge > 0 && (
        <span className="relative flex items-center justify-center alert-pulse">
          <span className="absolute inset-0 rounded-[4px] opacity-30 animate-ping" style={{ backgroundColor: '#FF6B6B' }} />
          <span className="relative flex items-center justify-center h-4 min-w-[16px] px-1 rounded-[4px] text-[10px] font-medium leading-none" style={{ backgroundColor: 'rgba(255,107,107,0.15)', color: '#FF6B6B' }}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)] rounded-full" />
      )}
    </Link>
  )
}

// ── Establishment Switcher ────────────────────────────────────────────────────

interface SwitcherProps {
  establishments: EstablishmentEntry[]
  activeEstablishmentId: string
  establishmentName: string
  role: 'manager' | 'employee' | 'supervisor'
}

function EstablishmentSwitcher({ establishments, activeEstablishmentId, establishmentName, role }: SwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  if (establishments.length <= 1) {
    return (
      <span
        className="text-[12px] truncate max-w-[140px] px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
      >
        {establishmentName}
      </span>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border)] text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors duration-150 max-w-[160px]"
      >
        <span className="truncate">{establishmentName}</span>
        <ChevronsUpDown className="h-3 w-3 flex-shrink-0 text-[var(--text-tertiary)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden z-50">
          <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
            Changer d&apos;établissement
          </p>
          {establishments.map(est => (
            <button
              key={est.id}
              onClick={() => { alert('🎭 Mode démo'); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--accent-light)] transition-colors duration-150"
            >
              <div className="h-5 w-5 rounded-md bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-[var(--accent)]">
                  {getEstablishmentInitials(est.name)}
                </span>
              </div>
              <span className="flex-1 text-[12px] text-[var(--text-primary)] truncate">{est.name}</span>
              {est.id === activeEstablishmentId && (
                <Check className="h-3 w-3 text-[var(--accent)] flex-shrink-0" />
              )}
            </button>
          ))}
          {role === 'manager' && (
            <>
              <div className="mx-3 my-1 border-t border-[var(--border)]" />
              <Link
                href="/manager/settings"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--accent-light)] transition-colors duration-150"
              >
                <div className="h-5 w-5 rounded-md border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <Plus className="h-3 w-3 text-[var(--text-tertiary)]" />
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">Gérer les établissements</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Topbar ───────────────────────────────────────────────────────────────

interface TopbarProps {
  role?: 'manager' | 'employee' | 'supervisor'
  userName?: string
  userEmail?: string
  establishmentName?: string
  pendingLeavesCount?: number
  alertsCount?: number
}

export function Topbar({
  role = 'manager',
  userName = 'Maxence Burte',
  userEmail = 'maxence@demo.quartzbase.com',
  establishmentName = 'La Boulangerie du Soleil',
  pendingLeavesCount = 3,
  alertsCount = 1,
}: TopbarProps) {
  const pathname = usePathname()

  const navItems = (role === 'manager' || role === 'supervisor')
    ? buildManagerNav(pendingLeavesCount, alertsCount)
    : employeeNav

  function isActive(href: string) {
    if (href === '/manager/settings') return pathname.startsWith('/manager/settings')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-11 backdrop-blur-md flex items-center px-5 gap-6"
      style={{ backgroundColor: 'rgba(10,10,15,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <Link
        href={role === 'employee' ? '/employee' : '/manager'}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[11px] select-none flex-shrink-0"
          style={{ backgroundColor: '#6C63FF' }}
        >
          Q
        </div>
        <span className="text-[14px] font-semibold tracking-tight" style={{ color: '#f0f0f8', fontFamily: 'var(--font-syne)' }}>
          Quartzbase
        </span>
      </Link>

      {/* Separator */}
      <div className="h-4 w-px bg-[var(--border)] flex-shrink-0" />

      {/* Navigation links */}
      <nav className="flex items-stretch h-full gap-5 flex-1 min-w-0 overflow-x-auto scrollbar-thin">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* DÉMO badge */}
        <span
          className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-[0.08em] px-2 py-0.5 rounded-md flex-shrink-0"
          style={{ background: 'rgba(255,140,66,0.15)', border: '1px solid rgba(255,140,66,0.4)', color: '#FF8C42' }}
        >
          DÉMO
        </span>

        <EstablishmentSwitcher
          establishments={DEMO_ESTABLISHMENTS}
          activeEstablishmentId="est-1"
          establishmentName={establishmentName}
          role={role}
        />
        <NotificationsBell />
        <AccountDropdown
          userName={userName}
          userEmail={userEmail}
          role={role}
        />
      </div>
    </header>
  )
}
