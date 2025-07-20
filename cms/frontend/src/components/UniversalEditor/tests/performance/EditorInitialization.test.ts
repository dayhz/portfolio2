/**
 * Tests de performance pour l'initialisation de l'éditeur
 */

import { UniversalEditor } from '../../UniversalEditor';
import { createTestEditor } from '../utils/tiptapTestUtils';
import { 
  measurePerformance, 
  runPerformanceTest, 
  generateLargeContent,
  formatPerformanceResult
} from './performanceTestUtils';
import { MetricType } from '../../services/PerformanceMonitor';

describe('Editor Initialization Performance', () => {
  // Test d'initialisation avec un contenu vide
  test('Empty editor initialization performance', async () => {
    const result = await runPerformanceTest(
      'Empty Editor Initialization',
      () => createTestEditor([]),
      5,
      MetricType.INITIALIZATION
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
  });
  
  // Test d'initialisation avec un petit contenu
  test('Small content editor initialization performance', async () => {
    const smallContent = `
      <h1 class="universal-heading" data-level="1">Titre de test</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Paragraphe de test avec du texte <strong>en gras</strong> et <em>en italique</em>.</p>
          </div>
        </div>
      </section>
    `;
    
    const result = await runPerformanceTest(
      'Small Content Editor Initialization',
      () => createTestEditor([], smallContent),
      5,
      MetricType.INITIALIZATION
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
  });
  
  // Test d'initialisation avec un contenu moyen
  test('Medium content editor initialization performance', async () => {
    const mediumContent = generateLargeContent(20); // 20 blocs
    
    const result = await runPerformanceTest(
      'Medium Content Editor Initialization',
      () => createTestEditor([], mediumContent),
      3,
      MetricType.INITIALIZATION
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(3);
    expect(result.averageDuration).toBeGreaterThan(0);
  });
  
  // Test d'initialisation avec un contenu volumineux
  test('Large content editor initialization performance', async () => {
    const largeContent = generateLargeContent(50); // 50 blocs
    
    const result = await runPerformanceTest(
      'Large Content Editor Initialization',
      () => createTestEditor([], largeContent),
      2,
      MetricType.INITIALIZATION
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(2);
    expect(result.averageDuration).toBeGreaterThan(0);
  });
});