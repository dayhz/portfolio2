"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitoringService = void 0;
class PerformanceMonitoringService {
    constructor() {
        this.metrics = [];
        this.alerts = [];
        this.maxMetrics = 10000; // Keep last 10k metrics
        this.maxAlerts = 1000; // Keep last 1k alerts
        // Thresholds
        this.slowResponseThreshold = 2000; // 2 seconds
        this.largePayloadThreshold = 1024 * 1024; // 1MB
        this.errorRateThreshold = 0.1; // 10%
    }
    // Middleware to track API performance
    trackPerformance() {
        return (req, res, next) => {
            const startTime = Date.now();
            const originalSend = res.send;
            let payloadSize = 0;
            // Override res.send to capture payload size
            res.send = function (data) {
                if (data) {
                    payloadSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
                }
                return originalSend.call(this, data);
            };
            // Track when response finishes
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                const metric = {
                    endpoint: req.path,
                    method: req.method,
                    responseTime,
                    statusCode: res.statusCode,
                    payloadSize,
                    timestamp: new Date(),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                };
                this.addMetric(metric);
                this.checkAlerts(metric);
            });
            next();
        };
    }
    addMetric(metric) {
        this.metrics.push(metric);
        // Keep only the last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }
    checkAlerts(metric) {
        // Check for slow response
        if (metric.responseTime > this.slowResponseThreshold) {
            this.addAlert({
                type: 'slow_response',
                message: `Slow response detected on ${metric.method} ${metric.endpoint}`,
                threshold: this.slowResponseThreshold,
                actualValue: metric.responseTime,
                timestamp: new Date()
            });
        }
        // Check for large payload
        if (metric.payloadSize > this.largePayloadThreshold) {
            this.addAlert({
                type: 'large_payload',
                message: `Large payload detected on ${metric.method} ${metric.endpoint}`,
                threshold: this.largePayloadThreshold,
                actualValue: metric.payloadSize,
                timestamp: new Date()
            });
        }
        // Check error rate (last 100 requests)
        const recentMetrics = this.metrics.slice(-100);
        const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = errorCount / recentMetrics.length;
        if (errorRate > this.errorRateThreshold && recentMetrics.length >= 10) {
            this.addAlert({
                type: 'high_error_rate',
                message: `High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
                threshold: this.errorRateThreshold,
                actualValue: errorRate,
                timestamp: new Date()
            });
        }
    }
    addAlert(alert) {
        // Avoid duplicate alerts within 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentSimilarAlert = this.alerts.find(a => a.type === alert.type &&
            a.timestamp > fiveMinutesAgo);
        if (!recentSimilarAlert) {
            this.alerts.push(alert);
            console.warn(`Performance Alert: ${alert.message} (${alert.actualValue} > ${alert.threshold})`);
            // Keep only the last N alerts
            if (this.alerts.length > this.maxAlerts) {
                this.alerts = this.alerts.slice(-this.maxAlerts);
            }
        }
    }
    // Get performance statistics
    getStats(timeRange) {
        let filteredMetrics = this.metrics;
        if (timeRange) {
            filteredMetrics = this.metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
        }
        if (filteredMetrics.length === 0) {
            return {
                totalRequests: 0,
                averageResponseTime: 0,
                medianResponseTime: 0,
                p95ResponseTime: 0,
                p99ResponseTime: 0,
                averagePayloadSize: 0,
                errorRate: 0,
                slowestEndpoints: [],
                largestPayloads: []
            };
        }
        const responseTimes = filteredMetrics.map(m => m.responseTime).sort((a, b) => a - b);
        const payloadSizes = filteredMetrics.map(m => m.payloadSize);
        const errorCount = filteredMetrics.filter(m => m.statusCode >= 400).length;
        // Calculate percentiles
        const p95Index = Math.floor(responseTimes.length * 0.95);
        const p99Index = Math.floor(responseTimes.length * 0.99);
        const medianIndex = Math.floor(responseTimes.length * 0.5);
        // Get slowest endpoints
        const endpointStats = new Map();
        filteredMetrics.forEach(m => {
            const key = `${m.method} ${m.endpoint}`;
            const existing = endpointStats.get(key) || { count: 0, totalTime: 0, maxTime: 0 };
            endpointStats.set(key, {
                count: existing.count + 1,
                totalTime: existing.totalTime + m.responseTime,
                maxTime: Math.max(existing.maxTime, m.responseTime)
            });
        });
        const slowestEndpoints = Array.from(endpointStats.entries())
            .map(([endpoint, stats]) => ({
            endpoint,
            averageTime: stats.totalTime / stats.count,
            maxTime: stats.maxTime,
            requestCount: stats.count
        }))
            .sort((a, b) => b.averageTime - a.averageTime)
            .slice(0, 10);
        // Get largest payloads
        const largestPayloads = filteredMetrics
            .sort((a, b) => b.payloadSize - a.payloadSize)
            .slice(0, 10)
            .map(m => ({
            endpoint: `${m.method} ${m.endpoint}`,
            payloadSize: m.payloadSize,
            timestamp: m.timestamp
        }));
        return {
            totalRequests: filteredMetrics.length,
            averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            medianResponseTime: responseTimes[medianIndex] || 0,
            p95ResponseTime: responseTimes[p95Index] || 0,
            p99ResponseTime: responseTimes[p99Index] || 0,
            averagePayloadSize: payloadSizes.reduce((a, b) => a + b, 0) / payloadSizes.length,
            errorRate: errorCount / filteredMetrics.length,
            slowestEndpoints,
            largestPayloads
        };
    }
    // Get recent alerts
    getAlerts(limit = 50) {
        return this.alerts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    // Get metrics for a specific endpoint
    getEndpointMetrics(endpoint, method) {
        return this.metrics.filter(m => {
            const matchesEndpoint = m.endpoint === endpoint;
            const matchesMethod = !method || m.method === method;
            return matchesEndpoint && matchesMethod;
        });
    }
    // Clear old data
    cleanup(olderThan) {
        this.metrics = this.metrics.filter(m => m.timestamp > olderThan);
        this.alerts = this.alerts.filter(a => a.timestamp > olderThan);
    }
    // Get real-time performance data
    getRealTimeStats() {
        const lastMinute = new Date(Date.now() - 60 * 1000);
        const recentMetrics = this.metrics.filter(m => m.timestamp > lastMinute);
        return {
            requestsPerMinute: recentMetrics.length,
            averageResponseTime: recentMetrics.length > 0
                ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
                : 0,
            errorRate: recentMetrics.length > 0
                ? recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length
                : 0,
            activeEndpoints: new Set(recentMetrics.map(m => `${m.method} ${m.endpoint}`)).size
        };
    }
}
exports.performanceMonitoringService = new PerformanceMonitoringService();
//# sourceMappingURL=performanceMonitoringService.js.map