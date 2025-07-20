# Guide d'Installation et d'Intégration - Éditeur Universel Portfolio

Ce guide est destiné aux développeurs qui souhaitent intégrer l'Éditeur Universel Portfolio dans leurs projets. Il couvre l'installation, la configuration et l'utilisation programmatique de l'éditeur.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration de base](#configuration-de-base)
4. [Intégration React](#intégration-react)
5. [Personnalisation](#personnalisation)
6. [API et méthodes](#api-et-méthodes)
7. [Événements et hooks](#événements-et-hooks)
8. [Intégration avec le backend](#intégration-avec-le-backend)
9. [Optimisation pour la production](#optimisation-pour-la-production)
10. [Dépannage pour développeurs](#dépannage-pour-développeurs)

## Prérequis

Avant d'installer l'Éditeur Universel Portfolio, assurez-vous que votre environnement répond aux exigences suivantes :

- Node.js 14.0.0 ou supérieur
- npm 6.0.0 ou supérieur (ou yarn 1.22.0+)
- React 16.8.0 ou supérieur (l'éditeur utilise les hooks React)
- Navigateurs supportés : Chrome, Firefox, Safari, Edge (dernières versions)

## Installation

### Via npm

```bash
npm install @portfolio/universal-editor
```

### Via yarn

```bash
yarn add @portfolio/universal-editor
```

### Dépendances

L'installation inclut automatiquement les dépendances nécessaires, notamment :

- Tiptap et ses extensions
- React et React DOM (peer dependencies)
- Bibliothèques d'utilitaires

## Configuration de base

### Structure de fichiers recommandée

```
src/
├── components/
│   └── Editor/
│       ├── index.js        # Export du composant éditeur
│       ├── config.js       # Configuration de l'éditeur
│       └── templates/      # Templates personnalisés
├── services/
│   └── editorService.js    # Service pour gérer les données de l'éditeur
└── styles/
    └── editor/            # Styles personnalisés pour l'éditeur
```

### Configuration minimale

Créez un fichier de configuration pour l'éditeur :

```javascript
// src/components/Editor/config.js
export const editorConfig = {
  // Template par défaut
  defaultTemplate: 'poesial',
  
  // Templates disponibles
  availableTemplates: ['poesial', 'zesty', 'nobe', 'ordine'],
  
  // Configuration des médias
  media: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    uploadEndpoint: '/api/media/upload'
  },
  
  // Configuration de sauvegarde
  autosave: {
    enabled: true,
    interval: 30000, // 30 secondes
    endpoint: '/api/content/save'
  }
};
```

## Intégration React

### Composant de base

```jsx
// src/components/Editor/index.js
import React, { useState } from 'react';
import { UniversalEditor } from '@portfolio/universal-editor';
import { editorConfig } from './config';

// Importation des styles
import '@portfolio/universal-editor/dist/styles.css';

const Editor = ({ initialContent, projectId, onSave }) => {
  const [content, setContent] = useState(initialContent || '');
  
  const handleChange = (newContent) => {
    setContent(newContent);
  };
  
  const handleSave = async () => {
    if (onSave) {
      await onSave(content);
    }
  };
  
  return (
    <UniversalEditor
      content={content}
      onChange={handleChange}
      onSave={handleSave}
      projectId={projectId}
      config={editorConfig}
    />
  );
};

export default Editor;
```

### Utilisation dans une page

```jsx
// src/pages/ProjectPage.js
import React, { useEffect, useState } from 'react';
import Editor from '../components/Editor';
import { fetchProjectContent, saveProjectContent } from '../services/projectService';

const ProjectPage = ({ match }) => {
  const projectId = match.params.id;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const projectContent = await fetchProjectContent(projectId);
        setContent(projectContent);
      } catch (error) {
        console.error('Failed to load project content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [projectId]);
  
  const handleSave = async (newContent) => {
    try {
      await saveProjectContent(projectId, newContent);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content. Please try again.');
    }
  };
  
  if (loading) {
    return <div>Loading editor...</div>;
  }
  
  return (
    <div className="project-page">
      <h1>Edit Project</h1>
      <Editor
        initialContent={content}
        projectId={projectId}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProjectPage;
```

## Personnalisation

### Templates personnalisés

Vous pouvez créer des templates personnalisés pour l'éditeur :

```javascript
// src/components/Editor/templates/customTemplate.js
export const customTemplate = {
  name: 'customTemplate',
  label: 'Custom Template',
  
  // Styles CSS à injecter
  styles: `
    .custom-template .heading {
      font-family: 'Your-Font', sans-serif;
      color: #3a3a3a;
    }
    
    .custom-template .paragraph {
      font-family: 'Your-Body-Font', serif;
      line-height: 1.6;
    }
  `,
  
  // Structure HTML de base
  baseStructure: {
    container: 'section',
    containerClass: 'custom-template-section',
    innerContainer: 'div',
    innerContainerClass: 'custom-template-container'
  },
  
  // Configuration des blocs
  blocks: {
    heading: {
      tagName: 'h2',
      className: 'custom-heading',
      variants: {
        h1: { className: 'heading-large' },
        h2: { className: 'heading-medium' },
        h3: { className: 'heading-small' }
      }
    },
    paragraph: {
      tagName: 'p',
      className: 'custom-paragraph'
    },
    // Autres configurations de blocs...
  }
};
```

Ensuite, enregistrez votre template personnalisé :

```javascript
// src/components/Editor/config.js
import { customTemplate } from './templates/customTemplate';

export const editorConfig = {
  // ...autres configurations
  
  // Ajouter le template personnalisé
  templates: {
    custom: customTemplate
  },
  
  // Inclure dans les templates disponibles
  availableTemplates: ['poesial', 'zesty', 'nobe', 'ordine', 'custom']
};
```

### Extensions personnalisées

Vous pouvez créer des extensions personnalisées pour ajouter de nouveaux types de blocs :

```javascript
// src/components/Editor/extensions/CustomBlock.js
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CustomBlockView from '../components/CustomBlockView';

export const CustomBlock = Node.create({
  name: 'customBlock',
  
  group: 'block',
  content: 'inline*',
  
  addAttributes() {
    return {
      variant: {
        default: 'default'
      },
      customData: {
        default: {}
      }
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-block"]'
      }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-block', ...HTMLAttributes }, 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CustomBlockView);
  }
});
```

Créez ensuite le composant React pour le rendu :

```jsx
// src/components/Editor/components/CustomBlockView.jsx
import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const CustomBlockView = ({ node, updateAttributes, selected }) => {
  const { variant, customData } = node.attrs;
  
  const handleVariantChange = (newVariant) => {
    updateAttributes({ variant: newVariant });
  };
  
  return (
    <NodeViewWrapper className={`custom-block ${variant} ${selected ? 'selected' : ''}`}>
      <div className="custom-block-content">
        {/* Contenu du bloc personnalisé */}
      </div>
      
      {selected && (
        <div className="custom-block-controls">
          <select 
            value={variant} 
            onChange={(e) => handleVariantChange(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="variant1">Variant 1</option>
            <option value="variant2">Variant 2</option>
          </select>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default CustomBlockView;
```

Enfin, enregistrez l'extension dans la configuration :

```javascript
// src/components/Editor/config.js
import { CustomBlock } from './extensions/CustomBlock';

export const editorConfig = {
  // ...autres configurations
  
  // Ajouter l'extension personnalisée
  extensions: [
    CustomBlock
  ]
};
```

## API et méthodes

L'Éditeur Universel Portfolio expose plusieurs méthodes et propriétés que vous pouvez utiliser programmatiquement.

### Référence à l'éditeur

```jsx
import React, { useRef } from 'react';
import { UniversalEditor } from '@portfolio/universal-editor';

const EditorWithRef = () => {
  const editorRef = useRef(null);
  
  const handleGetContent = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.getHTML();
      const jsonContent = editorRef.current.getJSON();
      
      console.log('HTML Content:', htmlContent);
      console.log('JSON Content:', jsonContent);
    }
  };
  
  const handleInsertContent = () => {
    if (editorRef.current) {
      editorRef.current.insertContent('<h2>Nouveau titre inséré</h2>');
    }
  };
  
  return (
    <div>
      <UniversalEditor
        ref={editorRef}
        content=""
        onChange={() => {}}
      />
      
      <button onClick={handleGetContent}>
        Get Content
      </button>
      
      <button onClick={handleInsertContent}>
        Insert Content
      </button>
    </div>
  );
};
```

### Méthodes principales

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getHTML()` | Récupère le contenu au format HTML | - | `string` |
| `getJSON()` | Récupère le contenu au format JSON | - | `object` |
| `setContent(content)` | Définit le contenu de l'éditeur | `content`: string (HTML) ou object (JSON) | - |
| `insertContent(content)` | Insère du contenu à la position actuelle | `content`: string (HTML) | - |
| `focus()` | Place le focus sur l'éditeur | - | - |
| `blur()` | Retire le focus de l'éditeur | - | - |
| `undo()` | Annule la dernière action | - | - |
| `redo()` | Rétablit la dernière action annulée | - | - |
| `exportContent(format)` | Exporte le contenu dans le format spécifié | `format`: 'html', 'json', 'text' | `Promise<string\|object>` |
| `saveVersion(label)` | Sauvegarde une version étiquetée | `label`: string (optionnel) | `Promise<object>` |
| `getVersions()` | Récupère l'historique des versions | - | `Promise<array>` |
| `restoreVersion(versionId)` | Restaure une version spécifique | `versionId`: string | `Promise<boolean>` |

## Événements et hooks

L'éditeur émet plusieurs événements que vous pouvez écouter pour réagir aux actions de l'utilisateur.

### Événements disponibles

```jsx
import React from 'react';
import { UniversalEditor } from '@portfolio/universal-editor';

const EditorWithEvents = () => {
  const handleUpdate = ({ editor }) => {
    console.log('Content updated:', editor.getHTML());
  };
  
  const handleSelectionUpdate = ({ editor }) => {
    console.log('Selection changed:', editor.isActive('bold') ? 'Text is bold' : 'Text is not bold');
  };
  
  const handleTransaction = ({ editor, transaction }) => {
    console.log('Transaction applied:', transaction);
  };
  
  const handleFocus = ({ editor, event }) => {
    console.log('Editor focused');
  };
  
  const handleBlur = ({ editor, event }) => {
    console.log('Editor blurred');
  };
  
  return (
    <UniversalEditor
      content=""
      onChange={() => {}}
      onUpdate={handleUpdate}
      onSelectionUpdate={handleSelectionUpdate}
      onTransaction={handleTransaction}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};
```

### Hooks personnalisés

L'éditeur fournit plusieurs hooks React pour faciliter l'intégration :

```jsx
import React from 'react';
import { 
  useEditor, 
  useEditorContent, 
  useVersionHistory,
  useMediaManager
} from '@portfolio/universal-editor';

const EditorWithHooks = ({ initialContent }) => {
  // Hook principal pour créer une instance d'éditeur
  const editor = useEditor({
    content: initialContent,
    onUpdate: ({ editor }) => {
      console.log('Content updated:', editor.getHTML());
    }
  });
  
  // Hook pour accéder au contenu actuel
  const content = useEditorContent(editor);
  
  // Hook pour gérer l'historique des versions
  const { 
    versions, 
    saveVersion, 
    restoreVersion,
    isLoading 
  } = useVersionHistory(editor);
  
  // Hook pour gérer les médias
  const { 
    uploadMedia, 
    mediaItems, 
    deleteMedia 
  } = useMediaManager(editor);
  
  const handleSaveVersion = () => {
    saveVersion('Version importante');
  };
  
  const handleUploadImage = async (file) => {
    try {
      const media = await uploadMedia(file);
      editor.chain().focus().setImage({ src: media.url }).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };
  
  return (
    <div>
      {/* Rendu de l'éditeur */}
      {editor && <div>{/* Composants d'éditeur */}</div>}
      
      {/* Contrôles personnalisés */}
      <button onClick={handleSaveVersion}>
        Save Version
      </button>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => handleUploadImage(e.target.files[0])} 
      />
      
      {/* Affichage des versions */}
      {isLoading ? (
        <p>Loading versions...</p>
      ) : (
        <ul>
          {versions.map(version => (
            <li key={version.id}>
              {version.label || version.id}
              <button onClick={() => restoreVersion(version.id)}>
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Intégration avec le backend

### Configuration des endpoints

```javascript
// src/services/editorService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const editorService = {
  // Chargement du contenu
  loadContent: async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/content`);
      return response.data.content;
    } catch (error) {
      console.error('Failed to load content:', error);
      throw error;
    }
  },
  
  // Sauvegarde du contenu
  saveContent: async (projectId, content) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/content`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save content:', error);
      throw error;
    }
  },
  
  // Upload de médias
  uploadMedia: async (projectId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      const response = await axios.post(`${API_BASE_URL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  },
  
  // Gestion des versions
  getVersions: async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/versions`);
      return response.data.versions;
    } catch (error) {
      console.error('Failed to get versions:', error);
      throw error;
    }
  },
  
  saveVersion: async (projectId, content, label = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/versions`, {
        content,
        label
      });
      return response.data.version;
    } catch (error) {
      console.error('Failed to save version:', error);
      throw error;
    }
  },
  
  restoreVersion: async (projectId, versionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/versions/${versionId}/restore`);
      return response.data.content;
    } catch (error) {
      console.error('Failed to restore version:', error);
      throw error;
    }
  }
};
```

### Intégration avec le service

```jsx
// src/components/Editor/index.js
import React, { useState, useEffect } from 'react';
import { UniversalEditor } from '@portfolio/universal-editor';
import { editorService } from '../../services/editorService';
import { editorConfig } from './config';

const Editor = ({ projectId }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const projectContent = await editorService.loadContent(projectId);
        setContent(projectContent);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [projectId]);
  
  const handleChange = (newContent) => {
    setContent(newContent);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await editorService.saveContent(projectId, content);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleMediaUpload = async (file) => {
    try {
      const result = await editorService.uploadMedia(projectId, file);
      return result.url;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  };
  
  if (loading) {
    return <div>Loading editor...</div>;
  }
  
  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <UniversalEditor
        content={content}
        onChange={handleChange}
        onSave={handleSave}
        projectId={projectId}
        config={{
          ...editorConfig,
          media: {
            ...editorConfig.media,
            uploadHandler: handleMediaUpload
          }
        }}
      />
    </div>
  );
};

export default Editor;
```

## Optimisation pour la production

### Code splitting

Pour réduire la taille du bundle initial, utilisez le code splitting :

```jsx
// src/components/Editor/index.js
import React, { lazy, Suspense } from 'react';

// Chargement paresseux de l'éditeur
const UniversalEditorLazy = lazy(() => import('@portfolio/universal-editor').then(module => ({
  default: module.UniversalEditor
})));

const Editor = (props) => {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <UniversalEditorLazy {...props} />
    </Suspense>
  );
};

export default Editor;
```

### Optimisation des performances

```javascript
// src/components/Editor/config.js
export const editorConfig = {
  // ...autres configurations
  
  // Optimisations de performance
  performance: {
    // Désactiver certaines fonctionnalités lourdes
    disableHistory: false,
    disableCollaborationFeatures: true,
    
    // Limiter la taille de l'historique
    historyDepth: 100,
    
    // Optimiser le rendu
    debounceUpdates: true,
    updateDebounceTime: 150,
    
    // Optimiser les médias
    lazyLoadImages: true,
    optimizeImagesOnUpload: true,
    
    // Optimiser le DOM
    useVirtualization: true,
    maxRenderDepth: 10
  }
};
```

### Préchargement des ressources

```jsx
// src/App.js
import React, { useEffect } from 'react';
import { preloadEditorResources } from '@portfolio/universal-editor';

const App = () => {
  useEffect(() => {
    // Précharger les ressources de l'éditeur en arrière-plan
    preloadEditorResources();
  }, []);
  
  return (
    // Votre application
  );
};
```

## Dépannage pour développeurs

### Logs de débogage

Activez les logs de débogage pour identifier les problèmes :

```javascript
// src/components/Editor/config.js
export const editorConfig = {
  // ...autres configurations
  
  debug: {
    enabled: true,
    level: 'verbose', // 'error', 'warn', 'info', 'verbose', 'debug'
    logToConsole: true,
    logToFile: false
  }
};
```

### Outils de développement

L'éditeur inclut des outils de développement que vous pouvez activer :

```jsx
// src/components/Editor/index.js
import React from 'react';
import { UniversalEditor, EditorDevTools } from '@portfolio/universal-editor';

const EditorWithDevTools = (props) => {
  return (
    <>
      <UniversalEditor {...props} />
      {process.env.NODE_ENV === 'development' && <EditorDevTools />}
    </>
  );
};

export default EditorWithDevTools;
```

### Résolution des problèmes courants

#### L'éditeur ne se charge pas

Vérifiez :
- Les erreurs dans la console du navigateur
- Les versions des dépendances (React, etc.)
- Les conflits CSS potentiels

#### Problèmes de style

Si les styles ne s'appliquent pas correctement :

```jsx
// Assurez-vous d'importer les styles
import '@portfolio/universal-editor/dist/styles.css';

// Si vous utilisez CSS Modules ou d'autres systèmes de style
// qui peuvent interférer, utilisez l'option noConflict
<UniversalEditor
  {...props}
  config={{
    ...editorConfig,
    styles: {
      noConflict: true,
      prefix: 'ue-'
    }
  }}
/>
```

#### Problèmes de performance

Si l'éditeur est lent :

```jsx
<UniversalEditor
  {...props}
  config={{
    ...editorConfig,
    performance: {
      disableHistory: false,
      disableCollaborationFeatures: true,
      debounceUpdates: true,
      updateDebounceTime: 200,
      lazyLoadImages: true,
      useVirtualization: true
    }
  }}
/>
```

---

Ce guide d'intégration couvre les aspects essentiels pour intégrer l'Éditeur Universel Portfolio dans vos projets. Pour une documentation plus détaillée sur l'API et les fonctionnalités avancées, consultez la documentation complète sur [lien vers la documentation].