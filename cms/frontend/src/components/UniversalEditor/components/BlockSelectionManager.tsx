/**
 * Composant pour gérer la sélection et la navigation entre les blocs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface BlockSelectionManagerProps {
  editor: Editor;
  children: React.ReactNode;
}

interface SelectedBlock {
  pos: number;
  type: string;
  domNode: HTMLElement | null;
}

export function BlockSelectionManager({ editor, children }: BlockSelectionManagerProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<SelectedBlock[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Mettre à jour les blocs sélectionnés quand la sélection change
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const { $anchor } = selection;
      
      // Trouver le nœud parent le plus proche qui est un bloc
      let depth = $anchor.depth;
      let selectedBlock: SelectedBlock | null = null;
      
      while (depth > 0) {
        const node = $anchor.node(depth);
        if (node.type.name.includes('universal') || node.type.name === 'imageGrid' || node.type.name === 'testimony') {
          const pos = $anchor.before(depth);
          const domNode = editor.view.nodeDOM(pos) as HTMLElement;
          
          selectedBlock = {
            pos,
            type: node.type.name,
            domNode
          };
          break;
        }
        depth--;
      }
      
      // Mettre à jour la sélection
      if (selectedBlock) {
        if (isMultiSelectMode) {
          // Ajouter ou supprimer le bloc de la sélection multiple
          setSelectedBlocks(prev => {
            const existingIndex = prev.findIndex(block => block.pos === selectedBlock!.pos);
            
            if (existingIndex >= 0) {
              // Supprimer le bloc s'il est déjà sélectionné
              return prev.filter((_, i) => i !== existingIndex);
            } else {
              // Ajouter le bloc à la sélection
              return [...prev, selectedBlock!];
            }
          });
        } else {
          // Remplacer la sélection par ce bloc uniquement
          setSelectedBlocks([selectedBlock]);
        }
      } else if (!isMultiSelectMode) {
        // Effacer la sélection si aucun bloc n'est sélectionné et qu'on n'est pas en mode multi-sélection
        setSelectedBlocks([]);
      }
    };
    
    // S'abonner aux événements de sélection
    editor.on('selectionUpdate', handleSelectionUpdate);
    
    // Nettoyer l'abonnement
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, isMultiSelectMode]);
  
  // Naviguer vers le bloc précédent
  const selectPreviousBlock = useCallback(() => {
    if (selectedBlocks.length === 0) return;
    
    const currentPos = selectedBlocks[0].pos;
    const { doc } = editor.state;
    let prevPos = null;
    
    // Parcourir le document pour trouver le bloc précédent
    doc.nodesBetween(0, currentPos, (node, pos) => {
      if (node.type.name.includes('universal') || node.type.name === 'imageGrid' || node.type.name === 'testimony') {
        prevPos = pos;
      }
    });
    
    if (prevPos !== null) {
      editor.commands.setNodeSelection(prevPos);
    }
  }, [editor, selectedBlocks]);
  
  // Naviguer vers le bloc suivant
  const selectNextBlock = useCallback(() => {
    if (selectedBlocks.length === 0) return;
    
    const currentPos = selectedBlocks[0].pos;
    const { doc } = editor.state;
    let nextPos = null;
    let foundCurrent = false;
    
    // Parcourir le document pour trouver le bloc suivant
    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.type.name.includes('universal') || node.type.name === 'imageGrid' || node.type.name === 'testimony') {
        if (foundCurrent && nextPos === null) {
          nextPos = pos;
        }
        if (pos === currentPos) {
          foundCurrent = true;
        }
      }
    });
    
    if (nextPos !== null) {
      editor.commands.setNodeSelection(nextPos);
    }
  }, [editor, selectedBlocks]);
  
  // Gérer les raccourcis clavier pour la navigation et la sélection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Naviguer avec les flèches haut/bas + Alt
      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        selectPreviousBlock();
      } else if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        selectNextBlock();
      }
      
      // Activer/désactiver le mode multi-sélection avec Shift
      if (event.key === 'Shift') {
        setIsMultiSelectMode(true);
      }
      
      // Supprimer les blocs sélectionnés avec Delete ou Backspace
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlocks.length > 0) {
        // Trier les positions par ordre décroissant pour éviter les problèmes de décalage
        const sortedPositions = [...selectedBlocks]
          .sort((a, b) => b.pos - a.pos)
          .map(block => block.pos);
        
        // Supprimer chaque bloc sélectionné
        sortedPositions.forEach(pos => {
          editor.commands.deleteNode(editor.state.doc.resolve(pos).node(editor.state.doc.resolve(pos).depth));
        });
        
        // Effacer la sélection
        setSelectedBlocks([]);
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      // Désactiver le mode multi-sélection quand Shift est relâché
      if (event.key === 'Shift') {
        setIsMultiSelectMode(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectPreviousBlock, selectNextBlock, selectedBlocks, editor]);
  
  // Rendre les indicateurs de sélection
  const renderSelectionIndicators = () => {
    return selectedBlocks.map((block, index) => {
      if (!block.domNode) return null;
      
      const rect = block.domNode.getBoundingClientRect();
      const editorRect = editor.view.dom.getBoundingClientRect();
      
      const top = rect.top - editorRect.top;
      const height = rect.height;
      
      return (
        <div
          key={`selection-${index}`}
          className="block-selection-indicator"
          style={{
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: isMultiSelectMode ? '#10b981' : '#3b82f6'
          }}
        />
      );
    });
  };
  
  return (
    <div className="block-selection-manager">
      <style>{`
        .block-selection-manager {
          position: relative;
        }
        
        .block-selection-indicator {
          position: absolute;
          left: -20px;
          width: 4px;
          background-color: #3b82f6;
          border-radius: 2px;
          transition: top 0.2s ease, height 0.2s ease;
          pointer-events: none;
        }
        
        .multi-select-indicator {
          position: fixed;
          top: 10px;
          right: 10px;
          background-color: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 100;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {renderSelectionIndicators()}
      
      {isMultiSelectMode && (
        <div className="multi-select-indicator">
          Mode multi-sélection ({selectedBlocks.length} blocs)
        </div>
      )}
      
      {children}
    </div>
  );
}