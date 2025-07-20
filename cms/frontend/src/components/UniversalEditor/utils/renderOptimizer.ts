/**
 * Utilitaires pour optimiser les re-renders React
 */

import { useRef, useEffect, useCallback, DependencyList } from 'react';
import { performanceMonitor, MetricType } from '../services/PerformanceMonitor';

/**
 * Vérifie si deux objets sont égaux en profondeur
 * @param obj1 Premier objet
 * @param obj2 Second objet
 * @returns true si les objets sont égaux
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Hook pour détecter les re-renders inutiles
 * @param componentName Nom du composant
 * @param props Props du composant
 * @param threshold Seuil de temps entre les renders en ms
 */
export function useDetectUnnecessaryRenders(
  componentName: string,
  props: Record<string, any>,
  threshold: number = 100
): void {
  const prevPropsRef = useRef<Record<string, any>>(props);
  const lastRenderTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    // Vérifier si le render est trop fréquent
    if (timeSinceLastRender < threshold) {
      const changedProps: string[] = [];
      
      // Trouver les props qui ont changé
      Object.keys(props).forEach(key => {
        if (!deepEqual(props[key], prevPropsRef.current[key])) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.warn(
          `Re-render rapide détecté dans ${componentName} (${timeSinceLastRender.toFixed(2)}ms). ` +
          `Props modifiées: ${changedProps.join(', ')}`
        );
        
        // Enregistrer la métrique de performance
        performanceMonitor.addMetric({
          type: MetricType.RENDER,
          value: timeSinceLastRender,
          timestamp: Date.now(),
          component: componentName,
          details: {
            changedProps,
            isUnnecessary: true
          }
        });
      } else {
        console.warn(
          `Re-render potentiellement inutile dans ${componentName} (${timeSinceLastRender.toFixed(2)}ms). ` +
          `Aucune prop n'a changé.`
        );
        
        // Enregistrer la métrique de performance
        performanceMonitor.addMetric({
          type: MetricType.RENDER,
          value: timeSinceLastRender,
          timestamp: Date.now(),
          component: componentName,
          details: {
            isUnnecessary: true,
            reason: 'no_prop_change'
          }
        });
      }
    }
    
    // Mettre à jour les références
    prevPropsRef.current = { ...props };
    lastRenderTimeRef.current = now;
  });
}

/**
 * Hook pour débouncer une fonction
 * @param fn Fonction à débouncer
 * @param delay Délai en millisecondes
 * @param deps Dépendances
 * @returns Fonction debouncée
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  deps: DependencyList = []
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [...deps, delay]);
}

/**
 * Hook pour throttler une fonction
 * @param fn Fonction à throttler
 * @param limit Limite en millisecondes
 * @param deps Dépendances
 * @returns Fonction throttlée
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  deps: DependencyList = []
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRunRef.current >= limit) {
      lastRunRef.current = now;
      fn(...args);
    } else if (!timeoutRef.current) {
      const remaining = limit - (now - lastRunRef.current);
      
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        timeoutRef.current = null;
        fn(...args);
      }, remaining);
    }
  }, [...deps, limit]);
}

/**
 * Hook pour mémoiser une valeur avec comparaison profonde
 * @param value Valeur à mémoiser
 * @returns Valeur mémorisée
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  
  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Crée une version memoizée d'une fonction avec cache LRU
 * @param fn Fonction à mémoiser
 * @param maxCacheSize Taille maximale du cache
 * @returns Fonction mémoizée
 */
export function memoizeWithLRU<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, { result: ReturnType<T>, lastAccess: number }>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    // Créer une clé de cache à partir des arguments
    const key = JSON.stringify(args);
    const now = Date.now();
    
    // Vérifier si le résultat est en cache
    if (cache.has(key)) {
      const entry = cache.get(key)!;
      entry.lastAccess = now;
      return entry.result;
    }
    
    // Calculer le résultat
    const result = fn(...args);
    
    // Nettoyer le cache si nécessaire
    if (cache.size >= maxCacheSize) {
      // Trouver l'entrée la moins récemment utilisée
      let oldestKey: string | null = null;
      let oldestAccess = Infinity;
      
      for (const [k, entry] of cache.entries()) {
        if (entry.lastAccess < oldestAccess) {
          oldestAccess = entry.lastAccess;
          oldestKey = k;
        }
      }
      
      // Supprimer l'entrée la plus ancienne
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    // Mettre en cache le résultat
    cache.set(key, { result, lastAccess: now });
    
    return result;
  }) as T;
  
  // Ajouter une méthode pour vider le cache
  (memoized as any).clearCache = () => {
    cache.clear();
  };
  
  return memoized;
}