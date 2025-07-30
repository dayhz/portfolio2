import React, { useState, useEffect } from 'react';

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  averagePayloadSize: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    averageTime: number;
    maxTime: number;
    requestCount: number;
  }>;
  largestPayloads: Array<{
    endpoint: string;
    payloadSize: number;
    timestamp: string;
  }>;
}

interface PerformanceAlert {
  type: 'slow_response' | 'large_payload' | 'high_error_rate';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
}

interface RealTimeStats {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  activeEndpoints: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  performance: RealTimeStats;
  cache: {
    connected: boolean;
    status: string;
  };
  memory: {
    used: number;
    total: number;
    external: number;
    rss: number;
  };
  uptime: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      const [statsRes, alertsRes, realTimeRes, healthRes] = await Promise.all([
        fetch('/api/performance/stats'),
        fetch('/api/performance/alerts?limit=10'),
        fetch('/api/performance/realtime'),
        fetch('/api/performance/health')
      ]);

      if (!statsRes.ok || !alertsRes.ok || !realTimeRes.ok || !healthRes.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const [statsData, alertsData, realTimeData, healthData] = await Promise.all([
        statsRes.json(),
        alertsRes.json(),
        realTimeRes.json(),
        healthRes.json()
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      setRealTimeStats(realTimeData);
      setSystemHealth(healthData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading performance data: {error}</div>
        <button 
          onClick={fetchPerformanceData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <button 
          onClick={fetchPerformanceData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
                {systemHealth.status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Overall Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth.cache.connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-600">Cache Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatBytes(systemHealth.memory.used)}
              </div>
              <div className="text-sm text-gray-600">Memory Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatUptime(systemHealth.uptime)}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Stats */}
      {realTimeStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Real-time Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeStats.requestsPerMinute}
              </div>
              <div className="text-sm text-gray-600">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realTimeStats.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {(realTimeStats.errorRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeStats.activeEndpoints}
              </div>
              <div className="text-sm text-gray-600">Active Endpoints</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.averageResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.p95ResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">95th Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.p99ResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">99th Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatBytes(stats.averagePayloadSize)}</div>
              <div className="text-sm text-gray-600">Average Payload Size</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{(stats.errorRate * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>

          {/* Slowest Endpoints */}
          {stats.slowestEndpoints.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Slowest Endpoints</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Endpoint</th>
                      <th className="px-4 py-2 text-left">Avg Time</th>
                      <th className="px-4 py-2 text-left">Max Time</th>
                      <th className="px-4 py-2 text-left">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.slowestEndpoints.slice(0, 5).map((endpoint, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 font-mono text-sm">{endpoint.endpoint}</td>
                        <td className="px-4 py-2">{endpoint.averageTime.toFixed(0)}ms</td>
                        <td className="px-4 py-2">{endpoint.maxTime.toFixed(0)}ms</td>
                        <td className="px-4 py-2">{endpoint.requestCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Performance Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <div>
                  <div className="font-medium text-red-800">{alert.message}</div>
                  <div className="text-sm text-red-600">
                    {alert.actualValue} exceeds threshold of {alert.threshold}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};