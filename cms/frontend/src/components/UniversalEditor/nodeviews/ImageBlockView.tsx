/**
 * NodeView React pour les blocs d'images universelles
 * Permet l'édition interactive avec upload et contrôles
 */

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { ImageAttributes } from '../types';
import { SITE_CSS_CLASSES, IMAGE_VARIANTS, SUPPORTED_IMAGE_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants';

interface ImageBlockViewProps extends NodeViewProps {
  node: {
    attrs: ImageAttributes;
  };
}

export function ImageBlockView({ node, updateAttributes, selected }: ImageBlockViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [variantChanged, setVariantChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { src, alt, variant, size } = node.attrs;

  // Effet visuel temporaire quand le variant change
  React.useEffect(() => {
    if (variantChanged) {
      const timer = setTimeout(() => setVariantChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [variantChanged]);

  // Gestion de l'upload d'image
  const handleImageUpload = useCallback(async (file: File) => {
    // Validation du fichier
    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      setUploadError(ERROR_MESSAGES.UNSUPPORTED_IMAGE_FORMAT);
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.IMAGE) {
      setUploadError(ERROR_MESSAGES.IMAGE_TOO_LARGE);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Créer une URL temporaire pour l'aperçu
      const imageUrl = URL.createObjectURL(file);
      
      // TODO: Implémenter l'upload vers le serveur
      // const uploadedUrl = await uploadImageToServer(file);
      
      // Pour l'instant, utiliser l'URL temporaire
      updateAttributes({
        src: imageUrl,
        alt: alt || file.name.replace(/\.[^/.]+$/, '')
      });

    } catch (error) {
      console.error('Erreur upload image:', error);
      setUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  }, [updateAttributes, alt]);

  // Gestion du clic sur l'input file
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  }, [handleImageUpload]);

  // Gestion du drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Gestion du changement de variant
  const handleVariantChange = useCallback((event: React.MouseEvent, newVariant: string) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Changing variant from', variant, 'to:', newVariant); // Debug
    updateAttributes({ variant: newVariant });
    setVariantChanged(true);
  }, [updateAttributes, variant]);

  // Gestion du changement d'alt text
  const handleAltChange = useCallback((newAlt: string) => {
    updateAttributes({ alt: newAlt });
  }, [updateAttributes]);

  // Classes CSS selon le variant
  const getImageClasses = () => {
    const baseClass = 'temp-img';
    if (variant === '16-9') {
      return baseClass;
    }
    return `${baseClass} w-variant-e18145a5-28b8-affd-e283-83a4aa5ff6de`;
  };

  return (
    <NodeViewWrapper
      className={`universal-image-block ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Styles locaux */}
      <style>{`
        .universal-image-block {
          position: relative;
          margin: 1rem 0;
        }
        
        .universal-image-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .image-controls {
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
        
        .universal-image-block:hover .image-controls,
        .universal-image-block.selected .image-controls {
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
        
        .control-button.active {
          background: #3b82f6;
        }
        
        .image-placeholder {
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
        
        .image-placeholder:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .image-placeholder.drag-over {
          border-color: #3b82f6;
          background: #dbeafe;
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
        
        .upload-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
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
        
        .alt-input {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .universal-image-block:hover .alt-input,
        .universal-image-block.selected .alt-input {
          opacity: 1;
        }
        
        .alt-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* Styles critiques pour les variants d'images */
        .universal-image-block .section[data-wf--template-section-image--variant="16-9"] .temp-img {
          aspect-ratio: 16 / 9 !important;
        }
        
        .universal-image-block .section[data-wf--template-section-image--variant="16-9"] .comp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .universal-image-block .section[data-wf--template-section-image--variant="full"] .temp-img_container {
          margin-left: -2rem;
          margin-right: -2rem;
        }
        
        .universal-image-block .section[data-wf--template-section-image--variant="full"] .temp-img {
          border-radius: 0;
        }
        
        .universal-image-block .section[data-wf--template-section-image--variant="auto"] .temp-img {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .variant-indicator {
          position: absolute;
          top: -8px;
          left: 8px;
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 15;
        }
        
        .universal-image-block:hover .variant-indicator,
        .universal-image-block.selected .variant-indicator {
          opacity: 1;
        }
        
        .variant-changed {
          animation: pulse 1s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>

      {/* Indicateur de variant */}
      <div className="variant-indicator">
        {variant === '16-9' ? '16:9' : variant === 'full' ? 'Pleine largeur' : 'Auto'}
      </div>

      {/* Structure HTML du site */}
      <div className={`${SITE_CSS_CLASSES.section} ${variantChanged ? 'variant-changed' : ''}`} data-wf--template-section-image--variant={variant}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className={SITE_CSS_CLASSES.imageContainer}>
            <div className={getImageClasses()}>
              <div className={SITE_CSS_CLASSES.imageWrapper}>
                {src ? (
                  <>
                    <img
                      className={SITE_CSS_CLASSES.image}
                      data-wf--template-image--variant="radius-16px"
                      src={src}
                      alt={alt || ''}
                      draggable={false}
                    />
                    
                    {/* Input pour l'alt text */}
                    <input
                      type="text"
                      className="alt-input"
                      placeholder="Texte alternatif..."
                      value={alt || ''}
                      onChange={(e) => handleAltChange(e.target.value)}
                    />
                  </>
                ) : (
                  <div
                    className="image-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <div className="placeholder-icon">🖼️</div>
                    <div className="placeholder-text">
                      <div>Cliquez pour ajouter une image</div>
                      <div>ou glissez-déposez un fichier ici</div>
                    </div>
                    <button
                      className="upload-button"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      {isUploading ? 'Upload...' : 'Choisir une image'}
                    </button>
                  </div>
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
        </div>

        {/* Contrôles d'édition */}
        {(showControls || selected) && (
          <div className="image-controls">
            <button
              className={`control-button ${variant === 'auto' ? 'active' : ''}`}
              onClick={(e) => handleVariantChange(e, 'auto')}
              title="Image standard"
            >
              Auto
            </button>
            <button
              className={`control-button ${variant === '16-9' ? 'active' : ''}`}
              onClick={(e) => handleVariantChange(e, '16-9')}
              title="Image 16:9"
            >
              16:9
            </button>
            <button
              className={`control-button ${variant === 'full' ? 'active' : ''}`}
              onClick={(e) => handleVariantChange(e, 'full')}
              title="Pleine largeur"
            >
              Full
            </button>
            <button
              className="control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              title="Changer l'image"
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