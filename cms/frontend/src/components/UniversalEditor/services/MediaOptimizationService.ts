/**
 * Service d'optimisation et de gestion des médias avec cache intelligent
 */

import { cacheService, CacheEntryType } from './CacheService';

// Configuration de l'optimisation des médias
const MEDIA_CONFIG = {
  // Taille maximale des images en pixels
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  // Qualité de compression par défaut (0-1)
  DEFAULT_QUALITY: 0.85,
  // Format de compression par défaut
  DEFAULT_FORMAT: 'webp' as const,
  // Taille maximale des fichiers en octets (10 MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // Formats d'image supportés
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Formats vidéo supportés
  SUPPORTED_VIDEO_FORMATS: ['video/mp4', 'video/webm', 'video/ogg']
};

// Types d'options d'optimisation
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  preserveExif?: boolean;
  resizeMode?: 'contain' | 'cover' | 'fill';
}

export interface VideoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxDuration?: number;
  format?: 'mp4' | 'webm';
}

// Types d'erreurs d'optimisation
export enum MediaErrorType {
  SIZE_EXCEEDED = 'size_exceeded',
  FORMAT_UNSUPPORTED = 'format_unsupported',
  PROCESSING_ERROR = 'processing_error',
  NETWORK_ERROR = 'network_error'
}

export interface MediaError {
  type: MediaErrorType;
  message: string;
  details?: any;
}

/**
 * Service d'optimisation des médias avec cache intelligent
 */
export class MediaOptimizationService {
  private static instance: MediaOptimizationService;

  private constructor() {}

  /**
   * Obtenir l'instance singleton du service
   */
  public static getInstance(): MediaOptimizationService {
    if (!MediaOptimizationService.instance) {
      MediaOptimizationService.instance = new MediaOptimizationService();
    }
    return MediaOptimizationService.instance;
  }

  /**
   * Optimiser une image avec mise en cache
   * @param file Fichier image à optimiser
   * @param options Options d'optimisation
   * @returns Promise avec l'URL de l'image optimisée
   */
  public async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    // Valider le fichier
    this.validateImageFile(file);
    
    // Créer une clé de cache unique
    const cacheKey = this.createCacheKey(file, options);
    
    // Vérifier si l'image est déjà en cache
    const cachedUrl = cacheService.get<string>(cacheKey);
    if (cachedUrl) {
      console.log('Image trouvée dans le cache:', cacheKey);
      return cachedUrl;
    }
    
