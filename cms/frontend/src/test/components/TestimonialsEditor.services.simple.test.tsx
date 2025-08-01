import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('TestimonialsEditor - Core Functionality', () => {
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

  describe('Basic Rendering', () => {
    it('renders the testimonials editor with correct title', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      expect(screen.getByText('Section Témoignages')).toBeInTheDocument();
      expect(screen.getByText(/Gérez les témoignages clients/)).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      render(<TestimonialsEditor {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Chargement de la section Témoignages...')).toBeInTheDocument();
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
  });

  describe('Testimonial Display', () => {
    it('displays testimonial information correctly', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      // Check for testimonial text (there are multiple instances, so use getAllByText)
      const testimonialTexts = screen.getAllByText(`"${mockTestimonial.text}"`);
      expect(testimonialTexts.length).toBeGreaterThan(0);
      
      // Check for author information (there are multiple instances in main view and preview)
      const authorNames = screen.getAllByText(mockTestimonial.author.name);
      expect(authorNames.length).toBeGreaterThan(0);
      
      const authorTitles = screen.getAllByText(mockTestimonial.author.title);
      expect(authorTitles.length).toBeGreaterThan(0);
      
      const authorCompanies = screen.getAllByText(mockTestimonial.author.company);
      expect(authorCompanies.length).toBeGreaterThan(0);
      
      const projectNames = screen.getAllByText(mockTestimonial.project.name);
      expect(projectNames.length).toBeGreaterThan(0);
    });

    it('displays author avatar when provided', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const avatars = screen.getAllByAltText(mockTestimonial.author.name);
      expect(avatars.length).toBeGreaterThan(0);
      expect(avatars[0]).toHaveAttribute('src', mockTestimonial.author.avatar);
    });

    it('displays project image when provided', () => {
      render(<TestimonialsEditor {...defaultProps} />);
      
      const projectImage = screen.getByAltText(mockTestimonial.project.name);
      expect(projectImage).toBeInTheDocument();
      expect(projectImage).toHaveAttribute('src', mockTestimonial.project.image);
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
        // Look for validation errors in the form fields specifically
        const textErrors = screen.getAllByText('Le texte du témoignage est requis');
        const nameErrors = screen.getAllByText('Le nom de l\'auteur est requis');
        const titleErrors = screen.getAllByText('Le titre de l\'auteur est requis');
        
        expect(textErrors.length).toBeGreaterThan(0);
        expect(nameErrors.length).toBeGreaterThan(0);
        expect(titleErrors.length).toBeGreaterThan(0);
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
  });

  describe('Action Buttons', () => {
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
  });
});