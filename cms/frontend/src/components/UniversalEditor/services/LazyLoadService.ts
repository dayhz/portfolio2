/**
 * Service de lazy loading intelligent pour les composants de l'éditeur universel
 */

import React, { lazy, Suspense } from 'react';
import { cacheService, CacheEntryType } from './CacheService';

// Configuration du lazy loading
const LAZY_LOAD_CONFIG = {
  // Délai avant de précharger les composants en millisecondes
  PRELOAD_DELAY: 500,
  // Nombre maximum de composants à précharger simultanément
  MAX_CONCURRENT_PRELOADS: 3,
  // Priorité des composants fréquemment utilisés (0-100)
  FREQUENT_COMPONENT_PRIORITY: 80
};

// Interface pour les composants lazy loadés
export interface LazyComponentConfig {
  name: string;
  path: string;
  priority: number;
  preload: boolean;
}

/**
 * Service de lazy loading avec préchargement intelligent
 */
export class LazyLoadService {
  private static instance: LazyLoadService;
  private componentRegistry: Map<string, LazyComponentConfig> = new Map();
  private loadingComponents: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private preloadTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): LazyLoadService {
    if (!LazyLoadService.instance) {
      LazyLoadService.instance = new LazyLoadService();
    }
    return LazyLoadService.instance;
  }

  /**
   * Enregistrer un composant pour le lazy loading
   * @param name Nom unique du composant
   * @param path Chemin d'import du composant
   * @param priority Priorité de préchargement (0-100)
   * @param preload Précharger automatiquement
   */
  public registerComponent(
    name: string,
    path: string,
    priority: number = 50,
    preload: boolean = false
  ): void {
    this.componentRegistry.set(name, { name, path, priority, preload });
    
    // Ajouter à la file d'attente de préchargement si nécessaire
    if (preload) {
      this.preloadQueue.push(name);
      this.schedulePreload();
    }
  }

  /**
   * Créer un composant lazy loadé avec fallback
   * @param name Nom du composant enregistré
   * @param fallback Fallback à afficher pendant le chargement
   * @returns Composant lazy loadé avec Suspense
   */
  public createLazyComponent<T = any>(
    name: string,
    fallback: any = null
  ): React.FC<T> {
    const config = this.componentRegistry.get(name);
    
    if (!config) {
      console.error(`Composant non enregistré: ${name}`);
      return (() => {
        return React.createElement('div', {}, `Composant non trouvé: ${name}`);
      }) as React.FC<T>;
    }
    
    // Fonction d'import dynamique
    const importFn = () => this.importComponent(config.path);
    
    // Créer le composant lazy
    const LazyComponent = lazy(importFn);
    
    // Marquer comme utilisé pour augmenter la priorité
    this.markComponentAsUsed(name);
    
    // Créer un fallback React à partir de l'objet fallback
    const renderFallback = () => {
      if (!fallback) {
        return React.createElement('div', { className: 'lazy-loading-fallback' }, 
          React.createElement('div', { className: 'loading-indicator' }),
          React.createElement('div', { className: 'loading-text' }, `Chargement...`)
        );
      }
      
      if (typeof fallback === 'object' && fallback.type === 'loading') {
        return React.createElement('div', { className: 'lazy-loading-fallback' }, 
          React.createElement('div', { className: 'loading-indicator' }),
          React.createElement('div', { className: 'loading-text' }, fallback.text || 'Chargement...')
        );
      }
      
      // Si c'est déjà un élément React, le retourner tel quel
      return fallback;
    };
    
    return (props: T) => {
      return React.createElement(
        Suspense,
        { fallback: renderFallback() },
        React.createElement(LazyComponent, props)
      );
    };
  }

  /**
   * Précharger un composant spécifique
   * @param name Nom du composant à précharger
   */
  public preloadComponent(name: string): void {
    const config = this.componentRegistry.get(name);
    
    if (!config) {
      console.error(`Tentative de préchargement d'un composant non enregistré: ${name}`);
      return;
    }
    
    // Vérifier si le composant est déjà en cours de chargement
    if (this.loadingComponents.has(name)) {
      return;
    }
    
    // Vérifier si le composant est déjà en cache
    const cacheKey = `component:${config.path}`;
    if (cacheService.has(cacheKey)) {
      return;
    }
    
    // Précharger le composant
    this.loadingComponents.add(name);
    
    this.importComponent(config.path)
      .then((module) => {
        // Mettre en cache le module
        cacheService.set(
          cacheKey,
          module,
          1024, // Taille estimée
          CacheEntryType.COMPONENT,
          { name: config.name },
          config.priority
        );
        
        console.log(`Composant préchargé: ${name}`);
      })
      .catch((error) => {
        console.error(`Erreur lors du préchargement du composant ${name}:`, error);
      })
      .finally(() => {
        this.loadingComponents.delete(name);
      });
  }

  /**
   * Précharger plusieurs composants
   * @param names Noms des composants à précharger
   */
  public preloadComponents(names: string[]): void {
    for (const name of names) {
      if (!this.preloadQueue.includes(name)) {
        this.preloadQueue.push(name);
      }
    }
    
    this.schedulePreload();
  }

  /**
   * Précharger les composants fréquemment utilisés
   */
  public preloadFrequentComponents(): void {
    // Filtrer les composants avec une priorité élevée
    const frequentComponents = Array.from(this.componentRegistry.values())
      .filter(config => config.priority >= LAZY_LOAD_CONFIG.FREQUENT_COMPONENT_PRIORITY)
      .map(config => config.name);
    
    this.preloadComponents(frequentComponents);
  }

  /**
   * Marquer un composant comme utilisé pour augmenter sa priorité
   * @param name Nom du composant
   */
  private markComponentAsUsed(name: string): void {
    const config = this.componentRegistry.get(name);
    
    if (config) {
      // Augmenter légèrement la priorité
      config.priority = Math.min(100, config.priority + 5);
      this.componentRegistry.set(name, config);
    }
  }

  /**
   * Importer un composant avec gestion du cache
   * @param path Chemin du composant
   * @returns Promise du module
   */
  private importComponent(path: string): Promise<any> {
    const cacheKey = `component:${path}`;
    const cachedModule = cacheService.get(cacheKey);
    
    if (cachedModule) {
      return Promise.resolve(cachedModule);
    }
    
    // Importer dynamiquement le module
    return import(/* webpackChunkName: "[request]" */ `../${path}`);
  }

  /**
   * Planifier le préchargement des composants
   */
  private schedulePreload(): void {
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer);
    }
    
    this.preloadTimer = setTimeout(
      () => this.processPreloadQueue(),
      LAZY_LOAD_CONFIG.PRELOAD_DELAY
    );
  }

  /**
   * Traiter la file d'attente de préchargement
   */
  private processPreloadQueue(): void {
    // Limiter le nombre de préchargements simultanés
    const availableSlots = LAZY_LOAD_CONFIG.MAX_CONCURRENT_PRELOADS - this.loadingComponents.size;
    
    if (availableSlots <= 0 || this.preloadQueue.length === 0) {
      return;
    }
    
    // Précharger les composants suivants
    const componentsToPreload = this.preloadQueue.splice(0, availableSlots);
    
    for (const name of componentsToPreload) {
      this.preloadComponent(name);
    }
    
    // Continuer le préchargement s'il reste des composants
    if (this.preloadQueue.length > 0) {
      this.schedulePreload();
    }
  }

  /**
   * Obtenir les statistiques de lazy loading
   */
  public getStats(): {
    registeredComponents: number;
    loadingComponents: number;
    queuedPreloads: number;
  } {
    return {
      registeredComponents: this.componentRegistry.size,
      loadingComponents: this.loadingComponents.size,
      queuedPreloads: this.preloadQueue.length
    };
  }
}

// Export de l'instance singleton
export const lazyLoadService = LazyLoadService.getInstance();