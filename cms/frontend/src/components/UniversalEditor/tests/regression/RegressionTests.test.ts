/**
 * Tests de régression pour l'Éditeur Universel Portfolio
 * 
 * Ces tests vérifient que toutes les fonctionnalités principales fonctionnent correctement
 * et qu'aucune régression n'a été introduite lors des modifications.
 */

import { createTestEditor } from '../utils/tiptapTestUtils';
import { generateLargeContent } from '../performance/performanceTestUtils';
import { UniversalEditor } from '../../UniversalEditor';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('Universal Editor Regression Tests', () => {
  // Groupe de tests pour les fonctionnalités de base
  describe('Core functionality', () => {
    test('Editor initializes correctly', () => {
      const editor = createTestEditor();
      expect(editor).toBeDefined();
      expect(editor.isEditable).toBe(true);
      editor.destroy();
    });
    
    test('Editor can set and get content', () => {
      const editor = createTestEditor();
      const testContent = '<p>Test content</p>';
      
      editor.commands.setContent(testContent);
      expect(editor.getHTML()).toContain('Test content');
      
      editor.destroy();
    });
    
    test('Editor handles large content', () => {
      const largeContent = generateLargeContent(30);
      const editor = createTestEditor([], largeContent);
      
      expect(editor.getHTML()).toBeTruthy();
      expect(editor.getHTML().length).toBeGreaterThan(1000);
      
      editor.destroy();
    });
  });
  
  // Groupe de tests pour les extensions
  describe('Extensions', () => {
    test('Heading extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setHeading({ level: 1 });
      editor.commands.insertContent('Test Heading');
      
      expect(editor.getHTML()).toContain('<h1');
      expect(editor.getHTML()).toContain('Test Heading');
      
      editor.destroy();
    });
    
    test('Text extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setUniversalText({ variant: 'rich' });
      editor.commands.insertContent('Test Rich Text');
      
      expect(editor.getHTML()).toContain('rich');
      expect(editor.getHTML()).toContain('Test Rich Text');
      
      editor.destroy();
    });
    
    test('Image extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setUniversalImage({ 
        src: 'test-image.jpg',
        alt: 'Test Image',
        variant: 'full'
      });
      
      expect(editor.getHTML()).toContain('img');
      expect(editor.getHTML()).toContain('test-image.jpg');
      expect(editor.getHTML()).toContain('Test Image');
      
      editor.destroy();
    });
    
    test('Testimony extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setTestimony({
        quote: 'Test Quote',
        author: 'Test Author',
        role: 'Test Role'
      });
      
      expect(editor.getHTML()).toContain('testimony');
      expect(editor.getHTML()).toContain('Test Quote');
      expect(editor.getHTML()).toContain('Test Author');
      
      editor.destroy();
    });
    
    test('Image grid extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setImageGrid({
        images: [
          { src: 'test-image-1.jpg', alt: 'Test Image 1' },
          { src: 'test-image-2.jpg', alt: 'Test Image 2' }
        ]
      });
      
      expect(editor.getHTML()).toContain('img_grid');
      expect(editor.getHTML()).toContain('test-image-1.jpg');
      expect(editor.getHTML()).toContain('test-image-2.jpg');
      
      editor.destroy();
    });
    
    test('Video extension works correctly', () => {
      const editor = createTestEditor();
      
      editor.commands.setUniversalVideo({
        src: 'test-video.mp4',
        poster: 'test-poster.jpg'
      });
      
      expect(editor.getHTML()).toContain('video');
      expect(editor.getHTML()).toContain('test-video.mp4');
      
      editor.destroy();
    });
  });
  
  // Groupe de tests pour les composants d'interface utilisateur
  describe('UI Components', () => {
    test('UniversalEditor component renders correctly', async () => {
      const handleChange = jest.fn();
      
      const { container } = render(
        <UniversalEditor
          content="<p>Test content</p>"
          onChange={handleChange}
          projectId="test-project"
        />
      );
      
      await waitFor(() => {
        expect(container.querySelector('.universal-editor')).toBeInTheDocument();
      });
    });
    
    test('BlockMenu opens and closes correctly', async () => {
      const handleChange = jest.fn();
      
      render(
        <UniversalEditor
          content="<p>Test content</p>"
          onChange={handleChange}
          projectId="test-project"
        />
      );
      
      // Attendre que l'éditeur soit chargé
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      // Simuler l'ouverture du menu de blocs
      const editorContent = screen.getByRole('textbox');
      fireEvent.keyDown(editorContent, { key: '/' });
      
      // Vérifier que le menu s'ouvre
      await waitFor(() => {
        expect(screen.getByText(/blocs disponibles/i)).toBeInTheDocument();
      });
    });
  });
  
  // Groupe de tests pour les services
  describe('Services', () => {
    test('VersionHistoryManager works correctly', () => {
      // Test du service de gestion des versions
      const { VersionHistoryManager } = require('../../services/VersionHistoryManager');
      
      const manager = new VersionHistoryManager('test-project');
      manager.addVersion('<p>Version 1</p>', 'Initial version');
      manager.addVersion('<p>Version 2</p>', 'Second version');
      
      const versions = manager.getVersions();
      expect(versions.length).toBe(2);
      expect(versions[0].content).toBe('<p>Version 2</p>');
      expect(versions[1].content).toBe('<p>Version 1</p>');
    });
    
    test('ContentExportService works correctly', () => {
      // Test du service d'export de contenu
      const { ContentExportService } = require('../../services/ContentExportService');
      
      const content = '<p>Test content</p>';
      const exported = ContentExportService.exportContent(content, {
        cleanupEditorClasses: true,
        templateName: 'poesial'
      });
      
      expect(exported).toBeTruthy();
      expect(typeof exported).toBe('string');
    });
    
    test('MediaManager works correctly', () => {
      // Test du service de gestion des médias
      const { MediaManager } = require('../../services/MediaManager');
      
      const manager = new MediaManager('test-project');
      const mediaItems = manager.getMediaItems();
      
      expect(Array.isArray(mediaItems)).toBe(true);
    });
  });
  
  // Groupe de tests pour les hooks
  describe('Hooks', () => {
    test('useVersionHistory hook works correctly', () => {
      // Test du hook de gestion des versions
      const { renderHook, act } = require('@testing-library/react-hooks');
      const { useVersionHistory } = require('../../hooks/useVersionHistory');
      
      const { result } = renderHook(() => useVersionHistory({
        projectId: 'test-project',
        initialContent: '<p>Initial content</p>',
        onChange: jest.fn()
      }));
      
      act(() => {
        result.current.addVersion('<p>New version</p>', 'Test version');
      });
      
      expect(result.current.versions.length).toBeGreaterThan(0);
      expect(result.current.versions[0].content).toBe('<p>New version</p>');
    });
    
    test('useContentExport hook works correctly', () => {
      // Test du hook d'export de contenu
      const { renderHook, act } = require('@testing-library/react-hooks');
      const { useContentExport } = require('../../hooks/useContentExport');
      
      const { result } = renderHook(() => useContentExport({
        defaultTemplate: 'poesial',
        onExport: jest.fn(),
        onValidationError: jest.fn()
      }));
      
      act(() => {
        result.current.exportContent('<p>Test content</p>');
      });
      
      expect(result.current.exportedContent).toBeTruthy();
    });
  });
});