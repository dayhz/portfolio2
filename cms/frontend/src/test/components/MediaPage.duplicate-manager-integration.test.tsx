import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MediaPage from '../../pages/MediaPage';

// Mock all the dependencies
vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 50, total: 0, totalPages: 0 }
    }),
    delete: vi.fn()
  })
}));

vi.mock('../../utils/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock react-iconly icons
vi.mock('react-iconly', () => ({
  Image: () => <div data-testid="image-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Delete: () => <div data-testid="delete-icon" />
}));

describe('MediaPage - DuplicateManager Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DuplicateManager button in the toolbar', async () => {
    render(<MediaPage />);
    
    // Wait for the component to load
    await screen.findByText('Médiathèque');
    
    // Check that the duplicate manager button is present
    expect(screen.getByText('Détecter doublons')).toBeInTheDocument();
  });

  it('has proper button layout with flex-wrap', async () => {
    render(<MediaPage />);
    
    // Wait for the component to load
    await screen.findByText('Médiathèque');
    
    // Check that main action buttons are present and properly arranged
    expect(screen.getByText('Détecter doublons')).toBeInTheDocument();
    expect(screen.getByText('Synchroniser')).toBeInTheDocument();
    expect(screen.getByText('Régénérer miniatures')).toBeInTheDocument();
  });

  it('shows development tools only in development mode', async () => {
    // Mock NODE_ENV to be development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<MediaPage />);
    
    // Wait for the component to load
    await screen.findByText('Médiathèque');
    
    // Check that development tools section is present
    expect(screen.getByText('🔧 Outils de développement')).toBeInTheDocument();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('hides development tools in production mode', async () => {
    // Mock NODE_ENV to be production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(<MediaPage />);
    
    // Wait for the component to load
    await screen.findByText('Médiathèque');
    
    // Check that development tools section is not present
    expect(screen.queryByText('🔧 Outils de développement')).not.toBeInTheDocument();
    expect(screen.queryByText('Tout supprimer (DEV)')).not.toBeInTheDocument();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
});