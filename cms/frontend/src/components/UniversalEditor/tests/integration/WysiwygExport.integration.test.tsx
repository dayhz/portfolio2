/**
 * Tests d'intégration pour le rendu WYSIWYG et l'export
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

// Mock des hooks
const mockExportContent = jest.fn().mockReturnValue(true);
const mockExportToJson = jest.fn().mockReturnValue({});
const mockSetExportedContent = jest.fn();

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
    exportContent: mockExportContent,
    exportToJson: mockExportToJson,
    integrateWithTemplate: jest.fn(),
    setExportedContent: mockSetExportedContent
  })
}));

describe('WYSIWYG and Export Integration', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render content in WYSIWYG mode', async () => {
    // Contenu initial avec différents types de blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Titre WYSIWYG</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Paragraphe <strong>formaté</strong> avec du <em>style</em></p>
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
      expect(editorContent.textContent).toContain('Titre WYSIWYG');
      expect(editorContent.textContent).toContain('Paragraphe formaté avec du style');
    });
    
    // Vérifier que le formatage est rendu correctement
    const editorContent = screen.getByRole('textbox');
    const strongElement = editorContent.querySelector('strong');
    const emElement = editorContent.querySelector('em');
    
    expect(strongElement).toBeInTheDocument();
    expect(strongElement?.textContent).toBe('formaté');
    expect(emElement).toBeInTheDocument();
    expect(emElement?.textContent).toBe('style');
  });
  
  it('should preview content with the same styling as the site', async () => {
    // Contenu initial avec différents types de blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Titre de prévisualisation</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Contenu de prévisualisation</p>
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
      expect(screen.getByText(/Prévisualiser/i)).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de prévisualisation
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que la prévisualisation est affichée
    await waitFor(() => {
      expect(screen.getByText(/Prévisualisation active/i)).toBeInTheDocument();
    });
    
    // Vérifier que le contenu est exporté pour la prévisualisation
    expect(mockSetExportedContent).toHaveBeenCalled();
  });
  
  it('should export content with the correct template', async () => {
    // Contenu initial avec différents types de blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Titre d'export</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Contenu d'export</p>
          </div>
        </div>
      </section>
    `;
    
    render(
      <UniversalEditor
        content={initialContent}
        onChange={mockOnChange}
        projectId="test-project"
        templateType="poesial"
      />
    );
    
    // Attendre que l'éditeur soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Template: poesial/i)).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de prévisualisation pour déclencher l'export
    const previewButton = screen.getByText(/Prévisualiser/i);
    fireEvent.click(previewButton);
    
    // Vérifier que l'export a été appelé avec le bon template
    await waitFor(() => {
      expect(mockExportContent).toHaveBeenCalled();
    });
    
    // Simuler la publication
    const debugPreviewButton = screen.getByText(/Debug Preview/i);
    fireEvent.click(debugPreviewButton);
    
    // Vérifier que l'export a été appelé pour la publication
    await waitFor(() => {
      expect(mockSetExportedContent).toHaveBeenCalled();
    });
  });
  
  it('should maintain formatting when editing content', async () => {
    // Contenu initial avec formatage
    const initialContent = `
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Texte <strong>en gras</strong> et <em>en italique</em></p>
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
      expect(editorContent.textContent).toContain('Texte en gras et en italique');
    });
    
    // Sélectionner le texte en gras
    const editorContent = screen.getByRole('textbox');
    const strongElement = editorContent.querySelector('strong');
    fireEvent.click(strongElement!);
    
    // Modifier le texte en gras
    fireEvent.input(strongElement!, { target: { textContent: 'très gras' } });
    
    // Vérifier que le formatage est conservé
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const updatedStrongElement = editorContent.querySelector('strong');
      expect(updatedStrongElement).toBeInTheDocument();
    });
  });
  
  it('should generate valid HTML for the site', async () => {
    // Contenu initial avec différents types de blocs
    const initialContent = `
      <h1 class="universal-heading" data-level="1">Titre d'export</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Contenu d'export</p>
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
    });
    
    // Simuler l'export du contenu
    const debugPreviewButton = screen.getByText(/Debug Preview/i);
    fireEvent.click(debugPreviewButton);
    
    // Vérifier que l'export a été appelé
    await waitFor(() => {
      expect(mockSetExportedContent).toHaveBeenCalled();
    });
    
    // Vérifier que le contenu exporté est valide
    expect(mockSetExportedContent).toHaveBeenCalledWith(expect.stringContaining('universal-heading'));
    expect(mockSetExportedContent).toHaveBeenCalledWith(expect.stringContaining('temp-rich'));
    expect(mockSetExportedContent).toHaveBeenCalledWith(expect.stringContaining('temp-img_container'));
  });
});