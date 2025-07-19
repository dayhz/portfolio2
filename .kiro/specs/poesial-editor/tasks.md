# Implementation Plan - Éditeur Style Poesial

## Phase 1: Infrastructure de Base

- [ ] 1. Setup du projet et structure de base
  - Créer la structure de dossiers pour les extensions et composants
  - Installer les dépendances Tiptap supplémentaires nécessaires
  - Configurer TypeScript pour les nouvelles interfaces
  - _Requirements: 5.1, 5.2_

- [ ] 2. Extraction et intégration des styles CSS Poesial
  - Copier les styles CSS pertinents depuis le site Poesial
  - Créer `poesial-base.css` avec les classes principales
  - Créer `poesial-components.css` pour les composants spécifiques
  - Adapter les styles pour l'éditeur avec `editor-overrides.css`
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3. Création des interfaces TypeScript de base
  - Définir les interfaces pour tous les types de blocs
  - Créer les types pour BlockSelector et BlockDefinition
  - Implémenter les interfaces pour les attributs des extensions
  - Créer les types pour la validation HTML
  - _Requirements: 5.4, 5.5_

## Phase 2: BlockSelector et Interface Utilisateur

- [ ] 4. Implémentation du composant BlockSelector
  - Créer le composant BlockSelector avec interface visuelle
  - Implémenter les catégories de blocs (media, text, layout)
  - Ajouter les aperçus visuels pour chaque type de bloc
  - Gérer le positionnement et l'affichage du sélecteur
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5. Système de slash commands
  - Créer l'extension SlashCommandExtension
  - Intégrer le BlockSelector avec les commandes slash
  - Implémenter la détection du caractère "/" et l'ouverture du menu
  - Gérer la navigation clavier dans le sélecteur
  - _Requirements: 5.1, 5.3_

- [ ] 6. Interface de la barre d'outils améliorée
  - Modifier la barre d'outils existante pour inclure les nouveaux blocs
  - Ajouter des boutons visuels pour chaque type de contenu Poesial
  - Implémenter les tooltips et aperçus au survol
  - Gérer l'état actif/inactif des boutons selon le contexte
  - _Requirements: 5.2, 5.3_

## Phase 3: Extensions Tiptap pour Images

- [ ] 7. Extension FullWidthImage
  - Créer l'extension FullWidthImageExtension avec attributs
  - Implémenter les commandes setFullWidthImage
  - Gérer les variants "auto" et "16-9"
  - Créer la logique de parsing et rendering HTML
  - _Requirements: 1.2, 1.3, 1.5_

- [ ] 8. NodeView pour FullWidthImage
  - Créer le composant React FullWidthImageView
  - Implémenter l'upload d'images avec prévisualisation
  - Ajouter les contrôles pour changer le variant (auto/16-9)
  - Gérer la suppression et l'édition des attributs
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 9. Extension ImageGrid
  - Créer l'extension ImageGridExtension pour grilles 2 colonnes
  - Implémenter la gestion de multiple images
  - Ajouter le support pour vidéos dans les grilles
  - Créer la structure HTML exacte du site Poesial
  - _Requirements: 1.4, 1.5_

- [ ] 10. NodeView pour ImageGrid
  - Créer le composant React ImageGridView
  - Implémenter l'upload multiple d'images
  - Ajouter les contrôles pour réorganiser les images
  - Gérer l'ajout/suppression d'images dans la grille
  - _Requirements: 1.1, 1.4, 1.5_

## Phase 4: Extensions Tiptap pour Texte

- [ ] 11. Extension RichText améliorée
  - Modifier l'extension de texte existante pour les styles Poesial
  - Implémenter les variants (default, about-container)
  - Ajouter les classes CSS appropriées automatiquement
  - Gérer la structure HTML avec conteneurs u-container
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 12. NodeView pour RichText
  - Créer le composant React RichTextView
  - Implémenter l'édition en place avec styles Poesial
  - Ajouter les contrôles pour changer de variant
  - Gérer la préservation du formatage lors de l'édition
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 13. Extension Testimony
  - Créer l'extension TestimonyExtension
  - Implémenter les attributs pour citation, auteur, rôle, image
  - Créer la structure HTML exacte des témoignages Poesial
  - Gérer les commandes d'insertion et modification
  - _Requirements: 3.1, 3.4_

- [ ] 14. NodeView pour Testimony
  - Créer le composant React TestimonyView
  - Implémenter l'édition de la citation en place
  - Ajouter les contrôles pour les informations auteur
  - Gérer l'upload de l'image de profil auteur
  - _Requirements: 3.1, 3.4_

## Phase 5: Blocs Spécialisés et Vidéos

- [ ] 15. Extension TextBlock simple
  - Créer l'extension pour les blocs temp-comp-text
  - Implémenter la structure HTML simple pour texte
  - Ajouter les styles appropriés automatiquement
  - Gérer l'intégration avec les autres blocs
  - _Requirements: 3.2_

