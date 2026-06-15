'use client'

import { useState } from 'react'
import { Check, ChevronRight, BookOpen } from 'lucide-react'
import { TutorialPanel } from '@/components/tutorial-panel'

const ACTIVITY_TYPES = [
  { id: 'fast_food',     label: 'Restauration rapide',        emoji: '🍔' },
  { id: 'restaurant',    label: 'Restauration traditionnelle', emoji: '🍽️' },
  { id: 'bakery',        label: 'Boulangerie / Pâtisserie',   emoji: '🥐' },
  { id: 'hotel',         label: 'Hôtellerie',                 emoji: '🏨' },
  { id: 'catering',      label: 'Traiteur / Événementiel',    emoji: '🎪' },
  { id: 'camping',       label: 'Hôtellerie de plein air',    emoji: '🏕️' },
  { id: 'pizza',         label: 'Pizzeria',                   emoji: '🍕' },
  { id: 'cafe',          label: 'Café / Bar / Brasserie',     emoji: '☕' },
  { id: 'food_industry', label: 'Industrie alimentaire',      emoji: '🏭' },
  { id: 'other',         label: 'Autre',                      emoji: '🔧' },
] as const
type ActivityTypeId = (typeof ACTIVITY_TYPES)[number]['id']

type ConventionData = { code: string; label: string; weekly_hours: string; overtime_from: string; rest_hours: string; notes: string }

const CONVENTIONS: Record<string, ConventionData> = {
  'IDCC 1501': { code: 'IDCC 1501', label: 'Restauration Rapide',                  weekly_hours: '35h', overtime_from: '36h', rest_hours: '11h', notes: 'Majoration 10 % entre 36h et 43h, puis 25 % au-delà.' },
  'IDCC 1786': { code: 'IDCC 1786', label: 'CHR — Cafés Hôtels Restaurants',       weekly_hours: '39h (équivalences)', overtime_from: '36h', rest_hours: '11h', notes: "Régime des équivalences : 39h réelles = 35h légales pour hôtels et restaurants." },
  'IDCC 1286': { code: 'IDCC 1286', label: 'CHR — ancienne convention',            weekly_hours: '39h', overtime_from: '36h', rest_hours: '11h', notes: "Convention antérieure à la CCN CHR 1997, encore appliquée dans certains établissements." },
  'IDCC 3061': { code: 'IDCC 3061', label: 'Boulangerie-Pâtisserie Artisanale',    weekly_hours: '35h', overtime_from: '36h', rest_hours: '11h', notes: "Travail dominical fréquent avec compensations spécifiques. Travail de nuit dès 21h." },
  'IDCC 2601': { code: 'IDCC 2601', label: 'Boulangerie Industrielle',             weekly_hours: '35h', overtime_from: '36h', rest_hours: '11h', notes: "Majoration nuit et dimanche. Modulation annuelle possible." },
  'IDCC 1979': { code: 'IDCC 1979', label: 'Hôtellerie',                           weekly_hours: '39h (équivalences)', overtime_from: '36h', rest_hours: '11h', notes: "Équivalences similaires à la CCN CHR. Repos compensateur obligatoire." },
  'IDCC 1938': { code: 'IDCC 1938', label: 'Traiteurs et Organisateurs de Réceptions', weekly_hours: '35h', overtime_from: '36h', rest_hours: '11h', notes: "Modulation du temps de travail largement utilisée. Majorations week-end." },
  'IDCC 2060': { code: 'IDCC 2060', label: 'Hôtellerie de Plein Air',              weekly_hours: '35h', overtime_from: '36h', rest_hours: '11h', notes: "Saisonnalité importante. Repos compensateur et repos hebdomadaire spécifiques." },
  'IDCC 2584': { code: 'IDCC 2584', label: 'Pizzerias et Assimilés',               weekly_hours: '39h (équivalences)', overtime_from: '36h', rest_hours: '11h', notes: "Rattaché aux conventions CHR pour les pizzerias avec service à table." },
}

