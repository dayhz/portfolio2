import { Request, Response, NextFunction } from 'express';
interface PerformanceMetric {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    payloadSize: number;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
}
interface PerformanceAlert {
    type: 'slow_response' | 'large_payload' | 'high_error_rate';
    message: string;
    threshold: number;
    actualValue: number;
    timestamp: Date;
}
declare class PerformanceMonitoringService {
    private metrics;
    private alerts;
    private readonly maxMetrics;
    private readonly maxAlerts;
    private readonly slowResponseThreshold;
    private readonly largePayloadThreshold;
    private readonly errorRateThreshold;
    trackPerformance(): (req: Request, res: Response, next: NextFunction) => void;
    private addMetric;
    private checkAlerts;
    private addAlert;
    getStats(timeRange?: {
        start: Date;
        end: Date;
    }): {
        totalRequests: number;
        averageResponseTime: number;
        medianResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        averagePayloadSize: number;
        errorRate: number;
        slowestEndpoints: {
            endpoint: string;
            averageTime: number;
            maxTime: number;
            requestCount: number;
        }[];
        largestPayloads: {
            endpoint: string;
            payloadSize: number;
            timestamp: Date;
        }[];
    };
    getAlerts(limit?: number): PerformanceAlert[];
    getEndpointMetrics(endpoint: string, method?: string): PerformanceMetric[];
    cleanup(olderThan: Date): void;
    getRealTimeStats(): {
        requestsPerMinute: number;
        averageResponseTime: number;
        errorRate: number;
        activeEndpoints: number;
    };
}
export declare const performanceMonitoringService: PerformanceMonitoringService;
export {};
//# sourceMappingURL=performanceMonitoringService.d.ts.map