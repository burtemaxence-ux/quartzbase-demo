'use client'

import { useState, useEffect } from 'react'
import { Wifi, Users, LogIn, LogOut, Coffee, Clock, CalendarDays } from 'lucide-react'
import { TutorialPanel } from '@/components/tutorial-panel'

type Period = 'today' | 'week' | 'month'
type RowStatus = 'scheduled' | 'present' | 'on_break' | 'departed' | 'absent' | 'no_data'

interface DemoRow {
  id: string
  date: string
  employeeName: string
  employeeRole: string
  initials: string
  shiftStart: string | null
  shiftEnd: string | null
  clockIn: string | null
  clockOut: string | null
  status: RowStatus
  lateMinutes: number
  workedMinutes: number
}

const STATUS_CFG: Record<RowStatus, { label: string; bg: string; text: string; dotClass?: string }> = {
  present:   { label: 'Présent',  bg: '#DCFCE7',             text: '#16A34A',               dotClass: 'active'   },
  on_break:  { label: 'En pause', bg: '#FEF3C7',             text: '#D97706',               dotClass: 'warning'  },
  departed:  { label: 'Parti',    bg: 'var(--bg-page)',      text: 'var(--text-secondary)'                       },
  absent:    { label: 'Absent',   bg: '#FEE2E2',             text: '#DC2626'                                     },
  scheduled: { label: 'Attendu',  bg: 'var(--accent-light)', text: 'var(--accent)'                              },
  no_data:   { label: '—',        bg: 'var(--bg-page)',      text: 'var(--text-tertiary)'                       },
}

// Demo date: 2026-06-14 (Sunday)
const TODAY_ROWS: DemoRow[] = [
  { id: '1', date: '2026-06-14', employeeName: 'Lucas Dubois',   employeeRole: 'Boulanger',   initials: 'LD', shiftStart: '05:00', shiftEnd: '13:00', clockIn: '05:03', clockOut: '13:02', status: 'departed',  lateMinutes: 0,  workedMinutes: 479 },
  { id: '2', date: '2026-06-14', employeeName: 'Sophie Martin',  employeeRole: 'Vendeuse',    initials: 'SM', shiftStart: '06:30', shiftEnd: '14:30', clockIn: '06:28', clockOut: null,    status: 'present',   lateMinutes: 0,  workedMinutes: 0   },
  { id: '3', date: '2026-06-14', employeeName: 'Théo Renard',    employeeRole: 'Pâtissier',   initials: 'TR', shiftStart: '05:30', shiftEnd: '13:30', clockIn: '05:45', clockOut: null,    status: 'on_break',  lateMinutes: 15, workedMinutes: 0   },
  { id: '4', date: '2026-06-14', employeeName: 'Camille Bernard',employeeRole: 'Vendeur',     initials: 'CB', shiftStart: '08:00', shiftEnd: '16:00', clockIn: null,    clockOut: null,    status: 'absent',    lateMinutes: 0,  workedMinutes: 0   },
  { id: '5', date: '2026-06-14', employeeName: 'Marie Dupont',   employeeRole: 'Responsable', initials: 'MD', shiftStart: '09:00', shiftEnd: '17:00', clockIn: null,    clockOut: null,    status: 'scheduled', lateMinutes: 0,  workedMinutes: 0   },
]

