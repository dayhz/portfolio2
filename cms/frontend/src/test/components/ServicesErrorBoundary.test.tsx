import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServicesErrorBoundary, withServicesErrorBoundary } from '../../components/services/ServicesErrorBoundary';

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

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn()
});

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow: boolean; errorMessage?: string }> = ({ 
  shouldThrow, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

describe('ServicesErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    console.error = vi.fn(); // Suppress error logs in tests
    console.log = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('does not show error UI when children render successfully', () => {
      render(
        <ServicesErrorBoundary>
          <div>Working component</div>
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
      expect(screen.queryByText('Erreur dans le CMS Services')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches and displays error when child component throws', () => {
      render(
        <ServicesErrorBoundary section="hero">
          <ThrowError shouldThrow={true} errorMessage="Component crashed" />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();
      expect(screen.getByText(/Component crashed/)).toBeInTheDocument();
      expect(screen.getByText('hero')).toBeInTheDocument();
    });

    it('shows error details when expanded', async () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Detailed error" />
        </ServicesErrorBoundary>
      );

      const detailsButton = screen.getByText('Afficher les détails techniques');
      fireEvent.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByText('Stack Trace')).toBeInTheDocument();
      });
    });

    it('calls onError callback when provided', () => {
      const onErrorMock = vi.fn();
      
      render(
        <ServicesErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} errorMessage="Callback test" />
        </ServicesErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('stores error in localStorage for debugging', () => {
      render(
        <ServicesErrorBoundary section="testimonials">
          <ThrowError shouldThrow={true} errorMessage="Storage test" />
        </ServicesErrorBoundary>
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'services-cms-errors',
        expect.stringContaining('Storage test')
      );
    });
  });

  describe('Error Recovery', () => {
    it('allows retry when under max retry limit', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      const retryButton = screen.getByText(/Réessayer/);
      expect(retryButton).toBeEnabled();
      expect(retryButton.textContent).toContain('3 restantes');
    });

    it('disables retry when max retries reached', () => {
      const { rerender } = render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      // Simulate multiple retries
      for (let i = 0; i < 3; i++) {
        const retryButton = screen.getByText(/Réessayer/);
        fireEvent.click(retryButton);
        
        rerender(
          <ServicesErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ServicesErrorBoundary>
        );
      }

      expect(screen.queryByText(/Réessayer/)).not.toBeInTheDocument();
      expect(screen.getByText(/Nombre maximum de tentatives atteint/)).toBeInTheDocument();
    });

    it('resets error state when retry is clicked', () => {
      const { rerender } = render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();

      const retryButton = screen.getByText(/Réessayer/);
      fireEvent.click(retryButton);

      rerender(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Erreur dans le CMS Services')).not.toBeInTheDocument();
    });

    it('resets to dashboard when reset button is clicked', () => {
      const { rerender } = render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      const resetButton = screen.getByText('Retour au dashboard');
      fireEvent.click(resetButton);

      rerender(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Error Actions', () => {
    it('copies error details to clipboard', async () => {
      render(
        <ServicesErrorBoundary section="clients">
          <ThrowError shouldThrow={true} errorMessage="Copy test error" />
        </ServicesErrorBoundary>
      );

      const copyButton = screen.getByText("Copier l'erreur");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Copy test error')
        );
      });
    });

    it('opens bug report email when report button is clicked', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Bug report test" />
        </ServicesErrorBoundary>
      );

      const reportButton = screen.getByText('Signaler le bug');
      fireEvent.click(reportButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:support@example.com'),
        '_blank'
      );
    });
  });

  describe('Dialog Mode', () => {
    it('renders as dialog when showDialog prop is true', () => {
      render(
        <ServicesErrorBoundary showDialog={true}>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      // Dialog should be present (though testing dialog visibility is complex)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;
      
      render(
        <ServicesErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Erreur dans le CMS Services')).not.toBeInTheDocument();
    });
  });

  describe('Higher-Order Component', () => {
    it('wraps component with error boundary using HOC', () => {
      const TestComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => (
        <ThrowError shouldThrow={shouldThrow} />
      );

      const WrappedComponent = withServicesErrorBoundary(TestComponent, {
        section: 'approach'
      });

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText('Erreur dans le CMS Services')).toBeInTheDocument();
      expect(screen.getByText('approach')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    it('logs comprehensive error information', () => {
      render(
        <ServicesErrorBoundary section="skills">
          <ThrowError shouldThrow={true} errorMessage="Logging test" />
        </ServicesErrorBoundary>
      );

      expect(console.group).toHaveBeenCalledWith('🚨 Services CMS Error Boundary');
      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
      expect(console.error).toHaveBeenCalledWith('Section:', 'skills');
    });

    it('maintains error history in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { error: { message: 'Previous error' }, timestamp: '2023-01-01' }
      ]));

      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="New error" />
        </ServicesErrorBoundary>
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'services-cms-errors',
        expect.stringContaining('New error')
      );
    });

    it('limits stored errors to 10 items', () => {
      const existingErrors = Array.from({ length: 10 }, (_, i) => ({
        error: { message: `Error ${i}` },
        timestamp: new Date().toISOString()
      }));
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingErrors));

      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Error 11" />
        </ServicesErrorBoundary>
      );

      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const storedErrors = JSON.parse(setItemCall[1]);
      expect(storedErrors).toHaveLength(10);
      expect(storedErrors[9].error.message).toBe('Error 11');
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

    it('supports keyboard navigation', () => {
      render(
        <ServicesErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ServicesErrorBoundary>
      );

      const retryButton = screen.getByText(/Réessayer/);
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });
  });
});