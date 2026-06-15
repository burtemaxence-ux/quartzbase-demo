'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, ExternalLink,
  Calendar, Users, Clock, Zap, ArrowLeftRight, Scale, BarChart3,
  Webhook, Building2, Sparkles, FileText, BookOpen, AlertTriangle,
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
    id: 'planning',
    icon: Calendar, color: '#2563EB', colorLight: '#EFF6FF',
    title: 'Planning & Shifts',
    description: "Créez et gérez les shifts de votre équipe semaine par semaine.",
    href: '/manager/planning', hrefLabel: 'Ouvrir le planning',
    blocks: [
      { title: 'Créer un shift', items: ["Cliquez sur n'importe quelle cellule vide dans la vue semaine", "Renseignez l'employé, l'horaire de début/fin, le poste et la pause", 'Validez — le shift apparaît en mode brouillon (grisé)', 'Cliquez sur "Publier" pour notifier l\'équipe'] },
      { title: 'Modifier ou supprimer', items: ['Cliquez sur un shift existant pour l\'éditer', 'La corbeille supprime définitivement', 'Les shifts supprimés n\'apparaissent plus dans les rapports'] },
      { title: 'Statuts des shifts', items: ['"Brouillon" → shift créé, non visible par l\'employé', '"Publié" → employé notifié, visible dans son planning', '"Terminé" → passé la date du shift'] },
    ],
    tips: ['Créez un shift type "template" le lundi et copiez-le sur la semaine', 'Le code couleur par poste vous donne une vue rapide de la couverture', "L'IA peut générer une première ébauche de planning en quelques secondes"],
  },
  {
    id: 'ai',
    icon: Sparkles, color: '#7C3AED', colorLight: '#EDE9FE',
    title: 'IA Auto-planning',
    description: "Générez un planning complet automatiquement grâce à l'intelligence artificielle.",
    href: '/manager/planning', hrefLabel: 'Ouvrir le planning',
    blocks: [
      { title: 'Lancer une génération', items: ['Depuis le planning, cliquez sur le bouton ✨ "IA" en haut à droite', "Sélectionnez la semaine cible et le nombre d'employés souhaité", "L'IA génère une proposition en 5 à 15 secondes", 'Prévisualisez les shifts proposés avant d\'appliquer'] },
      { title: 'Appliquer ou ajuster', items: ['Chaque shift proposé est affiché avec employé, horaire et poste', 'Vous pouvez modifier manuellement avant de confirmer', '"Appliquer" crée tous les shifts en base de données', 'Les shifts créés restent en mode brouillon — publiez ensuite'] },
      { title: 'Bonnes pratiques', items: ['Maximum 10 générations par heure (rate limit)', "L'IA respecte les contrats (CDI 35h → ~5 shifts × 7h)", 'Les congés approuvés sont pris en compte automatiquement', 'Vérifiez la conformité légale après génération'] },
    ],
    tips: ['Décrivez votre contexte dans les préférences IA (ex: "restauration, service du soir")', 'Si le résultat ne convient pas, re-générez — chaque appel est différent', 'Combinez IA + ajustements manuels pour le résultat optimal'],
  },
  {
    id: 'employees',
    icon: Users, color: '#D97706', colorLight: '#FEF3C7',
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
    id: 'presences',
    icon: Clock, color: '#059669', colorLight: '#D1FAE5',
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
    id: 'exchanges',
    icon: ArrowLeftRight, color: '#0891B2', colorLight: '#E0F2FE',
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
    id: 'marketplace',
    icon: Zap, color: '#DC2626', colorLight: '#FEF2F2',
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
    id: 'compliance',
    icon: Scale, color: '#7C3AED', colorLight: '#EDE9FE',
    title: 'Conformité légale',
    description: 'Détectez automatiquement les infractions au Code du travail dans votre planning.',
    href: '/manager/compliance', hrefLabel: 'Vérifier la conformité',
    blocks: [
      { title: 'Règles vérifiées', items: ['Repos quotidien < 11h entre deux shifts (Art. L3131-1)', 'Durée quotidienne > 10h (Art. L3121-18)', 'Durée hebdomadaire > 48h (Art. L3121-20)', 'Pause insuffisante : < 20 min pour un shift > 6h (Art. L3121-16)', 'Plus de 6 jours consécutifs sans repos (Art. L3132-1)'] },
      { title: 'Lire le score de conformité', items: ['100 = aucune anomalie (vert)', '70–99 = points d\'attention (orange)', '< 70 = non conforme (rouge)', 'Chaque violation "critique" coûte −5 points, "avertissement" −2'] },
      { title: 'Agir sur les violations', items: ['Dépliez une violation pour voir la description exacte et la référence légale', 'Une "Correction suggérée" indique quoi modifier', 'Modifiez le shift dans le planning — rechargez pour voir le nouveau score'] },
    ],
    tips: ['Vérifiez la conformité après chaque génération IA ou semaine publiée', 'Filtrez par "Critique" pour traiter les infractions les plus graves en premier'],
  },
  {
    id: 'analytics',
    icon: BarChart3, color: '#2D3A8C', colorLight: '#EEF0FA',
    title: 'Analytiques RH',
    description: "Pilotez vos coûts salariaux, la présence et l'absentéisme sur la durée.",
    href: '/manager/analytics', hrefLabel: 'Voir les analytiques',
    blocks: [
      { title: 'Les 6 KPIs principaux', items: ['Masse salariale = heures × taux horaire sur la période', 'Heures réelles = heures effectivement pointées (vs planifiées)', 'Taux de présence = % de shifts avec un pointage', "Jours d'absence = total congés approuvés sur la période", 'Turnover = nombre de départs (archivages)'] },
      { title: 'Absentéisme chronique', items: ['"Maladie fréq." = ≥ 3 arrêts maladie sur la période', '"Retards chron." = ≥ 5 retards non justifiés', '"Abs. élevée" = taux d\'absence ≥ 20%'] },
      { title: 'Objectif CA', items: ['Cliquez sur "Définir objectif CA" dans le graphique masse salariale', 'Une ligne de référence à 33% de votre CA apparaît', 'Le ratio masse salariale / CA s\'affiche sur la carte KPI'] },
    ],
    tips: ['Commencez par "12 mois" pour identifier les tendances long terme', 'La vue "4 semaines" est idéale pour le suivi opérationnel quotidien'],
  },
  {
    id: 'conges',
    icon: BookOpen, color: '#059669', colorLight: '#D1FAE5',
    title: 'Congés & Absences',
    description: 'Traitez les demandes de congés et suivez les soldes de votre équipe.',
    href: '/manager/conges', hrefLabel: 'Voir les congés',
    blocks: [
      { title: 'Traiter une demande', items: ['Les demandes en attente apparaissent dans l\'onglet "En attente"', 'Cliquez "Approuver" ou "Refuser" (avec motif)', "Un refus notifie l'employé avec votre motif", 'Les congés approuvés bloquent le planning sur ces jours'] },
      { title: "Types d'absence", items: ['CP (Congés Payés) : décompte du solde légal', 'RTT : applicable selon la convention collective', 'Maladie : non décompté du solde CP', 'Sans solde : à valider cas par cas'] },
      { title: 'Soldes de congés', items: ['Le solde CP est affiché sur la fiche de chaque employé', 'Il se décrémente automatiquement à l\'approbation', 'La période de référence est le 1er juin au 31 mai'] },
    ],
    tips: ["Traitez les demandes rapidement pour que l'employé puisse planifier", "Les absences maladie ne décomptent pas le solde CP"],
  },
  {
    id: 'rapport',
    icon: FileText, color: '#6B7280', colorLight: '#F3F4F6',
    title: 'Rapport & Export',
    description: 'Consultez les synthèses hebdomadaires et exportez vos données RH.',
    href: '/manager/rapport', hrefLabel: 'Voir les rapports',
    blocks: [
      { title: 'Rapport hebdomadaire', items: ['Sélectionnez la semaine dans le sélecteur de date', 'Retrouvez : heures planifiées, pointées, masse salariale estimée', 'Les KPIs affichent les écarts vs semaine précédente'] },
      { title: 'Onglet Paie', items: ['Tableau par employé : heures régulières, heures sup., indemnités', 'Compatible avec les formats des principaux logiciels de paie', 'Export CSV ou PDF en un clic'] },
      { title: 'Onglet Heures', items: ['Détail jour par jour des pointages vs shifts', 'Signalement automatique des écarts > 15 min', 'Filtrer par employé ou par poste'] },
    ],
    tips: ['Générez le rapport chaque lundi matin pour la semaine écoulée', 'Le CSV de paie est directement importable dans Silae, Sage ou PayFit'],
  },
  {
    id: 'alertes',
    icon: AlertTriangle, color: '#EF4444', colorLight: '#FEF2F2',
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
  {
    id: 'settings',
    icon: Webhook, color: '#6B7280', colorLight: '#F3F4F6',
    title: 'Paramètres',
    description: 'Configurez votre établissement, les règles de planning et les intégrations.',
    href: '/manager/settings/organisation', hrefLabel: 'Accéder aux paramètres',
    blocks: [
      { title: 'Organisation', items: ['Nom, adresse, SIRET de votre établissement', 'Logo affiché sur les exports PDF', 'Fuseau horaire pour les alertes et le planning'] },
      { title: 'Planning & Règles', items: ['Convention collective applicable', 'Durée min/max des shifts', 'Jours de fermeture hebdomadaires', 'Couleurs de la grille de planning'] },
      { title: 'Contrats & RH', items: ['Types de contrats disponibles à la création', "Seuils d'alerte par type (heures complémentaires)", 'Max hebdomadaire par type de contrat'] },
    ],
    tips: ['Configurez la convention collective dès le début pour que la conformité soit précise', 'Les couleurs du planning sont personnalisables par type de shift'],
  },
]

