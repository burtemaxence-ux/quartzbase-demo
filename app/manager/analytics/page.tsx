'use client'

import { useState } from 'react'
import {
  Euro, Clock, TrendingUp, CalendarOff, UserMinus, AlertTriangle,
  Target, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Palette (dark-mode adapted — no CSS vars in SVG) ──────────────────────────

const C = {
  primary:   '#6C63FF',
  primaryLt: 'rgba(108,99,255,0.12)',
  success:   '#00D4AA',
  successLt: 'rgba(0,212,170,0.12)',
  warning:   '#FFB347',
  warningLt: 'rgba(255,179,71,0.12)',
  danger:    '#FF6B6B',
  dangerLt:  'rgba(255,107,107,0.12)',
  border:    '#2a2a3a',
  text:      '#f0f0f8',
  textSec:   '#9090a8',
  textTer:   '#5a5a72',
  planned:   '#8B85FF',
  real:      '#6C63FF',
  absence: {
    maladie: '#FF6B6B',
    cp:      '#6C63FF',
    rtt:     '#A78BFA',
    autres:  '#FFB347',
  },
} as const

// ── Types ──────────────────────────────────────────────────────────────────────

type PeriodKey = '4w' | '3m' | '6m' | '12m'
type FlagKey = 'sick_frequent' | 'late_chronic' | 'absence_high'

interface Bucket {
  label: string
  laborCost: number
  plannedHours: number
  realHours: number
  presenceRate: number
  sickDays: number
  cpDays: number
  rttDays: number
  otherDays: number
}

interface EmployeeAnalytic {
  id: number
  name: string
  position: string
  laborCost: number
  realHours: number
  absenceRate: number
  absenceDays: number
  unjustifiedLateCount: number
  flags: FlagKey[]
}

interface AbsenceType { type: string; days: number; color: string }
interface TurnoverEntry { name: string; position: string; contractType: string; monthKey: string; monthLabel: string }

interface DemoData {
  periodLabel: string
  kpi: {
    totalLaborCost: number; totalRealHours: number; totalPlannedHours: number
    avgPresenceRate: number; totalAbsenceDays: number; totalSickDays: number
    turnoverCount: number; chronicCount: number; activeEmployees: number
  }
  buckets: Bucket[]
  absenceByType: AbsenceType[]
  employees: EmployeeAnalytic[]
  turnover: TurnoverEntry[]
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_EMPLOYEES: EmployeeAnalytic[] = [
  { id: 4, name: 'Marc Petit',        position: 'Responsable', laborCost: 3100, realHours: 156, absenceRate: 0,  absenceDays: 0, unjustifiedLateCount: 0, flags: [] },
  { id: 1, name: 'Sophie Martin',     position: 'Boulanger',   laborCost: 2800, realHours: 148, absenceRate: 4,  absenceDays: 3, unjustifiedLateCount: 0, flags: [] },
  { id: 3, name: 'Camille Bernard',   position: 'Pâtissier',   laborCost: 2600, realHours: 105, absenceRate: 6,  absenceDays: 3, unjustifiedLateCount: 1, flags: [] },
  { id: 6, name: 'Thomas Moreau',     position: 'Boulanger',   laborCost: 2500, realHours: 96,  absenceRate: 3,  absenceDays: 1, unjustifiedLateCount: 0, flags: [] },
  { id: 2, name: 'Lucas Dubois',      position: 'Vendeur',     laborCost: 2400, realHours: 120, absenceRate: 12, absenceDays: 6, unjustifiedLateCount: 3, flags: ['sick_frequent', 'late_chronic'] },
  { id: 8, name: 'Antoine Rousseau',  position: 'Pâtissier',   laborCost: 2400, realHours: 96,  absenceRate: 0,  absenceDays: 0, unjustifiedLateCount: 0, flags: [] },
  { id: 5, name: 'Léa Durand',        position: 'Vendeur',     laborCost: 2100, realHours: 90,  absenceRate: 22, absenceDays: 5, unjustifiedLateCount: 5, flags: ['sick_frequent', 'absence_high'] },
  { id: 7, name: 'Emma Laurent',      position: 'Vendeur',     laborCost: 1750, realHours: 71,  absenceRate: 5,  absenceDays: 1, unjustifiedLateCount: 1, flags: [] },
]

const TURNOVER_3M: TurnoverEntry[] = [
  { name: 'Clara Dupont', position: 'Vendeuse', contractType: 'CDD', monthKey: '2026-05', monthLabel: 'Mai 2026' },
]

const DEMO: Record<PeriodKey, DemoData> = {
  '4w': {
    periodLabel: '19 mai – 14 juin 2026',
    kpi: { totalLaborCost: 5730, totalRealHours: 302, totalPlannedHours: 320, avgPresenceRate: 86, totalAbsenceDays: 9, totalSickDays: 3, turnoverCount: 0, chronicCount: 2, activeEmployees: 8 },
    buckets: [
      { label: 'S.21', laborCost: 1380, plannedHours: 76, realHours: 70, presenceRate: 82, sickDays: 1, cpDays: 2, rttDays: 0, otherDays: 0 },
      { label: 'S.22', laborCost: 1450, plannedHours: 80, realHours: 78, presenceRate: 88, sickDays: 0, cpDays: 1, rttDays: 1, otherDays: 0 },
      { label: 'S.23', laborCost: 1520, plannedHours: 84, realHours: 80, presenceRate: 90, sickDays: 0, cpDays: 1, rttDays: 0, otherDays: 0 },
      { label: 'S.24', laborCost: 1380, plannedHours: 80, realHours: 74, presenceRate: 84, sickDays: 2, cpDays: 1, rttDays: 0, otherDays: 0 },
    ],
    absenceByType: [
      { type: 'Maladie', days: 3, color: C.absence.maladie },
      { type: 'Congés payés', days: 5, color: C.absence.cp },
      { type: 'RTT', days: 1, color: C.absence.rtt },
    ],
    employees: DEMO_EMPLOYEES, turnover: [],
  },
  '3m': {
    periodLabel: 'Avr. – Juin 2026',
    kpi: { totalLaborCost: 18450, totalRealHours: 882, totalPlannedHours: 960, avgPresenceRate: 87, totalAbsenceDays: 19, totalSickDays: 6, turnoverCount: 1, chronicCount: 2, activeEmployees: 8 },
    buckets: [
      { label: 'Avr.', laborCost: 5800, plannedHours: 308, realHours: 280, presenceRate: 84, sickDays: 3, cpDays: 4, rttDays: 1, otherDays: 0 },
      { label: 'Mai',  laborCost: 6200, plannedHours: 324, realHours: 310, presenceRate: 91, sickDays: 2, cpDays: 3, rttDays: 1, otherDays: 1 },
      { label: 'Juin', laborCost: 6450, plannedHours: 328, realHours: 292, presenceRate: 87, sickDays: 1, cpDays: 3, rttDays: 0, otherDays: 0 },
    ],
    absenceByType: [
      { type: 'Maladie', days: 6, color: C.absence.maladie },
      { type: 'Congés payés', days: 10, color: C.absence.cp },
      { type: 'RTT', days: 2, color: C.absence.rtt },
      { type: 'Autres', days: 1, color: C.absence.autres },
    ],
    employees: DEMO_EMPLOYEES, turnover: TURNOVER_3M,
  },
  '6m': {
    periodLabel: 'Jan. – Juin 2026',
    kpi: { totalLaborCost: 35450, totalRealHours: 1725, totalPlannedHours: 1866, avgPresenceRate: 86, totalAbsenceDays: 47, totalSickDays: 18, turnoverCount: 1, chronicCount: 2, activeEmployees: 8 },
    buckets: [
      { label: 'Jan.', laborCost: 5400, plannedHours: 290, realHours: 265, presenceRate: 82, sickDays: 5, cpDays: 3, rttDays: 2, otherDays: 1 },
      { label: 'Fév.', laborCost: 5600, plannedHours: 300, realHours: 280, presenceRate: 85, sickDays: 4, cpDays: 4, rttDays: 1, otherDays: 0 },
      { label: 'Mars', laborCost: 6000, plannedHours: 316, realHours: 298, presenceRate: 89, sickDays: 3, cpDays: 5, rttDays: 2, otherDays: 1 },
      { label: 'Avr.', laborCost: 5800, plannedHours: 308, realHours: 280, presenceRate: 84, sickDays: 3, cpDays: 4, rttDays: 1, otherDays: 0 },
      { label: 'Mai',  laborCost: 6200, plannedHours: 324, realHours: 310, presenceRate: 91, sickDays: 2, cpDays: 3, rttDays: 1, otherDays: 1 },
      { label: 'Juin', laborCost: 6450, plannedHours: 328, realHours: 292, presenceRate: 87, sickDays: 1, cpDays: 3, rttDays: 0, otherDays: 0 },
    ],
    absenceByType: [
      { type: 'Maladie', days: 18, color: C.absence.maladie },
      { type: 'Congés payés', days: 22, color: C.absence.cp },
      { type: 'RTT', days: 7, color: C.absence.rtt },
      { type: 'Autres', days: 3, color: C.absence.autres },
    ],
    employees: DEMO_EMPLOYEES, turnover: TURNOVER_3M,
  },
  '12m': {
    periodLabel: 'Juil. 2025 – Juin 2026',
    kpi: { totalLaborCost: 67050, totalRealHours: 3240, totalPlannedHours: 3648, avgPresenceRate: 85, totalAbsenceDays: 94, totalSickDays: 36, turnoverCount: 2, chronicCount: 2, activeEmployees: 8 },
    buckets: [
      { label: 'Jul.',  laborCost: 5200, plannedHours: 285, realHours: 258, presenceRate: 81, sickDays: 4, cpDays: 8, rttDays: 2, otherDays: 0 },
      { label: 'Août',  laborCost: 4800, plannedHours: 260, realHours: 234, presenceRate: 78, sickDays: 3, cpDays: 10, rttDays: 1, otherDays: 1 },
      { label: 'Sep.',  laborCost: 5600, plannedHours: 300, realHours: 282, presenceRate: 85, sickDays: 5, cpDays: 4, rttDays: 2, otherDays: 0 },
      { label: 'Oct.',  laborCost: 6000, plannedHours: 316, realHours: 295, presenceRate: 88, sickDays: 4, cpDays: 3, rttDays: 2, otherDays: 1 },
      { label: 'Nov.',  laborCost: 5800, plannedHours: 308, realHours: 280, presenceRate: 84, sickDays: 5, cpDays: 3, rttDays: 1, otherDays: 0 },
      { label: 'Déc.',  laborCost: 4200, plannedHours: 260, realHours: 220, presenceRate: 76, sickDays: 6, cpDays: 5, rttDays: 0, otherDays: 1 },
      { label: 'Jan.',  laborCost: 5400, plannedHours: 290, realHours: 265, presenceRate: 82, sickDays: 5, cpDays: 3, rttDays: 2, otherDays: 1 },
      { label: 'Fév.',  laborCost: 5600, plannedHours: 300, realHours: 280, presenceRate: 85, sickDays: 4, cpDays: 4, rttDays: 1, otherDays: 0 },
      { label: 'Mars',  laborCost: 6000, plannedHours: 316, realHours: 298, presenceRate: 89, sickDays: 3, cpDays: 5, rttDays: 2, otherDays: 1 },
      { label: 'Avr.',  laborCost: 5800, plannedHours: 308, realHours: 280, presenceRate: 84, sickDays: 3, cpDays: 4, rttDays: 1, otherDays: 0 },
      { label: 'Mai',   laborCost: 6200, plannedHours: 324, realHours: 310, presenceRate: 91, sickDays: 2, cpDays: 3, rttDays: 1, otherDays: 1 },
      { label: 'Juin',  laborCost: 6450, plannedHours: 328, realHours: 292, presenceRate: 87, sickDays: 1, cpDays: 3, rttDays: 0, otherDays: 0 },
    ],
    absenceByType: [
      { type: 'Maladie', days: 36, color: C.absence.maladie },
      { type: 'Congés payés', days: 44, color: C.absence.cp },
      { type: 'RTT', days: 15, color: C.absence.rtt },
      { type: 'Autres', days: 6, color: C.absence.autres },
    ],
    employees: DEMO_EMPLOYEES,
    turnover: [
      { name: 'Clara Dupont',  position: 'Vendeuse',   contractType: 'CDD', monthKey: '2026-05', monthLabel: 'Mai 2026' },
      { name: 'Pierre Lefort', position: 'Boulanger',  contractType: 'CDI', monthKey: '2025-09', monthLabel: 'Sep. 2025' },
    ],
  },
}

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '4w',  label: '4 semaines' },
  { key: '3m',  label: '3 mois' },
  { key: '6m',  label: '6 mois' },
  { key: '12m', label: '12 mois' },
]

