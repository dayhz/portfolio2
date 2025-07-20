/**
 * Point d'entrée principal pour l'éditeur universel
 */

// Composants principaux
export { UniversalEditor } from './UniversalEditor';
export { BlockMenu } from './BlockMenu';

// Types et constantes
export * from './types';
export * from './constants';

// Utilitaires
export * from './utils';

// Services d'optimisation
export {
  initializeOptimizationServices,
  cleanupOptimizationServices,
  getOptimizationStats
} from './services';

// Hooks d'optimisation
export { useMemoryCleanup } from './hooks/useMemoryCleanup';
export { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
export { useExtensionLoader } from './hooks/useExtensionLoader';

// Composants d'optimisation
export { OptimizedImage } from './components/OptimizedImage';
export { PerformanceDiagnostics } from './components/PerformanceDiagnostics';

// Composants responsives
export { ResponsiveWrapper } from './components/ResponsiveWrapper';
export { TouchControls } from './components/TouchControls';
export { MobileEditor } from './components/MobileEditor';

// Extensions
export { ImageExtension } from './extensions/ImageExtension';
export { TextExtension } from './extensions/TextExtension';
export { TestimonyExtension } from './extensions/TestimonyExtension';
export { VideoExtension } from './extensions/VideoExtension';
export { ImageGridExtension } from './extensions/ImageGridExtension';
export { HeadingExtension } from './extensions/HeadingExtension';

// NodeViews
export { ImageBlockView } from './nodeviews/ImageBlockView';
export { TextBlockView } from './nodeviews/TextBlockView';
export { TestimonyBlockView } from './nodeviews/TestimonyBlockView';
export { VideoBlockView } from './nodeviews/VideoBlockView';
export { ImageGridBlockView } from './nodeviews/ImageGridBlockView';