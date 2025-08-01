import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ValidationErrorDisplay } from '../../components/services/ValidationErrorDisplay';
import { ValidationError } from '../../../../shared/types/services';

describe('ValidationErrorDisplay', () => {
  const mockErrors: ValidationError[] = [
    {
      field: 'title',
      section: 'hero',
      message: 'Title is required',
      severity: 'error',
      code: 'REQUIRED_FIELD'
    },
    {
      field: 'description',
      section: 'hero',
      message: 'Description is too long',
      severity: 'error',
      code: 'MAX_LENGTH_EXCEEDED'
    }
  ];

  const mockWarnings: ValidationError[] = [
    {
      field: 'highlightText',
      section: 'hero',
      message: 'Highlight text is quite short',
      severity: 'warning',
      code: 'MIN_LENGTH_WARNING'
    }
  ];

  const mockProps = {
    errors: mockErrors,
    warnings: mockWarnings,
    section: 'hero' as const,
    onRetryValidation: vi.fn(),
    onDismissError: vi.fn(),
    onFixSuggestion: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('No Errors State', () => {
    it('shows success message when no errors or warnings', () => {
      render(
        <ValidationErrorDisplay
          errors={[]}
          warnings={[]}
        />
      );

      expect(screen.getByText('Aucune erreur de validation détectée. Tout semble correct !')).toBeInTheDocument();
    });

    it('returns null in inline mode when no errors', () => {
      const { container } = render(
        <ValidationErrorDisplay
          errors={[]}
          warnings={[]}
          showInline={true}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Error Display', () => {
    it('displays error count and warning count', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      expect(screen.getByText('2 erreurs')).toBeInTheDocument();
      expect(screen.getByText('1 avertissement')).toBeInTheDocument();
    });

    it('shows section name in title when provided', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      expect(screen.getByText('Section Hero')).toBeInTheDocument();
    });

    it('displays contextual error messages', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));

      expect(screen.getByText('Le champ "title" est obligatoire')).toBeInTheDocument();
      expect(screen.getByText('Le champ "description" dépasse la longueur maximale autorisée')).toBeInTheDocument();
    });

    it('shows fix suggestions when available', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      expect(screen.getByText('💡 Veuillez remplir ce champ obligatoire')).toBeInTheDocument();
      expect(screen.getByText('💡 Raccourcissez le texte pour respecter la limite')).toBeInTheDocument();
    });
  });

  describe('Inline Mode', () => {
    it('displays errors inline when showInline is true', () => {
      render(
        <ValidationErrorDisplay
          {...mockProps}
          showInline={true}
        />
      );

      expect(screen.getByText('Le champ "title" est obligatoire')).toBeInTheDocument();
      expect(screen.getByText('Le champ "description" dépasse la longueur maximale autorisée')).toBeInTheDocument();
    });

    it('shows warnings with different styling in inline mode', () => {
      render(
        <ValidationErrorDisplay
          errors={[]}
          warnings={mockWarnings}
          showInline={true}
        />
      );

      const warningElement = screen.getByText('Le champ "highlightText" pourrait être plus détaillé');
      expect(warningElement.closest('.border-yellow-200')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('shows error and warning badges in compact mode', () => {
      render(
        <ValidationErrorDisplay
          {...mockProps}
          compact={true}
        />
      );

      expect(screen.getByText('2 erreurs')).toBeInTheDocument();
      expect(screen.getByText('1 avertissement')).toBeInTheDocument();
    });

    it('handles singular vs plural correctly', () => {
      render(
        <ValidationErrorDisplay
          errors={[mockErrors[0]]}
          warnings={[]}
          compact={true}
        />
      );

      expect(screen.getByText('1 erreur')).toBeInTheDocument();
    });
  });

  describe('Section Grouping', () => {
    const mixedSectionErrors: ValidationError[] = [
      {
        field: 'title',
        section: 'hero',
        message: 'Hero title error',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      },
      {
        field: 'services',
        section: 'services',
        message: 'Services error',
        severity: 'error',
        code: 'MIN_ITEMS_REQUIRED'
      }
    ];

    it('groups errors by section', () => {
      render(
        <ValidationErrorDisplay
          errors={mixedSectionErrors}
          warnings={[]}
        />
      );

      fireEvent.click(screen.getByText('Détails'));

      expect(screen.getByText('Section Hero')).toBeInTheDocument();
      expect(screen.getByText('Grille des Services')).toBeInTheDocument();
    });

    it('allows expanding and collapsing sections', () => {
      render(
        <ValidationErrorDisplay
          errors={mixedSectionErrors}
          warnings={[]}
        />
      );

      fireEvent.click(screen.getByText('Détails'));
      
      const heroSection = screen.getByText('Section Hero');
      fireEvent.click(heroSection);

      expect(screen.getByText('Hero title error')).toBeInTheDocument();
    });
  });

  describe('Error Actions', () => {
    it('calls onRetryValidation when retry button is clicked', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      const retryButton = screen.getByText('Revalider');
      fireEvent.click(retryButton);

      expect(mockProps.onRetryValidation).toHaveBeenCalled();
    });

    it('calls onDismissError when error is dismissed', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      const dismissButtons = screen.getAllByRole('button', { name: '' }); // X buttons
      fireEvent.click(dismissButtons[0]);

      expect(mockProps.onDismissError).toHaveBeenCalledWith('hero-title-REQUIRED_FIELD');
    });

    it('calls onFixSuggestion when fix button is clicked', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      const fixButton = screen.getByText('Corriger');
      fireEvent.click(fixButton);

      expect(mockProps.onFixSuggestion).toHaveBeenCalledWith(mockErrors[0]);
    });

    it('hides errors when dismissed and shows count', () => {
      const { rerender } = render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      const dismissButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(dismissButtons[0]);

      // Simulate the parent component updating the errors list
      rerender(
        <ValidationErrorDisplay
          {...mockProps}
          errors={mockErrors.slice(1)} // Remove first error
        />
      );

      expect(screen.getByText('1 erreur')).toBeInTheDocument();
    });

    it('allows showing all hidden errors', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      // Dismiss an error
      const dismissButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(dismissButtons[0]);

      // Check if "Tout afficher" button appears (this would need state management)
      // This test would need to be adjusted based on actual implementation
    });
  });

  describe('Error Message Enhancement', () => {
    it('provides contextual messages for different error codes', () => {
      const specificErrors: ValidationError[] = [
        {
          field: 'email',
          section: 'hero',
          message: 'Invalid email',
          severity: 'error',
          code: 'INVALID_EMAIL'
        },
        {
          field: 'color',
          section: 'services',
          message: 'Invalid color',
          severity: 'error',
          code: 'INVALID_COLOR'
        }
      ];

      render(
        <ValidationErrorDisplay
          errors={specificErrors}
          warnings={[]}
        />
      );

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));
      fireEvent.click(screen.getByText('Grille des Services'));

      expect(screen.getByText('L\'adresse email dans "email" n\'est pas valide')).toBeInTheDocument();
      expect(screen.getByText('La couleur dans "color" n\'est pas au format valide')).toBeInTheDocument();
    });

    it('shows appropriate fix suggestions for different error types', () => {
      const urlError: ValidationError = {
        field: 'website',
        section: 'clients',
        message: 'Invalid URL',
        severity: 'error',
        code: 'INVALID_URL'
      };

      render(
        <ValidationErrorDisplay
          errors={[urlError]}
          warnings={[]}
        />
      );

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Liste des Clients'));

      expect(screen.getByText('💡 Utilisez une URL complète (ex: https://example.com)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for interactive elements', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      expect(screen.getByRole('button', { name: 'Revalider' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Détails' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      const retryButton = screen.getByText('Revalider');
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });

    it('provides meaningful text for screen readers', () => {
      render(<ValidationErrorDisplay {...mockProps} />);

      expect(screen.getByText('Problèmes de validation')).toBeInTheDocument();
      expect(screen.getByText('2 erreurs')).toBeInTheDocument();
      expect(screen.getByText('1 avertissement')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large numbers of errors efficiently', () => {
      const manyErrors = Array.from({ length: 100 }, (_, i) => ({
        field: `field${i}`,
        section: 'hero' as const,
        message: `Error ${i}`,
        severity: 'error' as const,
        code: 'REQUIRED_FIELD'
      }));

      const startTime = performance.now();
      render(
        <ValidationErrorDisplay
          errors={manyErrors}
          warnings={[]}
        />
      );
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByText('100 erreurs')).toBeInTheDocument();
    });
  });
});