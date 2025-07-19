/**
 * Menu de sélection des blocs pour l'éditeur universel
 */

import React, { useState, useEffect, useRef } from 'react';
import { BlockMenuProps } from './types';
import { AVAILABLE_BLOCKS } from './constants';

export function BlockMenu({ isOpen, position, onBlockSelect, onClose, initialQuery = '' }: BlockMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
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
      className="block-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm w-80 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: Math.min(position.x, window.innerWidth - 320 - 20), // Éviter le débordement à droite
        top: position.y,
        maxHeight: '400px'
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
      <div className="max-h-80 overflow-y-auto">
        {filteredBlocks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Aucun bloc trouvé pour "{searchQuery}"
          </div>
        ) : (
          Object.entries(blocksByCategory).map(([category, blocks]) => (
            <div key={category} className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {categoryNames[category as keyof typeof categoryNames]}
              </div>
              {blocks.map((block, blockIndex) => {
                const globalIndex = filteredBlocks.indexOf(block);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <button
                    key={block.id}
                    className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => onBlockSelect(block.id)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">
                      {block.icon}
                    </span>
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
    </div>
  );
}