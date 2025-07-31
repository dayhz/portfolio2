import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DuplicateManager from '../../components/media/DuplicateManager';

// Mock axios
vi.mock('../../utils/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('DuplicateManager', () => {
  const mockOnDuplicatesDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the detect duplicates button', () => {
    render(<DuplicateManager onDuplicatesDeleted={mockOnDuplicatesDeleted} />);
    
    expect(screen.getByText('Détecter doublons')).toBeInTheDocument();
  });

  it('renders correctly', () => {
    render(<DuplicateManager onDuplicatesDeleted={mockOnDuplicatesDeleted} />);
    
    expect(screen.getByText('Détecter doublons')).toBeInTheDocument();
  });

  it('has correct button styling', () => {
    render(<DuplicateManager onDuplicatesDeleted={mockOnDuplicatesDeleted} />);
    
    const button = screen.getByText('Détecter doublons');
    expect(button).toHaveClass('gap-2');
  });
});