const ACTIVITY_CONVENTIONS: Record<ActivityTypeId, string[]> = {
  fast_food:    ['IDCC 1501'],
  restaurant:   ['IDCC 1786', 'IDCC 1286'],
  bakery:       ['IDCC 3061', 'IDCC 2601'],
  hotel:        ['IDCC 1979', 'IDCC 1786'],
  catering:     ['IDCC 1938'],
  camping:      ['IDCC 2060'],
  pizza:        ['IDCC 2584'],
  cafe:         ['IDCC 1786', 'IDCC 1286'],
  food_industry:['IDCC 2601'],
  other:        [],
}

const BREAK_TRIGGER_OPTIONS = [{ value: '300', label: '5h00' }, { value: '330', label: '5h30' }, { value: '360', label: '6h00' }, { value: '390', label: '6h30' }, { value: '420', label: '7h00' }]
const MIN_SHIFT_OPTIONS = [{ value: '15', label: '15 min' }, { value: '30', label: '30 min' }, { value: '60', label: '1h' }, { value: '120', label: '2h' }]
const MAX_SHIFT_OPTIONS = [{ value: '240', label: '4h' }, { value: '360', label: '6h' }, { value: '480', label: '8h' }, { value: '600', label: '10h' }, { value: '720', label: '12h' }, { value: '840', label: '14h' }]
const REST_OPTIONS = [{ value: '8', label: '8h' }, { value: '9', label: '9h' }, { value: '10', label: '10h' }, { value: '11', label: '11h (légal)' }, { value: '12', label: '12h' }]
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

type Settings = {
  collective_agreement: string; opening_time: string; closing_time: string;
  break_trigger_minutes: string; paid_breaks: string; employer_charges_rate: string;
  reference_work_days: string; meal_allowance_enabled: string;
  min_shift_duration: string; max_shift_duration: string; min_rest_hours: string;
  overtime_allowed: string; color_shift: string; color_absence: string;
  color_conge: string; color_overtime: string;
}

const DEFAULTS: Settings = {
  collective_agreement: 'IDCC 3061', opening_time: '06:00', closing_time: '20:00',
  break_trigger_minutes: '360', paid_breaks: 'false', employer_charges_rate: '43',
  reference_work_days: '5', meal_allowance_enabled: 'false',
  min_shift_duration: '30', max_shift_duration: '600', min_rest_hours: '11',
  overtime_allowed: 'true', color_shift: '#3B82F6', color_absence: '#EF4444',
  color_conge: '#10B981', color_overtime: '#F59E0B',
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={onToggle}
      style={{ position: 'relative', display: 'inline-flex', width: 44, height: 24, alignItems: 'center', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'background-color 150ms', backgroundColor: checked ? 'var(--accent)' : 'var(--border)', flexShrink: 0 }}
    >
      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: checked ? 'translateX(22px)' : 'translateX(4px)', transition: 'transform 150ms' }} />
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

