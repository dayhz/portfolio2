/**
 * Utilitaires pour les tests de performance
 */

import { Editor } from '@tiptap/core';
import { createTestEditor } from '../utils/tiptapTestUtils';
import { performanceMonitor, MetricType } from '../../services/PerformanceMonitor';

/**
 * Interface pour les résultats de mesure de performance
 */
export interface PerformanceMeasurement {
  name: string;
  duration: number;
  type: MetricType;
  component?: string;
  details?: Record<string, any>;
}

/**
 * Interface pour les résultats de test de performance
 */
export interface PerformanceTestResult {
  name: string;
  measurements: PerformanceMeasurement[];
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  memoryUsage?: number;
}

/**
 * Mesure le temps d'exécution d'une fonction
 * @param name Nom de la mesure
 * @param fn Fonction à mesurer
 * @param type Type de métrique
 * @param component Composant concerné
 * @param details Détails supplémentaires
 * @returns Résultat de la fonction et durée d'exécution
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  type: MetricType = MetricType.RENDER,
  component?: string,
  details?: Record<string, any>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    // Enregistrer la métrique
    performanceMonitor.addMetric({
      type,
      value: duration,
      timestamp: Date.now(),
      component,
      details: {
        ...details,
        name
      }
    });
    
    return { result, duration };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    // Enregistrer la métrique d'erreur
    performanceMonitor.addMetric({
      type,
      value: duration,
      timestamp: Date.now(),
      component,
      details: {
        ...details,
        name,
        error: true,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
    
    throw error;
  }
}

/**
 * Exécute une fonction plusieurs fois et mesure les performances
 * @param name Nom du test
 * @param fn Fonction à mesurer
 * @param iterations Nombre d'itérations
 * @param type Type de métrique
 * @param component Composant concerné
 * @param details Détails supplémentaires
 * @returns Résultat du test de performance
 */
export async function runPerformanceTest<T>(
  name: string,
  fn: () => T | Promise<T>,
  iterations: number = 10,
  type: MetricType = MetricType.RENDER,
  component?: string,
  details?: Record<string, any>
): Promise<PerformanceTestResult> {
  const measurements: PerformanceMeasurement[] = [];
  let totalDuration = 0;
  let minDuration = Number.MAX_VALUE;
  let maxDuration = 0;
  
  for (let i = 0; i < iterations; i++) {
    const { duration } = await measurePerformance(
      `${name} (iteration ${i + 1})`,
      fn,
      type,
      component,
      {
        ...details,
        iteration: i + 1,
        totalIterations: iterations
      }
    );
    
    measurements.push({
      name: `${name} (iteration ${i + 1})`,
      duration,
      type,
      component,
      details: {
        ...details,
        iteration: i + 1,
        totalIterations: iterations
      }
    });
    
    totalDuration += duration;
    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
  }
  
  const averageDuration = totalDuration / iterations;
  
  // Obtenir l'utilisation de la mémoire si disponible
  let memoryUsage: number | undefined;
  if (performance && 'memory' in performance) {
    memoryUsage = (performance as any).memory?.usedJSHeapSize;
  }
  
  return {
    name,
    measurements,
    averageDuration,
    minDuration,
    maxDuration,
    totalDuration,
    memoryUsage
  };
}

/**
 * Génère un contenu volumineux pour les tests de performance
 * @param blockCount Nombre de blocs à générer
 * @returns Contenu HTML
 */
export function generateLargeContent(blockCount: number = 100): string {
  let content = '';
  
  // Ajouter un titre
  content += '<h1 class="universal-heading" data-level="1">Document volumineux pour test de performance</h1>';
  
  // Générer des blocs de contenu
  for (let i = 0; i < blockCount; i++) {
    const blockType = i % 5; // 5 types de blocs différents
    
    switch (blockType) {
      case 0: // Titre
        const level = (i % 3) + 1; // H1, H2 ou H3
        content += `<h${level} class="universal-heading" data-level="${level}">Titre de section ${i}</h${level}>`;
        break;
      
      case 1: // Texte riche
        content += `
          <section class="section">
            <div class="u-container">
              <div class="temp-rich u-color-dark w-richtext">
                <p>Paragraphe ${i} avec du texte. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                <p>Deuxième paragraphe avec du <strong>texte en gras</strong> et du <em>texte en italique</em>. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.</p>
              </div>
            </div>
          </section>
        `;
        break;
      
      case 2: // Image
        content += `
          <section class="section">
            <div class="u-container">
              <div class="temp-img_container">
                <div class="temp-img">
                  <div class="img-wrp">
                    <img src="https://picsum.photos/800/600?random=${i}" alt="Image ${i}" class="comp-img" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        `;
        break;
      
      case 3: // Témoignage
        content += `
          <section class="section">
            <div class="u-container">
              <div class="temp-comp-testimony">
                <div class="testimony">Citation de test numéro ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                <div class="author">Auteur Test ${i}</div>
                <div class="role">Rôle Test ${i}</div>
              </div>
            </div>
          </section>
        `;
        break;
      
      case 4: // Grille d'images
        content += `
          <section class="section">
            <div class="u-container">
              <div class="temp-comp-img_grid" style="grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                <div class="img_grid-container">
                  <div class="img-wrp">
                    <img src="https://picsum.photos/800/600?random=${i}a" alt="Image grille ${i}a" class="comp-img" />
                  </div>
                </div>
                <div class="img_grid-container">
                  <div class="img-wrp">
                    <img src="https://picsum.photos/800/600?random=${i}b" alt="Image grille ${i}b" class="comp-img" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        `;
        break;
    }
  }
  
  return content;
}

/**
 * Crée un éditeur avec un contenu volumineux pour les tests de performance
 * @param blockCount Nombre de blocs à générer
 * @param extensions Extensions supplémentaires
 * @returns Éditeur avec contenu volumineux
 */
export function createLargeEditor(
  blockCount: number = 100,
  extensions: any[] = []
): ReturnType<typeof createTestEditor> {
  const content = generateLargeContent(blockCount);
  return createTestEditor(extensions, content);
}

/**
 * Formate les résultats de performance pour l'affichage
 * @param result Résultat du test de performance
 * @returns Chaîne formatée
 */
export function formatPerformanceResult(result: PerformanceTestResult): string {
  let output = `\n=== Test de performance: ${result.name} ===\n`;
  output += `Durée moyenne: ${result.averageDuration.toFixed(2)} ms\n`;
  output += `Durée minimale: ${result.minDuration.toFixed(2)} ms\n`;
  output += `Durée maximale: ${result.maxDuration.toFixed(2)} ms\n`;
  output += `Durée totale: ${result.totalDuration.toFixed(2)} ms\n`;
  
  if (result.memoryUsage !== undefined) {
    const memoryInMB = result.memoryUsage / (1024 * 1024);
    output += `Utilisation mémoire: ${memoryInMB.toFixed(2)} MB\n`;
  }
  
  return output;
}