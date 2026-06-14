'use client'

import { ArrowLeftRight, Clock } from 'lucide-react'
import { useState } from 'react'

type Exchange = {
  id: string
  date: string
  startTime: string
  endTime: string
  position: string
  proposer: { name: string }
  acceptor: { name: string }
  proposerNote: string | null
  createdAt: string
}

const DEMO_EXCHANGES: Exchange[] = [
  {
    id: 'e1',
    date: '2026-06-16',
    startTime: '07:00',
    endTime: '15:30',
    position: 'Boulanger',
    proposer: { name: 'Sophie Martin' },
    acceptor: { name: 'Lucas Dubois' },
    proposerNote: "Je ne peux pas ce jour-là, Lucas m'a proposé d'échanger.",
    createdAt: '2026-06-13T09:00:00Z',
  },
  {
    id: 'e2',
    date: '2026-06-18',
    startTime: '14:00',
    endTime: '22:00',
    position: 'Vendeur',
    proposer: { name: 'Théo Renard' },
    acceptor: { name: 'Camille Bernard' },
    proposerNote: null,
    createdAt: '2026-06-13T14:00:00Z',
  },
]

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

export default function ManagerEchangesPage() {
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})
  const exchanges = DEMO_EXCHANGES

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--bg-page)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ArrowLeftRight size={20} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          Échanges de shifts
        </h1>
        {exchanges.length > 0 && (
          <span
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {exchanges.length}
          </span>
        )}
      </div>

      <div style={{ padding: '20px', maxWidth: '680px', margin: '0 auto' }}>
        {exchanges.length === 0 ? (
          /* Empty state */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              paddingTop: '80px',
              textAlign: 'center',
            }}
          >
            <ArrowLeftRight size={40} style={{ color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '16px', margin: 0 }}>
              Aucun échange en attente
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Les demandes d&apos;échange de shifts de votre équipe apparaîtront ici.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exchanges.map((ex) => (
              <ExchangeCard
                key={ex.id}
                exchange={ex}
                note={noteMap[ex.id] ?? ''}
                onNoteChange={(val) => setNoteMap((prev) => ({ ...prev, [ex.id]: val }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ExchangeCard({
  exchange,
  note,
  onNoteChange,
}: {
  exchange: Exchange
  note: string
  onNoteChange: (v: string) => void
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px' }}>
        {/* Badge + date row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,179,71,0.15)',
              color: 'var(--warning)',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Clock size={12} />
            En attente de validation
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {new Date(exchange.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Shift info box */}
        <div
          style={{
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {fmtDate(exchange.date)}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
            {fmtTime(exchange.startTime, exchange.endTime)}
          </div>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {exchange.position}
          </span>
        </div>

        {/* People grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          {[
            { label: 'Propose', name: exchange.proposer.name },
            { label: 'Reprend', name: exchange.acceptor.name },
          ].map(({ label, name }) => (
            <div
              key={label}
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                  marginBottom: '4px',
                }}
              >
                {label}
              </div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{name}</div>
            </div>
          ))}
        </div>

        {/* Proposer note */}
        {exchange.proposerNote && (
          <p
            style={{
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              margin: '0 0 12px 0',
              paddingLeft: '12px',
              borderLeft: '3px solid var(--border)',
              lineHeight: 1.5,
            }}
          >
            &ldquo;{exchange.proposerNote}&rdquo;
          </p>
        )}

        {/* Manager note input */}
        <div style={{ marginBottom: '4px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Note du manager (optionnel)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ajouter une note…"
            className="dp-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => alert('🎭 Mode démo')}
          style={{
            padding: '14px',
            backgroundColor: 'rgba(0,212,170,0.12)',
            color: 'var(--success)',
            border: 'none',
            borderRight: '1px solid var(--border)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,212,170,0.22)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,212,170,0.12)')}
        >
          Approuver l&apos;échange
        </button>
        <button
          onClick={() => alert('🎭 Mode démo')}
          style={{
            padding: '14px',
            backgroundColor: 'transparent',
            color: 'var(--danger)',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
