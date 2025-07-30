import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestimonialsEditor } from '../../components/homepage/TestimonialsEditor';

// Mock drag and drop
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: any) => children,
  Droppable: ({ children }: any) => children({ provided: { droppableProps: {}, innerRef: vi.fn() }, snapshot: {} }),
  Draggable: ({ children }: any) => children({ provided: { draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() }, snapshot: {} })
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('TestimonialsEditor', () => {
  const mockTestimonialsData = {
    testimonials: [
      {
        id: 1,
        text: 'Working with this team was an amazing experience. They delivered exactly what we needed.',
        clientName: 'John Doe',
        clientTitle: 'CEO',
        clientPhoto: '/images/john.jpg',
        projectLink: 'https://project1.com',
        projectImage: '/images/project1.jpg',
        order: 1
      },
      {
        id: 2,
        text: 'Exceptional quality and attention to detail. Highly recommend their services.',
        clientName: 'Jane Smith',
        clientTitle: 'CTO',
        clientPhoto: '/images/jane.jpg',
        projectLink: 'https://project2.com',
        projectImage: '/images/project2.jpg',
        order: 2
      }
    ]
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render testimonials editor with existing testimonials', () => {
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CTO')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Working with this team was an amazing experience. They delivered exactly what we needed.')).toBeInTheDocument();
  });

  it('should add new testimonial', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add testimonial/i });
    await user.click(addButton);

    // Should show a new testimonial form
    const clientNameInputs = screen.getAllByPlaceholderText(/client name/i);
    expect(clientNameInputs).toHaveLength(3); // 2 existing + 1 new
  });

  it('should remove testimonial', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove testimonial/i });
    await user.click(removeButtons[0]);

    // Should remove the first testimonial
    expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
  });

  it('should validate testimonial data before saving', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={{
          testimonials: [
            {
              id: 1,
              text: 'Short', // Too short
              clientName: '', // Empty name
              clientTitle: 'CEO',
              clientPhoto: 'invalid-url', // Invalid URL
              projectLink: 'not-a-url', // Invalid URL
              projectImage: '/images/project.jpg',
              order: 1
            }
          ]
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/testimonial text must be at least 20 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/client name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid.*url/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const clientNameInput = screen.getByDisplayValue('John Doe');
    await user.clear(clientNameInput);
    await user.type(clientNameInput, 'Updated Client Name');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        testimonials: expect.arrayContaining([
          expect.objectContaining({
            clientName: 'Updated Client Name'
          })
        ])
      });
    });
  });

  it('should handle drag and drop reordering', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Mock drag and drop result
    const mockDragEnd = {
      destination: { index: 1 },
      source: { index: 0 },
      draggableId: '1'
    };

    // Simulate drag end event
    const dragDropContext = screen.getByTestId('testimonials-drag-drop');
    fireEvent(dragDropContext, new CustomEvent('dragend', { detail: mockDragEnd }));

    // Verify reordering occurred
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          testimonials: expect.arrayContaining([
            expect.objectContaining({ id: 2, order: 1 }),
            expect.objectContaining({ id: 1, order: 2 })
          ])
        })
      );
    });
  });

  it('should handle photo upload', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const fileInputs = screen.getAllByLabelText(/upload photo/i);
    const file = new File(['photo'], 'client.jpg', { type: 'image/jpeg' });

    await user.upload(fileInputs[0], file);

    // Should show upload progress or success
    expect(screen.getByText(/uploading/i) || screen.getByText(/uploaded/i)).toBeInTheDocument();
  });

  it('should limit number of testimonials', async () => {
    const user = userEvent.setup();
    const maxTestimonials = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      text: `This is testimonial number ${i + 1} with enough content to pass validation requirements.`,
      clientName: `Client ${i + 1}`,
      clientTitle: `Title ${i + 1}`,
      clientPhoto: `/images/client${i + 1}.jpg`,
      projectLink: `https://project${i + 1}.com`,
      projectImage: `/images/project${i + 1}.jpg`,
      order: i + 1
    }));
    
    render(
      <TestimonialsEditor 
        data={{ testimonials: maxTestimonials }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add testimonial/i });
    
    // Should disable add button or show warning
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/maximum.*testimonials/i)).toBeInTheDocument();
  });

  it('should handle cancel action', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
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
    const delayedSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={delayedSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  it('should handle empty testimonials list', () => {
    render(
      <TestimonialsEditor 
        data={{ testimonials: [] }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/no testimonials added yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add testimonial/i })).toBeInTheDocument();
  });

  it('should validate text length', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const textInput = screen.getByDisplayValue('Working with this team was an amazing experience. They delivered exactly what we needed.');
    await user.clear(textInput);
    await user.type(textInput, 'Too short');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/testimonial text must be at least 20 characters/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle project image upload', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={mockTestimonialsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const projectImageInputs = screen.getAllByLabelText(/upload project image/i);
    const file = new File(['project'], 'project.jpg', { type: 'image/jpeg' });

    await user.upload(projectImageInputs[0], file);

    // Should show upload progress or success
    expect(screen.getByText(/uploading/i) || screen.getByText(/uploaded/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestimonialsEditor 
        data={{
          testimonials: [
            {
              id: 1,
              text: '',
              clientName: '',
              clientTitle: '',
              clientPhoto: '',
              projectLink: '',
              projectImage: '',
              order: 1
            }
          ]
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/testimonial text is required/i)).toBeInTheDocument();
    expect(screen.getByText(/client name is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});