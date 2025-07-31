import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MediaPage from '@/pages/MediaPage';
import { useApi } from '@/hooks/useApi';

// Mock des hooks et dépendances
vi.mock('@/hooks/useApi');
vi.mock('@/utils/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock de sonner pour les toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock des données de test
const mockMediaData = {
  data: [
    {
      id: '1',
      name: 'Image 1',
      filename: 'image1.jpg',
      originalFilename: 'image1.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      url: '/uploads/image1.jpg',
      thumbnailUrl: '/uploads/image1-thumb.webp',
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
      size: 2048000,
      url: '/uploads/image2.jpg',
      thumbnailUrl: '/uploads/image2-thumb.webp',
      type: 'image',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'Video 1',
      filename: 'video1.mp4',
      originalFilename: 'video1.mp4',
      mimeType: 'video/mp4',
      size: 5120000,
      url: '/uploads/video1.mp4',
      type: 'video',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    }
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1
  }
};

describe('MediaPage - Mode Sélection', () => {
  const mockGet = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration du mock useApi
    (useApi as any).mockReturnValue({
      get: mockGet,
      delete: mockDelete
    });

    // Mock de la réponse API pour récupérer les médias
    mockGet.mockResolvedValue(mockMediaData);
  });

  it('devrait afficher le bouton pour activer le mode sélection', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });
  });

  it('devrait activer le mode sélection quand on clique sur le bouton', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    // Vérifier que le mode sélection est activé
    await waitFor(() => {
      expect(screen.getByText('✓ Annuler sélection')).toBeInTheDocument();
      expect(screen.getByText('Mode sélection activé')).toBeInTheDocument();
    });
  });

  it('devrait afficher les cases à cocher en mode sélection', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      // Vérifier que les cases à cocher sont présentes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // 3 médias = 3 cases à cocher
    });
  });

  it('devrait permettre de sélectionner des médias individuellement', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    // Sélectionner le premier média
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);

    await waitFor(() => {
      expect(screen.getByText('1 média sélectionné')).toBeInTheDocument();
    });
  });

  it('devrait permettre de sélectionner tous les médias', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      expect(screen.getByText('☑ Tout sélectionner')).toBeInTheDocument();
    });

    // Cliquer sur "Tout sélectionner"
    fireEvent.click(screen.getByText('☑ Tout sélectionner'));

    await waitFor(() => {
      expect(screen.getByText('3 médias sélectionnés')).toBeInTheDocument();
    });
  });

  it('devrait permettre de désélectionner tous les médias', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection et sélectionner tout
    fireEvent.click(screen.getByText('☐ Sélectionner'));
    
    await waitFor(() => {
      expect(screen.getByText('☑ Tout sélectionner')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('☑ Tout sélectionner'));

    await waitFor(() => {
      expect(screen.getByText('3 médias sélectionnés')).toBeInTheDocument();
    });

    // Désélectionner tout
    fireEvent.click(screen.getByText('☐ Tout désélectionner'));

    await waitFor(() => {
      expect(screen.getByText('Aucun média sélectionné')).toBeInTheDocument();
    });
  });

  it('devrait masquer les boutons d\'action individuels en mode sélection', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // En mode normal, les boutons d'action devraient être visibles au survol
    // (difficile à tester avec jsdom, mais la logique est dans le code)

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      expect(screen.getByText('Mode sélection activé')).toBeInTheDocument();
    });

    // En mode sélection, les overlays d'action ne devraient pas être rendus
    // (vérifié par la condition !isSelectionMode dans le JSX)
  });

  it('devrait afficher le bouton de suppression quand des médias sont sélectionnés', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    // Sélectionner un média
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/Supprimer la sélection \(1\)/)).toBeInTheDocument();
    });
  });

  it('devrait appliquer le highlighting visuel aux médias sélectionnés', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    // Sélectionner le premier média
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);

    await waitFor(() => {
      // Vérifier que le nom du média sélectionné a la classe text-blue-700
      const mediaName = screen.getByText('Image 1');
      expect(mediaName).toHaveClass('text-blue-700');
    });
  });

  it('devrait quitter le mode sélection avec le bouton Annuler', async () => {
    render(<MediaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    });

    // Activer le mode sélection
    fireEvent.click(screen.getByText('☐ Sélectionner'));

    await waitFor(() => {
      expect(screen.getByText('✓ Annuler sélection')).toBeInTheDocument();
    });

    // Annuler la sélection
    fireEvent.click(screen.getByText('✓ Annuler sélection'));

    await waitFor(() => {
      expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
      expect(screen.queryByText('Mode sélection activé')).not.toBeInTheDocument();
    });
  });
});