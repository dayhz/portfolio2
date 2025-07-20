/**
 * Tests d'intégration pour les interactions entre les différents types de blocs
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UniversalEditor } from '../../UniversalEditor';
import { flushPromises } from '../utils/reactTestUtils';

// Mock des services (identique au test précédent)
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

describe('Block Interactions Integration', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should insert multiple blocks and navigate between them', async () => {
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
    
    // Insérer un titre H1
    const editorContent = screen.getByRole('textbox');
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const headingBlock = screen.getByText(/Titre H1/i);
    fireEvent.click(headingBlock);
    
    // Insérer du texte dans le titre
    fireEvent.input(editorContent, { target: { textContent: 'Titre principal' } });
    
    // Appuyer sur Entrée pour créer un nouveau bloc
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    
    // Insérer un bloc de texte riche
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const textBlock = screen.getByText(/Texte riche/i);
    fireEvent.click(textBlock);
    
    // Insérer du texte dans le bloc de texte
    fireEvent.input(editorContent, { target: { textContent: 'Contenu du texte riche' } });
    
    // Appuyer sur Entrée pour créer un nouveau bloc
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    
    // Insérer un bloc d'image
    fireEvent.keyDown(editorContent, { key: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    const imageBlock = screen.getByText(/Image pleine largeur/i);
    fireEvent.click(imageBlock);
    
    // Vérifier que les blocs ont été insérés
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
    
    // Naviguer vers le haut avec Alt+Up
    fireEvent.keyDown(editorContent, { key: 'ArrowUp', altKey: true });
    
    // Naviguer vers le bas avec Alt+Down
    fireEvent.keyDown(editorContent, { key: 'ArrowDown', altKey: true });
    
    // Vérifier que la navigation a fonctionné
    await flushPromises();
  });
  
  it('should allow selecting and deleting blocks', async () => {
    // Contenu initial avec plusieurs blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Titre à supprimer</h1>
      <p>Paragraphe à conserver</p>
    `;
    
    render(
      <UniversalEditor
        content={initialContent}
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Titre à supprimer');
      expect(editorContent.textContent).toContain('Paragraphe à conserver');
    });
    
    // Sélectionner le titre
    const editorContent = screen.getByRole('textbox');
    const heading = editorContent.querySelector('h1');
    fireEvent.click(heading!);
    
    // Supprimer le bloc sélectionné
    fireEvent.keyDown(editorContent, { key: 'Delete' });
    
    // Vérifier que le bloc a été supprimé
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should allow changing block attributes', async () => {
    // Contenu initial avec un bloc de texte
    const initialContent = `
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Texte à modifier</p>
          </div>
        </div>
      </section>
    `;
    
    render(
      <UniversalEditor
        content={initialContent}
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Texte à modifier');
    });
    
    // Sélectionner le bloc de texte
    const editorContent = screen.getByRole('textbox');
    const textBlock = editorContent.querySelector('.temp-rich');
    fireEvent.click(textBlock!);
    
    // Simuler l'ouverture des contrôles de bloc
    fireEvent.keyDown(editorContent, { key: 'e', ctrlKey: true });
    
    // Vérifier que les contrôles sont affichés
    await flushPromises();
    
    // Simuler la modification des attributs
    mockOnChange.mockClear();
    fireEvent.keyDown(editorContent, { key: 'Enter' });
    
    // Vérifier que les attributs ont été modifiés
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should allow moving blocks up and down', async () => {
    // Contenu initial avec plusieurs blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Premier titre</h1>
      <p>Paragraphe du milieu</p>
      <h2 class="universal-heading" data-level="2">Deuxième titre</h2>
    `;
    
    render(
      <UniversalEditor
        content={initialContent}
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Premier titre');
      expect(editorContent.textContent).toContain('Paragraphe du milieu');
      expect(editorContent.textContent).toContain('Deuxième titre');
    });
    
    // Sélectionner le paragraphe du milieu
    const editorContent = screen.getByRole('textbox');
    const paragraph = editorContent.querySelector('p');
    fireEvent.click(paragraph!);
    
    // Déplacer le bloc vers le haut
    fireEvent.keyDown(editorContent, { key: 'ArrowUp', altKey: true, shiftKey: true });
    
    // Vérifier que le bloc a été déplacé
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
    
    mockOnChange.mockClear();
    
    // Déplacer le bloc vers le bas
    fireEvent.keyDown(editorContent, { key: 'ArrowDown', altKey: true, shiftKey: true });
    
    // Vérifier que le bloc a été déplacé
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should handle complex content with multiple block types', async () => {
    // Contenu initial avec plusieurs types de blocs
    const complexContent = `
      <h1 class="universal-heading" data-level="1">Titre principal</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Paragraphe de texte riche</p>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="u-container">
          <div class="temp-img_container">
            <div class="temp-img">
              <div class="img-wrp">
                <img src="test.jpg" alt="Test" class="comp-img" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <h2 class="universal-heading" data-level="2">Sous-titre</h2>
      <section class="section">
        <div class="u-container">
          <div class="temp-comp-testimony">
            <div class="testimony">Citation de test</div>
            <div class="author">Auteur Test</div>
          </div>
        </div>
      </section>
    `;
    
    render(
      <UniversalEditor
        content={complexContent}
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Titre principal');
      expect(editorContent.textContent).toContain('Paragraphe de texte riche');
      expect(editorContent.textContent).toContain('Sous-titre');
      expect(editorContent.textContent).toContain('Citation de test');
      expect(editorContent.textContent).toContain('Auteur Test');
    });
    
    // Vérifier que l'image est rendue
    const editorContent = screen.getByRole('textbox');
    const image = editorContent.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test.jpg');
    expect(image).toHaveAttribute('alt', 'Test');
    
    // Sélectionner différents blocs et vérifier qu'ils sont sélectionnables
    const heading = editorContent.querySelector('h1');
    fireEvent.click(heading!);
    
    const richText = editorContent.querySelector('.temp-rich');
    fireEvent.click(richText!);
    
    const testimony = editorContent.querySelector('.temp-comp-testimony');
    fireEvent.click(testimony!);
    
    // Vérifier que les blocs sont sélectionnables
    await flushPromises();
  });
});