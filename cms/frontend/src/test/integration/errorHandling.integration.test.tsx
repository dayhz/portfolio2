import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ServicesErrorBoundary } from '../../components/services/ServicesErrorBoundary';
import { ValidationErrorDisplay } from '../../components/services/ValidationErrorDisplay';
import { ValidationError } from '../../../../shared/types/services';

// Mock the notification context
const mockAddNotification = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
    showToast: mockShowToast
  })
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test component error');
  }
  return <div>Component working correctly</div>;
};

describe('Error Handling Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    console.error = vi.fn(); // Suppress error logs in tests
    console.log = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();
  });

  describe('Error Boundary Integration', () => {
    it('catches errors and displays error UI', () => {
      render(
        <ServicesErrorBoundary section="hero">
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();
      expect(screen.getByText('Test component error')).toBeInTheDocument();
      expect(screen.getByText('hero')).toBeInTheDocument();
    });

    it('renders children normally when no error occurs', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Component working correctly')).toBeInTheDocument();
      expect(screen.queryByText('Erreur dans le CMS Services')).not.toBeInTheDocument();
    });

    it('provides retry functionality', () => {
      const { rerender } = render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Réessayer/ });
      fireEvent.click(retryButton);

      // Simulate component working after retry
      rerender(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Component working correctly')).toBeInTheDocument();
    });
  });

  describe('Validation Error Display Integration', () => {
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
        message: 'Description is too short',
        severity: 'warning',
        code: 'MIN_LENGTH_WARNING'
      }
    ];

    it('displays validation errors correctly', () => {
      render(
        <ValidationErrorDisplay
          errors={mockErrors.filter(e => e.severity === 'error')}
          warnings={mockErrors.filter(e => e.severity === 'warning')}
          section="hero"
        />
      );

      expect(screen.getByText('Problèmes de validation')).toBeInTheDocument();
      expect(screen.getByText('1 erreur')).toBeInTheDocument();
      expect(screen.getByText('1 avertissement')).toBeInTheDocument();
    });

    it('shows success message when no errors', () => {
      render(
        <ValidationErrorDisplay
          errors={[]}
          warnings={[]}
        />
      );

      expect(screen.getByText('Aucune erreur de validation détectée. Tout semble correct !')).toBeInTheDocument();
    });

    it('allows expanding error details', () => {
      render(
        <ValidationErrorDisplay
          errors={mockErrors.filter(e => e.severity === 'error')}
          warnings={[]}
        />
      );

      const detailsButton = screen.getByText('Détails');
      fireEvent.click(detailsButton);

      expect(screen.getByText('Section Hero')).toBeInTheDocument();
    });

    it('displays inline errors when showInline is true', () => {
      render(
        <ValidationErrorDisplay
          errors={mockErrors.filter(e => e.severity === 'error')}
          warnings={[]}
          showInline={true}
        />
      );

      expect(screen.getByText('Le champ "title" est obligatoire')).toBeInTheDocument();
    });

    it('shows compact view when compact is true', () => {
      render(
        <ValidationErrorDisplay
          errors={mockErrors.filter(e => e.severity === 'error')}
          warnings={mockErrors.filter(e => e.severity === 'warning')}
          compact={true}
        />
      );

      expect(screen.getByText('1 erreur')).toBeInTheDocument();
      expect(screen.getByText('1 avertissement')).toBeInTheDocument();
    });
  });

  describe('Combined Error Handling', () => {
    it('handles both component errors and validation errors', () => {
      const TestComponent: React.FC<{ hasValidationErrors: boolean }> = ({ hasValidationErrors }) => {
        if (hasValidationErrors) {
          return (
            <ValidationErrorDisplay
              errors={[{
                field: 'test',
                section: 'hero',
                message: 'Test validation error',
                severity: 'error',
                code: 'TEST_ERROR'
              }]}
              warnings={[]}
            />
          );
        }
        return <div>No validation errors</div>;
      };

      render(
        <ServicesErrorBoundary section="test">
          <TestComponent hasValidationErrors={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Problèmes de validation')).toBeInTheDocument();
      expect(screen.getByText('1 erreur')).toBeInTheDocument();
    });

    it('error boundary catches validation component errors', () => {
      const BrokenValidationComponent: React.FC = () => {
        throw new Error('Validation component crashed');
      };

      render(
        <ServicesErrorBoundary section="validation">
          <BrokenValidationComponent />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();
      expect(screen.getByText('Validation component crashed')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('handles multiple error recovery attempts', () => {
      let attemptCount = 0;
      const UnstableComponent: React.FC = () => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return <div>Component stabilized after {attemptCount} attempts</div>;
      };

      const { rerender } = render(
        <ServicesErrorBoundary>
          <UnstableComponent />
        </ServicesErrorBoundary>
      );

      // First error
      expect(screen.getByText('Attempt 1 failed')).toBeInTheDocument();

      // First retry
      const retryButton = screen.getByRole('button', { name: /Réessayer/ });
      fireEvent.click(retryButton);

      rerender(
        <ServicesErrorBoundary>
          <UnstableComponent />
        </ServicesErrorBoundary>
      );

      // Second error
      expect(screen.getByText('Attempt 2 failed')).toBeInTheDocument();

      // Second retry - should succeed
      const retryButton2 = screen.getByRole('button', { name: /Réessayer/ });
      fireEvent.click(retryButton2);

      rerender(
        <ServicesErrorBoundary>
          <UnstableComponent />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Component stabilized after 3 attempts')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Réessayer/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retour au dashboard/ })).toBeInTheDocument();
    });

    it('validation errors have proper accessibility attributes', () => {
      render(
        <ValidationErrorDisplay
          errors={[{
            field: 'title',
            section: 'hero',
            message: 'Title is required',
            severity: 'error',
            code: 'REQUIRED_FIELD'
          }]}
          warnings={[]}
        />
      );

      expect(screen.getByRole('button', { name: 'Revalider' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Détails' })).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('provides helpful error messages and recovery options', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('💡 Que faire ?')).toBeInTheDocument();
      expect(screen.getByText(/Essayez de recharger la page/)).toBeInTheDocument();
      expect(screen.getByText(/Vérifiez votre connexion internet/)).toBeInTheDocument();
    });

    it('shows contextual error information', () => {
      render(
        <ValidationErrorDisplay
          errors={[{
            field: 'email',
            section: 'hero',
            message: 'Invalid email format',
            severity: 'error',
            code: 'INVALID_EMAIL'
          }]}
          warnings={[]}
        />
      );

      fireEvent.click(screen.getByText('Détails'));
      fireEvent.click(screen.getByText('Section Hero'));

      expect(screen.getByText('L\'adresse email dans "email" n\'est pas valide')).toBeInTheDocument();
    });
  });
});