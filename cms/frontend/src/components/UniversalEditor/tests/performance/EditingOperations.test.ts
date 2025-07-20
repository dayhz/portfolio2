/**
 * Tests de performance pour les opérations d'édition
 */

import { createTestEditor } from '../utils/tiptapTestUtils';
import { 
  measurePerformance, 
  runPerformanceTest, 
  generateLargeContent,
  formatPerformanceResult
} from './performanceTestUtils';
import { MetricType } from '../../services/PerformanceMonitor';

describe('Editing Operations Performance', () => {
  // Test d'insertion de texte
  test('Text insertion performance', async () => {
    const editor = createTestEditor();
    editor.commands.setContent('<p>Contenu initial</p>');
    
    const result = await runPerformanceTest(
      'Text Insertion',
      () => {
        // Insérer 1000 caractères
        const text = 'a'.repeat(1000);
        editor.commands.insertContent(text);
        return true;
      },
      5,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
  
  // Test de formatage de texte
  test('Text formatting performance', async () => {
    const editor = createTestEditor();
    editor.commands.setContent('<p>Contenu à formater</p>');
    
    // Sélectionner tout le texte
    editor.commands.selectAll();
    
    const result = await runPerformanceTest(
      'Text Formatting',
      () => {
        editor.commands.toggleBold();
        return true;
      },
      10,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(10);
    expect(result.averageDuration).toBeGreaterThan(0);
    
    const multipleFormattingResult = await runPerformanceTest(
      'Multiple Formatting Operations',
      () => {
        editor.commands.toggleBold();
        editor.commands.toggleItalic();
        editor.commands.toggleUnderline();
        return true;
      },
      5,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(multipleFormattingResult));
    expect(multipleFormattingResult.measurements.length).toBe(5);
    expect(multipleFormattingResult.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
  
  // Test de suppression de contenu
  test('Content deletion performance', async () => {
    const editor = createTestEditor();
    const largeContent = generateLargeContent(30); // 30 blocs
    editor.commands.setContent(largeContent);
    
    const result = await runPerformanceTest(
      'Content Deletion',
      () => {
        // Sélectionner une partie du contenu
        editor.commands.setTextSelection({ from: 10, to: 100 });
        
        // Supprimer la sélection
        editor.commands.deleteSelection();
        return true;
      },
      5,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(result));
    expect(result.measurements.length).toBe(5);
    expect(result.averageDuration).toBeGreaterThan(0);
    
    const largeDeleteResult = await runPerformanceTest(
      'Large Content Deletion',
      () => {
        // Sélectionner une grande partie du contenu
        editor.commands.setTextSelection({ from: 0, to: editor.state.doc.content.size / 2 });
        
        // Supprimer la sélection
        editor.commands.deleteSelection();
        return true;
      },
      3,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(largeDeleteResult));
    expect(largeDeleteResult.measurements.length).toBe(3);
    expect(largeDeleteResult.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
  
  // Test d'opérations undo/redo
  test('Undo/redo performance', async () => {
    // Créer un éditeur avec l'extension d'historique
    const editor = createTestEditor([
      require('@tiptap/extension-history').default.configure({
        depth: 100,
        newGroupDelay: 500
      })
    ]);
    
    editor.commands.setContent('<p>Contenu initial</p>');
    
    // Effectuer plusieurs modifications
    for (let i = 0; i < 20; i++) {
      editor.commands.insertContent(`Modification ${i}. `);
    }
    
    const undoResult = await runPerformanceTest(
      'Undo Performance',
      () => {
        // Annuler une modification
        editor.commands.undo();
        return true;
      },
      20,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(undoResult));
    expect(undoResult.measurements.length).toBe(20);
    expect(undoResult.averageDuration).toBeGreaterThan(0);
    
    const redoResult = await runPerformanceTest(
      'Redo Performance',
      () => {
        // Rétablir une modification
        editor.commands.redo();
        return true;
      },
      20,
      MetricType.EDIT
    );
    
    console.log(formatPerformanceResult(redoResult));
    expect(redoResult.measurements.length).toBe(20);
    expect(redoResult.averageDuration).toBeGreaterThan(0);
    
    editor.destroy();
  });
});