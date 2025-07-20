/**
 * Gestionnaire centralisé pour tous les médias de l'éditeur universel
 * Gère l'upload, la compression, la validation et le cache
 */

import { SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants';

export interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  size: number;
  originalSize?: number;
  compressed?: boolean;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format: string;
  };
  uploadedAt: Date;
  projectId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  compress?: boolean;
  quality?: number; // 0-1 pour les images
  maxWidth?: number;
  maxHeight?: number;
  projectId?: string;
}

export class MediaManager {
  private static instance: MediaManager;
  private mediaCache = new Map<string, MediaFile>();
  private uploadQueue: Array<{ file: File; options: UploadOptions; resolve: Function; reject: Function }> = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): MediaManager {
    if (!MediaManager.instance) {
      MediaManager.instance = new MediaManager();
    }
    return MediaManager.instance;
  }

  /**
   * Valide un fichier média
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return { isValid: false, error: 'Format de fichier non supporté' };
    }

    if (isImage && !SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_IMAGE_FORMAT };
    }

    if (isVideo && !SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_VIDEO_FORMAT };
    }

    const maxSize = isImage ? FILE_SIZE_LIMITS.IMAGE : FILE_SIZE_LIMITS.VIDEO;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: isImage ? ERROR_MESSAGES.IMAGE_TOO_LARGE : ERROR_MESSAGES.VIDEO_TOO_LARGE 
      };
    }

    return { isValid: true };
  }

  /**
   * Compresse une image
   */
  private async compressImage(file: File, options: UploadOptions): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          options.quality || 0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Obtient les métadonnées d'un fichier
   */
  private async getFileMetadata(file: File): Promise<MediaFile['metadata']> {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (isImage) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            format: file.type,
          });
        };
        img.onerror = () => resolve({ format: file.type });
        img.src = URL.createObjectURL(file);
      });
    }

    if (isVideo) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            format: file.type,
          });
        };
        video.onerror = () => resolve({ format: file.type });
        video.src = URL.createObjectURL(file);
      });
    }

    return { format: file.type };
  }

  /**
   * Upload un fichier avec options
   */
  async uploadFile(
    file: File, 
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaFile> {
    // Validation
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Vérifier le cache
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (this.mediaCache.has(cacheKey)) {
      return this.mediaCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      this.uploadQueue.push({ file, options, resolve, reject });
      this.processQueue(onProgress);
    });
  }

  /**
   * Traite la queue d'upload
   */
  private async processQueue(onProgress?: (progress: UploadProgress) => void) {
    if (this.isProcessing || this.uploadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.uploadQueue.length > 0) {
      const { file, options, resolve, reject } = this.uploadQueue.shift()!;

      try {
        let processedFile = file;
        let compressed = false;

        // Compression pour les images
        if (file.type.startsWith('image/') && options.compress !== false) {
          processedFile = await this.compressImage(file, options);
          compressed = processedFile.size < file.size;
        }

        // Simulation de l'upload avec progression
        const totalSteps = 10;
        for (let i = 0; i <= totalSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          if (onProgress) {
            onProgress({
              loaded: (i / totalSteps) * processedFile.size,
              total: processedFile.size,
              percentage: (i / totalSteps) * 100
            });
          }
        }

        // Créer l'URL temporaire (en production, ce serait l'URL du serveur)
        const url = URL.createObjectURL(processedFile);
        
        // Obtenir les métadonnées
        const metadata = await this.getFileMetadata(processedFile);

        // Créer l'objet MediaFile
        const mediaFile: MediaFile = {
          id: this.generateId(),
          file: processedFile,
          url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: processedFile.size,
          originalSize: compressed ? file.size : undefined,
          compressed,
          metadata,
          uploadedAt: new Date(),
          projectId: options.projectId,
        };

        // Mettre en cache
        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        this.mediaCache.set(cacheKey, mediaFile);

        resolve(mediaFile);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Upload multiple de fichiers
   */
  async uploadFiles(
    files: FileList | File[], 
    options: UploadOptions = {},
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<MediaFile[]> {
    const fileArray = Array.from(files);
    const results: MediaFile[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const mediaFile = await this.uploadFile(
          file, 
          options, 
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        results.push(mediaFile);
      } catch (error) {
        console.error(`Erreur upload fichier ${file.name}:`, error);
        // Continuer avec les autres fichiers
      }
    }

    return results;
  }

  /**
   * Obtient un fichier du cache
   */
  getFromCache(id: string): MediaFile | undefined {
    for (const mediaFile of this.mediaCache.values()) {
      if (mediaFile.id === id) {
        return mediaFile;
      }
    }
    return undefined;
  }

  /**
   * Obtient tous les fichiers d'un projet
   */
  getProjectFiles(projectId: string): MediaFile[] {
    return Array.from(this.mediaCache.values()).filter(
      file => file.projectId === projectId
    );
  }

  /**
   * Supprime un fichier du cache
   */
  removeFromCache(id: string): boolean {
    for (const [key, mediaFile] of this.mediaCache.entries()) {
      if (mediaFile.id === id) {
        // Libérer l'URL
        URL.revokeObjectURL(mediaFile.url);
        this.mediaCache.delete(key);
        return true;
      }
    }
    return false;
  }

  /**
   * Nettoie le cache (libère les URLs)
   */
  clearCache(projectId?: string): void {
    for (const [key, mediaFile] of this.mediaCache.entries()) {
      if (!projectId || mediaFile.projectId === projectId) {
        URL.revokeObjectURL(mediaFile.url);
        this.mediaCache.delete(key);
      }
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): {
    totalFiles: number;
    totalSize: number;
    imageCount: number;
    videoCount: number;
    compressedCount: number;
  } {
    const files = Array.from(this.mediaCache.values());
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      imageCount: files.filter(f => f.type === 'image').length,
      videoCount: files.filter(f => f.type === 'video').length,
      compressedCount: files.filter(f => f.compressed).length,
    };
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export de l'instance singleton
export const mediaManager = MediaManager.getInstance();