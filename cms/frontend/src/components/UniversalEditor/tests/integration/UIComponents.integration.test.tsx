/**
 * Tests d'intégration pour les composants de l'interface utilisateur
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockMenu } from '../../BlockMenu';
import { DynamicToolbar } from '../../components/DynamicToolbar';
import { BlockSelectionManager } from '../../components/BlockSelectionManager';
import { SaveStatusIndicator } from '../../components/SaveStatusIndicator';
import { VersionHistoryPanel } from '../../components/VersionHistoryPanel';
import { SimplePreview } from '../../components/SimplePreview';
import { flushPromises } from '../utils/reactTestUtils';
import { createTestEditor } from '../utils/tiptapTestUtils';

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

describe('UI Components Integration', () => {
  let editor: ReturnType<typeof createTestEditor>;
  
  beforeEach(() => {
    editor = createTestEditor();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    editor.destroy();
  });
  
  it('should render BlockMenu with categories and blocks', () => {
    const mockOnBlockSelect = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <BlockMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onBlockSelect={mockOnBlockSelect}
        onClose={mockOnClose}
        initialQuery=""
      />
    );
    
    // Vérifier que le menu est affiché
    expect(screen.getByText(/Blocs disponibles/i)).toBeInTheDocument();
    
    // Vérifier que les catégories sont affichées
    expect(screen.getByText(/Média/i)).toBeInTheDocument();
    expect(screen.getByText(/Texte/i)).toBeInTheDocument();
    
    // Vérifier que les blocs sont affichés
    expect(screen.getByText(/Image pleine largeur/i)).toBeInTheDocument();
    expect(screen.getByText(/Texte riche/i)).toBeInTheDocument();
    expect(screen.getByText(/Titre H1/i)).toBeInTheDocument();
    
    // Cliquer sur un bloc
    fireEvent.click(screen.getByText(/Titre H1/i));
    
    // Vérifier que la fonction onBlockSelect a été appelée
    expect(mockOnBlockSelect).toHaveBeenCalledWith('heading-1');
  });
  
  it('should filter blocks in BlockMenu based on search query', () => {
    const mockOnBlockSelect = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <BlockMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        onBlockSelect={mockOnBlockSelect}
        onClose={mockOnClose}
        initialQuery="image"
      />
    );
    
    // Vérifier que seuls les blocs contenant "image" sont affichés
    expect(screen.getByText(/Image pleine largeur/i)).toBeInTheDocument();
    expect(screen.getByText(/Grille d'images/i)).toBeInTheDocument();
    expect(screen.queryByText(/Texte riche/i)).not.toBeInTheDocument();
    
    // Modifier la recherche
    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'texte' } });
    
    // Vérifier que les résultats sont mis à jour
    expect(screen.queryByText(/Image pleine largeur/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Texte riche/i)).toBeInTheDocument();
  });
  
  it('should render DynamicToolbar with formatting options', () => {
    render(
      <DynamicToolbar editor={editor} />
    );
    
    // Vérifier que la barre d'outils est affichée
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    
    // Vérifier que les boutons de formatage sont affichés
    expect(screen.getByTitle(/Gras/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Italique/i)).toBeInTheDocument();
    
    // Cliquer sur un bouton de formatage
    fireEvent.click(screen.getByTitle(/Gras/i));
    
    // Vérifier que la commande a été exécutée
    expect(editor.isActive('bold')).toBe(true);
  });
  
  it('should render SaveStatusIndicator with different states', () => {
    // Tester l'état "idle"
    const { rerender } = render(
      <SaveStatusIndicator status="idle" showText={true} />
    );
    
    expect(screen.getByText(/Sauvegardé/i)).toBeInTheDocument();
    
    // Tester l'état "saving"
    rerender(
      <SaveStatusIndicator status="saving" showText={true} />
    );
    
    expect(screen.getByText(/Sauvegarde en cours/i)).toBeInTheDocument();
    
    // Tester l'état "error"
    rerender(
      <SaveStatusIndicator status="error" showText={true} />
    );
    
    expect(screen.getByText(/Erreur de sauvegarde/i)).toBeInTheDocument();
  });
  
  it('should render VersionHistoryPanel with versions', () => {
    const mockVersions = [
      { id: '1', content: '<p>Version 1</p>', timestamp: Date.now() - 3600000, label: 'Version initiale' },
      { id: '2', content: '<p>Version 2</p>', timestamp: Date.now() - 1800000, label: null },
      { id: '3', content: '<p>Version 3</p>', timestamp: Date.now(), label: 'Version finale' }
    ];
    
    const mockOnRestoreVersion = jest.fn();
    const mockOnLabelVersion = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <VersionHistoryPanel
        versions={mockVersions}
        currentVersionIndex={2}
        onRestoreVersion={mockOnRestoreVersion}
        onLabelVersion={mockOnLabelVersion}
        onClose={mockOnClose}
      />
    );
    
    // Vérifier que le panneau est affiché
    expect(screen.getByText(/Historique des versions/i)).toBeInTheDocument();
    
    // Vérifier que les versions sont affichées
    expect(screen.getByText(/Version initiale/i)).toBeInTheDocument();
    expect(screen.getByText(/Version finale/i)).toBeInTheDocument();
    
    // Cliquer sur une version pour la restaurer
    fireEvent.click(screen.getByText(/Version initiale/i));
    
    // Vérifier que la fonction onRestoreVersion a été appelée
    expect(mockOnRestoreVersion).toHaveBeenCalledWith('1');
  });
  
  it('should render SimplePreview with content and template', () => {
    const mockContent = `
      <h1 class="universal-heading" data-level="1">Titre de prévisualisation</h1>
      <section class="section">
        <div class="u-container">
          <div class="temp-rich u-color-dark w-richtext">
            <p>Contenu de prévisualisation</p>
          </div>
        </div>
      </section>
    `;
    
    const mockOnClose = jest.fn();
    
    render(
      <SimplePreview
        content={mockContent}
        templateName="poesial"
        onClose={mockOnClose}
      />
    );
    
    // Vérifier que la prévisualisation est affichée
    expect(screen.getByText(/Titre de prévisualisation/i)).toBeInTheDocument();
    expect(screen.getByText(/Contenu de prévisualisation/i)).toBeInTheDocument();
    
    // Vérifier que le template est appliqué
    const previewContainer = screen.getByTestId('preview-container');
    expect(previewContainer).toHaveClass('template-poesial');
    
    // Cliquer sur le bouton de fermeture
    fireEvent.click(screen.getByText(/Fermer/i));
    
    // Vérifier que la fonction onClose a été appelée
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('should render BlockSelectionManager with selection indicators', () => {
    // Insérer du contenu dans l'éditeur
    editor.commands.setContent(`
      <h1>Titre sélectionnable</h1>
      <p>Paragraphe sélectionnable</p>
    `);
    
    render(
      <BlockSelectionManager editor={editor}>
        <div data-testid="editor-content">
          <h1>Titre sélectionnable</h1>
          <p>Paragraphe sélectionnable</p>
        </div>
      </BlockSelectionManager>
    );
    
    // Vérifier que le contenu est affiché
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    
    // Simuler la sélection d'un bloc
    const editorContent = screen.getByTestId('editor-content');
    const heading = editorContent.querySelector('h1');
    fireEvent.click(heading!);
    
    // Vérifier que la sélection est gérée
    expect(editor.isActive('heading')).toBe(true);
  });
});