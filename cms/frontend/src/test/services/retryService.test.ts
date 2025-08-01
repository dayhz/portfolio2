import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetryService, RetryConfigs } from '../../services/retryService';

describe('RetryService', () => {
  let retryService: RetryService;
  let mockOperation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    retryService = new RetryService();
    mockOperation = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Successful Operations', () => {
    it('returns success result when operation succeeds on first try', async () => {
      const expectedResult = { data: 'success' };
      mockOperation.mockResolvedValueOnce(expectedResult);

      const promise = retryService.executeWithRetry(mockOperation);
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('returns success result when operation succeeds after retries', async () => {
      const expectedResult = { data: 'success' };
      mockOperation
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce(expectedResult);

      const promise = retryService.executeWithRetry(mockOperation);
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(result.attempts).toBe(3);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Failed Operations', () => {
    it('returns failure result when all retries are exhausted', async () => {
      const error = new Error('Persistent error');
      mockOperation.mockRejectedValue(error);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('stops retrying for non-retryable errors', async () => {
      const nonRetryableError = new Error('Validation error');
      nonRetryableError.name = 'ValidationError';
      mockOperation.mockRejectedValue(nonRetryableError);

      const promise = retryService.executeWithRetry(mockOperation, {
        retryCondition: (error) => error.name !== 'ValidationError'
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBe(nonRetryableError);
      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Logic', () => {
    it('waits with exponential backoff between retries', async () => {
      const error = new Error('Network error');
      mockOperation.mockRejectedValue(error);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 100,
        backoffMultiplier: 2
      });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(mockOperation).toHaveBeenCalledTimes(1);

      // Wait for first retry delay (100ms)
      await vi.advanceTimersByTimeAsync(100);
      expect(mockOperation).toHaveBeenCalledTimes(2);

      // Wait for second retry delay (200ms)
      await vi.advanceTimersByTimeAsync(200);
      expect(mockOperation).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result.attempts).toBe(3);
    });

    it('respects maximum delay limit', async () => {
      const error = new Error('Network error');
      mockOperation.mockRejectedValue(error);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 4,
        baseDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 3
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(mockOperation).toHaveBeenCalledTimes(1);

      // First retry: 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOperation).toHaveBeenCalledTimes(2);

      // Second retry: should be 3000ms but capped at 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockOperation).toHaveBeenCalledTimes(3);

      // Third retry: also capped at 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockOperation).toHaveBeenCalledTimes(4);

      const result = await promise;
      expect(result.attempts).toBe(4);
    });
  });

  describe('Callbacks', () => {
    it('calls onRetry callback for each retry attempt', async () => {
      const onRetry = vi.fn();
      const error = new Error('Network error');
      mockOperation.mockRejectedValue(error);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        onRetry
      });
      vi.runAllTimers();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2); // Called for attempts 2 and 3
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, error);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, error);
    });

    it('calls onMaxAttemptsReached when retries are exhausted', async () => {
      const onMaxAttemptsReached = vi.fn();
      const error = new Error('Persistent error');
      mockOperation.mockRejectedValue(error);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2,
        onMaxAttemptsReached
      });
      vi.runAllTimers();
      await promise;

      expect(onMaxAttemptsReached).toHaveBeenCalledWith(error);
    });

    it('does not call onMaxAttemptsReached when operation succeeds', async () => {
      const onMaxAttemptsReached = vi.fn();
      mockOperation
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success');

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        onMaxAttemptsReached
      });
      vi.runAllTimers();
      await promise;

      expect(onMaxAttemptsReached).not.toHaveBeenCalled();
    });
  });

  describe('Error Classification', () => {
    it('retries network errors', async () => {
      const networkError = new TypeError('fetch failed');
      mockOperation.mockRejectedValue(networkError);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('retries HTTP 5xx errors', async () => {
      const serverError = new Error('Server error');
      (serverError as any).status = 500;
      mockOperation.mockRejectedValue(serverError);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('retries timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockOperation.mockRejectedValue(timeoutError);

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('does not retry HTTP 4xx errors', async () => {
      const clientError = new Error('Bad request');
      (clientError as any).status = 400;
      mockOperation.mockRejectedValue(clientError);

      const promise = retryService.executeWithRetry(mockOperation);
      vi.runAllTimers();
      const result = await promise;

      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Wrapper', () => {
    it('creates a wrapper function that handles retries transparently', async () => {
      const originalFunction = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const wrappedFunction = retryService.createRetryWrapper(originalFunction, {
        maxAttempts: 2
      });

      const promise = wrappedFunction('arg1', 'arg2');
      vi.runAllTimers();
      const result = await promise;

      expect(result).toBe('success');
      expect(originalFunction).toHaveBeenCalledTimes(2);
      expect(originalFunction).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('throws error when wrapper function fails all retries', async () => {
      const error = new Error('Persistent error');
      const originalFunction = vi.fn().mockRejectedValue(error);

      const wrappedFunction = retryService.createRetryWrapper(originalFunction, {
        maxAttempts: 2
      });

      const promise = wrappedFunction();
      vi.runAllTimers();

      await expect(promise).rejects.toThrow('Persistent error');
      expect(originalFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Timing Accuracy', () => {
    it('tracks total execution time accurately', async () => {
      const error = new Error('Network error');
      mockOperation
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const promise = retryService.executeWithRetry(mockOperation, {
        baseDelay: 100,
        backoffMultiplier: 2
      });

      const startTime = Date.now();
      vi.runAllTimers();
      const result = await promise;
      const expectedTime = 100 + 200; // First retry + second retry delays

      expect(result.totalTime).toBeGreaterThanOrEqual(expectedTime);
      expect(result.attempts).toBe(3);
    });
  });

  describe('Predefined Configurations', () => {
    it('provides save operation configuration', () => {
      expect(RetryConfigs.save).toEqual({
        maxAttempts: 5,
        baseDelay: 500,
        maxDelay: 5000,
        backoffMultiplier: 1.5
      });
    });

    it('provides publish operation configuration', () => {
      expect(RetryConfigs.publish).toEqual({
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 10000,
        backoffMultiplier: 2
      });
    });

    it('provides load operation configuration', () => {
      expect(RetryConfigs.load).toEqual({
        maxAttempts: 3,
        baseDelay: 300,
        maxDelay: 3000,
        backoffMultiplier: 2
      });
    });

    it('provides upload operation configuration', () => {
      expect(RetryConfigs.upload).toEqual({
        maxAttempts: 4,
        baseDelay: 1000,
        maxDelay: 15000,
        backoffMultiplier: 2.5
      });
    });

    it('provides validation operation configuration', () => {
      expect(RetryConfigs.validation).toEqual({
        maxAttempts: 2,
        baseDelay: 200,
        maxDelay: 1000,
        backoffMultiplier: 2
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles synchronous errors', async () => {
      const syncError = new Error('Sync error');
      mockOperation.mockImplementation(() => {
        throw syncError;
      });

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBe(syncError);
      expect(result.attempts).toBe(2);
    });

    it('handles zero max attempts gracefully', async () => {
      mockOperation.mockResolvedValue('success');

      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 0
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(0);
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('handles negative delays gracefully', async () => {
      mockOperation.mockResolvedValue('success');

      const promise = retryService.executeWithRetry(mockOperation, {
        baseDelay: -100
      });
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });
  });
});