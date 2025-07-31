# Design Document - Opérations en masse sur les médias

## Overview

Ce document décrit la conception technique pour implémenter les opérations en masse sur les médias dans le CMS, incluant la sélection multiple, la suppression en masse fiable, et la gestion des doublons.

## Architecture

### Frontend Components
- **MediaPage** : Page principale avec interface de sélection
- **BulkOperationsToolbar** : Barre d'outils pour les opérations en masse
- **MediaGrid** : Grille des médias avec cases à cocher
- **ConfirmationDialog** : Dialog de confirmation pour les suppressions

### Backend API
- **Route existante** : `DELETE /media/bulk/delete` (déjà implémentée)
- **Nouvelle route** : `POST /media/detect-duplicates` (à implémenter)
- **Nouvelle route** : `DELETE /media/duplicates/delete` (à implémenter)

## Components and Interfaces

### Frontend State Management

```typescript
interface MediaPageState {
  selectedMediaIds: Set<string>;
  isSelectionMode: boolean;
  mediaList: Media[];
  isLoading: boolean;
  bulkOperationInProgress: boolean;
}
```

### Bulk Operations Toolbar

```typescript
interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onToggleSelectionMode: () => void;
  isSelectionMode: boolean;
}
```

### Media Grid Item

```typescript
interface MediaGridItemProps {
  media: Media;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (id: string) => void;
  onPreview: (media: Media) => void;
}
```

## Data Models

### Bulk Delete Request
```typescript
interface BulkDeleteRequest {
  ids: string[];
}

interface BulkDeleteResponse {
  deleted: number;
  total: number;
  errors: string[];
  message: string;
}
```

### Duplicate Detection
```typescript
interface DuplicateGroup {
  originalName: string;
  size: number;
  mediaFiles: Media[];
}

interface DuplicateDetectionResponse {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
}
```

## Error Handling

### Frontend Error States
1. **Network Errors** : Retry avec backoff exponentiel
2. **Partial Failures** : Affichage détaillé des erreurs
3. **Timeout** : Indication de progression et possibilité d'annulation

### Backend Error Handling
1. **File System Errors** : Logging détaillé et continuation
2. **Database Errors** : Rollback des opérations partielles
3. **Concurrent Access** : Gestion des conflits de suppression

## Testing Strategy

### Unit Tests
- **Selection Logic** : Test des fonctions de sélection/désélection
- **Bulk Operations** : Test des appels API et gestion d'erreurs
- **State Management** : Test des transitions d'état

### Integration Tests
- **End-to-End Workflow** : Sélection → Confirmation → Suppression
- **Error Scenarios** : Test des cas d'échec partiel
- **Performance** : Test avec de gros volumes de médias

### Manual Testing
- **User Experience** : Fluidité de l'interface de sélection
- **Confirmation Dialogs** : Clarté des messages
- **Feedback** : Pertinence des notifications

## Implementation Details

### Phase 1: Amélioration de la suppression en masse
1. **Correction du bug "par vagues"** : Capturer la liste complète au moment du clic
2. **Amélioration de l'API backend** : Traitement en lot plus efficace
3. **Meilleur feedback utilisateur** : Barre de progression et messages détaillés

### Phase 2: Interface de sélection multiple
1. **Mode sélection** : Basculer entre mode normal et mode sélection
2. **Cases à cocher** : Ajout sur chaque média
3. **Barre d'outils** : Boutons "Tout sélectionner", "Désélectionner", "Supprimer"
4. **Indicateurs visuels** : Highlighting des médias sélectionnés

### Phase 3: Gestion des doublons
1. **Détection automatique** : Algorithme de détection basé sur nom/taille
2. **Interface de gestion** : Affichage des groupes de doublons
3. **Suppression intelligente** : Garder le plus récent ou le plus optimisé

## Performance Considerations

### Frontend Optimizations
- **Virtualisation** : Pour les grandes listes de médias
- **Debouncing** : Pour les opérations de sélection rapides
- **Lazy Loading** : Chargement progressif des miniatures

### Backend Optimizations
- **Batch Processing** : Traitement par lots de 50 médias
- **Parallel Deletion** : Suppression parallèle des fichiers
- **Database Transactions** : Optimisation des requêtes en lot

## Security Considerations

### Authorization
- **Vérification des permissions** : Seuls les admins peuvent faire des suppressions en masse
- **Validation des IDs** : Vérification que tous les IDs appartiennent à l'utilisateur

### Data Integrity
- **Atomic Operations** : Soit tout réussit, soit tout échoue
- **Backup Verification** : Vérification avant suppression définitive
- **Audit Trail** : Logging de toutes les opérations en masse

## Deployment Strategy

### Rollout Plan
1. **Backend API** : Déploiement des nouvelles routes
2. **Frontend Updates** : Mise à jour progressive de l'interface
3. **Feature Flags** : Activation progressive pour les utilisateurs

### Monitoring
- **Performance Metrics** : Temps de réponse des opérations en masse
- **Error Rates** : Taux d'échec des suppressions
- **Usage Analytics** : Fréquence d'utilisation des fonctionnalités

## Migration Considerations

### Existing Data
- **Backward Compatibility** : Maintien de l'API existante
- **Data Cleanup** : Nettoyage des médias orphelins existants

### User Training
- **Documentation** : Guide d'utilisation des nouvelles fonctionnalités
- **Notifications** : Alertes sur les nouvelles capacités