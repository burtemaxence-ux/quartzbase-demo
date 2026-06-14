'use client'

import { useState } from 'react'
import {
  AlertTriangle, Info, CheckCircle2,
  Calendar, ChevronDown, ChevronUp, User, Scale, BookOpen, Wrench,
  XCircle, ShieldCheck, ShieldAlert, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'info'
type RuleId = 'rest_daily' | 'hours_daily_max' | 'hours_weekly_max' | 'break_missing' | 'days_consecutive' | 'sunday_work' | 'night_work'
type GroupBy = 'none' | 'employee' | 'rule'

interface ComplianceViolation {
  ruleId: RuleId
  ruleName: string
  severity: Severity
  employeeId: string
  employeeName: string
  date: string
  description: string
  legalRef: string
  ruleDescription: string
  suggestedFix?: string
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_SCORE = 88
const DEMO_TOTAL_SHIFTS = 42
const DEMO_EMPLOYEES_AFFECTED = 3

const DEMO_VIOLATIONS: ComplianceViolation[] = [
  {
    ruleId: 'rest_daily',
    ruleName: 'Repos quotidien',
    severity: 'critical',
    employeeId: 'emp-1',
    employeeName: 'Sophie Martin',
    date: '2026-06-10',
    description: 'Repos quotidien insuffisant entre deux shifts : 8h au lieu de 11h minimum.',
    legalRef: 'Art. L3131-1 CT — repos quotidien de 11h minimum',
    ruleDescription: 'Le salarié doit bénéficier d\'un repos quotidien d\'une durée minimale de onze heures consécutives.',
    suggestedFix: 'Décaler le début du shift du mercredi 11/06 à 8h45 minimum.',
  },
  {
    ruleId: 'hours_daily_max',
    ruleName: 'Durée quotidienne',
    severity: 'critical',
    employeeId: 'emp-2',
    employeeName: 'Lucas Petit',
    date: '2026-06-11',
    description: 'Durée quotidienne dépassée : 11h45 travaillées (maximum légal 10h).',
    legalRef: 'Art. L3121-18 CT — durée maximale journalière de 10h',
    ruleDescription: 'La durée quotidienne de travail effectif par salarié ne peut excéder dix heures.',
    suggestedFix: 'Réduire le shift du mercredi ou supprimer les heures supplémentaires non planifiées.',
  },
  {
    ruleId: 'break_missing',
    ruleName: 'Pause',
    severity: 'warning',
    employeeId: 'emp-3',
    employeeName: 'Emma Dubois',
    date: '2026-06-09',
    description: 'Aucune pause enregistrée pour un shift de 7h20.',
    legalRef: 'Art. L3121-16 CT — pause de 20 min après 6h de travail',
    ruleDescription: 'Dès que le temps de travail quotidien atteint six heures, le salarié bénéficie d\'un temps de pause d\'une durée minimale de vingt minutes.',
    suggestedFix: 'Ajouter une pause de 20 min entre 12h et 14h dans le planning.',
  },
  {
    ruleId: 'sunday_work',
    ruleName: 'Travail dimanche',
    severity: 'warning',
    employeeId: 'emp-1',
    employeeName: 'Sophie Martin',
    date: '2026-06-08',
    description: 'Travail le dimanche sans accord de dérogation sectoriel validé.',
    legalRef: 'Art. L3132-3 CT — principe du repos dominical',
    ruleDescription: 'Le repos hebdomadaire est donné le dimanche.',
    suggestedFix: 'Vérifier l\'accord de dérogation sectoriel ou octroyer un repos compensateur.',
  },
  {
    ruleId: 'hours_weekly_max',
    ruleName: 'Durée hebdomadaire',
    severity: 'warning',
    employeeId: 'emp-2',
    employeeName: 'Lucas Petit',
    date: '2026-06-07',
    description: 'Semaine du 09/06 dépassant 48h : 49h45 effectuées.',
    legalRef: 'Art. L3121-20 CT — durée maximale hebdomadaire de 48h',
    ruleDescription: 'Au cours d\'une même semaine, la durée maximale hebdomadaire de travail est de quarante-huit heures.',
    suggestedFix: 'Ajuster le planning pour ne pas dépasser 48h sur la semaine concernée.',
  },
  {
    ruleId: 'night_work',
    ruleName: 'Travail de nuit',
    severity: 'info',
    employeeId: 'emp-3',
    employeeName: 'Emma Dubois',
    date: '2026-06-12',
    description: 'Shift de nuit détecté : 23h15 → 6h00. Vérifier les compensations réglementaires.',
    legalRef: 'Art. L3122-2 CT — travail entre 21h et 6h',
    ruleDescription: 'Est considéré comme travailleur de nuit tout travailleur qui accomplit au moins deux fois par semaine au moins trois heures de travail entre 21h et 6h.',
    suggestedFix: undefined,
  },
]

const DEMO_BY_SEVERITY: Record<Severity, number> = { critical: 2, warning: 3, info: 1 }
const DEMO_BY_RULE: Partial<Record<RuleId, number>> = {
  rest_daily: 1, hours_daily_max: 1, break_missing: 1, sunday_work: 1, hours_weekly_max: 1, night_work: 1,
}

// ── Severity config (dark-mode adapted) ───────────────────────────────────────

const SEV: Record<Severity, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  critical: {
    icon:   XCircle,
    color:  '#FF6B6B',
    bg:     'rgba(255,107,107,0.1)',
    border: 'rgba(255,107,107,0.25)',
    label:  'Critique',
  },
  warning: {
    icon:   AlertTriangle,
    color:  '#FFB347',
    bg:     'rgba(255,179,71,0.1)',
    border: 'rgba(255,179,71,0.25)',
    label:  'Avertissement',
  },
  info: {
    icon:   Info,
    color:  '#6C63FF',
    bg:     'rgba(108,99,255,0.1)',
    border: 'rgba(108,99,255,0.25)',
    label:  'Information',
  },
}

// ── Rule label map ────────────────────────────────────────────────────────────

const RULE_LABELS: Record<RuleId, string> = {
  rest_daily:       'Repos quotidien',
  hours_daily_max:  'Durée quotidienne',
  hours_weekly_max: 'Durée hebdomadaire',
  break_missing:    'Pause',
  days_consecutive: 'Jours consécutifs',
  sunday_work:      'Travail dimanche',
  night_work:       'Travail de nuit',
}

// ── Period presets ────────────────────────────────────────────────────────────

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

type PeriodPreset = { key: string; label: string; from: string; to: string }

function buildPresets(): PeriodPreset[] {
  const todayStr = '2026-06-14'
  const dow = new Date(todayStr + 'T00:00:00').getDay()
  const daysToMonday = dow === 0 ? -6 : 1 - dow
  const thisMonday = addDays(todayStr, daysToMonday)
  const nextMonday = addDays(thisMonday, 7)

  return [
    { key: 'this_week',  label: 'Cette semaine',    from: thisMonday,            to: addDays(thisMonday, 6) },
    { key: 'next_week',  label: 'Semaine suivante',  from: nextMonday,            to: addDays(nextMonday, 6) },
    { key: '2_weeks',    label: '2 semaines',        from: todayStr,              to: addDays(todayStr, 13) },
    { key: 'this_month', label: 'Ce mois',           from: '2026-06-01',          to: '2026-06-30' },
    { key: '4_weeks',    label: '4 semaines',        from: todayStr,              to: addDays(todayStr, 27) },
  ]
}

// ── Score gauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 90 ? '#00D4AA' : score >= 70 ? '#FFB347' : '#FF6B6B'
  const Icon = score >= 90 ? ShieldCheck : score >= 70 ? Shield : ShieldAlert
  const label = score === 100 ? 'Aucune anomalie' : score >= 90 ? 'Conforme' : score >= 70 ? 'Points d\'attention' : 'Non conforme'

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-w-[160px]">
      <Icon className="h-8 w-8" style={{ color }} />
      <div className="text-center">
        <p className="text-[42px] font-bold leading-none tracking-[-0.03em]" style={{ color, fontFamily: 'var(--font-syne)' }}>
          {score}
        </p>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mt-0.5">
          Score conformité
        </p>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden mt-1">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] text-center">{label}</p>
    </div>
  )
}

