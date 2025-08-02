/**
 * Service de retry pour les opérations qui peuvent échouer temporairement
 */

export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxAttemptsReached?: (error: any) => void;
}

export const RetryConfigs = {
  DEFAULT: {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffMultiplier: 2
  },
  NETWORK: {
    maxAttempts: 5,
    baseDelay: 500,
    backoffMultiplier: 1.5,
    retryCondition: (error: any) => {
      return error.code === 'NETWORK_ERROR' || 
             error.code === 'TIMEOUT' ||
             (error.response && error.response.status >= 500);
    }
  },
  API: {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffMultiplier: 2,
    retryCondition: (error: any) => {
      return error.response && error.response.status >= 500;
    }
  }
};

export class RetryService {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxAttempts = RetryConfigs.DEFAULT.maxAttempts,
      baseDelay = RetryConfigs.DEFAULT.baseDelay,
      backoffMultiplier = RetryConfigs.DEFAULT.backoffMultiplier,
      retryCondition = () => true,
      onRetry,
      onMaxAttemptsReached
    } = config;

    if (maxAttempts <= 0) {
      throw new Error('maxAttempts must be greater than 0');
    }

    if (baseDelay < 0) {
      throw new Error('baseDelay must be non-negative');
    }

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          if (onMaxAttemptsReached) {
            onMaxAttemptsReached(error);
          }
          throw error;
        }

        if (!retryCondition(error)) {
          throw error;
        }

        if (onRetry) {
          onRetry(attempt, error);
        }

        const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    config: RetryConfig = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.executeWithRetry(() => fn(...args), config);
    }) as T;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryService = new RetryService();