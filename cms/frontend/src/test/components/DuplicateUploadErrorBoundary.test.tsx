import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuplicateUploadErrorBoundary } from '@/components/media/DuplicateUploadErrorBoundary';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error</div>;
};

describe('DuplicateUploadErrorBoundary', () => {
  const mockOnClose = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={false} />
      </DuplicateUploadErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error fallback UI when child component throws error', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    // Check that error UI is displayed
    expect(screen.getByText('Erreur d\'affichage')).toBeInTheDocument();
    expect(screen.getByText(/Une erreur s'est produite lors de l'affichage/)).toBeInTheDocument();
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
    expect(screen.getByText('Fermer')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('displays error details in expandable section', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    // Check that error details section exists
    expect(screen.getByText('Détails techniques (pour le débogage)')).toBeInTheDocument();
    
    // Expand details
    fireEvent.click(screen.getByText('Détails techniques (pour le débogage)'));
    
    // Check that error message is displayed
    expect(screen.getByText('Test error for error boundary')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    fireEvent.click(screen.getByText('Fermer'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('has retry button that attempts to reset error state', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    // Error UI should be displayed
    expect(screen.getByText('Erreur d\'affichage')).toBeInTheDocument();

    // Retry button should be present and clickable
    const retryButton = screen.getByText('Réessayer');
    expect(retryButton).toBeInTheDocument();
    
    // Click retry button should not throw error
    expect(() => fireEvent.click(retryButton)).not.toThrow();
  });

  it('resets error state when dialog is reopened', () => {
    const { rerender } = render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    // Error UI should be displayed
    expect(screen.getByText('Erreur d\'affichage')).toBeInTheDocument();

    // Close dialog
    rerender(
      <DuplicateUploadErrorBoundary
        isOpen={false}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={false} />
      </DuplicateUploadErrorBoundary>
    );

    // Reopen dialog
    rerender(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={false} />
      </DuplicateUploadErrorBoundary>
    );

    // Should show normal content
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('displays help text with user guidance', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    expect(screen.getByText('💡 Que faire ?')).toBeInTheDocument();
    expect(screen.getByText(/Cliquez sur "Réessayer"/)).toBeInTheDocument();
    expect(screen.getByText(/Si le problème persiste/)).toBeInTheDocument();
    expect(screen.getByText(/Contactez le support technique/)).toBeInTheDocument();
  });

  it('logs error to console for debugging', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={mockOnClose}
        onError={mockOnError}
      >
        <ThrowError shouldThrow={true} />
      </DuplicateUploadErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'DuplicateUploadDialog Error Boundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });
});