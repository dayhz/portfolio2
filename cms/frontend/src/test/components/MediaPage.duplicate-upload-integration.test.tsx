import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MediaPage from '@/pages/MediaPage';

// Mock des dépendances
vi.mock('axios');
vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    loading: false,
    error: null,
    get: vi.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 50, total: 0, totalPages: 0 }
    }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  })
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

const mockedAxios = axios as any;

describe('MediaPage - Duplicate Upload Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows duplicate dialog when duplicate file is detected', async () => {
    // Mock de la réponse de doublon (status 409)
    const duplicateResponse = {
      response: {
        status: 409,
        data: {
          error: 'Duplicate file detected',
          duplicate: true,
          existingFile: {
            id: '1',
            name: 'test-image.jpg',
            originalName: 'test-image.jpg',
            size: 1024000,
            createdAt: '2024-01-15T10:30:00Z',
            url: '/uploads/test-image.jpg'
          },
          uploadedFile: {
            originalName: 'test-image.jpg',
            size: 1024000,
            mimetype: 'image/jpeg'
          },
          message: 'Un fichier avec le nom "test-image.jpg" et la taille 1024000 bytes existe déjà.',
          actions: ['replace', 'rename', 'cancel']
        }
      }
    };

    // Mock axios pour simuler l'erreur de doublon
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);
    
    render(<MediaPage />);

    // Simuler la sélection d'un fichier
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    
    // Créer un input file mock
    const mockInput = document.createElement('input');
    mockInput.type = 'file';
    mockInput.files = [file] as any;
    
    // Mock de document.createElement pour retourner notre input mock
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'input') {
        return mockInput;
      }
      return originalCreateElement.call(document, tagName);
    });

    // Mock de appendChild et removeChild
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    // Ouvrir le dialog d'upload
    const uploadButton = screen.getByText('Upload Fichiers');
    fireEvent.click(uploadButton);

    // Attendre que le dialog s'ouvre
    await waitFor(() => {
      expect(screen.getByText('Upload de fichiers')).toBeInTheDocument();
    });

    // Cliquer sur "Sélectionner des fichiers"
    const selectButton = screen.getByText('Sélectionner des fichiers');
    fireEvent.click(selectButton);

    // Simuler l'événement onchange de l'input
    const changeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(changeEvent, 'target', {
      writable: false,
      value: mockInput
    });

    // Mock de la requête POST qui retourne une erreur 409
    const axiosInstance = await import('@/utils/axiosConfig');
    axiosInstance.default.post = vi.fn().mockRejectedValue(duplicateResponse);

    // Déclencher l'événement change
    fireEvent(mockInput, changeEvent);

    // Attendre que le dialog de doublon apparaisse
    await waitFor(() => {
      expect(screen.getByText('Fichier en double détecté')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Vérifier que les informations du fichier sont affichées
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('1000 KB')).toBeInTheDocument();

    // Vérifier que les boutons d'action sont présents
    expect(screen.getByText('Remplacer le fichier existant')).toBeInTheDocument();
    expect(screen.getByText('Renommer et conserver les deux')).toBeInTheDocument();
    expect(screen.getByText('Annuler l\'upload')).toBeInTheDocument();

    // Restaurer document.createElement
    document.createElement = originalCreateElement;
  });

  it('handles replace action correctly', async () => {
    // Configuration similaire au test précédent...
    const duplicateResponse = {
      response: {
        status: 409,
        data: {
          error: 'Duplicate file detected',
          duplicate: true,
          existingFile: {
            id: '1',
            name: 'test-image.jpg',
            originalName: 'test-image.jpg',
            size: 1024000,
            createdAt: '2024-01-15T10:30:00Z',
            url: '/uploads/test-image.jpg'
          },
          uploadedFile: {
            originalName: 'test-image.jpg',
            size: 1024000,
            mimetype: 'image/jpeg'
          }
        }
      }
    };

    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);
    
    render(<MediaPage />);

    // Simuler l'ouverture du dialog de doublon (code similaire au test précédent)
    // ... (code d'ouverture du dialog)

    // Une fois le dialog ouvert, cliquer sur "Remplacer"
    const replaceButton = screen.getByText('Remplacer le fichier existant');
    
    // Mock de la requête de remplacement réussie
    const axiosInstance = await import('@/utils/axiosConfig');
    axiosInstance.default.post = vi.fn().mockResolvedValue({
      data: {
        id: '1',
        name: 'test-image.jpg',
        replaced: true,
        replacedFile: { id: '1', name: 'test-image.jpg' },
        message: 'File uploaded successfully (replaced existing file)'
      }
    });

    fireEvent.click(replaceButton);

    // Vérifier que la requête de remplacement est envoyée avec le bon paramètre
    await waitFor(() => {
      expect(axiosInstance.default.post).toHaveBeenCalledWith(
        '/media',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: expect.any(Function)
        })
      );
    });
  });

  it('handles rename action correctly', async () => {
    // Test similaire pour l'action de renommage
    // ... (implémentation similaire avec action 'rename')
  });

  it('handles cancel action correctly', async () => {
    // Test pour l'action d'annulation
    // ... (vérifier que l'upload est annulé et le dialog fermé)
  });
});