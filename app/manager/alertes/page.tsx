'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, AlarmClock, FileText, Calendar, RefreshCw, X } from 'lucide-react'

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_CDD = [
  { id: 'c1', employeeId: 'u6', employeeName: 'Théo Renard', contractType: 'CDD', endDate: '2026-07-14', daysLeft: 30 },
]

const DEMO_LATENESS = [
  { id: 'l1', employeeId: 'u2', employeeName: 'Lucas Dubois',  date: '2026-06-09', lateMinutes: 14 },
  { id: 'l2', employeeId: 'u6', employeeName: 'Théo Renard',   date: '2026-06-11', lateMinutes: 23 },
]

const DEMO_ABSENCES = [
  { id: 'ab1', employeeId: 'u3', employeeName: 'Emma Laurent', date: '2026-06-13', startTime: '08:00', endTime: '16:30' },
]

const DEMO_VIOLATIONS = [
  { employeeName: 'Sophie Martin', date: '2026-06-08', ruleName: 'Repos quotidien',             description: 'Repos inférieur à 11h consécutives',          legalRef: 'Art. L3131-1',  severity: 'critical' as const },
  { employeeName: 'Lucas Dubois',  date: '2026-06-09', ruleName: 'Durée maximale hebdomadaire', description: 'Temps de travail dépasse 48h sur la semaine', legalRef: 'Art. L3121-20', severity: 'warning'  as const },
]

type ComplianceLevel = 'CRITICAL' | 'WARNING' | 'INFO'
type ComplianceAlert = { id: string; level: ComplianceLevel; employeeName: string; message: string; createdAt: string }

