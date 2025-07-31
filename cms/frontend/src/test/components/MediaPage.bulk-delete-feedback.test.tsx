import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MediaPage from '../../pages/MediaPage';
import { toast } from 'sonner';

// Mock des dépendances
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn(),
    delete: vi.fn()
  })
}));

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    delete: vi.fn(),
    post: vi.fn(),
    get: vi.fn()
  }
}));

// Mock des composants UI
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className}>
      Progress: {value}%
    </div>
  )
}));

describe('MediaPage - Bulk Delete Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show progress bar during bulk delete operation', async () => {
    // Mock de la réponse API
    const mockAxios = await import('@/utils/axiosConfig');
    const mockDelete = vi.fn().mockResolvedValue({
      data: {
        deleted: 3,
        total: 3,
        errors: [],
        message: 'Suppression réussie'
      }
    });
    mockAxios.default.delete = mockDelete;

    // Mock de la réponse GET pour les médias
    const mockGet = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'image1.jpg', type: 'image', url: '/uploads/image1.jpg', size: 1000, createdAt: '2024-01-01' },
        { id: '2', name: 'image2.jpg', type: 'image', url: '/uploads/image2.jpg', size: 2000, createdAt: '2024-01-02' },
        { id: '3', name: 'image3.jpg', type: 'image', url: '/uploads/image3.jpg', size: 3000, createdAt: '2024-01-03' }
      ],
      meta: { page: 1, limit: 50, total: 3, totalPages: 1 }
    });
    mockAxios.default.get = mockGet;

    // Mock de useApi
    const mockUseApi = await import('@/hooks/useApi');
    mockUseApi.useApi = vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'image1.jpg', type: 'image', url: '/uploads/image1.jpg', size: 1000, createdAt: '2024-01-01' },
          { id: '2', name: 'image2.jpg', type: 'image', url: '/uploads/image2.jpg', size: 2000, createdAt: '2024-01-02' },
          { id: '3', name: 'image3.jpg', type: 'image', url: '/uploads/image3.jpg', size: 3000, createdAt: '2024-01-03' }
        ],
        meta: { page: 1, limit: 50, total: 3, totalPages: 1 }
      }),
      delete: vi.fn()
    }));

    // Mock de window.confirm
    window.confirm = vi.fn(() => true);

    render(<MediaPage />);

    // Attendre que les médias se chargent
    await waitFor(() => {
      expect(screen.getByText('Fichiers disponibles')).toBeInTheDocument();
    });

    // Activer le mode sélection
    const selectButton = screen.getByText('Sélectionner');
    fireEvent.click(selectButton);

    // Sélectionner tous les médias
    const selectAllButton = screen.getByText('Tout sélectionner');
    fireEvent.click(selectAllButton);

    // Cliquer sur supprimer la sélection
    const deleteButton = screen.getByText('Supprimer la sélection');
    fireEvent.click(deleteButton);

    // Vérifier que la barre de progression apparaît
    await waitFor(() => {
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    // Vérifier que le statut est affiché
    expect(screen.getByText(/Opération en cours/)).toBeInTheDocument();

    // Attendre que l'opération se termine
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/media/bulk/delete', {
        data: { ids: ['1', '2', '3'] },
        onDownloadProgress: expect.any(Function)
      });
    });

    // Vérifier que le toast de succès est affiché
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('3/3 média(s) supprimé(s) avec succès');
    });
  });

  it('should show detailed error messages when bulk delete fails partially', async () => {
    // Mock de la réponse API avec erreurs
    const mockAxios = await import('@/utils/axiosConfig');
    const mockDelete = vi.fn().mockResolvedValue({
      data: {
        deleted: 2,
        total: 3,
        errors: [
          'Échec de suppression de "image3.jpg": File not found',
          'Échec de suppression de "image4.jpg": Permission denied'
        ],
        message: 'Suppression partielle'
      }
    });
    mockAxios.default.delete = mockDelete;

    // Mock de useApi
    const mockUseApi = await import('@/hooks/useApi');
    mockUseApi.useApi = vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'image1.jpg', type: 'image', url: '/uploads/image1.jpg', size: 1000, createdAt: '2024-01-01' },
          { id: '2', name: 'image2.jpg', type: 'image', url: '/uploads/image2.jpg', size: 2000, createdAt: '2024-01-02' },
          { id: '3', name: 'image3.jpg', type: 'image', url: '/uploads/image3.jpg', size: 3000, createdAt: '2024-01-03' }
        ],
        meta: { page: 1, limit: 50, total: 3, totalPages: 1 }
      }),
      delete: vi.fn()
    }));

    // Mock de window.confirm
    window.confirm = vi.fn(() => true);

    render(<MediaPage />);

    // Attendre que les médias se chargent
    await waitFor(() => {
      expect(screen.getByText('Fichiers disponibles')).toBeInTheDocument();
    });

    // Cliquer sur "Tout supprimer"
    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    fireEvent.click(deleteAllButton);

    // Attendre que l'opération se termine
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });

    // Vérifier que le toast d'erreur détaillé est affiché
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('2/3 médias supprimés avec succès'),
        { duration: 8000 }
      );
    });
  });

  it('should show progress counter during bulk operation', async () => {
    // Mock de la réponse API
    const mockAxios = await import('@/utils/axiosConfig');
    const mockDelete = vi.fn().mockResolvedValue({
      data: {
        deleted: 5,
        total: 5,
        errors: [],
        message: 'Suppression réussie'
      }
    });
    mockAxios.default.delete = mockDelete;

    // Mock de useApi
    const mockUseApi = await import('@/hooks/useApi');
    mockUseApi.useApi = vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `${i + 1}`,
          name: `image${i + 1}.jpg`,
          type: 'image',
          url: `/uploads/image${i + 1}.jpg`,
          size: 1000 * (i + 1),
          createdAt: '2024-01-01'
        })),
        meta: { page: 1, limit: 50, total: 5, totalPages: 1 }
      }),
      delete: vi.fn()
    }));

    // Mock de window.confirm
    window.confirm = vi.fn(() => true);

    render(<MediaPage />);

    // Attendre que les médias se chargent
    await waitFor(() => {
      expect(screen.getByText('Fichiers disponibles')).toBeInTheDocument();
    });

    // Cliquer sur "Tout supprimer"
    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    fireEvent.click(deleteAllButton);

    // Vérifier que le compteur de progression est affiché
    await waitFor(() => {
      expect(screen.getByText(/Suppression de 5 média\(s\) en cours/)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Attendre que l'opération se termine
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });

    // Vérifier que le statut final est affiché
    await waitFor(() => {
      expect(screen.getByText(/Suppression terminée: 5\/5 média\(s\) traité\(s\)/)).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully with detailed messages', async () => {
    // Mock d'une erreur réseau
    const mockAxios = await import('@/utils/axiosConfig');
    const networkError = new Error('Network Error');
    networkError.name = 'AxiosError';
    (networkError as any).isAxiosError = true;
    (networkError as any).response = {
      data: { error: 'Server temporarily unavailable' }
    };
    
    const mockDelete = vi.fn().mockRejectedValue(networkError);
    mockAxios.default.delete = mockDelete;

    // Mock de useApi
    const mockUseApi = await import('@/hooks/useApi');
    mockUseApi.useApi = vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'image1.jpg', type: 'image', url: '/uploads/image1.jpg', size: 1000, createdAt: '2024-01-01' }
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 }
      }),
      delete: vi.fn()
    }));

    // Mock de window.confirm
    window.confirm = vi.fn(() => true);

    render(<MediaPage />);

    // Attendre que les médias se chargent
    await waitFor(() => {
      expect(screen.getByText('Fichiers disponibles')).toBeInTheDocument();
    });

    // Cliquer sur "Tout supprimer"
    const deleteAllButton = screen.getByText('🗑️ Tout supprimer');
    fireEvent.click(deleteAllButton);

    // Attendre que l'erreur soit gérée
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Erreur lors de la suppression en masse: Network Error - Server temporarily unavailable',
        { duration: 6000 }
      );
    });

    // Vérifier que le statut d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la suppression')).toBeInTheDocument();
    });
  });
});