'use client'

import { useState } from 'react'
import { Check, ChevronDown, Bell, Users } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Channel = 'email' | 'push' | 'sms'

interface NotifPref {
  enabled: boolean
  channels: Record<Channel, boolean>
  threshold?: number
}

interface Prefs {
  // Manager prefs
  manager_new_absence_request:    NotifPref
  manager_new_swap_request:       NotifPref
  manager_clock_anomaly:          NotifPref
  manager_contract_expiry:        NotifPref
  manager_compliance_violation:   NotifPref
  manager_weekly_summary:         NotifPref
  manager_new_employee_joined:    NotifPref
  manager_shift_uncovered:        NotifPref
  manager_overtime_threshold:     NotifPref
  manager_late_arrival:           NotifPref
  manager_document_uploaded:      NotifPref
  // Employee prefs
  employee_shift_published:       NotifPref
  employee_shift_reminder:        NotifPref
  employee_absence_approved:      NotifPref
  employee_swap_response:         NotifPref
}

// ── Default prefs ─────────────────────────────────────────────────────────────

const DEFAULT_PREFS: Prefs = {
  manager_new_absence_request:  { enabled: true,  channels: { email: true,  push: true,  sms: false } },
  manager_new_swap_request:     { enabled: true,  channels: { email: false, push: true,  sms: false } },
  manager_clock_anomaly:        { enabled: true,  channels: { email: true,  push: true,  sms: false } },
  manager_contract_expiry:      { enabled: true,  channels: { email: true,  push: false, sms: false }, threshold: 30 },
  manager_compliance_violation: { enabled: true,  channels: { email: true,  push: true,  sms: true  } },
  manager_weekly_summary:       { enabled: true,  channels: { email: true,  push: false, sms: false } },
  manager_new_employee_joined:  { enabled: false, channels: { email: true,  push: false, sms: false } },
  manager_shift_uncovered:      { enabled: true,  channels: { email: true,  push: true,  sms: true  } },
  manager_overtime_threshold:   { enabled: true,  channels: { email: true,  push: true,  sms: false }, threshold: 44 },
  manager_late_arrival:         { enabled: true,  channels: { email: false, push: true,  sms: false } },
  manager_document_uploaded:    { enabled: false, channels: { email: true,  push: false, sms: false } },
  employee_shift_published:     { enabled: true,  channels: { email: true,  push: true,  sms: false } },
  employee_shift_reminder:      { enabled: true,  channels: { email: false, push: true,  sms: false } },
  employee_absence_approved:    { enabled: true,  channels: { email: true,  push: true,  sms: false } },
  employee_swap_response:       { enabled: true,  channels: { email: true,  push: true,  sms: false } },
}

// ── Toggle component ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22,
        borderRadius: 11,
        backgroundColor: checked ? 'var(--accent)' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 150ms ease',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: checked ? 21 : 3,
        width: 16, height: 16,
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'left 150ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

// ── InlineSelect ──────────────────────────────────────────────────────────────

