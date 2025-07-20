/**
 * Composant pour gérer les contrôles tactiles adaptés aux appareils mobiles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';
import { responsiveUIManager } from '../services/ResponsiveUIManager';

interface TouchControlsProps {
  children: React.ReactNode;
  onTap?: (event: React.TouchEvent) => void;
  onDoubleTap?: (event: React.TouchEvent) => void;
  onLongPress?: (event: React.TouchEvent) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: React.TouchEvent) => void;
  onPinch?: (scale: number, event: React.TouchEvent) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  longPressDelay?: number;
  swipeThreshold?: number;
}

export function TouchControls({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  onPinch,
  disabled = false,
  className = '',
  style = {},
  longPressDelay = 500,
  swipeThreshold = 50
}: TouchControlsProps) {
  const { deviceType, isTouchDevice } = useResponsive();
  const { safeSetTimeout, cleanupResource } = useMemoryCleanup();
  
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number, y: number } | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  
  // Obtenir les styles adaptés à la taille d'écran
  const responsiveStyles = responsiveUIManager.getResponsiveStyles({
    deviceType,
    isTouchDevice,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  });
  
  // Calculer la distance entre deux points tactiles
  const getDistance = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);
  
  // Gérer le début du toucher
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    
    const now = Date.now();
    setTouchStartTime(now);
    
    const touch = event.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    // Détecter le pincement
    if (event.touches.length === 2 && onPinch) {
      setTouchDistance(getDistance(event.touches));
    }
    
    // Détecter l'appui long
    if (onLongPress) {
      const timer = safeSetTimeout(() => {
        onLongPress(event);
      }, longPressDelay);
      
      setLongPressTimer(timer);
    }
  }, [disabled, onLongPress, longPressDelay, safeSetTimeout, getDistance, onPinch]);
  
  // Gérer le déplacement du toucher
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (disabled || !touchStartPos) return;
    
    // Annuler l'appui long si le doigt se déplace trop
    if (longPressTimer) {
      const touch = event.touches[0];
      const dx = touch.clientX - touchStartPos.x;
      const dy = touch.clientY - touchStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      }
    }
    
    // Gérer le pincement
    if (event.touches.length === 2 && onPinch && touchDistance) {
      const currentDistance = getDistance(event.touches);
      const scale = currentDistance / touchDistance;
      
      onPinch(scale, event);
    }
  }, [disabled, touchStartPos, longPressTimer, touchDistance, onPinch, getDistance]);
  
  // Gérer la fin du toucher
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (disabled || !touchStartPos) return;
    
    // Annuler l'appui long
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    const now = Date.now();
    const touchDuration = now - touchStartTime;
    
    // Détecter le swipe
    if (onSwipe) {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartPos.x;
      const dy = touch.clientY - touchStartPos.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      if (Math.max(absDx, absDy) > swipeThreshold) {
        if (absDx > absDy) {
          // Swipe horizontal
          onSwipe(dx > 0 ? 'right' : 'left', event);
        } else {
          // Swipe vertical
          onSwipe(dy > 0 ? 'down' : 'up', event);
        }
      } else if (touchDuration < 300 && onTap) {
        // Détecter le tap simple ou double
        const timeSinceLastTap = now - lastTapTime;
        
        if (timeSinceLastTap < 300 && onDoubleTap) {
          // Double tap
          onDoubleTap(event);
          setLastTapTime(0);
        } else {
          // Simple tap
          onTap(event);
          setLastTapTime(now);
        }
      }
    } else if (touchDuration < 300 && onTap) {
      // Détecter le tap simple ou double sans swipe
      const timeSinceLastTap = now - lastTapTime;
      
      if (timeSinceLastTap < 300 && onDoubleTap) {
        // Double tap
        onDoubleTap(event);
        setLastTapTime(0);
      } else {
        // Simple tap
        onTap(event);
        setLastTapTime(now);
      }
    }
    
    // Réinitialiser les états
    setTouchStartPos(null);
    setTouchDistance(null);
  }, [
    disabled,
    touchStartPos,
    touchStartTime,
    longPressTimer,
    lastTapTime,
    onTap,
    onDoubleTap,
    onSwipe,
    swipeThreshold
  ]);
  
  // Nettoyer les ressources lors du démontage
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);
  
  // Appliquer les styles adaptés à la taille d'écran
  const touchStyles = {
    touchAction: 'none', // Désactiver les gestes par défaut du navigateur
    userSelect: 'none', // Empêcher la sélection de texte
    WebkitTapHighlightColor: 'transparent', // Supprimer la surbrillance au tap
    cursor: 'pointer',
    ...style
  };
  
  // Ajouter les écouteurs d'événements tactiles uniquement si nécessaire
  const touchProps = isTouchDevice
    ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd
      }
    : {};
  
  return (
    <div
      className={`touch-controls ${className}`}
      style={touchStyles as React.CSSProperties}
      {...touchProps}
    >
      {children}
    </div>
  );
}