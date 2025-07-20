/**
 * Tests pour l'extension Testimony
 */

import { TestimonyExtension } from '../../extensions/TestimonyExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  htmlContainsText,
  runCommand
} from '../utils/tiptapTestUtils';

describe('TestimonyExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([TestimonyExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the testimony node type', () => {
    expect(editor.schema.nodes.testimony).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'testimony');
    
    expect(isNodeType(node, 'testimony')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      quote: '',
      author: '',
      role: '',
      image: null
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    };
    
    const node = createTestNode(editor, 'testimony', attrs);
    
    expect(isNodeType(node, 'testimony')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure', () => {
    const attrs = {
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    };
    
    const node = createTestNode(editor, 'testimony', attrs);
    const html = editor.schema.nodes.testimony.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-testimony')).toBe(true);
    expect(htmlContainsText(html, 'This is a test quote')).toBe(true);
    expect(htmlContainsText(html, 'John Doe')).toBe(true);
    expect(htmlContainsText(html, 'CEO')).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'profile.jpg' })).toBe(true);
  });
  
  it('should render without image if not provided', () => {
    const attrs = {
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: null
    };
    
    const node = createTestNode(editor, 'testimony', attrs);
    const html = editor.schema.nodes.testimony.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-testimony')).toBe(true);
    expect(htmlContainsText(html, 'This is a test quote')).toBe(true);
    expect(htmlContainsText(html, 'John Doe')).toBe(true);
    expect(htmlContainsText(html, 'CEO')).toBe(true);
    expect(htmlContainsElement(html, 'img')).toBe(false);
  });
  
  it('should execute setTestimony command', () => {
    const attrs = {
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    };
    
    const html = runCommand(editor, chain => chain.setTestimony(attrs));
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-testimony')).toBe(true);
    expect(htmlContainsText(html, 'This is a test quote')).toBe(true);
    expect(htmlContainsText(html, 'John Doe')).toBe(true);
    expect(htmlContainsText(html, 'CEO')).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'profile.jpg' })).toBe(true);
  });
  
  it('should update testimony attributes', () => {
    // Insérer un témoignage
    runCommand(editor, chain => chain.setTestimony({
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('testimony', {
      quote: 'Updated quote',
      author: 'Jane Smith',
      role: 'CTO',
      image: 'updated.jpg'
    }));
    
    expect(htmlContainsText(html, 'Updated quote')).toBe(true);
    expect(htmlContainsText(html, 'Jane Smith')).toBe(true);
    expect(htmlContainsText(html, 'CTO')).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'updated.jpg' })).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer un témoignage
    runCommand(editor, chain => chain.setTestimony({
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    }));
    
    // Sélectionner le témoignage
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('testimony')).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer un témoignage
    runCommand(editor, chain => chain.setTestimony({
      quote: 'This is a test quote',
      author: 'John Doe',
      role: 'CEO',
      image: 'profile.jpg'
    }));
    
    // Sélectionner le témoignage
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer le témoignage
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('temp-comp-testimony');
    expect(html).not.toContain('This is a test quote');
  });
});