const WEEK_ROWS: DemoRow[] = [
  // Monday 2026-06-08
  { id: 'w1',  date: '2026-06-08', employeeName: 'Lucas Dubois',    employeeRole: 'Boulanger',   initials: 'LD', shiftStart: '05:00', shiftEnd: '13:00', clockIn: '05:01', clockOut: '13:05', status: 'departed', lateMinutes: 0,  workedMinutes: 484 },
  { id: 'w2',  date: '2026-06-08', employeeName: 'Sophie Martin',   employeeRole: 'Vendeuse',    initials: 'SM', shiftStart: '06:30', shiftEnd: '14:30', clockIn: '06:35', clockOut: '14:32', status: 'departed', lateMinutes: 5,  workedMinutes: 477 },
  { id: 'w3',  date: '2026-06-08', employeeName: 'Théo Renard',     employeeRole: 'Pâtissier',   initials: 'TR', shiftStart: '05:30', shiftEnd: '13:30', clockIn: '05:28', clockOut: '13:31', status: 'departed', lateMinutes: 0,  workedMinutes: 483 },
  { id: 'w4',  date: '2026-06-08', employeeName: 'Camille Bernard', employeeRole: 'Vendeur',     initials: 'CB', shiftStart: '08:00', shiftEnd: '16:00', clockIn: '08:02', clockOut: '16:00', status: 'departed', lateMinutes: 0,  workedMinutes: 478 },
  // Tuesday 2026-06-09
  { id: 'w5',  date: '2026-06-09', employeeName: 'Lucas Dubois',    employeeRole: 'Boulanger',   initials: 'LD', shiftStart: '05:00', shiftEnd: '13:00', clockIn: '05:12', clockOut: '13:00', status: 'departed', lateMinutes: 12, workedMinutes: 468 },
  { id: 'w6',  date: '2026-06-09', employeeName: 'Sophie Martin',   employeeRole: 'Vendeuse',    initials: 'SM', shiftStart: '06:30', shiftEnd: '14:30', clockIn: '06:30', clockOut: '14:31', status: 'departed', lateMinutes: 0,  workedMinutes: 481 },
  { id: 'w7',  date: '2026-06-09', employeeName: 'Marie Dupont',    employeeRole: 'Responsable', initials: 'MD', shiftStart: '08:00', shiftEnd: '17:00', clockIn: '08:00', clockOut: '17:00', status: 'departed', lateMinutes: 0,  workedMinutes: 540 },
  // Wednesday 2026-06-10
  { id: 'w8',  date: '2026-06-10', employeeName: 'Théo Renard',     employeeRole: 'Pâtissier',   initials: 'TR', shiftStart: '05:30', shiftEnd: '13:30', clockIn: '05:29', clockOut: '13:35', status: 'departed', lateMinutes: 0,  workedMinutes: 486 },
  { id: 'w9',  date: '2026-06-10', employeeName: 'Camille Bernard', employeeRole: 'Vendeur',     initials: 'CB', shiftStart: '08:00', shiftEnd: '16:00', clockIn: null,    clockOut: null,    status: 'absent',   lateMinutes: 0,  workedMinutes: 0   },
  { id: 'w10', date: '2026-06-10', employeeName: 'Marie Dupont',    employeeRole: 'Responsable', initials: 'MD', shiftStart: '09:00', shiftEnd: '17:00', clockIn: '09:03', clockOut: '17:00', status: 'departed', lateMinutes: 0,  workedMinutes: 477 },
  // Thursday 2026-06-11
  { id: 'w11', date: '2026-06-11', employeeName: 'Lucas Dubois',    employeeRole: 'Boulanger',   initials: 'LD', shiftStart: '05:00', shiftEnd: '13:00', clockIn: '05:00', clockOut: '13:00', status: 'departed', lateMinutes: 0,  workedMinutes: 480 },
  { id: 'w12', date: '2026-06-11', employeeName: 'Sophie Martin',   employeeRole: 'Vendeuse',    initials: 'SM', shiftStart: '06:30', shiftEnd: '14:30', clockIn: '06:45', clockOut: '14:30', status: 'departed', lateMinutes: 15, workedMinutes: 465 },
  // Friday 2026-06-12
  { id: 'w13', date: '2026-06-12', employeeName: 'Lucas Dubois',    employeeRole: 'Boulanger',   initials: 'LD', shiftStart: '05:00', shiftEnd: '13:00', clockIn: '04:58', clockOut: '13:05', status: 'departed', lateMinutes: 0,  workedMinutes: 487 },
  { id: 'w14', date: '2026-06-12', employeeName: 'Théo Renard',     employeeRole: 'Pâtissier',   initials: 'TR', shiftStart: '05:30', shiftEnd: '13:30', clockIn: '05:31', clockOut: '13:30', status: 'departed', lateMinutes: 0,  workedMinutes: 479 },
  { id: 'w15', date: '2026-06-12', employeeName: 'Camille Bernard', employeeRole: 'Vendeur',     initials: 'CB', shiftStart: '08:00', shiftEnd: '16:00', clockIn: '08:00', clockOut: '16:00', status: 'departed', lateMinutes: 0,  workedMinutes: 480 },
  { id: 'w16', date: '2026-06-12', employeeName: 'Marie Dupont',    employeeRole: 'Responsable', initials: 'MD', shiftStart: '09:00', shiftEnd: '17:00', clockIn: '09:00', clockOut: '17:02', status: 'departed', lateMinutes: 0,  workedMinutes: 482 },
  // Saturday 2026-06-13
  { id: 'w17', date: '2026-06-13', employeeName: 'Sophie Martin',   employeeRole: 'Vendeuse',    initials: 'SM', shiftStart: '06:30', shiftEnd: '14:30', clockIn: '06:30', clockOut: '14:35', status: 'departed', lateMinutes: 0,  workedMinutes: 485 },
  { id: 'w18', date: '2026-06-13', employeeName: 'Camille Bernard', employeeRole: 'Vendeur',     initials: 'CB', shiftStart: '07:00', shiftEnd: '15:00', clockIn: '07:03', clockOut: '15:00', status: 'departed', lateMinutes: 0,  workedMinutes: 477 },
  // Sunday 2026-06-14
  ...TODAY_ROWS.map(r => ({ ...r, id: 'wt' + r.id })),
]

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function PresencesDashboardPage() {
  const [period, setPeriod] = useState<Period>('today')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const rows = period === 'today' ? TODAY_ROWS : WEEK_ROWS

  const counts = {
    present:  TODAY_ROWS.filter(r => r.status === 'present').length,
    on_break: TODAY_ROWS.filter(r => r.status === 'on_break').length,
    departed: TODAY_ROWS.filter(r => r.status === 'departed').length,
    absent:   TODAY_ROWS.filter(r => r.status === 'absent').length,
  }

  return (
    <div style={{ padding: isMobile ? '12px 16px' : '16px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Badgeuse
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'capitalize' }}>
            dimanche 14 juin 2026
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {period === 'today' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 6, color: 'var(--success)', backgroundColor: '#DCFCE7', border: '0.5px solid var(--success)' }}>
              <Wifi size={12} />
              <span className="dp-status-dot active" style={{ width: 6, height: 6 }} />
              Temps réel
            </div>
          )}
          <div style={{ display: 'flex', overflow: 'hidden', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
            {(['today', 'week', 'month'] as Period[]).map((p, i) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 12px', border: 'none', cursor: 'pointer', transition: 'all 150ms',
                  borderLeft: i > 0 ? '0.5px solid var(--border)' : 'none',
                  backgroundColor: period === p ? 'var(--text-primary)' : 'transparent',
                  color: period === p ? 'var(--bg-card)' : 'var(--text-tertiary)',
                }}
              >
                {p === 'today' ? "Aujourd'hui" : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorial */}
      <div style={{ marginBottom: 16 }}>
        <TutorialPanel sectionId="presences" />
      </div>

      {/* Stats — today only */}
      {period === 'today' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {([
            { key: 'present'  as const, icon: LogIn,  label: 'En service', color: '#16A34A',             bg: '#DCFCE7'        },
            { key: 'on_break' as const, icon: Coffee, label: 'En pause',   color: '#D97706',             bg: '#FEF3C7'        },
            { key: 'departed' as const, icon: LogOut, label: 'Partis',     color: 'var(--text-secondary)', bg: 'var(--bg-page)' },
            { key: 'absent'   as const, icon: Users,  label: 'Absents',    color: '#DC2626',             bg: '#FEE2E2'        },
          ]).map(({ key, icon: Icon, label, color, bg }) => (
            <div key={key} style={{ borderRadius: 10, padding: 12, textAlign: 'center', backgroundColor: bg, border: '0.5px solid var(--border)' }}>
              <Icon size={14} style={{ color, display: 'block', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 20, fontWeight: 400, lineHeight: 1, color, margin: 0 }}>{counts[key]}</p>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginTop: 6, marginBottom: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{ borderRadius: 12, padding: 48, textAlign: 'center', border: '0.5px dashed var(--border)' }}>
          <CalendarDays size={32} style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aucune donnée pour cette période</p>
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflowX: 'auto', border: '0.5px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div>
            <table style={{ width: '100%', minWidth: 580, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                  {period !== 'today' && (
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Date</th>
                  )}
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Employé</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Planifié</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Arrivée</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Départ</th>
                  {period === 'today' && (
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />Durée</span>
                    </th>
                  )}
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const cfg = STATUS_CFG[row.status]
                  const isOnTime = row.lateMinutes === 0 && row.clockIn !== null && row.status === 'departed'
                  return (
                    <tr key={row.id} style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: row.status === 'absent' ? 'rgba(254,226,226,0.15)' : 'transparent' }}>
                      {period !== 'today' && (
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                          {formatDate(row.date)}
                        </td>
                      )}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {row.initials}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>{row.employeeName}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>{row.employeeRole}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {row.shiftStart && row.shiftEnd ? `${row.shiftStart} – ${row.shiftEnd}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: row.clockIn ? 'var(--text-primary)' : 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {row.clockIn ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {row.clockOut ?? '—'}
                      </td>
                      {period === 'today' && (
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {row.workedMinutes > 0 ? formatDuration(row.workedMinutes) : '—'}
                        </td>
                      )}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {row.status !== 'no_data' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, backgroundColor: cfg.bg, color: cfg.text, whiteSpace: 'nowrap' }}>
                              {cfg.dotClass ? (
                                <span className={`dp-status-dot ${cfg.dotClass}`} style={{ width: 6, height: 6 }} />
                              ) : (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.text, display: 'inline-block', flexShrink: 0 }} />
                              )}
                              {cfg.label}
                            </span>
                          )}
                          {row.lateMinutes > 0 && (
                            <span className="dp-badge-warning" style={{ whiteSpace: 'nowrap' }}>En retard {row.lateMinutes} min</span>
                          )}
                          {isOnTime && (
                            <span className="dp-badge-success" style={{ whiteSpace: 'nowrap' }}>À l&apos;heure</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
