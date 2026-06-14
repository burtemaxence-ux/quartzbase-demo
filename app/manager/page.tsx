'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ElementType } from 'react'
import {
  Calendar, Users, BarChart3, Clock, Settings, Palmtree,
  ArrowRight, AlertTriangle,
} from 'lucide-react'

// ── Hardcoded demo data ────────────────────────────────────────────────────────

const DEMO = {
  employeeCount: 8,
  pendingCount: 3,
  presenceRate: 87,
  latenessCount: 2,
  sparklineData: [100, 90, 87, 95, 80, 0, 0],
}

const TODAY_LABEL = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

function getCurrentWeek() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil((Math.floor((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7)
}

// ── Mini sparkline ─────────────────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  const h = 22, barW = 5, gap = 2
  const totalW = data.length * (barW + gap) - gap
  return (
    <svg width={totalW} height={h} aria-hidden="true">
      {data.map((val, i) => {
        const barH = val > 0 ? Math.max(4, Math.round((val / max) * h)) : 4
        return (
          <rect key={i} x={i * (barW + gap)} y={h - barH} width={barW} height={barH} rx={2}
            fill={val > 0 ? color : 'rgba(255,255,255,0.06)'} opacity={val > 0 ? 0.7 : 1} />
        )
      })}
    </svg>
  )
}

// ── Count-up hook ──────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    let startTime: number | null = null
    let rafId: number
    const step = (ts: number) => {
      if (startTime === null) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) { rafId = requestAnimationFrame(step) }
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])
  return value
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string; value: number; color: string; icon: ElementType; iconBg: string
  suffix?: string; progressPct: number; subLabel?: string; subLabelColored?: boolean; sparkline?: number[]
}

