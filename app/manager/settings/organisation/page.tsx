'use client'

import { useState } from 'react'
import { Building2, Save, Upload, X } from 'lucide-react'

// ── Demo data ─────────────────────────────────────────────────────────────────

const INITIAL = {
  establishment_name: 'Boulangerie du Marché',
  org_address:        '12 rue de la Paix, 75001 Paris',
  org_phone:          '01 23 45 67 89',
  org_email:          'contact@boulangerie-marche.fr',
  org_siret:          '123 456 789 00012',
  org_timezone:       'Europe/Paris',
}

const TIMEZONES = [
  'Europe/Paris',
  'Europe/Brussels',
  'Europe/Zurich',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
]

// ── Field label helper ────────────────────────────────────────────────────────

function FieldLabel({ text }: { text: string }) {
  return (
    <label
      className="block"
      style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}
    >
      {text}
    </label>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrganisationPage() {
  const [fields, setFields] = useState(INITIAL)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  function set(key: keyof typeof INITIAL, value: string) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Organisation
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Informations générales de votre établissement.
        </p>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Informations de l'établissement
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Ces données apparaissent sur vos exports et documents.
            </p>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Logo */}
          <div>
            <FieldLabel text="Logo de l'établissement" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {logoPreview ? (
                <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <button
                    onClick={() => setLogoPreview(null)}
                    style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 20, height: 20,
                      backgroundColor: 'var(--danger)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: 8,
                  border: '2px dashed var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Building2 size={24} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}

              <div>
                <button
                  onClick={() => window.alert('🎭 Mode démo')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '7px 14px',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={14} />
                  Choisir une image
                </button>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  PNG, JPG · max 2 Mo
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <FieldLabel text="Nom de l'établissement" />
            <input
              className="dp-input"
              style={{ height: 36, fontSize: 13, padding: '0 12px' }}
              value={fields.establishment_name}
              onChange={e => set('establishment_name', e.target.value)}
              placeholder="Nom de l'établissement"
            />
          </div>

          {/* Address */}
          <div>
            <FieldLabel text="Adresse" />
            <input
              className="dp-input"
              style={{ height: 36, fontSize: 13, padding: '0 12px' }}
              value={fields.org_address}
              onChange={e => set('org_address', e.target.value)}
              placeholder="Adresse complète"
            />
          </div>

          {/* Phone + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <FieldLabel text="Téléphone" />
              <input
                className="dp-input"
                style={{ height: 36, fontSize: 13, padding: '0 12px' }}
                value={fields.org_phone}
                onChange={e => set('org_phone', e.target.value)}
                placeholder="01 00 00 00 00"
              />
            </div>
            <div>
              <FieldLabel text="Email" />
              <input
                className="dp-input"
                style={{ height: 36, fontSize: 13, padding: '0 12px' }}
                type="email"
                value={fields.org_email}
                onChange={e => set('org_email', e.target.value)}
                placeholder="email@exemple.fr"
              />
            </div>
          </div>

          {/* SIRET + Timezone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <FieldLabel text="SIRET" />
              <input
                className="dp-input"
                style={{ height: 36, fontSize: 13, padding: '0 12px' }}
                value={fields.org_siret}
                onChange={e => set('org_siret', e.target.value)}
                placeholder="XXX XXX XXX XXXXX"
              />
            </div>
            <div>
              <FieldLabel text="Fuseau horaire" />
              <select
                className="dp-input"
                style={{ height: 36, fontSize: 13, padding: '0 12px' }}
                value={fields.org_timezone}
                onChange={e => set('org_timezone', e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 20px',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            className="btn-primary"
            onClick={() => window.alert('🎭 Mode démo')}
          >
            <Save size={14} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
