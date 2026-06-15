'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Users, Clock, Zap, ArrowLeftRight, Scale, BarChart3, BookOpen,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle2, Webhook, Building2,
  AlertTriangle, ShieldCheck, Sparkles, FileText,
} from 'lucide-react'

interface HelpBlock { title: string; items: string[] }
interface HelpSection {
  id: string
  icon: React.ElementType
  color: string
  colorLight: string
  title: string
  description: string
  href?: string
  hrefLabel?: string
  blocks: HelpBlock[]
  tips?: string[]
}

const SECTIONS: HelpSection[] = [
  {
    id: 'planning', icon: Calendar, color: '#2563EB', colorLight: '#EFF6FF',
    title: 'Planning & Shifts',
    description: "Créez et gérez les shifts de votre équipe semaine par semaine.",
    href: '/manager/planning', hrefLabel: 'Ouvrir le planning',
    blocks: [
      { title: 'Créer un shift', items: ["Cliquez sur n'importe quelle cellule vide dans la vue semaine", "Renseignez l'employé, l'horaire de début/fin, le poste et la pause", 'Validez — le shift apparaît en mode brouillon (grisé)', 'Cliquez sur "Publier" pour notifier l\'équipe'] },
      { title: 'Modifier ou supprimer', items: ['Cliquez sur un shift existant pour l\'éditer', 'La corbeille supprime définitivement (soft delete côté base)', 'Les shifts supprimés n\'apparaissent plus dans les rapports'] },
      { title: 'Statuts des shifts', items: ['"Brouillon" → shift créé, non visible par l\'employé', '"Publié" → employé notifié, visible dans son planning', '"Terminé" → passé la date du shift'] },
    ],
    tips: ['Créez un shift type "template" le lundi et copiez-le sur la semaine', 'Le code couleur par poste vous donne une vue rapide de la couverture', "L'IA peut générer une première ébauche de planning en quelques secondes"],
  },
  {
    id: 'ai', icon: Sparkles, color: '#7C3AED', colorLight: '#EDE9FE',
    title: 'IA Auto-planning',
    description: "Générez un planning complet automatiquement grâce à l'intelligence artificielle.",
    href: '/manager/planning', hrefLabel: 'Ouvrir le planning',
    blocks: [
      { title: 'Lancer une génération', items: ['Depuis le planning, cliquez sur le bouton ✨ "IA" en haut à droite', "Sélectionnez la semaine cible et le nombre d'employés souhaité", "L'IA génère une proposition en 5 à 15 secondes", 'Prévisualisez les shifts proposés avant d\'appliquer'] },
      { title: 'Appliquer ou ajuster', items: ['Chaque shift proposé est affiché avec employé, horaire et poste', 'Vous pouvez modifier manuellement avant de confirmer', '"Appliquer" crée tous les shifts en base de données', 'Les shifts créés restent en mode brouillon — publiez ensuite'] },
      { title: 'Limites et bonnes pratiques', items: ['Maximum 10 générations par heure (rate limit)', "L'IA respecte les contrats (CDI 35h → ~5 shifts × 7h)", 'Les congés approuvés sont pris en compte automatiquement', 'Vérifiez la conformité légale après génération'] },
    ],
    tips: ['Décrivez votre contexte dans les préférences IA (ex: "restauration, service du soir")', 'Si le résultat ne convient pas, re-générez — chaque appel est différent', 'Combinez IA + ajustements manuels pour le résultat optimal'],
  },
  {
    id: 'employees', icon: Users, color: '#D97706', colorLight: '#FEF3C7',
    title: 'Employés & Congés',
    description: "Gérez vos employés et traitez les demandes d'absence.",
    href: '/manager/employees', hrefLabel: 'Voir les employés',
    blocks: [
      { title: 'Ajouter un employé', items: ['Menu Employés → "Nouvel employé"', 'Renseignez : prénom/nom, email, poste, type de contrat, heures hebdo', 'Le taux horaire sert au calcul de la masse salariale dans les analytiques', "L'employé reçoit un email d'invitation à créer son compte"] },
      { title: 'Gérer les congés', items: ['Le badge orange sur "Congés" indique les demandes en attente', 'Cliquez sur une demande pour approuver ou refuser avec un motif', "Un refus envoie une notification à l'employé avec votre motif", "Les congés approuvés bloquent automatiquement la planification ce jour-là"] },
      { title: 'Archiver un employé', items: ["Un employé archivé n'apparaît plus dans le planning ni les congés", 'Ses données historiques restent accessibles dans les rapports', 'Le turnover est calculé à partir des archivages (Analytiques)'] },
    ],
    tips: ['Complétez le taux horaire pour que les analytiques soient précis', 'Le solde de congés se met à jour automatiquement à chaque approbation'],
  },
  {
    id: 'presences', icon: Clock, color: '#059669', colorLight: '#D1FAE5',
    title: 'Présences & Badgeuse',
    description: 'Suivez les heures réelles pointées par votre équipe.',
    href: '/manager/presences', hrefLabel: 'Voir les présences',
    blocks: [
      { title: 'Comment fonctionne le pointage', items: ['L\'employé ouvre l\'app sur son téléphone → "Badgeuse"', 'Il clique "Pointer l\'arrivée" au début du shift', 'Il clique "Pointer le départ" à la fin', 'Les heures sont automatiquement comparées aux shifts planifiés'] },
      { title: 'Lecture du tableau de présences', items: ['Vert = présent et à l\'heure', 'Orange = retard enregistré (heure réelle > heure planifiée)', 'Rouge = absent (shift planifié sans pointage)', 'Le rapport détaille heures planifiées vs heures effectives'] },
      { title: 'Exporter les données', items: ['Menu Paramètres → Exports', 'Choisissez la période et le format (CSV ou PDF)', 'Le CSV est compatible Excel pour le traitement de paie'] },
    ],
    tips: ['Activez les notifications pour être alerté des absences non justifiées', 'Le rapport de paie est accessible depuis Rapport → onglet "Paie"'],
  },
  {
    id: 'exchanges', icon: ArrowLeftRight, color: '#0891B2', colorLight: '#E0F2FE',
    title: 'Échanges de shifts',
    description: "Permettez à vos employés d'échanger des shifts entre eux, avec votre validation.",
    href: '/manager/echanges', hrefLabel: 'Voir les échanges',
    blocks: [
      { title: "Flow complet d'un échange", items: ["① L'employé A propose son shift à l'employé B", '② B reçoit une notification et accepte ou refuse', '③ Si B accepte → vous êtes notifié pour validation finale', '④ Vous approuvez → le shift est transféré automatiquement'] },
      { title: 'Votre rôle de manager', items: ['Vous voyez tous les échanges en attente de validation dans "Échanges"', 'Vous pouvez refuser avec un motif visible des deux parties', 'Aucun transfert n\'a lieu sans votre accord explicite'] },
    ],
    tips: ["Les échanges n'affectent pas les heures globales de la semaine", "Un refus ne clôture pas la demande — l'employé peut proposer à quelqu'un d'autre"],
  },
  {
    id: 'marketplace', icon: Zap, color: '#DC2626', colorLight: '#FEF2F2',
    title: 'Marketplace remplaçants',
    description: 'Trouvez un remplaçant en quelques minutes pour un shift non couvert.',
    href: '/manager/marketplace', hrefLabel: 'Ouvrir la Marketplace',
    blocks: [
      { title: 'Publier un shift', items: ['Marketplace → "Publier un shift"', 'Sélectionnez le shift à pourvoir et la raison (maladie, renfort…)', "Choisissez l'expiry : 2h, 4h, 8h ou 24h", "Les employés disponibles ce jour-là reçoivent une push notification"] },
      { title: 'Gérer les candidatures', items: ['Chaque candidature apparaît dans la carte du slot', 'Cliquez "Confirmer" sur le candidat retenu', 'Le shift est réassigné instantanément', 'Les autres candidats reçoivent un message "Shift pourvu"'] },
      { title: 'Vérifications automatiques', items: ["L'app vérifie que l'employé n'a pas de conflit ce jour-là", 'Les congés approuvés bloquent la candidature automatiquement', 'Un slot expiré ne peut plus recevoir de candidatures'] },
    ],
    tips: ['Publiez dès que possible — plus tôt = plus de candidats', "L'expiry 24h est recommandé pour les shifts du lendemain ou après-demain"],
  },
  {
    id: 'compliance', icon: Scale, color: '#7C3AED', colorLight: '#EDE9FE',
    title: 'Conformité légale',
    description: 'Détectez automatiquement les infractions au Code du travail dans votre planning.',
    href: '/manager/compliance', hrefLabel: 'Vérifier la conformité',
    blocks: [
      { title: 'Règles vérifiées', items: ['Repos quotidien < 11h entre deux shifts (Art. L3131-1)', 'Durée quotidienne > 10h (Art. L3121-18)', 'Durée hebdomadaire > 48h (Art. L3121-20)', 'Pause insuffisante : < 20 min pour un shift > 6h (Art. L3121-16)', 'Plus de 6 jours consécutifs sans repos (Art. L3132-1)', 'Travail du dimanche sans dérogation (Art. L3132-3)', "Travail de nuit : plus d'1h entre 21h et 6h (Art. L3122-2)"] },
      { title: 'Lire le score de conformité', items: ['100 = aucune anomalie (vert)', '70–99 = points d\'attention (orange)', '< 70 = non conforme (rouge)', 'Chaque violation "critique" coûte −5 points, "avertissement" −2'] },
      { title: 'Agir sur les violations', items: ['Dépliez une violation pour voir la description exacte et la référence légale', 'Une "Correction suggérée" indique quoi modifier', 'Modifiez le shift dans le planning — rechargez pour voir le nouveau score'] },
    ],
    tips: ['Vérifiez la conformité après chaque génération IA ou semaine publiée', 'Filtrez par "Critique" pour traiter les infractions les plus graves en premier'],
  },
  {
    id: 'analytics', icon: BarChart3, color: '#2D3A8C', colorLight: '#EEF0FA',
    title: 'Analytiques RH',
    description: "Pilotez vos coûts salariaux, la présence et l'absentéisme sur la durée.",
    href: '/manager/analytics', hrefLabel: 'Voir les analytiques',
    blocks: [
      { title: 'Les 6 KPIs principaux', items: ['Masse salariale = heures × taux horaire sur la période', 'Heures réelles = heures effectivement pointées (vs planifiées)', 'Taux de présence = % de shifts avec un pointage', "Jours d'absence = total congés approuvés sur la période", 'Turnover = nombre de départs (archivages)', 'Employés à risque = détection automatique des patterns anormaux'] },
      { title: 'Absentéisme chronique', items: ['"Maladie fréq." = ≥ 3 arrêts maladie sur la période', '"Retards chron." = ≥ 5 retards non justifiés', '"Abs. élevée" = taux d\'absence ≥ 20%', 'Ces employés sont remontés en tête du tableau et signalés par badges'] },
      { title: 'Objectif CA', items: ['Cliquez sur "Définir objectif CA" dans le graphique masse salariale', 'Une ligne de référence à 33% de votre CA apparaît', 'Le ratio masse salariale / CA s\'affiche sur la carte KPI', 'La valeur est sauvegardée localement dans votre navigateur'] },
    ],
    tips: ['Commencez par "12 mois" pour identifier les tendances long terme', 'La vue "4 semaines" est idéale pour le suivi opérationnel quotidien'],
  },
  {
    id: 'integrations', icon: Webhook, color: '#6B7280', colorLight: '#F3F4F6',
    title: 'Intégrations & API',
    description: "Connectez Quartzbase à vos outils externes via webhooks ou l'API REST.",
    href: '/manager/settings/integrations', hrefLabel: 'Gérer les intégrations',
    blocks: [
      { title: 'Webhooks sortants', items: ['Paramètres → Intégrations → Webhooks', "Renseignez l'URL de votre endpoint (Zapier, Make, votre serveur…)", '7 événements disponibles : shift créé/supprimé, échange approuvé, congé approuvé/refusé…', 'Chaque appel est signé avec un secret HMAC-SHA256'] },
      { title: 'API REST publique', items: ['Générez un token Bearer depuis Paramètres → Intégrations → API', '3 endpoints : GET /api/v1/shifts, /employees, /leaves', 'Toutes les données sont filtrées par établissement automatiquement', "Le token ne s'affiche qu'une fois à la création — conservez-le"] },
      { title: 'Logs de livraison', items: ['Chaque webhook est journalisé avec statut HTTP et durée', 'Les échecs sont visibles pour debug', 'Les logs sont conservés 30 jours'] },
    ],
    tips: ['Utilisez Make (ex-Integromat) ou Zapier pour connecter Quartzbase à votre SIRH', "L'API v1 est idéale pour alimenter un tableau de bord BI externe"],
  },
  {
    id: 'multi-site', icon: Building2, color: '#D97706', colorLight: '#FEF3C7',
    title: 'Multi-établissements',
    description: 'Gérez plusieurs sites depuis un seul compte manager.',
    href: '/manager/settings/organisation', hrefLabel: 'Gérer les établissements',
    blocks: [
      { title: 'Créer un établissement', items: ['Paramètres → Établissements → "Nouvel établissement"', 'Chaque site a ses propres employés, shifts et paramètres', 'Les données sont strictement isolées entre sites'] },
      { title: "Changer d'établissement actif", items: ["Cliquez sur le nom de l'établissement en haut à droite", 'Sélectionnez le site dans le menu déroulant', 'Toute la navigation (planning, congés, analytiques…) bascule sur ce site'] },
      { title: 'Inviter un manager ou superviseur', items: ['Paramètres → Établissements → ouvrez un site → "Inviter"', "Renseignez l'email et le rôle (Manager ou Superviseur)", 'Le superviseur voit tout mais ne peut pas modifier les paramètres'] },
    ],
    tips: ['Les analytiques sont par établissement — agrégez manuellement pour la vue groupe', 'Un même utilisateur peut être manager sur plusieurs établissements'],
  },
  {
    id: 'alertes', icon: AlertTriangle, color: '#EF4444', colorLight: '#FEF2F2',
    title: 'Alertes opérationnelles',
    description: 'Surveillez les violations légales et les anomalies RH en temps réel.',
    href: '/manager/alertes', hrefLabel: 'Voir les alertes',
    blocks: [
      { title: 'Alertes opérationnelles', items: ['Violations Code du travail (repos, durées)', 'Contrats CDD arrivant à expiration', 'Retards répétés ou absences injustifiées', "Seuils d'heures contractuelles dépassés"] },
      { title: 'Alertes de conformité', items: ['Score de conformité global par semaine', 'Risques légaux classés par criticité (CRITICAL, WARNING, INFO)', "Recommandations d'action pour chaque risque"] },
      { title: 'Gestion des alertes', items: ['Ignorez une alerte pour la masquer temporairement', "Les alertes ignorées restent consultables dans l'historique", "Une alerte non traitée réapparaît à la semaine suivante"] },
    ],
    tips: ['Traitez en priorité les alertes CRITICAL — risque de contentieux', 'Les violations Code du travail génèrent des pénalités en cas de contrôle'],
  },
]

