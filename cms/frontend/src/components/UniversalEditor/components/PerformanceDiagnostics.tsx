/**
 * Composant de diagnostic pour surveiller et afficher les statistiques de performance
 */

import React, { useState, useEffect } from 'react';
import {
  performanceMonitor,
  cacheService,
  memoryManager,
  lazyLoadService,
  getOptimizationStats
} from '../services';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';

interface PerformanceDiagnosticsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PerformanceDiagnostics({
  isOpen = false,
  onClose
}: PerformanceDiagnosticsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(isOpen);
  const [updateInterval, setUpdateInterval] = useState<number>(2000);
  const { safeSetInterval, cleanupAll } = useMemoryCleanup();

  // Mettre à jour les statistiques périodiquement
  useEffect(() => {
    if (!isVisible) return;

    // Récupérer les statistiques initiales
    setStats(getOptimizationStats());

    // Mettre à jour périodiquement
    const intervalId = safeSetInterval(() => {
      setStats(getOptimizationStats());
    }, updateInterval);

    return () => {
      cleanupAll();
    };
  }, [isVisible, updateInterval, safeSetInterval, cleanupAll]);

  // Synchroniser l'état visible avec la prop isOpen
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Gérer la fermeture
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Forcer un nettoyage complet
  const handleForceCleanup = () => {
    memoryManager.fullCleanup();
    setStats(getOptimizationStats());
  };

  if (!isVisible || !stats) {
    return null;
  }

  // Formater la taille en Ko ou Mo
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  // Formater le temps en ms
  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  return (
    <div className="performance-diagnostics">
      <div className="diagnostics-header">
        <h3>Diagnostics de Performance</h3>
        <div className="diagnostics-controls">
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
          >
            <option value="1000">Mise à jour: 1s</option>
            <option value="2000">Mise à jour: 2s</option>
            <option value="5000">Mise à jour: 5s</option>
            <option value="10000">Mise à jour: 10s</option>
          </select>
          <button onClick={handleForceCleanup}>Forcer le nettoyage</button>
          <button onClick={handleClose}>Fermer</button>
        </div>
      </div>

      <div className="diagnostics-content">
        {/* Section Mémoire */}
        <div className="diagnostics-section">
          <h4>Mémoire</h4>
          <div className="diagnostics-grid">
            <div className="diagnostics-item">
              <span className="item-label">URLs d'objets:</span>
              <span className="item-value">{stats.memory.objectUrlCount}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Groupes d'écouteurs:</span>
              <span className="item-value">{stats.memory.eventListenerGroups}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Total écouteurs:</span>
              <span className="item-value">{stats.memory.totalEventListeners}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">État:</span>
              <span className={`item-value ${stats.memory.isIdle ? 'warning' : 'good'}`}>
                {stats.memory.isIdle ? 'Inactif' : 'Actif'}
              </span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Temps d'inactivité:</span>
              <span className="item-value">{formatTime(stats.memory.idleTime)}</span>
            </div>
          </div>
        </div>

        {/* Section Cache */}
        <div className="diagnostics-section">
          <h4>Cache</h4>
          <div className="diagnostics-grid">
            <div className="diagnostics-item">
              <span className="item-label">Entrées:</span>
              <span className="item-value">{stats.cache.entryCount}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Taille totale:</span>
              <span className="item-value">{formatSize(stats.cache.totalSize)}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Taille maximale:</span>
              <span className="item-value">{formatSize(stats.cache.maxSize)}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Utilisation:</span>
              <span className={`item-value ${stats.cache.usagePercentage > 80 ? 'warning' : 'good'}`}>
                {stats.cache.usagePercentage.toFixed(2)}%
              </span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Images:</span>
              <span className="item-value">{stats.cache.entriesByType.image}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Composants:</span>
              <span className="item-value">{stats.cache.entriesByType.component}</span>
            </div>
          </div>
        </div>

        {/* Section Performance */}
        <div className="diagnostics-section">
          <h4>Performance</h4>
          <div className="diagnostics-grid">
            <div className="diagnostics-item">
              <span className="item-label">Temps de rendu moyen:</span>
              <span className={`item-value ${stats.performance.averageRenderTime > 16 ? 'warning' : 'good'}`}>
                {formatTime(stats.performance.averageRenderTime)}
              </span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Temps d'entrée moyen:</span>
              <span className={`item-value ${stats.performance.averageInputTime > 50 ? 'warning' : 'good'}`}>
                {formatTime(stats.performance.averageInputTime)}
              </span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Temps de chargement moyen:</span>
              <span className={`item-value ${stats.performance.averageLoadTime > 1000 ? 'warning' : 'good'}`}>
                {formatTime(stats.performance.averageLoadTime)}
              </span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Utilisation mémoire:</span>
              <span className="item-value">{formatSize(stats.performance.memoryUsage)}</span>
            </div>
          </div>

          {/* Composants lents */}
          {stats.performance.slowComponents.length > 0 && (
            <div className="slow-components">
              <h5>Composants lents</h5>
              <ul>
                {stats.performance.slowComponents.slice(0, 5).map((item: any, index: number) => (
                  <li key={index}>
                    <span className="component-name">{item.component}</span>
                    <span className="component-count">{item.count} occurrences</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section Lazy Loading */}
        <div className="diagnostics-section">
          <h4>Lazy Loading</h4>
          <div className="diagnostics-grid">
            <div className="diagnostics-item">
              <span className="item-label">Composants enregistrés:</span>
              <span className="item-value">{stats.lazyLoading.registeredComponents}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">Composants en chargement:</span>
              <span className="item-value">{stats.lazyLoading.loadingComponents}</span>
            </div>
            <div className="diagnostics-item">
              <span className="item-label">File d'attente:</span>
              <span className="item-value">{stats.lazyLoading.queuedPreloads}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .performance-diagnostics {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          max-height: 80vh;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          overflow-y: auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }

        .diagnostics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f1f3f5;
          border-bottom: 1px solid #dee2e6;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .diagnostics-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #343a40;
        }

        .diagnostics-controls {
          display: flex;
          gap: 8px;
        }

        .diagnostics-controls button {
          padding: 4px 8px;
          font-size: 12px;
          background-color: #e9ecef;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }

        .diagnostics-controls button:hover {
          background-color: #dee2e6;
        }

        .diagnostics-controls select {
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .diagnostics-content {
          padding: 16px;
        }

        .diagnostics-section {
          margin-bottom: 16px;
          padding: 12px;
          background-color: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 6px;
        }

        .diagnostics-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .diagnostics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .diagnostics-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .item-label {
          font-size: 12px;
          color: #6c757d;
        }

        .item-value {
          font-size: 12px;
          font-weight: 500;
          color: #212529;
        }

        .item-value.warning {
          color: #fd7e14;
        }

        .item-value.good {
          color: #20c997;
        }

        .slow-components {
          margin-top: 12px;
        }

        .slow-components h5 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 500;
          color: #495057;
        }

        .slow-components ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .slow-components li {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .component-name {
          font-size: 12px;
          color: #495057;
        }

        .component-count {
          font-size: 12px;
          color: #fd7e14;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}