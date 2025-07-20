/**
 * NodeView React pour les grilles d'images
 * Permet l'édition interactive avec upload multiple et réorganisation
 */

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { ImageGridAttributes } from '../types';
import { SITE_CSS_CLASSES, SUPPORTED_IMAGE_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
    event.target.value = '';
  }, [handleImageUpload]);

  // Gestion du drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Supprimer une image
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateAttributes({ images: newImages });
  }, [images, updateAttributes]);

  // Changer l'alt text d'une image
  const handleAltChange = useCallback((index: number, newAlt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt: newAlt };
    updateAttributes({ images: newImages });
  }, [images, updateAttributes]);

  // Réorganiser les images (drag & drop) - TODO: implémenter
  // const handleImageReorder = useCallback((fromIndex: number, toIndex: number) => {
  //   const newImages = [...images];
  //   const [movedImage] = newImages.splice(fromIndex, 1);
  //   newImages.splice(toIndex, 0, movedImage);
  //   updateAttributes({ images: newImages });
  // }, [images, updateAttributes]);

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
        
        .add-image-slot {
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
        
        .add-image-slot:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .add-image-icon {
          font-size: 2rem;
          opacity: 0.5;
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
      `}</style>

      {/* Structure HTML du site */}
      <div className={SITE_CSS_CLASSES.section}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className={SITE_CSS_CLASSES.imageGrid}>
            <div className={SITE_CSS_CLASSES.gridContainer}>
              {(!images || images.length === 0) ? (
                <div
                  className="grid-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="placeholder-icon">⚏</div>
                  <div className="placeholder-text">
                    <div>Cliquez pour ajouter des images</div>
                    <div>ou glissez-déposez plusieurs fichiers ici</div>
                  </div>
                  <button
                    className="upload-button"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {isUploading ? 'Upload...' : 'Choisir des images'}
                  </button>
                </div>
              ) : (
                <>
                  {images.map((image, index) => (
                    <div key={index} className="grid-item">
                      <div className={SITE_CSS_CLASSES.imageWrapper}>
                        <img
                          className={SITE_CSS_CLASSES.image}
                          data-wf--template-image--variant="radius-16px"
                          src={image.src}
                          alt={image.alt || ''}
                          draggable={false}
                        />
                        
                        {/* Contrôles de l'item */}
                        <div className="item-controls">
                          <button
                            className="item-control-button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveImage(index);
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
                          value={image.alt || ''}
                          onChange={(e) => handleAltChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Slot pour ajouter plus d'images */}
                  {images.length < 4 && (
                    <div
                      className="add-image-slot"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="add-image-icon">+</div>
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
                fileInputRef.current?.click();
              }}
              title="Ajouter des images"
            >
              📁
            </button>
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_FORMATS.join(',')}
        onChange={handleFileSelect}
        multiple
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