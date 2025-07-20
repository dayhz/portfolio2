# Implementation Plan - Éditeur Universel Portfolio

## Phase 1: Infrastructure et Styles

- [x] 1. Setup de l'architecture modulaire
  - Créer la structure de dossiers pour l'éditeur universel
  - Configurer TypeScript avec les nouvelles interfaces
  - Installer les dépendances Tiptap nécessaires
  - Créer les types de base pour les blocs universels
  - _Requirements: 7.1, 7.4_

- [x] 2. Extraction et intégration des styles du site
  - Copier tous les styles CSS pertinents du site portfolio
  - Créer un système d'injection de styles dans l'éditeur
  - Configurer les styles responsive pour l'éditeur
  - Tester le rendu identique entre éditeur et site
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 3. Système de gestion des blocs
  - Créer l'interface BlockType et les définitions
  - Implémenter le registre des blocs disponibles
  - Créer le système de catégorisation (media, text, layout)
  - Ajouter les aperçus visuels pour chaque bloc
  - _Requirements: 1.1, 2.1, 2.2_

## Phase 2: Interface de Sélection

- [x] 4. Composant BlockMenu
  - Créer l'interface visuelle de sélection des blocs
  - Implémenter les catégories avec aperçus
  - Ajouter la navigation clavier dans le menu
  - Gérer le positionnement dynamique du menu
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Système de slash commands
  - Créer l'extension SlashCommand pour détecter "/"
  - Intégrer l'ouverture du BlockMenu avec les slash commands
  - Implémenter la recherche/filtrage des blocs
  - Ajouter les raccourcis clavier pour navigation rapide
  - _Requirements: 1.1, 2.4, 2.5_

- [x] 6. Aperçus et tooltips
  - Créer les composants d'aperçu pour chaque type de bloc
  - Implémenter les tooltips avec descriptions détaillées
  - Ajouter les animations de transition fluides
  - Optimiser les performances des aperçus
  - _Requirements: 2.2, 2.3, 7.3_

## Phase 3: Extensions Universelles

- [x] 7. Extension Image Universelle
  - Créer l'extension ImageExtension avec tous les variants
  - Implémenter les attributs (src, alt, variant, size)
  - Gérer les différents types (full, 16-9, auto)
  - Créer la structure HTML exacte du site
  - _Requirements: 1.2, 4.2, 5.2_

- [x] 8. NodeView pour Images
  - Créer le composant ImageBlockView avec rendu WYSIWYG
  - Implémenter l'upload d'images avec prévisualisation
  - Ajouter les contrôles pour changer variant/taille
  - Gérer l'édition en place et les contrôles contextuels
  - _Requirements: 3.2, 4.1, 4.2, 5.1_

- [x] 9. Extension Grille d'Images
  - Créer l'extension pour grilles 2 colonnes
  - Implémenter la gestion de multiple images
  - Ajouter le support pour vidéos dans les grilles
  - Gérer l'ajout/suppression d'éléments dans la grille
  - _Requirements: 1.3, 4.4, 5.2_

- [x] 10. NodeView pour Grilles
  - Créer le composant ImageGridView
  - Implémenter l'upload multiple et réorganisation
  - Ajouter les contrôles pour chaque élément de la grille
  - Gérer le drag & drop pour réorganiser
  - _Requirements: 3.2, 4.4, 7.3_

## Phase 4: Extensions Texte

- [x] 11. Extension Texte Universelle
  - Créer l'extension TextExtension avec variants multiples
  - Implémenter les types (rich, simple, about, testimony)
  - Gérer les structures HTML différentes selon le variant
  - Ajouter les classes CSS appropriées automatiquement
  - _Requirements: 1.4, 5.2, 5.3_

- [x] 12. NodeView pour Texte Riche
  - Créer le composant TextBlockView avec édition en place
  - Implémenter les contrôles de formatage intégrés
  - Ajouter la sélection de variant (rich/simple/about)
  - Gérer la préservation du formatage lors de l'édition
  - _Requirements: 3.1, 3.3, 5.1_

- [x] 13. Extension Témoignage
  - Créer l'extension TestimonyExtension
  - Implémenter les attributs (quote, author, role, image)
  - Créer la structure HTML exacte des témoignages
  - Gérer l'intégration avec les autres blocs
  - _Requirements: 1.5, 5.2_

- [x] 14. NodeView pour Témoignages
  - Créer le composant TestimonyView
  - Implémenter l'édition de citation en place
  - Ajouter les contrôles pour informations auteur
  - Gérer l'upload de l'image de profil
  - _Requirements: 3.1, 3.2, 4.1_

## Phase 5: Extension Vidéo et Médias

- [x] 15. Extension Vidéo Universelle
  - Améliorer l'extension Video existante pour le système universel
  - Ajouter l'encapsulation dans la structure du site
  - Implémenter l'intégration dans les grilles
  - Gérer les différents formats et sources vidéo
  - _Requirements: 4.3, 5.2_

