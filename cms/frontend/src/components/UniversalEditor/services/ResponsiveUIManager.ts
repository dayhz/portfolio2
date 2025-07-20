/**
 * Service pour gérer les adaptations responsives de l'interface utilisateur
 */

import { BREAKPOINTS, DeviceType } from '../hooks/useResponsive';

// Configuration des adaptations responsives
const RESPONSIVE_CONFIG = {
  // Taille maximale des images en fonction de la taille d'écran
  IMAGE_MAX_WIDTH: {
    mobile: 600,
    tablet: 1024,
    desktop: 1920
  },
  // Qualité des images en fonction de la taille d'écran
  IMAGE_QUALITY: {
    mobile: 0.7,
    tablet: 0.8,
    desktop: 0.9
  },
  // Nombre de colonnes pour les grilles en fonction de la taille d'écran
  GRID_COLUMNS: {
    mobile: 1,
    tablet: 2,
    desktop: 2
  },
  // Taille des contrôles tactiles en pixels
  TOUCH_TARGET_SIZE: 44,
  // Espacement entre les contrôles tactiles en pixels
  TOUCH_TARGET_SPACING: 8,
  // Délai avant d'afficher les tooltips sur mobile en millisecondes
  MOBILE_TOOLTIP_DELAY: 1000,
  // Activer/désactiver les animations sur les appareils à faible puissance
  REDUCE_ANIMATIONS_ON_LOW_POWER: true
};

// Interface pour les options d'adaptation responsive
export interface ResponsiveUIOptions {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  windowWidth: number;
  windowHeight: number;
  isLowPowerDevice?: boolean;
}

/**
 * Service pour gérer les adaptations responsives de l'interface utilisateur
 */
export class ResponsiveUIManager {
  private static instance: ResponsiveUIManager;
  private currentOptions: ResponsiveUIOptions | null = null;
  private isEnabled: boolean = true;
  private adaptationCallbacks: Array<(options: ResponsiveUIOptions) => void> = [];

