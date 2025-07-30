import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomepagePage } from '../../pages/HomepagePage';

// Mock the API
vi.mock('../../api/homepage', () => ({
  getHomepageContent: vi.fn(),
  updateHeroSection: vi.fn(),
  updateBrandsSection: vi.fn(),
  updateServicesSection: vi.fn(),
  updateTestimonialsSection: vi.fn(),
  updateFooterSection: vi.fn(),
  saveAllChanges: vi.fn(),
  publishChanges: vi.fn(),
  getVersions: vi.fn(),
  createVersion: vi.fn(),
  restoreVersion: vi.fn()
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('HomepagePage', () => {
  const mockHomepageData = {
    hero: {
      title: 'Test Hero Title',
      description: 'Test hero description',
      videoUrl: 'https://example.com/video.mp4'
    },
    brands: {
      title: 'Our Clients',
      logos: [
        {
          id: 1,
          name: 'Client 1',
          logoUrl: '/images/client1.png',
          order: 1
        }
      ]
    },
    services: {
      title: 'Our Services',
      description: 'Service description',
      services: [
        {
          id: 1,
          number: '1.',
          title: 'Service 1',
          description: 'Service description',
          link: '/service1',
          colorClass: 'bg-blue-500'
        }
      ]
    },
    offer: {
      title: 'Our Offer',
      points: [
        {
          id: 1,
          text: 'Benefit point 1',
          order: 1
        }
      ]
    },
    testimonials: {
      testimonials: [
        {
          id: 1,
          text: 'Great testimonial with enough content',
          clientName: 'John Doe',
          clientTitle: 'CEO',
          clientPhoto: '/images/john.jpg',
          projectLink: 'https://project.com',
          projectImage: '/images/project.jpg',
          order: 1
        }
      ]
    },
    footer: {
      title: 'Contact Us',
      email: 'contact@example.com',
      copyright: '© 2025 Company',
      links: {
        site: [{ text: 'Home', url: '/' }],
        professional: [{ text: 'LinkedIn', url: 'https://linkedin.com' }],
        social: [{ text: 'Twitter', url: 'https://twitter.com' }]
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { getHomepageContent } = require('../../api/homepage');
    getHomepageContent.mockResolvedValue(mockHomepageData);
  });

  it('should render homepage dashboard with all sections', async () => {
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
      expect(screen.getByText('Brands Section')).toBeInTheDocument();
      expect(screen.getByText('Services Section')).toBeInTheDocument();
      expect(screen.getByText('Testimonials Section')).toBeInTheDocument();
      expect(screen.getByText('Footer Section')).toBeInTheDocument();
    });
  });

  it('should open section editor when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit hero/i });
    await user.click(editButton);

    // Should open hero editor
    expect(screen.getByDisplayValue('Test Hero Title')).toBeInTheDocument();
  });

  it('should save section changes', async () => {
    const user = userEvent.setup();
    const { updateHeroSection } = require('../../api/homepage');
    updateHeroSection.mockResolvedValue({ success: true });
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
    });

    // Open hero editor
    const editButton = screen.getByRole('button', { name: /edit hero/i });
    await user.click(editButton);

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Hero Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Hero Title');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateHeroSection).toHaveBeenCalledWith({
        title: 'Updated Hero Title',
        description: 'Test hero description',
        videoUrl: 'https://example.com/video.mp4'
      });
    });
  });

  it('should show unsaved changes indicator', async () => {
    const user = userEvent.setup();
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
    });

    // Open hero editor
    const editButton = screen.getByRole('button', { name: /edit hero/i });
    await user.click(editButton);

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Hero Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Modified Title');

    // Should show unsaved changes indicator
    expect(screen.getByText(/unsaved changes/i) || screen.getByText(/•/)).toBeInTheDocument();
  });

  it('should handle save all changes', async () => {
    const user = userEvent.setup();
    const { saveAllChanges } = require('../../api/homepage');
    saveAllChanges.mockResolvedValue({ success: true });
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });

    const saveAllButton = screen.getByRole('button', { name: /save all/i });
    await user.click(saveAllButton);

    await waitFor(() => {
      expect(saveAllChanges).toHaveBeenCalled();
    });
  });

  it('should handle publish changes', async () => {
    const user = userEvent.setup();
    const { publishChanges } = require('../../api/homepage');
    publishChanges.mockResolvedValue({ success: true });
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    // Should show confirmation dialog
    expect(screen.getByText(/confirm publish/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(publishChanges).toHaveBeenCalled();
    });
  });

  it('should open preview modal', async () => {
    const user = userEvent.setup();
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });

    const previewButton = screen.getByRole('button', { name: /preview/i });
    await user.click(previewButton);

    // Should open preview modal
    expect(screen.getByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should handle version management', async () => {
    const user = userEvent.setup();
    const { getVersions, createVersion } = require('../../api/homepage');
    getVersions.mockResolvedValue([
      {
        id: '1',
        versionName: 'Version 1',
        createdAt: new Date().toISOString(),
        isActive: false
      }
    ]);
    createVersion.mockResolvedValue({ success: true });
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });

    const versionsButton = screen.getByRole('button', { name: /versions/i });
    await user.click(versionsButton);

    // Should show version history
    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });

    // Create new version
    const createVersionButton = screen.getByRole('button', { name: /create version/i });
    await user.click(createVersionButton);

    const versionNameInput = screen.getByPlaceholderText(/version name/i);
    await user.type(versionNameInput, 'New Version');

    const saveVersionButton = screen.getByRole('button', { name: /save version/i });
    await user.click(saveVersionButton);

    await waitFor(() => {
      expect(createVersion).toHaveBeenCalledWith('New Version');
    });
  });

  it('should handle loading states', async () => {
    const { getHomepageContent } = require('../../api/homepage');
    getHomepageContent.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockHomepageData), 100)));
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    // Should show loading state
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const { getHomepageContent } = require('../../api/homepage');
    getHomepageContent.mockRejectedValue(new Error('API Error'));
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/error loading/i) || screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog for destructive actions', async () => {
    const user = userEvent.setup();
    
    render(<HomepagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Homepage CMS')).toBeInTheDocument();
    });

    // Try to navigate away with unsaved changes
    const heroEditButton = screen.getByRole('button', { name: /edit hero/i });
    await user.click(heroEditButton);

    // Make changes
    const titleInput = screen.getByDisplayValue('Test Hero Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Modified Title');

    // Try to navigate to another section
    const brandsEditButton = screen.getByRole('button', { name: /edit brands/i });
    await user.click(brandsEditButton);

    // Should show unsaved changes warning
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    expect(screen.getByText(/discard changes/i) || screen.getByText(/continue/i)).toBeInTheDocument();
  });

  it('should handle responsive behavior', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<HomepagePage />, { wrapper: createWrapper() });

    // Should adapt layout for mobile
    expect(screen.getByTestId('mobile-layout') || document.querySelector('.mobile-layout')).toBeTruthy();
  });
});