export default function ReglesPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [closedDays, setClosedDays] = useState<number[]>([])
  const [activityType, setActivityType] = useState<ActivityTypeId | ''>('bakery')
  const [customAgreement, setCustomAgreement] = useState('')

  function set<K extends keyof Settings>(key: K, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function toggleDay(idx: number) {
    setClosedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])
  }

  function selectActivityType(id: ActivityTypeId) {
    setActivityType(id)
    const options = ACTIVITY_CONVENTIONS[id]
    if (options.length === 1) set('collective_agreement', options[0])
    else if (id === 'other') set('collective_agreement', 'Autre')
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      alert('🎭 Mode démo · Les paramètres ne sont pas sauvegardés')
    }, 600)
  }

  const conventionDetails = settings.collective_agreement !== 'Autre' ? CONVENTIONS[settings.collective_agreement] : null
  const availableConventions = activityType ? ACTIVITY_CONVENTIONS[activityType] : null

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }
  const selectStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: 13, width: '100%', cursor: 'pointer' }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Planning</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
          Règles de planification, horaires et personnalisation visuelle.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <TutorialPanel sectionId="settings" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Convention collective */}
        <SectionCard title="Convention collective">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={15} style={{ color: '#D97706' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Détermine les règles légales applicables (repos, heures sup., primes).
            </p>
          </div>

          {/* Step 1 — Activity type */}
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Étape 1 — Type d&apos;activité
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
            {ACTIVITY_TYPES.map(at => (
              <button
                key={at.id}
                onClick={() => selectActivityType(at.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 6px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                  border: `1px solid ${activityType === at.id ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: activityType === at.id ? 'var(--accent-light)' : 'transparent',
                  transition: 'all 150ms',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{at.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1.3, color: activityType === at.id ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {at.label}
                </span>
                {activityType === at.id && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />}
              </button>
            ))}
          </div>

          {/* Step 2 — Convention selector */}
          {activityType && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Étape 2 — Convention collective
              </p>

              {activityType === 'other' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nom de la convention</label>
                    <input className="dp-input" value={customAgreement} onChange={e => setCustomAgreement(e.target.value)} placeholder="Ex: Convention entreprise interne" style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Numéro IDCC (facultatif)</label>
                    <input className="dp-input" value={settings.collective_agreement === 'Autre' ? '' : settings.collective_agreement} onChange={e => set('collective_agreement', e.target.value || 'Autre')} placeholder="Ex: IDCC 9999" style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>
              ) : availableConventions && availableConventions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {availableConventions.map(code => {
                    const conv = CONVENTIONS[code]
                    const isSelected = settings.collective_agreement === code
                    return (
                      <button
                        key={code}
                        onClick={() => set('collective_agreement', code)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                          transition: 'all 150ms',
                        }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: isSelected ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: isSelected ? 'var(--accent)' : 'var(--text-primary)', margin: 0 }}>{code}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{conv?.label}</p>
                        </div>
                        {isSelected && <Check size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {/* Convention details panel */}
              {conventionDetails && (
                <div style={{ marginTop: 12, borderRadius: 10, padding: 16, border: '1px solid #FDE68A', backgroundColor: '#FFFBEB' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px 0' }}>
                    {conventionDetails.code} — {conventionDetails.label}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                    {[
                      { label: 'Durée légale hebdo', value: conventionDetails.weekly_hours },
                      { label: 'Heures sup. dès',    value: conventionDetails.overtime_from },
                      { label: 'Repos quotidien',    value: conventionDetails.rest_hours },
                    ].map(item => (
                      <div key={item.label} style={{ borderRadius: 8, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #FDE68A' }}>
                        <p style={{ fontSize: 10, fontWeight: 500, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px 0' }}>{item.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', margin: 0 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <ChevronRight size={13} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5, margin: 0 }}>{conventionDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Horaires établissement */}
        <SectionCard title="Horaires de l'établissement">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Plage d&apos;ouverture utilisée comme référence pour les alertes de planning.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ouverture</label>
              <input type="time" className="dp-input" value={settings.opening_time} onChange={e => set('opening_time', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ paddingTop: 20, color: 'var(--text-tertiary)', fontSize: 16 }}>→</div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Fermeture</label>
              <input type="time" className="dp-input" value={settings.closing_time} onChange={e => set('closing_time', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
        </SectionCard>

        {/* Règles de planification */}
        <SectionCard title="Règles de planification">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Contraintes appliquées lors de la création des créneaux.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Durée minimum d&apos;un créneau</label>
              <select value={settings.min_shift_duration} onChange={e => set('min_shift_duration', e.target.value)} style={selectStyle}>
                {MIN_SHIFT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Durée maximum d&apos;un créneau</label>
              <select value={settings.max_shift_duration} onChange={e => set('max_shift_duration', e.target.value)} style={selectStyle}>
                {MAX_SHIFT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Repos minimum entre deux shifts</label>
            <select value={settings.min_rest_hours} onChange={e => set('min_rest_hours', e.target.value)} style={{ ...selectStyle, maxWidth: 200 }}>
              {REST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Heures supplémentaires autorisées</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                Si désactivé, une alerte bloquante empêche de planifier au-delà du contrat.
              </p>
            </div>
            <Toggle checked={settings.overtime_allowed === 'true'} onToggle={() => set('overtime_allowed', settings.overtime_allowed === 'true' ? 'false' : 'true')} />
          </div>
        </SectionCard>

        {/* Jours de fermeture */}
        <SectionCard title="Jours de fermeture">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Les jours sélectionnés sont marqués comme fermés sur la grille de planning.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {WEEK_DAYS.map((day, idx) => {
              const closed = closedDays.includes(idx)
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  style={{
                    height: 36, width: 48, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms',
                    border: `1px solid ${closed ? 'var(--danger)' : 'var(--border)'}`,
                    backgroundColor: closed ? '#FEE2E2' : 'transparent',
                    color: closed ? 'var(--danger)' : 'var(--text-secondary)',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {closedDays.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, marginBottom: 0 }}>
              Fermé le{closedDays.length > 1 ? 's' : ''} : {closedDays.sort().map(d => WEEK_DAYS[d]).join(', ')}
            </p>
          )}
        </SectionCard>

        {/* Règles des pauses */}
        <SectionCard title="Règles des pauses">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Seuil à partir duquel une pause obligatoire est déclenchée (légal : 6h).
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Durée de travail avant déclenchement d&apos;une pause</label>
            <select value={settings.break_trigger_minutes} onChange={e => set('break_trigger_minutes', e.target.value)} style={{ ...selectStyle, maxWidth: 180 }}>
              {BREAK_TRIGGER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Rémunération des pauses</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                Si activé, les temps de pause sont comptabilisés dans les heures payées.
              </p>
            </div>
            <Toggle checked={settings.paid_breaks === 'true'} onToggle={() => set('paid_breaks', settings.paid_breaks === 'true' ? 'false' : 'true')} />
          </div>
        </SectionCard>

        {/* Paramètres salariaux */}
        <SectionCard title="Paramètres salariaux">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Utilisés pour les estimations de coût dans le rapport.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Taux de charges patronales (%)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" min="0" max="100" step="0.5" className="dp-input" value={settings.employer_charges_rate} onChange={e => set('employer_charges_rate', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', paddingRight: 32 }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-tertiary)' }}>%</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Jours travaillés de référence</label>
              <div style={{ position: 'relative' }}>
                <input type="number" min="1" max="7" step="1" className="dp-input" value={settings.reference_work_days} onChange={e => set('reference_work_days', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', paddingRight: 56 }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-tertiary)' }}>j/sem.</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Indemnisation des repas</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                Selon la convention, un repas est dû pour tout shift de plus de 5h.
              </p>
            </div>
            <Toggle checked={settings.meal_allowance_enabled === 'true'} onToggle={() => set('meal_allowance_enabled', settings.meal_allowance_enabled === 'true' ? 'false' : 'true')} />
          </div>
        </SectionCard>

        {/* Couleurs du planning */}
        <SectionCard title="Couleurs du planning">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Personnalisez les couleurs affichées sur la grille de planning.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'color_shift'    as const, label: 'Shift normal' },
              { key: 'color_absence'  as const, label: 'Absence'      },
              { key: 'color_conge'    as const, label: 'Congé'        },
              { key: 'color_overtime' as const, label: 'Heures sup.'  },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color" value={settings[key]} onChange={e => set(key, e.target.value)}
                  style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)', margin: 0 }}>{settings[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'center' }}
          >
            {saving ? 'Enregistrement…' : saved ? <><Check size={15} />Enregistré !</> : 'Enregistrer les règles'}
          </button>
        </div>
      </div>
    </div>
  )
}
