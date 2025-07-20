/**
 * Composant pour adapter l'interface utilisateur en fonction de la taille de l'écran
 */

import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { responsiveUIManager } from '../services/ResponsiveUIManager';

interface ResponsiveWrapperProps {
  children: React.ReactNode | ((options: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    isTouchDevice: boolean;
    orientation: 'portrait' | 'landscape';
    styles: Record<string, any>;
  }) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  mobileOnly?: boolean;
  tabletOnly?: boolean;
  desktopOnly?: boolean;
  touchOnly?: boolean;
  landscapeOnly?: boolean;
  portraitOnly?: boolean;
}

export function ResponsiveWrapper({
  children,
  className = '',
  style = {},
  mobileOnly = false,
  tabletOnly = false,
  desktopOnly = false,
  touchOnly = false,
  landscapeOnly = false,
  portraitOnly = false
}: ResponsiveWrapperProps) {
  const { deviceType, isTouchDevice, orientation, windowSize } = useResponsive();
  const [isLowPowerDevice, setIsLowPowerDevice] = useState<boolean>(false);
  const [responsiveStyles, setResponsiveStyles] = useState<Record<string, any>>({});
  
  // Détecter si l'appareil est à faible puissance
  useEffect(() => {
    responsiveUIManager.detectLowPowerDevice().then(setIsLowPowerDevice);
  }, []);
  
  // Mettre à jour les options d'adaptation responsive
  useEffect(() => {
    const options = {
      deviceType,
      isTouchDevice,
      orientation,
      windowWidth: windowSize.width,
      windowHeight: windowSize.height,
      isLowPowerDevice
    };
    
    // Mettre à jour les options du gestionnaire
    responsiveUIManager.updateOptions(options);
    
    // Obtenir les styles adaptés
    const styles = responsiveUIManager.getResponsiveStyles(options);
    setResponsiveStyles(styles);
  }, [deviceType, isTouchDevice, orientation, windowSize, isLowPowerDevice]);
  
  // Vérifier si le composant doit être affiché en fonction des contraintes
  const shouldRender = (
    (!mobileOnly || deviceType === 'mobile') &&
    (!tabletOnly || deviceType === 'tablet') &&
    (!desktopOnly || deviceType === 'desktop') &&
    (!touchOnly || isTouchDevice) &&
    (!landscapeOnly || orientation === 'landscape') &&
    (!portraitOnly || orientation === 'portrait')
  );
  
  if (!shouldRender) {
    return null;
  }
  
  // Appliquer les styles adaptés à la taille d'écran
  const wrapperStyles = {
    ...style
  };
  
  // Ajouter des classes CSS en fonction de la taille d'écran
  const wrapperClassName = `
    responsive-wrapper
    ${className}
    device-${deviceType}
    orientation-${orientation}
    ${isTouchDevice ? 'touch-device' : 'mouse-device'}
    ${isLowPowerDevice ? 'low-power-device' : ''}
  `.trim();
  
  // Rendre le contenu en fonction du type d'enfants
  const content = typeof children === 'function'
    ? children({ deviceType, isTouchDevice, orientation, styles: responsiveStyles })
    : children;
  
  return (
    <div className={wrapperClassName} style={wrapperStyles}>
      {content}
    </div>
  );
}