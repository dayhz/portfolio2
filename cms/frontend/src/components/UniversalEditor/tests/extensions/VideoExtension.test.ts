/**
 * Tests pour l'extension Video
 */

import { VideoExtension } from '../../extensions/VideoExtension';
import { 
  createTestEditor, 
  createTestNode, 
  isNodeType, 
  hasNodeAttributes,
  htmlContainsElement,
  runCommand
} from '../utils/tiptapTestUtils';

describe('VideoExtension', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor([VideoExtension]);
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should register the universalVideo node type', () => {
    expect(editor.schema.nodes.universalVideo).toBeDefined();
  });
  
  it('should have the correct default attributes', () => {
    const node = createTestNode(editor, 'universalVideo');
    
    expect(isNodeType(node, 'universalVideo')).toBe(true);
    expect(node.attrs).toEqual(expect.objectContaining({
      src: null,
      title: '',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      poster: null,
      width: null,
      height: null
    }));
  });
  
  it('should create a node with custom attributes', () => {
    const attrs = {
      src: 'video.mp4',
      title: 'Test video',
      autoplay: true,
      controls: true,
      loop: true,
      muted: true,
      poster: 'poster.jpg',
      width: 640,
      height: 360
    };
    
    const node = createTestNode(editor, 'universalVideo', attrs);
    
    expect(isNodeType(node, 'universalVideo')).toBe(true);
    expect(hasNodeAttributes(node, attrs)).toBe(true);
  });
  
  it('should render the correct HTML structure', () => {
    const attrs = {
      src: 'video.mp4',
      title: 'Test video',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      poster: 'poster.jpg',
      width: 640,
      height: 360
    };
    
    const node = createTestNode(editor, 'universalVideo', attrs);
    const html = editor.schema.nodes.universalVideo.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.video-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'video.video', { 
      src: 'video.mp4',
      title: 'Test video',
      controls: 'true',
      poster: 'poster.jpg',
      width: '640',
      height: '360'
    })).toBe(true);
  });
  
  it('should apply autoplay, loop and muted attributes', () => {
    const attrs = {
      src: 'video.mp4',
      title: 'Test video',
      autoplay: true,
      controls: true,
      loop: true,
      muted: true,
      poster: 'poster.jpg',
      width: 640,
      height: 360
    };
    
    const node = createTestNode(editor, 'universalVideo', attrs);
    const html = editor.schema.nodes.universalVideo.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'video[autoplay]')).toBe(true);
    expect(htmlContainsElement(html, 'video[loop]')).toBe(true);
    expect(htmlContainsElement(html, 'video[muted]')).toBe(true);
  });
  
  it('should execute setUniversalVideo command', () => {
    const attrs = {
      src: 'video.mp4',
      title: 'Test video',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      poster: 'poster.jpg',
      width: 640,
      height: 360
    };
    
    const html = runCommand(editor, chain => chain.setUniversalVideo(attrs));
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.video-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'video.video', { 
      src: 'video.mp4',
      title: 'Test video',
      controls: 'true',
      poster: 'poster.jpg'
    })).toBe(true);
  });
  
  it('should update video attributes', () => {
    // Insérer une vidéo
    runCommand(editor, chain => chain.setUniversalVideo({
      src: 'video.mp4',
      title: 'Test video',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      poster: 'poster.jpg',
      width: 640,
      height: 360
    }));
    
    // Mettre à jour les attributs
    const html = runCommand(editor, chain => chain.updateAttributes('universalVideo', {
      src: 'updated.mp4',
      title: 'Updated video',
      autoplay: true,
      controls: true,
      loop: true,
      muted: true,
      poster: 'updated-poster.jpg',
      width: 1280,
      height: 720
    }));
    
    expect(htmlContainsElement(html, 'video.video', { 
      src: 'updated.mp4',
      title: 'Updated video',
      poster: 'updated-poster.jpg'
    })).toBe(true);
    expect(htmlContainsElement(html, 'video[autoplay]')).toBe(true);
    expect(htmlContainsElement(html, 'video[loop]')).toBe(true);
    expect(htmlContainsElement(html, 'video[muted]')).toBe(true);
  });
  
  it('should be selectable', () => {
    // Insérer une vidéo
    runCommand(editor, chain => chain.setUniversalVideo({
      src: 'video.mp4',
      title: 'Test video'
    }));
    
    // Sélectionner la vidéo
    runCommand(editor, chain => chain.selectNodeBackward());
    
    expect(editor.isActive('universalVideo')).toBe(true);
  });
  
  it('should be deletable', () => {
    // Insérer une vidéo
    runCommand(editor, chain => chain.setUniversalVideo({
      src: 'video.mp4',
      title: 'Test video'
    }));
    
    // Sélectionner la vidéo
    runCommand(editor, chain => chain.selectNodeBackward());
    
    // Supprimer la vidéo
    const html = runCommand(editor, chain => chain.deleteSelection());
    
    expect(html).not.toContain('video-wrp');
    expect(html).not.toContain('video.mp4');
  });
  
  it('should render a placeholder when no source is provided', () => {
    const attrs = {
      src: null,
      title: 'Test video',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      poster: null,
      width: 640,
      height: 360
    };
    
    const node = createTestNode(editor, 'universalVideo', attrs);
    const html = editor.schema.nodes.universalVideo.toDOM(node)?.outerHTML || '';
    
    expect(htmlContainsElement(html, 'section.section')).toBe(true);
    expect(htmlContainsElement(html, 'div.u-container')).toBe(true);
    expect(htmlContainsElement(html, 'div.video-wrp')).toBe(true);
    expect(htmlContainsElement(html, 'div.video-placeholder')).toBe(true);
  });
});