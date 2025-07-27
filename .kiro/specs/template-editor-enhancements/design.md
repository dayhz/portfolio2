# Design Document - Template Editor Enhancements

## Overview

Ce document décrit l'architecture et l'implémentation des 6 fonctionnalités avancées pour l'éditeur de template. L'approche privilégie la modularité et la réutilisabilité pour faciliter l'ajout de nouveaux templates et fonctionnalités.

## Architecture

### 1. Génération HTML Statique

```
TemplateExporter
├── HTMLGenerator
│   ├── generateHTML()
│   ├── inlineCSS()
│   └── processAssets()
├── AssetManager
│   ├── copyImages()
│   ├── optimizeVideos()
│   └── generateManifest()
└── ZipBuilder
    ├── createStructure()
    ├── addFiles()
    └── downloadZip()
```

**Composants clés :**
- `StaticExporter` : Service principal d'export
- `HTMLTemplateGenerator` : Génère le HTML à partir des données
- `AssetProcessor` : Gère les images/vidéos
- `ZipDownloader` : Crée et télécharge l'archive

### 2. Intégration Serveur

```
ServerIntegration
├── MediaUploadService
│   ├── uploadImage()
│   ├── uploadVideo()
│   └── deleteMedia()
├── ProjectSyncService
│   ├── saveToServer()
│   ├── loadFromServer()
│   └── syncChanges()
└── ErrorHandler
    ├── retryUpload()
    ├── showError()
    └── fallbackToLocal()
```

**Composants clés :**
- `MediaUploadService` : Gestion des uploads
- `ProjectPersistence` : Sauvegarde serveur
- `SyncManager` : Synchronisation local/serveur

### 3. SEO et Métadonnées

```
SEOManager
├── MetadataEditor
│   ├── editTitle()
│   ├── editDescription()
│   └── editKeywords()
├── OpenGraphGenerator
│   ├── generateOGTags()
│   ├── generateTwitterCards()
│   └── generateStructuredData()
└── SEOPreview
    ├── showGooglePreview()
    ├── showFacebookPreview()
    └── showTwitterPreview()
```

**Composants clés :**
- `SEOEditor` : Interface d'édition des métadonnées
- `MetaTagGenerator` : Génération des balises meta
- `SocialPreview` : Aperçu réseaux sociaux

### 4. Responsive Preview

```
ResponsivePreview
├── DeviceSimulator
│   ├── DesktopView (1920x1080)
│   ├── TabletView (768x1024)
│   └── MobileView (375x667)
├── ViewportController
│   ├── switchDevice()
│   ├── showDimensions()
│   └── simulateTouch()
└── ResponsiveAnalyzer
    ├── checkBreakpoints()
    ├── validateLayout()
    └── suggestImprovements()
```

**Composants clés :**
- `DevicePreview` : Simulation des devices
- `ResponsiveToolbar` : Contrôles de viewport
- `LayoutValidator` : Validation responsive

### 5. Thèmes Multiples

```
TemplateSystem
├── TemplateRegistry
│   ├── ZestyTemplate
│   ├── MinimalTemplate
│   ├── CorporateTemplate
│   └── CreativeTemplate
├── TemplateSelector
│   ├── showTemplates()
│   ├── previewTemplate()
│   └── switchTemplate()
└── TemplateAdapter
    ├── mapData()
    ├── validateStructure()
    └── migrateContent()
```

**Composants clés :**
- `TemplateManager` : Gestion des templates
- `TemplateFactory` : Création d'instances
- `DataMigrator` : Migration entre templates

### 6. Recherche Avancée

```
SearchSystem
├── SearchEngine
│   ├── indexProjects()
│   ├── searchText()
│   └── filterResults()
├── FilterManager
│   ├── ClientFilter
│   ├── YearFilter
│   ├── TypeFilter
│   └── ScopeFilter
└── SearchUI
    ├── SearchBar
    ├── FilterPanel
    └── ResultsList
```

**Composants clés :**
- `ProjectSearchEngine` : Moteur de recherche
- `AdvancedFilters` : Système de filtres
- `SearchInterface` : Interface utilisateur

## Components and Interfaces

### Core Interfaces

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  structure: TemplateStructure;
  renderer: React.ComponentType<any>;
  editor: React.ComponentType<any>;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: 'summary' | 'summary_large_image';
}

interface ExportOptions {
  includeAssets: boolean;
  optimizeImages: boolean;
  inlineCSS: boolean;
  generateSitemap: boolean;
  seoOptimized: boolean;
}

interface SearchFilters {
  text?: string;
  client?: string;
  year?: number;
  type?: string;
  scope?: string[];
  dateRange?: [Date, Date];
}
```

## Data Models

### Enhanced Project Data

```typescript
interface EnhancedProjectData extends ZestyProjectData {
  // Template system
  templateId: string;
  templateVersion: string;
  
  // SEO metadata
  seo: SEOMetadata;
  
  // Server integration
  serverId?: string;
  syncStatus: 'local' | 'synced' | 'pending' | 'error';
  
  // Export history
  exports: ExportRecord[];
  
  // Search metadata
  searchTags: string[];
  lastModified: Date;
}

interface ExportRecord {
  id: string;
  type: 'html' | 'json';
  createdAt: Date;
  size: number;
  downloadUrl?: string;
}
```

## Error Handling

### Upload Error Recovery
```typescript
class UploadErrorHandler {
  async handleUploadError(error: UploadError, file: File) {
    switch (error.type) {
      case 'network':
        return this.retryWithBackoff(file);
      case 'size':
        return this.compressAndRetry(file);
      case 'format':
        return this.showFormatError();
      default:
        return this.fallbackToLocal(file);
    }
  }
}
```

### Export Error Handling
```typescript
class ExportErrorHandler {
  async handleExportError(error: ExportError, project: ProjectData) {
    if (error.type === 'missing_assets') {
      return this.generateWithPlaceholders(project);
    }
    if (error.type === 'size_limit') {
      return this.compressAssets(project);
    }
    throw error;
  }
}
```

## Testing Strategy

### Unit Tests
- Chaque service doit avoir des tests unitaires
- Mock des appels serveur pour les tests
- Validation des formats d'export

### Integration Tests
- Test de l'upload complet d'images
- Test de génération HTML avec tous les assets
- Test de migration entre templates

### E2E Tests
- Parcours complet de création → export
- Test de recherche avec filtres multiples
- Test responsive sur différents viewports

## Performance Considerations

### Optimizations
- Lazy loading des templates non utilisés
- Cache des aperçus générés
- Compression automatique des images
- Debounce sur la recherche temps réel
- Virtual scrolling pour les grandes listes

### Memory Management
- Nettoyage des URLs d'objets temporaires
- Limitation du cache des aperçus
- Garbage collection des composants non montés