/**
 * NodeView React pour les blocs vidéo universels
 * Permet l'édition interactive avec upload et contrôles
 */

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { VideoAttributes } from '../types';
import { SITE_CSS_CLASSES, SUPPORTED_VIDEO_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants';

interface VideoBlockViewProps {
  node: {
    attrs: VideoAttributes;
  };
  updateAttributes: (attrs: Partial<VideoAttributes>) => void;
  selected: boolean;
}

export function VideoBlockView({ node, updateAttributes, selected }: VideoBlockViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { src, alt, title, autoplay, controls, loop, muted } = node.attrs;

  // Gestion de l'upload de vidéo
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
      
      // TODO: Implémenter l'upload vers le serveur
      // const uploadedUrl = await uploadVideoToServer(file);
      
      // Pour l'instant, utiliser l'URL temporaire
      updateAttributes({
        src: videoUrl,
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        alt: alt || file.name.replace(/\.[^/.]+$/, '')
      });

    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      setUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  }, [updateAttributes, title, alt]);

  // Gestion du clic sur l'input file
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
    // Reset l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  }, [handleVideoUpload]);

  // Gestion du drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoUpload(file);
    }
  }, [handleVideoUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Gestion des contrôles vidéo
  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Gestion des attributs vidéo
  const handleAttributeChange = useCallback((attr: keyof VideoAttributes, value: any) => {
    updateAttributes({ [attr]: value });
  }, [updateAttributes]);

  return (
    <NodeViewWrapper
      className={`universal-video-block ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Styles locaux */}
      <style>{`
        .universal-video-block {
          position: relative;
          margin: 1rem 0;
        }
        
        .universal-video-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .video-controls {
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
        
        .universal-video-block:hover .video-controls,
        .universal-video-block.selected .video-controls {
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
        
        .video-placeholder {
          min-height: 300px;
          border: 2px dashed #d1d5db;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        }
        
        .video-placeholder:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }
        
        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.8;
          color: white;
        }
        
        .placeholder-text {
          color: white;
          font-size: 16px;
          text-align: center;
          font-weight: 500;
        }
        
        .upload-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 8px;
        }
        
        .upload-button:hover {
          background: #2563eb;
        }
        
        .upload-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .video-player {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
        }
        
        .video-element {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
        }
        
        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          cursor: pointer;
        }
        
        .video-player:hover .video-overlay {
          opacity: 1;
        }
        
        .play-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .play-button:hover {
          background: white;
          transform: scale(1.1);
        }
        
        .video-info {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .universal-video-block:hover .video-info,
        .universal-video-block.selected .video-info {
          opacity: 1;
        }
        
        .video-title-input {
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          outline: none;
        }
        
        .video-title-input::placeholder {
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
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          z-index: 5;
          color: white;
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .control-checkbox {
          width: 12px;
          height: 12px;
        }
        
        .control-label {
          font-size: 10px;
          color: white;
        }
      `}</style>

      {/* Structure HTML du site */}
      <div className={SITE_CSS_CLASSES.section}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className={SITE_CSS_CLASSES.videoWrapper}>
            {src ? (
              <div className="video-player">
                <video
                  ref={videoRef}
                  className="video-element"
                  src={src}
                  controls={controls}
                  autoPlay={autoplay}
                  loop={loop}
                  muted={muted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Overlay de contrôle personnalisé */}
                <div className="video-overlay" onClick={handlePlayPause}>
                  <button className="play-button">
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>

                {/* Informations vidéo */}
                <div className="video-info">
                  <input
                    type="text"
                    className="video-title-input"
                    placeholder="Titre de la vidéo..."
                    value={title || ''}
                    onChange={(e) => handleAttributeChange('title', e.target.value)}
                  />
                </div>

                {/* Overlay de chargement */}
                {isUploading && (
                  <div className="loading-overlay">
                    <div>Upload en cours...</div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="video-placeholder"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="placeholder-icon">🎥</div>
                <div className="placeholder-text">
                  <div>Cliquez pour ajouter une vidéo</div>
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
                  {isUploading ? 'Upload...' : 'Choisir une vidéo'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contrôles d'édition */}
        {(showControls || selected) && (
          <div className="video-controls">
            <div className="control-group">
              <input
                type="checkbox"
                className="control-checkbox"
                checked={controls}
                onChange={(e) => handleAttributeChange('controls', e.target.checked)}
              />
              <label className="control-label">Contrôles</label>
            </div>
            <div className="control-group">
              <input
                type="checkbox"
                className="control-checkbox"
                checked={autoplay}
                onChange={(e) => handleAttributeChange('autoplay', e.target.checked)}
              />
              <label className="control-label">Auto</label>
            </div>
            <div className="control-group">
              <input
                type="checkbox"
                className="control-checkbox"
                checked={loop}
                onChange={(e) => handleAttributeChange('loop', e.target.checked)}
              />
              <label className="control-label">Loop</label>
            </div>
            <div className="control-group">
              <input
                type="checkbox"
                className="control-checkbox"
                checked={muted}
                onChange={(e) => handleAttributeChange('muted', e.target.checked)}
              />
              <label className="control-label">Muet</label>
            </div>
            <button
              className="control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              title="Changer la vidéo"
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
        accept={SUPPORTED_VIDEO_FORMATS.join(',')}
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