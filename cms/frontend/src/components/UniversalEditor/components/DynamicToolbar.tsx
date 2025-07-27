/**
 * Toolbar dynamique qui s'adapte au bloc sélectionné
 */

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';

interface DynamicToolbarProps {
  editor: Editor;
  className?: string;
}

export function DynamicToolbar({ editor, className = '' }: DynamicToolbarProps) {
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Détecter le type de nœud sélectionné
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const { $anchor } = selection;
      
      // Trouver le nœud parent le plus proche qui est un bloc
      let depth = $anchor.depth;
      let nodeType = null;
      
      while (depth > 0) {
        const node = $anchor.node(depth);
        if (node.type.name.includes('universal') || node.type.name === 'imageGrid' || node.type.name === 'testimony') {
          nodeType = node.type.name;
          break;
        }
        depth--;
      }
      
      setSelectedNodeType(nodeType);
      
      // Déterminer si la toolbar doit être visible
      setIsVisible(!!nodeType);
      
      // Positionner la toolbar au-dessus du bloc sélectionné
      if (nodeType) {
        const domNode = editor.view.nodeDOM($anchor.before(depth)) as HTMLElement;
        if (domNode) {
          const rect = domNode.getBoundingClientRect();
          const editorRect = editor.view.dom.getBoundingClientRect();
          
          setPosition({
            top: rect.top - editorRect.top - 40, // 40px au-dessus du bloc
            left: rect.left - editorRect.left + rect.width / 2 // Centré horizontalement
          });
        }
      }
    };
    
    // S'abonner aux événements de sélection
    editor.on('selectionUpdate', handleSelectionUpdate);
    
    // Nettoyer l'abonnement
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);
  
  // Rendre les contrôles spécifiques au type de bloc
  const renderControls = () => {
    switch (selectedNodeType) {
      case 'universalImage':
        return (
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalImage', { variant: 'auto' }).run()}
              title="Image standard"
            >
              Auto
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalImage', { variant: '16-9' }).run()}
              title="Image 16:9"
            >
              16:9
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalImage', { variant: 'full' }).run()}
              title="Pleine largeur"
            >
              Full
            </button>
          </div>
        );
      
      case 'universalText':
        return (
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalText', { variant: 'simple' }).run()}
              title="Texte simple"
            >
              Simple
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalText', { variant: 'rich' }).run()}
              title="Texte riche"
            >
              Riche
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalText', { variant: 'about' }).run()}
              title="Section à propos"
            >
              À propos
            </button>
          </div>
        );
      
      case 'universalVideo':
        return (
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalVideo', { controls: true }).run()}
              title="Afficher les contrôles"
            >
              Contrôles
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalVideo', { autoplay: true, muted: true }).run()}
              title="Lecture automatique"
            >
              Auto
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('universalVideo', { loop: true }).run()}
              title="Lecture en boucle"
            >
              Boucle
            </button>
          </div>
        );
      
      case 'imageGrid':
        return (
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('imageGrid', { layout: '2-columns' }).run()}
              title="2 colonnes"
            >
              2 Col
            </button>
            <button
              className="toolbar-button"
              onClick={() => editor.chain().focus().updateAttributes('imageGrid', { layout: '3-columns' }).run()}
              title="3 colonnes"
            >
              3 Col
            </button>
          </div>
        );
      
      case 'testimony':
        return (
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      editor.chain().focus().updateAttributes('testimony', { authorImage: result }).run();
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              title="Ajouter une photo de profil"
            >
              Photo
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Contrôles communs à tous les types de blocs
  const renderCommonControls = () => {
    return (
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().deleteSelection().run()}
          title="Supprimer le bloc"
        >
          🗑️
        </button>
        <button
          className="toolbar-button"
          onClick={() => {
            // Dupliquer le bloc sélectionné
            const { selection } = editor.state;
            const { $anchor } = selection;
            let depth = $anchor.depth;
            
            while (depth > 0) {
              const node = $anchor.node(depth);
              if (node.type.name.includes('universal') || node.type.name === 'imageGrid' || node.type.name === 'testimony') {
                const pos = $anchor.before(depth);
                const nodeJSON = node.toJSON();
                
                // Insérer une copie du nœud après le nœud actuel
                editor.chain().focus().insertContentAt(pos + node.nodeSize, nodeJSON).run();
                break;
              }
              depth--;
            }
          }}
          title="Dupliquer le bloc"
        >
          📋
        </button>
      </div>
    );
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`dynamic-toolbar ${className}`}
      style={{
        position: 'absolute',
        top: `${Math.max(0, position.top)}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <style>{`
        .dynamic-toolbar {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 6px;
          padding: 4px;
          display: flex;
          gap: 8px;
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        .toolbar-group {
          display: flex;
          gap: 2px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          padding-right: 8px;
        }
        
        .toolbar-group:last-child {
          border-right: none;
          padding-right: 0;
        }
        
        .toolbar-button {
          background: transparent;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .toolbar-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .toolbar-button.active {
          background: #3b82f6;
        }
      `}</style>
      
      {renderControls()}
      {renderCommonControls()}
    </div>
  );
}