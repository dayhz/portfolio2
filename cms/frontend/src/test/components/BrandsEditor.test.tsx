import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandsEditor } from '../../components/homepage/BrandsEditor';

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

describe('BrandsEditor', () => {
  const mockBrandsData = {
    title: 'Our Amazing Clients',
    logos: [
      {
        id: 1,
        name: 'Client 1',
        logoUrl: '/images/client1.png',
        order: 1
      },
      {
        id: 2,
        name: 'Client 2',
        logoUrl: '/images/client2.png',
        order: 2
      }
    ]
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render brands editor with existing logos', () => {
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Our Amazing Clients')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Client 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Client 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/images/client1.png')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/images/client2.png')).toBeInTheDocument();
  });

  it('should add new logo', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add logo/i });
    await user.click(addButton);

    // Should show a new logo form
    const logoInputs = screen.getAllByPlaceholderText(/logo name/i);
    expect(logoInputs).toHaveLength(3); // 2 existing + 1 new
  });

  it('should remove logo', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    // Should remove the first logo
    expect(screen.queryByDisplayValue('Client 1')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Client 2')).toBeInTheDocument();
  });

  it('should validate logo data before saving', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={{
          title: 'Our Clients',
          logos: [
            {
              id: 1,
              name: '', // Empty name
              logoUrl: 'invalid-url', // Invalid URL
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

    expect(screen.getByText(/logo name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid logo url/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByDisplayValue('Our Amazing Clients');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Client Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Client Title',
        logos: mockBrandsData.logos
      });
    });
  });

  it('should handle drag and drop reordering', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
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
    const dragDropContext = screen.getByTestId('brands-drag-drop');
    fireEvent(dragDropContext, new CustomEvent('dragend', { detail: mockDragEnd }));

    // Verify reordering occurred
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          logos: expect.arrayContaining([
            expect.objectContaining({ id: 2, order: 1 }),
            expect.objectContaining({ id: 1, order: 2 })
          ])
        })
      );
    });
  });

  it('should handle cancel action', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
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
      <BrandsEditor 
        data={mockBrandsData}
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

  it('should handle empty logos list', () => {
    render(
      <BrandsEditor 
        data={{
          title: 'Our Clients',
          logos: []
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/no logos added yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add logo/i })).toBeInTheDocument();
  });

  it('should validate URL format', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const urlInput = screen.getByDisplayValue('/images/client1.png');
    await user.clear(urlInput);
    await user.type(urlInput, 'not-a-valid-url');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/invalid logo url/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle logo upload', async () => {
    const user = userEvent.setup();
    
    render(
      <BrandsEditor 
        data={mockBrandsData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const fileInput = screen.getAllByLabelText(/upload logo/i)[0];
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });

    await user.upload(fileInput, file);

    // Should show upload progress or success
    expect(screen.getByText(/uploading/i) || screen.getByText(/uploaded/i)).toBeInTheDocument();
  });

  it('should limit number of logos', async () => {
    const user = userEvent.setup();
    const manyLogos = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Client ${i + 1}`,
      logoUrl: `/images/client${i + 1}.png`,
      order: i + 1
    }));
    
    render(
      <BrandsEditor 
        data={{
          title: 'Our Clients',
          logos: manyLogos
        }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByRole('button', { name: /add logo/i });
    
    // Should disable add button or show warning
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/maximum.*logos/i)).toBeInTheDocument();
  });
});