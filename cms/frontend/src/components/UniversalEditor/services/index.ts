/**
 * Point d'entrée pour tous les services d'optimisation des performances
 */

import { lazyLoadService } from './LazyLoadService';

import { performanceMonitor } from './PerformanceMonitor';

import { cacheService } from './CacheService';

import { memoryManager } from './MemoryManager';

import { cacheService } from './CacheService';

import { memoryManager } from './MemoryManager';

import { mediaOptimizationService } from './MediaOptimizationService';

import { memoryManager } from './MemoryManager';

import { performanceMonitor } from './PerformanceMonitor';

// Exporter les services
export { cacheService, CacheEntryType } from './CacheService';
export { lazyLoadService } from './LazyLoadService';
export { mediaOptimizationService } from './MediaOptimizationService';
export { performanceMonitor, MetricType } from './PerformanceMonitor';
export { memoryManager } from './MemoryManager';
export { responsiveUIManager } from './ResponsiveUIManager';

// Exporter les hooks
export { useExtensionLoader } from '../hooks/useExtensionLoader';
export { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
export { useMemoryCleanup } from '../hooks/useMemoryCleanup';
export { useResponsive, BREAKPOINTS } from '../hooks/useResponsive';

// Exporter les utilitaires d'optimisation des renders
export {
  useDetectUnnecessaryRenders,
  useDebouncedCallback,
  useThrottledCallback,
  useDeepMemo,
  memoizeWithLRU
} from '../utils/renderOptimizer';

// Exporter les composants responsives
export { ResponsiveWrapper } from '../components/ResponsiveWrapper';
export { TouchControls } from '../components/TouchControls';
export { MobileEditor } from '../components/MobileEditor';

/**
 * Initialiser tous les services d'optimisation
 */
export function initializeOptimizationServices(): void {
  // Précharger les composants fréquemment utilisés
  import('../lazyComponents').then(({ preloadFrequentComponents }) => {
    preloadFrequentComponents();
  });
  
  // Activer le monitoring des performances
  performanceMonitor.setEnabled(true);
  
  // Activer la gestion automatique de la mémoire
  memoryManager.setEnabled(true);
  
  console.log('Services d\'optimisation initialisés');
}

/**
 * Nettoyer les ressources des services
 */
export function cleanupOptimizationServices(): void {
  // Nettoyer le cache des médias
  mediaOptimizationService.clearMediaCache();
  
  // Effectuer un nettoyage complet de la mémoire
  memoryManager.fullCleanup();
  
  // Nettoyer le cache
  cacheService.clear();
  
  console.log('Services d\'optimisation nettoyés');
}

/**
 * Obtenir les statistiques de performance et d'utilisation des ressources
 */
export function getOptimizationStats(): {
  memory: any;
  cache: any;
  performance: any;
  lazyLoading: any;
} {
  return {
    memory: memoryManager.getStats(),
    cache: cacheService.getStats(),
    performance: performanceMonitor.getPerformanceSummary(),
    lazyLoading: lazyLoadService.getStats()
  };
}