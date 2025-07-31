# Implementation Plan - Opérations en masse sur les médias

## Phase 1: Correction de la suppression en masse existante

- [x] 1. Corriger le bug de suppression "par vagues"
  - Modifier le bouton "Tout supprimer" pour capturer la liste complète des médias au moment du clic
  - Éviter que la liste se rafraîchisse entre les suppressions
  - Tester avec un grand nombre de médias pour vérifier la suppression complète
  - _Requirements: 2.1, 2.2_

- [x] 2. Améliorer le feedback utilisateur pour la suppression en masse
  - Ajouter une barre de progression pendant la suppression
  - Afficher le nombre de médias en cours de traitement
  - Améliorer les messages d'erreur avec détails spécifiques
  - _Requirements: 2.3, 2.4_

## Phase 2: Interface de sélection multiple

- [x] 3. Implémenter le mode sélection
  - Ajouter les états `selectedMediaIds` et `isSelectionMode` au composant MediaPage
  - Créer les fonctions `toggleMediaSelection`, `selectAllMedia`, `deselectAllMedia`
  - Implémenter le basculement entre mode normal et mode sélection
  - _Requirements: 1.1_

- [x] 4. Créer la barre d'outils de sélection
  - Ajouter les boutons "Sélectionner", "Tout sélectionner", "Tout désélectionner"
  - Afficher le compteur de médias sélectionnés
  - Ajouter le bouton "Supprimer la sélection" avec confirmation
  - Positionner la barre d'outils dans l'interface existante
  - _Requirements: 1.1, 1.2_

- [x] 5. Modifier la grille des médias pour la sélection
  - Ajouter des cases à cocher sur chaque média en mode sélection
  - Implémenter le highlighting visuel des médias sélectionnés
  - Modifier les interactions de clic selon le mode (sélection vs prévisualisation)
  - Masquer les boutons d'action individuels en mode sélection
  - _Requirements: 1.1_

- [x] 6. Implémenter la suppression de la sélection
  - Connecter le bouton "Supprimer la sélection" à l'API existante `/media/bulk/delete`
  - Ajouter une confirmation avec le nombre exact de médias sélectionnés
  - Gérer les erreurs et afficher les résultats détaillés
  - Réinitialiser la sélection après suppression
  - _Requirements: 1.2, 1.3, 1.4_

## Phase 3: Détection et gestion des doublons

- [x] 7. Créer l'API de détection des doublons
  - Implémenter la route `POST /media/detect-duplicates`
  - Créer l'algorithme de détection basé sur nom et taille de fichier
  - Grouper les médias en doublons potentiels
  - Retourner la structure des groupes de doublons
  - _Requirements: 3.5_

- [x] 8. Implémenter l'API de suppression des doublons
  - Créer la route `DELETE /media/duplicates/delete`
  - Implémenter la logique pour garder le fichier le plus récent de chaque groupe
  - Gérer la suppression en masse des doublons identifiés
  - Ajouter la validation et gestion d'erreurs
  - _Requirements: 3.5_

- [x] 9. Ajouter l'interface de gestion des doublons
  - Créer un bouton "Détecter les doublons" dans la page des médias
  - Afficher les groupes de doublons détectés dans une interface dédiée
  - Permettre à l'utilisateur de choisir quels doublons supprimer
  - Ajouter un bouton "Supprimer tous les doublons" avec confirmation
  - _Requirements: 3.5_

## Phase 4: Prévention des doublons à l'upload

- [x] 10. Implémenter la détection de doublons à l'upload
  - Modifier la route d'upload pour vérifier les doublons avant sauvegarde
  - Comparer le nom et la taille du fichier uploadé avec les existants
  - Retourner une réponse indiquant si un doublon existe
  - _Requirements: 3.1_

- [x] 11. Créer l'interface de gestion des doublons à l'upload
  - Afficher un dialog quand un doublon est détecté
  - Proposer les options "Remplacer", "Renommer", "Annuler"
  - Implémenter la logique de remplacement (supprimer ancien + sauver nouveau)
  - Implémenter la logique de renommage automatique avec suffixe unique
  - _Requirements: 3.2, 3.3, 3.4_

## Phase 5: Optimisations et tests

- [ ] 12. Optimiser les performances pour de gros volumes
  - Implémenter la pagination côté serveur pour les opérations en masse
  - Ajouter la virtualisation pour l'affichage de grandes listes
  - Optimiser les requêtes de base de données pour les opérations en lot
  - Tester avec 1000+ médias pour valider les performances
  - _Requirements: 2.2_

- [ ] 13. Ajouter les tests automatisés
  - Créer les tests unitaires pour les fonctions de sélection
  - Ajouter les tests d'intégration pour les API de suppression en masse
  - Implémenter les tests end-to-end pour le workflow complet
  - Tester les cas d'erreur et de récupération
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 14. Améliorer l'expérience utilisateur
  - Ajouter des animations pour les transitions de mode
  - Implémenter les raccourcis clavier (Ctrl+A pour tout sélectionner)
  - Ajouter des tooltips explicatifs sur les boutons
  - Optimiser l'interface pour mobile et tablette
  - _Requirements: 1.1, 1.2_

## Phase 6: Documentation et déploiement

- [ ] 15. Créer la documentation utilisateur
  - Rédiger le guide d'utilisation des opérations en masse
  - Créer des captures d'écran des nouvelles fonctionnalités
  - Documenter les bonnes pratiques pour éviter les doublons
  - Ajouter les FAQ sur la gestion des médias
  - _Requirements: Toutes_

- [ ] 16. Préparer le déploiement
  - Créer les scripts de migration si nécessaire
  - Configurer le monitoring des nouvelles fonctionnalités
  - Préparer les feature flags pour un déploiement progressif
  - Tester en environnement de staging avec données réelles
  - _Requirements: Toutes_