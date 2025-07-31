import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MediaPage from '../../pages/MediaPage';
import axiosInstance from '../../utils/axiosConfig';

// Mock axios
vi.mock('../../utils/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn()
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock useApi hook
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    delete: mockDelete
  })
}));

describe('MediaPage - Selection Delete Integration', () => {
  const mockMediaList = [
    {
      id: '1',
      name: 'Image 1',
      filename: 'image1.jpg',
      originalFilename: 'image1.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      url: '/uploads/image1.jpg',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Image 2',
      filename: 'image2.jpg',
      originalFilename: 'image2.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      url: '/uploads/image2.jpg',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Image 3',
      filename: 'image3.jpg',
      originalFilename: 'image3.jpg',
      mimeType: 'image/jpeg',
      size: 3072,
      url: '/uploads/image3.jpg',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useApi hook methods
    mockGet.mockResolvedValue({
      data: mockMediaList,
      meta: {
        page: 1,
        limit: 50,
        total: mockMediaList.length,
        totalPages: 1
      }
    });

    // Mock successful bulk delete
    (axiosInstance.delete as any).mockResolvedValue({
      data: {
        message: 'Bulk delete completed',
        deleted: 2,
        total: 2,
        errors: []
      }
    });

    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  it('should delete only selected media when using selection mode', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Enter selection mode
    const selectionButton = screen.getByText('☐ Sélectionner');
    fireEvent.click(selectionButton);

    // Wait for selection mode to activate
    await waitFor(() => {
      expect(screen.getByText('✓ Annuler sélection')).toBeInTheDocument();
    });

    // Select first two media items by clicking on their cards
    const mediaCards = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Image 1') || button.textContent?.includes('Image 2')
    );
    
    // Click on the first two media cards to select them
    fireEvent.click(mediaCards[0]);
    fireEvent.click(mediaCards[1]);

    // Wait for selection to be registered
    await waitFor(() => {
      expect(screen.getByText('2 médias sélectionnés')).toBeInTheDocument();
    });

    // Find and click the delete selection button
    const deleteButton = screen.getByText(/Supprimer la sélection \(2\)/);
    fireEvent.click(deleteButton);

    // Verify confirmation dialog shows correct count
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('2 média')
    );

    // Wait for the API call with only selected IDs
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/media/bulk/delete', 
        expect.objectContaining({
          data: { ids: ['1', '2'] }
        })
      );
    });
  });

  it('should show confirmation with exact selected count', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Enter selection mode
    const selectionButton = screen.getByText('☐ Sélectionner');
    fireEvent.click(selectionButton);

    // Select all media
    await waitFor(() => {
      const selectAllButton = screen.getByText('☑ Tout sélectionner');
      fireEvent.click(selectAllButton);
    });

    // Wait for all to be selected
    await waitFor(() => {
      expect(screen.getByText('3 médias sélectionnés')).toBeInTheDocument();
    });

    // Click delete selection
    const deleteButton = screen.getByText(/Supprimer la sélection \(3\)/);
    fireEvent.click(deleteButton);

    // Verify confirmation shows exact count
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('3 médias sélectionnés')
    );
  });

  it('should reset selection after successful deletion', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Enter selection mode and select one item
    const selectionButton = screen.getByText('☐ Sélectionner');
    fireEvent.click(selectionButton);

    // Select first media
    await waitFor(() => {
      const mediaCards = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Image 1')
      );
      fireEvent.click(mediaCards[0]);
    });

    // Wait for selection
    await waitFor(() => {
      expect(screen.getByText('1 média sélectionné')).toBeInTheDocument();
    });

    // Delete selection
    const deleteButton = screen.getByText(/Supprimer la sélection \(1\)/);
    fireEvent.click(deleteButton);

    // Wait for deletion to complete
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalled();
    });

    // Wait for selection to be reset (should exit selection mode)
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle partial deletion errors correctly', async () => {
    // Mock partial failure response
    (axiosInstance.delete as any).mockResolvedValue({
      data: {
        message: 'Bulk delete completed with errors',
        deleted: 1,
        total: 2,
        errors: ['Failed to delete Image 2: File not found']
      }
    });

    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Enter selection mode and select two items
    const selectionButton = screen.getByText('☐ Sélectionner');
    fireEvent.click(selectionButton);

    // Select first two media
    await waitFor(() => {
      const selectAllButton = screen.getByText('☑ Tout sélectionner');
      fireEvent.click(selectAllButton);
    });

    // Deselect the third one to have only 2 selected
    await waitFor(() => {
      const mediaCards = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Image 3')
      );
      fireEvent.click(mediaCards[0]);
    });

    // Wait for 2 to be selected
    await waitFor(() => {
      expect(screen.getByText('2 médias sélectionnés')).toBeInTheDocument();
    });

    // Delete selection
    const deleteButton = screen.getByText(/Supprimer la sélection \(2\)/);
    fireEvent.click(deleteButton);

    // Wait for API call
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalled();
    });

    // Should still reset selection even with partial errors
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});