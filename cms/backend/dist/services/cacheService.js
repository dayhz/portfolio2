"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_1 = require("redis");
class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    async connect() {
        try {
            this.client = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    connectTimeout: 5000,
                    lazyConnect: true
                }
            });
            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                console.log('Redis Client Connected');
                this.isConnected = true;
            });
            this.client.on('disconnect', () => {
                console.log('Redis Client Disconnected');
                this.isConnected = false;
            });
            await this.client.connect();
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            // Continue without Redis if connection fails
            this.client = null;
            this.isConnected = false;
        }
    }
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    async get(key) {
        if (!this.client || !this.isConnected) {
            return null;
        }
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds = 3600) {
        if (!this.client || !this.isConnected) {
            return false;
        }
        try {
            await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    async del(key) {
        if (!this.client || !this.isConnected) {
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }
    async invalidatePattern(pattern) {
        if (!this.client || !this.isConnected) {
            return false;
        }
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return true;
        }
        catch (error) {
            console.error('Cache pattern invalidation error:', error);
            return false;
        }
    }
    async warmCache() {
        if (!this.client || !this.isConnected) {
            return;
        }
        try {
            // Import homepageService to warm cache with current data
            const { homepageService } = await Promise.resolve().then(() => __importStar(require('./homepageService')));
            console.log('Warming cache with homepage content...');
            // Warm cache for all sections
            const sections = ['hero', 'brands', 'services', 'offer', 'testimonials', 'footer'];
            for (const section of sections) {
                try {
                    const content = await homepageService.getSection(section);
                    await this.set(`homepage:${section}`, content, 1800); // 30 minutes TTL
                }
                catch (error) {
                    console.error(`Failed to warm cache for section ${section}:`, error);
                }
            }
            // Warm cache for complete homepage data
            try {
                const allContent = await homepageService.getAllContent();
                await this.set('homepage:all', allContent, 1800);
            }
            catch (error) {
                console.error('Failed to warm cache for complete homepage:', error);
            }
            console.log('Cache warming completed');
        }
        catch (error) {
            console.error('Cache warming failed:', error);
        }
    }
    isHealthy() {
        return this.isConnected;
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map