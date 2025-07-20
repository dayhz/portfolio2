/**
 * Hook pour gérer les fonctionnalités responsive de l'éditeur
 */

import { useState, useEffect, useCallback } from 'react';
import { useMemoryCleanup } from './useMemoryCleanup';

// Breakpoints pour les différentes tailles d'écran (en pixels)
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

// Types d'appareils
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Interface pour les options du hook
interface UseResponsiveOptions {
  debounceDelay?: number;
  breakpoints?: typeof BREAKPOINTS;
}

/**
 * Hook pour détecter la taille de l'écran et les capacités tactiles
 * @param options Options de configuration
 */
export function useResponsive({
  debounceDelay = 250,
  breakpoints = BREAKPOINTS
}: UseResponsiveOptions = {}) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  
  const { safeAddEventListener } = useMemoryCleanup();
  
  // Détecter le type d'appareil en fonction de la largeur de l'écran
  const detectDeviceType = useCallback((width: number): DeviceType => {
    if (width < breakpoints.md) {
      return 'mobile';
    } else if (width < breakpoints.lg) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }, [breakpoints]);
  
  // Détecter l'orientation de l'écran
  const detectOrientation = useCallback((width: number, height: number): 'portrait' | 'landscape' => {
    return width < height ? 'portrait' : 'landscape';
  }, []);
  
  // Détecter si l'appareil est tactile
  const detectTouchDevice = useCallback((): boolean => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0)
    );
  }, []);
  
  // Mettre à jour les dimensions de la fenêtre
  const updateWindowDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setWindowSize({ width, height });
    setDeviceType(detectDeviceType(width));
    setOrientation(detectOrientation(width, height));
    setIsTouchDevice(detectTouchDevice());
  }, [detectDeviceType, detectOrientation, detectTouchDevice]);
  
  // Gérer le redimensionnement de la fenêtre avec debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mettre à jour les dimensions initiales
    updateWindowDimensions();
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Fonction de gestionnaire d'événement avec debounce
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        updateWindowDimensions();
      }, debounceDelay);
    };
    
    // Ajouter les écouteurs d'événements
    safeAddEventListener(window, 'resize', handleResize);
    
    // Écouter les changements d'orientation sur les appareils mobiles
    if (typeof window.orientation !== 'undefined') {
      safeAddEventListener(window, 'orientationchange', handleResize);
    }
    
    // Nettoyer les écouteurs d'événements
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updateWindowDimensions, debounceDelay, safeAddEventListener]);
  
  // Vérifier si la largeur de l'écran correspond à un breakpoint spécifique
  const isBreakpoint = useCallback((breakpoint: keyof typeof breakpoints): boolean => {
    const width = windowSize.width;
    
    switch (breakpoint) {
      case 'xs':
        return width >= breakpoints.xs && width < breakpoints.sm;
      case 'sm':
        return width >= breakpoints.sm && width < breakpoints.md;
      case 'md':
        return width >= breakpoints.md && width < breakpoints.lg;
      case 'lg':
        return width >= breakpoints.lg && width < breakpoints.xl;
      case 'xl':
        return width >= breakpoints.xl && width < breakpoints.xxl;
      case 'xxl':
        return width >= breakpoints.xxl;
      default:
        return false;
    }
  }, [windowSize.width, breakpoints]);
  
  // Vérifier si la largeur de l'écran est inférieure ou égale à un breakpoint
  const isDown = useCallback((breakpoint: keyof typeof breakpoints): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  }, [windowSize.width, breakpoints]);
  
  // Vérifier si la largeur de l'écran est supérieure ou égale à un breakpoint
  const isUp = useCallback((breakpoint: keyof typeof breakpoints): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  }, [windowSize.width, breakpoints]);
  
  // Vérifier si la largeur de l'écran est entre deux breakpoints
  const isBetween = useCallback((
    minBreakpoint: keyof typeof breakpoints,
    maxBreakpoint: keyof typeof breakpoints
  ): boolean => {
    return windowSize.width >= breakpoints[minBreakpoint] && 
           windowSize.width < breakpoints[maxBreakpoint];
  }, [windowSize.width, breakpoints]);
  
  return {
    windowSize,
    deviceType,
    isTouchDevice,
    orientation,
    isBreakpoint,
    isDown,
    isUp,
    isBetween,
    breakpoints
  };
}