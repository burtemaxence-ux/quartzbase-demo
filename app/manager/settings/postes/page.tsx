'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Euro, Clock, Layers, ShieldCheck, UserPlus, ChevronDown, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Poste = { id: string; name: string; color: string; break_minutes: number; hourly_cost: number; max_hours_per_day: number; max_hours_per_week: number }

// ─── Demo data ────────────────────────────────────────────────────────────────
const INITIAL_POSTES: Poste[] = [
  { id: 'p1', name: 'Boulanger',   color: '#6C63FF', break_minutes: 30, hourly_cost: 12.5, max_hours_per_day: 10, max_hours_per_week: 48 },
  { id: 'p2', name: 'Vendeur',     color: '#00D4AA', break_minutes: 20, hourly_cost: 11.5, max_hours_per_day: 8,  max_hours_per_week: 35 },
  { id: 'p3', name: 'Pâtissier',   color: '#FFB347', break_minutes: 30, hourly_cost: 13.0, max_hours_per_day: 10, max_hours_per_week: 39 },
  { id: 'p4', name: 'Responsable', color: '#FF6B6B', break_minutes: 45, hourly_cost: 16.0, max_hours_per_day: 10, max_hours_per_week: 48 },
]

// ─── Permissions ──────────────────────────────────────────────────────────────
const PERMISSION_CATEGORIES = [
  { id: 'planning', label: 'Planning', permissions: [
    { key: 'planning.view',       label: "Voir le planning de l'équipe" },
    { key: 'planning.create',     label: 'Créer un créneau' },
    { key: 'planning.edit',       label: 'Modifier un créneau' },
    { key: 'planning.delete',     label: 'Supprimer un créneau' },
    { key: 'planning.publish',    label: 'Publier le planning' },
    { key: 'planning.lock',       label: 'Verrouiller le planning' },
  ]},
  { id: 'employees', label: 'Employés', permissions: [
    { key: 'employees.view',   label: 'Voir la liste des employés' },
    { key: 'employees.invite', label: 'Inviter un employé' },
    { key: 'employees.edit',   label: "Modifier le profil d'un employé" },
  ]},
  { id: 'leave', label: 'Congés & absences', permissions: [
    { key: 'leave.request',   label: 'Faire une demande de congé' },
    { key: 'leave.view_team', label: "Voir les demandes de l'équipe" },
    { key: 'leave.validate',  label: 'Valider une demande' },
    { key: 'leave.refuse',    label: 'Refuser une demande' },
  ]},
  { id: 'reports', label: 'Rapports', permissions: [
    { key: 'reports.view',   label: 'Voir les rapports' },
    { key: 'reports.export', label: 'Exporter les rapports' },
  ]},
  { id: 'settings', label: 'Paramètres', permissions: [
    { key: 'settings.access', label: 'Accéder aux paramètres' },
    { key: 'settings.edit',   label: 'Modifier les paramètres' },
  ]},
] as const

type PermKey = string

function allTrue(): Record<PermKey, boolean> {
  const out: Record<PermKey, boolean> = {}
  PERMISSION_CATEGORIES.forEach(c => c.permissions.forEach(p => { out[p.key] = true }))
  return out
}

function superviseurDefaults(): Record<PermKey, boolean> {
  const on = new Set(['planning.view', 'planning.create', 'planning.edit', 'employees.view', 'leave.view_team', 'leave.validate', 'leave.refuse', 'reports.view'])
  const out: Record<PermKey, boolean> = {}
  PERMISSION_CATEGORIES.forEach(c => c.permissions.forEach(p => { out[p.key] = on.has(p.key) }))
  return out
}

function employeDefaults(): Record<PermKey, boolean> {
  const on = new Set(['planning.view', 'leave.request'])
  const out: Record<PermKey, boolean> = {}
  PERMISSION_CATEGORIES.forEach(c => c.permissions.forEach(p => { out[p.key] = on.has(p.key) }))
  return out
}

function emptyPerms(): Record<PermKey, boolean> {
  const out: Record<PermKey, boolean> = {}
  PERMISSION_CATEGORIES.forEach(c => c.permissions.forEach(p => { out[p.key] = false }))
  return out
}

const BUILTIN_ROLES = ['manager', 'superviseur', 'employe'] as const
const ROLE_LABELS: Record<string, string> = { manager: 'Manager', superviseur: 'Superviseur', employe: 'Employé' }

