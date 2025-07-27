/**
 * Composant réutilisable pour les contrôles d'édition en place
 * Fournit une interface cohérente pour tous les types de blocs
 */

import React, { useState, useEffect } from 'react';

interface EditableBlockControlsProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showOnHover?: boolean;
  isVisible?: boolean;
  className?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function EditableBlockControls({
  children,
  position = 'top-right',
  showOnHover = true,
  isVisible = false,
  className = '',
  onVisibilityChange
}: EditableBlockControlsProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Déterminer si les contrôles doivent être visibles
  const shouldShow = isVisible || (showOnHover && isHovered);
  
  // Notifier le parent du changement de visibilité
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(shouldShow);
    }
  }, [shouldShow, onVisibilityChange]);
  
  // Déterminer la position des contrôles
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-2 left-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'top-right':
      default:
        return 'top-2 right-2';
    }
  };

  return (
    <div 
      className={`editable-block-controls ${getPositionClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: shouldShow ? 1 : 0,
        pointerEvents: shouldShow ? 'auto' : 'none'
      }}
    >
      <style>{`
        .editable-block-controls {
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 6px;
          padding: 4px;
          display: flex;
          gap: 4px;
          transition: opacity 0.2s ease;
          z-index: 10;
        }
        
        .editable-block-controls.vertical {
          flex-direction: column;
        }
        
        .editable-block-controls.horizontal {
          flex-direction: row;
        }
      `}</style>
      {children}
    </div>
  );
}

interface EditableControlButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function EditableControlButton({
  onClick,
  title,
  isActive = false,
  children,
  className = ''
}: EditableControlButtonProps) {
  return (
    <button
      className={`editable-control-button ${isActive ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      <style>{`
        .editable-control-button {
          background: transparent;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .editable-control-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .editable-control-button.active {
          background: #3b82f6;
        }
      `}</style>
      {children}
    </button>
  );
}

interface EditableControlGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function EditableControlGroup({
  label,
  children,
  className = ''
}: EditableControlGroupProps) {
  return (
    <div className={`editable-control-group ${className}`}>
      <style>{`
        .editable-control-group {
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
      `}</style>
      {label && <span className="control-label">{label}</span>}
      {children}
    </div>
  );
}