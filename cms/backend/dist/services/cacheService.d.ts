declare class CacheService {
    private client;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    invalidatePattern(pattern: string): Promise<boolean>;
    warmCache(): Promise<void>;
    isHealthy(): boolean;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cacheService.d.ts.map