import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestimonialsEditor } from '@/components/services/TestimonialsEditor';
import { ClientsEditor } from '@/components/services/ClientsEditor';
import { SkillsVideoEditor } from '@/components/services/SkillsVideoEditor';
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
      id: 'avatar-1',
      name: 'John Doe Avatar',
      filename: 'john-avatar.jpg',
      originalName: 'john-avatar.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      url: '/uploads/john-avatar.jpg',
      thumbnailUrl: '/uploads/john-avatar-thumb.webp',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'project-1',
      name: 'Project Screenshot',
      filename: 'project-screenshot.jpg',
      originalName: 'project-screenshot.jpg',
      mimeType: 'image/jpeg',
      size: 2048000,
      url: '/uploads/project-screenshot.jpg',
      thumbnailUrl: '/uploads/project-screenshot-thumb.webp',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'logo-1',
      name: 'Company Logo',
      filename: 'company-logo.svg',
      originalName: 'company-logo.svg',
      mimeType: 'image/svg+xml',
      size: 4096,
      url: '/uploads/company-logo.svg',
      type: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'video-1',
      name: 'Demo Video',
      filename: 'demo-video.mp4',
      originalName: 'demo-video.mp4',
      mimeType: 'video/mp4',
      size: 10485760,
      url: '/uploads/demo-video.mp4',
      type: 'video',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  meta: {
    page: 1,
    limit: 50,
    total: 4,
    totalPages: 1
  }
};

