import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeroSectionEditor } from '@/components/services/HeroSectionEditor';
import { HeroSectionData, ValidationError } from '../../../../shared/types/services';

// Mock TiptapEditor
vi.mock('@/components/TiptapEditor', () => ({
  TiptapEditor: ({ content, onChange }: { content: string; onChange: (content: string) => void }) => (
    <div data-testid="tiptap-editor">
      <textarea
        data-testid="rich-text-editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rich text editor"
      />
    </div>
  )
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('HeroSectionEditor', () => {
  const mockData: HeroSectionData = {
    title: 'Test Title',
    description: 'Test description with some content',
    highlightText: '17+ years'
  };

  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnUnsavedChanges = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('renders all form fields correctly', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/titre principal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/texte en surbrillance/i)).toBeInTheDocument();
    });

    it('displays initial data correctly', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description with some content')).toBeInTheDocument();
      expect(screen.getByDisplayValue('17+ years')).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      expect(screen.getByText(/chargement de la section hero/i)).toBeInTheDocument();
    });

    it('displays character counts for all fields', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('(10/200)')).toBeInTheDocument(); // Title count
      expect(screen.getByText('(9/50)')).toBeInTheDocument(); // Highlight text count
    });
  });

  describe('Field Editing', () => {
    it('handles title field changes', async () => {
      const user = userEvent.setup();
      
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');

      // Wait for debounced onChange
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockData,
          title: 'New Title'
        });
      }, { timeout: 500 });
    });

    it('handles description field changes through rich text editor', async () => {
      const user = userEvent.setup();
      
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const richTextEditor = screen.getByTestId('rich-text-editor');
      await user.clear(richTextEditor);
      await user.type(richTextEditor, 'New description with <strong>formatting</strong>');

      // Wait for debounced onChange
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockData,
          description: 'New description with <strong>formatting</strong>'
        });
      }, { timeout: 500 });
    });

    it('handles highlight text field changes', async () => {
      const user = userEvent.setup();
      
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const highlightInput = screen.getByLabelText(/texte en surbrillance/i);
      await user.clear(highlightInput);
      await user.type(highlightInput, '20+ years');

      // Wait for debounced onChange
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockData,
          highlightText: '20+ years'
        });
      }, { timeout: 500 });
    });

    it('updates character counts as user types', async () => {
      const user = userEvent.setup();
      
      render(
        <HeroSectionEditor
          data={{ title: '', description: '', highlightText: '' }}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, 'Hello');

      expect(screen.getByText('(5/200)')).toBeInTheDocument();
    });

    it('enforces maximum length limits', async () => {
      const user = userEvent.setup();
      
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      expect(titleInput).toHaveAttribute('maxLength', '200');

      const highlightInput = screen.getByLabelText(/texte en surbrillance/i);
      expect(highlightInput).toHaveAttribute('maxLength', '50');
    });
  });

  describe('Real-time Validation', () => {
    const validationErrors: ValidationError[] = [
      {
        field: 'title',
        section: 'hero',
        message: 'Title is required',
        severity: 'error'
      },
      {
        field: 'description',
        section: 'hero',
        message: 'Description must be less than 1000 characters',
        severity: 'error'
      },
      {
        field: 'highlightText',
        section: 'hero',
        message: 'Highlight text must be less than 50 characters',
        severity: 'error'
      }
    ];

    it('displays validation errors inline', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={validationErrors}
        />
      );

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description must be less than 1000 characters')).toBeInTheDocument();
      expect(screen.getByText('Highlight text must be less than 50 characters')).toBeInTheDocument();
    });

    it('applies error styling to invalid fields', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={validationErrors}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      const highlightInput = screen.getByLabelText(/texte en surbrillance/i);
      const richTextContainer = screen.getByTestId('tiptap-editor').parentElement;

      expect(titleInput).toHaveClass('border-red-500');
      expect(highlightInput).toHaveClass('border-red-500');
      expect(richTextContainer).toHaveClass('border-red-500');
    });

    it('clears validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={validationErrors}
        />
      );

      expect(screen.getByText('Title is required')).toBeInTheDocument();

      // Simulate fixing the title
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Fixed');

      // Rerender without the title error
      rerender(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={validationErrors.filter(e => e.field !== 'title')}
        />
      );

      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });

    it('displays validation summary when multiple errors exist', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={validationErrors}
        />
      );

      expect(screen.getByText(/erreurs de validation détectées/i)).toBeInTheDocument();
      expect(screen.getByText('title: Title is required')).toBeInTheDocument();
      expect(screen.getByText('description: Description must be less than 1000 characters')).toBeInTheDocument();
      expect(screen.getByText('highlightText: Highlight text must be less than 50 characters')).toBeInTheDocument();
    });
  });

  describe('Content Preview', () => {
    it('shows content preview when data is available', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/aperçu du contenu/i)).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('17+ years')).toBeInTheDocument();
    });

    it('hides preview when no content is available', () => {
      render(
        <HeroSectionEditor
          data={{ title: '', description: '', highlightText: '' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/aperçu du contenu/i)).not.toBeInTheDocument();
    });

    it('renders HTML content in description preview', () => {
      const dataWithHtml = {
        ...mockData,
        description: '<strong>Bold text</strong> and <em>italic text</em>'
      };

      render(
        <HeroSectionEditor
          data={dataWithHtml}
          onChange={mockOnChange}
        />
      );

      const previewContainer = screen.getByText(/aperçu du contenu/i).parentElement;
      expect(previewContainer?.innerHTML).toContain('<strong>Bold text</strong>');
      expect(previewContainer?.innerHTML).toContain('<em>italic text</em>');
    });
  });

  describe('Save and Preview Actions', () => {
    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onSave={mockOnSave}
        />
      );

      // Make a change to enable save button
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockData,
        title: 'Test Title Modified'
      });
    });

    it('calls onPreview when preview button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onPreview={mockOnPreview}
        />
      );

      const previewButton = screen.getByRole('button', { name: /prévisualiser/i });
      await user.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledWith(mockData);
    });

    it('disables save button when no changes are made', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      expect(saveButton).toBeDisabled();
    });

    it('shows loading state during save operation', async () => {
      const user = userEvent.setup();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onSave={mockOnSave}
          isSaving={true}
        />
      );

      // Make a change to enable save button
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      expect(saveButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      const saveError = new Error('Save failed');
      mockOnSave.mockRejectedValue(saveError);

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onSave={mockOnSave}
        />
      );

      // Make a change to enable save button
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Check that error toast was called
      const { toast } = await import('sonner');
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde: Save failed');
    });
  });

  describe('Unsaved Changes Handling', () => {
    it('tracks unsaved changes correctly', async () => {
      const user = userEvent.setup();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onUnsavedChanges={mockOnUnsavedChanges}
        />
      );

      // Initially no unsaved changes
      expect(mockOnUnsavedChanges).toHaveBeenCalledWith(false);

      // Make a change
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      // Should indicate unsaved changes
      await waitFor(() => {
        expect(mockOnUnsavedChanges).toHaveBeenCalledWith(true);
      });
    });

    it('shows unsaved changes warning', async () => {
      const user = userEvent.setup();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      // Make a change
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      await waitFor(() => {
        expect(screen.getByText(/modifications non sauvegardées/i)).toBeInTheDocument();
      });
    });

    it('clears unsaved changes after successful save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          onSave={mockOnSave}
          onUnsavedChanges={mockOnUnsavedChanges}
        />
      );

      // Make a change
      const titleInput = screen.getByLabelText(/titre principal/i);
      await user.type(titleInput, ' Modified');

      // Save the changes
      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnUnsavedChanges).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Rich Text Editing', () => {
    it('integrates with TiptapEditor for description field', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    });

    it('passes correct props to TiptapEditor', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const richTextEditor = screen.getByTestId('rich-text-editor');
      expect(richTextEditor).toHaveValue('Test description with some content');
    });

    it('handles rich text changes correctly', async () => {
      const user = userEvent.setup();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const richTextEditor = screen.getByTestId('rich-text-editor');
      await user.clear(richTextEditor);
      await user.type(richTextEditor, '<p>New <strong>formatted</strong> content</p>');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockData,
          description: '<p>New <strong>formatted</strong> content</p>'
        });
      }, { timeout: 500 });
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/titre principal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/texte en surbrillance/i)).toBeInTheDocument();
    });

    it('associates error messages with form fields', () => {
      const errors: ValidationError[] = [
        {
          field: 'title',
          section: 'hero',
          message: 'Title is required',
          severity: 'error'
        }
      ];

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
          errors={errors}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      const errorMessage = screen.getByText('Title is required');
      
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toBeInTheDocument();
    });

    it('provides helpful placeholder text', () => {
      render(
        <HeroSectionEditor
          data={{ title: '', description: '', highlightText: '' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText(/services de design & développement/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/17\+ années d'expérience/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      render(
        <HeroSectionEditor
          data={{ title: '', description: '', highlightText: '' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('')).toBeInTheDocument();
      expect(screen.getByText('(0/200)')).toBeInTheDocument();
      expect(screen.getByText('(0/50)')).toBeInTheDocument();
    });

    it('handles undefined highlightText', () => {
      const dataWithoutHighlight = {
        title: 'Test Title',
        description: 'Test description'
      };

      render(
        <HeroSectionEditor
          data={dataWithoutHighlight as HeroSectionData}
          onChange={mockOnChange}
        />
      );

      const highlightInput = screen.getByLabelText(/texte en surbrillance/i);
      expect(highlightInput).toHaveValue('');
    });

    it('handles very long content appropriately', () => {
      const longData = {
        title: 'A'.repeat(250), // Exceeds max length
        description: 'B'.repeat(1100), // Exceeds max length
        highlightText: 'C'.repeat(60) // Exceeds max length
      };

      render(
        <HeroSectionEditor
          data={longData}
          onChange={mockOnChange}
        />
      );

      // Should truncate to max length
      const titleInput = screen.getByLabelText(/titre principal/i) as HTMLInputElement;
      expect(titleInput.value.length).toBeLessThanOrEqual(200);
    });

    it('handles rapid successive changes correctly', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

      render(
        <HeroSectionEditor
          data={mockData}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByLabelText(/titre principal/i);
      
      // Make rapid changes
      await user.type(titleInput, '1');
      await user.type(titleInput, '2');
      await user.type(titleInput, '3');

      // Fast-forward timers to trigger debounced onChange
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should only call onChange once with final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        title: 'Test Title123'
      });

      vi.useRealTimers();
    });
  });
});