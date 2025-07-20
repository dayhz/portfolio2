/**
 * Composant d'aperçu visuel pour les blocs dans le menu de sélection
 */

// React import removed - not needed in this component
import { BlockType } from '../types';

interface BlockPreviewProps {
  block: BlockType;
  isSelected?: boolean;
}

export function BlockPreview({ block, isSelected = false }: BlockPreviewProps) {
  const getPreviewContent = () => {
    switch (block.id) {
      case 'image-full':
        return (
          <div className="preview-image-full">
            <div className="preview-image-placeholder">
              <div className="preview-image-icon">🖼️</div>
            </div>
            <div className="preview-label">Image pleine largeur</div>
          </div>
        );
      
      case 'image-16-9':
        return (
          <div className="preview-image-16-9">
            <div className="preview-image-placeholder ratio-16-9">
              <div className="preview-image-icon">📐</div>
            </div>
            <div className="preview-label">Image 16:9</div>
          </div>
        );
      
      case 'image-grid':
        return (
          <div className="preview-image-grid">
            <div className="preview-grid">
              <div className="preview-grid-item">
                <div className="preview-image-icon small">🖼️</div>
              </div>
              <div className="preview-grid-item">
                <div className="preview-image-icon small">🖼️</div>
              </div>
            </div>
            <div className="preview-label">Grille d'images</div>
          </div>
        );
      
      case 'rich-text':
        return (
          <div className="preview-rich-text">
            <div className="preview-text-lines">
              <div className="preview-text-line title"></div>
              <div className="preview-text-line"></div>
              <div className="preview-text-line short"></div>
            </div>
            <div className="preview-label">Texte riche</div>
          </div>
        );
      
      case 'simple-text':
        return (
          <div className="preview-simple-text">
            <div className="preview-text-lines">
              <div className="preview-text-line"></div>
              <div className="preview-text-line"></div>
              <div className="preview-text-line short"></div>
            </div>
            <div className="preview-label">Texte simple</div>
          </div>
        );
      
      case 'testimony':
        return (
          <div className="preview-testimony">
            <div className="preview-quote">"</div>
            <div className="preview-text-lines small">
              <div className="preview-text-line"></div>
              <div className="preview-text-line short"></div>
            </div>
            <div className="preview-author">
              <div className="preview-avatar"></div>
              <div className="preview-author-info">
                <div className="preview-text-line tiny"></div>
                <div className="preview-text-line tiny short"></div>
              </div>
            </div>
            <div className="preview-label">Témoignage</div>
          </div>
        );
      
      case 'video':
        return (
          <div className="preview-video">
            <div className="preview-video-placeholder">
              <div className="preview-play-button">▶️</div>
            </div>
            <div className="preview-label">Vidéo</div>
          </div>
        );
      
      case 'heading-1':
        return (
          <div className="preview-heading-1">
            <div className="preview-heading h1"></div>
            <div className="preview-label">Titre H1</div>
          </div>
        );
      
      case 'heading-2':
        return (
          <div className="preview-heading-2">
            <div className="preview-heading h2"></div>
            <div className="preview-label">Titre H2</div>
          </div>
        );
      
      case 'heading-3':
        return (
          <div className="preview-heading-3">
            <div className="preview-heading h3"></div>
            <div className="preview-label">Titre H3</div>
          </div>
        );
      
      case 'about-section':
        return (
          <div className="preview-about">
            <div className="preview-about-layout">
              <div className="preview-about-content">
                <div className="preview-text-lines small">
                  <div className="preview-text-line"></div>
                  <div className="preview-text-line short"></div>
                </div>
              </div>
              <div className="preview-about-sidebar">
                <div className="preview-info-box"></div>
                <div className="preview-info-box"></div>
              </div>
            </div>
            <div className="preview-label">Section à propos</div>
          </div>
        );
      
      default:
        return (
          <div className="preview-default">
            <div className="preview-icon">{block.icon}</div>
            <div className="preview-label">{block.name}</div>
          </div>
        );
    }
  };

  return (
    <div className={`block-preview ${isSelected ? 'selected' : ''}`}>
      <style>{`
        .block-preview {
          width: 120px;
          height: 80px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          background: white;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .block-preview:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        
        .block-preview.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .preview-label {
          position: absolute;
          bottom: 4px;
          left: 4px;
          right: 4px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
          font-weight: 500;
        }
        
        /* Aperçus d'images */
        .preview-image-placeholder {
          width: 100%;
          height: 50px;
          background: #f3f4f6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed #d1d5db;
        }
        
        .preview-image-placeholder.ratio-16-9 {
          height: 40px;
        }
        
        .preview-image-icon {
          font-size: 16px;
          opacity: 0.6;
        }
        
        .preview-image-icon.small {
          font-size: 12px;
        }
        
        /* Grille d'images */
        .preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          height: 50px;
        }
        
        .preview-grid-item {
          background: #f3f4f6;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed #d1d5db;
        }
        
        /* Texte */
        .preview-text-lines {
          display: flex;
          flex-direction: column;
          gap: 3px;
          height: 50px;
          justify-content: center;
        }
        
        .preview-text-lines.small {
          height: 35px;
        }
        
        .preview-text-line {
          height: 3px;
          background: #d1d5db;
          border-radius: 2px;
        }
        
        .preview-text-line.title {
          height: 4px;
          background: #9ca3af;
          width: 80%;
        }
        
        .preview-text-line.short {
          width: 60%;
        }
        
        .preview-text-line.tiny {
          height: 2px;
          width: 70%;
        }
        
        .preview-text-line.tiny.short {
          width: 40%;
        }
        
        /* Témoignage */
        .preview-quote {
          font-size: 24px;
          color: #9ca3af;
          text-align: center;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .preview-author {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
        }
        
        .preview-avatar {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          flex-shrink: 0;
        }
        
        .preview-author-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        
        /* Vidéo */
        .preview-video-placeholder {
          width: 100%;
          height: 50px;
          background: #1f2937;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .preview-play-button {
          font-size: 14px;
          color: white;
        }
        
        /* Section à propos */
        .preview-about-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 6px;
          height: 50px;
        }
        
        .preview-about-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .preview-about-sidebar {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .preview-info-box {
          height: 20px;
          background: #f3f4f6;
          border-radius: 3px;
          border: 1px solid #e5e7eb;
        }
        
        /* Titres */
        .preview-heading {
          background: #1f2937;
          border-radius: 4px;
          margin: 8px 0;
        }
        
        .preview-heading.h1 {
          height: 12px;
          width: 90%;
        }
        
        .preview-heading.h2 {
          height: 10px;
          width: 80%;
        }
        
        .preview-heading.h3 {
          height: 8px;
          width: 70%;
        }
        
        /* Défaut */
        .preview-default {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        
        .preview-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
      `}</style>
      
      {getPreviewContent()}
    </div>
  );
}