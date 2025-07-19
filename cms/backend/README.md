# Portfolio CMS - Backend

API Node.js/Express pour le Portfolio CMS.

## Stack Technique

- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **Prisma ORM** avec SQLite (dev) / PostgreSQL (prod)
- **JWT** pour l'authentification
- **Multer** + **Sharp** pour l'upload et optimisation d'images
- **Zod** pour la validation des données

## Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Créer la base de données
npm run db:push

# Démarrer le serveur de développement
npm run dev
```

## Scripts disponibles

- `npm run dev` - Serveur de développement avec hot reload
- `npm run build` - Build TypeScript
- `npm run start` - Démarrer le serveur de production
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la DB
- `npm run db:migrate` - Créer une migration
- `npm run db:studio` - Interface graphique Prisma

## Structure du projet

```
src/
├── controllers/        # Contrôleurs des routes
├── middleware/         # Middleware personnalisés
├── routes/            # Définition des routes
├── services/          # Logique métier
├── utils/             # Utilitaires
├── types/             # Types TypeScript
└── server.ts          # Point d'entrée
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify` - Vérifier le token

### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Médias
- `GET /api/media` - Liste des médias
- `POST /api/media/upload` - Upload de fichiers
- `DELETE /api/media/:id` - Supprimer un média

### Autres endpoints à venir...

## Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.