const FAQ_ITEMS = [
  { q: 'Comment ajouter un employé ?', a: "Allez dans le menu Employés, cliquez \"Nouvel employé\", renseignez les informations (nom, email, poste, contrat, taux horaire) et validez. L'employé reçoit un email d'invitation automatiquement." },
  { q: 'Comment publier le planning ?', a: 'Après avoir créé vos shifts (en mode brouillon), cliquez sur le bouton "Publier la semaine" en haut du planning. Tous les shifts passent en statut Publié et vos employés sont notifiés.' },
  { q: 'Comment approuver une demande de congé ?', a: 'Les demandes en attente apparaissent avec un badge orange dans le menu "Congés". Cliquez sur une demande pour l\'ouvrir, puis "Approuver" ou "Refuser" avec un motif. L\'employé est notifié immédiatement.' },
  { q: 'Les heures supplémentaires sont-elles calculées automatiquement ?', a: "Oui. Dès que les heures planifiées dépassent le seuil de la convention collective (ex: 35h pour la restauration rapide), les heures sup. sont détectées et signalées dans les Alertes. Le rapport de paie les liste séparément." },
  { q: 'Puis-je utiliser Quartzbase sur mobile ?', a: "Oui, l'interface manager est entièrement responsive (mobile et tablette). L'app employé est disponible sur iOS et Android — les employés l'utilisent pour badger, voir leur planning et soumettre des demandes de congés." },
  { q: "Comment fonctionne l'auto-planning IA ?", a: 'Depuis le planning, cliquez sur le bouton ✨ "IA". L\'IA génère une proposition complète en 5 à 15 secondes, en respectant les contrats et les congés approuvés. Vous pouvez modifier les shifts avant de les appliquer.' },
]

