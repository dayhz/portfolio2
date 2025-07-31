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

describe('MediaPage - Bulk Delete Fix', () => {
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
        deleted: mockMediaList.length,
        total: mockMediaList.length,
        errors: []
      }
    });

    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  it('should capture complete media list at click time for bulk delete', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Find and click the "Tout supprimer" button
    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    fireEvent.click(deleteAllButton);

    // Verify that confirm was called with the correct count
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining(`supprimer TOUS les ${mockMediaList.length} médias`)
    );

    // Wait for the API call
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/media/bulk/delete', 
        expect.objectContaining({
          data: { ids: ['1', '2', '3'] }
        })
      );
    });
  });

  it('should prevent multiple simultaneous bulk operations', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Mock a slow delete operation
    (axiosInstance.delete as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: {
          message: 'Bulk delete completed',
          deleted: mockMediaList.length,
          total: mockMediaList.length,
          errors: []
        }
      }), 1000))
    );

    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    
    // Click the button twice quickly
    fireEvent.click(deleteAllButton);
    fireEvent.click(deleteAllButton);

    // Should only call the API once
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    });

    // Button should show loading state
    expect(screen.getByText('⏳ Suppression...')).toBeInTheDocument();
  });

  it('should handle bulk delete with partial errors correctly', async () => {
    render(<MediaPage />);

    // Wait for media to load
    await waitFor(() => {
      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });

    // Mock partial failure response
    (axiosInstance.delete as any).mockResolvedValue({
      data: {
        message: 'Bulk delete completed with errors',
        deleted: 2,
        total: 3,
        errors: ['Failed to delete Image 3: File not found']
      }
    });

    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    fireEvent.click(deleteAllButton);

    // Wait for the API call and verify the correct IDs were sent
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/media/bulk/delete', 
        expect.objectContaining({
          data: { ids: ['1', '2', '3'] }
        })
      );
    });
  });
});