// ── Severity summary card ─────────────────────────────────────────────────────

function SevCard({ severity, count, active, onClick }: {
  severity: Severity; count: number; active: boolean; onClick: () => void
}) {
  const s = SEV[severity]
  const Icon = s.icon
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150 text-left',
        active ? 'border-current shadow-sm' : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-current'
      )}
      style={active ? { background: s.bg, borderColor: s.border, color: s.color } : { color: s.color }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="text-[22px] font-bold leading-none">{count}</p>
        <p className="text-[11px] font-medium opacity-80 mt-0.5">{s.label}</p>
      </div>
    </button>
  )
}

// ── Violation card ────────────────────────────────────────────────────────────

function ViolationCard({ v }: { v: ComplianceViolation }) {
  const [open, setOpen] = useState(false)
  const s = SEV[v.severity]
  const SevIcon = s.icon

  const fmtDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: s.border }}>
      {/* Header row */}
      <div className="flex items-start gap-3 px-4 py-3" style={{ background: s.bg }}>
        <SevIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: s.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold" style={{ color: s.color }}>{v.ruleName}</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ color: s.color, background: `${s.color}30` }}
            >
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
              <User className="h-3 w-3" />{v.employeeName}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
              <Calendar className="h-3 w-3" />{fmtDate(v.date)}
            </span>
          </div>
          <p className="text-[12px] text-[var(--text-primary)] mt-1.5">{v.description}</p>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-shrink-0 p-1 rounded-md transition-colors hover:bg-white/5"
          style={{ color: s.color }}
          title={open ? 'Réduire' : 'Détails'}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="px-4 py-3 bg-[var(--bg-card)] space-y-2.5">
          <div className="flex items-start gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.05em]">Référence légale</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{v.legalRef}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{v.ruleDescription}</p>
            </div>
          </div>
          {v.suggestedFix && (
            <div className="flex items-start gap-2">
              <Wrench className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.05em]">Correction suggérée</p>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{v.suggestedFix}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Rule summary bar chart ────────────────────────────────────────────────────

function RuleSummary({ byRule }: { byRule: Partial<Record<RuleId, number>> }) {
  const entries = (Object.entries(byRule) as [RuleId, number][]).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null
  const max = entries[0][1]

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border)]">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Répartition par règle</h3>
      </div>
      <div className="p-5 space-y-3">
        {entries.map(([ruleId, count]) => (
          <div key={ruleId} className="flex items-center gap-3">
            <p className="text-[13px] text-[var(--text-secondary)] w-44 flex-shrink-0 truncate">
              {RULE_LABELS[ruleId]}
            </p>
            <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
            <span className="text-[13px] font-semibold text-[var(--text-primary)] w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-6 py-12 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.15)' }}>
        <CheckCircle2 className="h-7 w-7" style={{ color: '#00D4AA' }} />
      </div>
      <p className="text-[15px] font-semibold text-[var(--text-primary)]">Planning conforme</p>
      <p className="text-[13px] text-[var(--text-secondary)] max-w-xs">
        Aucune anomalie légale détectée sur la période sélectionnée.
      </p>
    </div>
  )
}

// ── Legal reference panel ─────────────────────────────────────────────────────

const LEGAL_REFS = [
  { rule: 'Repos quotidien (11h min)',               ref: 'L3131-1',  severity: 'critical' as Severity },
  { rule: 'Durée max quotidienne (10h)',              ref: 'L3121-18', severity: 'critical' as Severity },
  { rule: 'Durée max hebdomadaire (48h)',             ref: 'L3121-20', severity: 'critical' as Severity },
  { rule: 'Pause obligatoire (20 min / 6h)',         ref: 'L3121-16', severity: 'warning'  as Severity },
  { rule: 'Repos hebdomadaire (35h consécutives)',   ref: 'L3132-1',  severity: 'critical' as Severity },
  { rule: 'Travail du dimanche',                     ref: 'L3132-3',  severity: 'info'     as Severity },
  { rule: 'Travail de nuit (21h – 6h)',              ref: 'L3122-2',  severity: 'warning'  as Severity },
]

function LegalPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[var(--bg-page)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            Règles vérifiées — Code du travail
          </span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-[var(--text-tertiary)]" />
          : <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
        }
      </button>
      {open && (
        <div className="border-t border-[var(--border)]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-page)]">
                <th className="text-left px-5 py-2 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">Règle</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">Article</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">Sévérité</th>
              </tr>
            </thead>
            <tbody>
              {LEGAL_REFS.map((r, i) => {
                const s = SEV[r.severity]
                return (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-2.5 text-[var(--text-primary)]">{r.rule}</td>
                    <td className="px-3 py-2.5 font-mono text-[var(--text-secondary)]">Art. {r.ref} CT</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const presets = buildPresets()
  const [preset, setPreset]       = useState(presets[0].key)
  const [sevFilter, setSevFilter] = useState<Severity | null>(null)
  const [groupBy, setGroupBy]     = useState<GroupBy>('none')

  const activePeriod = presets.find(p => p.key === preset) ?? presets[0]

  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const fmtFull = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const filtered = DEMO_VIOLATIONS.filter(v => sevFilter === null || v.severity === sevFilter)

  function groupViolations(list: ComplianceViolation[]) {
    if (groupBy === 'none') return { '': list }
    const groups: Record<string, ComplianceViolation[]> = {}
    for (const v of list) {
      const key = groupBy === 'employee' ? v.employeeName : v.ruleName
      if (!groups[key]) groups[key] = []
      groups[key].push(v)
    }
    return groups
  }

  const grouped = groupViolations(filtered)

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-syne)' }}>
          Conformité légale
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Détection automatique des anomalies par rapport au Code du travail français.
        </p>
      </div>

      <div className="space-y-5">

        {/* Period selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
            {presets.map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  preset === p.key
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            {fmt(activePeriod.from)} – {fmtFull(activePeriod.to)} · {DEMO_TOTAL_SHIFTS} shifts
          </p>
        </div>

        {/* Top row: score + severity cards */}
        <div className="flex gap-4 items-stretch flex-wrap">
          <ScoreGauge score={DEMO_SCORE} />
          <div className="flex gap-3 flex-1 flex-wrap">
            {(['critical', 'warning', 'info'] as Severity[]).map(sev => (
              <SevCard
                key={sev}
                severity={sev}
                count={DEMO_BY_SEVERITY[sev]}
                active={sevFilter === sev}
                onClick={() => setSevFilter(f => f === sev ? null : sev)}
              />
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4 px-5 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[13px] text-[var(--text-secondary)] flex-wrap">
          <span>{DEMO_VIOLATIONS.length} anomalies détectées</span>
          <span className="text-[var(--border)]">·</span>
          <span>{DEMO_EMPLOYEES_AFFECTED} employés concernés</span>
          {sevFilter && (
            <>
              <span className="text-[var(--border)]">·</span>
              <button
                onClick={() => setSevFilter(null)}
                className="flex items-center gap-1 text-[var(--accent)] text-[12px]"
              >
                <XCircle className="h-3.5 w-3.5" /> Effacer le filtre
              </button>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-tertiary)]">Grouper par</span>
            {(['none', 'employee', 'rule'] as GroupBy[]).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[12px] transition-colors duration-150',
                  groupBy === g
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                {g === 'none' ? 'Aucun' : g === 'employee' ? 'Employé' : 'Règle'}
              </button>
            ))}
          </div>
        </div>

        {/* Violations list / empty state */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {group && (
                  <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.08em] mb-2.5">
                    {group}
                  </p>
                )}
                <div className="space-y-2">
                  {items.map((v, i) => (
                    <ViolationCard key={`${v.ruleId}-${v.employeeId}-${v.date}-${i}`} v={v} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rule breakdown */}
        <RuleSummary byRule={DEMO_BY_RULE} />

        {/* Legal reference panel */}
        <LegalPanel />

      </div>
    </div>
  )
}
