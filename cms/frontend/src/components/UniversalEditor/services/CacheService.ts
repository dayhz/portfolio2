/**
 * Service de cache intelligent pour l'éditeur universel
 * Gère le cache des composants, médias et autres ressources
 */

// Configuration du cache
const CACHE_CONFIG = {
  // Taille maximale du cache en octets (50 MB)
  MAX_SIZE: 50 * 1024 * 1024,
  // Durée de vie maximale des entrées en millisecondes (24 heures)
  MAX_AGE: 24 * 60 * 60 * 1000,
  // Intervalle de nettoyage en millisecondes (30 minutes)
  CLEANUP_INTERVAL: 30 * 60 * 1000,
  // Seuil de priorité pour le préchargement (0-100)
  PRELOAD_THRESHOLD: 70
};

// Types d'entrées de cache
export enum CacheEntryType {
  IMAGE = 'image',
  HTML = 'html',
  JSON = 'json',
  COMPONENT = 'component',
  OTHER = 'other'
}

// Interface pour les entrées du cache
export interface CacheEntry {
  key: string;
  data: any;
  size: number;
  type: CacheEntryType;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  priority: number;
  metadata?: Record<string, any>;
}

/**
 * Service de cache intelligent avec gestion de priorité et préchargement
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private totalSize: number = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private preloadQueue: string[] = [];
  private isPreloading: boolean = false;

  private constructor() {
    this.startCleanupTimer();
  }

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Ajouter une entrée au cache
   * @param key Clé unique de l'entrée
   * @param data Données à mettre en cache
   * @param size Taille approximative en octets
   * @param type Type d'entrée
   * @param metadata Métadonnées optionnelles
   * @param priority Priorité initiale (0-100)
   * @returns true si l'ajout a réussi
   */
  public set(
    key: string,
    data: any,
    size: number,
    type: CacheEntryType,
    metadata?: Record<string, any>,
    priority: number = 50
  ): boolean {
    // Vérifier si le cache a assez d'espace
    if (size > CACHE_CONFIG.MAX_SIZE) {
      console.warn(`Entrée trop volumineuse pour le cache: ${size} octets`);
      return false;
    }

    // Si l'entrée existe déjà, la mettre à jour
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)!;
      this.totalSize -= existingEntry.size;
      
      // Mettre à jour l'entrée
      existingEntry.data = data;
      existingEntry.size = size;
      existingEntry.timestamp = Date.now();
      existingEntry.lastAccessed = Date.now();
      existingEntry.accessCount += 1;
      existingEntry.priority = Math.max(existingEntry.priority, priority);
      existingEntry.metadata = metadata || existingEntry.metadata;
      
      this.cache.set(key, existingEntry);
      this.totalSize += size;
      
      return true;
    }

    // Libérer de l'espace si nécessaire
    if (this.totalSize + size > CACHE_CONFIG.MAX_SIZE) {
      this.evictEntries(size);
    }

    // Ajouter la nouvelle entrée
    const entry: CacheEntry = {
      key,
      data,
      size,
      type,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      priority,
      metadata
    };

    this.cache.set(key, entry);
    this.totalSize += size;

    return true;
  }

  /**
   * Récupérer une entrée du cache
   * @param key Clé de l'entrée
   * @returns Données mises en cache ou undefined si non trouvé
   */
  public get<T = any>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Mettre à jour les statistiques d'accès
    entry.lastAccessed = Date.now();
    entry.accessCount += 1;
    
    // Augmenter légèrement la priorité à chaque accès
    entry.priority = Math.min(100, entry.priority + 1);
    
    return entry.data as T;
  }

  /**
   * Vérifier si une entrée existe dans le cache
   * @param key Clé de l'entrée
   * @returns true si l'entrée existe
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Supprimer une entrée du cache
   * @param key Clé de l'entrée
   * @returns true si l'entrée a été supprimée
   */
  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    this.totalSize -= entry.size;
    return this.cache.delete(key);
  }

  /**
   * Vider complètement le cache
   */
  public clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  /**
   * Précharger une ressource dans le cache
   * @param key Clé de la ressource
   * @param loader Fonction de chargement
   * @param type Type d'entrée
   * @param priority Priorité (0-100)
   */
  public preload(
    key: string,
    loader: () => Promise<any>,
    type: CacheEntryType,
    priority: number = 50
  ): void {
    // Si déjà en cache avec une priorité suffisante, ignorer
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (entry.priority >= priority) {
        return;
      }
    }

    // Ajouter à la file d'attente de préchargement
    if (!this.preloadQueue.includes(key)) {
      this.preloadQueue.push(key);
      
      // Démarrer le préchargement si ce n'est pas déjà en cours
      if (!this.isPreloading) {
        this.processPreloadQueue(loader, type, priority);
      }
    }
  }

  /**
   * Traiter la file d'attente de préchargement
   */
  private async processPreloadQueue(
    loader: () => Promise<any>,
    type: CacheEntryType,
    priority: number
  ): Promise<void> {
    if (this.preloadQueue.length === 0 || this.isPreloading) {
      return;
    }

    this.isPreloading = true;
    
    try {
      const key = this.preloadQueue.shift()!;
      const data = await loader();
      
      // Estimer la taille des données
      const size = this.estimateSize(data);
      
      // Ajouter au cache
      this.set(key, data, size, type, undefined, priority);
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    } finally {
      this.isPreloading = false;
      
      // Continuer avec le prochain élément de la file d'attente
      if (this.preloadQueue.length > 0) {
        this.processPreloadQueue(loader, type, priority);
      }
    }
  }

  /**
   * Estimer la taille d'un objet en octets
   * @param data Données à évaluer
   * @returns Taille estimée en octets
   */
  private estimateSize(data: any): number {
    if (data === null || data === undefined) {
      return 0;
    }

    if (typeof data === 'string') {
      return data.length * 2; // UTF-16 = 2 octets par caractère
    }

    if (typeof data === 'number') {
      return 8; // Nombre à virgule flottante = 8 octets
    }

    if (typeof data === 'boolean') {
      return 4; // Boolean = 4 octets
    }

    if (data instanceof Blob || data instanceof File) {
      return data.size;
    }

    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }

    if (Array.isArray(data)) {
      return data.reduce((size, item) => size + this.estimateSize(item), 0);
    }

    if (typeof data === 'object') {
      let size = 0;
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          size += key.length * 2; // Clé UTF-16
          size += this.estimateSize(data[key]); // Valeur
        }
      }
      return size;
    }

    return 100; // Valeur par défaut pour les types inconnus
  }

  /**
   * Libérer de l'espace dans le cache
   * @param requiredSpace Espace requis en octets
   */
  private evictEntries(requiredSpace: number): void {
    // Si le cache est vide, rien à faire
    if (this.cache.size === 0) {
      return;
    }

    // Convertir en tableau pour le tri
    const entries = Array.from(this.cache.entries());
    
    // Trier par score d'éviction (priorité basse, ancien accès, faible fréquence)
    entries.sort((a, b) => {
      const entryA = a[1];
      const entryB = b[1];
      
      // Calculer un score d'éviction
      const scoreA = entryA.priority * 0.5 + (entryA.accessCount * 0.3) + 
                    (Date.now() - entryA.lastAccessed) * 0.2;
      const scoreB = entryB.priority * 0.5 + (entryB.accessCount * 0.3) + 
                    (Date.now() - entryB.lastAccessed) * 0.2;
      
      return scoreA - scoreB; // Ordre croissant, les scores bas sont évincés en premier
    });

    // Supprimer des entrées jusqu'à libérer assez d'espace
    let freedSpace = 0;
    for (const [key, entry] of entries) {
      // Ne pas supprimer les entrées à haute priorité sauf si absolument nécessaire
      if (entry.priority > 90 && freedSpace > 0) {
        continue;
      }
      
      this.cache.delete(key);
      freedSpace += entry.size;
      this.totalSize -= entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Identifier les entrées expirées
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_CONFIG.MAX_AGE) {
        expiredKeys.push(key);
      }
    }
    
    // Supprimer les entrées expirées
    for (const key of expiredKeys) {
      const entry = this.cache.get(key)!;
      this.totalSize -= entry.size;
      this.cache.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      console.log(`Nettoyage du cache: ${expiredKeys.length} entrées expirées supprimées`);
    }
  }

  /**
   * Démarrer le timer de nettoyage
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(
      () => this.cleanupExpiredEntries(),
      CACHE_CONFIG.CLEANUP_INTERVAL
    );
  }

  /**
   * Obtenir les statistiques du cache
   */
  public getStats(): {
    entryCount: number;
    totalSize: number;
    maxSize: number;
    usagePercentage: number;
    entriesByType: Record<CacheEntryType, number>;
  } {
    const entriesByType: Record<CacheEntryType, number> = {
      [CacheEntryType.IMAGE]: 0,
      [CacheEntryType.HTML]: 0,
      [CacheEntryType.JSON]: 0,
      [CacheEntryType.COMPONENT]: 0,
      [CacheEntryType.OTHER]: 0
    };
    
    for (const entry of this.cache.values()) {
      entriesByType[entry.type]++;
    }
    
    return {
      entryCount: this.cache.size,
      totalSize: this.totalSize,
      maxSize: CACHE_CONFIG.MAX_SIZE,
      usagePercentage: (this.totalSize / CACHE_CONFIG.MAX_SIZE) * 100,
      entriesByType
    };
  }
}

// Export de l'instance singleton
export const cacheService = CacheService.getInstance();