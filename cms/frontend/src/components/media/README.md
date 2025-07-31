# Composants de Gestion des Médias

## DuplicateManager

Le composant `DuplicateManager` fournit une interface complète pour détecter et supprimer les doublons dans la médiathèque.

### Fonctionnalités

- **Détection automatique** : Analyse tous les médias pour identifier les doublons basés sur le nom original et la taille
- **Interface intuitive** : Affiche les groupes de doublons avec le fichier à conserver (plus récent) et les doublons à supprimer
- **Prévisualisation** : Permet de voir chaque fichier avant suppression
- **Suppression sécurisée** : Confirmation obligatoire avec détails du nombre de fichiers
- **Feedback détaillé** : Barre de progression et messages d'erreur spécifiques

### Intégration dans MediaPage

Le composant est intégré dans la barre d'outils principale de la MediaPage avec un layout horizontal optimisé :

```tsx
<div className="flex flex-wrap gap-2 mt-2">
  <DuplicateManager onDuplicatesDeleted={fetchMedia} />
  <Button variant="outline" size="sm">Synchroniser</Button>
  <Button variant="outline" size="sm">Régénérer miniatures</Button>
  {/* Autres boutons... */}
</div>
```

### Layout Amélioré

#### Avant (Problème)
- Boutons en navigation verticale avec `className="mt-2"`
- Layout incohérent qui sortait du cadre prédéfini
- Boutons de debug mélangés avec les fonctionnalités principales

#### Après (Solution)
- Layout horizontal avec `flex flex-wrap gap-2`
- Boutons de taille cohérente (`size="sm"`)
- Outils de développement séparés dans une section collapsible
- Interface plus propre et professionnelle

### Outils de Développement

Les outils de debug sont maintenant organisés dans une section séparée qui n'apparaît qu'en mode développement :

```tsx
{process.env.NODE_ENV === 'development' && (
  <details className="mt-4">
    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
      🔧 Outils de développement
    </summary>
    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
      {/* Boutons de debug... */}
    </div>
  </details>
)}
```

### APIs Utilisées

- `POST /media/detect-duplicates` - Détecte les doublons
- `DELETE /media/duplicates/delete` - Supprime les doublons en gardant le plus récent

### Tests

Le composant est entièrement testé avec :
- Tests unitaires pour `DuplicateManager`
- Tests d'intégration avec `MediaPage`
- Tests de layout et responsive design
- Tests des modes développement/production

### Utilisation

```tsx
import DuplicateManager from '@/components/media/DuplicateManager';

function MyMediaPage() {
  const handleDuplicatesDeleted = () => {
    // Rafraîchir la liste des médias
    fetchMedia();
  };

  return (
    <div>
      <DuplicateManager onDuplicatesDeleted={handleDuplicatesDeleted} />
    </div>
  );
}
```

### Sécurité

- Confirmation obligatoire avant suppression
- Messages d'avertissement clairs
- Boutons dangereux (suppression totale) uniquement en mode développement
- Validation côté serveur pour toutes les opérations