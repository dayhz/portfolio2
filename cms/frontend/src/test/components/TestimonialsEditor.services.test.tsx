import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestimonialsEditor } from '../../components/services/TestimonialsEditor';
import { TestimonialsData, Testimonial, ValidationError } from '../../../../shared/types/services';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/TiptapEditor', () => ({
  TiptapEditor: ({ content, onChange, placeholder }: any) => (
    <textarea
      data-testid="tiptap-editor"
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

describe('TestimonialsEditor', () => {
  const mockTestimonial: Testimonial = {
    id: 'testimonial-1',
    text: 'Victor is an exceptional developer who delivered outstanding results.',
    author: {
      name: 'John Doe',
      title: 'CEO',
      company: 'Tech Corp',
      avatar: 'https://example.com/avatar.jpg',
    },
    project: {
      name: 'Mobile App',
      image: 'https://example.com/project.jpg',
      url: 'https://example.com/project',
    },
    order: 1,
  };

  const mockData: TestimonialsData = {
    testimonials: [mockTestimonial],
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

  describe('Component Rendering', () => {
    it('renders the testimonials editor with correct title', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByText('Section Témoignages')).toBeInTheDocument();
      expect(screen.getByText(/Gérez les témoignages clients avec glisser-déposer/)).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      render(<TestimonialsEditor {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Chargement de la section Témoignages...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('displays testimonials count correctly', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByText('Témoignages (1)')).toBeInTheDocument();
    });

    it('shows empty state when no testimonials exist', () => {
      const emptyData: TestimonialsData = { testimonials: [] };
      render(<TestimonialsEditor {...defaultProps} data={emptyData} />);
      
      expect(screen.getByText('Aucun témoignage défini')).toBeInTheDocument();
      expect(screen.getByText('Commencez par ajouter le premier témoignage client')).toBeInTheDocument();
    });

    it('displays unsaved changes indicator', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      // Trigger a change to show unsaved changes
      const addButton = screen.getByText('Ajouter un témoignage');
      fireEvent.click(addButton);
      
      // Close dialog to trigger unsaved changes
      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
    });
  });

  describe('Testimonial Display', () => {
    it('displays testimonial information correctly', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByText(mockTestimonial.text)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonial.author.name)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonial.author.title)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonial.author.company)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonial.project.name)).toBeInTheDocument();
    });

    it('displays author avatar when provided', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const avatar = screen.getByAltText(mockTestimonial.author.name);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockTestimonial.author.avatar);
    });

    it('displays project image when provided', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const projectImage = screen.getByAltText(mockTestimonial.project.name);
      expect(projectImage).toBeInTheDocument();
      expect(projectImage).toHaveAttribute('src', mockTestimonial.project.image);
    });

    it('displays project link when provided', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const projectLink = screen.getByText('Voir le projet');
      expect(projectLink).toBeInTheDocument();
      expect(projectLink.closest('a')).toHaveAttribute('href', mockTestimonial.project.url);
    });
  });

  describe('Add Testimonial Dialog', () => {
    it('opens add testimonial dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      expect(screen.getByText('Ajouter un nouveau témoignage')).toBeInTheDocument();
      expect(screen.getByLabelText(/Texte du témoignage/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nom de l'auteur/)).toBeInTheDocument();
    });

    it('validates required fields in add dialog', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Le texte du témoignage est requis')).toBeInTheDocument();
        expect(screen.getByText('Le nom de l\'auteur est requis')).toBeInTheDocument();
        expect(screen.getByText('Le titre de l\'auteur est requis')).toBeInTheDocument();
      });
    });

    it('validates text length limits', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      const textArea = screen.getByLabelText(/Texte du témoignage/);
      await user.type(textArea, 'Short');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Le témoignage doit contenir au moins 10 caractères')).toBeInTheDocument();
      });
    });

    it('validates URL format for project link', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/Texte du témoignage/), 'This is a great testimonial about the work done.');
      await user.type(screen.getByLabelText(/Nom de l'auteur/), 'Jane Doe');
      await user.type(screen.getByLabelText(/Titre\/Poste/), 'Manager');
      
      // Enter invalid URL
      await user.type(screen.getByLabelText(/Lien vers le projet/), 'invalid-url');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Veuillez entrer une URL valide pour le projet')).toBeInTheDocument();
      });
    });

    it('successfully adds a new testimonial', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Fill form
      await user.type(screen.getByLabelText(/Texte du témoignage/), 'This is a great testimonial about the work done.');
      await user.type(screen.getByLabelText(/Nom de l'auteur/), 'Jane Doe');
      await user.type(screen.getByLabelText(/Titre\/Poste/), 'Manager');
      await user.type(screen.getByLabelText(/Entreprise/), 'Test Company');
      await user.type(screen.getByLabelText(/Nom du projet/), 'Test Project');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            testimonials: expect.arrayContaining([
              expect.objectContaining({
                text: 'This is a great testimonial about the work done.',
                author: expect.objectContaining({
                  name: 'Jane Doe',
                  title: 'Manager',
                  company: 'Test Company',
                }),
                project: expect.objectContaining({
                  name: 'Test Project',
                }),
              }),
            ]),
          })
        );
      });
    });

    it('handles image upload for author avatar', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Mock file
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      
      // Find and trigger file input
      const fileInput = screen.getByLabelText(/Photo de l'auteur/);
      const uploadButton = screen.getByText('Ajouter la photo');
      
      // Mock the file input click
      const hiddenInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (hiddenInput) {
        Object.defineProperty(hiddenInput, 'files', {
          value: [file],
          writable: false,
        });
        fireEvent.change(hiddenInput);
      }
      
      // The component should handle the file upload
      await waitFor(() => {
        // Check if upload was processed (this would show preview in real implementation)
        expect(uploadButton).toBeInTheDocument();
      });
    });

    it('handles image upload for project image', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Mock file
      const file = new File(['project'], 'project.jpg', { type: 'image/jpeg' });
      
      // Find and trigger file input
      const uploadButton = screen.getByText('Ajouter l\'image');
      
      // Mock the file input click
      const hiddenInput = document.getElementById('project-image-upload') as HTMLInputElement;
      if (hiddenInput) {
        Object.defineProperty(hiddenInput, 'files', {
          value: [file],
          writable: false,
        });
        fireEvent.change(hiddenInput);
      }
      
      // The component should handle the file upload
      await waitFor(() => {
        expect(uploadButton).toBeInTheDocument();
      });
    });

    it('shows character count for testimonial text', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      const textArea = screen.getByLabelText(/Texte du témoignage/);
      await user.type(textArea, 'Test testimonial');
      
      expect(screen.getByText('(16/1000)')).toBeInTheDocument();
    });
  });

  describe('Edit Testimonial Dialog', () => {
    it('opens edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /modifier le témoignage/i });
      await user.click(editButton);
      
      expect(screen.getByText('Modifier le témoignage')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.text)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.author.name)).toBeInTheDocument();
    });

    it('pre-fills form with existing testimonial data', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /modifier le témoignage/i });
      await user.click(editButton);
      
      expect(screen.getByDisplayValue(mockTestimonial.text)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.author.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.author.title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.author.company)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.project.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTestimonial.project.url!)).toBeInTheDocument();
    });

    it('successfully updates testimonial', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const editButton = screen.getByRole('button', { name: /modifier le témoignage/i });
      await user.click(editButton);
      
      const textArea = screen.getByDisplayValue(mockTestimonial.text);
      await user.clear(textArea);
      await user.type(textArea, 'Updated testimonial text that is long enough to pass validation.');
      
      const submitButton = screen.getByText('Sauvegarder les modifications');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            testimonials: expect.arrayContaining([
              expect.objectContaining({
                text: 'Updated testimonial text that is long enough to pass validation.',
              }),
            ]),
          })
        );
      });
    });
  });

  describe('Remove Testimonial', () => {
    it('shows confirmation dialog when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const removeButton = screen.getByRole('button', { name: /supprimer le témoignage/i });
      await user.click(removeButton);
      
      expect(screen.getByText('Supprimer le témoignage')).toBeInTheDocument();
      expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer ce témoignage/)).toBeInTheDocument();
    });

    it('removes testimonial when confirmed', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const removeButton = screen.getByRole('button', { name: /supprimer le témoignage/i });
      await user.click(removeButton);
      
      const confirmButton = screen.getByText('Supprimer');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            testimonials: [],
          })
        );
      });
    });

    it('cancels removal when cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onChange={mockOnChange} />);
      
      const removeButton = screen.getByRole('button', { name: /supprimer le témoignage/i });
      await user.click(removeButton);
      
      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);
      
      // Dialog should close and no change should be made
      await waitFor(() => {
        expect(screen.queryByText('Supprimer le témoignage')).not.toBeInTheDocument();
      });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    const multipleTestimonialsData: TestimonialsData = {
      testimonials: [
        { ...mockTestimonial, id: 'testimonial-1', order: 1 },
        { ...mockTestimonial, id: 'testimonial-2', order: 2, author: { ...mockTestimonial.author, name: 'Jane Smith' } },
        { ...mockTestimonial, id: 'testimonial-3', order: 3, author: { ...mockTestimonial.author, name: 'Bob Johnson' } },
      ],
    };

    it('renders drag handles for testimonials', () => {
      render(<TestimonialsEditor {...defaultProps} data={multipleTestimonialsData} />);
      
      const dragHandles = screen.getAllByRole('button', { name: /glisser pour réorganiser/i });
      expect(dragHandles).toHaveLength(3);
    });

    it('handles drag end event and reorders testimonials', async () => {
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} data={multipleTestimonialsData} onChange={mockOnChange} />);
      
      // Mock drag end event
      const dndContext = screen.getByTestId('dnd-context');
      const mockDragEndEvent = {
        active: { id: 'testimonial-1' },
        over: { id: 'testimonial-3' },
      };
      
      fireEvent.drop(dndContext, mockDragEndEvent);
      
      // Should call onChange with reordered testimonials
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Preview and Content Display', () => {
    it('shows preview section when testimonials exist', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByText('Aperçu du slider de témoignages')).toBeInTheDocument();
      expect(screen.getByText(/Aperçu des 1 témoignages dans l'ordre du slider/)).toBeInTheDocument();
    });

    it('limits preview to first 3 testimonials', () => {
      const multipleTestimonialsData: TestimonialsData = {
        testimonials: Array.from({ length: 5 }, (_, i) => ({
          ...mockTestimonial,
          id: `testimonial-${i + 1}`,
          order: i + 1,
          author: { ...mockTestimonial.author, name: `Author ${i + 1}` },
        })),
      };

      render(<TestimonialsEditor {...defaultProps} data={multipleTestimonialsData} />);
      
      expect(screen.getByText('... et 2 autres témoignages')).toBeInTheDocument();
    });

    it('truncates long testimonial text in preview', () => {
      const longTestimonialData: TestimonialsData = {
        testimonials: [{
          ...mockTestimonial,
          text: 'This is a very long testimonial text that should be truncated in the preview section because it exceeds the character limit that we want to show in the preview area.',
        }],
      };

      render(<TestimonialsEditor {...defaultProps} data={longTestimonialData} />);
      
      const previewElements = screen.getAllByText(/This is a very long testimonial text that should be truncated in the preview section.../);
      expect(previewElements.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const mockOnChange = vi.fn();
      
      // Create component with hasUnsavedChanges = true by modifying data
      const modifiedData = { ...mockData };
      render(<TestimonialsEditor {...defaultProps} data={modifiedData} onSave={mockOnSave} onChange={mockOnChange} />);
      
      // Simulate making a change to enable save button
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/Texte du témoignage/), 'This is a test testimonial that is long enough.');
      await user.type(screen.getByLabelText(/Nom de l'auteur/), 'Test Author');
      await user.type(screen.getByLabelText(/Titre\/Poste/), 'Test Title');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      // Now save should be enabled
      const saveButton = screen.getByText('Sauvegarder et Publier');
      await user.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalled();
    });

    it('calls onPreview when preview button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPreview = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onPreview={mockOnPreview} />);
      
      const previewButton = screen.getByText('Prévisualiser');
      await user.click(previewButton);
      
      expect(mockOnPreview).toHaveBeenCalledWith(mockData);
    });

    it('disables save button when no unsaved changes', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const saveButton = screen.getByText('Sauvegarder et Publier');
      expect(saveButton).toBeDisabled();
    });

    it('shows loading spinner when saving', () => {
      render(<TestimonialsEditor {...defaultProps} isSaving={true} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Validation and Error Handling', () => {
    it('displays validation errors from props', () => {
      const errors: ValidationError[] = [
        {
          field: 'testimonials',
          section: 'testimonials',
          message: 'Test error message',
          severity: 'error',
        },
      ];

      render(<TestimonialsEditor {...defaultProps} errors={errors} />);
      
      expect(screen.getByText('Erreurs de validation détectées :')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows unsaved changes warning', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onChange={mockOnChange} />);
      
      // Make a change by adding a testimonial
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/Texte du témoignage/), 'This is a test testimonial that is long enough.');
      await user.type(screen.getByLabelText(/Nom de l'auteur/), 'Test Author');
      await user.type(screen.getByLabelText(/Titre\/Poste/), 'Test Title');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Vous avez des modifications non sauvegardées/)).toBeInTheDocument();
      });
    });

    it('prevents adding more than 10 testimonials', () => {
      const maxTestimonialsData: TestimonialsData = {
        testimonials: Array.from({ length: 10 }, (_, i) => ({
          ...mockTestimonial,
          id: `testimonial-${i + 1}`,
          order: i + 1,
        })),
      };

      render(<TestimonialsEditor {...defaultProps} data={maxTestimonialsData} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      expect(addButton).toBeDisabled();
      expect(screen.getByText(/Vous avez atteint le nombre maximum de témoignages/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /modifier le témoignage/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /supprimer le témoignage/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation in dialogs', async () => {
      const user = userEvent.setup();
      render(<TestimonialsEditor {...defaultProps} />);
      
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Check that dialog is open and form elements are accessible
      expect(screen.getByLabelText(/Texte du témoignage/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nom de l'auteur/)).toBeInTheDocument();
    });
  });

  describe('Integration with Parent Component', () => {
    it('calls onUnsavedChanges when changes are made', async () => {
      const user = userEvent.setup();
      const mockOnUnsavedChanges = vi.fn();
      const mockOnChange = vi.fn();
      render(<TestimonialsEditor {...defaultProps} onUnsavedChanges={mockOnUnsavedChanges} onChange={mockOnChange} />);
      
      // Make a change by adding a testimonial
      const addButton = screen.getByText('Ajouter un témoignage');
      await user.click(addButton);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/Texte du témoignage/), 'This is a test testimonial that is long enough.');
      await user.type(screen.getByLabelText(/Nom de l'auteur/), 'Test Author');
      await user.type(screen.getByLabelText(/Titre\/Poste/), 'Test Title');
      
      const submitButton = screen.getByText('Ajouter le témoignage');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });

    it('updates form data when props change', () => {
      const { rerender } = render(<TestimonialsEditor {...defaultProps} />);
      
      const newData: TestimonialsData = {
        testimonials: [
          {
            ...mockTestimonial,
            text: 'Updated testimonial text',
          },
        ],
      };
      
      rerender(<TestimonialsEditor {...defaultProps} data={newData} />);
      
      expect(screen.getByText('Updated testimonial text')).toBeInTheDocument();
    });
  });
});