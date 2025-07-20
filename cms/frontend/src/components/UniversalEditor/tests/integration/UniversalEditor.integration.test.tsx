/**
 * Tests d'intégration pour l'éditeur universel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UniversalEditor } from '../../UniversalEditor';
import { flushPromises } from '../utils/reactTestUtils';

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

describe('UniversalEditor Integration', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render the editor', async () => {
    render(
      <UniversalEditor
        content=""
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Tapez "\/" pour voir les options/i)).toBeInTheDocument();
    });
  });
  
  it('should open block menu when typing "/"', async () => {
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
    
    // Simuler la frappe du caractère "/"
    const editorContent = screen.getByRole('textbox');
    fireEvent.keyDown(editorContent, { key: '/' });
    
    // Vérifier que le menu de blocs s'ouvre
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
  });
  
  it('should insert a heading when selected from block menu', async () => {
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
    
    // Simuler la frappe du caractère "/"
    const editorContent = screen.getByRole('textbox');
    fireEvent.keyDown(editorContent, { key: '/' });
    
    // Attendre que le menu de blocs s'ouvre
    await waitFor(() => {
      expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    });
    
    // Sélectionner le bloc de titre
    const headingBlock = screen.getByText(/Titre H1/i);
    fireEvent.click(headingBlock);
    
    // Vérifier que le titre a été inséré
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should toggle text formatting', async () => {
    render(
      <UniversalEditor
        content="<p>Test text</p>"
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Test text');
    });
    
    // Sélectionner le texte
    const editorContent = screen.getByRole('textbox');
    const text = editorContent.textContent;
    const range = document.createRange();
    const selection = window.getSelection();
    
    range.setStart(editorContent.firstChild!.firstChild!, 0);
    range.setEnd(editorContent.firstChild!.firstChild!, text!.length);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // Appliquer le formatage en gras
    fireEvent.keyDown(editorContent, { key: 'b', ctrlKey: true });
    
    // Vérifier que le formatage a été appliqué
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should save content automatically', async () => {
    render(
      <UniversalEditor
        content="<p>Initial content</p>"
        onChange={mockOnChange}
        projectId="test-project"
        autoSave={true}
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
      expect(editorContent.textContent).toContain('Initial content');
    });
    
    // Modifier le contenu
    const editorContent = screen.getByRole('textbox');
    fireEvent.input(editorContent, { target: { textContent: 'Modified content' } });
    
    // Attendre que la sauvegarde automatique soit déclenchée
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
  
  it('should show preview when clicking preview button', async () => {
    render(
      <UniversalEditor
        content="<p>Preview content</p>"
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Prévisualiser/i)).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de prévisualisation
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que la prévisualisation est affichée
    await waitFor(() => {
      expect(screen.getByText(/Prévisualisation active/i)).toBeInTheDocument();
    });
  });
  
  it('should create a version when clicking create version button', async () => {
    render(
      <UniversalEditor
        content="<p>Version content</p>"
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Créer version/i)).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de création de version
    const createVersionButton = screen.getByText(/Créer version/i);
    fireEvent.click(createVersionButton);
    
    // Vérifier que la version a été créée
    await waitFor(() => {
      const useVersionHistoryMock = require('../../hooks/useVersionHistory').useVersionHistory;
      expect(useVersionHistoryMock().addVersion).toHaveBeenCalled();
    });
  });
  
  it('should show version history when clicking history button', async () => {
    render(
      <UniversalEditor
        content="<p>History content</p>"
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Historique/i)).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton d'historique
    const historyButton = screen.getByText(/Historique/i);
    fireEvent.click(historyButton);
    
    // Vérifier que l'historique des versions est affiché
    await waitFor(() => {
      // Le composant est lazy loadé, donc on vérifie que le chargement est en cours
      expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });
  });
  
  it('should handle undo/redo keyboard shortcuts', async () => {
    render(
      <UniversalEditor
        content="<p>Shortcut content</p>"
        onChange={mockOnChange}
        projectId="test-project"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      const editorContent = screen.getByRole('textbox');
      expect(editorContent).toBeInTheDocument();
    });
    
    // Simuler le raccourci clavier Ctrl+Z
    const editorContent = screen.getByRole('textbox');
    fireEvent.keyDown(editorContent, { key: 'z', ctrlKey: true });
    
    // Vérifier que la fonction undo a été appelée
    await waitFor(() => {
      const useVersionHistoryMock = require('../../hooks/useVersionHistory').useVersionHistory;
      expect(useVersionHistoryMock().undo).toHaveBeenCalled();
    });
    
    // Simuler le raccourci clavier Ctrl+Y
    fireEvent.keyDown(editorContent, { key: 'y', ctrlKey: true });
    
    // Vérifier que la fonction redo a été appelée
    await waitFor(() => {
      const useVersionHistoryMock = require('../../hooks/useVersionHistory').useVersionHistory;
      expect(useVersionHistoryMock().redo).toHaveBeenCalled();
    });
  });
});