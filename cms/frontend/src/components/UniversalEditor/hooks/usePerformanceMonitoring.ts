/**
 * Hook pour utiliser le moniteur de performances dans les composants React
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, MetricType } from '../services/PerformanceMonitor';

interface UsePerformanceMonitoringOptions {
  componentName: string;
  monitorRender?: boolean;
  monitorEffects?: boolean;
  monitorEvents?: boolean;
  disabled?: boolean;
}

/**
 * Hook pour surveiller les performances d'un composant React
 * @param options Options de monitoring
 */
export function usePerformanceMonitoring({
  componentName,
  monitorRender = true,
  monitorEffects = false,
  monitorEvents = true,
  disabled = false
}: UsePerformanceMonitoringOptions) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(0);
  
  // Mesurer le temps de rendu
  useEffect(() => {
    if (disabled) return;
    
    renderCountRef.current += 1;
    
    if (monitorRender) {
      const renderMarkId = `render_${componentName}_${renderCountRef.current}`;
      performanceMonitor.mark(renderMarkId, MetricType.RENDER, componentName);
      
      // Utiliser requestAnimationFrame pour mesurer après le rendu
      const animationFrame = requestAnimationFrame(() => {
        performanceMonitor.measure(
          renderMarkId,
          MetricType.RENDER,
          componentName,
          { renderCount: renderCountRef.current }
        );
      });
      
      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  });
  
  // Mesurer le temps de montage
  useEffect(() => {
    if (disabled) return;
    
    mountTimeRef.current = performance.now();
    const mountMarkId = `mount_${componentName}`;
    
    if (monitorEffects) {
      performanceMonitor.mark(mountMarkId, MetricType.LOAD, componentName);
      
      // Mesurer après le montage complet
      const timeoutId = setTimeout(() => {
        performanceMonitor.measure(
          mountMarkId,
          MetricType.LOAD,
          componentName,
          { mountTime: performance.now() - mountTimeRef.current }
        );
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        
        // Mesurer le temps de démontage
        const unmountMarkId = `unmount_${componentName}`;
        performanceMonitor.mark(unmountMarkId, MetricType.LOAD, componentName);
        performanceMonitor.measure(
          unmountMarkId,
          MetricType.LOAD,
          componentName,
          { unmountTime: performance.now() - mountTimeRef.current }
        );
      };
    }
  }, [componentName, monitorEffects, disabled]);
  
  // Fonction pour mesurer les événements
  const measureEvent = useCallback((
    eventName: string,
    callback: (...args: any[]) => any
  ) => {
    if (disabled || !monitorEvents) {
      return callback;
    }
    
    return (...args: any[]) => {
      const eventMarkId = `event_${componentName}_${eventName}_${Date.now()}`;
      performanceMonitor.mark(eventMarkId, MetricType.INPUT, componentName);
      
      const result = callback(...args);
      
      // Si le résultat est une promesse, mesurer après sa résolution
      if (result instanceof Promise) {
        result.finally(() => {
          performanceMonitor.measure(
            eventMarkId,
            MetricType.INPUT,
            componentName,
            { eventName, async: true }
          );
        });
      } else {
        performanceMonitor.measure(
          eventMarkId,
          MetricType.INPUT,
          componentName,
          { eventName }
        );
      }
      
      return result;
    };
  }, [componentName, monitorEvents, disabled]);
  
  // Fonction pour mesurer une opération manuelle
  const measureOperation = useCallback((
    operationName: string,
    operation: () => any,
    type: MetricType = MetricType.RENDER
  ) => {
    if (disabled) {
      return operation();
    }
    
    const operationMarkId = `operation_${componentName}_${operationName}_${Date.now()}`;
    performanceMonitor.mark(operationMarkId, type, componentName);
    
    try {
      const result = operation();
      
      // Si le résultat est une promesse, mesurer après sa résolution
      if (result instanceof Promise) {
        result.finally(() => {
          performanceMonitor.measure(
            operationMarkId,
            type,
            componentName,
            { operationName, async: true }
          );
        });
        return result;
      }
      
      performanceMonitor.measure(
        operationMarkId,
        type,
        componentName,
        { operationName }
      );
      
      return result;
    } catch (error) {
      performanceMonitor.measure(
        operationMarkId,
        type,
        componentName,
        { operationName, error: true }
      );
      throw error;
    }
  }, [componentName, disabled]);
  
  return {
    measureEvent,
    measureOperation,
    renderCount: renderCountRef.current
  };
}