import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BulkOperationsToolbar from '@/components/media/BulkOperationsToolbar';

describe('BulkOperationsToolbar', () => {
  const defaultProps = {
    selectedCount: 0,
    totalCount: 10,
    onSelectAll: vi.fn(),
    onDeselectAll: vi.fn(),
    onBulkDelete: vi.fn(),
    onToggleSelectionMode: vi.fn(),
    isSelectionMode: false,
    bulkOperationInProgress: false,
  };

  it('should render selection button when not in selection mode', () => {
    render(<BulkOperationsToolbar {...defaultProps} />);
    
    expect(screen.getByText('☐ Sélectionner')).toBeInTheDocument();
    expect(screen.queryByText('☑ Tout sélectionner')).not.toBeInTheDocument();
  });

  it('should show selection controls when in selection mode', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} />);
    
    expect(screen.getByText('✓ Annuler sélection')).toBeInTheDocument();
    expect(screen.getByText('☑ Tout sélectionner')).toBeInTheDocument();
    expect(screen.getByText('☐ Tout désélectionner')).toBeInTheDocument();
  });

  it('should display selected count correctly', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={3} />);
    
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    expect(screen.getByText('3 médias sélectionnés')).toBeInTheDocument();
  });

  it('should show delete button when media are selected', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={2} />);
    
    expect(screen.getByText('Supprimer la sélection (2)')).toBeInTheDocument();
  });

  it('should call onToggleSelectionMode when selection button is clicked', () => {
    const onToggleSelectionMode = vi.fn();
    render(<BulkOperationsToolbar {...defaultProps} onToggleSelectionMode={onToggleSelectionMode} />);
    
    fireEvent.click(screen.getByText('☐ Sélectionner'));
    expect(onToggleSelectionMode).toHaveBeenCalledTimes(1);
  });

  it('should call onSelectAll when select all button is clicked', () => {
    const onSelectAll = vi.fn();
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} onSelectAll={onSelectAll} />);
    
    fireEvent.click(screen.getByText('☑ Tout sélectionner'));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should call onBulkDelete when delete button is clicked', () => {
    const onBulkDelete = vi.fn();
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={2} onBulkDelete={onBulkDelete} />);
    
    fireEvent.click(screen.getByText('Supprimer la sélection (2)'));
    expect(onBulkDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when bulk operation is in progress', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={2} bulkOperationInProgress={true} />);
    
    const deleteButton = screen.getByRole('button', { name: /Suppression/i });
    expect(deleteButton).toBeDisabled();
  });

  it('should disable select all button when all items are selected', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={10} totalCount={10} />);
    
    const selectAllButton = screen.getByText('☑ Tout sélectionner');
    expect(selectAllButton).toBeDisabled();
  });

  it('should disable deselect all button when no items are selected', () => {
    render(<BulkOperationsToolbar {...defaultProps} isSelectionMode={true} selectedCount={0} />);
    
    const deselectAllButton = screen.getByText('☐ Tout désélectionner');
    expect(deselectAllButton).toBeDisabled();
  });
});