function SectionCard({ section }: { section: HelpSection }) {
  const [open, setOpen] = useState(false)
  const Icon = section.icon

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-page)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: section.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Icon size={18} style={{ color: section.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{section.title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5, marginBottom: 0 }}>{section.description}</p>
        </div>
        <div style={{ flexShrink: 0, marginTop: 4 }}>
          {open ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {section.blocks.map((block, i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-page)', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px 0' }}>
                  {block.title}
                </p>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {block.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', backgroundColor: section.color, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                        {j + 1}
                      </span>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{item}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {section.tips && section.tips.length > 0 && (
            <div style={{ backgroundColor: section.colorLight, borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: section.color, margin: '0 0 10px 0' }}>
                💡 Conseils
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.tips.map((tip, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={13} style={{ color: section.color, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: section.color, opacity: 0.85, lineHeight: 1.4, margin: 0 }}>{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.href && (
            <div>
              <Link href={section.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'white', backgroundColor: section.color, textDecoration: 'none' }}>
                {section.hrefLabel} <ExternalLink size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{q}</span>
        {open ? <ChevronUp size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} /> : <ChevronDown size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingBottom: 14, margin: 0 }}>{a}</p>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? SECTIONS.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.blocks.some(b =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.items.some(i => i.toLowerCase().includes(search.toLowerCase()))
        )
      )
    : SECTIONS

  return (
    <div style={{ padding: 'clamp(12px, 4vw, 24px)', maxWidth: 896, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Centre d&apos;aide</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Guides et tutoriels pour maîtriser Quartzbase.</p>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans l'aide…"
          className="dp-input"
          style={{ marginTop: 16, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Quick links */}
      {!search && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Planning',    href: '/manager/planning',    color: '#2563EB', bg: '#EFF6FF', Icon: Calendar  },
            { label: 'Conformité',  href: '/manager/compliance',  color: '#7C3AED', bg: '#EDE9FE', Icon: Scale     },
            { label: 'Analytiques', href: '/manager/analytics',   color: '#2D3A8C', bg: '#EEF0FA', Icon: BarChart3 },
            { label: 'Marketplace', href: '/manager/marketplace', color: '#DC2626', bg: '#FEF2F2', Icon: Zap       },
          ].map(q => (
            <Link key={q.href} href={q.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <q.Icon size={14} style={{ color: q.color }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{q.label}</span>
              <ExternalLink size={12} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', opacity: 0.5 }} />
            </Link>
          ))}
        </div>
      )}

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
            Aucun résultat pour « {search} »
          </div>
        ) : (
          filtered.map(section => <SectionCard key={section.id} section={section} />)
        )}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '0 20px' }}>
          {FAQ_ITEMS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '16px 20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShieldCheck size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Besoin d&apos;aide supplémentaire ?</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Écrivez-nous à{' '}
            <a href="mailto:assistance.quartzbase@mail.fr" style={{ color: 'var(--accent)' }}>
              assistance.quartzbase@mail.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
