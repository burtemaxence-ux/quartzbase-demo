'use client'

import { useState } from 'react'
import { Check, FileText } from 'lucide-react'
import { TutorialPanel } from '@/components/tutorial-panel'

type ContractConfig = {
  enabled: boolean
  max_hours_week: number
  alert_hours_week: number
  alert_complementary: boolean
}

type ContractKey = 'CDI 35h' | 'CDI temps partiel' | 'CDD' | 'CDD Saisonnier' | 'Extra' | 'Apprentissage' | 'Stage'

const CONTRACT_KEYS: ContractKey[] = ['CDI 35h', 'CDI temps partiel', 'CDD', 'CDD Saisonnier', 'Extra', 'Apprentissage', 'Stage']

const DEFAULTS: Record<ContractKey, ContractConfig> = {
  'CDI 35h':           { enabled: true,  max_hours_week: 0,  alert_hours_week: 37, alert_complementary: false },
  'CDI temps partiel': { enabled: true,  max_hours_week: 0,  alert_hours_week: 0,  alert_complementary: true  },
  'CDD':               { enabled: true,  max_hours_week: 0,  alert_hours_week: 0,  alert_complementary: false },
  'CDD Saisonnier':    { enabled: true,  max_hours_week: 0,  alert_hours_week: 0,  alert_complementary: false },
  'Extra':             { enabled: true,  max_hours_week: 0,  alert_hours_week: 0,  alert_complementary: true  },
  'Apprentissage':     { enabled: true,  max_hours_week: 28, alert_hours_week: 0,  alert_complementary: false },
  'Stage':             { enabled: true,  max_hours_week: 0,  alert_hours_week: 0,  alert_complementary: false },
}

function Toggle({ checked, onToggle, small }: { checked: boolean; onToggle: () => void; small?: boolean }) {
  const w = small ? 36 : 44
  const h = small ? 20 : 24
  const dotSize = small ? 13 : 16
  const on = small ? 17 : 22
  return (
    <button
      role="switch" aria-checked={checked} onClick={onToggle}
      style={{ position: 'relative', display: 'inline-flex', width: w, height: h, alignItems: 'center', borderRadius: h / 2, border: 'none', cursor: 'pointer', transition: 'background-color 150ms', backgroundColor: checked ? 'var(--accent)' : 'var(--border)', flexShrink: 0 }}
    >
      <span style={{ display: 'inline-block', width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: checked ? `translateX(${on}px)` : 'translateX(3px)', transition: 'transform 150ms' }} />
    </button>
  )
}

function NumInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative', width: 72 }}>
      <input
        type="number" min="0" step="0.5"
        value={value === 0 ? '' : value}
        onChange={e => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
        placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', height: 32, padding: '0 22px 0 8px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: 13, textAlign: 'center' }}
      />
      <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--text-tertiary)' }}>h</span>
    </div>
  )
}

export default function ContratsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<Record<ContractKey, ContractConfig>>(DEFAULTS)

  function setField<K extends keyof ContractConfig>(type: ContractKey, field: K, value: ContractConfig[K]) {
    setConfig(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }))
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

  const enabledKeys = CONTRACT_KEYS.filter(k => config[k].enabled)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Contrats & RH</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
          Types de contrats actifs et limites automatiques par type.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <TutorialPanel sectionId="settings" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Types de contrats disponibles */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={15} style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Types de contrats disponibles</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Activez les types proposés lors de la création d&apos;un employé.</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px' }}>
            {CONTRACT_KEYS.map((key, i) => (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < CONTRACT_KEYS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: config[key].enabled ? 'var(--success)' : 'var(--border)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: config[key].enabled ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{key}</span>
                </div>
                <Toggle checked={config[key].enabled} onToggle={() => setField(key, 'enabled', !config[key].enabled)} small />
              </div>
            ))}
          </div>
        </div>

        {/* Limites et alertes */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Limites et alertes par type</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Configurez les seuils d&apos;alerte et les maximums légaux par contrat.</p>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            {enabledKeys.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
                Aucun type de contrat activé.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600, paddingRight: 16 }}>Type</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Max h/sem</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Alerte h/sem</th>
                    <th style={{ textAlign: 'center', padding: '10px 0 10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>H. comp.</th>
                  </tr>
                </thead>
                <tbody>
                  {enabledKeys.map(key => (
                    <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px 12px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{key}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <NumInput value={config[key].max_hours_week} onChange={v => setField(key, 'max_hours_week', v)} placeholder="—" />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <NumInput value={config[key].alert_hours_week} onChange={v => setField(key, 'alert_hours_week', v)} placeholder="—" />
                      </td>
                      <td style={{ padding: '12px 0 12px 12px', textAlign: 'center' }}>
                        <Toggle checked={config[key].alert_complementary} onToggle={() => setField(key, 'alert_complementary', !config[key].alert_complementary)} small />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Max h/sem', desc: 'Bloque la planification au-delà de ce seuil.' },
                { label: 'Alerte h/sem', desc: 'Déclenche une alerte sans bloquer (ex : 37h pour CDI 35h).' },
                { label: 'H. comp.', desc: "Alerte si les heures planifiées dépassent 1/3 du contrat (temps partiels, extras)." },
              ].map(({ label, desc }) => (
                <p key={label} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span> — {desc}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'center' }}
          >
            {saving ? 'Enregistrement…' : saved ? <><Check size={15} />Enregistré !</> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
