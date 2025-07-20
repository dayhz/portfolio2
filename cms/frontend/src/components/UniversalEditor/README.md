# Éditeur Universel Portfolio

L'Éditeur Universel Portfolio est un éditeur WYSIWYG (What You See Is What You Get) avancé conçu spécifiquement pour la création et la gestion de contenu de portfolio. Il offre une expérience d'édition fidèle au rendu final du site, avec une large gamme de blocs de contenu et de fonctionnalités.

## Caractéristiques principales

- **Édition WYSIWYG complète** - Ce que vous voyez est exactement ce que vous obtiendrez sur votre site
- **Blocs universels** - Une collection riche de blocs de contenu adaptés aux portfolios
- **Templates multiples** - Support pour différents styles de portfolio (Poesial, Zesty, Nobe, Ordine)
- **Gestion avancée des médias** - Upload, optimisation et organisation des images et vidéos
- **Historique des versions** - Sauvegarde automatique et gestion des versions
- **Interface responsive** - Fonctionne sur ordinateurs, tablettes et smartphones
- **Haute performance** - Optimisé pour gérer de grands volumes de contenu
- **Extensible** - Architecture modulaire permettant d'ajouter facilement de nouvelles fonctionnalités

## Structure du projet

```
UniversalEditor/
├── components/       # Composants React pour l'interface utilisateur
├── extensions/       # Extensions Tiptap pour les différents types de blocs
├── hooks/            # Hooks React personnalisés
├── nodeviews/        # Vues de nœuds pour le rendu WYSIWYG
├── services/         # Services pour la gestion des données et des opérations
├── styles/           # Fichiers CSS et utilitaires de style
├── tests/            # Tests unitaires et d'intégration
├── utils/            # Fonctions utilitaires
├── docs/             # Documentation
├── index.ts          # Point d'entrée principal
├── UniversalEditor.tsx  # Composant principal de l'éditeur
└── types.ts          # Définitions de types TypeScript
```

## Installation

L'Éditeur Universel Portfolio est intégré dans le projet CMS Portfolio. Pour l'utiliser dans un autre projet, consultez le [Guide d'installation et d'intégration](./docs/guide-integration.md).

## Documentation

Une documentation complète est disponible dans le dossier [docs](./docs) :

- [Index de la documentation](./docs/index.md)
- [Guide utilisateur](./docs/guide-utilisateur.md)
- [Guide des blocs](./docs/guide-blocs.md)
- [Raccourcis clavier](./docs/raccourcis-clavier.md)
- [Fonctionnalités avancées](./docs/fonctionnalites-avancees.md)
- [Guide de dépannage](./docs/guide-depannage.md)
- [Guide d'intégration](./docs/guide-integration.md)

## Utilisation de base

```jsx
import React from 'react';
import { UniversalEditor } from './components/UniversalEditor';

const MyEditor = ({ initialContent, projectId }) => {
  const handleChange = (content) => {
    console.log('Content updated:', content);
  };

  return (
    <UniversalEditor
      content={initialContent}
      onChange={handleChange}
      projectId={projectId}
      templateType="poesial"
    />
  );
};

export default MyEditor;
```

## Développement

### Prérequis

- Node.js 14.0.0 ou supérieur
- npm 6.0.0 ou supérieur (ou yarn 1.22.0+)
- React 16.8.0 ou supérieur

### Installation des dépendances

```bash
npm install
```

### Exécution des tests

```bash
npm test
```

### Construction pour la production

```bash
npm run build
```

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

## Auteurs

- Équipe de développement Portfolio CMS

## Remerciements

- [Tiptap](https://tiptap.dev/) - Le framework d'éditeur sous-jacent
- [React](https://reactjs.org/) - La bibliothèque UI
- [TypeScript](https://www.typescriptlang.org/) - Pour le typage statique