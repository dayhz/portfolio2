/**
 * NodeView React pour les blocs de témoignages
 * Permet l'édition interactive des citations et informations auteur
 */

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { TestimonyAttributes } from '../types';
import { SITE_CSS_CLASSES, SUPPORTED_IMAGE_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants';

interface TestimonyBlockViewProps {
  node: {
    attrs: TestimonyAttributes;
  };
  updateAttributes: (attrs: Partial<TestimonyAttributes>) => void;
  selected: boolean;
}

export function TestimonyBlockView({ node, updateAttributes, selected }: TestimonyBlockViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  // TODO: Implémenter l'édition en place des champs
  // const [editingField, setEditingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { quote, authorName, authorRole, authorImage } = node.attrs;

  // Gestion de l'upload d'image de profil
  const handleImageUpload = useCallback(async (file: File) => {
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
      const imageUrl = URL.createObjectURL(file);
      updateAttributes({ authorImage: imageUrl });
    } catch (error) {
      console.error('Erreur upload image:', error);
      setUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  }, [updateAttributes]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    event.target.value = '';
  }, [handleImageUpload]);

  // Gestion de l'édition des champs
  const handleFieldChange = useCallback((field: keyof TestimonyAttributes, value: string) => {
    updateAttributes({ [field]: value });
  }, [updateAttributes]);

  const handleFieldFocus = useCallback((field: string) => {
    // TODO: setEditingField(field);
    console.log('Focus on field:', field);
  }, []);

  const handleFieldBlur = useCallback(() => {
    // TODO: setEditingField(null);
    console.log('Blur field');
  }, []);

  return (
    <NodeViewWrapper
      className={`universal-testimony-block ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Styles locaux */}
      <style>{`
        .universal-testimony-block {
          position: relative;
          margin: 1rem 0;
        }
        
        .universal-testimony-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .testimony-controls {
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
        
        .universal-testimony-block:hover .testimony-controls,
        .universal-testimony-block.selected .testimony-controls {
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
        
        .editable-field {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          line-height: inherit;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .editable-field:focus,
        .editable-field.editing {
          background: rgba(59, 130, 246, 0.1);
          outline: 2px solid #3b82f6;
        }
        
        .editable-field::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        
        .profile-image-container {
          position: relative;
          display: inline-block;
        }
        
        .profile-image-placeholder {
          width: 60px;
          height: 60px;
          border: 2px dashed #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f9fafb;
          font-size: 24px;
        }
        
        .profile-image-placeholder:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .profile-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        
        .profile-image:hover {
          opacity: 0.8;
        }
        
        .image-upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          cursor: pointer;
          color: white;
          font-size: 12px;
        }
        
        .profile-image-container:hover .image-upload-overlay {
          opacity: 1;
        }
        
        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
          text-align: center;
        }
        
        .loading-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>

      {/* Structure HTML du site */}
      <div className={SITE_CSS_CLASSES.section}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className="temp-comp-testimony">
            {/* Citation */}
            <h4 className="testimony">
              <textarea
                className="editable-field"
                value={quote || ''}
                onChange={(e) => handleFieldChange('quote', e.target.value)}
                onFocus={() => handleFieldFocus('quote')}
                onBlur={handleFieldBlur}
                placeholder="Cliquez pour ajouter une citation..."
                rows={3}
                style={{ 
                  resize: 'none',
                  minHeight: '60px',
                  fontSize: 'inherit',
                  fontWeight: 'inherit'
                }}
              />
            </h4>

            {/* Profil de l'auteur */}
            <div className="testimony-profile">
              {/* Image de profil */}
              <div className="testimony-profile-img">
                <div className="profile-image-container">
                  {authorImage ? (
                    <>
                      <img
                        className="testimonial-img-item profile-image"
                        src={authorImage}
                        alt={authorName || 'Auteur'}
                        onClick={() => fileInputRef.current?.click()}
                      />
                      <div 
                        className="image-upload-overlay"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁
                      </div>
                    </>
                  ) : (
                    <div
                      className="profile-image-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                      title="Ajouter une photo de profil"
                    >
                      👤
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="loading-indicator">
                      Upload...
                    </div>
                  )}
                </div>
              </div>

              {/* Nom de l'auteur */}
              <div className="testimony-profile-name">
                <input
                  type="text"
                  className="editable-field"
                  value={authorName || ''}
                  onChange={(e) => handleFieldChange('authorName', e.target.value)}
                  onFocus={() => handleFieldFocus('authorName')}
                  onBlur={handleFieldBlur}
                  placeholder="Nom de l'auteur"
                />
              </div>

              {/* Rôle de l'auteur */}
              <div className="testimony-profile-role">
                <input
                  type="text"
                  className="editable-field"
                  value={authorRole || ''}
                  onChange={(e) => handleFieldChange('authorRole', e.target.value)}
                  onFocus={() => handleFieldFocus('authorRole')}
                  onBlur={handleFieldBlur}
                  placeholder="Rôle de l'auteur"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles d'édition */}
        {(showControls || selected) && (
          <div className="testimony-controls">
            <button
              className="control-button"
              onClick={() => fileInputRef.current?.click()}
              title="Changer la photo de profil"
            >
              📷
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