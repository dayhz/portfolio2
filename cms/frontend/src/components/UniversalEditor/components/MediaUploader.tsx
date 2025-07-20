/**
 * Composant d'upload universel pour tous les types de médias
 */

import React, { useCallback, useState } from 'react';
import { useMediaManager } from '../hooks/useMediaManager';
import { MediaFile, UploadOptions } from '../services/MediaManager';

interface MediaUploaderProps {
  accept?: 'image' | 'video' | 'all';
  multiple?: boolean;
  onUpload?: (files: MediaFile[]) => void;
  onError?: (error: string) => void;
  options?: UploadOptions;
  className?: string;
  children?: React.ReactNode;
  projectId?: string;
}

export function MediaUploader({
  accept = 'all',
  multiple = false,
  onUpload,
  onError,
  options = {},
  className = '',
  children,
  projectId
}: MediaUploaderProps) {
  const { uploadFile, uploadFiles, isUploading, uploadProgress, uploadError, clearError } = useMediaManager(projectId);
  const [isDragOver, setIsDragOver] = useState(false);

  // Déterminer les types de fichiers acceptés
  const getAcceptString = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      default:
        return 'image/*,video/*';
    }
  };

  // Gestion de l'upload
  const handleUpload = useCallback(async (files: FileList | File[]) => {
    console.log('MediaUploader: handleUpload called with', files);
    try {
      clearError();
      const fileArray = Array.from(files);
      
      if (fileArray.length === 0) {
        console.warn('MediaUploader: No files to upload');
        return;
      }

      let mediaFiles: MediaFile[];
      
      if (fileArray.length === 1) {
        console.log('MediaUploader: Uploading single file', fileArray[0]);
        const mediaFile = await uploadFile(fileArray[0], options);
        console.log('MediaUploader: Single file uploaded successfully', mediaFile);
        mediaFiles = [mediaFile];
      } else {
        console.log('MediaUploader: Uploading multiple files', fileArray);
        mediaFiles = await uploadFiles(files, options);
        console.log('MediaUploader: Multiple files uploaded successfully', mediaFiles);
      }

      if (onUpload) {
        console.log('MediaUploader: Calling onUpload callback with', mediaFiles);
        onUpload(mediaFiles);
      } else {
        console.warn('MediaUploader: No onUpload callback provided');
      }
    } catch (error) {
      console.error('MediaUploader: Upload error', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'upload';
      onError?.(errorMessage);
    }
  }, [uploadFile, uploadFiles, options, onUpload, onError, clearError]);

  // Gestion du drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  // Gestion du clic
  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = getAcceptString();
    input.multiple = multiple;
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        handleUpload(files);
      }
    };
    
    input.click();
  }, [multiple, handleUpload]);

  return (
    <div
      className={`media-uploader ${className} ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <style>{`
        .media-uploader {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .media-uploader.drag-over {
          transform: scale(1.02);
        }
        
        .media-uploader.uploading {
          pointer-events: none;
        }
        
        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10;
        }
        
        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(220, 38, 38, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10;
          padding: 16px;
          text-align: center;
        }
        
        .error-dismiss {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          margin-top: 8px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .error-dismiss:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {children}

      {/* Overlay de chargement */}
      {isUploading && (
        <div className="upload-overlay">
          <div>Upload en cours...</div>
          {uploadProgress && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          )}
          {uploadProgress && (
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Math.round(uploadProgress.percentage)}%
            </div>
          )}
        </div>
      )}

      {/* Overlay d'erreur */}
      {uploadError && (
        <div className="error-overlay">
          <div>{uploadError}</div>
          <button className="error-dismiss" onClick={(e) => {
            e.stopPropagation();
            clearError();
          }}>
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}