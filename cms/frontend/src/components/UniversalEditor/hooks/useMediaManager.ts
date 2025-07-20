/**
 * Hook React pour utiliser le MediaManager
 */

import { useState, useCallback } from 'react';
import { mediaManager, MediaFile, UploadOptions, UploadProgress } from '../services/MediaManager';

export interface UseMediaManagerReturn {
  uploadFile: (file: File, options?: UploadOptions) => Promise<MediaFile>;
  uploadFiles: (files: FileList | File[], options?: UploadOptions) => Promise<MediaFile[]>;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  uploadError: string | null;
  clearError: () => void;
  getFromCache: (id: string) => MediaFile | undefined;
  removeFromCache: (id: string) => boolean;
  getCacheStats: () => ReturnType<typeof mediaManager.getCacheStats>;
}

export function useMediaManager(projectId?: string): UseMediaManagerReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, options: UploadOptions = {}) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(null);

    try {
      const mediaFile = await mediaManager.uploadFile(
        file,
        { ...options, projectId },
        (progress) => setUploadProgress(progress)
      );
      
      return mediaFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'upload';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [projectId]);

  const uploadFiles = useCallback(async (files: FileList | File[], options: UploadOptions = {}) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(null);

    try {
      const mediaFiles = await mediaManager.uploadFiles(
        files,
        { ...options, projectId },
        (fileIndex, progress) => {
          // Pour les uploads multiples, on peut afficher le progrès du fichier actuel
          setUploadProgress({
            ...progress,
            percentage: ((fileIndex / files.length) * 100) + (progress.percentage / files.length)
          });
        }
      );
      
      return mediaFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'upload';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [projectId]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const getFromCache = useCallback((id: string) => {
    return mediaManager.getFromCache(id);
  }, []);

  const removeFromCache = useCallback((id: string) => {
    return mediaManager.removeFromCache(id);
  }, []);

  const getCacheStats = useCallback(() => {
    return mediaManager.getCacheStats();
  }, []);

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    uploadProgress,
    uploadError,
    clearError,
    getFromCache,
    removeFromCache,
    getCacheStats,
  };
}