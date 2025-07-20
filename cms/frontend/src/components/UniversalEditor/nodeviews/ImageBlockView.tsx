/**
 * NodeView React pour les blocs d'images universelles
 * Permet l'édition interactive avec upload et contrôles
 */

import React, { useState, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { ImageAttributes } from '../types';
import { SITE_CSS_CLASSES } from '../constants';
import { useMediaManager } from '../hooks/useMediaManager';
import { MediaUploader } from '../components/MediaUploader';

interface ImageBlockViewProps {
  node: {
    attrs: ImageAttributes;
  };
  updateAttributes: (attrs: Partial<ImageAttributes>) => void;
  selected: boolean;
}

export function ImageBlockView({ node, updateAttributes, selected }: ImageBlockViewProps) {
  const [showControls, setShowControls] = useState(false);
  const [variantChanged, setVariantChanged] = useState(false);
  const [sizeChanged, setSizeChanged] = useState(false);
  const { isUploading } = useMediaManager();

  const { src, alt, variant, size = 'medium' } = node.attrs;

  // Effet visuel temporaire quand le variant ou la taille change
  React.useEffect(() => {
    if (variantChanged) {
      const timer = setTimeout(() => setVariantChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [variantChanged]);
  
  React.useEffect(() => {
    if (sizeChanged) {
      const timer = setTimeout(() => setSizeChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [sizeChanged]);

  // Gestion de l'upload d'image avec MediaManager
  const handleImageUpload = useCallback(async (mediaFiles: any[]) => {
    if (mediaFiles.length > 0) {
      const mediaFile = mediaFiles[0];
      updateAttributes({
        src: mediaFile.url,
        alt: alt || mediaFile.file.name.replace(/\.[^/.]+$/, '')
      });
    }
  }, [updateAttributes, alt]);



  // Gestion du changement de variant
  const handleVariantChange = useCallback((event: React.MouseEvent, newVariant: 'full' | '16-9' | 'auto') => {
    event.preventDefault();
    event.stopPropagation();
    updateAttributes({ variant: newVariant });
    setVariantChanged(true);
  }, [updateAttributes, variant]);
  
  // Gestion du changement de taille
  const handleSizeChange = useCallback((event: React.MouseEvent, newSize: 'small' | 'medium' | 'large') => {
    event.preventDefault();
    event.stopPropagation();
    updateAttributes({ size: newSize });
    setSizeChanged(true);
  }, [updateAttributes]);

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
          flex-direction: column;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }
        
        .control-group {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 2px;
        }
        
        .control-label {
          color: white;
          font-size: 10px;
          opacity: 0.8;
          margin-right: 4px;
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
        
        .variant-changed,
        .size-changed {
          animation: pulse 1s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        /* Styles pour les différentes tailles d'images */
        .universal-image-block .section[data-size="small"] .temp-img_container {
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .universal-image-block .section[data-size="medium"] .temp-img_container {
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .universal-image-block .section[data-size="large"] .temp-img_container {
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>

      {/* Indicateur de variant et taille */}
      <div className="variant-indicator">
        {variant === '16-9' ? '16:9' : variant === 'full' ? 'Pleine largeur' : 'Auto'}
        {variant !== 'full' && size !== 'medium' && ` • ${size === 'small' ? 'Petite' : 'Grande'}`}
      </div>

      {/* Structure HTML du site */}
      <div 
        className={`${SITE_CSS_CLASSES.section} ${variantChanged ? 'variant-changed' : ''} ${sizeChanged ? 'size-changed' : ''}`} 
        data-wf--template-section-image--variant={variant}
        data-size={size}>
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
                  <MediaUploader
                    accept="image"
                    onUpload={handleImageUpload}
                    options={{ compress: true, quality: 0.8, maxWidth: 1920, maxHeight: 1080 }}
                    className="image-placeholder"
                  >
                    <div className="placeholder-icon">🖼️</div>
                    <div className="placeholder-text">
                      <div>Cliquez pour ajouter une image</div>
                      <div>ou glissez-déposez un fichier ici</div>
                    </div>
                    <button className="upload-button">
                      Choisir une image
                    </button>
                  </MediaUploader>
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
            <div className="control-group">
              <span className="control-label">Format:</span>
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
            </div>
            
            {variant !== 'full' && (
              <div className="control-group">
                <span className="control-label">Taille:</span>
                <button
                  className={`control-button ${size === 'small' ? 'active' : ''}`}
                  onClick={(e) => handleSizeChange(e, 'small')}
                  title="Petite taille"
                >
                  S
                </button>
                <button
                  className={`control-button ${size === 'medium' ? 'active' : ''}`}
                  onClick={(e) => handleSizeChange(e, 'medium')}
                  title="Taille moyenne"
                >
                  M
                </button>
                <button
                  className={`control-button ${size === 'large' ? 'active' : ''}`}
                  onClick={(e) => handleSizeChange(e, 'large')}
                  title="Grande taille"
                >
                  L
                </button>
              </div>
            )}
            
            <div className="control-group">
              <MediaUploader
                accept="image"
                onUpload={handleImageUpload}
                options={{ compress: true, quality: 0.8 }}
                className="control-button"
              >
                📁
              </MediaUploader>
            </div>
          </div>
        )}
      </div>


    </NodeViewWrapper>
  );
}