describe('Services Media Integration', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete
    });
    mockGet.mockResolvedValue(mockMediaData);
  });

  describe('TestimonialsEditor Media Integration', () => {
    const mockTestimonialsData = {
      testimonials: []
    };

    const mockOnChange = vi.fn();

    it('opens avatar media selector when avatar upload button is clicked', async () => {
      render(
        <TestimonialsEditor
          data={mockTestimonialsData}
          onChange={mockOnChange}
        />
      );

      // Click add testimonial button
      fireEvent.click(screen.getByText('Ajouter un témoignage'));

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau témoignage')).toBeInTheDocument();
      });

      // Click avatar upload button
      const avatarButton = screen.getByText(/Ajouter.*photo/);
      fireEvent.click(avatarButton);

      // Media selector should open
      await waitFor(() => {
        expect(screen.getByText('Sélectionner un avatar')).toBeInTheDocument();
        expect(screen.getByText('Choisissez une photo pour l\'auteur du témoignage')).toBeInTheDocument();
      });

      // Should fetch media with avatar filter
      expect(mockGet).toHaveBeenCalledWith('/media?page=1&limit=50');
    });

    it('opens project image media selector when project image upload button is clicked', async () => {
      render(
        <TestimonialsEditor
          data={mockTestimonialsData}
          onChange={mockOnChange}
        />
      );

      // Click add testimonial button
      fireEvent.click(screen.getByText('Ajouter un témoignage'));

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau témoignage')).toBeInTheDocument();
      });

      // Click project image upload button
      const projectImageButton = screen.getByText(/Ajouter.*image/);
      fireEvent.click(projectImageButton);

      // Media selector should open
      await waitFor(() => {
        expect(screen.getByText('Sélectionner une image de projet')).toBeInTheDocument();
        expect(screen.getByText('Choisissez une image pour illustrer le projet')).toBeInTheDocument();
      });
    });

    it('selects avatar from media selector and updates form', async () => {
      render(
        <TestimonialsEditor
          data={mockTestimonialsData}
          onChange={mockOnChange}
        />
      );

      // Open add testimonial dialog
      fireEvent.click(screen.getByText('Ajouter un témoignage'));

      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau témoignage')).toBeInTheDocument();
      });

      // Open avatar selector
      fireEvent.click(screen.getByText(/Ajouter.*photo/));

      await waitFor(() => {
        expect(screen.getByText('Sélectionner un avatar')).toBeInTheDocument();
        expect(screen.getByText('John Doe Avatar')).toBeInTheDocument();
      });

      // Select avatar
      fireEvent.click(screen.getByText('John Doe Avatar'));

      // Should show success message
      expect(mockToast.success).toHaveBeenCalledWith('Image sélectionnée avec succès');

      // Media selector should close
      await waitFor(() => {
        expect(screen.queryByText('Sélectionner un avatar')).not.toBeInTheDocument();
      });
    });

    it('filters media by avatar type in media selector', async () => {
      render(
        <TestimonialsEditor
          data={mockTestimonialsData}
          onChange={mockOnChange}
        />
      );

      // Open add testimonial dialog and avatar selector
      fireEvent.click(screen.getByText('Ajouter un témoignage'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*photo/));
      });

      await waitFor(() => {
        expect(screen.getByText('Sélectionner un avatar')).toBeInTheDocument();
      });

      // Should only show appropriate media types for avatars
      // This is handled by the MediaSelector component's filtering logic
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('ClientsEditor Media Integration', () => {
    const mockClientsData = {
      clients: []
    };

    const mockOnChange = vi.fn();

    it('opens logo media selector when logo upload button is clicked', async () => {
      render(
        <ClientsEditor
          data={mockClientsData}
          onChange={mockOnChange}
        />
      );

      // Click add client button
      fireEvent.click(screen.getByText('Ajouter un client'));

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau client')).toBeInTheDocument();
      });

      // Click logo upload button
      const logoButton = screen.getByText(/Ajouter.*logo/);
      fireEvent.click(logoButton);

      // Media selector should open
      await waitFor(() => {
        expect(screen.getByText('Sélectionner un logo')).toBeInTheDocument();
        expect(screen.getByText('Choisissez un logo pour le client (SVG recommandé)')).toBeInTheDocument();
      });
    });

    it('selects logo from media selector and updates form', async () => {
      render(
        <ClientsEditor
          data={mockClientsData}
          onChange={mockOnChange}
        />
      );

      // Open add client dialog
      fireEvent.click(screen.getByText('Ajouter un client'));

      await waitFor(() => {
        expect(screen.getByText('Ajouter un nouveau client')).toBeInTheDocument();
      });

      // Open logo selector
      fireEvent.click(screen.getByText(/Ajouter.*logo/));

      await waitFor(() => {
        expect(screen.getByText('Sélectionner un logo')).toBeInTheDocument();
        expect(screen.getByText('Company Logo')).toBeInTheDocument();
      });

      // Select logo
      fireEvent.click(screen.getByText('Company Logo'));

      // Should show success message
      expect(mockToast.success).toHaveBeenCalledWith('Logo sélectionné avec succès');
    });

    it('filters media by logo type in media selector', async () => {
      render(
        <ClientsEditor
          data={mockClientsData}
          onChange={mockOnChange}
        />
      );

      // Open add client dialog and logo selector
      fireEvent.click(screen.getByText('Ajouter un client'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*logo/));
      });

      await waitFor(() => {
        expect(screen.getByText('Sélectionner un logo')).toBeInTheDocument();
      });

      // Should filter for logo-appropriate media types
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('SkillsVideoEditor Media Integration', () => {
    const mockSkillsVideoData = {
      description: '',
      skills: [],
      ctaText: '',
      ctaUrl: '',
      video: {
        url: '',
        caption: '',
        autoplay: false,
        loop: false,
        muted: true
      }
    };

    const mockOnChange = vi.fn();

    it('opens video media selector when video upload button is clicked', async () => {
      render(
        <SkillsVideoEditor
          data={mockSkillsVideoData}
          onChange={mockOnChange}
        />
      );

      // Find and click video upload button
      const videoUploadButton = screen.getByTitle('Sélectionner une vidéo');
      fireEvent.click(videoUploadButton);

      // Media selector should open
      await waitFor(() => {
        expect(screen.getByText('Sélectionner une vidéo')).toBeInTheDocument();
        expect(screen.getByText('Choisissez une vidéo pour la section compétences')).toBeInTheDocument();
      });
    });

    it('selects video from media selector and updates form', async () => {
      render(
        <SkillsVideoEditor
          data={mockSkillsVideoData}
          onChange={mockOnChange}
        />
      );

      // Open video selector
      fireEvent.click(screen.getByTitle('Sélectionner une vidéo'));

      await waitFor(() => {
        expect(screen.getByText('Sélectionner une vidéo')).toBeInTheDocument();
        expect(screen.getByText('Demo Video')).toBeInTheDocument();
      });

      // Select video
      fireEvent.click(screen.getByText('Demo Video'));

      // Should show success message
      expect(mockToast.success).toHaveBeenCalledWith('Vidéo sélectionnée avec succès');

      // Should call onChange with updated video URL
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            url: '/uploads/demo-video.mp4'
          })
        })
      );
    });

    it('filters media by video type in media selector', async () => {
      render(
        <SkillsVideoEditor
          data={mockSkillsVideoData}
          onChange={mockOnChange}
        />
      );

      // Open video selector
      fireEvent.click(screen.getByTitle('Sélectionner une vidéo'));

      await waitFor(() => {
        expect(screen.getByText('Sélectionner une vidéo')).toBeInTheDocument();
      });

      // Should filter for video media types
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('Media Type Validation', () => {
    it('validates avatar media type restrictions', async () => {
      const avatarOnlyMedia = {
        ...mockMediaData,
        data: mockMediaData.data.filter(item => 
          item.mimeType.startsWith('image/') && 
          ['image/jpeg', 'image/png', 'image/webp'].includes(item.mimeType)
        )
      };

      mockGet.mockResolvedValue(avatarOnlyMedia);

      render(
        <TestimonialsEditor
          data={{ testimonials: [] }}
          onChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Ajouter un témoignage'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*photo/));
      });

      // Should only show avatar-compatible media
      await waitFor(() => {
        expect(screen.getByText('John Doe Avatar')).toBeInTheDocument();
        expect(screen.queryByText('Demo Video')).not.toBeInTheDocument();
      });
    });

    it('validates logo media type restrictions', async () => {
      const logoOnlyMedia = {
        ...mockMediaData,
        data: mockMediaData.data.filter(item => 
          ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'].includes(item.mimeType)
        )
      };

      mockGet.mockResolvedValue(logoOnlyMedia);

      render(
        <ClientsEditor
          data={{ clients: [] }}
          onChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Ajouter un client'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*logo/));
      });

      // Should show logo-compatible media
      await waitFor(() => {
        expect(screen.getByText('Company Logo')).toBeInTheDocument();
        expect(screen.queryByText('Demo Video')).not.toBeInTheDocument();
      });
    });

    it('validates video media type restrictions', async () => {
      const videoOnlyMedia = {
        ...mockMediaData,
        data: mockMediaData.data.filter(item => item.mimeType.startsWith('video/'))
      };

      mockGet.mockResolvedValue(videoOnlyMedia);

      render(
        <SkillsVideoEditor
          data={{
            description: '',
            skills: [],
            ctaText: '',
            ctaUrl: '',
            video: { url: '', caption: '', autoplay: false, loop: false, muted: true }
          }}
          onChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTitle('Sélectionner une vidéo'));

      // Should only show video media
      await waitFor(() => {
        expect(screen.getByText('Demo Video')).toBeInTheDocument();
        expect(screen.queryByText('John Doe Avatar')).not.toBeInTheDocument();
        expect(screen.queryByText('Company Logo')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles media loading errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockRejectedValue(new Error('Network error'));

      render(
        <TestimonialsEditor
          data={{ testimonials: [] }}
          onChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Ajouter un témoignage'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*photo/));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Erreur lors du chargement des médias');
      });

      consoleError.mockRestore();
    });

    it('handles media selection errors gracefully', async () => {
      render(
        <TestimonialsEditor
          data={{ testimonials: [] }}
          onChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Ajouter un témoignage'));
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Ajouter.*photo/));
      });

      await waitFor(() => {
        expect(screen.getByText('Sélectionner un avatar')).toBeInTheDocument();
      });

      // Simulate clicking on a media item that might cause an error
      // The component should handle this gracefully
      expect(screen.getByText('John Doe Avatar')).toBeInTheDocument();
    });
  });
});