'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const LEAVE_LABELS: Record<string, string> = {
  CP: 'Congés payés', RTT: 'RTT', maladie: 'Arrêt maladie', sans_solde: 'Sans solde', autre: 'Autre',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function countDays(start: string, end: string) {
  return Math.round((new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) / 86400000) + 1
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

type LeaveStatus = 'pending' | 'approved' | 'rejected'

type LeaveRequest = {
  id: string
  employeeName: string
  position: string
  startDate: string
  endDate: string
  type: string
  comment?: string
  managerComment?: string
  status: LeaveStatus
}

const INITIAL_REQUESTS: LeaveRequest[] = [
  { id: '1', employeeName: 'Sophie Martin', position: 'Boulangère', startDate: '2026-07-02', endDate: '2026-07-09', type: 'CP', comment: 'Vacances été, merci !', status: 'pending' },
  { id: '2', employeeName: 'Lucas Dubois', position: 'Vendeur', startDate: '2026-06-16', endDate: '2026-06-16', type: 'RTT', comment: 'Rendez-vous personnel.', status: 'pending' },
  { id: '3', employeeName: 'Emma Laurent', position: 'Pâtissière', startDate: '2026-06-17', endDate: '2026-06-18', type: 'maladie', status: 'pending' },
  { id: '4', employeeName: 'Marc Petit', position: 'Boulanger', startDate: '2026-05-26', endDate: '2026-06-06', type: 'CP', managerComment: 'Bonne vacances !', status: 'approved' },
  { id: '5', employeeName: 'Camille Bernard', position: 'Vendeuse', startDate: '2026-06-08', endDate: '2026-06-08', type: 'RTT', managerComment: 'Accordé.', status: 'approved' },
  { id: '6', employeeName: 'Théo Renard', position: 'Vendeur', startDate: '2026-06-12', endDate: '2026-06-14', type: 'sans_solde', comment: 'Voyage personnel.', managerComment: 'Quota dépassé pour cette période.', status: 'rejected' },
]

type FilterKey = 'pending' | 'approved' | 'rejected'

const FILTERS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: 'pending',  label: 'En attente', icon: Clock },
  { key: 'approved', label: 'Validés',    icon: CheckCircle },
  { key: 'rejected', label: 'Refusés',    icon: XCircle },
]

export default function ManagerCongesPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS)
  const [filter, setFilter] = useState<FilterKey>('pending')
  const [actionId, setActionId] = useState<string | null>(null)
  const [managerComment, setManagerComment] = useState('')

  const filtered = requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  function handleAction(id: string, status: 'approved' | 'rejected') {
    if (status === 'approved') {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', managerComment: managerComment || undefined } : r))
      setActionId(null)
      setManagerComment('')
    } else {
      alert('🎭 Mode démo')
    }
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">

      <div className="mb-6">
        <h1 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          Demandes de congés
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Validez ou refusez les demandes de votre équipe
        </p>
      </div>

      <div className="flex overflow-hidden w-full md:w-fit mb-6" style={{ border: '0.5px solid var(--border)', borderRadius: '8px' }}>
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex flex-1 md:flex-none items-center justify-center gap-1.5 px-3 md:px-4 py-1.5 text-[13px] transition-colors duration-150"
              style={{
                backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                color: active ? 'var(--bg-card)' : 'var(--text-tertiary)',
                borderLeft: key !== 'pending' ? '0.5px solid var(--border)' : undefined,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {key === 'pending' && pendingCount > 0 && (
                <span
                  className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full"
                  style={{ backgroundColor: 'var(--warning)', color: '#fff', minWidth: '18px' }}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ border: '0.5px dashed var(--border)' }}>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Aucune demande {filter === 'pending' ? 'en attente' : filter === 'approved' ? 'validée' : 'refusée'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => {
            const isOpen = actionId === req.id
            return (
              <div key={req.id} className="overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px' }}>
                <div className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                        style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        {getInitials(req.employeeName)}
                      </div>
                      <span className="font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>
                        {req.employeeName}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{req.position}</span>
                    </div>

                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(req.startDate)}
                      {req.startDate !== req.endDate && <> → {formatDate(req.endDate)}</>}
                      <span className="ml-2 font-normal text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        ({countDays(req.startDate, req.endDate)} j)
                      </span>
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {LEAVE_LABELS[req.type] ?? req.type}
                    </p>
                    {req.comment && (
                      <p className="text-[12px] mt-1 italic" style={{ color: 'var(--text-tertiary)' }}>
                        &quot;{req.comment}&quot;
                      </p>
                    )}
                    {req.managerComment && filter !== 'pending' && (
                      <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Réponse : &quot;{req.managerComment}&quot;
                      </p>
                    )}
                  </div>

                  {filter === 'pending' && !isOpen && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="flex flex-1 md:flex-none items-center justify-center gap-1.5 text-[13px] transition-colors duration-150 py-2.5 px-4 md:py-1.5 md:px-3"
                        style={{ border: '0.5px solid var(--success)', color: 'var(--success)', borderRadius: '8px', backgroundColor: 'transparent' }}
                        onClick={() => { setActionId(req.id); setManagerComment('') }}
                      >
                        <CheckCircle className="h-4 w-4 md:h-3.5 md:w-3.5" /> Valider
                      </button>
                      <button
                        className="flex flex-1 md:flex-none items-center justify-center gap-1.5 text-[13px] transition-colors duration-150 py-2.5 px-4 md:py-1.5 md:px-3"
                        style={{ border: '0.5px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', backgroundColor: 'transparent' }}
                        onClick={() => handleAction(req.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 md:h-3.5 md:w-3.5" /> Refuser
                      </button>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="p-4 space-y-3" style={{ borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                    <textarea
                      value={managerComment}
                      onChange={e => setManagerComment(e.target.value)}
                      placeholder="Message pour l'employé (optionnel)"
                      rows={2}
                      className="w-full rounded-lg px-3 py-2 text-[13px] resize-none focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-1.5 text-[13px] text-white transition-colors duration-150"
                        style={{ backgroundColor: 'var(--success)', borderRadius: '8px', padding: '7px 14px' }}
                        onClick={() => handleAction(req.id, 'approved')}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Confirmer la validation
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setActionId(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
