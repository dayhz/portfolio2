/**
 * Composants lazy loadés pour l'éditeur universel
 * Utilise le service de lazy loading intelligent
 */

import { lazyLoadService } from './services/LazyLoadService';
import { lazyWithFallback } from './utils/lazyLoad'; // Gardé pour compatibilité

// Enregistrer tous les composants avec leur priorité et préchargement
// Format: nom, chemin, priorité (0-100), précharger automatiquement

// Composants d'interface utilisateur
lazyLoadService.registerComponent('MediaGallery', 'components/MediaGallery', 70, true);
lazyLoadService.registerComponent('ContentPreview', 'components/ContentPreview', 60, false);
lazyLoadService.registerComponent('VersionHistoryPanel', 'components/VersionHistoryPanel', 40, false);
lazyLoadService.registerComponent('TemplateSelector', 'components/TemplateSelector', 50, false);
lazyLoadService.registerComponent('DynamicToolbar', 'components/DynamicToolbar', 90, true);
lazyLoadService.registerComponent('BlockSelectionManager', 'components/BlockSelectionManager', 90, true);
lazyLoadService.registerComponent('SaveStatusIndicator', 'components/SaveStatusIndicator', 80, true);
lazyLoadService.registerComponent('BlockMenu', 'BlockMenu', 85, true);

// NodeViews pour les différents types de blocs
lazyLoadService.registerComponent('ImageBlockView', 'nodeviews/ImageBlockView', 80, true);
lazyLoadService.registerComponent('VideoBlockView', 'nodeviews/VideoBlockView', 60, false);
lazyLoadService.registerComponent('ImageGridBlockView', 'nodeviews/ImageGridBlockView', 70, false);
lazyLoadService.registerComponent('TextBlockView', 'nodeviews/TextBlockView', 90, true);
lazyLoadService.registerComponent('TestimonyBlockView', 'nodeviews/TestimonyBlockView', 50, false);

// Extensions Tiptap
lazyLoadService.registerComponent('ImageExtension', 'extensions/ImageExtension', 80, true);
lazyLoadService.registerComponent('TextExtension', 'extensions/TextExtension', 90, true);
lazyLoadService.registerComponent('VideoExtension', 'extensions/VideoExtension', 60, false);
lazyLoadService.registerComponent('TestimonyExtension', 'extensions/TestimonyExtension', 50, false);
lazyLoadService.registerComponent('ImageGridExtension', 'extensions/ImageGridExtension', 70, false);
lazyLoadService.registerComponent('HeadingExtension', 'extensions/HeadingExtension', 85, true);

// Fallback simple pour les composants lazy loadés
const createFallback = (text: string) => {
  return {
    type: 'loading',
    text
  };
};

// Créer les composants lazy loadés avec le nouveau service
export const LazyMediaGallery = lazyLoadService.createLazyComponent<any>(
  'MediaGallery',
  createFallback('Chargement de la galerie de médias...')
);

export const LazyContentPreview = lazyLoadService.createLazyComponent<any>(
  'ContentPreview',
  createFallback('Chargement de la prévisualisation...')
);

export const LazyVersionHistoryPanel = lazyLoadService.createLazyComponent<any>(
  'VersionHistoryPanel',
  createFallback('Chargement de l\'historique des versions...')
);

export const LazyTemplateSelector = lazyLoadService.createLazyComponent<any>(
  'TemplateSelector',
  createFallback('Chargement du sélecteur de template...')
);

// NodeViews qui peuvent être lazy loadés
export const LazyImageBlockView = lazyLoadService.createLazyComponent<any>(
  'ImageBlockView',
  createFallback('Chargement du bloc image...')
);

export const LazyVideoBlockView = lazyLoadService.createLazyComponent<any>(
  'VideoBlockView',
  createFallback('Chargement du bloc vidéo...')
);

export const LazyImageGridBlockView = lazyLoadService.createLazyComponent<any>(
  'ImageGridBlockView',
  createFallback('Chargement de la grille d\'images...')
);

export const LazyTestimonyBlockView = lazyLoadService.createLazyComponent<any>(
  'TestimonyBlockView',
  createFallback('Chargement du témoignage...')
);

// Fonction pour précharger les composants fréquemment utilisés
export function preloadFrequentComponents() {
  // Utiliser le service de lazy loading pour précharger intelligemment
  lazyLoadService.preloadFrequentComponents();
}

// Fonction pour précharger les composants de NodeView
export function preloadNodeViews() {
  lazyLoadService.preloadComponents([
    'ImageBlockView',
    'TextBlockView',
    'VideoBlockView',
    'ImageGridBlockView'
  ]);
}

// Fonction pour précharger les composants en fonction du template
export function preloadTemplateComponents(templateType: string) {
  // Précharger les composants spécifiques au template
  switch (templateType) {
    case 'poesial':
      lazyLoadService.preloadComponents([
        'ImageBlockView',
        'TextBlockView',
        'ImageGridBlockView'
      ]);
      break;
    case 'zesty':
      lazyLoadService.preloadComponents([
        'ImageBlockView',
        'TextBlockView',
        'VideoBlockView'
      ]);
      break;
    case 'nobe':
      lazyLoadService.preloadComponents([
        'ImageBlockView',
        'TestimonyBlockView'
      ]);
      break;
    case 'ordine':
      lazyLoadService.preloadComponents([
        'ImageBlockView',
        'TextBlockView'
      ]);
      break;
    default:
      // Précharger les composants par défaut
      preloadFrequentComponents();
  }
}