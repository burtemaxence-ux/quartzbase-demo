'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users, Clock, TrendingUp, CalendarOff, AlarmClock, Download, Banknote } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────
type RapportTab = 'heures' | 'retards' | 'paie'
type Mode = 'day' | 'week' | 'month'
type LatenessFilter = 'all' | 'justified' | 'unjustified'
type PayFormat = 'generique' | 'payfit' | 'adp' | 'silae'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fh(h: number): string {
  const sign = h < 0 ? '-' : ''
  const abs = Math.abs(h)
  const hh = Math.floor(abs)
  const mm = Math.round((abs - hh) * 60)
  return `${sign}${hh}h${mm > 0 ? mm.toString().padStart(2, '0') : ''}`
}

function getWeekMonday(d: Date): Date {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = (day + 6) % 7
  dt.setDate(dt.getDate() - diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function getWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const m = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const s = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${m} – ${s}`
}

function getPeriodLabel(mode: Mode, ref: Date): { label: string; start: Date; end: Date } {
  if (mode === 'day') {
    const label = ref.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return { label: label.charAt(0).toUpperCase() + label.slice(1), start: ref, end: ref }
  }
  if (mode === 'week') {
    const monday = getWeekMonday(ref)
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    return { label: getWeekLabel(monday), start: monday, end: sunday }
  }
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
  const label = ref.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return { label: label.charAt(0).toUpperCase() + label.slice(1), start, end }
}

function navigatePeriod(mode: Mode, ref: Date, dir: 1 | -1): Date {
  const d = new Date(ref)
  if (mode === 'day')  { d.setDate(d.getDate() + dir); return d }
  if (mode === 'week') { d.setDate(d.getDate() + dir * 7); return d }
  d.setMonth(d.getMonth() + dir); return d
}

// ─── Demo data ───────────────────────────────────────────────────────────────
type HoursRow = {
  id: string; name: string; position: string; contractType: string; weeklyHours: number
  plannedHours: number; realHours: number; contractRefHours: number; diffHours: number
  plannedDays: number; totalBreakMinutes: number
  absenceCP: number; absenceRTT: number; absenceMaladie: number; absenceSS: number; absenceAutre: number
}

type LatenessRecord = {
  id: string; employeeName: string; position: string; date: string
  scheduledTime: string; actualTime: string; lateMinutes: number; justified: boolean
}

type PayeRow = {
  id: string; name: string; position: string; matricule: string
  normalHours: number; sup25Hours: number; sup50Hours: number
  cpDays: number; rttDays: number; maladieDays: number; ssDays: number; autreDays: number
}

const HOURS_ROWS: HoursRow[] = [
  { id: '1', name: 'Sophie Martin',   position: 'Boulangère', contractType: 'CDI', weeklyHours: 35, plannedHours: 35, realHours: 33.5, contractRefHours: 35, diffHours: 0,    plannedDays: 5, totalBreakMinutes: 150, absenceCP: 0, absenceRTT: 0, absenceMaladie: 0, absenceSS: 0, absenceAutre: 0 },
  { id: '2', name: 'Lucas Dubois',    position: 'Vendeur',    contractType: 'CDI', weeklyHours: 35, plannedHours: 28, realHours: 27,   contractRefHours: 35, diffHours: -7,   plannedDays: 4, totalBreakMinutes: 120, absenceCP: 0, absenceRTT: 1, absenceMaladie: 0, absenceSS: 0, absenceAutre: 0 },
  { id: '3', name: 'Emma Laurent',    position: 'Pâtissière', contractType: 'CDI', weeklyHours: 35, plannedHours: 21, realHours: 0,    contractRefHours: 35, diffHours: -14,  plannedDays: 3, totalBreakMinutes: 90,  absenceCP: 0, absenceRTT: 0, absenceMaladie: 2, absenceSS: 0, absenceAutre: 0 },
  { id: '4', name: 'Marc Petit',      position: 'Boulanger',  contractType: 'CDI', weeklyHours: 39, plannedHours: 39, realHours: 40.5, contractRefHours: 39, diffHours: 0,    plannedDays: 5, totalBreakMinutes: 150, absenceCP: 0, absenceRTT: 0, absenceMaladie: 0, absenceSS: 0, absenceAutre: 0 },
  { id: '5', name: 'Camille Bernard', position: 'Vendeuse',   contractType: 'CDD', weeklyHours: 24, plannedHours: 23, realHours: 23,   contractRefHours: 24, diffHours: -1,   plannedDays: 4, totalBreakMinutes: 90,  absenceCP: 0, absenceRTT: 1, absenceMaladie: 0, absenceSS: 0, absenceAutre: 0 },
  { id: '6', name: 'Théo Renard',     position: 'Vendeur',    contractType: 'CDI', weeklyHours: 35, plannedHours: 21, realHours: 21,   contractRefHours: 35, diffHours: -14,  plannedDays: 3, totalBreakMinutes: 90,  absenceCP: 0, absenceRTT: 0, absenceMaladie: 0, absenceSS: 3, absenceAutre: 0 },
]

const LATENESS_RECORDS: LatenessRecord[] = [
  { id: 'l1', employeeName: 'Lucas Dubois',    position: 'Vendeur',    date: '2026-06-09', scheduledTime: '07:00', actualTime: '07:14', lateMinutes: 14, justified: false },
  { id: 'l2', employeeName: 'Camille Bernard', position: 'Vendeuse',   date: '2026-06-10', scheduledTime: '08:30', actualTime: '08:47', lateMinutes: 17, justified: true  },
  { id: 'l3', employeeName: 'Théo Renard',     position: 'Vendeur',    date: '2026-06-11', scheduledTime: '09:00', actualTime: '09:23', lateMinutes: 23, justified: false },
]

const PAIE_ROWS: PayeRow[] = [
  { id: '1', name: 'Sophie Martin',   position: 'Boulangère', matricule: 'EMP001', normalHours: 35,   sup25Hours: 0, sup50Hours: 0, cpDays: 0, rttDays: 0, maladieDays: 0, ssDays: 0, autreDays: 0 },
  { id: '2', name: 'Lucas Dubois',    position: 'Vendeur',    matricule: 'EMP002', normalHours: 28,   sup25Hours: 0, sup50Hours: 0, cpDays: 0, rttDays: 1, maladieDays: 0, ssDays: 0, autreDays: 0 },
  { id: '3', name: 'Emma Laurent',    position: 'Pâtissière', matricule: 'EMP003', normalHours: 21,   sup25Hours: 0, sup50Hours: 0, cpDays: 0, rttDays: 0, maladieDays: 2, ssDays: 0, autreDays: 0 },
  { id: '4', name: 'Marc Petit',      position: 'Boulanger',  matricule: 'EMP004', normalHours: 39,   sup25Hours: 1.5, sup50Hours: 0, cpDays: 0, rttDays: 0, maladieDays: 0, ssDays: 0, autreDays: 0 },
  { id: '5', name: 'Camille Bernard', position: 'Vendeuse',   matricule: 'EMP005', normalHours: 23,   sup25Hours: 0, sup50Hours: 0, cpDays: 0, rttDays: 1, maladieDays: 0, ssDays: 0, autreDays: 0 },
  { id: '6', name: 'Théo Renard',     position: 'Vendeur',    matricule: 'EMP006', normalHours: 21,   sup25Hours: 0, sup50Hours: 0, cpDays: 0, rttDays: 0, maladieDays: 0, ssDays: 3, autreDays: 0 },
]

const POSTES = ['Boulanger', 'Boulangère', 'Vendeur', 'Vendeuse', 'Pâtissière']
const EMPLOYEES = HOURS_ROWS.map(r => ({ id: r.id, name: r.name }))

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RapportPage() {
  const [mode, setMode] = useState<Mode>('week')
  const [refDate, setRefDate] = useState(new Date('2026-06-14'))
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [selectedPoste, setSelectedPoste] = useState('all')
  const [tab, setTab] = useState<RapportTab>('heures')
  const [latenessFilter, setLatenessFilter] = useState<LatenessFilter>('all')
  const [latenessData, setLatenessData] = useState<LatenessRecord[]>(LATENESS_RECORDS)
  const [payFormat, setPayFormat] = useState<PayFormat>('generique')

  const period = useMemo(() => getPeriodLabel(mode, refDate), [mode, refDate])

  const filteredRows = useMemo(() => HOURS_ROWS.filter(r =>
    (selectedEmployee === 'all' || r.id === selectedEmployee) &&
    (selectedPoste === 'all' || r.position === selectedPoste)
  ), [selectedEmployee, selectedPoste])

  const filteredPaie = useMemo(() => PAIE_ROWS.filter(r =>
    (selectedEmployee === 'all' || r.id === selectedEmployee) &&
    (selectedPoste === 'all' || r.position === selectedPoste)
  ), [selectedEmployee, selectedPoste])

  const filteredLateness = useMemo(() => {
    let data = latenessData
    if (selectedEmployee !== 'all') data = data.filter(r => EMPLOYEES.find(e => e.id === selectedEmployee)?.name === r.employeeName)
    if (latenessFilter === 'justified') return data.filter(r => r.justified)
    if (latenessFilter === 'unjustified') return data.filter(r => !r.justified)
    return data
  }, [latenessData, selectedEmployee, latenessFilter])

  const totals = useMemo(() => ({
    employees: filteredRows.length,
    plannedHours: filteredRows.reduce((s, r) => s + r.plannedHours, 0),
    realHours: filteredRows.reduce((s, r) => s + r.realHours, 0),
    diffHours: filteredRows.reduce((s, r) => s + r.diffHours, 0),
    absences: filteredRows.reduce((s, r) => s + r.absenceCP + r.absenceRTT + r.absenceMaladie + r.absenceSS + r.absenceAutre, 0),
  }), [filteredRows])

  const presenceRate = useMemo(() => {
    if (filteredRows.length === 0) return null
    const rate = filteredRows.filter(r => r.realHours > 0).length / filteredRows.length * 100
    return Math.round(rate)
  }, [filteredRows])

  function toggleJustified(id: string) {
    setLatenessData(prev => prev.map(r => r.id === id ? { ...r, justified: !r.justified } : r))
  }

  const tabBtn = (key: RapportTab, label: string, i: number, icon?: React.ReactNode) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors duration-150"
      style={{
        backgroundColor: tab === key ? 'var(--text-primary)' : 'transparent',
        color: tab === key ? 'var(--bg-card)' : 'var(--text-tertiary)',
        borderLeft: i > 0 ? '0.5px solid var(--border)' : undefined,
      }}
    >
      {icon}{label}
    </button>
  )

  const modeBtn = (key: Mode, label: string, i: number) => (
    <button
      key={key}
      onClick={() => setMode(key)}
      className="px-3 py-1.5 text-[13px] font-medium transition-colors duration-150"
      style={{
        backgroundColor: mode === key ? 'var(--text-primary)' : 'transparent',
        color: mode === key ? 'var(--bg-card)' : 'var(--text-tertiary)',
        borderLeft: i > 0 ? '0.5px solid var(--border)' : undefined,
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-full">
      {/* Sticky header */}
      <div className="sticky top-14 md:top-11 z-10" style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap min-h-[56px] py-2">
            <h1 className="text-[20px] font-medium tracking-[-0.02em] shrink-0" style={{ color: 'var(--text-primary)' }}>Rapport</h1>

            {/* Report type tabs */}
            <div className="flex overflow-hidden" style={{ border: '0.5px solid var(--border)', borderRadius: '8px' }}>
              {tabBtn('heures', 'Heures', 0)}
              {tabBtn('retards', 'Retards', 1, <AlarmClock className="h-3.5 w-3.5" />)}
              {tabBtn('paie', 'Paie', 2, <Banknote className="h-3.5 w-3.5" />)}
            </div>

            {/* Mode tabs */}
            <div className="flex overflow-hidden" style={{ border: '0.5px solid var(--border)', borderRadius: '8px' }}>
              {modeBtn('day', 'Jour', 0)}
              {modeBtn('week', 'Semaine', 1)}
              {modeBtn('month', 'Mois', 2)}
            </div>

            {/* Period navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRefDate(d => navigatePeriod(mode, d, -1))}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium min-w-[160px] text-center px-1" style={{ color: 'var(--text-primary)' }}>
                {period.label}
              </span>
              <button
                onClick={() => setRefDate(d => navigatePeriod(mode, d, 1))}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Filters */}
            <select
              value={selectedPoste}
              onChange={e => setSelectedPoste(e.target.value)}
              className="text-[13px] px-3 py-1.5 rounded-lg focus:outline-none"
              style={{ border: '0.5px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value="all">Tous les postes</option>
              {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="text-[13px] px-3 py-1.5 rounded-lg focus:outline-none ml-auto"
              style={{ border: '0.5px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value="all">Tous les employés</option>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {tab === 'heures' && (
              <button
                onClick={() => alert('🎭 Mode démo')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-page)', border: '0.5px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-6 max-w-6xl mx-auto space-y-6">

        {/* ── Heures tab ─────────────────────────────────────────────── */}
        {tab === 'heures' && (
          <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {[
                { icon: Users,       label: 'Employés',      value: String(totals.employees), color: 'var(--text-primary)' },
                { icon: Clock,       label: 'H. planifiées', value: fh(totals.plannedHours),  color: 'var(--text-primary)' },
                { icon: TrendingUp,  label: 'Écart contrat', value: `${totals.diffHours >= 0 ? '+' : ''}${fh(totals.diffHours)}`, color: totals.diffHours > 0.1 ? 'var(--success)' : totals.diffHours < -0.1 ? 'var(--danger)' : 'var(--text-primary)' },
                { icon: CalendarOff, label: "J. d'absence",  value: String(totals.absences),  color: 'var(--text-primary)' },
                { icon: TrendingUp,  label: 'Taux présence', value: presenceRate === null ? '—' : `${presenceRate}%`, color: presenceRate === null ? 'var(--text-tertiary)' : presenceRate >= 80 ? 'var(--success)' : presenceRate >= 60 ? 'var(--warning)' : 'var(--danger)' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  </div>
                  <p className="text-[20px] font-normal" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '0.5px solid var(--border)' }}>
                      {['Employé', 'Contrat', 'H. planif.', 'H. réelles', 'H. contrat', 'Écart', 'Jours', 'Pauses', 'Absences'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)', textAlign: ['H. planif.', 'H. réelles', 'H. contrat', 'Écart', 'Jours', 'Pauses'].includes(h) ? 'right' : 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => {
                      const totalAbs = row.absenceCP + row.absenceRTT + row.absenceMaladie + row.absenceSS + row.absenceAutre
                      return (
                        <tr key={row.id} style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[13px] leading-tight" style={{ color: 'var(--text-primary)' }}>{row.name}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{row.position}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{row.contractType}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{row.weeklyHours}h/sem.</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>{fh(row.plannedHours)}</td>
                          <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.realHours > 0 ? fh(row.realHours) : '—'}</td>
                          <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.contractRefHours > 0 ? fh(row.contractRefHours) : '—'}</td>
                          <td className="px-4 py-3 text-right text-[13px] font-medium" style={{ color: row.diffHours > 0.1 ? 'var(--success)' : row.diffHours < -0.1 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                            {row.contractRefHours > 0 ? `${row.diffHours >= 0 ? '+' : ''}${fh(row.diffHours)}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-primary)' }}>{row.plannedDays > 0 ? `${row.plannedDays}j` : '—'}</td>
                          <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.totalBreakMinutes > 0 ? `${row.totalBreakMinutes}min` : '—'}</td>
                          <td className="px-4 py-3">
                            {totalAbs === 0 ? (
                              <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {row.absenceCP > 0      && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>CP {row.absenceCP}j</span>}
                                {row.absenceRTT > 0     && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>RTT {row.absenceRTT}j</span>}
                                {row.absenceMaladie > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,179,71,0.12)', color: 'var(--warning)' }}>Mal. {row.absenceMaladie}j</span>}
                                {row.absenceSS > 0      && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,107,107,0.12)', color: 'var(--danger)' }}>SS {row.absenceSS}j</span>}
                                {row.absenceAutre > 0   && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>Autre {row.absenceAutre}j</span>}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  {filteredRows.length > 1 && (
                    <tfoot>
                      <tr style={{ backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border)' }}>
                        <td colSpan={2} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Total</td>
                        <td className="px-4 py-3 text-right font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{fh(totals.plannedHours)}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{totals.realHours > 0 ? fh(totals.realHours) : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>—</td>
                        <td className="px-4 py-3 text-right font-bold text-[13px]" style={{ color: totals.diffHours > 0.1 ? 'var(--success)' : totals.diffHours < -0.1 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                          {totals.diffHours >= 0 ? '+' : ''}{fh(totals.diffHours)}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Retards tab ─────────────────────────────────────────────── */}
        {tab === 'retards' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: AlarmClock, label: 'Total retards',  value: latenessData.length.toString(), danger: false },
                { icon: Clock,      label: 'Minutes perdues', value: `${latenessData.reduce((s, r) => s + r.lateMinutes, 0)} min`, danger: false },
                { icon: TrendingUp, label: 'Non justifiés',  value: latenessData.filter(r => !r.justified).length.toString(), danger: latenessData.some(r => !r.justified) },
              ].map(({ icon: Icon, label, value, danger }) => (
                <div key={label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  </div>
                  <p className="text-[20px] font-normal" style={{ color: danger ? 'var(--danger)' : 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Filtrer :</span>
              {(['all', 'justified', 'unjustified'] as LatenessFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setLatenessFilter(f)}
                  className="px-3 py-1 text-[13px] rounded-full transition-colors duration-150"
                  style={{
                    border: latenessFilter === f ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                    backgroundColor: latenessFilter === f ? 'var(--accent-light)' : 'transparent',
                    color: latenessFilter === f ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {f === 'all' ? 'Tous' : f === 'justified' ? 'Justifiés' : 'Non justifiés'}
                </button>
              ))}
            </div>

            {filteredLateness.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl" style={{ border: '0.5px dashed var(--border)' }}>
                <AlarmClock className="h-8 w-8 mb-3" style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
                <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Aucun retard pour cette période</p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>Tous les employés sont à l&apos;heure.</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '0.5px solid var(--border)' }}>
                        {['Employé', 'Date', 'Planifié', 'Arrivée', 'Retard', 'Statut'].map(h => (
                          <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-left" style={{ color: 'var(--text-tertiary)', textAlign: h === 'Retard' ? 'right' : 'left' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLateness.map((rec, i) => (
                        <tr key={rec.id} style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[13px] leading-tight" style={{ color: 'var(--text-primary)' }}>{rec.employeeName}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{rec.position}</p>
                          </td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(rec.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{rec.scheduledTime}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{rec.actualTime}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-medium text-[13px]" style={{ color: 'var(--warning)' }}>+{rec.lateMinutes} min</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleJustified(rec.id)}
                              className="text-[12px] font-medium px-2.5 py-1 rounded-full transition-colors duration-150"
                              style={rec.justified
                                ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', border: '0.5px solid var(--accent)' }
                                : { backgroundColor: 'rgba(255,107,107,0.12)', color: 'var(--danger)', border: '0.5px solid var(--danger)' }
                              }
                            >
                              {rec.justified ? 'Justifié' : 'Non justifié'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Paie tab ────────────────────────────────────────────────── */}
        {tab === 'paie' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Format :</span>
              {(['generique', 'payfit', 'adp', 'silae'] as PayFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setPayFormat(f)}
                  className="px-3 py-1 text-[13px] rounded-full transition-colors duration-150"
                  style={{
                    border: payFormat === f ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                    backgroundColor: payFormat === f ? 'var(--accent-light)' : 'transparent',
                    color: payFormat === f ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {f === 'generique' ? 'Générique' : f === 'payfit' ? 'PayFit' : f === 'adp' ? 'ADP Decidium' : 'Silae'}
                </button>
              ))}
              <button
                onClick={() => alert('🎭 Mode démo')}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                <Download className="h-3.5 w-3.5" /> Exporter CSV
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'H. normales', value: fh(filteredPaie.reduce((s, r) => s + r.normalHours, 0)) },
                { label: 'H. sup. 25%', value: fh(filteredPaie.reduce((s, r) => s + r.sup25Hours, 0)) },
                { label: 'H. sup. 50%', value: fh(filteredPaie.reduce((s, r) => s + r.sup50Hours, 0)) },
                { label: "J. d'absence", value: String(filteredPaie.reduce((s, r) => s + r.cpDays + r.rttDays + r.maladieDays + r.ssDays + r.autreDays, 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] mb-2" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                  <p className="text-[20px] font-normal" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '0.5px solid var(--border)' }}>
                      {['Matricule', 'Employé', 'H. normales', 'H. sup 25%', 'H. sup 50%', 'CP', 'RTT', 'Maladie', 'Sans solde', 'Autre'].map((h, i) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)', textAlign: i >= 2 ? 'right' : 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaie.map((row, i) => (
                      <tr key={row.id} style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <td className="px-4 py-3 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>{row.matricule}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[13px] leading-tight" style={{ color: 'var(--text-primary)' }}>{row.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{row.position}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>{row.normalHours > 0 ? fh(row.normalHours) : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]">
                          {row.sup25Hours > 0 ? <span className="font-medium" style={{ color: 'var(--warning)' }}>{fh(row.sup25Hours)}</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px]">
                          {row.sup50Hours > 0 ? <span className="font-medium" style={{ color: 'var(--danger)' }}>{fh(row.sup50Hours)}</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.cpDays > 0 ? `${row.cpDays}j` : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.rttDays > 0 ? `${row.rttDays}j` : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.maladieDays > 0 ? `${row.maladieDays}j` : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.ssDays > 0 ? `${row.ssDays}j` : '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.autreDays > 0 ? `${row.autreDays}j` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  {filteredPaie.length > 1 && (
                    <tfoot>
                      <tr style={{ backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border)' }}>
                        <td colSpan={2} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Total</td>
                        <td className="px-4 py-3 text-right font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{fh(filteredPaie.reduce((s, r) => s + r.normalHours, 0))}</td>
                        <td className="px-4 py-3 text-right font-bold text-[13px]" style={{ color: 'var(--warning)' }}>{fh(filteredPaie.reduce((s, r) => s + r.sup25Hours, 0))}</td>
                        <td className="px-4 py-3 text-right font-bold text-[13px]" style={{ color: 'var(--danger)' }}>{fh(filteredPaie.reduce((s, r) => s + r.sup50Hours, 0))}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{filteredPaie.reduce((s, r) => s + r.cpDays, 0) || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{filteredPaie.reduce((s, r) => s + r.rttDays, 0) || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{filteredPaie.reduce((s, r) => s + r.maladieDays, 0) || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{filteredPaie.reduce((s, r) => s + r.ssDays, 0) || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-[13px]" style={{ color: 'var(--text-secondary)' }}>{filteredPaie.reduce((s, r) => s + r.autreDays, 0) || '—'}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
