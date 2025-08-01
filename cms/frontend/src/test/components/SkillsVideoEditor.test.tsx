import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SkillsVideoEditor } from '../../components/services/SkillsVideoEditor';
import { SkillsVideoData } from '../../../../shared/types/services';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const mockSkillsVideoData: SkillsVideoData = {
  description: 'The ideal balance between UX and UI is what makes a winning product.',
  skills: [
    { id: 'skill-1', name: 'User Experience Design', order: 0 },
    { id: 'skill-2', name: 'User Interface Design', order: 1 },
    { id: 'skill-3', name: 'Prototyping', order: 2 }
  ],
  ctaText: 'See all projects',
  ctaUrl: '/work',
  video: {
    url: 'https://example.com/video.mp4',
    caption: 'Watch my design process in action',
    autoplay: true,
    loop: true,
    muted: true
  }
};

describe('SkillsVideoEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnPreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with data', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    expect(screen.getByText('Compétences & Vidéo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('The ideal balance between UX and UI is what makes a winning product.')).toBeInTheDocument();
    expect(screen.getByText('User Experience Design')).toBeInTheDocument();
    expect(screen.getByText('User Interface Design')).toBeInTheDocument();
    expect(screen.getByText('Prototyping')).toBeInTheDocument();
    expect(screen.getByDisplayValue('See all projects')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/work')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/video.mp4')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        isLoading={true}
      />
    );

    expect(screen.getByText('Chargement de la section Skills & Video...')).toBeInTheDocument();
  });

  it('handles description change', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    const descriptionTextarea = screen.getByDisplayValue('The ideal balance between UX and UI is what makes a winning product.');
    fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSkillsVideoData,
      description: 'New description'
    });
  });

  it('handles CTA text and URL changes', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    const ctaTextInput = screen.getByDisplayValue('See all projects');
    fireEvent.change(ctaTextInput, { target: { value: 'View portfolio' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSkillsVideoData,
      ctaText: 'View portfolio'
    });

    const ctaUrlInput = screen.getByDisplayValue('/work');
    fireEvent.change(ctaUrlInput, { target: { value: '/portfolio' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSkillsVideoData,
      ctaUrl: '/portfolio'
    });
  });

  it('handles video URL change', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    const videoUrlInput = screen.getByDisplayValue('https://example.com/video.mp4');
    fireEvent.change(videoUrlInput, { target: { value: 'https://example.com/new-video.mp4' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSkillsVideoData,
      video: {
        ...mockSkillsVideoData.video,
        url: 'https://example.com/new-video.mp4'
      }
    });
  });

  it('opens add skill dialog', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    const addButton = screen.getByText('Ajouter une compétence');
    fireEvent.click(addButton);

    expect(screen.getByText('Ajouter une nouvelle compétence')).toBeInTheDocument();
  });

  it('adds a new skill', async () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Open add dialog
    const addButton = screen.getByText('Ajouter une compétence');
    fireEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByPlaceholderText('Ex: User Experience Design, Prototyping...');
    fireEvent.change(nameInput, { target: { value: 'New Skill' } });

    // Submit
    const submitButton = screen.getByText('Ajouter la compétence');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockSkillsVideoData,
        skills: [
          ...mockSkillsVideoData.skills,
          expect.objectContaining({
            name: 'New Skill',
            order: 3
          })
        ]
      });
    });
  });

  it('validates skill name', async () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Open add dialog
    const addButton = screen.getByText('Ajouter une compétence');
    fireEvent.click(addButton);

    // Try to submit without name
    const submitButton = screen.getByText('Ajouter la compétence');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le nom de la compétence est obligatoire')).toBeInTheDocument();
    });
  });

  it('prevents duplicate skills', async () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Open add dialog
    const addButton = screen.getByText('Ajouter une compétence');
    fireEvent.click(addButton);

    // Try to add existing skill
    const nameInput = screen.getByPlaceholderText('Ex: User Experience Design, Prototyping...');
    fireEvent.change(nameInput, { target: { value: 'User Experience Design' } });

    const submitButton = screen.getByText('Ajouter la compétence');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cette compétence existe déjà')).toBeInTheDocument();
    });
  });

  it('removes a skill', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Find and click remove button for first skill
    const removeButtons = screen.getAllByLabelText(/Supprimer la compétence/);
    fireEvent.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSkillsVideoData,
      skills: [
        { id: 'skill-2', name: 'User Interface Design', order: 0 },
        { id: 'skill-3', name: 'Prototyping', order: 1 }
      ]
    });
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Make a change to enable save button
    const descriptionTextarea = screen.getByDisplayValue('The ideal balance between UX and UI is what makes a winning product.');
    fireEvent.change(descriptionTextarea, { target: { value: 'Changed description' } });

    const saveButton = screen.getByText('Sauvegarder et Publier');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockSkillsVideoData,
        description: 'Changed description'
      });
    });
  });

  it('calls onPreview when preview button is clicked', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    const previewButton = screen.getByText('Prévisualiser');
    fireEvent.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalledWith(mockSkillsVideoData);
  });

  it('shows empty state when no skills', () => {
    const emptyData = { ...mockSkillsVideoData, skills: [] };
    
    render(
      <SkillsVideoEditor
        data={emptyData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    expect(screen.getByText('Aucune compétence')).toBeInTheDocument();
    expect(screen.getByText('Commencez par ajouter votre première compétence')).toBeInTheDocument();
  });

  it('shows skill limit warning', () => {
    const skillsAtLimit = Array.from({ length: 20 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i}`,
      order: i
    }));
    
    const dataAtLimit = { ...mockSkillsVideoData, skills: skillsAtLimit };
    
    render(
      <SkillsVideoEditor
        data={dataAtLimit}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    expect(screen.getByText('Vous avez atteint la limite de 20 compétences. Supprimez une compétence existante pour en ajouter une nouvelle.')).toBeInTheDocument();
    
    const addButton = screen.getByText('Ajouter une compétence');
    expect(addButton).toBeDisabled();
  });

  it('shows unsaved changes warning', () => {
    render(
      <SkillsVideoEditor
        data={mockSkillsVideoData}
        onChange={mockOnChange}
        onSave={mockOnSave}
        onPreview={mockOnPreview}
      />
    );

    // Make a change
    const descriptionTextarea = screen.getByDisplayValue('The ideal balance between UX and UI is what makes a winning product.');
    fireEvent.change(descriptionTextarea, { target: { value: 'Changed description' } });

    expect(screen.getByText('Vous avez des modifications non sauvegardées. N\'oubliez pas de sauvegarder et publier vos changements.')).toBeInTheDocument();
    expect(screen.getByText('(Modifications non sauvegardées)')).toBeInTheDocument();
  });
});