// ── Formatters ─────────────────────────────────────────────────────────────────

function fmtEur(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtH(n: number) { return `${n.toLocaleString('fr-FR')} h` }
function fmtPct(n: number) { return `${n} %` }

// ── SVG chart helpers ─────────────────────────────────────────────────────────

const PL = 52, PR = 8, PT = 10, PB = 30
const VW = 500, VH = 220
const IW = VW - PL - PR    // 440
const IH = VH - PT - PB    // 180

function niceMax(vals: number[]): number {
  const m = Math.max(...vals, 1)
  if (m <= 10) return 10
  const mag = Math.pow(10, Math.floor(Math.log10(m)))
  return Math.ceil(m / mag) * mag
}

function sy(v: number, max: number) { return PT + IH - (v / max) * IH }
function cx(i: number, n: number) { return PL + (i + 0.5) * (IW / n) }
function bw(n: number) { return Math.min((IW / n) * 0.65, 48) }

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, color, yFmt, refY, refLabel }: {
  data: { label: string; value: number }[]
  color: string
  yFmt: (v: number) => string
  refY?: number
  refLabel?: string
}) {
  const max = niceMax(data.map(d => d.value))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: max * t, y: sy(max * t, max) }))
  const barW = bw(data.length)

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 220 }}>
      {/* Grid + Y labels */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={VW - PR} y2={t.y} stroke={C.border} strokeWidth={0.5} />
          <text x={PL - 5} y={t.y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={C.textSec}>
            {yFmt(t.v)}
          </text>
        </g>
      ))}
      {/* Reference line */}
      {refY !== undefined && (
        <>
          <line x1={PL} y1={sy(refY, max)} x2={VW - PR} y2={sy(refY, max)} stroke={C.warning} strokeWidth={1} strokeDasharray="4 3" />
          {refLabel && <text x={VW - PR - 2} y={sy(refY, max) - 4} textAnchor="end" fontSize={9} fill={C.warning}>{refLabel}</text>}
        </>
      )}
      {/* Bars + X labels */}
      {data.map((d, i) => {
        const bh = (d.value / max) * IH
        const bx = cx(i, data.length) - barW / 2
        const by = sy(d.value, max)
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={color} rx={4} ry={4} opacity={0.9} />
            <text x={cx(i, data.length)} y={VH - PB + 14} textAnchor="middle" fontSize={10} fill={C.textSec}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Area chart (2 series) ─────────────────────────────────────────────────────

function AreaChart({ data, series, yFmt }: {
  data: { label: string; [k: string]: number | string }[]
  series: { key: string; label: string; color: string }[]
  yFmt: (v: number) => string
}) {
  const allVals = data.flatMap(d => series.map(s => Number(d[s.key])))
  const max = niceMax(allVals)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: max * t, y: sy(max * t, max) }))
  const n = data.length

  function buildPath(key: string) {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${cx(i, n)} ${sy(Number(d[key]), max)}`).join(' ')
  }

  function buildArea(key: string) {
    const pts = data.map((d, i) => `${cx(i, n)} ${sy(Number(d[key]), max)}`).join(' ')
    const first = cx(0, n), last = cx(n - 1, n)
    return `M ${first} ${PT + IH} L ${pts.split(' ').slice(0, 2).join(' ')} ${data.slice(1).map((d, i) => `L ${cx(i + 1, n)} ${sy(Number(d[key]), max)}`).join(' ')} L ${last} ${PT + IH} Z`
  }

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 220 }}>
      <defs>
        {series.map(s => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={s.color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={VW - PR} y2={t.y} stroke={C.border} strokeWidth={0.5} />
          <text x={PL - 5} y={t.y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={C.textSec}>{yFmt(t.v)}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={cx(i, n)} y={VH - PB + 14} textAnchor="middle" fontSize={10} fill={C.textSec}>{d.label}</text>
      ))}
      {series.map(s => (
        <g key={s.key}>
          <path d={buildArea(s.key)} fill={`url(#grad-${s.key})`} />
          <path d={buildPath(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
        </g>
      ))}
      {/* Legend */}
      {series.map((s, i) => (
        <g key={s.key} transform={`translate(${PL + i * 110}, ${VH - 6})`}>
          <rect x={0} y={-5} width={8} height={8} rx={2} fill={s.color} opacity={0.8} />
          <text x={12} y={0} fontSize={10} fill={C.textSec}>{s.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Line chart ────────────────────────────────────────────────────────────────

function LineChart({ data, color, yFmt, refLine }: {
  data: { label: string; value: number }[]
  color: string
  yFmt: (v: number) => string
  refLine?: { y: number; label: string; color: string }
}) {
  const max = 100
  const ticks = [0, 25, 50, 75, 100].map(v => ({ v, y: sy(v, max) }))
  const n = data.length

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${cx(i, n)} ${sy(d.value, max)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 220 }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={VW - PR} y2={t.y} stroke={C.border} strokeWidth={0.5} />
          <text x={PL - 5} y={t.y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={C.textSec}>{yFmt(t.v)}</text>
        </g>
      ))}
      {refLine && (
        <>
          <line x1={PL} y1={sy(refLine.y, max)} x2={VW - PR} y2={sy(refLine.y, max)} stroke={refLine.color} strokeWidth={1} strokeDasharray="5 4" />
          <text x={VW - PR - 2} y={sy(refLine.y, max) - 4} textAnchor="end" fontSize={9} fill={refLine.color}>{refLine.label}</text>
        </>
      )}
      {data.map((d, i) => (
        <text key={i} x={cx(i, n)} y={VH - PB + 14} textAnchor="middle" fontSize={10} fill={C.textSec}>{d.label}</text>
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={cx(i, n)} cy={sy(d.value, max)} r={3} fill={color} />
      ))}
    </svg>
  )
}

// ── Stacked bar chart ─────────────────────────────────────────────────────────

function StackedBarChart({ data, layers, yFmt }: {
  data: { label: string; [k: string]: number | string }[]
  layers: { key: string; label: string; color: string }[]
  yFmt: (v: number) => string
}) {
  const totals = data.map(d => layers.reduce((s, l) => s + Number(d[l.key]), 0))
  const max = niceMax(totals)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: max * t, y: sy(max * t, max) }))
  const n = data.length
  const barW = bw(n)

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 220 }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={VW - PR} y2={t.y} stroke={C.border} strokeWidth={0.5} />
          <text x={PL - 5} y={t.y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={C.textSec}>{yFmt(t.v)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        let cumY = PT + IH
        return (
          <g key={i}>
            {layers.map((l, li) => {
              const val = Number(d[l.key])
              const h = (val / max) * IH
              cumY -= h
              const isLast = li === layers.length - 1
              return (
                <rect
                  key={l.key}
                  x={cx(i, n) - barW / 2}
                  y={cumY}
                  width={barW}
                  height={h}
                  fill={l.color}
                  rx={isLast && h > 0 ? 4 : 0}
                  ry={isLast && h > 0 ? 4 : 0}
                  opacity={0.85}
                />
              )
            })}
            <text x={cx(i, n)} y={VH - PB + 14} textAnchor="middle" fontSize={10} fill={C.textSec}>{d.label}</text>
          </g>
        )
      })}
      {/* Legend */}
      {layers.map((l, i) => (
        <g key={l.key} transform={`translate(${PL + i * 100}, ${VH - 6})`}>
          <rect x={0} y={-5} width={8} height={8} rx={2} fill={l.color} opacity={0.85} />
          <text x={12} y={0} fontSize={10} fill={C.textSec}>{l.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: AbsenceType[] }) {
  const total = data.reduce((s, d) => s + d.days, 0)
  if (total === 0) return null

  const r = 56, cx2 = 80, cy2 = 80, stroke = 22
  let cumAngle = -Math.PI / 2

  const arcs = data.map(e => {
    const angle = (e.days / total) * 2 * Math.PI
    const x1 = cx2 + r * Math.cos(cumAngle)
    const y1 = cy2 + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx2 + r * Math.cos(cumAngle)
    const y2 = cy2 + r * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    return { ...e, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct: Math.round((e.days / total) * 100) }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {arcs.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{t.type}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.days}j</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 32, textAlign: 'right' }}>{t.pct} %</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, accentColor = C.primary, accentLight = C.primaryLt }: {
  icon: React.ElementType; label: string; value: string; sub?: string
  accentColor?: string; accentLight?: string
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accentLight }}>
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.06em] font-medium leading-none mb-1">{label}</p>
        <p className="text-[22px] font-semibold text-[var(--text-primary)] leading-none tracking-[-0.02em]">{value}</p>
        {sub && <p className="text-[11px] text-[var(--text-secondary)] mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Flag badge ────────────────────────────────────────────────────────────────

const FLAG_META: Record<FlagKey, { label: string; color: string; light: string }> = {
  sick_frequent: { label: 'Maladie fréq.',  color: C.danger,  light: C.dangerLt },
  late_chronic:  { label: 'Retards chron.', color: C.warning, light: C.warningLt },
  absence_high:  { label: 'Abs. élevée',    color: '#A78BFA', light: 'rgba(167,139,250,0.12)' },
}

function FlagBadge({ flag }: { flag: FlagKey }) {
  const m = FLAG_META[flag]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none"
      style={{ color: m.color, background: m.light }}
    >
      {m.label}
    </span>
  )
}

