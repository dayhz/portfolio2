/**
 * Tests pour l'extension ImageGrid
 */

import { ImageGridExtension } from '../../extensions/ImageGridExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  runCommand
} from '../utils/tiptapTestUtils';

describe('ImageGridExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([ImageGridExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the imageGrid node type', () => {
    expect(editor.schema.nodes.imageGrid).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'imageGrid');
    
    expect(isNodeType(node, 'imageGrid')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      images: [],
      columns: 2,
      gap: 'medium'
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 3,
      gap: 'large'
    };
    
    const node = createTestNode(editor, 'imageGrid', attrs);
    
    expect(isNodeType(node, 'imageGrid')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure', () => {
    const attrs = {
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'medium'
    };
    
    const node = createTestNode(editor, 'imageGrid', attrs);
    const html = editor.schema.nodes.imageGrid.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid')).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'image1.jpg', alt: 'Image 1' })).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'image2.jpg', alt: 'Image 2' })).toBe(true);
  });
  
  it('should apply the correct number of columns', () => {
    const attrs = {
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 3,
      gap: 'medium'
    };
    
    const node = createTestNode(editor, 'imageGrid', attrs);
    const html = editor.schema.nodes.imageGrid.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid[style*="grid-template-columns: repeat(3, 1fr)"]')).toBe(true);
  });
  
  it('should apply the correct gap size', () => {
    const attrs = {
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'large'
    };
    
    const node = createTestNode(editor, 'imageGrid', attrs);
    const html = editor.schema.nodes.imageGrid.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid[style*="gap: 3rem"]')).toBe(true);
  });
  
  it('should execute setImageGrid command', () => {
    const attrs = {
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'medium'
    };
    
    const html = runCommand(editor, chain => chain.setImageGrid(attrs));
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid')).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'image1.jpg', alt: 'Image 1' })).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'image2.jpg', alt: 'Image 2' })).toBe(true);
  });
  
  it('should update imageGrid attributes', () => {
    // Insérer une grille d'images
    runCommand(editor, chain => chain.setImageGrid({
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'medium'
    }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('imageGrid', {
      images: [
        { src: 'updated1.jpg', alt: 'Updated 1' },
        { src: 'updated2.jpg', alt: 'Updated 2' },
        { src: 'updated3.jpg', alt: 'Updated 3' }
      ],
      columns: 3,
      gap: 'large'
    }));
    
    expect(htmlContainsElement(html, 'img', { src: 'updated1.jpg', alt: 'Updated 1' })).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'updated2.jpg', alt: 'Updated 2' })).toBe(true);
    expect(htmlContainsElement(html, 'img', { src: 'updated3.jpg', alt: 'Updated 3' })).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid[style*="grid-template-columns: repeat(3, 1fr)"]')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid[style*="gap: 3rem"]')).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer une grille d'images
    runCommand(editor, chain => chain.setImageGrid({
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'medium'
    }));
    
    // Sélectionner la grille d'images
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('imageGrid')).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer une grille d'images
    runCommand(editor, chain => chain.setImageGrid({
      images: [
        { src: 'image1.jpg', alt: 'Image 1' },
        { src: 'image2.jpg', alt: 'Image 2' }
      ],
      columns: 2,
      gap: 'medium'
    }));
    
    // Sélectionner la grille d'images
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer la grille d'images
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('temp-comp-img_grid');
    expect(html).not.toContain('image1.jpg');
  });
  
  it('should render an empty grid with placeholder', () => {
    const attrs = {
      images: [],
      columns: 2,
      gap: 'medium'
    };
    
    const node = createTestNode(editor, 'imageGrid', attrs);
    const html = editor.schema.nodes.imageGrid.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.temp-comp-img_grid')).toBe(true);
    expect(htmlContainsElement(html, 'div.image-placeholder')).toBe(true);
  });
});