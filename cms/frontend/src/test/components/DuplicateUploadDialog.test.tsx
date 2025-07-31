import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DuplicateUploadDialog from '@/components/media/DuplicateUploadDialog';

describe('DuplicateUploadDialog', () => {
  const mockExistingFile = {
    id: '1',
    name: 'test-image.jpg',
    originalName: 'test-image.jpg',
    size: 1024000,
    createdAt: '2024-01-15T10:30:00Z',
    url: '/uploads/test-image.jpg'
  };

  const mockUploadedFile = {
    originalName: 'test-image.jpg',
    size: 1024000,
    mimetype: 'image/jpeg'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    existingFile: mockExistingFile,
    uploadedFile: mockUploadedFile,
    onReplace: vi.fn(),
    onRename: vi.fn(),
    onCancel: vi.fn(),
    isProcessing: false
  };

  it('renders duplicate dialog with file information', () => {
    render(<DuplicateUploadDialog {...defaultProps} />);
    
    expect(screen.getByText('Fichier en double détecté')).toBeInTheDocument();
    expect(screen.getAllByText('test-image.jpg')).toHaveLength(2); // Both existing and uploaded files
    expect(screen.getAllByText('1000 KB')).toHaveLength(2); // Both files have same size
    expect(screen.getByText('image/jpeg')).toBeInTheDocument();
    expect(screen.getByText('Fichier existant')).toBeInTheDocument();
    expect(screen.getByText('Nouveau fichier')).toBeInTheDocument();
  });

  it('calls onReplace when replace button is clicked', () => {
    render(<DuplicateUploadDialog {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const replaceButton = buttons.find(button => button.textContent?.includes('Remplacer le fichier existant'));
    fireEvent.click(replaceButton!);
    
    expect(defaultProps.onReplace).toHaveBeenCalledTimes(1);
  });

  it('calls onRename when rename button is clicked', () => {
    render(<DuplicateUploadDialog {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const renameButton = buttons.find(button => button.textContent?.includes('Renommer et conserver les deux'));
    fireEvent.click(renameButton!);
    
    expect(defaultProps.onRename).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<DuplicateUploadDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Annuler l\'upload');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when processing', () => {
    render(<DuplicateUploadDialog {...defaultProps} isProcessing={true} />);
    
    // Find buttons by their role instead of text content since the structure changed
    const buttons = screen.getAllByRole('button');
    const replaceButton = buttons.find(button => button.textContent?.includes('Remplacer le fichier existant'));
    const renameButton = buttons.find(button => button.textContent?.includes('Renommer et conserver les deux'));
    const cancelButton = buttons.find(button => button.textContent?.includes('Annuler l\'upload'));
    
    expect(replaceButton).toBeDisabled();
    expect(renameButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows processing indicator when processing', () => {
    render(<DuplicateUploadDialog {...defaultProps} isProcessing={true} />);
    
    // Check for the title change
    expect(screen.getByRole('heading', { name: /traitement en cours/i })).toBeInTheDocument();
    
    // Check for the loading overlay
    expect(screen.getByText('Veuillez patienter pendant que votre action est exécutée. N\'actualisez pas la page et ne fermez pas cette fenêtre.')).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const largeFile = {
      ...mockExistingFile,
      size: 5242880 // 5MB
    };
    
    render(<DuplicateUploadDialog {...defaultProps} existingFile={largeFile} />);
    
    expect(screen.getByText('5 MB')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<DuplicateUploadDialog {...defaultProps} />);
    
    // La date devrait être formatée en français
    expect(screen.getByText(/janvier 2024/)).toBeInTheDocument();
  });
});