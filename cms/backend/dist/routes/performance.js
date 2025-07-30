"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceRouter = void 0;
const express_1 = require("express");
const performanceMonitoringService_1 = require("../services/performanceMonitoringService");
const cacheService_1 = require("../services/cacheService");
const router = (0, express_1.Router)();
exports.performanceRouter = router;
// Get performance statistics
router.get('/stats', (req, res) => {
    try {
        const { start, end } = req.query;
        let timeRange;
        if (start && end) {
            timeRange = {
                start: new Date(start),
                end: new Date(end)
            };
        }
        const stats = performanceMonitoringService_1.performanceMonitoringService.getStats(timeRange);
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting performance stats:', error);
        res.status(500).json({ error: 'Failed to get performance statistics' });
    }
});
// Get recent alerts
router.get('/alerts', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const alerts = performanceMonitoringService_1.performanceMonitoringService.getAlerts(limit);
        res.json(alerts);
    }
    catch (error) {
        console.error('Error getting performance alerts:', error);
        res.status(500).json({ error: 'Failed to get performance alerts' });
    }
});
// Get real-time performance data
router.get('/realtime', (req, res) => {
    try {
        const realTimeStats = performanceMonitoringService_1.performanceMonitoringService.getRealTimeStats();
        res.json(realTimeStats);
    }
    catch (error) {
        console.error('Error getting real-time stats:', error);
        res.status(500).json({ error: 'Failed to get real-time statistics' });
    }
});
// Get metrics for a specific endpoint
router.get('/endpoint/:endpoint', (req, res) => {
    try {
        const { endpoint } = req.params;
        const { method } = req.query;
        const metrics = performanceMonitoringService_1.performanceMonitoringService.getEndpointMetrics(decodeURIComponent(endpoint), method);
        res.json(metrics);
    }
    catch (error) {
        console.error('Error getting endpoint metrics:', error);
        res.status(500).json({ error: 'Failed to get endpoint metrics' });
    }
});
// Get system health including cache status
router.get('/health', (req, res) => {
    try {
        const realTimeStats = performanceMonitoringService_1.performanceMonitoringService.getRealTimeStats();
        const cacheHealth = cacheService_1.cacheService.isHealthy();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            performance: realTimeStats,
            cache: {
                connected: cacheHealth,
                status: cacheHealth ? 'healthy' : 'disconnected'
            },
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
                external: process.memoryUsage().external,
                rss: process.memoryUsage().rss
            },
            uptime: process.uptime()
        };
        // Determine overall health status
        if (!cacheHealth || realTimeStats.errorRate > 0.1) {
            health.status = 'degraded';
        }
        if (realTimeStats.errorRate > 0.5) {
            health.status = 'unhealthy';
        }
        res.json(health);
    }
    catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: 'Failed to get system health',
            timestamp: new Date().toISOString()
        });
    }
});
// Clear old performance data
router.delete('/cleanup', (req, res) => {
    try {
        const { olderThan } = req.query;
        const cutoffDate = olderThan ? new Date(olderThan) : new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        performanceMonitoringService_1.performanceMonitoringService.cleanup(cutoffDate);
        res.json({
            message: 'Performance data cleaned up successfully',
            cutoffDate: cutoffDate.toISOString()
        });
    }
    catch (error) {
        console.error('Error cleaning up performance data:', error);
        res.status(500).json({ error: 'Failed to cleanup performance data' });
    }
});
//# sourceMappingURL=performance.js.map