function InlineSelect({
  value,
  options,
  onChange,
}: {
  value: number
  options: { label: string; value: number }[]
  onChange: (v: number) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '3px 24px 3px 8px',
        fontSize: 12,
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090a8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Channel checkbox ──────────────────────────────────────────────────────────

function ChannelBox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        borderRadius: 6,
        border: `1px solid ${checked && !disabled ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: checked && !disabled ? 'var(--accent-light)' : 'transparent',
        color: checked && !disabled ? 'var(--accent)' : disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
        fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms',
      }}
    >
      {checked && !disabled && <Check size={10} />}
      {label}
    </button>
  )
}

// ── SettingRow ────────────────────────────────────────────────────────────────

function SettingRow({
  prefKey,
  label,
  description,
  pref,
  onToggle,
  onChannel,
  onThreshold,
  thresholdOptions,
  thresholdLabel,
}: {
  prefKey: keyof Prefs
  label: string
  description: string
  pref: NotifPref
  onToggle: () => void
  onChannel: (ch: Channel, v: boolean) => void
  onThreshold?: (v: number) => void
  thresholdOptions?: { label: string; value: number }[]
  thresholdLabel?: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Toggle */}
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        <Toggle checked={pref.enabled} onChange={onToggle} />
      </div>

      {/* Text + channels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: pref.enabled ? 8 : 0 }}>{description}</p>

        {pref.enabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {(['email', 'push', 'sms'] as Channel[]).map(ch => (
              <ChannelBox
                key={ch}
                label={ch === 'email' ? 'E-mail' : ch === 'push' ? 'Push' : 'SMS'}
                checked={pref.channels[ch]}
                disabled={!pref.enabled}
                onChange={v => onChannel(ch, v)}
              />
            ))}

            {thresholdOptions && onThreshold && pref.threshold !== undefined && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{thresholdLabel ?? 'Seuil'} :</span>
                <InlineSelect
                  value={pref.threshold}
                  options={thresholdOptions}
                  onChange={onThreshold}
                />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section (accordion) ───────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Header (clickable to toggle) */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          background: 'none', border: 'none',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          backgroundColor: 'var(--accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--accent)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{subtitle}</p>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-tertiary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 20px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── SaveIndicator ─────────────────────────────────────────────────────────────

function SaveIndicator({ state }: { state: 'idle' | 'saving' | 'saved' }) {
  if (state === 'idle') return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12,
      color: state === 'saved' ? 'var(--success)' : 'var(--text-secondary)',
      transition: 'color 200ms',
    }}>
      {state === 'saving' ? (
        <>
          <span style={{
            width: 12, height: 12, border: '2px solid var(--border)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }} />
          Enregistrement…
        </>
      ) : (
        <>
          <Check size={12} />
          Enregistré
        </>
      )}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  function update(key: keyof Prefs, value: Partial<NotifPref>) {
    setPrefs(prev => ({ ...prev, [key]: { ...prev[key], ...value } }))
    setSaveState('saving')
    setTimeout(() => {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    }, 500)
  }

  function togglePref(key: keyof Prefs) {
    update(key, { enabled: !prefs[key].enabled })
  }

  function toggleChannel(key: keyof Prefs, ch: Channel, v: boolean) {
    update(key, { channels: { ...prefs[key].channels, [ch]: v } })
  }

  function setThreshold(key: keyof Prefs, v: number) {
    update(key, { threshold: v })
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Notifications
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Choisissez quand et comment vous souhaitez être notifié.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      {/* ── Manager section ── */}
      <Section
        icon={<Bell size={18} />}
        title="Alertes manager"
        subtitle="Notifications liées à la gestion de votre équipe"
      >
        <SettingRow
          prefKey="manager_new_absence_request"
          label="Nouvelle demande d'absence"
          description="Quand un employé soumet une demande de congé ou d'absence."
          pref={prefs.manager_new_absence_request}
          onToggle={() => togglePref('manager_new_absence_request')}
          onChannel={(ch, v) => toggleChannel('manager_new_absence_request', ch, v)}
        />
        <SettingRow
          prefKey="manager_new_swap_request"
          label="Demande d'échange de shifts"
          description="Quand un employé propose un échange de planning à un collègue."
          pref={prefs.manager_new_swap_request}
          onToggle={() => togglePref('manager_new_swap_request')}
          onChannel={(ch, v) => toggleChannel('manager_new_swap_request', ch, v)}
        />
        <SettingRow
          prefKey="manager_clock_anomaly"
          label="Anomalie de pointage"
          description="Oubli de pointage, durée anormale ou pointage sans shift prévu."
          pref={prefs.manager_clock_anomaly}
          onToggle={() => togglePref('manager_clock_anomaly')}
          onChannel={(ch, v) => toggleChannel('manager_clock_anomaly', ch, v)}
        />
        <SettingRow
          prefKey="manager_contract_expiry"
          label="Expiration de contrat CDD"
          description="Rappel avant la fin d'un contrat à durée déterminée."
          pref={prefs.manager_contract_expiry}
          onToggle={() => togglePref('manager_contract_expiry')}
          onChannel={(ch, v) => toggleChannel('manager_contract_expiry', ch, v)}
          thresholdLabel="Délai"
          thresholdOptions={[
            { label: '7 jours avant', value: 7 },
            { label: '14 jours avant', value: 14 },
            { label: '30 jours avant', value: 30 },
            { label: '60 jours avant', value: 60 },
          ]}
          onThreshold={v => setThreshold('manager_contract_expiry', v)}
        />
        <SettingRow
          prefKey="manager_compliance_violation"
          label="Violation de conformité légale"
          description="Détection d'une anomalie par rapport au Code du travail."
          pref={prefs.manager_compliance_violation}
          onToggle={() => togglePref('manager_compliance_violation')}
          onChannel={(ch, v) => toggleChannel('manager_compliance_violation', ch, v)}
        />
        <SettingRow
          prefKey="manager_weekly_summary"
          label="Récapitulatif hebdomadaire"
          description="Synthèse des heures travaillées, absences et anomalies de la semaine."
          pref={prefs.manager_weekly_summary}
          onToggle={() => togglePref('manager_weekly_summary')}
          onChannel={(ch, v) => toggleChannel('manager_weekly_summary', ch, v)}
        />
        <SettingRow
          prefKey="manager_new_employee_joined"
          label="Nouvel employé ajouté"
          description="Confirmation lors de l'inscription d'un nouvel employé à votre espace."
          pref={prefs.manager_new_employee_joined}
          onToggle={() => togglePref('manager_new_employee_joined')}
          onChannel={(ch, v) => toggleChannel('manager_new_employee_joined', ch, v)}
        />
        <SettingRow
          prefKey="manager_shift_uncovered"
          label="Shift non couvert"
          description="Un créneau est sans employé assigné à moins de 24h du début."
          pref={prefs.manager_shift_uncovered}
          onToggle={() => togglePref('manager_shift_uncovered')}
          onChannel={(ch, v) => toggleChannel('manager_shift_uncovered', ch, v)}
        />
        <SettingRow
          prefKey="manager_overtime_threshold"
          label="Seuil d'heures supplémentaires"
          description="Alerte quand un employé approche ou dépasse le plafond hebdomadaire."
          pref={prefs.manager_overtime_threshold}
          onToggle={() => togglePref('manager_overtime_threshold')}
          onChannel={(ch, v) => toggleChannel('manager_overtime_threshold', ch, v)}
          thresholdLabel="Seuil"
          thresholdOptions={[
            { label: '35h', value: 35 },
            { label: '40h', value: 40 },
            { label: '44h', value: 44 },
            { label: '48h', value: 48 },
          ]}
          onThreshold={v => setThreshold('manager_overtime_threshold', v)}
        />
        <SettingRow
          prefKey="manager_late_arrival"
          label="Retard à la prise de poste"
          description="Quand un employé pointe plus de 5 minutes après son heure de début."
          pref={prefs.manager_late_arrival}
          onToggle={() => togglePref('manager_late_arrival')}
          onChannel={(ch, v) => toggleChannel('manager_late_arrival', ch, v)}
        />
        <SettingRow
          prefKey="manager_document_uploaded"
          label="Document uploadé par un employé"
          description="Quand un employé dépose un document (arrêt, justificatif, etc.)."
          pref={prefs.manager_document_uploaded}
          onToggle={() => togglePref('manager_document_uploaded')}
          onChannel={(ch, v) => toggleChannel('manager_document_uploaded', ch, v)}
        />
      </Section>

      {/* ── Employee section ── */}
      <Section
        icon={<Users size={18} />}
        title="Notifications employés"
        subtitle="Ce que vos employés reçoivent (canaux configurés par défaut)"
      >
        <SettingRow
          prefKey="employee_shift_published"
          label="Planning publié"
          description="L'employé est notifié dès qu'un nouveau planning le concernant est disponible."
          pref={prefs.employee_shift_published}
          onToggle={() => togglePref('employee_shift_published')}
          onChannel={(ch, v) => toggleChannel('employee_shift_published', ch, v)}
        />
        <SettingRow
          prefKey="employee_shift_reminder"
          label="Rappel de shift"
          description="Rappel automatique 1h avant le début du shift de l'employé."
          pref={prefs.employee_shift_reminder}
          onToggle={() => togglePref('employee_shift_reminder')}
          onChannel={(ch, v) => toggleChannel('employee_shift_reminder', ch, v)}
        />
        <SettingRow
          prefKey="employee_absence_approved"
          label="Demande d'absence traitée"
          description="L'employé est informé de l'acceptation ou du refus de sa demande."
          pref={prefs.employee_absence_approved}
          onToggle={() => togglePref('employee_absence_approved')}
          onChannel={(ch, v) => toggleChannel('employee_absence_approved', ch, v)}
        />
        <SettingRow
          prefKey="employee_swap_response"
          label="Réponse à un échange de shift"
          description="L'employé est notifié quand sa proposition d'échange est acceptée ou refusée."
          pref={prefs.employee_swap_response}
          onToggle={() => togglePref('employee_swap_response')}
          onChannel={(ch, v) => toggleChannel('employee_swap_response', ch, v)}
        />
      </Section>

      {/* spin keyframe (inline) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
