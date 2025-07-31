# Système de débogage pour les uploads de doublons

Ce document décrit le système de débogage et de monitoring intégré pour la fonctionnalité de gestion des uploads de doublons.

## Vue d'ensemble

Le système de débogage fournit :
- **Logging automatique** des événements de détection de doublons
- **Suivi des erreurs** JavaScript et de rendu
- **Outils de débogage** interactifs
- **Panneau de monitoring** en temps réel
- **Export de données** pour analyse

## Composants principaux

### 1. DuplicateUploadDebugger (Service)
Service singleton qui gère tous les aspects du débogage.

**Localisation :** `src/services/DuplicateUploadDebugger.ts`

**Fonctionnalités :**
- Logging d'événements avec horodatage
- Gestion des erreurs avec niveaux de sévérité
- Persistance dans localStorage
- Export de données JSON
- Outils de test intégrés

### 2. DuplicateUploadDebugPanel (Composant)
Interface utilisateur pour visualiser et analyser les données de débogage.

**Localisation :** `src/components/media/DuplicateUploadDebugPanel.tsx`

**Fonctionnalités :**
- Vue d'ensemble des métriques
- Liste des événements récents
- Gestion des erreurs
- Outils de test
- Export de données

### 3. useDuplicateUploadDebugger (Hook)
Hook React pour faciliter l'intégration du débogage dans les composants.

**Localisation :** `src/hooks/useDuplicateUploadDebugger.ts`

## Utilisation

### Accès au panneau de débogage

1. **Mode développement uniquement** : Le bouton "🔍 Debug Doublons" apparaît dans la barre d'outils de la page Media
2. Cliquez sur le bouton pour ouvrir le panneau de débogage
3. Le panneau se met à jour automatiquement toutes les 2 secondes

### Utilisation dans les composants

```typescript
import { useDuplicateUploadDebugger } from '@/hooks/useDuplicateUploadDebugger';

function MyComponent() {
  const { logEvent, logError, logValidation } = useDuplicateUploadDebugger({
    componentName: 'MyComponent',
    autoLogRenders: true,
    autoLogErrors: true
  });

  const handleAction = () => {
    logEvent('action_taken', { action: 'test', timestamp: Date.now() });
  };

  const handleError = (error: Error) => {
    logError('Component error occurred', { error: error.message }, 'high');
  };

  // ...
}
```

### Utilisation directe du service

```typescript
import { duplicateUploadDebugger } from '@/services/DuplicateUploadDebugger';

// Logger un événement
duplicateUploadDebugger.logEvent('detection', {
  existingFile: { id: '123', name: 'test.jpg' },
  uploadedFile: { originalName: 'test.jpg', size: 1024 }
});

// Logger une erreur
duplicateUploadDebugger.logError({
  type: 'validation_error',
  message: 'Invalid file data',
  context: { fileName: 'test.jpg' },
  severity: 'medium'
});

// Obtenir les métriques
const metrics = duplicateUploadDebugger.getMetrics();
console.log('Error rate:', metrics.errorRate);
```

## Outils de débogage en console

Le système expose des outils dans la console du navigateur :

```javascript
// Simuler une détection de doublon
window.debugDuplicateUpload.simulateDuplicate('test-file.jpg');

// Forcer une erreur pour tester
window.debugDuplicateUpload.forceError('render_error');

// Obtenir un résumé des métriques
window.debugDuplicateUpload.getSummary();

// Exporter toutes les données de débogage
const debugData = window.debugDuplicateUpload.export();
```

## Types d'événements loggés

### Événements automatiques
- **`detection`** : Détection d'un fichier en doublon
- **`dialog_open`** : Ouverture de la boîte de dialogue
- **`dialog_close`** : Fermeture de la boîte de dialogue
- **`action_taken`** : Action utilisateur (replace, rename, cancel)
- **`validation`** : Validation des données de doublon
- **`processing`** : Étapes de traitement

### Types d'erreurs
- **`render_error`** : Erreurs de rendu JavaScript
- **`validation_error`** : Erreurs de validation des données
- **`api_error`** : Erreurs d'API
- **`timeout_error`** : Erreurs de timeout
- **`unknown_error`** : Erreurs non catégorisées

