/**
 * Composant pour prévisualiser le contenu exporté
 */

import React, { useState, useEffect } from 'react';

interface ContentPreviewProps {
  content: string;
  templateName: string;
  metadata?: Record<string, any>;
  onClose?: () => void;
  className?: string;
}

export function ContentPreview({
  content,
  templateName,
  metadata = {},
  onClose,
  className = ''
}: ContentPreviewProps) {
  const [iframeHeight, setIframeHeight] = useState(600);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Log pour déboguer
  console.log('ContentPreview: Rendu avec template', templateName);
  console.log('ContentPreview: Contenu à prévisualiser', content.substring(0, 100) + '...');
  
  // Créer le contenu de l'iframe avec les styles intégrés directement
  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prévisualisation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .preview-header {
          background: #f3f4f6;
          padding: 8px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .preview-title {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .preview-template {
          font-size: 12px;
          color: #6b7280;
          padding: 2px 6px;
          background: #e5e7eb;
          border-radius: 4px;
        }
        
        .preview-content {
          padding: 16px;
        }
        
        /* Styles spécifiques pour le template Poesial */
        .poesial-template {
          font-family: 'Georgia', serif;
          color: #333333;
          background-color: #ffffff;
          line-height: 1.6;
        }
        
        .poesial-template .preview-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .poesial-template img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0;
        }
        
        /* Styles spécifiques pour le template Zesty */
        .zesty-template {
          font-family: 'Arial', sans-serif;
          color: #1a535c;
          background-color: #ffffff;
          line-height: 1.6;
        }
        
        .zesty-template .preview-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .zesty-template img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Styles spécifiques pour le template Nobe */
        .nobe-template {
          font-family: 'Helvetica Neue', sans-serif;
          color: #333333;
          background-color: #ffffff;
          line-height: 1.6;
        }
        
        .nobe-template .preview-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem;
        }
        
        .nobe-template img {
          max-width: 100%;
          height: auto;
          margin: 3rem 0;
        }
        
        /* Styles spécifiques pour le template Ordine */
        .ordine-template {
          font-family: 'Inter', sans-serif;
          color: #1a202c;
          background-color: #ffffff;
          line-height: 1.6;
        }
        
        .ordine-template .preview-content {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .ordine-template img {
          max-width: 100%;
          height: auto;
          margin: 0;
          grid-column: 1 / -1;
        }
      </style>
    </head>
    <body class="${templateName}-template">
      <div class="preview-header">
        <div class="preview-title">Prévisualisation</div>
        <div class="preview-template">Template: ${templateName}</div>
      </div>
      <div class="preview-content">
        ${content}
      </div>
      <script>
        // Informer le parent de la hauteur du contenu
        window.addEventListener('load', function() {
          const height = document.body.scrollHeight;
          window.parent.postMessage({ type: 'resize', height }, '*');
          
          // Log pour déboguer
          console.log('Template appliqué:', '${templateName}');
          console.log('Body classes:', document.body.className);
          
          // Vérifier si les styles sont appliqués
          const computedStyle = window.getComputedStyle(document.body);
          console.log('Body computed style:', {
            fontFamily: computedStyle.fontFamily,
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor
          });
        });
      </script>
    </body>
    </html>
  `;
  
  // Écouter les messages de l'iframe pour ajuster la hauteur
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize') {
        setIframeHeight(event.data.height);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`content-preview ${isFullscreen ? 'fullscreen' : ''} ${className}`}>
      <style>{`
        .content-preview {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .content-preview.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border-radius: 0;
          border: none;
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
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .preview-button:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .preview-button.primary {
          background: #3b82f6;
          color: white;
        }
        
        .preview-button.primary:hover {
          background: #2563eb;
        }
        
        .preview-iframe-container {
          width: 100%;
          height: ${isFullscreen ? '100vh' : `${iframeHeight}px`};
          max-height: ${isFullscreen ? 'none' : '600px'};
          overflow: auto;
          transition: height 0.3s ease;
        }
        
        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .preview-info {
          padding: 12px 16px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        
        .preview-info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .preview-info-label {
          font-weight: 500;
        }
      `}</style>
      
      <div className="preview-header">
        <div className="preview-title">Prévisualisation du contenu</div>
        <div className="preview-actions">
          <button
            className="preview-button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter le mode plein écran' : 'Mode plein écran'}
          >
            {isFullscreen ? '🗕' : '🗖'}
          </button>
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
      
      <div className="preview-iframe-container">
        <iframe
          className="preview-iframe"
          srcDoc={iframeContent}
          title="Prévisualisation du contenu"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
      
      <div className="preview-info">
        <div className="preview-info-item">
          <span className="preview-info-label">Template:</span>
          <span>{templateName}</span>
        </div>
        {metadata.title && (
          <div className="preview-info-item">
            <span className="preview-info-label">Titre:</span>
            <span>{metadata.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}