// ── CA Target input ───────────────────────────────────────────────────────────

function CaTargetInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  return (
    <div className="flex items-center gap-2">
      <Target className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
      {editing ? (
        <form
          onSubmit={e => { e.preventDefault(); onChange(draft); setEditing(false) }}
          className="flex items-center gap-1.5"
        >
          <input
            type="number" min={0} value={draft} onChange={e => setDraft(e.target.value)}
            className="w-24 h-6 text-[11px] border border-[var(--border)] rounded-md px-2 bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="CA objectif €" autoFocus
          />
          <button type="submit" className="text-[11px] text-[var(--accent)] font-medium">OK</button>
          <button type="button" onClick={() => setEditing(false)} className="text-[11px] text-[var(--text-tertiary)]">✕</button>
        </form>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {value ? `Objectif CA : ${fmtEur(Number(value))}` : 'Définir objectif CA'}
        </button>
      )}
    </div>
  )
}

// ── Turnover section ──────────────────────────────────────────────────────────

function TurnoverSection({ data }: { data: TurnoverEntry[] }) {
  if (data.length === 0) {
    return <p className="text-[13px] text-[var(--text-tertiary)] text-center py-6">Aucun départ sur la période</p>
  }

  const byMonth: Record<string, TurnoverEntry[]> = {}
  for (const e of data) {
    if (!byMonth[e.monthKey]) byMonth[e.monthKey] = []
    byMonth[e.monthKey].push(e)
  }
  const sortedMonths = Object.keys(byMonth).sort().reverse()

  return (
    <div className="space-y-4">
      {sortedMonths.map(mk => (
        <div key={mk}>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-2">
            {byMonth[mk][0].monthLabel}
          </p>
          <div className="space-y-1.5">
            {byMonth[mk].map((e, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border)]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.dangerLt }}>
                  <UserMinus className="h-3.5 w-3.5" style={{ color: C.danger }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{e.name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {[e.position, e.contractType].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Chronic absenteeism table ─────────────────────────────────────────────────

function ChronicTable({ employees }: { employees: EmployeeAnalytic[] }) {
  const risky = employees.filter(e => e.flags.length > 0)
  const [showAll, setShowAll] = useState(false)

  if (risky.length === 0) {
    return <p className="text-[13px] text-[var(--text-tertiary)] text-center py-6">Aucun employé à risque détecté</p>
  }

  const displayed = showAll ? risky : risky.slice(0, 5)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 pr-4">Employé</th>
              <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 px-3">Abs.</th>
              <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 px-3">Retards</th>
              <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 px-3">Taux abs.</th>
              <th className="text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 pl-3">Signalements</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(e => (
              <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-[var(--text-primary)]">{e.name}</p>
                  {e.position && <p className="text-[11px] text-[var(--text-secondary)]">{e.position}</p>}
                </td>
                <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{e.absenceDays}j</td>
                <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{e.unjustifiedLateCount}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className={cn(
                    'font-semibold',
                    e.absenceRate >= 20 ? 'text-[#FF6B6B]' : e.absenceRate >= 10 ? 'text-[#FFB347]' : 'text-[var(--text-primary)]'
                  )}>
                    {e.absenceRate} %
                  </span>
                </td>
                <td className="py-2.5 pl-3">
                  <div className="flex flex-wrap gap-1">
                    {e.flags.map(f => <FlagBadge key={f} flag={f} />)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {risky.length > 5 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="mt-3 flex items-center gap-1 text-[12px] text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          {showAll
            ? <><ChevronUp className="h-3.5 w-3.5" /> Réduire</>
            : <><ChevronDown className="h-3.5 w-3.5" /> Voir {risky.length - 5} de plus</>
          }
        </button>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodKey>('3m')
  const [caTarget, setCaTarget] = useState('')

  const data = DEMO[period]
  const { kpi, buckets, absenceByType, employees, turnover } = data

  const caRatio = caTarget && Number(caTarget) > 0
    ? Math.round(kpi.totalLaborCost / Number(caTarget) * 100)
    : null

  const refLineY = caTarget && Number(caTarget) > 0
    ? Number(caTarget) * 0.33 / Math.max(...buckets.map(b => b.laborCost), 1) * niceMax(buckets.map(b => b.laborCost))
    : undefined

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-syne)' }}>
          Analytiques RH
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Masse salariale, présence, absences et turnover sur la période sélectionnée.
        </p>
      </div>

      <div className="space-y-5">

        {/* Period selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  period === opt.key
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">{data.periodLabel}</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            icon={Euro} label="Masse salariale"
            value={fmtEur(kpi.totalLaborCost)}
            sub={caRatio !== null ? `${caRatio} % du CA` : undefined}
            accentColor={C.primary} accentLight={C.primaryLt}
          />
          <KpiCard
            icon={Clock} label="Heures réelles"
            value={fmtH(kpi.totalRealHours)}
            sub={`Planifiées : ${fmtH(kpi.totalPlannedHours)}`}
            accentColor={C.primary} accentLight={C.primaryLt}
          />
          <KpiCard
            icon={TrendingUp} label="Taux de présence"
            value={fmtPct(kpi.avgPresenceRate)}
            sub={kpi.avgPresenceRate < 80 ? 'En dessous de 80 %' : 'Objectif atteint'}
            accentColor={kpi.avgPresenceRate >= 80 ? C.success : C.warning}
            accentLight={kpi.avgPresenceRate >= 80 ? C.successLt : C.warningLt}
          />
          <KpiCard
            icon={CalendarOff} label="Jours d'absence"
            value={String(kpi.totalAbsenceDays)}
            sub={`Dont maladie : ${kpi.totalSickDays}j`}
            accentColor={C.warning} accentLight={C.warningLt}
          />
          <KpiCard
            icon={UserMinus} label="Turnover"
            value={String(kpi.turnoverCount)}
            sub={kpi.turnoverCount === 0 ? 'Aucun départ' : `départ${kpi.turnoverCount > 1 ? 's' : ''} sur la période`}
            accentColor={kpi.turnoverCount > 0 ? C.danger : C.success}
            accentLight={kpi.turnoverCount > 0 ? C.dangerLt : C.successLt}
          />
          <KpiCard
            icon={AlertTriangle} label="Employés à risque"
            value={String(kpi.chronicCount)}
            sub={`sur ${kpi.activeEmployees} actifs`}
            accentColor={kpi.chronicCount > 0 ? C.danger : C.success}
            accentLight={kpi.chronicCount > 0 ? C.dangerLt : C.successLt}
          />
        </div>

        {/* Row 1: Labor cost + Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section
            title="Masse salariale"
            action={<CaTargetInput value={caTarget} onChange={setCaTarget} />}
          >
            <BarChart
              data={buckets.map(b => ({ label: b.label, value: b.laborCost }))}
              color={C.primary}
              yFmt={v => v >= 1000 ? `${Math.round(v / 1000)}k€` : `${v}€`}
              refY={caTarget && Number(caTarget) > 0 ? Number(caTarget) * 0.33 : undefined}
              refLabel={caTarget && Number(caTarget) > 0 ? '33 % CA' : undefined}
            />
          </Section>

          <Section title="Heures planifiées vs réelles">
            <AreaChart
              data={buckets.map(b => ({ label: b.label, plannedHours: b.plannedHours, realHours: b.realHours }))}
              series={[
                { key: 'plannedHours', label: 'Planifiées', color: C.planned },
                { key: 'realHours',    label: 'Réelles',    color: C.real },
              ]}
              yFmt={v => `${Math.round(v)}h`}
            />
          </Section>
        </div>

        {/* Row 2: Presence rate + Absence by type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Taux de présence (%)">
            <LineChart
              data={buckets.map(b => ({ label: b.label, value: b.presenceRate }))}
              color={C.primary}
              yFmt={v => `${Math.round(v)}%`}
              refLine={{ y: 80, label: '80 %', color: C.success }}
            />
          </Section>

          <Section title="Absences par type (jours)">
            {absenceByType.length === 0 ? (
              <p className="text-[13px] text-[var(--text-tertiary)] text-center py-10">Aucune absence sur la période</p>
            ) : (
              <StackedBarChart
                data={buckets.map(b => ({ label: b.label, sickDays: b.sickDays, cpDays: b.cpDays, rttDays: b.rttDays, otherDays: b.otherDays }))}
                layers={[
                  { key: 'sickDays',  label: 'Maladie',      color: C.absence.maladie },
                  { key: 'cpDays',    label: 'Congés payés', color: C.absence.cp },
                  { key: 'rttDays',   label: 'RTT',          color: C.absence.rtt },
                  { key: 'otherDays', label: 'Autres',       color: C.absence.autres },
                ]}
                yFmt={v => String(Math.round(v))}
              />
            )}
          </Section>
        </div>

        {/* Row 3: Donut absence + Turnover */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {absenceByType.length > 0 && (
            <Section title="Répartition des absences">
              <DonutChart data={absenceByType} />
            </Section>
          )}
          <Section title={`Turnover — ${kpi.turnoverCount} départ${kpi.turnoverCount !== 1 ? 's' : ''}`}>
            <TurnoverSection data={turnover} />
          </Section>
        </div>

        {/* Row 4: Employee table + Chronic table */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Section title="Employés — coût & présence">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 pr-4">Employé</th>
                    <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 px-3">Coût</th>
                    <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 px-3">H. réelles</th>
                    <th className="text-right text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em] pb-2 pl-3">Taux abs.</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-[var(--text-primary)]">{e.name}</p>
                        {e.position && <p className="text-[11px] text-[var(--text-secondary)]">{e.position}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-[var(--text-primary)]">{fmtEur(e.laborCost)}</td>
                      <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{fmtH(e.realHours)}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <span className={cn(
                          'font-semibold',
                          e.absenceRate >= 20 ? 'text-[#FF6B6B]' : e.absenceRate >= 10 ? 'text-[#FFB347]' : 'text-[var(--text-secondary)]'
                        )}>
                          {e.absenceRate} %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={`Absentéisme chronique — ${kpi.chronicCount} signalement${kpi.chronicCount !== 1 ? 's' : ''}`}>
            <ChronicTable employees={employees} />
          </Section>
        </div>

      </div>
    </div>
  )
}