- [x] 16. NodeView pour Vidéos
  - Créer le composant VideoView avec contrôles
  - Implémenter l'upload de vidéos locales
  - Ajouter les contrôles de lecture/pause
  - Gérer l'intégration dans les layouts complexes
  - _Requirements: 3.2, 4.3, 7.3_

- [x] 17. Système de gestion des médias
  - Créer un gestionnaire centralisé pour tous les médias
  - Implémenter la compression automatique des images
  - Ajouter la validation des formats et tailles
  - Créer le système de cache pour les médias
  - _Requirements: 4.1, 4.2, 7.2, 7.4_

## Phase 6: Édition WYSIWYG

- [x] 18. Système d'édition en place
  - Implémenter l'édition directe dans tous les blocs
  - Créer les contrôles contextuels pour chaque type
  - Ajouter les indicateurs visuels d'édition active
  - Gérer les transitions fluides entre modes
  - _Requirements: 3.1, 3.2, 3.3, 7.3_

- [x] 19. Contrôles et toolbar dynamique
  - Créer une toolbar qui s'adapte au bloc sélectionné
  - Implémenter les contrôles spécifiques à chaque type
  - Ajouter les raccourcis clavier contextuels
  - Gérer l'état des contrôles selon le contexte
  - _Requirements: 3.4, 7.5_

- [x] 20. Système de sélection et navigation
  - Implémenter la sélection visuelle des blocs
  - Créer la navigation clavier entre les blocs
  - Ajouter les indicateurs de focus et sélection
  - Gérer la sélection multiple pour opérations groupées
  - _Requirements: 3.3, 7.3, 7.5_

## Phase 7: Sauvegarde et Persistance

- [x] 21. Système d'auto-sauvegarde
  - Implémenter la sauvegarde automatique intelligente
  - Créer le système de debouncing pour éviter les sauvegardes excessives
  - Ajouter les indicateurs de statut de sauvegarde
  - Gérer la récupération en cas d'erreur
  - _Requirements: 6.1, 6.4, 7.4_

- [ ] 22. Gestion des versions et historique
  - Créer un système d'historique des modifications
  - Implémenter Undo/Redo (Ctrl+Z/Ctrl+Y)
  - Ajouter la sauvegarde de versions multiples
  - Gérer la restauration de versions précédentes
  - _Requirements: 6.4, 7.5_

- [ ] 23. Export et intégration site
  - Créer le système d'export vers format site
  - Implémenter la génération HTML/JSON appropriée
  - Ajouter la validation du contenu avant export
  - Gérer l'intégration avec le système de templates du site
  - _Requirements: 6.3, 6.5, 5.5_

## Phase 8: Performance et Optimisation

- [ ] 24. Optimisation des performances
  - Implémenter le lazy loading des composants lourds
  - Optimiser le rendu des images et médias
  - Ajouter le code splitting pour les extensions
  - Créer le système de cache intelligent
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 25. Gestion mémoire et cleanup
  - Implémenter le cleanup automatique des ressources
  - Optimiser les re-renders React
  - Gérer la libération mémoire des médias
  - Ajouter le monitoring des performances
  - _Requirements: 7.4, 7.1_

- [ ] 26. Optimisation responsive
  - Tester et optimiser sur toutes les tailles d'écran
  - Adapter l'interface pour mobile/tablette
  - Optimiser les contrôles tactiles
  - Gérer les performances sur appareils moins puissants
  - _Requirements: 5.4, 7.3_

## Phase 9: Tests et Validation

- [ ] 27. Tests unitaires des extensions
  - Créer les tests pour chaque extension Tiptap
  - Tester la génération HTML pour tous les types de blocs
  - Valider les transformations et attributs
  - Tester les commandes et interactions
  - _Requirements: Tous_

- [ ] 28. Tests d'intégration
  - Tester l'interaction entre différents types de blocs
  - Valider le rendu WYSIWYG vs rendu final
  - Tester les workflows complets de création
  - Valider l'export et l'intégration site
  - _Requirements: Tous_

- [ ] 29. Tests de performance
  - Tester avec du contenu volumineux
  - Valider les performances d'upload de médias
  - Tester la stabilité sur sessions longues
  - Mesurer et optimiser les temps de réponse
  - _Requirements: 7.1, 7.2, 7.4_

## Phase 10: Finalisation

- [ ] 30. Interface utilisateur finale
  - Peaufiner tous les détails visuels
  - Ajouter les animations et transitions finales
  - Optimiser l'expérience utilisateur globale
  - Créer les guides et tooltips d'aide
  - _Requirements: 2.1, 2.2, 7.3_

- [ ] 31. Documentation et guides
  - Créer la documentation utilisateur complète
  - Ajouter les guides d'utilisation avec exemples
  - Documenter tous les raccourcis et fonctionnalités
  - Créer les tutoriels pour chaque type de bloc
  - _Requirements: Tous_

- [ ] 32. Tests finaux et déploiement
  - Effectuer les tests de régression complets
  - Valider sur différents navigateurs
  - Tester l'intégration complète avec le site
  - Préparer le déploiement en production
  - _Requirements: Tous_