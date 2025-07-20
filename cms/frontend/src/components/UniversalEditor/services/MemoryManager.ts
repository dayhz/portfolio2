/**
 * Service de gestion de la mémoire pour l'éditeur universel
 * Optimise l'utilisation des ressources et nettoie automatiquement les ressources inutilisées
 */

import { cacheService } from './CacheService';
import { mediaOptimizationService } from './MediaOptimizationService';
import { performanceMonitor, MetricType } from './PerformanceMonitor';

// Configuration de la gestion mémoire
const MEMORY_CONFIG = {
  // Seuil d'utilisation mémoire en Mo pour déclencher le nettoyage
  MEMORY_THRESHOLD_MB: 150,
  // Intervalle de vérification en millisecondes
  CHECK_INTERVAL: 30000, // 30 secondes
  // Durée maximale d'inactivité avant nettoyage en millisecondes
  MAX_IDLE_TIME: 5 * 60 * 1000, // 5 minutes
  // Nombre maximum d'objets URL à conserver
  MAX_OBJECT_URLS: 50,
  // Activer/désactiver le nettoyage automatique
  AUTO_CLEANUP_ENABLED: true
};

/**
 * Service de gestion de la mémoire
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private checkTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private objectUrls: Map<string, { url: string, timestamp: number }> = new Map();
  private eventListeners: Map<string, { target: EventTarget, type: string, listener: EventListener }[]> = new Map();
  private isEnabled: boolean = MEMORY_CONFIG.AUTO_CLEANUP_ENABLED;
  private isIdle: boolean = false;

  private constructor() {
    if (MEMORY_CONFIG.AUTO_CLEANUP_ENABLED) {
      this.startMemoryCheck();
    }
    
    // Écouter les événements d'activité utilisateur
    this.setupActivityListeners();
  }

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Activer ou désactiver la gestion mémoire
   * @param enabled État d'activation
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled && !this.checkTimer) {
      this.startMemoryCheck();
    } else if (!enabled && this.checkTimer) {
      this.stopMemoryCheck();
    }
  }

  /**
   * Enregistrer une URL d'objet pour nettoyage ultérieur
   * @param url URL d'objet à nettoyer
   * @param lifespan Durée de vie en millisecondes (0 = indéfini)
   */
  public registerObjectUrl(url: string, lifespan: number = 0): void {
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      return;
    }
    
    this.objectUrls.set(url, {
      url,
      timestamp: Date.now() + (lifespan > 0 ? lifespan : Number.MAX_SAFE_INTEGER)
    });
    
    // Si trop d'URLs, nettoyer les plus anciennes
    if (this.objectUrls.size > MEMORY_CONFIG.MAX_OBJECT_URLS) {
      this.cleanupOldestObjectUrls(Math.floor(MEMORY_CONFIG.MAX_OBJECT_URLS * 0.2));
    }
  }

  /**
   * Libérer une URL d'objet spécifique
   * @param url URL d'objet à libérer
   */
  public revokeObjectUrl(url: string): void {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }

  /**
   * Enregistrer un écouteur d'événement pour nettoyage ultérieur
   * @param id Identifiant unique pour le groupe d'écouteurs
   * @param target Cible de l'événement
   * @param type Type d'événement
   * @param listener Fonction d'écoute
   */
  public registerEventListener(
    id: string,
    target: EventTarget,
    type: string,
    listener: EventListener
  ): void {
    if (!this.eventListeners.has(id)) {
      this.eventListeners.set(id, []);
    }
    
    this.eventListeners.get(id)!.push({
      target,
      type,
      listener
    });
  }

  /**
   * Supprimer tous les écouteurs d'événements d'un groupe
   * @param id Identifiant du groupe d'écouteurs
   */
  public removeEventListeners(id: string): void {
    const listeners = this.eventListeners.get(id);
    
    if (listeners) {
      listeners.forEach(({ target, type, listener }) => {
        target.removeEventListener(type, listener);
      });
      
      this.eventListeners.delete(id);
    }
  }

  /**
   * Nettoyer les ressources inutilisées
   * @param force Forcer le nettoyage même si le seuil n'est pas atteint
   */
  public cleanup(force: boolean = false): void {
    if (!this.isEnabled && !force) {
      return;
    }
    
    performanceMonitor.mark('memory_cleanup', MetricType.MEMORY);
    
    // Nettoyer les URL d'objets expirées
    this.cleanupExpiredObjectUrls();
    
    // Nettoyer le cache des médias si nécessaire
    mediaOptimizationService.clearMediaCache();
    
    // Forcer la collecte des déchets si disponible
    if (window.gc) {
      try {
        (window as any).gc();
      } catch (e) {
        console.log('Collecte des déchets non disponible');
      }
    }
    
    performanceMonitor.measure('memory_cleanup', MetricType.MEMORY, 'MemoryManager');
  }

  /**
   * Effectuer un nettoyage complet des ressources
   */
  public fullCleanup(): void {
    // Nettoyer toutes les URL d'objets
    this.cleanupAllObjectUrls();
    
    // Supprimer tous les écouteurs d'événements
    this.removeAllEventListeners();
    
    // Nettoyer le cache
    cacheService.clear();
    
    // Forcer la collecte des déchets
    this.cleanup(true);
  }

  /**
   * Démarrer la vérification périodique de la mémoire
   */
  private startMemoryCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
    
    this.checkTimer = setInterval(
      () => this.checkMemoryUsage(),
      MEMORY_CONFIG.CHECK_INTERVAL
    );
  }

  /**
   * Arrêter la vérification périodique de la mémoire
   */
  private stopMemoryCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Vérifier l'utilisation de la mémoire et nettoyer si nécessaire
   */
  private checkMemoryUsage(): void {
    // Vérifier si l'utilisateur est inactif
    const idleTime = Date.now() - this.lastActivityTime;
    const wasIdle = this.isIdle;
    this.isIdle = idleTime > MEMORY_CONFIG.MAX_IDLE_TIME;
    
    // Si l'utilisateur vient de devenir inactif, effectuer un nettoyage
    if (this.isIdle && !wasIdle) {
      console.log('Utilisateur inactif, nettoyage des ressources');
      this.cleanup();
      return;
    }
    
    // Vérifier l'utilisation de la mémoire si disponible
    if (performance && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
        
        if (usedMemoryMB > MEMORY_CONFIG.MEMORY_THRESHOLD_MB) {
          console.log(`Utilisation mémoire élevée (${usedMemoryMB.toFixed(2)} MB), nettoyage des ressources`);
          this.cleanup();
        }
      }
    }
  }

  /**
   * Configurer les écouteurs d'événements d'activité utilisateur
   */
  private setupActivityListeners(): void {
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.isIdle = false;
    };
    
    // Événements d'activité utilisateur
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });
    
    // Événements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      } else {
        // Page cachée, considérer comme inactif
        this.isIdle = true;
        this.cleanup();
      }
    });
    
    // Événements de focus de la fenêtre
    window.addEventListener('focus', updateActivity);
    window.addEventListener('blur', () => {
      // Fenêtre perd le focus, considérer comme inactif
      this.isIdle = true;
    });
  }

  /**
   * Nettoyer les URL d'objets expirées
   */
  private cleanupExpiredObjectUrls(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];
    
    for (const [url, entry] of this.objectUrls.entries()) {
      if (entry.timestamp <= now) {
        expiredUrls.push(url);
      }
    }
    
    for (const url of expiredUrls) {
      this.revokeObjectUrl(url);
    }
    
    if (expiredUrls.length > 0) {
      console.log(`Nettoyage de ${expiredUrls.length} URL d'objets expirées`);
    }
  }

  /**
   * Nettoyer les URL d'objets les plus anciennes
   * @param count Nombre d'URL à nettoyer
   */
  private cleanupOldestObjectUrls(count: number): void {
    if (count <= 0 || this.objectUrls.size === 0) {
      return;
    }
    
    // Trier par timestamp (les plus anciennes d'abord)
    const sortedUrls = Array.from(this.objectUrls.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, count)
      .map(([url]) => url);
    
    for (const url of sortedUrls) {
      this.revokeObjectUrl(url);
    }
    
    console.log(`Nettoyage des ${count} URL d'objets les plus anciennes`);
  }

  /**
   * Nettoyer toutes les URL d'objets
   */
  private cleanupAllObjectUrls(): void {
    for (const [url] of this.objectUrls) {
      URL.revokeObjectURL(url);
    }
    
    const count = this.objectUrls.size;
    this.objectUrls.clear();
    
    if (count > 0) {
      console.log(`Nettoyage de toutes les URL d'objets (${count})`);
    }
  }

  /**
   * Supprimer tous les écouteurs d'événements
   */
  private removeAllEventListeners(): void {
    for (const [id, listeners] of this.eventListeners.entries()) {
      listeners.forEach(({ target, type, listener }) => {
        target.removeEventListener(type, listener);
      });
    }
    
    const count = this.eventListeners.size;
    this.eventListeners.clear();
    
    if (count > 0) {
      console.log(`Suppression de tous les groupes d'écouteurs d'événements (${count})`);
    }
  }

  /**
   * Obtenir les statistiques de gestion mémoire
   */
  public getStats(): {
    objectUrlCount: number;
    eventListenerGroups: number;
    totalEventListeners: number;
    isIdle: boolean;
    idleTime: number;
  } {
    let totalEventListeners = 0;
    for (const listeners of this.eventListeners.values()) {
      totalEventListeners += listeners.length;
    }
    
    return {
      objectUrlCount: this.objectUrls.size,
      eventListenerGroups: this.eventListeners.size,
      totalEventListeners,
      isIdle: this.isIdle,
      idleTime: Date.now() - this.lastActivityTime
    };
  }
}

// Export de l'instance singleton
export const memoryManager = MemoryManager.getInstance();