    // Optimiser l'image
    try {
      const optimizedBlob = await this.compressImage(file, options);
      const objectUrl = URL.createObjectURL(optimizedBlob);
      
      // Mettre en cache
      cacheService.set(
        cacheKey,
        objectUrl,
        optimizedBlob.size,
        CacheEntryType.IMAGE,
        {
          filename: file.name,
          originalSize: file.size,
          optimizedSize: optimizedBlob.size,
          compressionRatio: file.size / optimizedBlob.size
        }
      );
      
      return objectUrl;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de l\'image:', error);
      throw {
        type: MediaErrorType.PROCESSING_ERROR,
        message: 'Échec de l\'optimisation de l\'image',
        details: error
      };
    }
  }

  /**
   * Précharger une image et la mettre en cache
   * @param url URL de l'image à précharger
   * @returns Promise avec l'URL de l'image préchargée
   */
  public async preloadImage(url: string): Promise<string> {
    // Vérifier si l'image est déjà en cache
    const cacheKey = `preload:${url}`;
    const cachedUrl = cacheService.get<string>(cacheKey);
    
    if (cachedUrl) {
      return cachedUrl;
    }
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Mettre en cache
      cacheService.set(
        cacheKey,
        objectUrl,
        blob.size,
        CacheEntryType.IMAGE,
        { sourceUrl: url }
      );
      
      return objectUrl;
    } catch (error) {
      console.error('Erreur lors du préchargement de l\'image:', error);
      throw {
        type: MediaErrorType.NETWORK_ERROR,
        message: 'Échec du préchargement de l\'image',
        details: error
      };
    }
  }

  /**
   * Optimiser une vidéo
   * @param file Fichier vidéo à optimiser
   * @param options Options d'optimisation
   * @returns Promise avec l'URL de la vidéo optimisée
   */
  public async optimizeVideo(
    file: File,
    options: VideoOptimizationOptions = {}
  ): Promise<string> {
    // Valider le fichier
    this.validateVideoFile(file);
    
    // Créer une clé de cache unique
    const cacheKey = this.createCacheKey(file, options);
    
    // Vérifier si la vidéo est déjà en cache
    const cachedUrl = cacheService.get<string>(cacheKey);
    if (cachedUrl) {
      console.log('Vidéo trouvée dans le cache:', cacheKey);
      return cachedUrl;
    }
    
    // Pour l'instant, nous ne faisons pas d'optimisation réelle de la vidéo
    // car cela nécessiterait des bibliothèques côté serveur
    // Nous créons simplement une URL d'objet pour le fichier
    const objectUrl = URL.createObjectURL(file);
    
    // Mettre en cache
    cacheService.set(
      cacheKey,
      objectUrl,
      file.size,
      CacheEntryType.OTHER,
      {
        filename: file.name,
        type: file.type
      }
    );
    
    return objectUrl;
  }

  /**
   * Générer une miniature pour une image ou une vidéo
   * @param file Fichier média
   * @param maxWidth Largeur maximale de la miniature
   * @param maxHeight Hauteur maximale de la miniature
   * @returns Promise avec l'URL de la miniature
   */
  public async generateThumbnail(
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 200
  ): Promise<string> {
    const isImage = MEDIA_CONFIG.SUPPORTED_IMAGE_FORMATS.includes(file.type);
    const isVideo = MEDIA_CONFIG.SUPPORTED_VIDEO_FORMATS.includes(file.type);
    
    if (!isImage && !isVideo) {
      throw {
        type: MediaErrorType.FORMAT_UNSUPPORTED,
        message: 'Format non supporté pour la génération de miniature'
      };
    }
    
    // Créer une clé de cache unique
    const cacheKey = `thumbnail:${file.name}-${file.size}-${file.lastModified}-${maxWidth}x${maxHeight}`;
    
    // Vérifier si la miniature est déjà en cache
    const cachedUrl = cacheService.get<string>(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }
    
    try {
      let thumbnailBlob: Blob;
      
      if (isImage) {
        // Générer une miniature pour l'image
        thumbnailBlob = await this.compressImage(file, {
          maxWidth,
          maxHeight,
          quality: 0.7,
          format: 'webp'
        });
      } else {
        // Générer une miniature pour la vidéo
        thumbnailBlob = await this.extractVideoThumbnail(file);
      }
      
      const objectUrl = URL.createObjectURL(thumbnailBlob);
      
      // Mettre en cache
      cacheService.set(
        cacheKey,
        objectUrl,
        thumbnailBlob.size,
        CacheEntryType.IMAGE,
        {
          filename: file.name,
          type: 'thumbnail'
        }
      );
      
      return objectUrl;
    } catch (error) {
      console.error('Erreur lors de la génération de la miniature:', error);
      throw {
        type: MediaErrorType.PROCESSING_ERROR,
        message: 'Échec de la génération de la miniature',
        details: error
      };
    }
  }

  /**
   * Valider un fichier image
   * @param file Fichier à valider
   */
  private validateImageFile(file: File): void {
    // Vérifier la taille
    if (file.size > MEDIA_CONFIG.MAX_FILE_SIZE) {
      throw {
        type: MediaErrorType.SIZE_EXCEEDED,
        message: `Fichier trop volumineux (max ${MEDIA_CONFIG.MAX_FILE_SIZE / (1024 * 1024)} MB)`
      };
    }
    
    // Vérifier le format
    if (!MEDIA_CONFIG.SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      throw {
        type: MediaErrorType.FORMAT_UNSUPPORTED,
        message: 'Format d\'image non supporté'
      };
    }
  }

  /**
   * Valider un fichier vidéo
   * @param file Fichier à valider
   */
  private validateVideoFile(file: File): void {
    // Vérifier la taille
    if (file.size > MEDIA_CONFIG.MAX_FILE_SIZE) {
      throw {
        type: MediaErrorType.SIZE_EXCEEDED,
        message: `Fichier trop volumineux (max ${MEDIA_CONFIG.MAX_FILE_SIZE / (1024 * 1024)} MB)`
      };
    }
    
    // Vérifier le format
    if (!MEDIA_CONFIG.SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      throw {
        type: MediaErrorType.FORMAT_UNSUPPORTED,
        message: 'Format vidéo non supporté'
      };
    }
  }

  /**
   * Créer une clé de cache unique pour un fichier
   * @param file Fichier
   * @param options Options d'optimisation
   * @returns Clé de cache
   */
  private createCacheKey(file: File, options: any): string {
    return `media:${file.name}-${file.size}-${file.lastModified}-${JSON.stringify(options)}`;
  }

  /**
   * Compresser une image
   * @param file Fichier image à compresser
   * @param options Options de compression
   * @returns Promise avec le blob de l'image compressée
   */
  private async compressImage(
    file: File,
    options: ImageOptimizationOptions
  ): Promise<Blob> {
    const {
      maxWidth = MEDIA_CONFIG.MAX_WIDTH,
      maxHeight = MEDIA_CONFIG.MAX_HEIGHT,
      quality = MEDIA_CONFIG.DEFAULT_QUALITY,
      format = MEDIA_CONFIG.DEFAULT_FORMAT,
      resizeMode = 'contain'
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
          reject({
            type: MediaErrorType.PROCESSING_ERROR,
            message: 'Impossible de créer le contexte 2D'
          });
          return;
        }

        // Appliquer le mode de redimensionnement
        if (resizeMode === 'cover') {
          const scale = Math.max(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (width - scaledWidth) / 2;
          const offsetY = (height - scaledHeight) / 2;
          
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else {
          // Mode 'contain' ou 'fill'
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Convertir en blob
        const mimeType = format === 'webp' ? 'image/webp' : 
                        format === 'png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject({
                type: MediaErrorType.PROCESSING_ERROR,
                message: 'Échec de la compression'
              });
              return;
            }
            resolve(blob);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject({
          type: MediaErrorType.PROCESSING_ERROR,
          message: 'Échec du chargement de l\'image'
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Extraire une miniature d'une vidéo
   * @param file Fichier vidéo
   * @returns Promise avec le blob de la miniature
   */
  private async extractVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Chercher un point à 25% de la durée pour la miniature
        video.currentTime = Math.min(video.duration * 0.25, 5);
      };
      
      video.onseeked = () => {
        // Créer un canvas pour capturer l'image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject({
            type: MediaErrorType.PROCESSING_ERROR,
            message: 'Impossible de créer le contexte 2D'
          });
          return;
        }
        
        // Dessiner l'image vidéo sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject({
                type: MediaErrorType.PROCESSING_ERROR,
                message: 'Échec de la génération de la miniature'
              });
              return;
            }
            
            // Libérer les ressources
            URL.revokeObjectURL(video.src);
            
            resolve(blob);
          },
          'image/webp',
          0.7
        );
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject({
          type: MediaErrorType.PROCESSING_ERROR,
          message: 'Échec du chargement de la vidéo'
        });
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Libérer les ressources associées à une URL d'objet
   * @param url URL d'objet à libérer
   */
  public revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Nettoyer le cache des médias
   */
  public clearMediaCache(): void {
    // Récupérer toutes les entrées de type IMAGE
    const stats = cacheService.getStats();
    console.log(`Nettoyage du cache des médias: ${stats.entriesByType[CacheEntryType.IMAGE]} entrées`);
    
    // Le nettoyage est géré par le CacheService
  }
}

// Export de l'instance singleton
export const mediaOptimizationService = MediaOptimizationService.getInstance();