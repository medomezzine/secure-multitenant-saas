# Verdanova — Plateforme de Digitalisation des Organisations Professionnelles

Projet de stage (2 mois) — MVP fonctionnel d'une plateforme SaaS permettant à une
organisation professionnelle (Ordre, Fédération, Syndicat) de digitaliser la gestion
de ses adhérents : inscriptions, cotisations, forum, calendrier, messagerie et
formations/certifications.

## Périmètre du MVP

Le sujet original demandait une stack Flutter + React + Node.js + IA (Python) +
MySQL/PostgreSQL avec une architecture multi-tenant complète. Pour un projet solo de
2 mois, ce périmètre a été volontairement réduit :

- **Une seule web app React responsive** au lieu de web + mobile Flutter séparés
  (reste installable comme PWA si besoin).
- **Multi-tenant simplifié** : une seule base de données partagée avec une colonne
  `organization_id` sur chaque table, plutôt qu'une base par organisation.
- **SQLite** au lieu de MySQL/PostgreSQL : zéro configuration, un seul fichier,
  fonctionne immédiatement sans serveur de base de données à installer. Le schéma
  (voir `backend/src/db/index.js`) reste écrit en SQL standard et se porterait
  facilement vers PostgreSQL si le projet évolue après le stage.
- **Pas de composant IA/Python** : hors périmètre pour un MVP de 2 mois.
- **Paiement simulé** : le flux "payer la cotisation" enregistre une référence de
  paiement factice plutôt que d'intégrer une vraie passerelle de paiement.

Ces choix sont documentés ici pour être repris tels quels dans le rapport de stage
(section "limites et perspectives").

## Stack technique

| Couche      | Techno                                          |
|-------------|--------------------------------------------------|
| Frontend    | React 18 + Vite + React Router                  |
| Backend     | Node.js + Express (API REST)                    |
| Base de données | SQLite (via `better-sqlite3`)               |
| Auth        | JWT (JSON Web Tokens) + bcrypt                  |

## Architecture

```
[React SPA] <--REST/JSON--> [Express API] <---> [SQLite]
                                  |
                          [Middleware JWT]
                          [Contrôle d'accès par rôle]
```

