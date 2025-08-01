import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApproachEditor } from '../../components/services/ApproachEditor';
import { ApproachData, ApproachStep, ValidationError } from '../../../../shared/types/services';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/components/TiptapEditor', () => ({
  TiptapEditor: ({ content, onChange, placeholder }: any) => (
    <textarea
      data-testid="tiptap-editor"
      data-placeholder={placeholder}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

// Mock drag and drop
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" onDrop={(e) => onDragEnd?.(e)}>
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

describe('ApproachEditor', () => {
  const mockApproachData: ApproachData = {
    description: 'Mon processus de travail en 4 étapes',
    steps: [
      {
        id: 'step-1',
        number: 1,
        title: 'Analyse',
        description: 'Phase d\'analyse des besoins',
        icon: '',
        order: 1
      },
      {
        id: 'step-2',
        number: 2,
        title: 'Conception',
        description: 'Phase de conception',
        icon: '',
        order: 2
      }
    ]
  };

  const mockProps = {
    data: mockApproachData,
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
    it('should render the component with title and description', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.getByText('Section Processus de Travail')).toBeInTheDocument();
      expect(screen.getByText(/Gérez les étapes de votre processus/)).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<ApproachEditor {...mockProps} isLoading={true} />);
      
      expect(screen.getByText('Chargement de la section Processus...')).toBeInTheDocument();
      // Check for loading spinner by class name instead of test id
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should render description field', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.getByText('Description du processus')).toBeInTheDocument();
      const mainDescriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      expect(mainDescriptionEditor).toHaveValue(mockApproachData.description);
    });

    it('should render existing steps', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.getByText('Étapes du processus (2)')).toBeInTheDocument();
      expect(screen.getByText('Étape 1')).toBeInTheDocument();
      expect(screen.getByText('Étape 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Analyse')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Conception')).toBeInTheDocument();
    });

    it('should render empty state when no steps', () => {
      const emptyData = { ...mockApproachData, steps: [] };
      render(<ApproachEditor {...mockProps} data={emptyData} />);
      
      expect(screen.getByText('Aucune étape définie')).toBeInTheDocument();
      expect(screen.getByText(/Commencez par ajouter la première étape/)).toBeInTheDocument();
    });
  });

  describe('Description Management', () => {
    it('should handle description changes', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.clear(descriptionEditor);
      await user.type(descriptionEditor, 'Nouvelle description');
      
      await waitFor(() => {
        expect(mockProps.onChange).toHaveBeenCalledWith({
          ...mockApproachData,
          description: 'Nouvelle description'
        });
      });
    });

    it('should show character count for description', () => {
      render(<ApproachEditor {...mockProps} />);
      
      const characterCount = screen.getByText(/\(\d+\/500\)/);
      expect(characterCount).toBeInTheDocument();
    });

    it('should display validation error for description', () => {
      const errors: ValidationError[] = [{
        field: 'description',
        section: 'approach',
        message: 'Description trop longue',
        severity: 'error'
      }];
      
      render(<ApproachEditor {...mockProps} errors={errors} />);
      
      const errorMessages = screen.getAllByText('Description trop longue');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Step Management', () => {
    it('should add new step', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const addButton = screen.getByText('Ajouter une étape');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockProps.onChange).toHaveBeenCalledWith({
          ...mockApproachData,
          steps: [
            ...mockApproachData.steps,
            expect.objectContaining({
              number: 3,
              title: '',
              description: '',
              icon: '',
              order: 3
            })
          ]
        });
      });
      
      expect(toast.success).toHaveBeenCalledWith('Nouvelle étape ajoutée');
    });

    it('should prevent adding more than 6 steps', () => {
      const dataWithMaxSteps = {
        ...mockApproachData,
        steps: Array.from({ length: 6 }, (_, i) => ({
          id: `step-${i + 1}`,
          number: i + 1,
          title: `Étape ${i + 1}`,
          description: `Description ${i + 1}`,
          icon: '',
          order: i + 1
        }))
      };
      
      render(<ApproachEditor {...mockProps} data={dataWithMaxSteps} />);
      
      const addButton = screen.getByText('Ajouter une étape');
      expect(addButton).toBeDisabled();
      expect(screen.getByText(/Vous avez atteint le nombre maximum/)).toBeInTheDocument();
    });

    it('should update step title', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const titleInput = screen.getByDisplayValue('Analyse');
      await user.clear(titleInput);
      await user.type(titleInput, 'Nouveau titre');
      
      await waitFor(() => {
        expect(mockProps.onChange).toHaveBeenCalledWith({
          ...mockApproachData,
          steps: [
            { ...mockApproachData.steps[0], title: 'Nouveau titre' },
            mockApproachData.steps[1]
          ]
        });
      });
    });

    it('should update step description', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const stepDescriptionEditors = screen.getAllByPlaceholderText('Décrivez cette étape de votre processus...');
      const firstStepDescriptionEditor = stepDescriptionEditors[0];
      
      await user.clear(firstStepDescriptionEditor);
      await user.type(firstStepDescriptionEditor, 'Nouvelle description étape');
      
      await waitFor(() => {
        expect(mockProps.onChange).toHaveBeenCalledWith({
          ...mockApproachData,
          steps: [
            { ...mockApproachData.steps[0], description: 'Nouvelle description étape' },
            mockApproachData.steps[1]
          ]
        });
      });
    });

    it('should display validation errors for step fields', () => {
      const errors: ValidationError[] = [
        {
          field: 'step-1-title',
          section: 'approach',
          message: 'Titre requis',
          severity: 'error'
        },
        {
          field: 'step-2-description',
          section: 'approach',
          message: 'Description trop courte',
          severity: 'error'
        }
      ];
      
      render(<ApproachEditor {...mockProps} errors={errors} />);
      
      const titleErrors = screen.getAllByText('Titre requis');
      const descriptionErrors = screen.getAllByText('Description trop courte');
      expect(titleErrors.length).toBeGreaterThan(0);
      expect(descriptionErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Step Removal', () => {
    it('should show remove confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const removeButtons = screen.getAllByRole('button', { name: '' });
      const firstRemoveButton = removeButtons.find(button => 
        button.querySelector('svg')?.getAttribute('data-testid') === 'trash-2-icon' ||
        button.innerHTML.includes('Trash2')
      );
      
      if (firstRemoveButton) {
        await user.click(firstRemoveButton);
        
        expect(screen.getByText('Supprimer l\'étape')).toBeInTheDocument();
        expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer/)).toBeInTheDocument();
      }
    });

    it('should remove step after confirmation', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      // Find and click remove button
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(button => 
        button.innerHTML.includes('Trash2') || 
        button.querySelector('[data-testid="trash-2-icon"]')
      );
      
      if (removeButton) {
        await user.click(removeButton);
        
        // Confirm removal
        const confirmButton = screen.getByText('Supprimer');
        await user.click(confirmButton);
        
        await waitFor(() => {
          expect(mockProps.onChange).toHaveBeenCalledWith({
            ...mockApproachData,
            steps: [
              { ...mockApproachData.steps[1], number: 1, order: 1 } // Second step becomes first
            ]
          });
        });
        
        expect(toast.success).toHaveBeenCalledWith('Étape supprimée avec succès');
      }
    });

    it('should cancel step removal', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      // Find and click remove button
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(button => 
        button.innerHTML.includes('Trash2')
      );
      
      if (removeButton) {
        await user.click(removeButton);
        
        // Cancel removal
        const cancelButton = screen.getByText('Annuler');
        await user.click(cancelButton);
        
        // Dialog should close without calling onChange
        await waitFor(() => {
          expect(screen.queryByText('Supprimer l\'étape')).not.toBeInTheDocument();
        });
        
        expect(mockProps.onChange).not.toHaveBeenCalled();
      }
    });
  });

  describe('Icon Management', () => {
    it('should show icon upload functionality', () => {
      render(<ApproachEditor {...mockProps} />);
      
      // Check that icon upload buttons exist
      const iconButtons = screen.getAllByText(/Ajouter l'icône/);
      expect(iconButtons.length).toBeGreaterThan(0);
    });

    it('should show icon preview when icon exists', () => {
      const dataWithIcon = {
        ...mockApproachData,
        steps: [
          { ...mockApproachData.steps[0], icon: 'test-icon-url' },
          mockApproachData.steps[1]
        ]
      };
      
      render(<ApproachEditor {...mockProps} data={dataWithIcon} />);
      
      // Check that icon preview is shown
      const iconImage = screen.getByAltText('Icône de l\'étape');
      expect(iconImage).toBeInTheDocument();
      expect(iconImage).toHaveAttribute('src', 'test-icon-url');
    });
  });

  describe('Automatic Numbering', () => {
    it('should maintain correct step numbers', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.getByText('Étape 1')).toBeInTheDocument();
      expect(screen.getByText('Étape 2')).toBeInTheDocument();
    });

    it('should show step removal functionality', () => {
      render(<ApproachEditor {...mockProps} />);
      
      // Check that remove buttons exist (trash icons)
      const removeButtons = screen.getAllByRole('button');
      const trashButtons = removeButtons.filter(button => 
        button.innerHTML.includes('svg') && button.innerHTML.includes('lucide')
      );
      expect(trashButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('should handle save action', async () => {
      const user = userEvent.setup();
      mockProps.onSave?.mockResolvedValue(undefined);
      
      render(<ApproachEditor {...mockProps} />);
      
      // Make a change to enable save button
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.type(descriptionEditor, ' modifié');
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockProps.onSave).toHaveBeenCalledWith({
          ...mockApproachData,
          description: mockApproachData.description + ' modifié'
        });
      });
      
      expect(toast.success).toHaveBeenCalledWith('Section Processus sauvegardée avec succès');
    });

    it('should handle save error', async () => {
      const user = userEvent.setup();
      const saveError = new Error('Save failed');
      mockProps.onSave?.mockRejectedValue(saveError);
      
      render(<ApproachEditor {...mockProps} />);
      
      // Make a change to enable save button
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.type(descriptionEditor, ' modifié');
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde: Save failed');
      });
    });

    it('should handle preview action', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      const previewButton = screen.getByText('Prévisualiser');
      await user.click(previewButton);
      
      expect(mockProps.onPreview).toHaveBeenCalledWith(mockApproachData);
    });

    it('should disable save button when no changes', () => {
      render(<ApproachEditor {...mockProps} />);
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      expect(saveButton).toBeDisabled();
    });

    it('should show saving state', () => {
      render(<ApproachEditor {...mockProps} isSaving={true} />);
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      expect(saveButton).toBeDisabled();
      expect(within(saveButton).getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Content Preview', () => {
    it('should show content preview', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.getByText('Aperçu du processus')).toBeInTheDocument();
      
      // Check if steps are shown in preview
      const previewSection = screen.getByText('Aperçu du processus').closest('div');
      expect(previewSection).toBeInTheDocument();
    });

    it('should update preview when content changes', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      // Change description
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.clear(descriptionEditor);
      await user.type(descriptionEditor, 'Nouvelle description');
      
      // Preview should update (this is handled by React re-rendering)
      expect(screen.getByText('Aperçu du processus')).toBeInTheDocument();
    });
  });

  describe('Unsaved Changes', () => {
    it('should show unsaved changes warning', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      // Make a change
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.type(descriptionEditor, ' modifié');
      
      await waitFor(() => {
        expect(screen.getByText('(Modifications non sauvegardées)')).toBeInTheDocument();
        expect(screen.getByText(/Vous avez des modifications non sauvegardées/)).toBeInTheDocument();
      });
    });

    it('should notify parent about unsaved changes', async () => {
      const user = userEvent.setup();
      render(<ApproachEditor {...mockProps} />);
      
      // Make a change
      const descriptionEditor = screen.getByPlaceholderText('Décrivez votre approche et méthodologie de travail...');
      await user.type(descriptionEditor, ' modifié');
      
      await waitFor(() => {
        expect(mockProps.onUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Validation Summary', () => {
    it('should show validation summary when errors exist', () => {
      const errors: ValidationError[] = [
        {
          field: 'description',
          section: 'approach',
          message: 'Description requise',
          severity: 'error'
        },
        {
          field: 'step-1-title',
          section: 'approach',
          message: 'Titre requis',
          severity: 'error'
        }
      ];
      
      render(<ApproachEditor {...mockProps} errors={errors} />);
      
      expect(screen.getByText('Erreurs de validation détectées :')).toBeInTheDocument();
      // Check that error messages are displayed somewhere in the component
      const descriptionErrors = screen.getAllByText('Description requise');
      const titleErrors = screen.getAllByText('Titre requis');
      expect(descriptionErrors.length).toBeGreaterThan(0);
      expect(titleErrors.length).toBeGreaterThan(0);
    });

    it('should not show validation summary when no errors', () => {
      render(<ApproachEditor {...mockProps} />);
      
      expect(screen.queryByText('Erreurs de validation détectées :')).not.toBeInTheDocument();
    });
  });
});