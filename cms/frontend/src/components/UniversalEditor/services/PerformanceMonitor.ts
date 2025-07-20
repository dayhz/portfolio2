/**
 * Service de monitoring des performances pour l'éditeur universel
 */

// Configuration du monitoring
const PERFORMANCE_CONFIG = {
  // Seuil de performance en ms
  RENDER_THRESHOLD: 16, // 60 FPS = ~16ms par frame
  INPUT_THRESHOLD: 50,
  LOAD_THRESHOLD: 1000,
  // Intervalle de collecte des métriques en ms
  COLLECTION_INTERVAL: 5000,
  // Nombre maximum d'entrées à conserver
  MAX_ENTRIES: 100,
  // Activer/désactiver le monitoring
  ENABLED: true
};

// Types de métriques de performance
export enum MetricType {
  RENDER = 'render',
  INPUT = 'input',
  LOAD = 'load',
  MEMORY = 'memory',
  NETWORK = 'network'
}

// Interface pour les métriques
export interface PerformanceMetric {
  type: MetricType;
  value: number;
  timestamp: number;
  component?: string;
  details?: Record<string, any>;
}

/**
 * Service de monitoring des performances
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private collectionTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean = PERFORMANCE_CONFIG.ENABLED;
  private markTimers: Map<string, number> = new Map();
  private slowComponents: Map<string, number> = new Map();

  private constructor() {
    if (PERFORMANCE_CONFIG.ENABLED) {
      this.startCollection();
    }
  }

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Activer ou désactiver le monitoring
   * @param enabled État d'activation
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled && !this.collectionTimer) {
      this.startCollection();
    } else if (!enabled && this.collectionTimer) {
      this.stopCollection();
    }
  }

  /**
   * Marquer le début d'une opération
   * @param id Identifiant unique de l'opération
   * @param type Type de métrique
   * @param component Composant concerné
   */
  public mark(id: string, type: MetricType, component?: string): void {
    if (!this.isEnabled) return;
    
    this.markTimers.set(id, performance.now());
  }

  /**
   * Mesurer la durée d'une opération
   * @param id Identifiant unique de l'opération
   * @param type Type de métrique
   * @param component Composant concerné
   * @param details Détails supplémentaires
   */
  public measure(
    id: string,
    type: MetricType,
    component?: string,
    details?: Record<string, any>
  ): number | null {
    if (!this.isEnabled) return null;
    
    const startTime = this.markTimers.get(id);
    if (!startTime) {
      console.warn(`Aucun marqueur trouvé pour l'ID: ${id}`);
      return null;
    }
    
    const duration = performance.now() - startTime;
    this.markTimers.delete(id);
    
    // Ajouter la métrique
    this.addMetric({
      type,
      value: duration,
      timestamp: Date.now(),
      component,
      details
    });
    
    // Vérifier si l'opération est lente
    this.checkPerformance(type, duration, component);
    
    return duration;
  }

  /**
   * Ajouter une métrique directement
   * @param metric Métrique à ajouter
   */
  public addMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;
    
    this.metrics.push(metric);
    
    // Limiter le nombre de métriques
    if (this.metrics.length > PERFORMANCE_CONFIG.MAX_ENTRIES) {
      this.metrics.shift();
    }
  }

  /**
   * Obtenir toutes les métriques
   * @returns Tableau de métriques
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Obtenir les métriques d'un type spécifique
   * @param type Type de métrique
   * @returns Tableau de métriques filtrées
   */
  public getMetricsByType(type: MetricType): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  /**
   * Obtenir les métriques d'un composant spécifique
   * @param component Nom du composant
   * @returns Tableau de métriques filtrées
   */
  public getMetricsByComponent(component: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.component === component);
  }

  /**
   * Obtenir les composants lents
   * @returns Map des composants lents avec leur nombre d'occurrences
   */
  public getSlowComponents(): Map<string, number> {
    return new Map(this.slowComponents);
  }

  /**
   * Vider les métriques
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Démarrer la collecte automatique des métriques
   */
  private startCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }
    
    this.collectionTimer = setInterval(
      () => this.collectSystemMetrics(),
      PERFORMANCE_CONFIG.COLLECTION_INTERVAL
    );
  }

  /**
   * Arrêter la collecte automatique des métriques
   */
  private stopCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
  }

  /**
   * Collecter les métriques système
   */
  private collectSystemMetrics(): void {
    // Métriques de mémoire
    if (performance && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.addMetric({
          type: MetricType.MEMORY,
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          details: {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usedJSHeapSize: memory.usedJSHeapSize
          }
        });
      }
    }
    
    // Métriques réseau
    if (window.navigator && 'connection' in window.navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.addMetric({
          type: MetricType.NETWORK,
          value: connection.downlink || 0,
          timestamp: Date.now(),
          details: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          }
        });
      }
    }
  }

  /**
   * Vérifier si une opération est lente
   * @param type Type de métrique
   * @param duration Durée de l'opération
   * @param component Composant concerné
   */
  private checkPerformance(
    type: MetricType,
    duration: number,
    component?: string
  ): void {
    let threshold = 0;
    
    switch (type) {
      case MetricType.RENDER:
        threshold = PERFORMANCE_CONFIG.RENDER_THRESHOLD;
        break;
      case MetricType.INPUT:
        threshold = PERFORMANCE_CONFIG.INPUT_THRESHOLD;
        break;
      case MetricType.LOAD:
        threshold = PERFORMANCE_CONFIG.LOAD_THRESHOLD;
        break;
      default:
        return;
    }
    
    if (duration > threshold && component) {
      // Incrémenter le compteur de composants lents
      const count = this.slowComponents.get(component) || 0;
      this.slowComponents.set(component, count + 1);
      
      // Loguer les performances lentes
      console.warn(
        `Performance lente détectée: ${component} (${type}) - ${duration.toFixed(2)}ms (seuil: ${threshold}ms)`
      );
    }
  }

  /**
   * Obtenir un résumé des performances
   */
  public getPerformanceSummary(): {
    averageRenderTime: number;
    averageInputTime: number;
    averageLoadTime: number;
    memoryUsage: number;
    slowComponents: Array<{ component: string; count: number }>;
  } {
    const renderMetrics = this.getMetricsByType(MetricType.RENDER);
    const inputMetrics = this.getMetricsByType(MetricType.INPUT);
    const loadMetrics = this.getMetricsByType(MetricType.LOAD);
    const memoryMetrics = this.getMetricsByType(MetricType.MEMORY);
    
    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, metric) => sum + metric.value, 0) / renderMetrics.length
      : 0;
    
    const averageInputTime = inputMetrics.length > 0
      ? inputMetrics.reduce((sum, metric) => sum + metric.value, 0) / inputMetrics.length
      : 0;
    
    const averageLoadTime = loadMetrics.length > 0
      ? loadMetrics.reduce((sum, metric) => sum + metric.value, 0) / loadMetrics.length
      : 0;
    
    const memoryUsage = memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1].value
      : 0;
    
    const slowComponents = Array.from(this.slowComponents.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      averageRenderTime,
      averageInputTime,
      averageLoadTime,
      memoryUsage,
      slowComponents
    };
  }
}

// Export de l'instance singleton
export const performanceMonitor = PerformanceMonitor.getInstance();