function KpiCard({ label, value, color, icon: Icon, iconBg, suffix = '', progressPct, subLabel, subLabelColored, sparkline }: KpiCardProps) {
  const animated = useCountUp(value)
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#0f0f16',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 14, padding: '20px 22px',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 0 0 1px rgba(108,99,255,0.2), 0 8px 24px rgba(0,0,0,0.3), 0 0 40px rgba(108,99,255,0.06)' : 'none',
        transition: 'all 200ms ease',
        display: 'flex', flexDirection: 'column' as const, gap: 10,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#5a5a72', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color, fontFamily: 'var(--font-syne)', margin: 0 }}>{animated}{suffix}</p>
      {subLabel && <p style={{ fontSize: 12, color: subLabelColored ? color : '#9090a8', margin: 0 }}>{subLabel}</p>}
      {sparkline && <div style={{ marginTop: 4 }}><MiniSparkline data={sparkline} color={color} /></div>}
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <div style={{ height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(Math.max(progressPct, 0), 100)}%`, backgroundColor: color, transition: 'width 700ms ease' }} />
        </div>
      </div>
    </div>
  )
}

// ── Modules ────────────────────────────────────────────────────────────────────

const MODULES: { title: string; description: string; icon: ElementType; href: string; accentColor: string; accentBg: string }[] = [
  { title: 'Employés',   description: 'Profils, contrats et rôles.',    icon: Users,    href: '/manager/employees', accentColor: '#00D4AA', accentBg: 'rgba(0,212,170,0.15)' },
  { title: 'Rapport',    description: 'Synthèse horaire et coûts.',      icon: BarChart3, href: '/manager/rapport',  accentColor: '#6C63FF', accentBg: 'rgba(108,99,255,0.15)' },
  { title: 'Congés',     description: "Demandes et soldes d'absence.",   icon: Palmtree, href: '/manager/conges',   accentColor: '#FFB347', accentBg: 'rgba(255,179,71,0.15)' },
  { title: 'Présences',  description: 'Horaires réels et pointages.',    icon: Clock,    href: '/manager/presences', accentColor: '#FF6B6B', accentBg: 'rgba(255,107,107,0.15)' },
  { title: 'Paramètres', description: 'Configuration et règles.',        icon: Settings, href: '/manager/settings', accentColor: '#5a5a72', accentBg: 'rgba(90,90,114,0.15)' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  const { employeeCount, pendingCount, presenceRate, latenessCount, sparklineData } = DEMO
  const presenceMeta = presenceRate >= 80
    ? { color: '#00D4AA', iconBg: 'rgba(0,212,170,0.15)', label: 'Bonne présence' }
    : { color: '#FFB347', iconBg: 'rgba(255,179,71,0.15)', label: 'Présence à surveiller' }

  return (
    <div className="min-h-screen dashboard-content" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap pt-1 dashboard-s0">
          <div>
            <h1 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
              Bonjour Maxence 👋
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Voici un aperçu de votre activité.
            </p>
            <p className="text-[11px] uppercase tracking-[0.06em] mt-1.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>
              La Boulangerie du Soleil · {TODAY_LABEL}
            </p>
          </div>
          <Link href="/manager/planning" className="btn-primary flex-shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            Voir le planning
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 dashboard-s1">
          <KpiCard label={`Présence · S${getCurrentWeek()}`} value={presenceRate} suffix="%" color={presenceMeta.color} icon={BarChart3} iconBg={presenceMeta.iconBg} progressPct={presenceRate} subLabel={presenceMeta.label} subLabelColored sparkline={sparklineData} />
          <KpiCard label="Équipe" value={employeeCount} color="#6C63FF" icon={Users} iconBg="rgba(108,99,255,0.15)" progressPct={Math.min(employeeCount * 5, 100)} subLabel="employés actifs" />
          <KpiCard label="Congés en attente" value={pendingCount} color="#FFB347" icon={Palmtree} iconBg="rgba(255,179,71,0.15)" progressPct={Math.min(pendingCount * 20, 100)} subLabel="demandes" />
          <KpiCard label="Retards ce mois" value={latenessCount} color="#FF6B6B" icon={Clock} iconBg="rgba(255,107,107,0.15)" progressPct={Math.min(latenessCount * 10, 100)} subLabel="enregistrés" />
        </div>

        {/* Alertes */}
        <div className="space-y-2 dashboard-s2">
          <Link href="/manager/conges">
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,179,71,0.05)] transition-colors" style={{ backgroundColor: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 10 }}>
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#FFB347' }} />
              <p className="flex-1 text-[13px]" style={{ color: '#f0f0f8' }}>{pendingCount} demandes de congés en attente de validation</p>
              <span className="text-[12px] font-medium flex-shrink-0" style={{ color: '#FFB347' }}>Traiter →</span>
            </div>
          </Link>
          <Link href="/manager/presences">
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,107,107,0.05)] transition-colors" style={{ backgroundColor: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10 }}>
              <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
              <p className="flex-1 text-[13px]" style={{ color: '#f0f0f8' }}>{latenessCount} retards enregistrés ce mois</p>
              <span className="text-[12px] font-medium flex-shrink-0" style={{ color: '#FF6B6B' }}>Voir →</span>
            </div>
          </Link>
        </div>

        {/* Modules */}
        <div className="space-y-3 dashboard-s3">
          <p className="text-[11px] uppercase tracking-[0.06em]" style={{ color: '#5a5a72' }}>Modules</p>

          {/* Planning principal */}
          <Link href="/manager/planning" className="block" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            <div onMouseEnter={() => setHovered('/manager/planning')} onMouseLeave={() => setHovered(null)}
              style={{ backgroundColor: '#0f0f16', border: `1px solid ${hovered === '/manager/planning' ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '18px 20px', transform: hovered === '/manager/planning' ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hovered === '/manager/planning' ? '0 0 0 1px rgba(108,99,255,0.2), 0 8px 24px rgba(0,0,0,0.3), 0 0 40px rgba(108,99,255,0.06)' : 'none', transition: 'all 200ms ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar className="h-5 w-5" style={{ color: '#6C63FF' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f8', fontFamily: 'var(--font-syne)' }}>Planning</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, backgroundColor: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}>Principal</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9090a8', marginTop: 2 }}>Créez, modifiez et publiez les horaires de votre équipe.</p>
                  </div>
                </div>
                <div className="btn-primary flex-shrink-0">Ouvrir <ArrowRight className="h-3.5 w-3.5" /></div>
              </div>
            </div>
          </Link>

          {/* Modules secondaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map(({ title, description, icon: Icon, href, accentColor, accentBg }, idx) => {
              const badge = href === '/manager/conges' ? pendingCount : 0
              return (
                <Link key={href} href={href} className="block" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: `opacity 0.4s ease ${(idx + 1) * 60}ms, transform 0.4s ease ${(idx + 1) * 60}ms` }}>
                  <div onMouseEnter={() => setHovered(href)} onMouseLeave={() => setHovered(null)}
                    style={{ backgroundColor: '#0f0f16', border: `1px solid ${hovered === href ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '18px 20px', height: '100%', transform: hovered === href ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hovered === href ? '0 0 0 1px rgba(108,99,255,0.2), 0 8px 24px rgba(0,0,0,0.3), 0 0 40px rgba(108,99,255,0.06)' : 'none', transition: 'all 200ms ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon className="h-4 w-4" style={{ color: accentColor }} />
                      </div>
                      {badge > 0 && <span style={{ backgroundColor: 'rgba(255,179,71,0.15)', color: '#FFB347', borderRadius: 6, fontSize: 10, fontWeight: 500, padding: '2px 6px' }}>{badge}</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f8', fontFamily: 'var(--font-syne)' }}>{title}</p>
                    <p style={{ fontSize: 12, color: '#9090a8', marginTop: 4 }}>{description}</p>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#6C63FF', opacity: hovered === href ? 1 : 0, transition: 'opacity 150ms ease' }}>
                      Accéder <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
