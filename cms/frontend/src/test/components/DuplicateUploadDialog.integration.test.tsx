import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DuplicateUploadErrorBoundary } from '@/components/media/DuplicateUploadErrorBoundary';
import DuplicateUploadDialog from '@/components/media/DuplicateUploadDialog';

// Mock the icons to avoid import issues
vi.mock('react-iconly', () => ({
  Danger: ({ size, primaryColor }: any) => <div data-testid="danger-icon" data-size={size} data-color={primaryColor}>⚠️</div>,
  Document: ({ size, primaryColor }: any) => <div data-testid="document-icon" data-size={size} data-color={primaryColor}>📄</div>,
  Folder: ({ size, primaryColor }: any) => <div data-testid="folder-icon" data-size={size} data-color={primaryColor}>📁</div>,
  Calendar: ({ size, primaryColor }: any) => <div data-testid="calendar-icon" data-size={size} data-color={primaryColor}>📅</div>,
}));

describe('DuplicateUploadDialog with ErrorBoundary Integration', () => {
  const mockExistingFile = {
    id: '1',
    name: 'test-file.jpg',
    originalName: 'test-file.jpg',
    size: 1024,
    createdAt: '2023-01-01T00:00:00Z',
    url: '/uploads/test-file.jpg'
  };

  const mockUploadedFile = {
    originalName: 'test-file.jpg',
    size: 1024,
    mimetype: 'image/jpeg'
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    existingFile: mockExistingFile,
    uploadedFile: mockUploadedFile,
    onReplace: vi.fn(),
    onRename: vi.fn(),
    onCancel: vi.fn(),
    isProcessing: false
  };

  it('renders DuplicateUploadDialog normally when no error occurs', () => {
    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={vi.fn()}
      >
        <DuplicateUploadDialog {...mockProps} />
      </DuplicateUploadErrorBoundary>
    );

    // Should render the normal dialog content
    expect(screen.getByText('Fichier en double détecté')).toBeInTheDocument();
    expect(screen.getByText('Remplacer le fichier existant')).toBeInTheDocument();
    expect(screen.getByText('Renommer et conserver les deux')).toBeInTheDocument();
    expect(screen.getByText('Annuler l\'upload')).toBeInTheDocument();
  });

  it('shows error boundary UI when DuplicateUploadDialog has rendering error', () => {
    // Create a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Icon import failed');
    };

    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={vi.fn()}
      >
        <ErrorComponent />
      </DuplicateUploadErrorBoundary>
    );

    // Should show error boundary fallback UI
    expect(screen.getByText('Erreur d\'affichage')).toBeInTheDocument();
    expect(screen.getByText(/Une erreur s'est produite lors de l'affichage/)).toBeInTheDocument();
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
    expect(screen.getByText('Fermer')).toBeInTheDocument();
  });

  it('displays error details when error boundary catches an error', () => {
    const ErrorComponent = () => {
      throw new Error('Test error message');
    };

    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={vi.fn()}
      >
        <ErrorComponent />
      </DuplicateUploadErrorBoundary>
    );

    // Should show error details section
    expect(screen.getByText('Détails techniques (pour le débogage)')).toBeInTheDocument();
    
    // Error message should be in the DOM (might be in a collapsed details section)
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('provides helpful guidance when error occurs', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={vi.fn()}
      >
        <ErrorComponent />
      </DuplicateUploadErrorBoundary>
    );

    // Should show helpful guidance
    expect(screen.getByText('💡 Que faire ?')).toBeInTheDocument();
    expect(screen.getByText(/Cliquez sur "Réessayer"/)).toBeInTheDocument();
    expect(screen.getByText(/Si le problème persiste/)).toBeInTheDocument();
    expect(screen.getByText(/Contactez le support technique/)).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorSpy = vi.fn();
    const ErrorComponent = () => {
      throw new Error('Test error for callback');
    };

    render(
      <DuplicateUploadErrorBoundary
        isOpen={true}
        onClose={vi.fn()}
        onError={onErrorSpy}
      >
        <ErrorComponent />
      </DuplicateUploadErrorBoundary>
    );

    // Should call the onError callback
    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });
});