import { createClient, RedisClientType } from 'redis';

// Simple in-memory cache as fallback
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number): boolean {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expires });
    return true;
  }

  del(key: string): boolean {
    return this.cache.delete(key);
  }

  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  clear(): void {
    this.cache.clear();
  }
}

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private memoryCache = new MemoryCache();

  async connect(): Promise<void> {
    // Skip Redis connection if REDIS_URL is not set or if we're in development without Redis
    if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Redis not configured, running without cache');
      this.client = null;
      this.isConnected = false;
      return;
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            // Stop trying to reconnect after 3 attempts
            if (retries > 3) {
              console.log('⚠️ Redis connection failed after 3 attempts, disabling cache');
              return false;
            }
            return Math.min(retries * 50, 500);
          }
        }
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Redis Client Error (cache disabled):', err.message);
        this.isConnected = false;
        this.client = null;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('⚠️ Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.warn('⚠️ Failed to connect to Redis, continuing without cache:', (error as Error).message);
      // Continue without Redis if connection fails
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Cache get error:', error);
        // Fall back to memory cache
      }
    }

    // Use memory cache as fallback
    return this.memoryCache.get<T>(key);
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Cache set error:', error);
        // Fall back to memory cache
      }
    }

    // Use memory cache as fallback
    return this.memoryCache.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<boolean> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
        return true;
      } catch (error) {
        console.error('Cache delete error:', error);
        // Fall back to memory cache
      }
    }

    // Use memory cache as fallback
    return this.memoryCache.del(key);
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
        return true;
      } catch (error) {
        console.error('Cache pattern invalidation error:', error);
        // Fall back to memory cache
      }
    }

    // Use memory cache as fallback
    const keys = this.memoryCache.keys(pattern);
    keys.forEach(key => this.memoryCache.del(key));
    return true;
  }

  async warmCache(): Promise<void> {
    try {
      // Import homepageService to warm cache with current data
      const { homepageService } = await import('./homepageService');
      
      console.log('🔥 Warming cache with homepage content...');
      
      // Warm cache for all sections
      const sections = ['hero', 'brands', 'services', 'offer', 'testimonials', 'footer'];
      
      for (const section of sections) {
        try {
          const content = await homepageService.getSection(section as any);
          await this.set(`homepage:${section}`, content, 1800); // 30 minutes TTL
        } catch (error) {
          console.error(`Failed to warm cache for section ${section}:`, error);
        }
      }

      // Warm cache for complete homepage data
      try {
        const allContent = await homepageService.getAllContent();
        await this.set('homepage:all', allContent, 1800);
      } catch (error) {
        console.error('Failed to warm cache for complete homepage:', error);
      }

      const cacheType = this.isConnected ? 'Redis' : 'memory';
      console.log(`✅ Cache warming completed using ${cacheType} cache`);
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  isHealthy(): boolean {
    return this.isConnected || true; // Always healthy with memory cache fallback
  }

  getCacheType(): string {
    return this.isConnected ? 'redis' : 'memory';
  }
}

export const cacheService = new CacheService();