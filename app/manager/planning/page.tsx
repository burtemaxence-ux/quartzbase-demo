'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar, ChevronDown,
  Copy, Lock, Unlock, Mail, Share2, Check, AlertTriangle,
  Filter, SlidersHorizontal, Users, UserCheck, Clock,
  Printer, Sparkles, TrendingUp, Plus,
} from 'lucide-react'
import employeesData from '@/data/employees.json'
import shiftsData from '@/data/shifts.json'

// ── Types ──────────────────────────────────────────────────────────────────────

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
const DAY_KEYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const ROLE_COLORS: Record<string, string> = {
  'Boulanger':   '#6C63FF',
  'Vendeur':     '#00D4AA',
  'Pâtissier':   '#FFB347',
  'Responsable': '#FF8C42',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let h = (eh + em / 60) - (sh + sm / 60)
  if (h < 0) h += 24
  return h
}

function formatHours(h: number): string {
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${hours}h`
}

const DEMO_TODAY = new Date('2026-06-14T00:00:00')

function getWeekDates(offset: number): Date[] {
  const dow = DEMO_TODAY.getDay() === 0 ? 7 : DEMO_TODAY.getDay()
  const monday = new Date(DEMO_TODAY)
  monday.setDate(DEMO_TODAY.getDate() - dow + 1 + offset * 7)
  return DAY_KEYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getWeekLabel(dates: Date[]): string {
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt(dates[0])} – ${fmt(dates[6])} ${dates[0].getFullYear()}`
}

function isToday(d: Date): boolean {
  return d.getDate() === DEMO_TODAY.getDate() &&
    d.getMonth() === DEMO_TODAY.getMonth() &&
    d.getFullYear() === DEMO_TODAY.getFullYear()
}

function demoAlert(msg = 'Action désactivée en mode démo.') {
  alert(`🎭 Mode démo — ${msg}`)
}

// ── MetricCard ─────────────────────────────────────────────────────────────────

function MetricCard({ icon, iconBg, iconColor, value, label, trend }: {
  icon: React.ReactNode; iconBg: string; iconColor: string
  value: string; label: string; trend?: 'up' | 'down' | null
}) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px',
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
      flex: 1, minWidth: 0, position: 'relative',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</p>
      </div>
      {trend && (
        <div style={{ position: 'absolute', top: '12px', right: '14px' }}>
          <TrendingUp size={14} style={{ color: trend === 'up' ? 'var(--success)' : 'var(--danger)', opacity: 0.7 }} />
        </div>
      )}
    </div>
  )
}