const DEFAULT_MATRIX: Record<string, Record<PermKey, boolean>> = {
  manager: allTrue(),
  superviseur: superviseurDefaults(),
  employe: employeDefaults(),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function breakLabel(m: number) { return m === 0 ? '—' : m === 60 ? '1h' : `${m} min` }
function numLabel(v: number, u: string) { return !v ? '—' : `${v} ${u}` }

// ─── Components ───────────────────────────────────────────────────────────────
function PermToggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
        <Check className="h-3 w-3" />
      </span>
    )
  }
  return (
    <button
      onClick={onChange}
      className="inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-150"
      style={{
        backgroundColor: checked ? 'var(--accent-light)' : 'var(--bg-page)',
        color: checked ? 'var(--accent)' : 'var(--text-tertiary)',
        border: checked ? 'none' : '0.5px solid var(--border)',
      }}
    >
      {checked ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostesPage() {
  const [postes, setPostes] = useState<Poste[]>(INITIAL_POSTES)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addColor, setAddColor] = useState('#6C63FF')
  const [addBreak, setAddBreak] = useState(30)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6C63FF')
  const [editBreak, setEditBreak] = useState(30)
  const [permMatrix, setPermMatrix] = useState<Record<string, Record<PermKey, boolean>>>(DEFAULT_MATRIX)
  const [customRoles, setCustomRoles] = useState<string[]>([])
  const [showAddRole, setShowAddRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())
  const [permsSaved, setPermsSaved] = useState(false)

  const allRoles = [...BUILTIN_ROLES, ...customRoles]

  function handleAdd() {
    if (!addName.trim()) return
    const newPoste: Poste = { id: `p${Date.now()}`, name: addName.trim(), color: addColor, break_minutes: addBreak, hourly_cost: 0, max_hours_per_day: 0, max_hours_per_week: 0 }
    setPostes(prev => [...prev, newPoste])
    setShowAddForm(false); setAddName(''); setAddColor('#6C63FF'); setAddBreak(30)
  }

  function startEdit(p: Poste) { setEditingId(p.id); setEditName(p.name); setEditColor(p.color); setEditBreak(p.break_minutes) }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    setPostes(prev => prev.map(p => p.id === id ? { ...p, name: editName.trim(), color: editColor, break_minutes: editBreak } : p))
    setEditingId(null)
  }

  function handleDelete(id: string) { setPostes(prev => prev.filter(p => p.id !== id)) }

  function togglePerm(role: string, permKey: string) {
    setPermMatrix(prev => ({ ...prev, [role]: { ...prev[role], [permKey]: !prev[role]?.[permKey] } }))
  }

  function addCustomRole() {
    const slug = newRoleName.trim().toLowerCase().replace(/\s+/g, '_')
    if (!slug || customRoles.includes(slug)) return
    setCustomRoles(prev => [...prev, slug])
    setPermMatrix(prev => ({ ...prev, [slug]: emptyPerms() }))
    setNewRoleName(''); setShowAddRole(false)
  }

  function savePerms() {
    alert('🎭 Mode démo')
    setPermsSaved(true)
    setTimeout(() => setPermsSaved(false), 2000)
  }

  const sl = (text: string) => (
    <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{text}</span>
  )

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>Postes & rôles</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Postes de travail et permissions par rôle</p>
        </div>
        <button onClick={() => setShowAddForm(true)} disabled={showAddForm} className="btn-primary flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Ajouter un poste
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--accent-light)', border: '0.5px solid var(--accent)' }}>
          <p className="text-[13px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Nouveau poste</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              {sl('Nom du poste')}
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex : Serveur" className="dp-input w-full h-8 px-3 text-[13px]" />
            </div>
            <div>
              {sl('Couleur planning')}
              <div className="flex items-center gap-2">
                <input type="color" value={addColor} onChange={e => setAddColor(e.target.value)} className="h-8 w-12 rounded-lg cursor-pointer p-0.5" style={{ border: '0.5px solid var(--border)' }} />
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{addColor}</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            {sl('Pause auto (minutes)')}
            <select value={addBreak} onChange={e => setAddBreak(parseInt(e.target.value))} className="dp-input h-8 px-3 text-[13px]">
              <option value={0}>Aucune</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-[12px] py-1.5 px-3">Enregistrer</button>
            <button onClick={() => { setShowAddForm(false); setAddName('') }} className="btn-secondary text-[12px] py-1.5 px-3">Annuler</button>
          </div>
        </div>
      )}

      {/* Postes table */}
      <div className="overflow-hidden mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px' }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-light)' }}>
            <Layers className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Postes de travail</p>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
              {['Poste', 'Pause', 'Coût/h', 'Max/j', 'Max/sem', ''].map(h => (
                <th key={h} className={`px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] ${h === '' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-tertiary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {postes.map(poste => (
              editingId === poste.id ? (
                <tr key={poste.id} style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--accent-light)' }}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        {sl('Nom')}
                        <input value={editName} onChange={e => setEditName(e.target.value)} className="dp-input w-full h-8 px-3 text-[13px]" />
                      </div>
                      <div>
                        {sl('Couleur')}
                        <div className="flex items-center gap-2">
                          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="h-8 w-12 rounded-lg cursor-pointer p-0.5" style={{ border: '0.5px solid var(--border)' }} />
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{editColor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      {sl('Pause auto')}
                      <select value={editBreak} onChange={e => setEditBreak(parseInt(e.target.value))} className="dp-input h-8 px-3 text-[13px]">
                        <option value={0}>Aucune</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>1h</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary flex items-center gap-1.5 text-[12px] py-1.5 px-3" onClick={() => handleSaveEdit(poste.id)}>
                        <Check className="h-3.5 w-3.5" /> Enregistrer
                      </button>
                      <button className="btn-secondary flex items-center gap-1.5 text-[12px] py-1.5 px-3" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" /> Annuler
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={poste.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: poste.color }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{poste.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {poste.break_minutes > 0 && <Clock className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)' }} />}
                      <span>{breakLabel(poste.break_minutes)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      {poste.hourly_cost > 0 && <Euro className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)' }} />}
                      <span>{numLabel(poste.hourly_cost, '€')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{numLabel(poste.max_hours_per_day, 'h')}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{numLabel(poste.max_hours_per_week, 'h')}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }} onClick={() => startEdit(poste)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(poste.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions matrix */}
      <div className="overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-light)' }}>
              <ShieldCheck className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Permissions par rôle</p>
              <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Définissez les accès de chaque rôle dans l&apos;application</p>
            </div>
          </div>
          <button className="btn-secondary flex items-center gap-1.5 text-[12px]" onClick={() => { setShowAddRole(true); setNewRoleName('') }} disabled={showAddRole}>
            <UserPlus className="h-3.5 w-3.5" /> Nouveau rôle
          </button>
        </div>

        {showAddRole && (
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
            <input
              autoFocus
              placeholder="Nom du rôle (ex: Chef de rang)"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomRole(); if (e.key === 'Escape') setShowAddRole(false) }}
              className="dp-input h-7 px-2 text-[13px] max-w-xs"
            />
            <button className="btn-primary text-[12px] py-1 px-3" onClick={addCustomRole} disabled={!newRoleName.trim()}>Créer</button>
            <button className="btn-secondary text-[12px] py-1 px-3" onClick={() => setShowAddRole(false)}>Annuler</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                <th className="text-left px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] min-w-[220px]" style={{ color: 'var(--text-tertiary)' }}>Permission</th>
                {allRoles.map(role => (
                  <th key={role} className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-[0.06em] min-w-[100px]" style={{ color: 'var(--text-tertiary)' }}>
                    <div className="flex flex-col items-center gap-1">
                      <span style={{ color: role === 'manager' ? 'var(--success)' : 'var(--accent)' }}>{ROLE_LABELS[role] ?? role}</span>
                      {customRoles.includes(role) && (
                        <button onClick={() => { setCustomRoles(p => p.filter(r => r !== role)); setPermMatrix(p => { const n = {...p}; delete n[role]; return n }) }} style={{ color: 'var(--text-tertiary)' }}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      {role === 'manager' && <span className="text-[9px] font-normal normal-case" style={{ color: 'var(--success)' }}>Accès total</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_CATEGORIES.map(category => {
                const isCollapsed = collapsedCats.has(category.id)
                return [
                  <tr
                    key={`cat-${category.id}`}
                    className="cursor-pointer"
                    style={{ borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
                    onClick={() => setCollapsedCats(prev => { const n = new Set(prev); n.has(category.id) ? n.delete(category.id) : n.add(category.id); return n })}
                  >
                    <td colSpan={allRoles.length + 1} className="px-5 py-2">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)' }} />}
                        <span className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ color: 'var(--text-secondary)' }}>{category.label}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{category.permissions.length} permission{category.permissions.length > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                  </tr>,
                  ...(!isCollapsed ? category.permissions.map(perm => (
                    <tr key={perm.key} style={{ borderTop: '0.5px solid var(--border)' }}>
                      <td className="px-5 py-2.5 pl-10"><span style={{ color: 'var(--text-secondary)' }}>{perm.label}</span></td>
                      {allRoles.map(role => (
                        <td key={role} className="px-4 py-2.5 text-center">
                          <PermToggle
                            checked={permMatrix[role]?.[perm.key] ?? false}
                            onChange={() => togglePerm(role, perm.key)}
                            disabled={role === 'manager'}
                          />
                        </td>
                      ))}
                    </tr>
                  )) : []),
                ]
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4" style={{ borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            <span style={{ color: 'var(--success)' }}>✓ Manager</span> — accès total non modifiable. Les rôles personnalisés s&apos;assignent depuis le profil employé.
          </p>
          <button onClick={savePerms} className="btn-primary flex items-center gap-1.5 shrink-0">
            {permsSaved ? <><Check className="h-3.5 w-3.5" />Enregistré</> : 'Enregistrer les permissions'}
          </button>
        </div>
      </div>
    </div>
  )
}
