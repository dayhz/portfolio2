/**
 * Tests d'intégration pour les workflows complets de création
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UniversalEditor } from '../../UniversalEditor';
import { flushPromises, createTestFile } from '../utils/reactTestUtils';

// Mock des services
jest.mock('../../services/CacheService', () => ({
  cacheService: {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      entryCount: 0,
      totalSize: 0,
      maxSize: 1000000,
      usagePercentage: 0,
      entriesByType: {}
    })
  },
  CacheEntryType: {
    IMAGE: 'image',
    HTML: 'html',
    JSON: 'json',
    COMPONENT: 'component',
    OTHER: 'other'
  }
}));

jest.mock('../../services/MediaOptimizationService', () => ({
  mediaOptimizationService: {
    optimizeImage: jest.fn().mockImplementation((file) => Promise.resolve('mock-image-url')),
    preloadImage: jest.fn().mockImplementation((url) => Promise.resolve(url)),
    clearMediaCache: jest.fn()
  }
}));

jest.mock('../../services/MemoryManager', () => ({
  memoryManager: {
    cleanup: jest.fn(),
    fullCleanup: jest.fn(),
    registerObjectUrl: jest.fn(),
    revokeObjectUrl: jest.fn(),
    registerEventListener: jest.fn(),
    removeEventListeners: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      objectUrlCount: 0,
      eventListenerGroups: 0,
      totalEventListeners: 0,
      isIdle: false,
      idleTime: 0
    })
  }
}));

// Mock des hooks
jest.mock('../../hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    save: jest.fn(),
    status: 'idle',
    loadFromBackup: jest.fn().mockReturnValue(null),
    clearBackup: jest.fn()
  })
}));

jest.mock('../../hooks/useVersionHistory', () => ({
  useVersionHistory: () => ({
    versions: [],
    currentVersionIndex: 0,
    isUndoAvailable: false,
    isRedoAvailable: false,
    addVersion: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    restoreVersion: jest.fn(),
    labelVersion: jest.fn()
  })
}));

jest.mock('../../hooks/useContentExport', () => ({
  useContentExport: () => ({
    isExporting: false,
    exportedContent: null,
    validationResult: { isValid: true, errors: [] },
    exportContent: jest.fn().mockReturnValue(true),
    exportToJson: jest.fn().mockReturnValue({}),
    integrateWithTemplate: jest.fn(),
    setExportedContent: jest.fn()
  })
}));

// Mock pour l'upload de fichiers
const mockFileUpload = (inputElement: HTMLElement, file: File) => {
  fireEvent.change(inputElement, { target: { files: [file] } });
};

describe('Creation Workflows Integration', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should support creating a complete article with multiple block types', async () => {
    render(
      <UniversalEditor
        content=""
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
    });
    
    const editorContent = screen.getByRole('textbox');
    
    // 1. Insérer un titre H1
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const headingBlock = screen.getByText(/Titre H1/i);
    fireEvent.click(headingBlock);
    
    // Insérer du texte dans le titre
    fireEvent.input(editorContent, { target: { textContent: 'Mon article complet' } });
    
    // 2. Insérer un bloc de texte riche
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const textBlock = screen.getByText(/Texte riche/i);
    fireEvent.click(textBlock);
    
    // Insérer du texte dans le bloc de texte
    fireEvent.input(editorContent, { target: { textContent: 'Introduction de mon article avec du texte formaté.' } });
    
    // 3. Insérer une image
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const imageBlock = screen.getByText(/Image pleine largeur/i);
    fireEvent.click(imageBlock);
    
    // 4. Insérer un sous-titre H2
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const subheadingBlock = screen.getByText(/Titre H2/i);
    fireEvent.click(subheadingBlock);
    
    // Insérer du texte dans le sous-titre
    fireEvent.input(editorContent, { target: { textContent: 'Section détaillée' } });
    
    // 5. Insérer un autre bloc de texte
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const anotherTextBlock = screen.getByText(/Texte riche/i);
    fireEvent.click(anotherTextBlock);
    
    // Insérer du texte dans le bloc de texte
    fireEvent.input(editorContent, { target: { textContent: 'Contenu détaillé de la section avec des explications.' } });
    
    // 6. Insérer un témoignage
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const testimonyBlock = screen.getByText(/Témoignage/i);
    fireEvent.click(testimonyBlock);
    
    // 7. Vérifier que tous les blocs ont été insérés
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(6);
    });
    
    // 8. Prévisualiser le contenu
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que la prévisualisation est affichée
    await waitFor(() => {
      expect(screen.getByText(/Prévisualisation active/i)).toBeInTheDocument();
    });
  });
  
  it('should support creating a portfolio project with images and text', async () => {
    render(
      <UniversalEditor
        content=""
        onChange={mockOnChange}
        projectId="test-project"
        templateType="poesial"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
    });
    
    const editorContent = screen.getByRole('textbox');
    
    // 1. Insérer un titre H1
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const headingBlock = screen.getByText(/Titre H1/i);
    fireEvent.click(headingBlock);
    
    // Insérer du texte dans le titre
    fireEvent.input(editorContent, { target: { textContent: 'Mon projet portfolio' } });
    
    // 2. Insérer une image pleine largeur
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const imageBlock = screen.getByText(/Image pleine largeur/i);
    fireEvent.click(imageBlock);
    
    // 3. Insérer un bloc de texte about
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    // Rechercher le bloc About
    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'about' } });
    
    // Sélectionner le bloc About
    const aboutBlock = screen.getByText(/About/i);
    fireEvent.click(aboutBlock);
    
    // Insérer du texte dans le bloc About
    fireEvent.input(editorContent, { target: { textContent: 'À propos de ce projet portfolio.' } });
    
    // 4. Insérer une grille d'images
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const gridBlock = screen.getByText(/Grille d'images/i);
    fireEvent.click(gridBlock);
    
    // 5. Vérifier que tous les blocs ont été insérés
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(4);
    });
    
    // 6. Prévisualiser le contenu avec le template Poesial
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que la prévisualisation est affichée avec le bon template
    await waitFor(() => {
      expect(screen.getByText(/Prévisualisation active: Template poesial/i)).toBeInTheDocument();
    });
  });
  
  it('should support creating a testimonial section with author info', async () => {
    render(
      <UniversalEditor
        content=""
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
    });
    
    const editorContent = screen.getByRole('textbox');
    
    // 1. Insérer un titre H2
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const headingBlock = screen.getByText(/Titre H2/i);
    fireEvent.click(headingBlock);
    
    // Insérer du texte dans le titre
    fireEvent.input(editorContent, { target: { textContent: 'Témoignages clients' } });
    
    // 2. Insérer un témoignage
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const testimonyBlock = screen.getByText(/Témoignage/i);
    fireEvent.click(testimonyBlock);
    
    // 3. Insérer un autre témoignage
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const anotherTestimonyBlock = screen.getByText(/Témoignage/i);
    fireEvent.click(anotherTestimonyBlock);
    
    // 4. Vérifier que tous les blocs ont été insérés
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
    
    // 5. Prévisualiser le contenu
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que la prévisualisation est affichée
    await waitFor(() => {
      expect(screen.getByText(/Prévisualisation active/i)).toBeInTheDocument();
    });
  });
});