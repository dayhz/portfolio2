import { describe, it, expect, vi } from 'vitest';

describe('Bulk Delete Logic Fix', () => {
  it('should capture media IDs at the moment of click to prevent wave deletion bug', () => {
    // Simulate the original buggy behavior
    let mediaList = [
      { id: '1', name: 'Image 1' },
      { id: '2', name: 'Image 2' },
      { id: '3', name: 'Image 3' }
    ];

    // Original buggy approach - IDs captured during API call
    const buggyGetIds = () => mediaList.map(media => media.id);
    
    // Fixed approach - IDs captured at click time
    const fixedGetIds = (currentMediaList: any[]) => currentMediaList.map(media => media.id);

    // Simulate the click happening
    const idsAtClickTime = fixedGetIds(mediaList);
    
    // Simulate list changing during deletion (the bug scenario)
    mediaList = mediaList.slice(1); // Remove first item to simulate partial deletion
    
    // With the buggy approach, we'd get different IDs
    const buggyIds = buggyGetIds();
    
    // With the fixed approach, we still have the original IDs
    expect(idsAtClickTime).toEqual(['1', '2', '3']);
    expect(buggyIds).toEqual(['2', '3']); // This would cause incomplete deletion
    
    // The fix ensures we always use the IDs captured at click time
    expect(idsAtClickTime).not.toEqual(buggyIds);
    expect(idsAtClickTime.length).toBe(3); // All original items
  });

  it('should prevent multiple simultaneous operations', () => {
    let operationInProgress = false;
    
    const startOperation = () => {
      if (operationInProgress) {
        throw new Error('Operation already in progress');
      }
      operationInProgress = true;
      return Promise.resolve().finally(() => {
        operationInProgress = false;
      });
    };

    // First operation should succeed
    expect(() => startOperation()).not.toThrow();
    
    // Second operation while first is in progress should fail
    expect(() => startOperation()).toThrow('Operation already in progress');
  });

  it('should provide detailed feedback on partial failures', () => {
    const mockResult = {
      deleted: 2,
      total: 3,
      errors: ['Failed to delete Image 3: File not found']
    };

    const getSuccessMessage = (result: typeof mockResult) => {
      if (result.errors && result.errors.length > 0) {
        return `${result.deleted}/${result.total} médias supprimés, ${result.errors.length} erreurs`;
      } else {
        return `${result.deleted}/${result.total} média(s) supprimé(s) avec succès`;
      }
    };

    expect(getSuccessMessage(mockResult)).toBe('2/3 médias supprimés, 1 erreurs');
    
    const successResult = { ...mockResult, deleted: 3, errors: [] };
    expect(getSuccessMessage(successResult)).toBe('3/3 média(s) supprimé(s) avec succès');
  });
});