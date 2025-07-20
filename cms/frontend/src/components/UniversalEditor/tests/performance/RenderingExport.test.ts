/**
 * Tests de performance pour le rendu et l'export
 */

import { createTestEditor } from '../utils/tiptapTestUtils';
import { 
  measurePerformance, 
  runPerformanceTest, 
  generateLargeContent,
  formatPerformanceResult
} from './performanceTestUtils';
import { MetricType } from '../../services/PerformanceMonitor';

// Mock des services d'export
jest.mock('../../services/ContentExportService', () => ({
  ContentExportService: {
    exportContent: jest.fn().mockImplementation((content) => content),
    validateContent: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    integrateWithTemplate: jest.fn().mockImplementation((content) => content)
  }
}));

describe('Rendering and Export Performance', () => {
  // Test de rendu avec différentes tailles de contenu
  test('Rendering performance with different content sizes', async () => {
    const contentSizes = [10, 30, 50]; // Nombre de blocs
    
    for (const size of contentSizes) {
      const content = generateLargeContent(size);
      
      const result = await runPerformanceTest(
        `Rendering ${size} blocks`,
        () => {
          const editor = createTestEditor([], content);
          const html = editor.view.dom.innerHTML;
          editor.destroy();
          return html;
        },
        3,
        MetricType.RENDER
      );
      
      console.log(formatPerformanceResult(result));
      expect(result.measurements.length).toBe(3);
      expect(result.averageDuration).toBeGreaterThan(0);
    }
  });
  
  // Test d'export HTML
  test('HTML export performance', async () => {
    const editor = createTestEditor();
    const largeContent = generateLargeContent(50); // 50 blocs
    editor.commands.setContent(largeContent);
    
    const result = await runPerformanceTest(
      'HTML Export',
      () => {
        return editor.getHTML();
      },
      5,
      MetricType.EXPORT
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
  
  // Test d'export JSON
  test('JSON export performance', async () => {
    const editor = createTestEditor();
    const largeContent = generateLargeContent(50); // 50 blocs
    editor.commands.setContent(largeContent);
    
    const result = await runPerformanceTest(
      'JSON Export',
      () => {
        return editor.getJSON();
      },
      5,
      MetricType.EXPORT
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
  
  // Test de validation de contenu
  test('Content validation performance', async () => {
    const editor = createTestEditor();
    
    // Tester différentes tailles de contenu
    const contentSizes = [10, 30, 50]; // Nombre de blocs
    
    for (const size of contentSizes) {
      const content = generateLargeContent(size);
      editor.commands.setContent(content);
      
      const result = await runPerformanceTest(
        `Content Validation (${size} blocks)`,
        () => {
          // Simuler la validation du contenu
          const html = editor.getHTML();
          
          // Vérifier la présence de balises obligatoires
          const hasHeadings = html.includes('<h1') || html.includes('<h2') || html.includes('<h3');
          const hasImages = html.includes('<img');
          const hasText = html.includes('<p>');
          
          return { isValid: hasHeadings && hasText, html };
        },
        3,
        MetricType.VALIDATION
      );
      
      console.log(formatPerformanceResult(result));
      expect(result.measurements.length).toBe(3);
      expect(result.averageDuration).toBeGreaterThan(0);
    }
    
    editor.destroy();
  });
});