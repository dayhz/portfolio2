import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClientsEditor } from '@/components/services/ClientsEditor';
import { ClientsData, ClientItem, ValidationError } from '../../../../shared/types/services';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" onDrop={() => onDragEnd?.({ active: { id: 'client-1' }, over: { id: 'client-2' } })}>
      {children}
    </div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ClientsEditor', () => {
  const mockClients: ClientItem[] = [
    {
      id: 'client-1',
      name: 'Apple Inc.',
      logo: 'https://example.com/apple-logo.svg',
      description: 'Leader mondial de la technologie',
      industry: 'technology',
      order: 1,
      isActive: true,
    },
    {
      id: 'client-2',
      name: 'Microsoft Corp.',
      logo: 'https://example.com/microsoft-logo.png',
      description: 'Géant du logiciel et des services cloud',
      industry: 'technology',
      order: 2,
      isActive: false,
    },
    {
      id: 'client-3',
      name: 'Goldman Sachs',
      logo: '',
      description: 'Banque d\'investissement internationale',
      industry: 'finance',
      order: 3,
      isActive: true,
    },
  ];

  const mockData: ClientsData = {
    clients: mockClients,
  };

  const defaultProps = {
    data: mockData,
    onChange: vi.fn(),
    onSave: vi.fn(),
    onPreview: vi.fn(),
    errors: [],
    isLoading: false,
    isSaving: false,
    onUnsavedChanges: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the clients editor with title and description', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      expect(screen.getByText('Section Clients')).toBeInTheDocument();
      expect(screen.getByText('Gérez vos clients avec catégorisation par secteur et glisser-déposer pour réorganiser')).toBeInTheDocument();
    });

    it('displays loading state when isLoading is true', () => {
      render(<ClientsEditor {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Chargement de la section Clients...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders all clients with correct information', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
      expect(screen.getByText('Goldman Sachs')).toBeInTheDocument();
      
      expect(screen.getByText('Leader mondial de la technologie')).toBeInTheDocument();
      expect(screen.getByText('Géant du logiciel et des services cloud')).toBeInTheDocument();
      expect(screen.getByText('Banque d\'investissement internationale')).toBeInTheDocument();
    });

    it('displays client count correctly', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      expect(screen.getByText('Clients (3)')).toBeInTheDocument();
    });

    it('shows empty state when no clients exist', () => {
      const emptyData: ClientsData = { clients: [] };
      render(<ClientsEditor {...defaultProps} data={emptyData} />);
      
      expect(screen.getByText('Aucun client défini')).toBeInTheDocument();
      expect(screen.getByText('Commencez par ajouter votre premier client')).toBeInTheDocument();
      expect(screen.getByText('Ajouter le premier client')).toBeInTheDocument();
    });

    it('displays unsaved changes indicator when hasUnsavedChanges is true', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      // Trigger a change by toggling a client's active status
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      
      await waitFor(() => {
        expect(screen.getByText('(Modifications non sauvegardées)')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('filters clients by search term', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher un client...');
      await user.type(searchInput, 'Apple');
      
      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
        expect(screen.queryByText('Goldman Sachs')).not.toBeInTheDocument();
      });
    });

    it('filters clients by industry', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const industrySelect = screen.getByDisplayValue('Tous les secteurs');
      await user.click(industrySelect);
      
      const financeOption = screen.getByText('Finance');
      await user.click(financeOption);
      
      await waitFor(() => {
        expect(screen.getByText('Goldman Sachs')).toBeInTheDocument();
        expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
        expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
      });
    });

    it('filters clients by active status', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const statusSelect = screen.getByDisplayValue('Tous');
      await user.click(statusSelect);
      
      const inactiveOption = screen.getByText('Inactifs');
      await user.click(inactiveOption);
      
      await waitFor(() => {
        expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
        expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
        expect(screen.queryByText('Goldman Sachs')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when filters match no clients', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher un client...');
      await user.type(searchInput, 'NonExistentClient');
      
      await waitFor(() => {
        expect(screen.getByText('Aucun client trouvé')).toBeInTheDocument();
        expect(screen.getByText('Aucun client ne correspond aux critères de recherche')).toBeInTheDocument();
      });
    });

    it('resets filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      // Apply filters
      const searchInput = screen.getByPlaceholderText('Rechercher un client...');
      await user.type(searchInput, 'NonExistentClient');
      
      await waitFor(() => {
        expect(screen.getByText('Aucun client trouvé')).toBeInTheDocument();
      });
      
      // Reset filters
      const resetButton = screen.getByText('Réinitialiser les filtres');
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
        expect(screen.getByText('Goldman Sachs')).toBeInTheDocument();
      });
    });
  });

  describe('Client Management', () => {
    it('opens add client dialog when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau client')).toBeInTheDocument();
        expect(screen.getByText('Ajoutez un client avec son logo, sa description et son secteur d\'activité')).toBeInTheDocument();
      });
    });

    it('opens edit client dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText('Modifier le client');
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Modifier le client')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Apple Inc.')).toBeInTheDocument();
      });
    });

    it('toggles client active status when switch is clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<ClientsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]); // Toggle Apple (currently active)
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          clients: expect.arrayContaining([
            expect.objectContaining({
              id: 'client-1',
              name: 'Apple Inc.',
              isActive: false, // Should be toggled to false
            }),
          ]),
        });
      });
      
      expect(toast.success).toHaveBeenCalledWith('Client désactivé avec succès');
    });

    it('shows remove confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const deleteButtons = screen.getAllByLabelText('Supprimer le client');
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Supprimer le client')).toBeInTheDocument();
        expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer le client "Apple Inc."/)).toBeInTheDocument();
      });
    });

    it('removes client when deletion is confirmed', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<ClientsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const deleteButtons = screen.getAllByLabelText('Supprimer le client');
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Supprimer le client')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Supprimer');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          clients: expect.arrayContaining([
            expect.objectContaining({ id: 'client-2' }),
            expect.objectContaining({ id: 'client-3' }),
          ]),
        });
      });
    });
  });

  describe('Add Client Dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau client')).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      
      const addButton = screen.getByText('Ajouter le client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Le nom du client est requis')).toBeInTheDocument();
        expect(screen.getByText('La description est requise')).toBeInTheDocument();
        expect(screen.getByText('Le secteur d\'activité est requis')).toBeInTheDocument();
      });
    });

    it('validates field length limits', async () => {
      const user = userEvent.setup();
      
      const nameInput = screen.getByLabelText(/Nom du client/);
      const descriptionInput = screen.getByLabelText(/Description/);
      
      // Test name length limit
      await user.type(nameInput, 'A'.repeat(101));
      
      // Test description length limit
      await user.type(descriptionInput, 'B'.repeat(301));
      
      const addButton = screen.getByText('Ajouter le client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Le nom ne peut pas dépasser 100 caractères')).toBeInTheDocument();
        expect(screen.getByText('La description ne peut pas dépasser 300 caractères')).toBeInTheDocument();
      });
    });

    it('adds new client with valid data', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      // Re-render with mock onChange
      render(<ClientsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const addButton = screen.getByText('Ajouter un client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau client')).toBeInTheDocument();
      });
      
      // Fill form
      const nameInput = screen.getByLabelText(/Nom du client/);
      const descriptionInput = screen.getByLabelText(/Description/);
      const industrySelect = screen.getByRole('combobox');
      
      await user.type(nameInput, 'New Client');
      await user.type(descriptionInput, 'A new client description');
      await user.click(industrySelect);
      
      const technologyOption = screen.getByText('Technologie');
      await user.click(technologyOption);
      
      const submitButton = screen.getByText('Ajouter le client');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          clients: expect.arrayContaining([
            expect.objectContaining({
              name: 'New Client',
              description: 'A new client description',
              industry: 'technology',
              isActive: true,
            }),
          ]),
        });
      });
      
      expect(toast.success).toHaveBeenCalledWith('Client ajouté avec succès');
    });

    it('handles logo upload', async () => {
      const user = userEvent.setup();
      
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' });
      const logoInput = document.getElementById('logo-upload-new') as HTMLInputElement;
      
      await user.upload(logoInput, file);
      
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(toast.success).toHaveBeenCalledWith('Logo ajouté avec succès');
      });
    });

    it('validates logo file type', async () => {
      const user = userEvent.setup();
      
      const file = new File(['invalid content'], 'document.pdf', { type: 'application/pdf' });
      const logoInput = document.getElementById('logo-upload-new') as HTMLInputElement;
      
      await user.upload(logoInput, file);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Veuillez sélectionner un fichier SVG, PNG, JPG ou WebP');
      });
    });

    it('validates logo file size', async () => {
      const user = userEvent.setup();
      
      // Create a file larger than 2MB
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large-logo.png', { type: 'image/png' });
      const logoInput = document.getElementById('logo-upload-new') as HTMLInputElement;
      
      await user.upload(logoInput, largeFile);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('La taille du fichier ne doit pas dépasser 2MB');
      });
    });

    it('removes logo when X button is clicked', async () => {
      const user = userEvent.setup();
      
      // First upload a logo
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' });
      const logoInput = document.getElementById('logo-upload-new') as HTMLInputElement;
      await user.upload(logoInput, file);
      
      await waitFor(() => {
        expect(screen.getByAltText('Logo du client')).toBeInTheDocument();
      });
      
      // Then remove it - find the X button in the dialog
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(button => 
        button.querySelector('svg')?.classList.contains('lucide-x')
      );
      await user.click(removeButton!);
      
      await waitFor(() => {
        expect(screen.queryByAltText('Logo du client')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Client Dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText('Modifier le client');
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Modifier le client')).toBeInTheDocument();
      });
    });

    it('pre-fills form with existing client data', () => {
      expect(screen.getByDisplayValue('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Leader mondial de la technologie')).toBeInTheDocument();
    });

    it('updates client with modified data', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      // Re-render with mock onChange
      render(<ClientsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const editButtons = screen.getAllByLabelText('Modifier le client');
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Modifier le client')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Apple Inc.')).toBeInTheDocument();
      });
      
      // Modify name
      const nameInput = screen.getByDisplayValue('Apple Inc.');
      await user.clear(nameInput);
      await user.type(nameInput, 'Apple Corporation');
      
      // Wait for the input to be updated
      await waitFor(() => {
        expect(screen.getByDisplayValue('Apple Corporation')).toBeInTheDocument();
      });
      
      const saveButton = screen.getByText('Sauvegarder les modifications');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          clients: expect.arrayContaining([
            expect.objectContaining({
              id: 'client-1',
              name: 'Apple Corporation',
            }),
          ]),
        });
      }, { timeout: 3000 });
      
      expect(toast.success).toHaveBeenCalledWith('Client modifié avec succès');
    });
  });

  describe('Industry Grouping', () => {
    it('displays clients grouped by industry in preview', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      expect(screen.getByText('Aperçu par secteur d\'activité')).toBeInTheDocument();
      expect(screen.getAllByText('Technologie')).toHaveLength(3); // 2 badges + 1 heading
      expect(screen.getAllByText('Finance')).toHaveLength(2); // 1 badge + 1 heading
    });

    it('shows correct client count per industry', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      // Technology should have 2 clients (Apple and Microsoft)
      const technologyHeadings = screen.getAllByText('Technologie');
      const technologySection = technologyHeadings.find(el => el.tagName === 'H4')?.closest('div');
      expect(within(technologySection!).getByText('2')).toBeInTheDocument();
      
      // Finance should have 1 client (Goldman Sachs)
      const financeHeadings = screen.getAllByText('Finance');
      const financeSection = financeHeadings.find(el => el.tagName === 'H4')?.closest('div');
      expect(within(financeSection!).getByText('1')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag and drop reordering', async () => {
      const mockOnChange = vi.fn();
      render(<ClientsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const dndContext = screen.getByTestId('dnd-context');
      fireEvent.drop(dndContext);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Ordre des clients mis à jour');
      });
    });
  });

  describe('Save and Preview', () => {
    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      render(<ClientsEditor {...defaultProps} onSave={mockOnSave} />);
      
      // Make a change to enable save button
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      
      await waitFor(() => {
        expect(screen.getByText('(Modifications non sauvegardées)')).toBeInTheDocument();
      });
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Section Clients sauvegardée avec succès');
      });
    });

    it('calls onPreview when preview button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPreview = vi.fn();
      render(<ClientsEditor {...defaultProps} onPreview={mockOnPreview} />);
      
      const previewButton = screen.getByText('Prévisualiser');
      await user.click(previewButton);
      
      expect(mockOnPreview).toHaveBeenCalledWith(mockData);
    });

    it('shows loading state when saving', () => {
      render(<ClientsEditor {...defaultProps} isSaving={true} />);
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      expect(saveButton).toBeDisabled();
      expect(within(saveButton).getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('handles save error', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(<ClientsEditor {...defaultProps} onSave={mockOnSave} />);
      
      // Make a change to enable save button
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      
      await waitFor(() => {
        expect(screen.getByText('(Modifications non sauvegardées)')).toBeInTheDocument();
      });
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde: Save failed');
      });
    });
  });

  describe('Validation Errors', () => {
    it('displays validation errors from props', () => {
      const errors: ValidationError[] = [
        {
          field: 'clients',
          section: 'clients',
          message: 'Au moins un client est requis',
          severity: 'error',
        },
      ];
      
      render(<ClientsEditor {...defaultProps} errors={errors} />);
      
      expect(screen.getByText('Erreurs de validation détectées :')).toBeInTheDocument();
      expect(screen.getByText('Au moins un client est requis')).toBeInTheDocument();
    });

    it('shows unsaved changes warning', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      // Make a change
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Vous avez des modifications non sauvegardées. N\'oubliez pas de sauvegarder et publier vos changements.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      expect(screen.getAllByLabelText('Glisser pour réorganiser')).toHaveLength(3);
      expect(screen.getAllByLabelText('Modifier le client')).toHaveLength(3);
      expect(screen.getAllByLabelText('Supprimer le client')).toHaveLength(3);
    });

    it('has proper form labels', async () => {
      const user = userEvent.setup();
      render(<ClientsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un client');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Nom du client/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
        expect(screen.getByText(/Secteur d'activité/)).toBeInTheDocument();
        expect(screen.getByLabelText('Client actif')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles maximum client limit', () => {
      const maxClients = Array.from({ length: 50 }, (_, i) => ({
        id: `client-${i + 1}`,
        name: `Client ${i + 1}`,
        logo: '',
        description: `Description ${i + 1}`,
        industry: 'technology',
        order: i + 1,
        isActive: true,
      }));
      
      const maxData: ClientsData = { clients: maxClients };
      render(<ClientsEditor {...defaultProps} data={maxData} />);
      
      expect(screen.getByText('Vous avez atteint le nombre maximum de clients (50). Supprimez un client existant pour en ajouter un nouveau.')).toBeInTheDocument();
      
      const addButton = screen.getByText('Ajouter un client');
      expect(addButton).toBeDisabled();
    });

    it('handles empty industry grouping', () => {
      const emptyData: ClientsData = { clients: [] };
      render(<ClientsEditor {...defaultProps} data={emptyData} />);
      
      expect(screen.queryByText('Aperçu par secteur d\'activité')).not.toBeInTheDocument();
    });

    it('handles clients without logos', () => {
      render(<ClientsEditor {...defaultProps} />);
      
      // Goldman Sachs has no logo - check that it renders with building icon
      const goldmanCards = screen.getAllByText('Goldman Sachs');
      expect(goldmanCards.length).toBeGreaterThan(0);
      expect(goldmanCards[0]).toBeInTheDocument();
    });
  });
});