- [ ] 16. Amélioration de l'extension Video existante
  - Modifier l'extension Video pour la structure Poesial
  - Ajouter l'encapsulation dans video-wrp
  - Implémenter l'intégration dans les grilles d'images
  - Gérer les attributs spécifiques au site Poesial
  - _Requirements: 3.4_

- [ ] 17. Extension AboutContainer
  - Créer l'extension pour temp-about_container
  - Implémenter la structure avec informations projet
  - Ajouter les champs pour client, année, durée, type, etc.
  - Créer l'interface d'édition pour les métadonnées
  - _Requirements: 3.3_

## Phase 6: Espacement et Structure

- [ ] 18. Système d'espacement automatique
  - Implémenter l'ajout automatique des g_section_space
  - Créer la logique pour les différents variants d'espacement
  - Gérer l'espacement entre les différents types de blocs
  - Ajouter les conteneurs u-container automatiquement
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 19. Gestion des sections et conteneurs
  - Créer la logique pour wrapper le contenu dans des sections
  - Implémenter les variants de section selon le type de contenu
  - Gérer la hiérarchie des conteneurs (section > u-container > contenu)
  - Ajouter les data-attributes appropriés
  - _Requirements: 4.2, 4.3_

## Phase 7: Export et Transformation HTML

- [ ] 20. Système de transformation HTML
  - Créer les fonctions de transformation vers HTML Poesial
  - Implémenter les templates HTML pour chaque type de bloc
  - Ajouter la validation de la structure HTML générée
  - Créer les utilitaires de nettoyage et optimisation
  - _Requirements: 4.4, 5.5_

- [ ] 21. Fonction d'export HTML final
  - Implémenter la fonction d'export vers HTML compatible Poesial
  - Ajouter la validation avant export
  - Créer les options d'export (minifié, formaté, etc.)
  - Gérer les erreurs et warnings d'export
  - _Requirements: 4.4, 5.5_

## Phase 8: Mode Prévisualisation

- [ ] 22. Composant de prévisualisation
  - Créer le composant PoesialPreview
  - Implémenter le rendu avec les styles exacts du site
  - Ajouter le toggle entre mode édition et prévisualisation
  - Gérer la synchronisation du contenu entre les modes
  - _Requirements: 4.4_

- [ ] 23. Intégration dans ProjectContentPage
  - Modifier ProjectContentPage pour utiliser le nouvel éditeur
  - Ajouter le bouton de basculement prévisualisation
  - Implémenter la sauvegarde du contenu transformé
  - Gérer l'état de l'éditeur entre les sessions
  - _Requirements: 4.4, 5.5_

## Phase 9: Validation et Gestion d'Erreurs

- [ ] 24. Système de validation du contenu
  - Implémenter la validation de la structure HTML
  - Créer les règles de validation pour chaque type de bloc
  - Ajouter les messages d'erreur et warnings appropriés
  - Gérer la validation en temps réel pendant l'édition
  - _Requirements: 5.4, 5.5_

- [ ] 25. Gestion d'erreurs pour uploads
  - Implémenter la gestion d'erreurs pour upload d'images
  - Ajouter la validation des formats et tailles de fichiers
  - Créer les messages d'erreur utilisateur appropriés
  - Gérer les erreurs réseau et de traitement
  - _Requirements: 1.1, 1.4_

## Phase 10: Tests et Optimisation

- [ ] 26. Tests unitaires des extensions
  - Créer les tests pour chaque extension Tiptap
  - Tester la génération HTML pour tous les types de blocs
  - Valider les transformations de données
  - Tester les commandes et attributs des extensions
  - _Requirements: Tous_

- [ ] 27. Tests d'intégration
  - Tester l'interaction entre les différentes extensions
  - Valider le rendu des NodeViews React
  - Tester l'export HTML final avec contenu complexe
  - Valider la cohérence des styles entre éditeur et prévisualisation
  - _Requirements: Tous_

- [ ] 28. Optimisation des performances
  - Implémenter le lazy loading des NodeViews
  - Optimiser la compression et le traitement des images
  - Ajouter le code splitting pour les extensions
  - Optimiser les re-renders React et la gestion mémoire
  - _Requirements: 5.3, 5.4_

## Phase 11: Documentation et Finalisation

- [ ] 29. Documentation utilisateur
  - Créer la documentation pour chaque type de bloc
  - Ajouter les guides d'utilisation avec captures d'écran
  - Documenter les raccourcis clavier et commandes slash
  - Créer les exemples d'utilisation pour chaque layout
  - _Requirements: 5.1, 5.2_

- [ ] 30. Tests de régression visuelle
  - Comparer le rendu de l'éditeur avec le site Poesial original
  - Tester sur différentes tailles d'écran et navigateurs
  - Valider la cohérence des styles et layouts
  - Créer les tests automatisés de régression visuelle
  - _Requirements: 4.4_