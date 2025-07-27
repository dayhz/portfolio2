/**
 * Composant pour afficher une version mobile optimisée de l'éditeur
 */

import React, { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { TouchControls } from './TouchControls';
import { useResponsive } from '../hooks/useResponsive';
import { responsiveUIManager } from '../services/ResponsiveUIManager';

interface MobileEditorProps {
  editor: Editor | null;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MobileEditor({
  editor,
  children,
  className = '',
  style = {}
}: MobileEditorProps) {
  const { deviceType, isTouchDevice, orientation } = useResponsive();
  const [isToolbarVisible, setIsToolbarVisible] = useState<boolean>(false);
  const [selectedNodePos, setSelectedNodePos] = useState<number | null>(null);
  
  // Obtenir les styles adaptés à la taille d'écran
  const responsiveStyles = responsiveUIManager.getResponsiveStyles({
    deviceType,
    isTouchDevice,
    orientation,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  });
  
  // Gérer le tap sur l'éditeur
  const handleTap = useCallback((event: React.TouchEvent) => {
    if (!editor) return;
    
    // Masquer la barre d'outils si elle est visible
    if (isToolbarVisible) {
      setIsToolbarVisible(false);
      return;
    }
    
    // Trouver le nœud à la position du tap
    const { clientX, clientY } = event.touches[0];
    const domPoint = document.elementFromPoint(clientX, clientY);
    
    if (domPoint) {
      // Trouver le nœud Tiptap correspondant
      const nodePos = editor.view.posAtDOM(domPoint, 0);
      
      if (nodePos !== null) {
        const $pos = editor.state.doc.resolve(nodePos);
        const node = $pos.node();
        
        if (node) {
          // Sélectionner le nœud
          editor.commands.setNodeSelection(nodePos);
          setSelectedNodePos(nodePos);
        }
      }
    }
  }, [editor, isToolbarVisible]);
  
  // Gérer le double tap sur l'éditeur
  const handleDoubleTap = useCallback((event: React.TouchEvent) => {
    if (!editor) return;
    
    // Afficher la barre d'outils
    setIsToolbarVisible(true);
    
    // Empêcher le zoom du navigateur sur double tap
    event.preventDefault();
  }, [editor]);
  
  // Gérer le swipe sur l'éditeur
  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down', event: React.TouchEvent) => {
    if (!editor) return;
    
    switch (direction) {
      case 'left':
        // Indenter le texte
        editor.commands.indent();
        break;
      case 'right':
        // Désindenter le texte
        editor.commands.outdent();
        break;
      case 'up':
        // Sélectionner le nœud précédent
        if (selectedNodePos !== null) {
          const prevPos = Math.max(0, selectedNodePos - 1);
          editor.commands.setNodeSelection(prevPos);
          setSelectedNodePos(prevPos);
        }
        break;
      case 'down':
        // Sélectionner le nœud suivant
        if (selectedNodePos !== null && selectedNodePos < editor.state.doc.content.size - 1) {
          const nextPos = selectedNodePos + 1;
          editor.commands.setNodeSelection(nextPos);
          setSelectedNodePos(nextPos);
        }
        break;
    }
  }, [editor, selectedNodePos]);
  
  // Gérer le pincement sur l'éditeur
  const handlePinch = useCallback((scale: number, event: React.TouchEvent) => {
    if (!editor) return;
    
    // Changer la taille du texte en fonction du pincement
    if (scale > 1.2) {
      // Zoom in - augmenter la taille du texte
      editor.commands.toggleHeading({ level: 3 });
    } else if (scale < 0.8) {
      // Zoom out - diminuer la taille du texte
      editor.commands.toggleHeading({ level: 5 });
    }
  }, [editor]);
  
  // Styles pour la version mobile
  const mobileStyles = {
    // Augmenter la taille des contrôles pour les appareils tactiles
    padding: responsiveStyles.controls.spacing,
    fontSize: responsiveStyles.controls.fontSize,
    ...style
  };
  
  return (
    <div className={`mobile-editor ${className}`} style={mobileStyles}>
      {/* Wrapper tactile pour l'éditeur */}
      <TouchControls
        onTap={handleTap}
        onDoubleTap={handleDoubleTap}
        onSwipe={handleSwipe}
        onPinch={handlePinch}
        className="mobile-editor-touch-area"
      >
        {/* Contenu de l'éditeur */}
        {children}
      </TouchControls>
      
      {/* Barre d'outils mobile */}
      {isToolbarVisible && editor && (
        <div className="mobile-toolbar">
          <div className="mobile-toolbar-buttons">
            <button
              className={`mobile-toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </button>
            <button
              className={`mobile-toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </button>
            <button
              className={`mobile-toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </button>
            <button
              className={`mobile-toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </button>
            <button
              className="mobile-toolbar-button"
              onClick={() => editor.chain().focus().undo().run()}
            >
              ↩
            </button>
            <button
              className="mobile-toolbar-button"
              onClick={() => editor.chain().focus().redo().run()}
            >
              ↪
            </button>
            <button
              className="mobile-toolbar-button close-button"
              onClick={() => setIsToolbarVisible(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Styles CSS pour la version mobile */}
      <style>{`
        .mobile-editor {
          position: relative;
          width: 100%;
        }
        
        .mobile-editor-touch-area {
          width: 100%;
          min-height: 200px;
        }
        
        .mobile-toolbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          padding: 8px;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-toolbar-buttons {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .mobile-toolbar-button {
          width: ${responsiveStyles.controls.size}px;
          height: ${responsiveStyles.controls.size}px;
          border-radius: ${responsiveStyles.controls.borderRadius};
          border: 1px solid #ced4da;
          background-color: #ffffff;
          font-size: ${responsiveStyles.controls.fontSize};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: ${responsiveStyles.controls.spacing}px;
          padding: 0;
        }
        
        .mobile-toolbar-button.active {
          background-color: #e9ecef;
          border-color: #adb5bd;
        }
        
        .mobile-toolbar-button.close-button {
          background-color: #f8d7da;
          border-color: #f5c2c7;
          color: #842029;
        }
      `}</style>
    </div>
  );
}