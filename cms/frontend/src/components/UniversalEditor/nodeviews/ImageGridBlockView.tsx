/**
 * NodeView React pour les grilles d'images et vidéos
 * Permet l'édition interactive avec upload multiple et réorganisation
 */

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { ImageGridAttributes } from '../types';
import { 
  SITE_CSS_CLASSES, 
  SUPPORTED_IMAGE_FORMATS, 
  SUPPORTED_VIDEO_FORMATS,
  FILE_SIZE_LIMITS, 
  ERROR_MESSAGES 
} from '../constants';

interface ImageGridBlockViewProps {
  node: {
    attrs: ImageGridAttributes;
  };
  updateAttributes: (attrs: Partial<ImageGridAttributes>) => void;
  selected: boolean;
}

export function ImageGridBlockView({ node, updateAttributes, selected }: ImageGridBlockViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const { images } = node.attrs;

  // Gestion de l'upload d'images multiples
  const handleImageUpload = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        setUploadError(ERROR_MESSAGES.UNSUPPORTED_IMAGE_FORMAT);
        return false;
      }
      if (file.size > FILE_SIZE_LIMITS.IMAGE) {
        setUploadError(ERROR_MESSAGES.IMAGE_TOO_LARGE);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const imageUrl = URL.createObjectURL(file);
          return {
            src: imageUrl,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            hasVideo: false
          };
        })
      );

      updateAttributes({
        images: [...(images || []), ...newImages]
      });

    } catch (error) {
      console.error('Erreur upload images:', error);
      setUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  }, [updateAttributes, images]);

  // Gestion de l'upload de vidéos
  const handleVideoUpload = useCallback(async (file: File) => {
    // Validation du fichier
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      setUploadError(ERROR_MESSAGES.UNSUPPORTED_VIDEO_FORMAT);
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.VIDEO) {
      setUploadError(ERROR_MESSAGES.VIDEO_TOO_LARGE);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Créer une URL temporaire pour l'aperçu
      const videoUrl = URL.createObjectURL(file);
      
      const newItem = {
        src: '', // Placeholder pour la miniature
        alt: file.name.replace(/\.[^/.]+$/, ''),
        hasVideo: true,
        videoSrc: videoUrl
      };

      updateAttributes({
        images: [...(images || []), newItem]
      });

    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      setUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  }, [updateAttributes, images]);

  // Gestion du clic sur l'input file pour les images
  const handleImageFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
    event.target.value = '';
  }, [handleImageUpload]);

  // Gestion du clic sur l'input file pour les vidéos
  const handleVideoFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
    event.target.value = '';
  }, [handleVideoUpload]);

  // Gestion du drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    if (files.length === 0) return;
    
    // Séparer les fichiers d'images et de vidéos
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      if (SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        imageFiles.push(file);
      } else if (SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
        videoFiles.push(file);
      }
    });
    
    // Traiter les images
    if (imageFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));
      handleImageUpload(dataTransfer.files);
    }
    
    // Traiter la première vidéo (s'il y en a)
    if (videoFiles.length > 0) {
      handleVideoUpload(videoFiles[0]);
    }
  }, [handleImageUpload, handleVideoUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Supprimer un élément (image ou vidéo)
  const handleRemoveItem = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateAttributes({ images: newImages });
  }, [images, updateAttributes]);

  // Changer l'alt text d'un élément
  const handleAltChange = useCallback((index: number, newAlt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt: newAlt };
    updateAttributes({ images: newImages });
  }, [images, updateAttributes]);

  // Réorganiser les éléments par drag & drop
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Supprimer l'élément de sa position actuelle
    newImages.splice(draggedIndex, 1);
    // L'insérer à la nouvelle position
    newImages.splice(index, 0, draggedItem);
    
    updateAttributes({ images: newImages });
    setDraggedIndex(index);
  }, [draggedIndex, images, updateAttributes]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Convertir une vidéo en image (capture d'écran)
  const handleConvertToImage = useCallback((index: number) => {
    const item = images[index];
    if (!item.hasVideo || !item.videoSrc) return;

    // Créer un élément vidéo temporaire
    const video = document.createElement('video');
    video.src = item.videoSrc;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    
    // Attendre que la vidéo soit chargée
    video.onloadeddata = () => {
      // Avancer à 1 seconde ou au milieu si la vidéo est courte
      video.currentTime = Math.min(1, video.duration / 2);
      
      video.onseeked = () => {
        // Créer un canvas pour capturer l'image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Dessiner la frame actuelle sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir en URL de données
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        
        // Mettre à jour l'élément
        const newImages = [...images];
        newImages[index] = {
          ...item,
          src: thumbnailUrl
        };
        
        updateAttributes({ images: newImages });
      };
    };
    
    // Déclencher le chargement
    video.load();
  }, [images, updateAttributes]);

  // Convertir une image en vidéo (ajouter un emplacement pour une vidéo)
  const handleAddVideo = useCallback(() => {
    videoFileInputRef.current?.click();
  }, []);

  return (
    <NodeViewWrapper
      className={`universal-image-grid-block ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Styles locaux */}
      <style>{`
        .universal-image-grid-block {
          position: relative;
          margin: 1rem 0;
        }
        
        .universal-image-grid-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .grid-controls {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 6px;
          padding: 4px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }
        
        .universal-image-grid-block:hover .grid-controls,
        .universal-image-grid-block.selected .grid-controls {
          opacity: 1;
        }
        
        .control-button {
          background: transparent;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .control-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .grid-placeholder {
          min-height: 200px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f9fafb;
        }
        
        .grid-placeholder:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .placeholder-icon {
          font-size: 3rem;
          opacity: 0.5;
        }
        
        .placeholder-text {
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
        
        .upload-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .upload-button:hover {
          background: #2563eb;
        }
        
        .grid-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          cursor: grab;
        }
        
        .grid-item:active {
          cursor: grabbing;
        }
        
        .grid-item:hover .item-controls {
          opacity: 1;
        }
        
        .item-controls {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 5;
        }
        
        .item-control-button {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          padding: 4px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .item-control-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        
        .alt-input {
          position: absolute;
          bottom: 4px;
          left: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 11px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 5;
        }
        
        .grid-item:hover .alt-input {
          opacity: 1;
        }
        
        .alt-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
          text-align: center;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          z-index: 5;
        }
        
        .add-item-slot {
          min-height: 150px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f9fafb;
        }
        
        .add-item-slot:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .add-item-icon {
          font-size: 2rem;
          opacity: 0.5;
        }
        
        .add-options {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 20;
        }
        
        .option-button {
          background: #f3f4f6;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s ease;
        }
        
        .option-button:hover {
          background: #e5e7eb;
        }
        
        .video-indicator {
          position: absolute;
          top: 4px;
          left: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          z-index: 5;
        }
        
        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Styles critiques pour la grille */
        .universal-image-grid-block .img_grid-container {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 2rem !important;
        }
        
        .universal-image-grid-block .grid-item .img-wrp {
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border-radius: 16px;
        }
        
        .universal-image-grid-block .grid-item .comp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .dragging {
          opacity: 0.5;
        }
        
        .drag-over {
          box-shadow: 0 0 0 2px #3b82f6;
        }
      `}</style>

      {/* Structure HTML du site */}
      <div className={SITE_CSS_CLASSES.section}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className={SITE_CSS_CLASSES.imageGrid}>
            <div className={SITE_CSS_CLASSES.gridContainer}>
              {(!images || images.length === 0) ? (
                <div
                  className="grid-placeholder"
                  onClick={() => imageFileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="placeholder-icon">⚏</div>
                  <div className="placeholder-text">
                    <div>Cliquez pour ajouter des images</div>
                    <div>ou glissez-déposez plusieurs fichiers ici</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="upload-button"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        imageFileInputRef.current?.click();
                      }}
                    >
                      {isUploading ? 'Upload...' : 'Choisir des images'}
                    </button>
                    <button
                      className="upload-button"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        videoFileInputRef.current?.click();
                      }}
                    >
                      {isUploading ? 'Upload...' : 'Ajouter une vidéo'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {images.map((item, index) => (
                    <div 
                      key={index} 
                      className={`grid-item ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={handleDragEnd}
                    >
                      <div className={SITE_CSS_CLASSES.imageWrapper}>
                        {item.hasVideo && item.videoSrc ? (
                          <>
                            <video
                              className="video-element"
                              src={item.videoSrc}
                              controls
                              muted
                              preload="metadata"
                            />
                            <div className="video-indicator">VIDEO</div>
                          </>
                        ) : (
                          <img
                            className={SITE_CSS_CLASSES.image}
                            data-wf--template-image--variant="radius-16px"
                            src={item.src}
                            alt={item.alt || ''}
                            draggable={false}
                          />
                        )}
                        
                        {/* Contrôles de l'item */}
                        <div className="item-controls">
                          {item.hasVideo && (
                            <button
                              className="item-control-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleConvertToImage(index);
                              }}
                              title="Capturer une miniature"
                            >
                              📷
                            </button>
                          )}
                          <button
                            className="item-control-button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveItem(index);
                            }}
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Input pour l'alt text */}
                        <input
                          type="text"
                          className="alt-input"
                          placeholder="Alt text..."
                          value={item.alt || ''}
                          onChange={(e) => handleAltChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Slot pour ajouter plus d'éléments */}
                  {images.length < 4 && (
                    <div className="add-item-slot">
                      <div className="flex flex-col items-center gap-2">
                        <div className="add-item-icon">+</div>
                        <div className="flex gap-2">
                          <button
                            className="upload-button"
                            onClick={() => imageFileInputRef.current?.click()}
                          >
                            Image
                          </button>
                          <button
                            className="upload-button"
                            onClick={() => videoFileInputRef.current?.click()}
                          >
                            Vidéo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Overlay de chargement */}
              {isUploading && (
                <div className="loading-overlay">
                  <div>Upload en cours...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contrôles d'édition */}
        {(showControls || selected) && (
          <div className="grid-controls">
            <button
              className="control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                imageFileInputRef.current?.click();
              }}
              title="Ajouter des images"
            >
              📷
            </button>
            <button
              className="control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                videoFileInputRef.current?.click();
              }}
              title="Ajouter une vidéo"
            >
              🎥
            </button>
          </div>
        )}
      </div>

      {/* Input file caché pour les images */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_FORMATS.join(',')}
        onChange={handleImageFileSelect}
        multiple
        style={{ display: 'none' }}
      />

      {/* Input file caché pour les vidéos */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept={SUPPORTED_VIDEO_FORMATS.join(',')}
        onChange={handleVideoFileSelect}
        style={{ display: 'none' }}
      />

      {/* Message d'erreur */}
      {uploadError && (
        <div className="error-message">
          {uploadError}
        </div>
      )}
    </NodeViewWrapper>
  );
}