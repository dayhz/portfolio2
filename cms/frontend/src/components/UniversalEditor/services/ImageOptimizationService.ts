/**
 * Service pour l'optimisation et la gestion du cache des images
 */

// Interface pour les entrées du cache d'images
interface ImageCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

// Configuration du cache
const CACHE_MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 heures

export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private imageCache: Map<string, ImageCacheEntry> = new Map();
  private totalCacheSize: number = 0;

  private constructor() {
    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanupCache(), CACHE_MAX_AGE / 2);
  }

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Optimise une image et la met en cache
   * @param file Fichier image à optimiser
   * @param options Options d'optimisation
   * @returns URL de l'image optimisée
   */
  public async optimizeImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<string> {
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}-${JSON.stringify(options)}`;

    // Vérifier si l'image est déjà en cache
    if (this.imageCache.has(cacheKey)) {
      console.log('Image trouvée dans le cache:', cacheKey);
      const cacheEntry = this.imageCache.get(cacheKey)!;
      return URL.createObjectURL(cacheEntry.blob);
    }

    // Optimiser l'image
    try {
      const optimizedBlob = await this.compressImage(file, options);
      const objectUrl = URL.createObjectURL(optimizedBlob);

      // Mettre en cache
      this.addToCache(cacheKey, optimizedBlob);

      return objectUrl;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de l\'image:', error);
      // En cas d'erreur, retourner l'URL de l'image originale
      return URL.createObjectURL(file);
    }
  }

  /**
   * Précharge une image et la met en cache
   * @param url URL de l'image à précharger
   */
  public async preloadImage(url: string): Promise<void> {
    if (this.imageCache.has(url)) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      this.addToCache(url, blob);
    } catch (error) {
      console.error('Erreur lors du préchargement de l\'image:', error);
    }
  }

  /**
   * Compresse une image
   * @param file Fichier image à compresser
   * @param options Options de compression
   * @returns Blob de l'image compressée
   */
  private async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    }
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calculer les dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Créer un canvas pour la compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte 2D'));
          return;
        }

        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob
        const mimeType = format === 'webp' ? 'image/webp' : 
                        format === 'png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression'));
              return;
            }
            resolve(blob);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Échec du chargement de l\'image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Ajoute une image au cache
   * @param key Clé de cache
   * @param blob Blob de l'image
   */
  private addToCache(key: string, blob: Blob): void {
    // Vérifier si le cache est plein
    if (this.totalCacheSize + blob.size > CACHE_MAX_SIZE) {
      this.cleanupCache();
    }

    // Ajouter au cache
    this.imageCache.set(key, {
      url: URL.createObjectURL(blob),
      blob,
      timestamp: Date.now(),
      size: blob.size
    });

    this.totalCacheSize += blob.size;
  }

  /**
   * Nettoie le cache d'images
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.imageCache.entries());

    // Trier par ancienneté
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Supprimer les entrées les plus anciennes jusqu'à ce que le cache soit sous la limite
    for (const [key, entry] of entries) {
      // Supprimer les entrées expirées
      if (now - entry.timestamp > CACHE_MAX_AGE) {
        URL.revokeObjectURL(entry.url);
        this.imageCache.delete(key);
        this.totalCacheSize -= entry.size;
        continue;
      }

      // Si le cache est toujours trop grand, supprimer les entrées les plus anciennes
      if (this.totalCacheSize > CACHE_MAX_SIZE * 0.8) {
        URL.revokeObjectURL(entry.url);
        this.imageCache.delete(key);
        this.totalCacheSize -= entry.size;
      } else {
        break;
      }
    }
  }

  /**
   * Vide le cache d'images
   */
  public clearCache(): void {
    for (const entry of this.imageCache.values()) {
      URL.revokeObjectURL(entry.url);
    }
    this.imageCache.clear();
    this.totalCacheSize = 0;
  }

  /**
   * Obtient les statistiques du cache
   */
  public getCacheStats(): {
    entryCount: number;
    totalSize: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    for (const entry of this.imageCache.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    }

    return {
      entryCount: this.imageCache.size,
      totalSize: this.totalCacheSize,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    };
  }
}

// Export de l'instance singleton
export const imageOptimizationService = ImageOptimizationService.getInstance();