  private constructor() {}

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): ResponsiveUIManager {
    if (!ResponsiveUIManager.instance) {
      ResponsiveUIManager.instance = new ResponsiveUIManager();
    }
    return ResponsiveUIManager.instance;
  }

  /**
   * Activer ou désactiver les adaptations responsives
   * @param enabled État d'activation
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled && this.currentOptions) {
      this.notifyAdaptationCallbacks();
    }
  }

  /**
   * Mettre à jour les options d'adaptation responsive
   * @param options Nouvelles options
   */
  public updateOptions(options: ResponsiveUIOptions): void {
    const previousOptions = this.currentOptions;
    this.currentOptions = options;
    
    // Vérifier si les options ont changé de manière significative
    if (
      !previousOptions ||
      previousOptions.deviceType !== options.deviceType ||
      previousOptions.orientation !== options.orientation ||
      Math.abs(previousOptions.windowWidth - options.windowWidth) > 50 ||
      Math.abs(previousOptions.windowHeight - options.windowHeight) > 50
    ) {
      this.notifyAdaptationCallbacks();
    }
  }

  /**
   * Enregistrer un callback pour les adaptations responsives
   * @param callback Fonction à appeler lors des adaptations
   * @returns Fonction pour supprimer le callback
   */
  public registerAdaptationCallback(
    callback: (options: ResponsiveUIOptions) => void
  ): () => void {
    this.adaptationCallbacks.push(callback);
    
    // Appeler immédiatement le callback si des options sont disponibles
    if (this.currentOptions) {
      callback(this.currentOptions);
    }
    
    // Retourner une fonction pour supprimer le callback
    return () => {
      this.adaptationCallbacks = this.adaptationCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifier tous les callbacks d'adaptation
   */
  private notifyAdaptationCallbacks(): void {
    if (!this.isEnabled || !this.currentOptions) return;
    
    for (const callback of this.adaptationCallbacks) {
      try {
        callback(this.currentOptions);
      } catch (error) {
        console.error('Erreur lors de l\'adaptation responsive:', error);
      }
    }
  }

  /**
   * Obtenir la taille maximale des images en fonction de la taille d'écran
   * @param deviceType Type d'appareil
   * @returns Taille maximale en pixels
   */
  public getImageMaxWidth(deviceType: DeviceType = 'desktop'): number {
    return RESPONSIVE_CONFIG.IMAGE_MAX_WIDTH[deviceType];
  }

  /**
   * Obtenir la qualité des images en fonction de la taille d'écran
   * @param deviceType Type d'appareil
   * @returns Qualité (0-1)
   */
  public getImageQuality(deviceType: DeviceType = 'desktop'): number {
    return RESPONSIVE_CONFIG.IMAGE_QUALITY[deviceType];
  }

  /**
   * Obtenir le nombre de colonnes pour les grilles en fonction de la taille d'écran
   * @param deviceType Type d'appareil
   * @returns Nombre de colonnes
   */
  public getGridColumns(deviceType: DeviceType = 'desktop'): number {
    return RESPONSIVE_CONFIG.GRID_COLUMNS[deviceType];
  }

  /**
   * Vérifier si les animations doivent être réduites
   * @param options Options d'adaptation responsive
   * @returns true si les animations doivent être réduites
   */
  public shouldReduceAnimations(options: ResponsiveUIOptions): boolean {
    return (
      RESPONSIVE_CONFIG.REDUCE_ANIMATIONS_ON_LOW_POWER &&
      (options.isLowPowerDevice || options.deviceType === 'mobile')
    );
  }

  /**
   * Obtenir la taille des contrôles tactiles
   * @param isTouchDevice true si l'appareil est tactile
   * @returns Taille en pixels
   */
  public getTouchTargetSize(isTouchDevice: boolean): number {
    return isTouchDevice ? RESPONSIVE_CONFIG.TOUCH_TARGET_SIZE : 32;
  }

  /**
   * Obtenir l'espacement entre les contrôles tactiles
   * @param isTouchDevice true si l'appareil est tactile
   * @returns Espacement en pixels
   */
  public getTouchTargetSpacing(isTouchDevice: boolean): number {
    return isTouchDevice ? RESPONSIVE_CONFIG.TOUCH_TARGET_SPACING : 4;
  }

  /**
   * Obtenir le délai avant d'afficher les tooltips sur mobile
   * @param deviceType Type d'appareil
   * @returns Délai en millisecondes
   */
  public getTooltipDelay(deviceType: DeviceType): number {
    return deviceType === 'mobile' ? RESPONSIVE_CONFIG.MOBILE_TOOLTIP_DELAY : 300;
  }

  /**
   * Obtenir les styles CSS adaptés à la taille d'écran
   * @param options Options d'adaptation responsive
   * @returns Styles CSS
   */
  public getResponsiveStyles(options: ResponsiveUIOptions): Record<string, any> {
    const { deviceType, isTouchDevice, orientation, windowWidth } = options;
    
    // Styles de base
    const styles: Record<string, any> = {
      // Styles pour les contrôles
      controls: {
        size: this.getTouchTargetSize(isTouchDevice),
        spacing: this.getTouchTargetSpacing(isTouchDevice),
        borderRadius: deviceType === 'mobile' ? '4px' : '6px',
        fontSize: deviceType === 'mobile' ? '14px' : '16px'
      },
      // Styles pour les menus
      menu: {
        maxHeight: orientation === 'portrait' ? '50vh' : '70vh',
        width: deviceType === 'mobile' ? '100%' : 'auto',
        position: deviceType === 'mobile' ? 'fixed' : 'absolute',
        bottom: deviceType === 'mobile' ? 0 : 'auto'
      },
      // Styles pour les tooltips
      tooltip: {
        delay: this.getTooltipDelay(deviceType),
        enabled: deviceType !== 'mobile' || orientation === 'landscape'
      },
      // Styles pour les grilles
      grid: {
        columns: this.getGridColumns(deviceType),
        gap: deviceType === 'mobile' ? '8px' : '16px'
      },
      // Styles pour les animations
      animations: {
        enabled: !this.shouldReduceAnimations(options),
        duration: deviceType === 'mobile' ? '150ms' : '300ms'
      }
    };
    
    return styles;
  }

  /**
   * Détecter si l'appareil est à faible puissance
   * @returns Promise avec true si l'appareil est à faible puissance
   */
  public async detectLowPowerDevice(): Promise<boolean> {
    // Utiliser l'API Battery si disponible
    if (navigator && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        if (battery.charging === false && battery.level < 0.2) {
          return true;
        }
      } catch (error) {
        console.log('API Battery non disponible:', error);
      }
    }
    
    // Utiliser l'API Device Memory si disponible
    if (navigator && 'deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) {
        return true;
      }
    }
    
    // Utiliser l'API Hardware Concurrency si disponible
    if (navigator && 'hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency;
      if (cores && cores < 4) {
        return true;
      }
    }
    
    // Par défaut, considérer les appareils mobiles comme à faible puissance
    const currentOptions = this.currentOptions;
    return currentOptions ? currentOptions.deviceType === 'mobile' : false;
  }
}

// Export de l'instance singleton
export const responsiveUIManager = ResponsiveUIManager.getInstance();