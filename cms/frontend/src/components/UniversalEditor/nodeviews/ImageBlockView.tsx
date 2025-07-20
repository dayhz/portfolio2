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
import { EditableBlock, EditableContent, EditablePlaceholder } from '../components/EditableBlock';
import { EditableBlockControls, EditableControlGroup, EditableControlButton } from '../components/EditableBlockControls';
import { useEditableBlock } from '../hooks/useEditableBlock';

interface ImageBlockViewProps {
  node: {
    attrs: ImageAttributes;
  };
  updateAttributes: (attrs: Partial<ImageAttributes>) => void;
  selected: boolean;
}

export function ImageBlockView({ node, updateAttributes, selected }: ImageBlockViewProps) {
  const [variantChanged, setVariantChanged] = useState(false);
  const [sizeChanged, setSizeChanged] = useState(false);
  const { isUploading } = useMediaManager();
  
  const { 
    isEditing, 
    isHovered,
    startEditing, 
    saveEditing, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useEditableBlock({
    autoSave: true,
    saveDelay: 500
  });

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
      startEditing(); // Activer le mode édition après l'upload
    }
  }, [updateAttributes, alt, startEditing]);

  // Gestion du changement de variant
  const handleVariantChange = useCallback((newVariant: 'full' | '16-9' | 'auto') => {
    updateAttributes({ variant: newVariant });
    setVariantChanged(true);
  }, [updateAttributes]);
  
  // Gestion du changement de taille
  const handleSizeChange = useCallback((newSize: 'small' | 'medium' | 'large') => {
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

  // Obtenir le label du variant pour l'affichage
  const getVariantLabel = () => {
    switch (variant) {
      case '16-9':
        return 'Image 16:9';
      case 'full':
        return 'Image pleine largeur';
      case 'auto':
      default:
        return 'Image';
    }
  };

  return (
    <NodeViewWrapper>
      <EditableBlock
        isSelected={selected}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        blockType="image"
        blockLabel={getVariantLabel()}
        onClick={() => !src && startEditing()}
      >
        {/* Styles critiques pour les variants d'images */}
        <style>{`
          /* Styles critiques pour les variants d'images */
          .image-block .section[data-wf--template-section-image--variant="16-9"] .temp-img {
            aspect-ratio: 16 / 9 !important;
          }
          
          .image-block .section[data-wf--template-section-image--variant="16-9"] .comp-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .image-block .section[data-wf--template-section-image--variant="full"] .temp-img_container {
            margin-left: -2rem;
            margin-right: -2rem;
          }
          
          .image-block .section[data-wf--template-section-image--variant="full"] .temp-img {
            border-radius: 0;
          }
          
          .image-block .section[data-wf--template-section-image--variant="auto"] .temp-img {
            max-width: 800px;
            margin: 0 auto;
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
          .image-block .section[data-size="small"] .temp-img_container {
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .image-block .section[data-size="medium"] .temp-img_container {
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .image-block .section[data-size="large"] .temp-img_container {
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
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
            z-index: 5;
          }
          
          .editable-block:hover .alt-input,
          .editable-block.selected .alt-input {
            opacity: 1;
          }
          
          .alt-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
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
        `}</style>

        {/* Structure HTML du site */}
        <div 
          className={`${SITE_CSS_CLASSES.section} ${variantChanged ? 'variant-changed' : ''} ${sizeChanged ? 'size-changed' : ''}`} 
          data-wf--template-section-image--variant={variant}
          data-size={size}>
          <div className={SITE_CSS_CLASSES.container}>
            <div className={SITE_CSS_CLASSES.imageContainer}>
              <div className={getImageClasses()}>
                <div className={SITE_CSS_CLASSES.imageWrapper}>
                  <EditableContent isEditing={isEditing}>
                    {src ? (
                      <>
                        <img
                          className={SITE_CSS_CLASSES.image}
                          data-wf--template-image--variant="radius-16px"
                          src={src}
                          alt={alt || ''}
                          draggable={false}
                          onClick={() => startEditing()}
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
                      <EditablePlaceholder
                        icon="🖼️"
                        text="Cliquez pour ajouter une image ou glissez-déposez un fichier ici"
                        buttonText="Choisir une image"
                        isLoading={isUploading}
                        onClick={() => startEditing()}
                      />
                    )}

                    {/* Overlay de chargement */}
                    {isUploading && (
                      <div className="loading-overlay">
                        <div>Upload en cours...</div>
                      </div>
                    )}
                  </EditableContent>
                </div>
              </div>
            </div>
          </div>

          {/* Contrôles d'édition */}
          <EditableBlockControls isVisible={selected || isHovered}>
            <EditableControlGroup label="Format:">
              <EditableControlButton
                isActive={variant === 'auto'}
                onClick={() => handleVariantChange('auto')}
                title="Image standard"
              >
                Auto
              </EditableControlButton>
              <EditableControlButton
                isActive={variant === '16-9'}
                onClick={() => handleVariantChange('16-9')}
                title="Image 16:9"
              >
                16:9
              </EditableControlButton>
              <EditableControlButton
                isActive={variant === 'full'}
                onClick={() => handleVariantChange('full')}
                title="Pleine largeur"
              >
                Full
              </EditableControlButton>
            </EditableControlGroup>
            
            {variant !== 'full' && (
              <EditableControlGroup label="Taille:">
                <EditableControlButton
                  isActive={size === 'small'}
                  onClick={() => handleSizeChange('small')}
                  title="Petite taille"
                >
                  S
                </EditableControlButton>
                <EditableControlButton
                  isActive={size === 'medium'}
                  onClick={() => handleSizeChange('medium')}
                  title="Taille moyenne"
                >
                  M
                </EditableControlButton>
                <EditableControlButton
                  isActive={size === 'large'}
                  onClick={() => handleSizeChange('large')}
                  title="Grande taille"
                >
                  L
                </EditableControlButton>
              </EditableControlGroup>
            )}
            
            <EditableControlGroup>
              <MediaUploader
                accept="image"
                onUpload={handleImageUpload}
                options={{ compress: true, quality: 0.8 }}
              >
                <EditableControlButton title="Changer l'image">
                  📁
                </EditableControlButton>
              </MediaUploader>
            </EditableControlGroup>
          </EditableBlockControls>
        </div>
      </EditableBlock>
    </NodeViewWrapper>
  );
}