/**
 * Tests pour l'extension Image
 */

import { ImageExtension } from '../../extensions/ImageExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  runCommand
} from '../utils/tiptapTestUtils';

describe('ImageExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([ImageExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the universalImage node type', () => {
    expect(editor.schema.nodes.universalImage).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'universalImage');
    
    expect(isNodeType(node, 'universalImage')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      src: null,
      alt: null,
      variant: 'auto',
      size: 'medium'
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      src: 'test.jpg',
      alt: 'Test image',
      variant: '16-9',
      size: 'large'
    };
    
    const node = createTestNode(editor, 'universalImage', attrs);
    
    expect(isNodeType(node, 'universalImage')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure for full variant', () => {
    const attrs = {
      src: 'test.jpg',
      alt: 'Test image',
      variant: 'full',
      size: 'medium'
    };
    
    const node = createTestNode(editor, 'universalImage', attrs);
    const html = editor.schema.nodes.universalImage.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'div.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img_container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img')).toBe(true);
    expect(htmlContainsElement(html, 'div.img-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'img.comp-img', { src: 'test.jpg', alt: 'Test image' })).toBe(true);
  });
  
  it('should render the correct HTML structure for 16-9 variant', () => {
    const attrs = {
      src: 'test.jpg',
      alt: 'Test image',
      variant: '16-9',
      size: 'medium'
    };
    
    const node = createTestNode(editor, 'universalImage', attrs);
    const html = editor.schema.nodes.universalImage.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'div.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img_container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img')).toBe(true);
    expect(htmlContainsElement(html, 'div.img-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'img.comp-img', { src: 'test.jpg', alt: 'Test image' })).toBe(true);
  });
  
  it('should execute setUniversalImage command', () => {
    const attrs = {
      src: 'test.jpg',
      alt: 'Test image',
      variant: 'full',
      size: 'medium'
    };
    
    const html = runCommand(editor, chain => chain.setUniversalImage(attrs));
    
    expect(htmlContainsElement(html, 'div.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img_container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-img')).toBe(true);
    expect(htmlContainsElement(html, 'div.img-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'img.comp-img', { src: 'test.jpg', alt: 'Test image' })).toBe(true);
  });
  
  it('should update image attributes', () => {
    // Insérer une image
    runCommand(editor, chain => chain.setUniversalImage({
      src: 'test.jpg',
      alt: 'Test image',
      variant: 'full',
      size: 'medium'
    }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('universalImage', {
      src: 'updated.jpg',
      alt: 'Updated image',
      variant: '16-9',
      size: 'large'
    }));
    
    expect(htmlContainsElement(html, 'img.comp-img', { 
      src: 'updated.jpg', 
      alt: 'Updated image' 
    })).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer une image
    runCommand(editor, chain => chain.setUniversalImage({
      src: 'test.jpg',
      alt: 'Test image',
      variant: 'full',
      size: 'medium'
    }));
    
    // Sélectionner l'image
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('universalImage')).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer une image
    runCommand(editor, chain => chain.setUniversalImage({
      src: 'test.jpg',
      alt: 'Test image',
      variant: 'full',
      size: 'medium'
    }));
    
    // Sélectionner l'image
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer l'image
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('img');
    expect(html).not.toContain('test.jpg');
  });
});