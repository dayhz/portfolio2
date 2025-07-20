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
    console.log('MediaManager: compressImage called with', { fileName: file.name, fileType: file.type, fileSize: file.size, options });
    
    return new Promise((resolve) => {
      try {
        // Créer une URL pour l'image
        const objectUrl = URL.createObjectURL(file);
        console.log('MediaManager: Object URL created for compression', objectUrl);
        
        const img = new Image();
        
        img.onload = () => {
          try {
            console.log('MediaManager: Image loaded for compression, dimensions:', { width: img.width, height: img.height });
            
            // Calculer les nouvelles dimensions
            let { width, height } = img;
            const maxWidth = options.maxWidth || 1920;
            const maxHeight = options.maxHeight || 1080;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
              console.log('MediaManager: Image resized to', { width, height });
            } else {
              console.log('MediaManager: No resize needed, dimensions within limits');
            }

            // Créer un canvas pour la compression
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('MediaManager: Failed to get 2D context');
              URL.revokeObjectURL(objectUrl);
              resolve(file); // Retourner le fichier original en cas d'erreur
              return;
            }

            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, width, height);
            console.log('MediaManager: Image drawn on canvas');

            // Convertir en blob avec compression
            if (canvas.toBlob) {
              console.log('MediaManager: Using canvas.toBlob for compression');
              canvas.toBlob(
                (blob) => {
                  // Libérer l'URL
                  URL.revokeObjectURL(objectUrl);
                  
                  if (blob) {
                    console.log('MediaManager: Blob created successfully', { blobSize: blob.size });
                    try {
                      const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                      });
                      console.log('MediaManager: Compressed file created', { fileSize: compressedFile.size });
                      resolve(compressedFile);
                    } catch (err) {
                      console.error('MediaManager: Error creating File from blob', err);
                      resolve(file);
                    }
                  } else {
                    console.warn('MediaManager: Blob creation failed, using original file');
                    resolve(file);
                  }
                },
                file.type,
                options.quality || 0.8
              );
            } else {
              // Fallback si toBlob n'est pas disponible
              console.log('MediaManager: canvas.toBlob not available, using toDataURL fallback');
              try {
                const dataUrl = canvas.toDataURL(file.type, options.quality || 0.8);
                const byteString = atob(dataUrl.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                
                const blob = new Blob([ab], { type: file.type });
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                
                // Libérer l'URL
                URL.revokeObjectURL(objectUrl);
                
                console.log('MediaManager: Compressed file created with fallback method', { fileSize: compressedFile.size });
                resolve(compressedFile);
              } catch (err) {
                console.error('MediaManager: Error in fallback compression', err);
                URL.revokeObjectURL(objectUrl);
                resolve(file);
              }
            }
          } catch (err) {
            console.error('MediaManager: Error in image onload handler', err);
            URL.revokeObjectURL(objectUrl);
            resolve(file);
          }
        };
        
        img.onerror = (err) => {
          console.error('MediaManager: Error loading image for compression', err);
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        };
        
        img.src = objectUrl;
      } catch (err) {
        console.error('MediaManager: Unexpected error in compressImage', err);
        resolve(file);
      }
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
    console.log('MediaManager: uploadFile called with', { fileName: file.name, fileType: file.type, fileSize: file.size, options });
    
    // Validation
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      console.error('MediaManager: File validation failed', validation.error);
      throw new Error(validation.error);
    }

    // Vérifier le cache
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (this.mediaCache.has(cacheKey)) {
      console.log('MediaManager: File found in cache, returning cached version');
      return this.mediaCache.get(cacheKey)!;
    }

    console.log('MediaManager: Adding file to upload queue');
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({ file, options, resolve, reject });
      this.processQueue(onProgress);
    });
  }

  /**
   * Traite la queue d'upload
   */
  private async processQueue(onProgress?: (progress: UploadProgress) => void) {
    console.log('MediaManager: processQueue called, queue length:', this.uploadQueue.length, 'isProcessing:', this.isProcessing);
    
    if (this.isProcessing || this.uploadQueue.length === 0) return;

    this.isProcessing = true;
    console.log('MediaManager: Starting to process queue');

    while (this.uploadQueue.length > 0) {
      const { file, options, resolve, reject } = this.uploadQueue.shift()!;
      console.log('MediaManager: Processing file from queue:', file.name);

      try {
        let processedFile = file;
        let compressed = false;

        // Compression pour les images
        if (file.type.startsWith('image/') && options.compress !== false) {
          console.log('MediaManager: Compressing image');
          try {
            processedFile = await this.compressImage(file, options);
            compressed = processedFile.size < file.size;
            console.log('MediaManager: Image compressed', { 
              originalSize: file.size, 
              compressedSize: processedFile.size, 
              compressionRatio: compressed ? (file.size / processedFile.size).toFixed(2) : '1.00'
            });
          } catch (err) {
            console.error('MediaManager: Error compressing image, using original', err);
            processedFile = file;
            compressed = false;
          }
        }

        // Simulation de l'upload avec progression
        console.log('MediaManager: Simulating upload with progress');
        const totalSteps = 10;
        for (let i = 0; i <= totalSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          if (onProgress) {
            const progress = {
              loaded: (i / totalSteps) * processedFile.size,
              total: processedFile.size,
              percentage: (i / totalSteps) * 100
            };
            onProgress(progress);
            console.log('MediaManager: Upload progress', progress.percentage.toFixed(0) + '%');
          }
        }

        // Créer l'URL temporaire (en production, ce serait l'URL du serveur)
        console.log('MediaManager: Creating object URL');
        const url = URL.createObjectURL(processedFile);
        console.log('MediaManager: Object URL created', url);
        
        // Obtenir les métadonnées
        console.log('MediaManager: Getting file metadata');
        const metadata = await this.getFileMetadata(processedFile);
        console.log('MediaManager: File metadata', metadata);

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
        console.log('MediaManager: MediaFile object created', mediaFile);

        // Mettre en cache
        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        this.mediaCache.set(cacheKey, mediaFile);
        console.log('MediaManager: File added to cache with key', cacheKey);

        console.log('MediaManager: Resolving promise with mediaFile');
        resolve(mediaFile);
      } catch (error) {
        console.error('MediaManager: Error processing file', error);
        reject(error);
      }
    }

    console.log('MediaManager: Queue processing complete');
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