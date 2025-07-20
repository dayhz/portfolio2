/**
 * Composant wrapper pour les blocs éditables
 * Fournit une interface cohérente pour l'édition en place
 */

import React, { useState, useCallback } from 'react';

interface EditableBlockProps {
  children: React.ReactNode;
  isSelected?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  blockType?: string;
  blockLabel?: string;
  showLabel?: boolean;
}

export function EditableBlock({
  children,
  isSelected = false,
  className = '',
  onMouseEnter,
  onMouseLeave,
  onClick,
  blockType = 'block',
  blockLabel,
  showLabel = true
}: EditableBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();
  }, [onMouseEnter]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave();
  }, [onMouseLeave]);
  
  const displayLabel = blockLabel || blockType;
  const shouldShowLabel = showLabel && (isSelected || isHovered);

  return (
    <div 
      className={`editable-block ${blockType}-block ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <style jsx>{`
        .editable-block {
          position: relative;
          margin: 1rem 0;
          transition: outline 0.2s ease;
        }
        
        .editable-block.selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .editable-block.hovered:not(.selected) {
          outline: 1px dashed #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .block-label {
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
        
        .editable-block.selected .block-label,
        .editable-block.hovered .block-label {
          opacity: 1;
        }
        
        .editable-block.editing {
          outline: 2px solid #10b981;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .editable-block.editing .block-label {
          background: #10b981;
        }
        
        .editable-block.drag-over {
          outline: 2px dashed #3b82f6;
          outline-offset: 2px;
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .editable-block.dragging {
          opacity: 0.5;
        }
      `}</style>
      
      {shouldShowLabel && (
        <div className="block-label">
          {displayLabel}
        </div>
      )}
      
      {children}
    </div>
  );
}

interface EditableContentProps {
  children: React.ReactNode;
  isEditing?: boolean;
  className?: string;
}

export function EditableContent({
  children,
  isEditing = false,
  className = ''
}: EditableContentProps) {
  return (
    <div className={`editable-content ${isEditing ? 'editing' : ''} ${className}`}>
      <style jsx>{`
        .editable-content {
          position: relative;
          transition: background-color 0.2s ease;
        }
        
        .editable-content.editing {
          background-color: rgba(16, 185, 129, 0.05);
          border-radius: 4px;
        }
      `}</style>
      {children}
    </div>
  );
}

interface EditablePlaceholderProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  text?: string;
  buttonText?: string;
  isLoading?: boolean;
  className?: string;
}

export function EditablePlaceholder({
  onClick,
  icon = '➕',
  text = 'Cliquez pour ajouter du contenu',
  buttonText = 'Ajouter',
  isLoading = false,
  className = ''
}: EditablePlaceholderProps) {
  console.log('EditablePlaceholder rendering, isLoading:', isLoading);
  return (
    <div 
      className={`editable-placeholder ${className}`}
      onClick={onClick}
    >
      <style jsx>{`
        .editable-placeholder {
          min-height: 100px;
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
          padding: 2rem;
        }
        
        .editable-placeholder:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .placeholder-icon {
          font-size: 2rem;
          opacity: 0.5;
        }
        
        .placeholder-text {
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
        
        .placeholder-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .placeholder-button:hover {
          background: #2563eb;
        }
        
        .placeholder-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
      <div className="placeholder-icon">{icon}</div>
      <div className="placeholder-text">{text}</div>
      <button 
        className="placeholder-button"
        onClick={(e) => {
          console.log('EditablePlaceholder button clicked');
          // Ne pas arrêter la propagation pour permettre au MediaUploader de recevoir l'événement
          if (onClick) onClick();
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Chargement...' : buttonText}
      </button>
    </div>
  );
}