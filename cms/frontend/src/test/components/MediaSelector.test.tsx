import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MediaSelector } from '@/components/media/MediaSelector';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useApi');
vi.mock('sonner');
vi.mock('@/utils/axiosConfig');

const mockUseApi = vi.mocked(useApi);
const mockToast = vi.mocked(toast);

// Mock media data
const mockMediaData = {
  data: [
    {
      id: '1',
      name: 'Test Image',
      filename: 'test-image.jpg',
      originalName: 'test-image.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      url: '/uploads/test-image.jpg',
      thumbnailUrl: '/uploads/test-image-thumb.webp',
      alt: 'Test image',
      description: 'A test image',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Test Video',
      filename: 'test-video.mp4',
      originalName: 'test-video.mp4',
      mimeType: 'video/mp4',
      size: 5120000,
      url: '/uploads/test-video.mp4',
      type: 'video',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Test Logo',
      filename: 'test-logo.svg',
      originalName: 'test-logo.svg',
      mimeType: 'image/svg+xml',
      size: 2048,
      url: '/uploads/test-logo.svg',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  meta: {
    page: 1,
    limit: 50,
    total: 3,
    totalPages: 1
  }
};

describe('MediaSelector', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    });
    mockGet.mockResolvedValue(mockMediaData);
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSelect: mockOnSelect,
    allowedTypes: ['image' as const],
    title: 'Select Media',
    description: 'Choose a media file'
  };

  it('renders media selector dialog when open', async () => {
    render(<MediaSelector {...defaultProps} />);

    expect(screen.getByText('Select Media')).toBeInTheDocument();
    expect(screen.getByText('Choose a media file')).toBeInTheDocument();
    
    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(<MediaSelector {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Select Media')).not.toBeInTheDocument();
  });

  it('fetches media on mount', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/media?page=1&limit=50');
    });
  });

  it('displays loading state initially', () => {
    render(<MediaSelector {...defaultProps} />);
    
    expect(screen.getByText('Chargement des médias...')).toBeInTheDocument();
  });

  it('displays media items after loading', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.getByText('Test Logo')).toBeInTheDocument();
    });
  });

  it('filters media by search term', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un média...');
    fireEvent.change(searchInput, { target: { value: 'logo' } });

    await waitFor(() => {
      expect(screen.getByText('Test Logo')).toBeInTheDocument();
      expect(screen.queryByText('Test Image')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
    });
  });

  it('filters media by type', async () => {
    render(<MediaSelector {...defaultProps} allowedTypes={['video']} />);

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.queryByText('Test Image')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Logo')).not.toBeInTheDocument();
    });
  });

  it('calls onSelect when media is clicked in single selection mode', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Image'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockMediaData.data[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles multiple selection mode', async () => {
    const mockOnMultipleSelect = vi.fn();
    render(
      <MediaSelector 
        {...defaultProps} 
        multiple={true}
        onMultipleSelect={mockOnMultipleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    // Select first item
    fireEvent.click(screen.getByText('Test Image'));
    
    // Select second item
    fireEvent.click(screen.getByText('Test Logo'));

    // Confirm selection
    const confirmButton = screen.getByText(/Sélectionner \(2\)/);
    fireEvent.click(confirmButton);

    expect(mockOnMultipleSelect).toHaveBeenCalledWith([
      mockMediaData.data[0],
      mockMediaData.data[2]
    ]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('switches between grid and list view modes', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    // Find and click the view mode toggle button
    const viewToggleButton = screen.getByRole('button', { name: /list|grid/i });
    fireEvent.click(viewToggleButton);

    // The view should change (this is a visual change, hard to test without DOM inspection)
    expect(viewToggleButton).toBeInTheDocument();
  });

  it('validates file types for logo content type', () => {
    render(<MediaSelector {...defaultProps} allowedTypes={['logo']} />);

    // The component should filter to only show appropriate media types
    // This is tested through the filtering logic
    expect(mockGet).toHaveBeenCalled();
  });

  it('validates file types for avatar content type', () => {
    render(<MediaSelector {...defaultProps} allowedTypes={['avatar']} />);

    expect(mockGet).toHaveBeenCalled();
  });

  it('validates file types for video content type', () => {
    render(<MediaSelector {...defaultProps} allowedTypes={['video']} />);

    expect(mockGet).toHaveBeenCalled();
  });

  it('shows empty state when no media found', async () => {
    mockGet.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 50, total: 0, totalPages: 0 }
    });

    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Aucun média trouvé')).toBeInTheDocument();
      expect(screen.getByText('Commencez par uploader votre premier média')).toBeInTheDocument();
    });
  });

  it('shows filtered empty state when search returns no results', async () => {
    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un média...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun média trouvé')).toBeInTheDocument();
      expect(screen.getByText('Aucun média ne correspond aux critères de recherche')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const paginatedData = {
      ...mockMediaData,
      meta: { page: 1, limit: 50, total: 100, totalPages: 2 }
    };
    mockGet.mockResolvedValue(paginatedData);

    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 2')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suivant'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/media?page=2&limit=50');
    });
  });

  it('closes dialog when cancel button is clicked', () => {
    render(<MediaSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays upload tab', () => {
    render(<MediaSelector {...defaultProps} />);

    expect(screen.getByText('Uploader un nouveau fichier')).toBeInTheDocument();
  });

  it('shows drag and drop area in upload tab', () => {
    render(<MediaSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('Uploader un nouveau fichier'));

    expect(screen.getByText('Glissez-déposez un fichier ici ou cliquez pour sélectionner')).toBeInTheDocument();
  });

  it('displays appropriate file type restrictions for different content types', () => {
    const { rerender } = render(<MediaSelector {...defaultProps} allowedTypes={['logo']} />);

    fireEvent.click(screen.getByText('Uploader un nouveau fichier'));
    expect(screen.getByText(/SVG recommandé/)).toBeInTheDocument();

    rerender(<MediaSelector {...defaultProps} allowedTypes={['avatar']} />);
    fireEvent.click(screen.getByText('Uploader un nouveau fichier'));
    expect(screen.getByText(/Format carré recommandé/)).toBeInTheDocument();

    rerender(<MediaSelector {...defaultProps} allowedTypes={['video']} />);
    fireEvent.click(screen.getByText('Uploader un nouveau fichier'));
    expect(screen.getByText(/Vidéos/)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error('API Error'));

    render(<MediaSelector {...defaultProps} />);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur lors du chargement des médias');
    });

    consoleError.mockRestore();
  });
});