# BadgeGen — Générateur de Badges Événementiels

Application SaaS de création et génération de badges professionnels pour événements.

## Fonctionnalités

- **Authentification** — Login/signup avec Supabase Auth
- **Dashboard** — Vue d'ensemble avec stats réelles
- **Événements** — CRUD complet avec dimensions badges
- **Templates** — Éditeur visuel drag & drop (textes, photos, logos, QR codes)
- **Participants** — Import CSV/Excel avec mapping automatique
- **Photos** — Import massif avec matching par nom de fichier
- **Badges** — Génération PDF en grille (A4) prête à imprimer

## Stack Technique

- **Frontend** : Next.js 16, React 19, Tailwind CSS v4
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **UI** : Radix UI, Framer Motion, Lucide Icons
- **Validation** : Zod
- **PDF** : @react-pdf/renderer

## Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USER/badge-generated.git
cd badge-generated

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-cle
```

## Déploiement Vercel

1. Pusher le code sur GitHub
2. Importer le repo sur Vercel
3. Ajouter les variables d'environnement
4. Déployer

## Structure du projet

```
app/
├── (auth)/              # Server Actions auth
├── (dashboard)/         # Dashboard protégé
├── (public)/            # Collecte publique
├── api/                 # API Routes
├── page.tsx             # Landing page
components/
├── landing/             # Composants landing
├── layout/              # Sidebar, breadcrumb
├── participants/        # Table, import, photos
├── templates/           # Éditeur de templates
├── ui/                  # Composants réutilisables
lib/
├── services/            # Logique métier
├── supabase/            # Clients Supabase
├── templates/           # Moteur de rendu badges
├── types/               # Types TypeScript
├── validators/          # Schémas Zod
```

## Licence

Privé — Tous droits réservés