// ── DonutChart ─────────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { name: string; color: string; hours: number }[] }) {
  const total = data.reduce((s, d) => s + d.hours, 0)
  if (total === 0) {
    return <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>Aucun shift planifié</p>
  }

  const r = 48, cx = 60, cy = 60, stroke = 18
  let cumAngle = -Math.PI / 2

  const arcs = data.map(e => {
    const angle = (e.hours / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    return { ...e, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct: Math.round((e.hours / total) * 100) }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
        <text x="60" y="56" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 600, fill: 'var(--text-primary)' }}>{formatHours(total)}</text>
        <text x="60" y="70" textAnchor="middle" style={{ fontSize: '9px', fill: 'var(--text-tertiary)' }}>Total planif.</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {arcs.filter(d => d.hours > 0).map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, flexShrink: 0 }}>{formatHours(e.hours)}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0, width: '30px', textAlign: 'right' }}>{e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AlertRow ───────────────────────────────────────────────────────────────────

function AlertRow({ iconBg, iconColor, icon, title, desc, badge }: {
  iconBg: string; iconColor: string; icon: React.ReactNode
  title: string; desc: string
  badge: { label: string; color: string; bg: string }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
        {badge.label}
      </div>
    </div>
  )
}

// ── ActivityRow ────────────────────────────────────────────────────────────────

function ActivityRow({ iconBg, iconColor, icon, desc, sub }: {
  iconBg: string; iconColor: string; icon: React.ReactNode; desc: string; sub: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{desc}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>{sub}</p>
      </div>
    </div>
  )
}

// ── ShiftPill ──────────────────────────────────────────────────────────────────

function ShiftPill({ start, end, color, role }: { start: string; end: string; color: string; role: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => demoAlert()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: `${color}15`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '8px',
        padding: '8px 10px',
        minHeight: '52px',
        cursor: 'pointer',
        marginBottom: '4px',
        filter: hovered ? 'brightness(0.9)' : 'none',
        transition: 'filter 150ms',
        userSelect: 'none',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {start} – {end}
      </p>
      <p style={{ fontSize: '12px', color, marginTop: '3px', lineHeight: 1 }}>{role}</p>
    </div>
  )
}

// ── GridCell ───────────────────────────────────────────────────────────────────

type ShiftEntry = typeof shiftsData[0]

function GridCell({ dayShifts, isTodayCol, weekLocked }: {
  dayShifts: ShiftEntry[]
  isTodayCol: boolean
  weekLocked: boolean
}) {
  const [hov, setHov] = useState(false)
  const isEmpty = dayShifts.length === 0

  return (
    <td
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)',
        padding: '8px', verticalAlign: 'top',
        backgroundColor: isTodayCol ? 'rgba(45,58,140,0.04)' : 'transparent',
        transition: 'background-color 120ms ease', minWidth: '120px',
      }}
    >
      {dayShifts.map((shift, i) => (
        <ShiftPill key={i} start={shift.start} end={shift.end} color={shift.color} role={shift.role} />
      ))}

      {isEmpty && !weekLocked && (
        <div
          onClick={() => demoAlert()}
          style={{
            minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', borderRadius: '6px',
            border: hov ? '0.5px dashed var(--accent)' : '0.5px solid transparent',
            backgroundColor: hov ? 'var(--accent-light)' : 'transparent', transition: 'all 120ms ease',
          }}
        >
          {hov
            ? <Plus size={14} style={{ color: 'var(--accent)', opacity: 0.7 }} />
            : <span style={{ color: 'var(--border)', fontSize: '16px', fontWeight: 300 }}>—</span>
          }
        </div>
      )}

      {isEmpty && weekLocked && (
        <div style={{ minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--border)', fontSize: '16px', fontWeight: 300 }}>—</span>
        </div>
      )}

      {!isEmpty && !weekLocked && (
        <div
          onClick={() => demoAlert()}
          style={{
            marginTop: '2px', height: '22px', borderRadius: '5px',
            border: '0.5px dashed var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 120ms ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--accent)'
            el.style.backgroundColor = 'var(--accent-light)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border)'
            el.style.backgroundColor = 'transparent'
          }}
        >
          <Plus size={10} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      )}
    </td>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PlanningPage() {
  const [weekOffset, setWeekOffset]       = useState(0)
  const [weekLocked, setWeekLocked]       = useState(false)
  const [weekPublished, setWeekPublished] = useState(true)
  const [shareCopied, setShareCopied]     = useState(false)
  const [filterRole, setFilterRole]       = useState('')

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const weekLabel = useMemo(() => getWeekLabel(weekDates), [weekDates])

  // Shifts are only available for the demo week (offset 0)
  const activeShifts = weekOffset === 0 ? shiftsData : []

  const shiftMap = useMemo(() => {
    const m = new Map<string, ShiftEntry[]>()
    for (const s of activeShifts) {
      const key = `${s.employeeId}__${s.day}`
      const arr = m.get(key) ?? []
      arr.push(s)
      m.set(key, arr)
    }
    return m
  }, [activeShifts])

  const dailyShiftCounts = useMemo(() => {
    const m = new Map<DayKey, number>()
    for (const s of activeShifts) m.set(s.day as DayKey, (m.get(s.day as DayKey) ?? 0) + 1)
    return m
  }, [activeShifts])

  const dailyHourTotals = useMemo(() => {
    const m = new Map<DayKey, number>()
    for (const s of activeShifts) m.set(s.day as DayKey, (m.get(s.day as DayKey) ?? 0) + calcHours(s.start, s.end))
    return m
  }, [activeShifts])

  const { totalPlanned, coverage, overtime, byRole } = useMemo(() => {
    const total = activeShifts.reduce((sum, s) => sum + calcHours(s.start, s.end), 0)
    const withShift = new Set(activeShifts.map(s => s.employeeId)).size
    const cov = employeesData.length > 0 ? Math.round((withShift / employeesData.length) * 100) : 0
    const contractTotal = employeesData.reduce((sum, e) => sum + e.weeklyHours, 0)
    const ot = Math.max(0, total - contractTotal)

    const roleHours: Record<string, number> = {}
    for (const s of activeShifts) {
      roleHours[s.role] = (roleHours[s.role] ?? 0) + calcHours(s.start, s.end)
    }
    const byRole = Object.entries(roleHours)
      .map(([name, hours]) => ({ name, color: ROLE_COLORS[name] ?? 'var(--border)', hours }))
      .sort((a, b) => b.hours - a.hours)

    return { totalPlanned: total, coverage: cov, overtime: ot, byRole }
  }, [activeShifts])

  const roles = useMemo(() => Array.from(new Set(employeesData.map(e => e.role))).sort(), [])

  const filteredEmps = useMemo(
    () => filterRole ? employeesData.filter(e => e.role === filterRole) : employeesData,
    [filterRole]
  )

  function handleShare() {
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <h1
        className="text-[18px] md:text-[20px] font-medium tracking-[-0.02em] mb-4 md:mb-5"
        style={{ color: 'var(--text-primary)' }}
      >
        Planning
      </h1>

      <div className="space-y-4">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>

          {/* Left: week nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              style={{ padding: '7px 9px' }}
              onClick={() => setWeekOffset(o => o - 1)}
              aria-label="Semaine précédente"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '7px 12px' }}
              onClick={() => setWeekOffset(0)}
            >
              {"Aujourd'hui"}
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '7px 9px' }}
              onClick={() => setWeekOffset(o => o + 1)}
              aria-label="Semaine suivante"
            >
              <ChevronRight size={14} />
            </button>
            <Calendar size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{weekLabel}</span>
              <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </div>

          {/* Center: view switcher */}
          <div style={{ display: 'flex', border: '0.5px solid var(--border)', borderRadius: '8px', overflow: 'hidden', fontSize: '13px' }}>
            <div
              style={{ padding: '6px 14px', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 150ms' }}
              onClick={() => demoAlert()}
              className="hover:text-[var(--text-primary)]"
            >Jour</div>
            <div style={{ padding: '6px 14px', backgroundColor: 'var(--accent)', color: '#FFFFFF', userSelect: 'none', borderLeft: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)' }}>
              Semaine
            </div>
            <div
              style={{ padding: '6px 14px', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 150ms' }}
              onClick={() => demoAlert()}
              className="hover:text-[var(--text-primary)]"
            >Mois</div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="dp-input py-1 text-[12px]"
                style={{ width: 'auto' }}
              >
                <option value="">Tous les postes</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              onClick={() => demoAlert()}
            >
              <SlidersHorizontal size={13} />Filtres
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '7px 9px', ...(weekLocked ? { borderColor: 'var(--warning)', color: 'var(--warning)' } : {}) }}
              onClick={() => setWeekLocked(l => !l)}
              title={weekLocked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {weekLocked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button className="btn-secondary" style={{ padding: '7px 9px' }} onClick={() => demoAlert()} title="Copier vers semaine suivante">
              <Copy size={13} />
            </button>
            <button className="btn-secondary" style={{ padding: '7px 9px' }} onClick={() => demoAlert()} title="Envoyer par email">
              <Mail size={13} />
            </button>
            <button className="btn-secondary" style={{ padding: '7px 9px' }} onClick={handleShare} title="Partager">
              {shareCopied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Share2 size={13} />}
            </button>
            <button className="btn-secondary" style={{ padding: '7px 9px' }} onClick={() => demoAlert()} title="Exporter PDF">
              <Printer size={13} />
            </button>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', borderColor: 'var(--accent)', color: 'var(--accent)' }}
              onClick={() => demoAlert('la planification IA est disponible dans la version complète.')}
              title="Générer le planning automatiquement"
            >
              <Sparkles size={13} />Générer
            </button>
            <button
              className="btn-primary"
              onClick={() => setWeekPublished(p => !p)}
              style={{ paddingLeft: '18px', paddingRight: '18px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              {weekPublished ? <><Check size={13} />Publié</> : 'Publier'}
            </button>
          </div>
        </div>

        {/* ── Metric cards ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <MetricCard
            icon={<Users size={18} />}
            iconBg="var(--accent-light)" iconColor="var(--accent)"
            value={totalPlanned > 0 ? formatHours(totalPlanned) : '0h'}
            label="Total planifiées"
            trend={totalPlanned > 0 ? 'up' : null}
          />
          <MetricCard
            icon={<UserCheck size={18} />}
            iconBg="rgba(255,140,66,0.15)" iconColor="#FF8C42"
            value="—"
            label="Total travaillées"
            trend={null}
          />
          <MetricCard
            icon={<Clock size={18} />}
            iconBg="rgba(255,255,255,0.06)" iconColor="var(--text-secondary)"
            value={overtime > 0 ? formatHours(overtime) : '0h'}
            label="Heures supp."
            trend={overtime > 2 ? 'up' : null}
          />
          <MetricCard
            icon={<Clock size={18} />}
            iconBg="rgba(108,99,255,0.15)" iconColor="var(--accent)"
            value={activeShifts.length > 0 ? `${coverage}%` : '—'}
            label="Couverture"
            trend={coverage >= 80 ? 'up' : coverage > 0 ? 'down' : null}
          />
        </div>

        {/* ── Timeline grid ─────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--bg-card)',
          overflow: 'hidden', opacity: weekLocked ? 0.72 : 1,
          filter: weekLocked ? 'saturate(0.45)' : 'none',
          transition: 'opacity 300ms, filter 300ms',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '200px' }} />
                {weekDates.map((_, i) => <col key={i} />)}
                <col style={{ width: '64px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ borderBottom: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)', padding: '12px 16px', textAlign: 'left', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>Employés</span>
                      <SlidersHorizontal size={11} style={{ color: 'var(--text-tertiary)', opacity: 0.6 }} />
                    </div>
                  </th>
                  {weekDates.map((date, i) => {
                    const today = isToday(date)
                    const count = dailyShiftCounts.get(DAY_KEYS[i]) ?? 0
                    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
                    const dayNum = date.getDate()
                    return (
                      <th key={i} style={{ borderBottom: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)', padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'capitalize', fontWeight: 400 }}>{dayName}.</span>
                          {today
                            ? <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>{dayNum}</div>
                            : <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', width: '28px', textAlign: 'center', lineHeight: '28px' }}>{dayNum}</span>
                          }
                          {count > 0 && (
                            <span style={{ fontSize: '10px', color: today ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                              {count} shift{count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                  <th style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)', padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>H/sem</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmps.map(emp => {
                  const weekTotal = DAY_KEYS.reduce((sum, day) => {
                    const ds = shiftMap.get(`${emp.id}__${day}`) ?? []
                    return sum + ds.reduce((s, sh) => s + calcHours(sh.start, sh.end), 0)
                  }, 0)
                  return (
                    <tr key={emp.id}>
                      <td style={{ borderBottom: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)', padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: `${emp.color}22`, border: `1.5px solid ${emp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: emp.color }}>{emp.initials}</span>
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px', lineHeight: 1 }}>{emp.role}</p>
                          </div>
                          {weekTotal > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                              {formatHours(weekTotal)} / sem.
                            </span>
                          )}
                        </div>
                      </td>
                      {weekDates.map((date, i) => {
                        const dayShifts = shiftMap.get(`${emp.id}__${DAY_KEYS[i]}`) ?? []
                        return (
                          <GridCell key={i} dayShifts={dayShifts} isTodayCol={isToday(date)} weekLocked={weekLocked} />
                        )
                      })}
                      <td style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {weekTotal > 0
                          ? <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatHours(weekTotal)}</span>
                          : <span style={{ fontSize: '14px', color: 'var(--border)', fontWeight: 300 }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ borderTop: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)', padding: '10px 16px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total / jour</span>
                  </td>
                  {weekDates.map((date, i) => {
                    const total = dailyHourTotals.get(DAY_KEYS[i]) ?? 0
                    const today = isToday(date)
                    return (
                      <td key={i} style={{ borderTop: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)', backgroundColor: today ? 'rgba(45,58,140,0.04)' : 'var(--bg-page)', padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: total > 0 ? (today ? 'var(--accent)' : 'var(--text-primary)') : 'var(--text-tertiary)' }}>
                          {total > 0 ? formatHours(total) : '—'}
                        </span>
                      </td>
                    )
                  })}
                  <td style={{ borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)', padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatHours(totalPlanned)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Bottom 3-card section ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>

          {/* Aperçu par service */}
          <div className="dp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px' }}>Aperçu par service</h3>
            <DonutChart data={byRole} />
          </div>

          {/* Alertes */}
          <div className="dp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px' }}>Alertes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overtime > 2 && (
                <AlertRow
                  iconBg="rgba(255,107,107,0.15)" iconColor="var(--danger)" icon={<Clock size={14} />}
                  title="Heures supplémentaires"
                  desc={`${formatHours(overtime)} au-dessus du contractuel cette semaine`}
                  badge={{ label: `+${formatHours(overtime)}`, color: 'var(--danger)', bg: 'rgba(255,107,107,0.15)' }}
                />
              )}
              {coverage < 80 && employeesData.length > 0 && (
                <AlertRow
                  iconBg="rgba(255,179,71,0.15)" iconColor="var(--warning)" icon={<AlertTriangle size={14} />}
                  title="Couverture insuffisante"
                  desc={`Seulement ${coverage}% des employés planifiés cette semaine`}
                  badge={{ label: `${100 - coverage}% manquants`, color: 'var(--warning)', bg: 'rgba(255,179,71,0.15)' }}
                />
              )}
              {overtime <= 2 && coverage >= 80 && (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>Aucune alerte active</p>
              )}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '0.5px solid var(--border)' }}>
              <a href="/manager/alertes" style={{ fontSize: '13px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                Voir toutes les alertes <ChevronRight size={13} />
              </a>
            </div>
          </div>

          {/* Activité récente */}
          <div className="dp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px' }}>Activité récente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weekPublished ? (
                <ActivityRow
                  iconBg="var(--accent-light)" iconColor="var(--accent)"
                  icon={<Check size={14} />}
                  desc="Semaine publiée"
                  sub={weekLabel}
                />
              ) : (
                <ActivityRow
                  iconBg="rgba(255,179,71,0.15)" iconColor="var(--warning)"
                  icon={<AlertTriangle size={14} />}
                  desc="Planning non publié"
                  sub={`${activeShifts.length} shift${activeShifts.length !== 1 ? 's' : ''} en attente`}
                />
              )}
              <ActivityRow
                iconBg="var(--accent-light)" iconColor="var(--accent)"
                icon={<Copy size={14} />}
                desc="Semaine précédente copiée"
                sub="Il y a 3 jours"
              />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '0.5px solid var(--border)' }}>
              <a href="/manager/planning" style={{ fontSize: '13px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                {"Voir toute l'activité"} <ChevronRight size={13} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