const INITIAL_COMPLIANCE: ComplianceAlert[] = [
  { id: 'ca1', level: 'CRITICAL', employeeName: 'Sophie Martin', message: 'Repos quotidien insuffisant détecté sur la semaine du 2 juin. Intervention requise avant le prochain planning.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ca2', level: 'WARNING',  employeeName: 'Lucas Dubois',  message: "Approche du plafond d'heures hebdomadaires (45h/48h max). Surveillez le planning de la semaine prochaine.",       createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ca3', level: 'INFO',     employeeName: 'Théo Renard',   message: 'Contrat CDD arrivant à échéance le 14 juillet 2026. Pensez à anticiper le renouvellement ou la fin de contrat.',  createdAt: new Date(Date.now() - 259200000).toISOString() },
]

// ── Level styles ──────────────────────────────────────────────────────────────

const LEVEL_STYLES = {
  CRITICAL: { border: '#DC2626', bg: 'rgba(220,38,38,0.08)',  badge: 'rgba(220,38,38,0.15)',  badgeText: '#DC2626', label: 'CRITIQUE' },
  WARNING:  { border: '#D97706', bg: 'rgba(217,119,6,0.08)',  badge: 'rgba(217,119,6,0.15)',  badgeText: '#D97706', label: 'AVERTISSEMENT' },
  INFO:     { border: '#6C63FF', bg: 'rgba(108,99,255,0.08)', badge: 'rgba(108,99,255,0.15)', badgeText: '#6C63FF', label: 'INFO' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "à l'instant"
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} jour${days > 1 ? 's' : ''}`
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── SwipeToIgnore ─────────────────────────────────────────────────────────────

function SwipeToIgnore({ children, onIgnore }: { children: React.ReactNode; onIgnore: () => void }) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!swiping) return
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setOffset(Math.max(dx, -120))
  }

  function handleTouchEnd() {
    setSwiping(false)
    if (offset <= -80) {
      onIgnore()
    } else {
      setOffset(0)
    }
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#DC2626',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: 24,
        borderRadius: 12,
      }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Ignorer</span>
      </div>
      <div
        style={{ transform: `translateX(${offset}px)`, transition: swiping ? 'none' : 'transform 0.25s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// ── IgnoreConfirmDialog ───────────────────────────────────────────────────────

function IgnoreConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        maxWidth: 360,
        width: '100%',
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Ignorer cette alerte pendant 7 jours ?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {"L'alerte ne réapparaîtra pas avant 7 jours."}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '7px 16px' }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#DC2626', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ignorer 7 jours
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ComplianceCard ────────────────────────────────────────────────────────────

function ComplianceCard({
  alert,
  onIgnore,
  isMobile,
}: {
  alert: ComplianceAlert
  onIgnore: (id: string) => void
  isMobile: boolean
}) {
  const [confirmIgnore, setConfirmIgnore] = useState(false)
  const styles = LEVEL_STYLES[alert.level]

  const card = (
    <div style={{
      borderLeft: `4px solid ${styles.border}`,
      backgroundColor: styles.bg,
      border: `1px solid ${styles.border}20`,
      borderRadius: 12,
      padding: '14px 16px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 700,
          backgroundColor: styles.badge, color: styles.badgeText,
          padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em',
        }}>
          {styles.label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{timeAgo(alert.createdAt)}</span>
      </div>

      {/* Body */}
      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
        {alert.employeeName}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
        {alert.message}
      </p>

      {/* Actions */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 8,
        marginTop: 12,
      }}>
        <button
          onClick={() => window.alert('🎭 Mode démo')}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: styles.border, color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Voir les options
        </button>
        <button
          onClick={() => setConfirmIgnore(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 14px', fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Ignorer 7 jours
        </button>
      </div>

      {confirmIgnore && (
        <IgnoreConfirmDialog
          onConfirm={() => { setConfirmIgnore(false); onIgnore(alert.id) }}
          onCancel={() => setConfirmIgnore(false)}
        />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <SwipeToIgnore onIgnore={() => onIgnore(alert.id)}>
        {card}
      </SwipeToIgnore>
    )
  }
  return card
}

// ── Table helpers ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ color }}>{icon}</span>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
    </div>
  )
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 14px',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  backgroundColor: 'var(--accent-light)',
  borderBottom: '1px solid var(--border)',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border)',
}

// ── Main AlertesPage ──────────────────────────────────────────────────────────

export default function AlertesPage() {
  const [tab, setTab] = useState<'operationnel' | 'conformite'>('operationnel')
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>(INITIAL_COMPLIANCE)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const totalOperationnel = DEMO_CDD.length + DEMO_LATENESS.length + DEMO_ABSENCES.length + DEMO_VIOLATIONS.length
  const totalConformite = complianceAlerts.length

  function handleIgnore(id: string) {
    setComplianceAlerts(prev => prev.filter(a => a.id !== id))
  }

  const criticalCount = complianceAlerts.filter(a => a.level === 'CRITICAL').length
  const warningCount  = complianceAlerts.filter(a => a.level === 'WARNING').length
  const infoCount     = complianceAlerts.filter(a => a.level === 'INFO').length

  return (
    <div>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 10,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {/* Title row */}
          <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Alertes</h1>
            <button
              onClick={() => window.alert('🎭 Mode démo')}
              style={{
                marginLeft: 'auto',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
              }}
              title="Actualiser"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: -1 }}>
            <button
              onClick={() => setTab('operationnel')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${tab === 'operationnel' ? 'var(--accent)' : 'transparent'}`,
                color: tab === 'operationnel' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: tab === 'operationnel' ? 600 : 400,
                transition: 'color 150ms',
              }}
            >
              Opérationnel
              {totalOperationnel > 0 && (
                <span style={{
                  backgroundColor: 'rgba(217,119,6,0.2)', color: '#D97706',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                }}>
                  {totalOperationnel}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('conformite')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${tab === 'conformite' ? 'var(--accent)' : 'transparent'}`,
                color: tab === 'conformite' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: tab === 'conformite' ? 600 : 400,
                transition: 'color 150ms',
              }}
            >
              Conformité
              {totalConformite > 0 && (
                <span style={{
                  backgroundColor: 'rgba(220,38,38,0.15)', color: '#DC2626',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                }}>
                  {totalConformite}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px' : '24px' }}>

        {/* ── Opérationnel tab ── */}
        {tab === 'operationnel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {totalOperationnel === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '48px 24px', gap: 12,
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
              }}>
                <AlertTriangle size={32} style={{ color: 'var(--text-tertiary)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aucune alerte opérationnelle</p>
              </div>
            ) : (
              <>
                {/* 1. Violations */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionHeader
                    icon={<AlertTriangle size={16} />}
                    color="#DC2626"
                    title="Violations Code du travail (7 derniers jours)"
                  />
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Employé</th>
                          <th style={thStyle}>Date</th>
                          <th style={thStyle}>Règle légale</th>
                          <th style={thStyle}>Sévérité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_VIOLATIONS.map((v, i) => (
                          <tr
                            key={i}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={tdStyle}>{v.employeeName}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{formatDate(v.date)}</td>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: 500 }}>{v.ruleName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{v.legalRef}</div>
                            </td>
                            <td style={tdStyle}>
                              {v.severity === 'critical' ? (
                                <span style={{
                                  fontSize: 11, fontWeight: 600,
                                  backgroundColor: 'rgba(220,38,38,0.15)', color: '#DC2626',
                                  padding: '2px 8px', borderRadius: 6,
                                }}>Critique</span>
                              ) : (
                                <span style={{
                                  fontSize: 11, fontWeight: 600,
                                  backgroundColor: 'rgba(255,237,213,1)', color: '#D97706',
                                  padding: '2px 8px', borderRadius: 6,
                                }}>Avertissement</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 2. CDD */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionHeader
                    icon={<FileText size={16} />}
                    color="#D97706"
                    title="CDD expirant dans les 30 jours"
                  />
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Employé</th>
                          <th style={thStyle}>Type contrat</th>
                          <th style={thStyle}>Fin le</th>
                          <th style={thStyle}>Délai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_CDD.map(c => (
                          <tr
                            key={c.id}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={tdStyle}>
                              <span style={{ fontWeight: 500 }}>{c.employeeName}</span>
                            </td>
                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{c.contractType}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{formatDate(c.endDate)}</td>
                            <td style={tdStyle}>
                              <span style={{
                                fontSize: 11, fontWeight: 600,
                                backgroundColor: c.daysLeft <= 7 ? 'rgba(220,38,38,0.15)' : c.daysLeft <= 15 ? 'rgba(255,152,0,0.2)' : '#FEF3C7',
                                color: c.daysLeft <= 7 ? '#DC2626' : c.daysLeft <= 15 ? '#D97706' : '#92400E',
                                padding: '2px 8px', borderRadius: 6,
                              }}>
                                {c.daysLeft} jours
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 3. Lateness */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionHeader
                    icon={<AlarmClock size={16} />}
                    color="#F97316"
                    title="Retards non justifiés (7 derniers jours)"
                  />
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Employé</th>
                          <th style={thStyle}>Date</th>
                          <th style={thStyle}>Retard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_LATENESS.map(l => (
                          <tr
                            key={l.id}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={tdStyle}>{l.employeeName}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{formatDate(l.date)}</td>
                            <td style={tdStyle}>
                              <span style={{
                                fontSize: 11, fontWeight: 600,
                                backgroundColor: 'rgba(255,237,213,1)', color: '#D97706',
                                padding: '2px 8px', borderRadius: 6,
                              }}>
                                {l.lateMinutes} min
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4. Absences */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionHeader
                    icon={<Calendar size={16} />}
                    color="#DC2626"
                    title="Absences non pointées (hier)"
                  />
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Employé</th>
                          <th style={thStyle}>Shift prévu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_ABSENCES.map(ab => (
                          <tr
                            key={ab.id}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={tdStyle}>{ab.employeeName}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                              {formatDate(ab.date)} · {ab.startTime} – {ab.endTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* ── Conformité tab ── */}
        {tab === 'conformite' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {complianceAlerts.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '48px 24px', gap: 12,
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  backgroundColor: 'rgba(0,212,170,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={28} style={{ color: '#00D4AA' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aucune alerte de conformité</p>
              </div>
            ) : (
              <>
                {/* Count pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {criticalCount > 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      backgroundColor: 'rgba(220,38,38,0.15)', color: '#DC2626',
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      backgroundColor: 'rgba(217,119,6,0.15)', color: '#D97706',
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {infoCount > 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      backgroundColor: 'rgba(108,99,255,0.15)', color: '#6C63FF',
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {infoCount} info{infoCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Cards */}
                {complianceAlerts.map(a => (
                  <ComplianceCard
                    key={a.id}
                    alert={a}
                    onIgnore={handleIgnore}
                    isMobile={isMobile}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