export function TutorialPanel({ sectionId }: { sectionId: string }) {
  const [open, setOpen] = useState(false)
  const section = SECTIONS.find(s => s.id === sectionId)
  if (!section) return null
  const Icon = section.icon

  return (
    <div style={{ marginBottom: open ? 16 : 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
          border: '1px solid var(--border)',
          backgroundColor: open ? 'var(--accent-light)' : 'transparent',
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer', transition: 'all 150ms',
        }}
      >
        <HelpCircle size={13} />
        Guide d&apos;utilisation
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div style={{ marginTop: 12, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: section.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} style={{ color: section.color }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{section.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{section.description}</p>
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: section.tips?.length ? 12 : 0 }}>
              {section.blocks.map((block, i) => (
                <div key={i} style={{ backgroundColor: 'var(--bg-page)', borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, margin: '0 0 10px 0' }}>
                    {block.title}
                  </p>
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {block.items.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', backgroundColor: section.color, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
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
              <div style={{ borderRadius: 10, padding: 14, backgroundColor: section.colorLight, marginBottom: section.href ? 12 : 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: section.color, margin: '0 0 8px 0' }}>
                  💡 Conseils
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {section.tips.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle2 size={13} style={{ color: section.color, flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: section.color, opacity: 0.85, lineHeight: 1.4, margin: 0 }}>{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.href && (
              <Link
                href={section.href}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'white', backgroundColor: section.color, textDecoration: 'none' }}
              >
                {section.hrefLabel} <ExternalLink size={13} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
