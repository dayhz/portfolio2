/**
 * Menu de sélection des blocs pour l'éditeur universel
 */

import React, { useState, useEffect, useRef } from 'react';
import { BlockMenuProps } from './types';
import { AVAILABLE_BLOCKS } from './constants';
import { BlockPreview, BlockTooltip } from './components';

export function BlockMenu({ isOpen, position, onBlockSelect, onClose, initialQuery = '' }: BlockMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filtrer les blocs selon la recherche
  const filteredBlocks = AVAILABLE_BLOCKS.filter(block =>
    block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gérer la navigation clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredBlocks.length - 1 ? prev + 1 : 0
          );
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredBlocks.length - 1
          );
          break;
        
        case 'Enter':
          event.preventDefault();
          if (filteredBlocks[selectedIndex]) {
            onBlockSelect(filteredBlocks[selectedIndex].id);
          }
          break;
        
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredBlocks, onBlockSelect, onClose]);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Reset de la sélection quand les blocs filtrés changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Gestion des tooltips
  const handleBlockHover = (blockId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 12,
      y: rect.top
    });
    setHoveredBlock(blockId);
    
    // Délai avant d'afficher le tooltip
    setTimeout(() => {
      if (hoveredBlock === blockId) {
        setShowTooltip(true);
      }
    }, 500);
  };

  const handleBlockLeave = () => {
    setShowTooltip(false);
    setHoveredBlock(null);
  };

  if (!isOpen) return null;

  // Grouper les blocs par catégorie
  const blocksByCategory = filteredBlocks.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, typeof filteredBlocks>);

  const categoryNames = {
    media: 'Médias',
    text: 'Texte',
    layout: 'Mise en page'
  };

  const categoryIcons = {
    media: '🎨',
    text: '📝',
    layout: '📐'
  };

  return (
    <div
      ref={menuRef}
      className="block-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-96 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: Math.min(500, window.innerHeight - position.y - 20) + 'px'
      }}
    >
      {/* En-tête avec recherche */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Rechercher un bloc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {/* Liste des blocs */}
      <div 
        className="overflow-y-auto custom-scrollbar"
        style={{
          maxHeight: Math.min(400, window.innerHeight - position.y - 120) + 'px'
        }}
      >
        {filteredBlocks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Aucun bloc trouvé pour "{searchQuery}"
          </div>
        ) : (
          Object.entries(blocksByCategory).map(([category, blocks]) => (
            <div key={category} className="py-1">
              <div className="sticky top-0 category-header z-10 px-3 py-3 border-b border-gray-100 mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {blocks.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {category === 'media' && 'Images, vidéos et contenus visuels'}
                      {category === 'text' && 'Textes, citations et témoignages'}
                      {category === 'layout' && 'Sections et mises en page'}
                    </p>
                  </div>
                </div>
              </div>
              {blocks.map((block, blockIndex) => {
                const globalIndex = filteredBlocks.indexOf(block);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <button
                    style={{
                      animationDelay: `${blockIndex * 50}ms`,
                      animation: 'slideInFromLeft 0.3s ease-out forwards'
                    }}
                    key={block.id}
                    className={`w-full flex items-center px-3 py-3 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => onBlockSelect(block.id)}
                    onMouseEnter={(e) => {
                      setSelectedIndex(globalIndex);
                      handleBlockHover(block.id, e);
                    }}
                    onMouseLeave={handleBlockLeave}
                  >
                    <div className="mr-3 flex-shrink-0">
                      <BlockPreview block={block} isSelected={isSelected} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {block.name}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {block.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pied avec instructions */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          .block-menu {
            backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #e5e7eb;
          }
          
          .category-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 3px solid #3b82f6;
          }
          
          .block-menu button {
            transition: all 0.15s ease;
          }
          
          .block-menu button:hover {
            transform: translateX(2px);
          }
          
          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInFromTop {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .category-header {
            animation: slideInFromTop 0.3s ease-out;
          }
        `}</style>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white rounded text-xs">↑↓</kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white rounded text-xs">↵</kbd>
              Sélectionner
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white rounded text-xs">Esc</kbd>
            Fermer
          </span>
        </div>
      </div>

      {/* Tooltip détaillé */}
      {showTooltip && hoveredBlock && (
        <BlockTooltip
          block={filteredBlocks.find(b => b.id === hoveredBlock)!}
          isVisible={showTooltip}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}