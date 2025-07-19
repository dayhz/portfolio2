/**
 * NodeView React pour les blocs de texte universels
 * Permet l'édition en place avec sélection de variant
 */

import React, { useState, useCallback } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { TextAttributes } from '../types';
import { SITE_CSS_CLASSES } from '../constants';

interface TextBlockViewProps extends NodeViewProps {
  node: {
    attrs: TextAttributes;
  };
}

export function TextBlockView({ node, updateAttributes, selected }: TextBlockViewProps) {
  const [showControls, setShowControls] = useState(false);
  const { variant } = node.attrs;

  // Gestion du changement de variant
  const handleVariantChange = useCallback((newVariant: string) => {
    updateAttributes({ variant: newVariant });
  }, [updateAttributes]);

  // Classes CSS selon le variant
  const getContentClass = () => {
    switch (variant) {
      case 'rich':
        return 'temp-rich u-color-dark w-richtext';
      case 'about':
        return 'temp-about_container';
      case 'simple':
      default:
        return 'temp-comp-text';
    }
  };

  // Titre du variant pour l'affichage
  const getVariantTitle = () => {
    switch (variant) {
      case 'rich':
        return 'Texte Riche';
      case 'about':
        return 'Section À Propos';
      case 'simple':
      default:
        return 'Texte Simple';
    }
  };

  return (
    <NodeViewWrapper
      className={`universal-text-block ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Styles locaux */}
      <style>{`
        .universal-text-block {
          position: relative;
          margin: 1rem 0;
        }
        
        .universal-text-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .text-controls {
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
        
        .universal-text-block:hover .text-controls,
        .universal-text-block.selected .text-controls {
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
          white-space: nowrap;
        }
        
        .control-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .control-button.active {
          background: #3b82f6;
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
        }
        
        .universal-text-block:hover .variant-indicator,
        .universal-text-block.selected .variant-indicator {
          opacity: 1;
        }
        
        /* Styles pour l'édition en place */
        .universal-text-block .ProseMirror {
          outline: none;
          min-height: 60px;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .universal-text-block:hover .ProseMirror,
        .universal-text-block.selected .ProseMirror {
          background: rgba(59, 130, 246, 0.05);
        }
        
        .universal-text-block .ProseMirror:focus {
          background: rgba(59, 130, 246, 0.1);
          outline: 2px solid rgba(59, 130, 246, 0.3);
        }
        
        /* Styles spécifiques aux variants */
        .variant-about .temp-about_container {
          border: 1px dashed #d1d5db;
          padding: 16px;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .variant-rich .temp-rich {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
        }
        
        /* Placeholder pour contenu vide */
        .universal-text-block .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Indicateur de variant */}
      <div className="variant-indicator">
        {getVariantTitle()}
      </div>

      {/* Structure HTML du site */}
      <div className={`${SITE_CSS_CLASSES.section} variant-${variant}`}>
        <div className={SITE_CSS_CLASSES.container}>
          <div className={getContentClass()}>
            <NodeViewContent />
          </div>
        </div>

        {/* Contrôles d'édition */}
        {(showControls || selected) && (
          <div className="text-controls">
            <button
              className={`control-button ${variant === 'simple' ? 'active' : ''}`}
              onClick={() => handleVariantChange('simple')}
              title="Texte simple"
            >
              Simple
            </button>
            <button
              className={`control-button ${variant === 'rich' ? 'active' : ''}`}
              onClick={() => handleVariantChange('rich')}
              title="Texte riche avec formatage"
            >
              Riche
            </button>
            <button
              className={`control-button ${variant === 'about' ? 'active' : ''}`}
              onClick={() => handleVariantChange('about')}
              title="Section à propos"
            >
              À propos
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}