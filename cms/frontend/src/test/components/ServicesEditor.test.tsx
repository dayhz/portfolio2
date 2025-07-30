import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServicesEditor } from '../../components/homepage/ServicesEditor';

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

describe('ServicesEditor', () => {
  const mockServicesData = {
    title: 'Our Services',
    description: 'We offer comprehensive design services',
    services: [
      {
        id: 1,
        number: '1.',
        title: 'Web Design',
        description: 'Beautiful and functional websites',
        link: '/web-design',
        colorClass: 'bg-blue-500'
      },
      {
        id: 2,
        number: '2.',
        title: 'Mobile Apps',
        description: 'Native and cross-platform mobile applications',
        link: '/mobile-apps',
        colorClass: 'bg-green-500'
      }
    ]
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render services editor with existing services', () => {
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Our Services')).toBeInTheDocument();
    expect(screen.getByDisplayValue('We offer comprehensive design services')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Web Design')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mobile Apps')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Beautiful and functional websites')).toBeInTheDocument();
  });

  it('should add new service', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add service/i });
    await user.click(addButton);

    // Should show a new service form
    const serviceTitleInputs = screen.getAllByPlaceholderText(/service title/i);
    expect(serviceTitleInputs).toHaveLength(3); // 2 existing + 1 new
  });

  it('should remove service', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove service/i });
    await user.click(removeButtons[0]);

    // Should remove the first service
    expect(screen.queryByDisplayValue('Web Design')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Mobile Apps')).toBeInTheDocument();
  });

  it('should validate service data before saving', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={{
          title: '',
          description: '',
          services: [
            {
              id: 1,
              number: '1.',
              title: '', // Empty title
              description: '', // Empty description
              link: '',
              colorClass: 'bg-blue-500'
            }
          ]
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/service title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/service description is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByDisplayValue('Our Services');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Services');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Services',
        description: 'We offer comprehensive design services',
        services: mockServicesData.services
      });
    });
  });

  it('should handle drag and drop reordering', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
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
    const dragDropContext = screen.getByTestId('services-drag-drop');
    fireEvent(dragDropContext, new CustomEvent('dragend', { detail: mockDragEnd }));

    // Verify reordering occurred
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          services: expect.arrayContaining([
            expect.objectContaining({ id: 2, number: '1.' }),
            expect.objectContaining({ id: 1, number: '2.' })
          ])
        })
      );
    });
  });

  it('should handle color class selection', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const colorSelectors = screen.getAllByRole('button', { name: /color/i });
    await user.click(colorSelectors[0]);

    // Should show color options
    expect(screen.getByText(/bg-red-500/i) || screen.getByRole('option')).toBeInTheDocument();
  });

  it('should limit number of services', async () => {
    const user = userEvent.setup();
    const maxServices = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      number: `${i + 1}.`,
      title: `Service ${i + 1}`,
      description: `Description ${i + 1}`,
      link: `/service-${i + 1}`,
      colorClass: 'bg-blue-500'
    }));
    
    render(
      <ServicesEditor 
        data={{
          title: 'Our Services',
          description: 'Service description',
          services: maxServices
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add service/i });
    
    // Should disable add button or show warning
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/maximum.*services/i)).toBeInTheDocument();
  });

  it('should handle cancel action', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
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
      <ServicesEditor 
        data={mockServicesData}
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

  it('should handle empty services list', () => {
    render(
      <ServicesEditor 
        data={{
          title: 'Our Services',
          description: 'Service description',
          services: []
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/no services added yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add service/i })).toBeInTheDocument();
  });

  it('should auto-generate service numbers', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={{
          title: 'Our Services',
          description: 'Service description',
          services: []
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Add first service
    const addButton = screen.getByRole('button', { name: /add service/i });
    await user.click(addButton);

    // Should auto-generate number "1."
    expect(screen.getByDisplayValue('1.')).toBeInTheDocument();

    // Add second service
    await user.click(addButton);

    // Should auto-generate number "2."
    expect(screen.getByDisplayValue('2.')).toBeInTheDocument();
  });

  it('should validate link format', async () => {
    const user = userEvent.setup();
    
    render(
      <ServicesEditor 
        data={mockServicesData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const linkInput = screen.getByDisplayValue('/web-design');
    await user.clear(linkInput);
    await user.type(linkInput, 'invalid link format');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show validation error for invalid link
    expect(screen.getByText(/invalid link format/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});