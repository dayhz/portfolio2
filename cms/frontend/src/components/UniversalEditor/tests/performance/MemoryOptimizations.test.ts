/**
 * Tests de performance pour les optimisations de mémoire
 */

import { createTestEditor } from '../utils/tiptapTestUtils';
import { 
  measurePerformance, 
  runPerformanceTest, 
  generateLargeContent,
  formatPerformanceResult
} from './performanceTestUtils';
import { MetricType } from '../../services/PerformanceMonitor';
import { CacheService } from '../../services/CacheService';
import { MemoryManager } from '../../services/MemoryManager';
import { MediaOptimizationService } from '../../services/MediaOptimizationService';

// Mock des services
jest.mock('../../services/CacheService', () => ({
  CacheService: {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn().mockReturnValue(false),
    delete: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      entryCount: 0,
      totalSize: 0,
      maxSize: 1000000,
      usagePercentage: 0,
      entriesByType: {}
    })
  }
}));

jest.mock('../../services/MemoryManager', () => ({
  MemoryManager: {
    cleanup: jest.fn(),
    fullCleanup: jest.fn(),
    registerObjectUrl: jest.fn(),
    revokeObjectUrl: jest.fn(),
    registerEventListener: jest.fn(),
    removeEventListeners: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      objectUrlCount: 0,
      eventListenerGroups: 0,
      totalEventListeners: 0,
      isIdle: false,
      idleTime: 0
    })
  }
}));

jest.mock('../../services/MediaOptimizationService', () => ({
  MediaOptimizationService: {
    optimizeImage: jest.fn().mockImplementation((file) => Promise.resolve('mock-image-url')),
    preloadImage: jest.fn().mockImplementation((url) => Promise.resolve(url)),
    clearMediaCache: jest.fn()
  }
}));

describe('Memory Optimizations Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test des performances du cache
  test('Cache performance', async () => {
    // Créer des données de test
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      key: `key-${i}`,
      value: `value-${i}`.repeat(100), // Valeur de taille significative
      size: 1000
    }));
    
    const writeResult = await runPerformanceTest(
      'Cache Write Performance',
      () => {
        testData.forEach(({ key, value, size }) => {
          CacheService.set(key, value, size, 'other');
        });
        return true;
      },
      3,
      MetricType.CACHE
    );
    
    console.log(formatPerformanceResult(writeResult));
    expect(writeResult.measurements.length).toBe(3);
    expect(writeResult.averageDuration).toBeGreaterThan(0);
    
    const readResult = await runPerformanceTest(
      'Cache Read Performance',
      () => {
        testData.forEach(({ key }) => {
          CacheService.get(key);
        });
        return true;
      },
      3,
      MetricType.CACHE
    );
    
    console.log(formatPerformanceResult(readResult));
    expect(readResult.measurements.length).toBe(3);
    expect(readResult.averageDuration).toBeGreaterThan(0);
    
    const clearResult = await runPerformanceTest(
      'Cache Clear Performance',
      () => {
        CacheService.clear();
        return true;
      },
      3,
      MetricType.CACHE
    );
    
    console.log(formatPerformanceResult(clearResult));
    expect(clearResult.measurements.length).toBe(3);
    expect(clearResult.averageDuration).toBeGreaterThan(0);
  });
  
  // Test des performances du nettoyage mémoire
  test('Memory cleanup performance', async () => {
    // Créer des URL d'objets fictives
    const objectUrls = Array.from({ length: 100 }, (_, i) => `blob:http://localhost/${i}`);
    
    // Enregistrer les URL d'objets
    objectUrls.forEach(url => {
      MemoryManager.registerObjectUrl(url);
    });
    
    const cleanupResult = await runPerformanceTest(
      'Memory Cleanup Performance',
      () => {
        MemoryManager.cleanup(true);
        return true;
      },
      5,
      MetricType.MEMORY
    );
    
    console.log(formatPerformanceResult(cleanupResult));
    expect(cleanupResult.measurements.length).toBe(5);
    expect(cleanupResult.averageDuration).toBeGreaterThan(0);
    
    const fullCleanupResult = await runPerformanceTest(
      'Full Memory Cleanup Performance',
      () => {
        MemoryManager.fullCleanup();
        return true;
      },
      3,
      MetricType.MEMORY
    );
    
    console.log(formatPerformanceResult(fullCleanupResult));
    expect(fullCleanupResult.measurements.length).toBe(3);
    expect(fullCleanupResult.averageDuration).toBeGreaterThan(0);
  });
  
  // Test des performances d'optimisation d'image
  test('Image optimization performance', async () => {
    // Créer des fichiers image de test
    const testFiles = Array.from({ length: 5 }, (_, i) => 
      new File(['test image content'], `test-${i}.jpg`, { type: 'image/jpeg' })
    );
    
    const result = await runPerformanceTest(
      'Image Optimization Performance',
      async () => {
        const promises = testFiles.map(file => 
          MediaOptimizationService.optimizeImage(file)
        );
        
        await Promise.all(promises);
        return true;
      },
      3,
      MetricType.MEDIA
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(3);
    expect(result.averageDuration).toBeGreaterThan(0);
  });
  
  // Test des performances avec différentes tailles de contenu
  test('Editor memory usage with different content sizes', async () => {
    const contentSizes = [10, 30, 50]; // Nombre de blocs
    
    for (const size of contentSizes) {
      const content = generateLargeContent(size);
      
      const result = await runPerformanceTest(
        `Editor Memory Usage (${size} blocks)`,
        () => {
          const editor = createTestEditor([], content);
          const html = editor.getHTML();
          editor.destroy();
          return html;
        },
        2,
        MetricType.MEMORY
      );
      
      console.log(formatPerformanceResult(result));
      expect(result.measurements.length).toBe(2);
      expect(result.averageDuration).toBeGreaterThan(0);
    }
  });
});