Trois rôles : `member` (adhérent), `org_admin` (administrateur d'une organisation),
`super_admin` (Verdanova, gère toutes les organisations).

## Points sécurité et ingénierie

Cette version met en évidence les compétences sécurité et full-stack du projet :

- **Authentification JWT** signée en HS256 avec expiration, issuer/audience vérifiés et secret obligatoire en production.
- **Mots de passe protégés par bcrypt** (coût 12), normalisation des emails et politique de longueur de 8 à 128 caractères.
- **RBAC côté API et côté React** : les routes et écrans sont verrouillés par rôle (`member`, `org_admin`, `super_admin`) ; le serveur reste l'autorité finale.
- **Isolation multi-tenant** : les requêtes métier filtrent par `organization_id`, les administrateurs d'organisation ne peuvent pas traverser les tenants, et les super-administrateurs doivent sélectionner explicitement un tenant.
- **Protection contre l'injection SQL** : toutes les valeurs utilisateur passent par les paramètres de `better-sqlite3` (`?`), sans concaténation de données dans les requêtes.
- **Workflows administratifs contrôlés** : création d'organisation transactionnelle, validation des statuts d'adhésion, approbation/refus et modération avec contrôle de propriété.
- **Durcissement HTTP** : taille maximale des payloads JSON, suppression de l'en-tête `X-Powered-By`, en-têtes défensifs et identifiant de requête pour le diagnostic.
- **Observabilité légère** : chaque réponse contient un `X-Request-Id`, renvoyé aussi dans les erreurs serveur pour faciliter l'investigation.

> Le fichier local `backend/.env` et la base SQLite de démonstration sont volontairement exclus du dépôt. Utilisez `backend/.env.example` pour configurer un environnement local.

## Structure du projet

```
secure-multitenant-saas/
├── backend/
│   ├── src/
│   │   ├── db/            # schéma SQLite + script de seed
│   │   ├── middleware/     # auth JWT + contrôle de rôle
│   │   ├── routes/         # une route file par ressource
│   │   └── server.js       # point d'entrée Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # client axios
│   │   ├── context/        # contexte d'authentification
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   └── pages/           # pages par rôle (member/, admin/, super/)
│   └── package.json
└── README.md
```

## Modèle de données

9 tables : `organizations`, `users`, `memberships`, `events`, `forum_posts`,
`messages`, `notifications`, `trainings`, `certifications`. Voir le détail des
colonnes dans `backend/src/db/index.js`.

## Fonctionnalités livrées

**Adhérent (member)**
- Inscription / connexion
- Demande d'adhésion + paiement (simulé)
- Consultation du calendrier d'événements
- Forum de discussion (publier, supprimer ses propres posts)
- Messagerie avec l'administration
- Gestion du profil + consultation de ses certifications

**Administrateur d'organisation (org_admin)**
- Tableau de bord (statistiques adhérents/événements)
- Gestion des adhérents (approuver / refuser une adhésion)
- Modération du forum (masquer/supprimer des publications)
- Gestion du calendrier (créer/supprimer des événements)
- Messagerie (répondre à un membre ou diffuser à tous)
- Création de formations + certification des membres
- Modification du profil de l'organisation

**Super administrateur (Verdanova)**
- Créer une nouvelle organisation + son compte administrateur
- Lister / supprimer des organisations

## Installation et lancement

### Prérequis
- Node.js 18+ et npm

### 1. Backend

```bash
cd backend
cp .env.example .env
# Set JWT_SECRET and all five unique SEED_*_PASSWORD values in .env before seeding.
npm install
npm run seed     # crée la base de données + jeu de données de démonstration
npm run dev       # démarre l'API sur http://localhost:4000
```

### 2. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev       # démarre l'app sur http://localhost:5173
```

Le frontend est configuré (voir `vite.config.js`) pour rediriger automatiquement
les appels `/api/*` vers `http://localhost:4000`, donc aucune variable
d'environnement supplémentaire n'est nécessaire en développement.

### Comptes de démonstration (créés par `npm run seed`)

Les comptes de démonstration sont créés avec les adresses `admin@verdanova.tn`,
`admin@oit.tn`, `sarra@example.com`, `karim@example.com` et `admin@fta.tn`.
Aucun mot de passe par défaut n'est inclus dans le code ou affiché dans l'interface.
Avant `npm run seed`, définissez les variables `SEED_SUPER_ADMIN_PASSWORD`,
`SEED_ORG1_ADMIN_PASSWORD`, `SEED_MEMBER1_PASSWORD`, `SEED_MEMBER2_PASSWORD` et
`SEED_ORG2_ADMIN_PASSWORD` dans `backend/.env`. Chaque valeur doit être unique et
contenir au moins 16 caractères. Le seed valide ces paramètres avant d'effacer les
données locales, puis ne journalise jamais les mots de passe. Ne versionnez pas le
fichier `.env`.

## Déploiement (suggestion simple)

- Backend : Render / Railway / tout VPS avec Node.js (le fichier SQLite peut être
  conservé sur un disque persistant, ou migré vers PostgreSQL managé si besoin
  d'évoluer vers un vrai environnement multi-serveurs).
- Frontend : Vercel / Netlify (build statique via `npm run build`).

## Pistes d'évolution (hors périmètre du stage)

- Application mobile native (Flutter) réutilisant la même API REST.
- Vraie architecture multi-tenant (base de données isolée par organisation).
- Intégration d'une passerelle de paiement réelle.
- Module IA (Python) pour des recommandations de formations personnalisées.
- Suivi automatique des crédits de formation obligatoires.