## Niveaux de sévérité

- **`low`** : Avertissements mineurs
- **`medium`** : Erreurs récupérables
- **`high`** : Erreurs importantes
- **`critical`** : Erreurs critiques bloquantes

## Persistance des données

Les données sont automatiquement sauvegardées dans localStorage :
- **`duplicateUploadDebugEvents`** : Événements (max 500)
- **`duplicateUploadDebugErrors`** : Erreurs (max 100)

## Export et analyse

### Format d'export JSON
```json
{
  "sessionId": "session-1234567890-abc123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "url": "http://localhost:3000/media",
  "metrics": {
    "totalDetections": 5,
    "successfulActions": 4,
    "failedActions": 1,
    "errorRate": 20
  },
  "recentEvents": [...],
  "recentErrors": [...],
  "localStorage": {...}
}
```

### Analyse des données
1. **Taux d'erreur** : Pourcentage d'actions échouées
2. **Temps de traitement** : Durée moyenne des opérations
3. **Patterns d'erreurs** : Types d'erreurs les plus fréquents
4. **Utilisation** : Fréquence des détections de doublons

## Dépannage

### Problèmes courants

**Le panneau de débogage ne s'ouvre pas**
- Vérifiez que vous êtes en mode développement
- Vérifiez la console pour les erreurs JavaScript

**Aucun événement n'est loggé**
- Vérifiez que le service est initialisé
- Vérifiez `window.duplicateUploadDebugger` dans la console

**Les données ne persistent pas**
- Vérifiez que localStorage est disponible
- Vérifiez les quotas de stockage du navigateur

### Commandes de diagnostic

```javascript
// Vérifier l'état du debugger
console.log('Debugger available:', !!window.duplicateUploadDebugger);
console.log('Debug tools available:', !!window.debugDuplicateUpload);

// Vérifier les données stockées
console.log('Stored events:', localStorage.getItem('duplicateUploadDebugEvents'));
console.log('Stored errors:', localStorage.getItem('duplicateUploadDebugErrors'));

// Nettoyer les données
window.duplicateUploadDebugger?.clearDebugData();
```

## Tests

### Tests automatisés
- **Localisation :** `src/test/components/DuplicateUploadDebugger.test.tsx`
- **Exécution :** `npm run test DuplicateUploadDebugger`

### Tests manuels
- **Script :** `test-duplicate-upload-debugging.js`
- **Exécution :** Ouvrir dans la console du navigateur

### Scénarios de test
1. Upload d'un fichier en doublon
2. Actions utilisateur (replace, rename, cancel)
3. Erreurs de validation
4. Erreurs de rendu
5. Timeout de traitement

## Configuration

### Variables d'environnement
- **`NODE_ENV=development`** : Active le bouton de débogage
- **`REACT_APP_DEBUG_UPLOADS=true`** : Active le logging verbose (optionnel)

### Paramètres du debugger
```typescript
// Dans DuplicateUploadDebugger.ts
private maxEvents: number = 1000;  // Nombre max d'événements
private maxErrors: number = 100;   // Nombre max d'erreurs
private isEnabled: boolean = true; // Activer/désactiver le logging
```

## Intégration avec des services externes

Le système peut être étendu pour envoyer des données à des services de monitoring externes :

```typescript
// Dans DuplicateUploadDebugger.ts
private sendToMonitoring(error: DuplicateUploadError): void {
  if (process.env.NODE_ENV === 'production') {
    // Exemple : Sentry.captureException(error);
    // Exemple : LogRocket.captureException(error);
  }
}
```

## Bonnes pratiques

1. **Utilisez les hooks** pour l'intégration dans les composants
2. **Loggez les actions utilisateur** importantes
3. **Incluez du contexte** dans les logs d'erreur
4. **Exportez régulièrement** les données pour analyse
5. **Nettoyez les données** anciennes périodiquement
6. **Testez en conditions réelles** avec de vrais fichiers

## Support

Pour des questions ou des problèmes :
1. Consultez les logs de la console
2. Exportez les données de débogage
3. Vérifiez les tests automatisés
4. Utilisez les outils de diagnostic intégrés