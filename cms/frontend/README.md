# Portfolio CMS - Frontend

Ce projet est le frontend du CMS Portfolio, un système de gestion de contenu spécialisé pour les portfolios en ligne.

## Fonctionnalités implémentées

### Système de notifications
- Notifications persistantes avec stockage dans localStorage
- Support pour différents types de notifications (info, succès, avertissement, erreur)
- Gestion des notifications non lues
- Support pour les notifications avec liens
- Notifications temporaires avec expiration automatique
- Interface utilisateur intuitive avec filtrage (toutes/non lues)

### Tableau de bord analytique
- Graphique des visiteurs avec statistiques de visites
- Analyse des projets (total, publiés, brouillons, archivés)
- Utilisation des médias avec répartition par type
- Métriques de performance (temps de chargement, scores Lighthouse)
- Répartition des visiteurs par appareil et navigateur

### Interface utilisateur
- Layout principal responsive avec sidebar et header
- Système de navigation intuitif
- Composants UI modernes avec Shadcn/ui
- Icônes avec Iconly
- Formulaires avec validation

## Prochaines fonctionnalités à implémenter
- Système de recherche avancé
- Mode hors ligne / synchronisation
- Intégration avec le backend pour les données réelles
- Tests unitaires et d'intégration

## Structure du projet
- `src/components` : Composants React
- `src/components/analytics` : Composants pour le tableau de bord analytique
- `src/components/ui` : Composants UI réutilisables
- `src/contexts` : Contextes React pour la gestion d'état globale
- `src/hooks` : Hooks personnalisés
- `src/pages` : Pages de l'application

## Technologies utilisées
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Router
- React Hook Form
- Sonner (toasts)