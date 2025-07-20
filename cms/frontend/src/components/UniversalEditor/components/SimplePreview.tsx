/**
 * Composant simplifié pour prévisualiser le contenu
 */

import React from 'react';

interface SimplePreviewProps {
  content: string;
  templateName: string;
  onClose?: () => void;
}

export function SimplePreview({ content, templateName, onClose }: SimplePreviewProps) {
  console.log('SimplePreview: Rendu avec template', templateName);
  
  return (
    <div className="simple-preview">
      <style jsx>{`
        .simple-preview {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 16px;
        }
        
        .preview-header {
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        
        .preview-button {
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .preview-content {
          padding: 16px;
        }
        
        .template-info {
          margin-bottom: 16px;
          padding: 8px;
          background-color: #f3f4f6;
          border-radius: 4px;
        }
        
        /* Styles pour les titres et autres éléments */
        .preview-content h1, 
        .preview-content .tiptap-heading-1, 
        .preview-content .tiptap-heading[data-level="1"],
        .preview-content .universal-heading-1,
        .preview-content .universal-heading[data-level="1"] {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 2rem;
          color: #111827;
          line-height: 1.2;
        }
        
        .preview-content h2, 
        .preview-content .tiptap-heading-2, 
        .preview-content .tiptap-heading[data-level="2"],
        .preview-content .universal-heading-2,
        .preview-content .universal-heading[data-level="2"] {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          color: #1f2937;
          line-height: 1.3;
        }
        
        .preview-content h3, 
        .preview-content .tiptap-heading-3, 
        .preview-content .tiptap-heading[data-level="3"],
        .preview-content .universal-heading-3,
        .preview-content .universal-heading[data-level="3"] {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1.25rem;
          color: #374151;
          line-height: 1.4;
        }
        
        .preview-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .preview-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        
        .preview-content ul, .preview-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .preview-content li {
          margin-bottom: 0.5rem;
        }
        
        .preview-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }
        
        /* Styles spécifiques pour chaque template */
        .poesial-preview {
          font-family: 'Georgia', serif;
        }
        
        .poesial-preview h1, .poesial-preview h2, .poesial-preview h3 {
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        
        .zesty-preview {
          font-family: 'Arial', sans-serif;
          color: #1a535c;
        }
        
        .zesty-preview h1, .zesty-preview h2, .zesty-preview h3 {
          color: #ff6b35;
        }
        
        .nobe-preview {
          font-family: 'Helvetica Neue', sans-serif;
        }
        
        .nobe-preview h1, .nobe-preview h2, .nobe-preview h3 {
          font-weight: 300;
          letter-spacing: -0.05em;
        }
        
        .ordine-preview {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      <div className="preview-header">
        <div className="preview-title">Prévisualisation simplifiée</div>
        <div className="preview-actions">
          {onClose && (
            <button
              className="preview-button"
              onClick={onClose}
              title="Fermer la prévisualisation"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className={`preview-content ${templateName}-preview`}>
        <div className="template-info">
          Template actif: <strong>{templateName}</strong>
        </div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}