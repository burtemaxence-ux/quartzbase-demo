'use client'

import { useState } from 'react'
import { TutorialPanel } from '@/components/tutorial-panel'
import {
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  Users,
  Timer,
  X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type SlotStatus = 'open' | 'filled' | 'expired' | 'cancelled'
type AppStatus = 'pending' | 'accepted' | 'rejected'

type Application = {
  id: string
  employeeId: string
  employeeName: string
  status: AppStatus
  createdAt: string
}

type Slot = {
  id: string
  status: SlotStatus
  reason: string | null
  expiresAt: string
  filledByName?: string
  shift: {
    date: string
    startTime: string
    endTime: string
    position: string | null
    employeeName: string | null
  }
  applications: Application[]
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_SLOTS: Slot[] = [
  {
    id: 's1',
    status: 'open',
    reason: 'Maladie',
    expiresAt: new Date(Date.now() + 5 * 3600000).toISOString(),
    shift: {
      date: '2026-06-15',
      startTime: '07:00',
      endTime: '15:30',
      position: 'Boulanger',
      employeeName: 'Emma Laurent',
    },
    applications: [
      {
        id: 'a1',
        employeeId: 'u1',
        employeeName: 'Marc Petit',
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'a2',
        employeeId: 'u2',
        employeeName: 'Théo Renard',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 's2',
    status: 'filled',
    reason: 'Renfort demandé',
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    filledByName: 'Sophie Martin',
    shift: {
      date: '2026-06-13',
      startTime: '09:00',
      endTime: '17:00',
      position: 'Vendeuse',
      employeeName: 'Camille Bernard',
    },
    applications: [
      {
        id: 'a3',
        employeeId: 'u3',
        employeeName: 'Sophie Martin',
        status: 'accepted',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function fmtTime(s: string, e: string): string {
  return `${s.slice(0, 5)} – ${e.slice(0, 5)}`
}

function fmtExpiry(expiresAt: string): { label: string; urgent: boolean } {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return { label: 'Expiré', urgent: true }
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return { label: `${m} min`, urgent: true }
  if (h < 3) {
    const pad = m.toString().padStart(2, '0')
    return { label: `${h}h${pad}`, urgent: true }
  }
  return { label: `${h}h`, urgent: false }
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  return `il y a ${h}h`
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── Status configs ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SlotStatus,
  { label: string; bg: string; color: string; iconBg: string; iconColor: string }
> = {
  open: {
    label: 'Ouvert',
    bg: '#EFF6FF',
    color: '#2563EB',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  filled: {
    label: 'Pourvu',
    bg: '#DCFCE7',
    color: '#16A34A',
    iconBg: '#BBF7D0',
    iconColor: '#16A34A',
  },
  expired: {
    label: 'Expiré',
    bg: '#F3F4F6',
    color: '#6B7280',
    iconBg: '#E5E7EB',
    iconColor: '#6B7280',
  },
  cancelled: {
    label: 'Annulé',
    bg: '#FEF2F2',
    color: '#DC2626',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
}

function StatusIcon({ status, size = 16 }: { status: SlotStatus; size?: number }) {
  if (status === 'open') return <Clock size={size} />
  if (status === 'filled') return <CheckCircle2 size={size} />
  if (status === 'expired') return <Timer size={size} />
  return <XCircle size={size} />
}

// ── SlotCard ──────────────────────────────────────────────────────────────────

function SlotCard({
  slot,
  expanded,
  onToggleExpand,
}: {
  slot: Slot
  expanded: boolean
  onToggleExpand: () => void
}) {
  const cfg = STATUS_CONFIG[slot.status]
  const expiry = fmtExpiry(slot.expiresAt)
  const pendingCount = slot.applications.filter((a) => a.status === 'pending').length
  const canExpand = slot.applications.length > 0 && slot.status === 'open'

  const borderColor =
    slot.status === 'open' && slot.applications.length > 0
      ? '#2563EB'
      : 'var(--border)'

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              backgroundColor: cfg.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: cfg.iconColor,
            }}
          >
            <StatusIcon status={slot.status} size={16} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Position + badge row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                {slot.shift.position ?? '—'}
              </span>
              <span
                style={{
                  backgroundColor: cfg.bg,
                  color: cfg.color,
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Reason */}
            {slot.reason && (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                {slot.reason}
              </div>
            )}

            {/* Date + time + employee */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: slot.status === 'open' ? '8px' : '0',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ textTransform: 'capitalize' }}>{fmtDate(slot.shift.date)}</span>
              </span>
              <span>{fmtTime(slot.shift.startTime, slot.shift.endTime)}</span>
              {slot.shift.employeeName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} style={{ color: 'var(--text-tertiary)' }} />
                  {slot.shift.employeeName}
                </span>
              )}
            </div>

            {/* Open-slot extras: expiry + applications */}
            {slot.status === 'open' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: expiry.urgent ? '#F97316' : 'var(--text-secondary)',
                      fontWeight: expiry.urgent ? 600 : 400,
                    }}
                  >
                    <Timer size={12} />
                    {expiry.label}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Users size={12} />
                    {slot.applications.length} candidature{slot.applications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Expand toggle */}
                {canExpand && (
                  <button
                    onClick={onToggleExpand}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '2px 0',
                    }}
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Masquer' : 'Voir les candidatures'}
                  </button>
                )}
              </div>
            )}

            {/* Filled-by indicator */}
            {slot.status === 'filled' && slot.filledByName && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                <CheckCircle2 size={12} />
                Repris par {slot.filledByName}
              </div>
            )}
          </div>

          {/* Trash button */}
          <button
            onClick={() => alert('🎭 Mode démo')}
            style={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.borderColor = 'var(--danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Applications expanded section */}
      {expanded && slot.applications.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-page)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
              marginBottom: '10px',
            }}
          >
            Candidatures
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slot.applications.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials(app.employeeName)}
                </div>

                {/* Name + time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {app.employeeName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {fmtRelative(app.createdAt)}
                  </div>
                </div>

                {/* Action / status */}
                {app.status === 'pending' && slot.status === 'open' && (
                  <button
                    onClick={() => alert('🎭 Mode démo')}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      border: 'none',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#BBF7D0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DCFCE7')}
                  >
                    Confirmer
                  </button>
                )}
                {app.status === 'accepted' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <CheckCircle2 size={11} />
                    Confirmé
                  </span>
                )}
                {app.status === 'rejected' && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Refusé
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PublishDialog ─────────────────────────────────────────────────────────────

const EXPIRE_OPTIONS = ['2h', '4h', '8h', '24h'] as const

function PublishDialog({ onClose }: { onClose: () => void }) {
  const [expiry, setExpiry] = useState<string>('4h')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Publier un shift
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Shift selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Shift
            </label>
            <select
              className="dp-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              defaultValue=""
            >
              <option value="" disabled>
                Sélectionner un shift…
              </option>
              <option value="s1">Lun 15 juin — 07:00–15:30 · Boulanger (Emma Laurent)</option>
              <option value="s2">Mar 16 juin — 14:00–22:00 · Vendeur (Théo Renard)</option>
              <option value="s3">Mer 17 juin — 09:00–17:00 · Caissier (Marc Petit)</option>
            </select>
          </div>

          {/* Raison */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Raison
            </label>
            <select
              className="dp-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              defaultValue=""
            >
              <option value="">Non précisée</option>
              <option value="maladie">Maladie</option>
              <option value="absence">Absence non justifiée</option>
              <option value="renfort">Renfort demandé</option>
              <option value="non-couvert">Shift non couvert</option>
            </select>
          </div>

          {/* Expire dans */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              Expire dans
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {EXPIRE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExpiry(opt)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: expiry === opt ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: expiry === opt ? 'var(--accent)' : 'transparent',
                    color: expiry === opt ? '#fff' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Annuler
          </button>
          <button
            onClick={() => {
              alert('🎭 Mode démo')
              onClose()
            }}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MarketplaceManagerClient ──────────────────────────────────────────────────

function MarketplaceManagerClient() {
  const [slots] = useState<Slot[]>(DEMO_SLOTS)
  const [tab, setTab] = useState<'open' | 'history'>('open')
  const [showPublish, setShowPublish] = useState(false)
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set())

  const openSlots = slots.filter((s) => s.status === 'open')
  const historySlots = slots.filter((s) => s.status !== 'open')
  const displayedSlots = tab === 'open' ? openSlots : historySlots

  const pendingApps = slots
    .filter((s) => s.status === 'open')
    .reduce((acc, s) => acc + s.applications.filter((a) => a.status === 'pending').length, 0)

  function toggleExpand(id: string) {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            padding: '3px',
            gap: '2px',
          }}
        >
          {(
            [
              { key: 'open', label: 'En cours', count: openSlots.length },
              { key: 'history', label: 'Historique', count: null },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: tab === key ? 'var(--accent)' : 'transparent',
                color: tab === key ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
              {count !== null && count > 0 && (
                <span
                  style={{
                    backgroundColor: tab === key ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                    color: tab === key ? '#fff' : 'var(--text-secondary)',
                    borderRadius: '999px',
                    padding: '0 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    minWidth: 18,
                    textAlign: 'center',
                    lineHeight: '18px',
                    display: 'inline-block',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending apps badge */}
        {pendingApps > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(251,191,36,0.15)',
              color: '#D97706',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {pendingApps} candidature{pendingApps !== 1 ? 's' : ''} en attente
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Refresh */}
        <button
          onClick={() => alert('🎭 Mode démo')}
          style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          title="Actualiser"
        >
          <RefreshCw size={15} />
        </button>

        {/* Publish button */}
        <button
          onClick={() => setShowPublish(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          Publier un shift
        </button>
      </div>

      {/* Slot list */}
      {displayedSlots.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <Users size={36} style={{ color: 'var(--text-tertiary)' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>
            {tab === 'open' ? 'Aucun shift ouvert en ce moment' : 'Aucun historique'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedSlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              expanded={expandedSlots.has(slot.id)}
              onToggleExpand={() => toggleExpand(slot.id)}
            />
          ))}
        </div>
      )}

      {/* Publish dialog */}
      {showPublish && <PublishDialog onClose={() => setShowPublish(false)} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManagerMarketplacePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: 'var(--text-primary)',
          }}
        >
          Marketplace remplaçants
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Publiez des shifts disponibles et trouvez un remplaçant en quelques minutes.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <TutorialPanel sectionId="marketplace" />
      </div>

      <MarketplaceManagerClient />
    </div>
  )
}
