# Design Document

## Overview

Ce document décrit la solution technique pour corriger le problème de page blanche qui apparaît lors de l'upload de fichiers en double. Le problème principal identifié est lié à des erreurs JavaScript causées par des imports d'icônes manquants dans le composant `DuplicateUploadDialog`, ce qui empêche le rendu correct de l'interface de gestion des doublons.

## Architecture

### Composants Affectés

1. **DuplicateUploadDialog.tsx** - Composant principal à corriger
2. **MediaPage.tsx** - Composant parent qui gère l'état des doublons
3. **Backend media routes** - Routes API pour la gestion des doublons (déjà fonctionnelles)

### Flux de Données

```
Upload File → Backend Detection → 409 Response → Frontend Dialog → User Action → API Call → Success/Error Feedback
```

## Components and Interfaces

### DuplicateUploadDialog Component

**Problèmes Identifiés:**
- Import manquant pour les icônes `AlertTriangle`, `Document`, `Folder`, `Calendar`
- Utilisation d'icônes non disponibles dans react-iconly

**Solution:**
- Corriger les imports d'icônes
- Remplacer les icônes manquantes par des alternatives disponibles
- Ajouter une gestion d'erreur robuste pour les icônes manquantes

**Interface Props:**
```typescript
interface DuplicateUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingFile: ExistingFile;
  uploadedFile: UploadedFile;
  onReplace: () => void;
  onRename: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}
```

### MediaPage Component

**Améliorations Nécessaires:**
- Améliorer la gestion d'erreur dans `uploadFile`
- Ajouter des logs de débogage pour identifier les problèmes
- Renforcer la gestion des états de chargement

## Data Models

### ExistingFile Interface
```typescript
interface ExistingFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  createdAt: string;
  url: string;
}
```

### UploadedFile Interface
```typescript
interface UploadedFile {
  originalName: string;
  size: number;
  mimetype: string;
}
```

### DuplicateInfo State
```typescript
interface DuplicateInfo {
  existingFile: ExistingFile;
  uploadedFile: UploadedFile;
  file: File;
}
```

## Error Handling

### Frontend Error Handling

1. **Import Errors**: Utiliser des imports conditionnels et des fallbacks pour les icônes
2. **Render Errors**: Implémenter un ErrorBoundary autour du DuplicateUploadDialog
3. **API Errors**: Améliorer la gestion des erreurs 409 et autres codes d'erreur
4. **State Errors**: Valider les données avant le rendu

### Backend Error Handling

Le backend gère déjà correctement les doublons avec des réponses 409, mais nous devons nous assurer que:
- Les réponses d'erreur contiennent toutes les informations nécessaires
- Les codes de statut sont cohérents
- Les messages d'erreur sont clairs

## Testing Strategy

### Tests Unitaires
- Tester le rendu du DuplicateUploadDialog avec différents états
- Tester la gestion des erreurs d'import d'icônes
- Tester les callbacks d'action (replace, rename, cancel)

### Tests d'Intégration
- Tester le flux complet d'upload de doublon
- Tester la communication entre MediaPage et DuplicateUploadDialog
- Tester les appels API pour les actions de doublon

### Tests E2E
- Tester l'upload d'un fichier en double dans l'interface utilisateur
- Vérifier que la boîte de dialogue s'affiche correctement
- Tester chaque action (remplacer, renommer, annuler)

## Implementation Plan

### Phase 1: Correction des Imports d'Icônes
1. Identifier toutes les icônes utilisées dans DuplicateUploadDialog
2. Vérifier leur disponibilité dans react-iconly
3. Corriger les imports et remplacer les icônes manquantes
4. Tester le rendu du composant

### Phase 2: Amélioration de la Gestion d'Erreur
1. Ajouter un ErrorBoundary autour du DuplicateUploadDialog
2. Améliorer la gestion d'erreur dans uploadFile
3. Ajouter des logs de débogage
4. Tester les scénarios d'erreur

### Phase 3: Tests et Validation
1. Écrire des tests unitaires pour le composant corrigé
2. Tester le flux complet d'upload de doublon
3. Valider l'expérience utilisateur
4. Documenter les corrections apportées

## Security Considerations

- Valider les données de fichier côté frontend avant affichage
- S'assurer que les informations sensibles ne sont pas exposées dans les messages d'erreur
- Maintenir la validation côté backend pour les doublons

## Performance Considerations

- Optimiser le rendu du DuplicateUploadDialog pour éviter les re-renders inutiles
- Utiliser des imports dynamiques pour les icônes si nécessaire
- Minimiser les appels API pendant la gestion des doublons

## Monitoring and Logging

- Ajouter des logs pour traquer les erreurs de rendu
- Monitorer les erreurs JavaScript liées aux imports
- Traquer les taux de succès des actions de doublon