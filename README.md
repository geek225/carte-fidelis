# Fidelis CMS

Site one-page `Next.js` avec dashboard admin pour gerer:

- le menu
- les textes
- les images par chemin ou URL
- les couleurs globales
- les animations
- les reseaux sociaux
- les blocs de contenu

## Lancer le projet

```bash
npm install
npm run dev
```

Site public: `http://localhost:3000`

Dashboard admin: `http://localhost:3000/admin`

## Sauvegarde du contenu

Deux modes sont prevus:

1. Sans Supabase: le dashboard sauvegarde dans `src/data/site-content.json`
2. Avec Supabase: le dashboard sauvegarde dans une table `site_content`

## Variables d'environnement

Copie `.env.example` vers `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SITE_CONTENT_TABLE=site_content
SUPABASE_SITE_CONTENT_ROW_ID=main
SUPABASE_UPLOAD_BUCKET=site-assets
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASSWORD=password123
```

## Protection de l'admin

- Les routes `/admin`, `PUT /api/site-content` et `POST /api/upload` sont protegees par Basic Auth.
- Identifiants par defaut: `admin` / `password123`.
- Tu peux surcharger avec `ADMIN_BASIC_AUTH_USER` et `ADMIN_BASIC_AUTH_PASSWORD` en local et dans Vercel.

## Validation API CMS

- `PUT /api/site-content` valide strictement le payload JSON (schema runtime).
- `400`: JSON invalide.
- `422`: payload valide JSON mais structure/champs invalides.
- `500`: erreur interne (message detaille en dev, message generic en production).

## Upload images (Supabase Storage)

- L'upload CMS utilise Supabase Storage (bucket public recommande: `site-assets`).
- Variable requise: `SUPABASE_UPLOAD_BUCKET`.
- En production, si Supabase est absent, l'upload est bloque (pas de fallback disque local).

Exemple SQL (bucket public):

```sql
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;
```

## Table Supabase recommandee

```sql
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz default now()
);
```

Puis insere une ligne initiale:

```sql
insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
```

## Deploiement

### GitHub

- cree un repository
- pousse le dossier `fidelis-cms`

### Vercel

- importe le repo GitHub dans Vercel
- configure les variables d'environnement
- deploie

### Supabase

- cree le projet
- cree la table `site_content`
- cree le bucket `site-assets` (ou adapte `SUPABASE_UPLOAD_BUCKET`)
- renseigne `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et `SUPABASE_UPLOAD_BUCKET`

## Structure utile

- `src/app/page.tsx`: site public
- `src/app/admin/page.tsx`: dashboard CMS
- `src/app/api/site-content/route.ts`: lecture et sauvegarde globale
- `src/data/site-content.json`: contenu local
- `src/lib/site-content-store.ts`: bascule local ou Supabase
