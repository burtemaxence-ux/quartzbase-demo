# Quartzbase — Démo interactive

Site vitrine **statique** de [Quartzbase](https://quartzbase.fr), la solution de
planification intelligente pour boulangeries, pâtisseries et restaurants.

Aucune connexion à Supabase, aucune donnée réelle : toutes les données sont
fictives (`/data/*.json`) et les actions restent locales au navigateur. Le but
est de faire vivre le produit en conditions réelles depuis une simple page web.

## Ce que montre la démo

**Espace manager** (`/manager`)
- **Dashboard** — KPIs animés, planning du jour, actions rapides.
- **Planning** — génération de planning en un clic : sélecteur *algorithme
  déterministe* / *IA*, remplissage animé de la grille, contrôle de conformité.
- **Remplacements** — marketplace de créneaux à couvrir (candidatures à
  attribuer) et validation des échanges entre salariés.
- **Conformité** — score et alertes pilotés par la **convention collective**
  (Boulangerie-Pâtisserie, HCR, Commerce de détail).
- **Assistant** — chatbot flottant qui propose des remplaçants / créneaux et
  permet de *valider tous les créneaux proposés* d'un coup.

**Espace salarié** (`/employee`)
- **Badgeuse** — pointage temps réel (service / pause / départ).
- **Planning** — semaine personnelle.
- **Échanges** — prendre un créneau libre ou suivre ses échanges.
- **Congés** — demandes et statuts.

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3000  (redirige vers /manager)
```

## Stack

Next.js (App Router) · React 19 · TypeScript · Tailwind v4 · lucide-react.
Design system par tokens CSS (voir `app/globals.css`). Déployé sur Vercel.
