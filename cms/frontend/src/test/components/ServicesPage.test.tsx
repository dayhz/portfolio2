import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ServicesPage from '../../pages/ServicesPage';
import { servicesAPI } from '../../api/services';
import { toast } from 'sonner';

// Mock the services API
vi.mock('../../api/services', () => ({
  servicesAPI: {
    getAllContent: vi.fn(),
    publish: vi.fn(),
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

const mockServicesData = {
  id: 'test-services',
  version: 1,
  lastModified: new Date(),
  isPublished: true,
  hero: {
    title: 'Test Hero Title',
    description: 'Test Hero Description',
    highlightText: '17+ years'
  },
  services: {
    services: [
      {
        id: '1',
        number: 1,
        title: 'Website',
        description: 'Website development',
        color: '#FF6B6B',
        colorClass: 'text-red-500',
        order: 1
      }
    ]
  },
  skillsVideo: {
    description: 'Test skills description',
    skills: [
      { id: '1', name: 'React', order: 1 },
      { id: '2', name: 'TypeScript', order: 2 }
    ],
    ctaText: 'See all projects',
    ctaUrl: '/projects',
    video: {
      url: 'https://example.com/video.mp4',
      caption: 'Test video',
      autoplay: false,
      loop: false,
      muted: true
    }
  },
  approach: {
    description: 'Test approach description',
    steps: [
      {
        id: '1',
        number: 1,
        title: 'Discovery',
        description: 'Understanding your needs',
        order: 1
      }
    ]
  },
  testimonials: {
    testimonials: [
      {
        id: '1',
        text: 'Great work!',
        author: {
          name: 'John Doe',
          title: 'CEO',
          company: 'Test Company',
          avatar: '/avatar.jpg'
        },
        project: {
          name: 'Test Project',
          image: '/project.jpg',
          url: '/project'
        },
        order: 1
      }
    ]
  },
  clients: {
    clients: [
      {
        id: '1',
        name: 'Test Client',
        logo: '/logo.svg',
        description: 'Test client description',
        industry: 'Technology',
        order: 1,
        isActive: true
      }
    ]
  },
  seo: {
    title: 'Services',
    description: 'Our services',
    keywords: ['services', 'web development']
  }
};

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    
    // Mock successful API response
    (servicesAPI.getAllContent as any).mockResolvedValue({
      success: true,
      data: mockServicesData,
      timestamp: new Date().toISOString()
    });
  });

  describe('Component Rendering', () => {
    it('should render the main heading', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      // Make API call hang to test loading state
      (servicesAPI.getAllContent as any).mockImplementation(() => new Promise(() => {}));
      
      render(<ServicesPage />);
      
      expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
    });

    it('should load and display services data successfully', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });
      
      expect(servicesAPI.getAllContent).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Gérez le contenu de votre page Services en toute simplicité')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state when API fails', async () => {
      const errorMessage = 'Failed to load data';
      (servicesAPI.getAllContent as any).mockRejectedValue(new Error(errorMessage));
      
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      
      expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement des données');
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('should retry loading data when retry button is clicked', async () => {
      // First call fails
      (servicesAPI.getAllContent as any).mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      (servicesAPI.getAllContent as any).mockResolvedValueOnce({
        success: true,
        data: mockServicesData,
        timestamp: new Date().toISOString()
      });
      
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Réessayer'));
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });
      
      expect(servicesAPI.getAllContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dashboard Display', () => {
    it('should display all section cards', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const expectedSections = [
        'Section Hero',
        'Grille des Services', 
        'Compétences & Vidéo',
        'Processus de Travail',
        'Témoignages',
        'Liste des Clients'
      ];
      
      expectedSections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it('should display action buttons', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      expect(screen.getByText('Prévisualiser')).toBeInTheDocument();
      expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
      expect(screen.getByText('Publier')).toBeInTheDocument();
      expect(screen.getByText('Versions')).toBeInTheDocument();
      expect(screen.getByText('Santé')).toBeInTheDocument();
    });
  });

  describe('Section Navigation', () => {
    it('should navigate to section when card is clicked', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const heroCard = screen.getByText('Section Hero').closest('.cursor-pointer');
      fireEvent.click(heroCard!);
      
      expect(screen.getByText('Hero Section Editor')).toBeInTheDocument();
      expect(screen.getByText('Retour au Dashboard')).toBeInTheDocument();
    });

    it('should navigate back to dashboard', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      // Navigate to a section first
      const heroCard = screen.getByText('Section Hero').closest('.cursor-pointer');
      fireEvent.click(heroCard!);
      
      // Navigate back
      fireEvent.click(screen.getByText('Retour au Dashboard'));
      
      expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      expect(screen.queryByText('Hero Section Editor')).not.toBeInTheDocument();
    });
  });

  describe('Save and Publish Operations', () => {
    it('should have disabled save button when no changes', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Sauvegarder');
      expect(saveButton).toBeDisabled();
    });

    it('should have disabled publish button when no changes', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const publishButton = screen.getByText('Publier');
      expect(publishButton).toBeDisabled();
    });
  });

  describe('State Management', () => {
    it('should initialize with correct default state', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      // Check that save and publish buttons are disabled initially (no changes)
      const saveButton = screen.getByText('Sauvegarder');
      const publishButton = screen.getByText('Publier');
      
      expect(saveButton).toBeDisabled();
      expect(publishButton).toBeDisabled();
    });

    it('should handle unsaved changes state correctly', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      // Initially no unsaved changes alert should be visible
      expect(screen.queryByText(/modifications non sauvegardées/)).not.toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    it('should have auto-save mechanism in place', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      // Verify that auto-save indicator is not shown initially
      expect(screen.queryByText('Sauvegarde automatique en cours...')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Services Page CMS');
    });

    it('should have accessible buttons', async () => {
      render(<ServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Services Page CMS')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });
});