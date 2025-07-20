/**
 * Tests pour l'extension Heading
 */

import { HeadingExtension } from '../../extensions/HeadingExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  htmlContainsText,
  runCommand
} from '../utils/tiptapTestUtils';

describe('HeadingExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([HeadingExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the heading node type', () => {
    expect(editor.schema.nodes.heading).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'heading', { level: 1 });
    
    expect(isNodeType(node, 'heading')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      level: 1,
      textAlign: 'left'
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      level: 2,
      textAlign: 'center'
    };
    
    const node = createTestNode(editor, 'heading', attrs);
    
    expect(isNodeType(node, 'heading')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure for h1', () => {
    const attrs = {
      level: 1,
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'heading', attrs);
    const html = editor.schema.nodes.heading.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'h1')).toBe(true);
    expect(htmlContainsElement(html, 'h1.universal-heading')).toBe(true);
    expect(htmlContainsElement(html, 'h1[data-level="1"]')).toBe(true);
  });
  
  it('should render the correct HTML structure for h2', () => {
    const attrs = {
      level: 2,
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'heading', attrs);
    const html = editor.schema.nodes.heading.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'h2')).toBe(true);
    expect(htmlContainsElement(html, 'h2.universal-heading')).toBe(true);
    expect(htmlContainsElement(html, 'h2[data-level="2"]')).toBe(true);
  });
  
  it('should render the correct HTML structure for h3', () => {
    const attrs = {
      level: 3,
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'heading', attrs);
    const html = editor.schema.nodes.heading.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'h3')).toBe(true);
    expect(htmlContainsElement(html, 'h3.universal-heading')).toBe(true);
    expect(htmlContainsElement(html, 'h3[data-level="3"]')).toBe(true);
  });
  
  it('should apply text alignment', () => {
    const attrs = {
      level: 1,
      textAlign: 'center'
    };
    
    const node = createTestNode(editor, 'heading', attrs);
    const html = editor.schema.nodes.heading.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'h1[style*="text-align: center"]')).toBe(true);
  });
  
  it('should execute setHeading command', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre
    const html = runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    expect(htmlContainsElement(html, 'h1.universal-heading')).toBe(true);
    expect(htmlContainsText(html, 'Test heading')).toBe(true);
  });
  
  it('should toggle heading levels', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre niveau 1
    runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    // Basculer vers le niveau 2
    const html = runCommand(editor, chain => chain.toggleHeading({ level: 2 }));
    
    expect(htmlContainsElement(html, 'h2.universal-heading')).toBe(true);
    expect(htmlContainsText(html, 'Test heading')).toBe(true);
  });
  
  it('should toggle off heading', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre niveau 1
    runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    // Basculer le même niveau pour désactiver
    const html = runCommand(editor, chain => chain.toggleHeading({ level: 1 }));
    
    expect(htmlContainsElement(html, 'h1')).toBe(false);
    expect(htmlContainsElement(html, 'p')).toBe(true);
    expect(htmlContainsText(html, 'Test heading')).toBe(true);
  });
  
  it('should update heading attributes', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre niveau 1
    runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('heading', {
      level: 3,
      textAlign: 'right'
    }));
    
    expect(htmlContainsElement(html, 'h3.universal-heading')).toBe(true);
    expect(htmlContainsElement(html, 'h3[style*="text-align: right"]')).toBe(true);
    expect(htmlContainsText(html, 'Test heading')).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre niveau 1
    runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    // Sélectionner le titre
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('heading')).toBe(true);
    expect(editor.isActive('heading', { level: 1 })).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer du texte
    editor.commands.insertContent('Test heading');
    
    // Appliquer le titre niveau 1
    runCommand(editor, chain => chain.setHeading({ level: 1 }));
    
    // Sélectionner le titre
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer le titre
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('h1');
    expect(html).not.toContain('Test heading');
  });
});