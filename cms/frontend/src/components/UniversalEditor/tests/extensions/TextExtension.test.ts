/**
 * Tests pour l'extension Text
 */

import { TextExtension } from '../../extensions/TextExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  htmlContainsText,
  runCommand
} from '../utils/tiptapTestUtils';

describe('TextExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([TextExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the universalText node type', () => {
    expect(editor.schema.nodes.universalText).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'universalText');
    
    expect(isNodeType(node, 'universalText')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      variant: 'rich',
      textAlign: 'left'
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      variant: 'simple',
      textAlign: 'center'
    };
    
    const node = createTestNode(editor, 'universalText', attrs);
    
    expect(isNodeType(node, 'universalText')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure for rich variant', () => {
    const attrs = {
      variant: 'rich',
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'universalText', attrs);
    const html = editor.schema.nodes.universalText.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-rich')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-color-dark')).toBe(true);
    expect(htmlContainsElement(html, 'div.w-richtext')).toBe(true);
  });
  
  it('should render the correct HTML structure for simple variant', () => {
    const attrs = {
      variant: 'simple',
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'universalText', attrs);
    const html = editor.schema.nodes.universalText.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-text')).toBe(true);
  });
  
  it('should render the correct HTML structure for about variant', () => {
    const attrs = {
      variant: 'about',
      textAlign: 'left'
    };
    
    const node = createTestNode(editor, 'universalText', attrs);
    const html = editor.schema.nodes.universalText.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-about_container')).toBe(true);
  });
  
  it('should apply text alignment', () => {
    const attrs = {
      variant: 'rich',
      textAlign: 'center'
    };
    
    const node = createTestNode(editor, 'universalText', attrs);
    const html = editor.schema.nodes.universalText.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'div[style*="text-align: center"]')).toBe(true);
  });
  
  it('should execute setUniversalText command', () => {
    const attrs = {
      variant: 'rich',
      textAlign: 'left'
    };
    
    const html = runCommand(editor, chain => chain.setUniversalText(attrs));
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-rich')).toBe(true);
  });
  
  it('should update text attributes', () => {
    // Insérer un bloc de texte
    runCommand(editor, chain => chain.setUniversalText({
      variant: 'rich',
      textAlign: 'left'
    }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('universalText', {
      variant: 'simple',
      textAlign: 'center'
    }));
    
    expect(htmlContainsElement(html, 'div.temp-comp-text')).toBe(true);
    expect(htmlContainsElement(html, 'div[style*="text-align: center"]')).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer un bloc de texte
    runCommand(editor, chain => chain.setUniversalText({
      variant: 'rich',
      textAlign: 'left'
    }));
    
    // Sélectionner le bloc de texte
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('universalText')).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer un bloc de texte
    runCommand(editor, chain => chain.setUniversalText({
      variant: 'rich',
      textAlign: 'left'
    }));
    
    // Sélectionner le bloc de texte
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer le bloc de texte
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('temp-rich');
  });
  
  it('should contain editable content', () => {
    // Insérer un bloc de texte avec contenu
    editor.commands.setContent('<section class="section"><div class="u-container"><div class="temp-rich u-color-dark w-richtext"><p>Test content</p></div></div></section>');
    
    expect(htmlContainsText(editor.getHTML(), 'Test content')).toBe(true);
  });
});