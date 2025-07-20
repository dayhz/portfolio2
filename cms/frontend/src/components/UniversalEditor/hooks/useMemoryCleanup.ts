/**
 * Hook pour gérer le nettoyage de la mémoire dans les composants React
 */

import { useEffect, useRef, useCallback } from 'react';
import { memoryManager } from '../services/MemoryManager';

interface UseMemoryCleanupOptions {
  componentId?: string;
  cleanupOnUnmount?: boolean;
}

/**
 * Hook pour gérer le nettoyage de la mémoire dans les composants React
 * @param options Options de configuration
 */
export function useMemoryCleanup({
  componentId = `comp_${Math.random().toString(36).substring(2, 9)}`,
  cleanupOnUnmount = true
}: UseMemoryCleanupOptions = {}) {
  // Référence pour stocker les ressources à nettoyer
  const resourcesRef = useRef<{
    objectUrls: string[];
    timeouts: NodeJS.Timeout[];
    intervals: NodeJS.Timeout[];
    animations: number[];
  }>({
    objectUrls: [],
    timeouts: [],
    intervals: [],
    animations: []
  });

  /**
   * Enregistrer une URL d'objet pour nettoyage automatique
   * @param url URL d'objet à nettoyer
   * @param lifespan Durée de vie en millisecondes (0 = jusqu'au démontage)
   */
  const registerObjectUrl = useCallback((url: string, lifespan: number = 0): string => {
    if (!url) return url;
    
    // Enregistrer dans le gestionnaire de mémoire
    memoryManager.registerObjectUrl(url, lifespan);
    
    // Ajouter à la liste des ressources à nettoyer
    resourcesRef.current.objectUrls.push(url);
    
    return url;
  }, []);

  /**
   * Créer un timeout avec nettoyage automatique
   * @param callback Fonction à exécuter
   * @param delay Délai en millisecondes
   */
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = setTimeout(callback, delay);
    resourcesRef.current.timeouts.push(timeoutId);
    return timeoutId;
  }, []);

  /**
   * Créer un interval avec nettoyage automatique
   * @param callback Fonction à exécuter
   * @param delay Délai en millisecondes
   */
  const safeSetInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = setInterval(callback, delay);
    resourcesRef.current.intervals.push(intervalId);
    return intervalId;
  }, []);

  /**
   * Créer une animation frame avec nettoyage automatique
   * @param callback Fonction à exécuter
   */
  const safeRequestAnimationFrame = useCallback((callback: FrameRequestCallback): number => {
    const animationId = requestAnimationFrame(callback);
    resourcesRef.current.animations.push(animationId);
    return animationId;
  }, []);

  /**
   * Enregistrer un écouteur d'événement avec nettoyage automatique
   * @param target Cible de l'événement
   * @param type Type d'événement
   * @param listener Fonction d'écoute
   * @param options Options d'écoute
   */
  const safeAddEventListener = useCallback(
    (
      target: EventTarget,
      type: string,
      listener: EventListener,
      options?: boolean | AddEventListenerOptions
    ): void => {
      target.addEventListener(type, listener, options);
      memoryManager.registerEventListener(componentId, target, type, listener);
    },
    [componentId]
  );

  /**
   * Nettoyer une ressource spécifique
   * @param type Type de ressource
   * @param id Identifiant de la ressource
   */
  const cleanupResource = useCallback(
    (type: 'objectUrl' | 'timeout' | 'interval' | 'animation', id: any): void => {
      const resources = resourcesRef.current;
      
      switch (type) {
        case 'objectUrl':
          if (typeof id === 'string') {
            memoryManager.revokeObjectUrl(id);
            resources.objectUrls = resources.objectUrls.filter(url => url !== id);
          }
          break;
        case 'timeout':
          clearTimeout(id);
          resources.timeouts = resources.timeouts.filter(timeoutId => timeoutId !== id);
          break;
        case 'interval':
          clearInterval(id);
          resources.intervals = resources.intervals.filter(intervalId => intervalId !== id);
          break;
        case 'animation':
          cancelAnimationFrame(id);
          resources.animations = resources.animations.filter(animationId => animationId !== id);
          break;
      }
    },
    []
  );

  /**
   * Nettoyer toutes les ressources
   */
  const cleanupAll = useCallback((): void => {
    const resources = resourcesRef.current;
    
    // Nettoyer les URL d'objets
    resources.objectUrls.forEach(url => {
      memoryManager.revokeObjectUrl(url);
    });
    resources.objectUrls = [];
    
    // Nettoyer les timeouts
    resources.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    resources.timeouts = [];
    
    // Nettoyer les intervals
    resources.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    resources.intervals = [];
    
    // Nettoyer les animations
    resources.animations.forEach(animationId => {
      cancelAnimationFrame(animationId);
    });
    resources.animations = [];
    
    // Nettoyer les écouteurs d'événements
    memoryManager.removeEventListeners(componentId);
  }, [componentId]);

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (cleanupOnUnmount) {
        cleanupAll();
      }
    };
  }, [cleanupOnUnmount, cleanupAll]);

  return {
    registerObjectUrl,
    safeSetTimeout,
    safeSetInterval,
    safeRequestAnimationFrame,
    safeAddEventListener,
    cleanupResource,
    cleanupAll
  };
}