import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroEditor } from '../../components/homepage/HeroEditor';

// Mock the API
vi.mock('../../api/homepage', () => ({
  updateHeroSection: vi.fn(),
  getHomepageContent: vi.fn()
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('HeroEditor', () => {
  const mockHeroData = {
    title: 'Test Hero Title',
    description: 'Test hero description that is long enough',
    videoUrl: 'https://example.com/video.mp4'
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render hero editor form', () => {
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test Hero Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test hero description that is long enough')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/video.mp4')).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Hero Title');
    const saveButton = screen.getByRole('button', { name: /save/i });

    // Modify the title
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Hero Title');

    // Submit the form
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Hero Title',
        description: 'Test hero description that is long enough',
        videoUrl: 'https://example.com/video.mp4'
      });
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={{ title: '', description: '', videoUrl: '' }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description must be at least/i)).toBeInTheDocument();
    
    // Should not call onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should validate video URL format', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={{
          title: 'Valid Title',
          description: 'Valid description that is long enough',
          videoUrl: 'invalid-url'
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/invalid video url/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle cancel action', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show loading state during save', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed save
    const delayedSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={delayedSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  it('should handle save errors gracefully', async () => {
    const user = userEvent.setup();
    const errorSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={errorSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/error saving/i)).toBeInTheDocument();
    });
  });

  it('should allow empty video URL', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={{
          title: 'Valid Title',
          description: 'Valid description that is long enough',
          videoUrl: ''
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Valid Title',
        description: 'Valid description that is long enough',
        videoUrl: ''
      });
    });
  });

  it('should handle character limits', async () => {
    const user = userEvent.setup();
    const longTitle = 'a'.repeat(201); // Over 200 character limit
    const longDescription = 'a'.repeat(2001); // Over 2000 character limit
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Hero Title');
    const descriptionInput = screen.getByDisplayValue('Test hero description that is long enough');

    await user.clear(titleInput);
    await user.type(titleInput, longTitle);
    
    await user.clear(descriptionInput);
    await user.type(descriptionInput, longDescription);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/title must be less than 200 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/description must be less than 2000 characters/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should preserve form state during editing', async () => {
    const user = userEvent.setup();
    
    render(
      <HeroEditor 
        data={mockHeroData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Hero Title');
    const descriptionInput = screen.getByDisplayValue('Test hero description that is long enough');

    // Make changes
    await user.clear(titleInput);
    await user.type(titleInput, 'Modified Title');
    
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Modified description that is also long enough');

    // Verify changes are preserved
    expect(screen.getByDisplayValue('Modified Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Modified description that is also long enough')).toBeInTheDocument();
  });
});