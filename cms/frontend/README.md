# Portfolio CMS - Frontend

Interface d'administration React pour le Portfolio CMS.

## Stack Technique

- **React 18** avec TypeScript
- **Vite** pour le build et dev server
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **React Iconly** pour les icônes
- **React Router** pour la navigation
- **React Query** pour la gestion des données
- **React Hook Form** pour les formulaires
- **Sonner** pour les notifications

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (Shadcn/ui)
│   ├── Layout.tsx      # Layout principal avec sidebar
│   └── ...
├── pages/              # Pages principales
│   ├── Login.tsx       # Page de connexion
│   └── Dashboard.tsx   # Dashboard principal
├── lib/                # Utilitaires et configuration
├── hooks/              # Hooks personnalisés
└── types/              # Types TypeScript
```

## Développement

Le serveur de développement démarre sur `http://localhost:3000` avec proxy vers l'API sur le port 5000.

### Identifiants de test
- Email: `admin@portfolio.com`
- Mot de passe: `admin123`

## Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run lint` - Linting avec ESLint
- `npm run preview` - Prévisualisation du build