import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

import { Upload } from 'react-iconly';

export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'quote';

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: string;
  imageFile?: File;
}

interface NotionEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

interface BlockMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  filter: string;
}

const blockTypes = [
  { type: 'paragraph' as BlockType, label: 'Paragraphe', description: 'Texte normal', icon: '📝' },
  { type: 'heading1' as BlockType, label: 'Titre 1', description: 'Grand titre', icon: 'H1' },
  { type: 'heading2' as BlockType, label: 'Titre 2', description: 'Titre moyen', icon: 'H2' },
  { type: 'heading3' as BlockType, label: 'Titre 3', description: 'Petit titre', icon: 'H3' },
  { type: 'image' as BlockType, label: 'Image', description: 'Ajouter une image', icon: '🖼️' },
  { type: 'quote' as BlockType, label: 'Citation', description: 'Citation ou témoignage', icon: '💬' },
];

function BlockMenu({ isOpen, position, onSelect, onClose, filter }: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredBlocks = blockTypes.filter(block => 
    block.label.toLowerCase().includes(filter.toLowerCase()) ||
    block.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64"
      style={{ 
        top: Math.min(position.top, window.innerHeight - 300), // Évite que le menu sorte de l'écran
        left: Math.min(position.left, window.innerWidth - 256) // 256px = min-w-64
      }}
    >
      <div className="text-xs text-gray-500 px-2 py-1 border-b mb-2">
        Choisir un type de bloc
      </div>
      {filteredBlocks.length > 0 ? (
        filteredBlocks.map((block) => (
          <button
            key={block.type}
            onClick={() => onSelect(block.type)}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
          >
            <span className="text-lg">{block.icon}</span>
            <div>
              <div className="font-medium text-sm">{block.label}</div>
              <div className="text-xs text-gray-500">{block.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">
          Aucun bloc trouvé pour "{filter}"
        </div>
      )}
    </div>
  );
}

interface EditableBlockProps {
  block: EditorBlock;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onImageUpload: (file: File) => void;
  onEnter: () => void;
  onBackspace: () => void;
  onSlashCommand: (position: { top: number; left: number }) => void;
  onFocus: () => void;
}

function EditableBlock({ 
  block, 
  isActive, 
  onUpdate, 
  onImageUpload, 
  onEnter, 
  onBackspace, 
  onSlashCommand,
  onFocus 
}: EditableBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && (textareaRef.current || inputRef.current)) {
      const element = textareaRef.current || inputRef.current;
      element?.focus();
      // Place le curseur à la fin
      const length = element?.value.length || 0;
      element?.setSelectionRange(length, length);
    }
  }, [isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onBackspace();
    } else if (e.key === '/' && block.content === '') {
      e.preventDefault();
      // Calcul de position plus robuste pour les modals
      const element = e.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      onSlashCommand({
        top: rect.bottom + scrollTop + 5,
        left: rect.left + scrollLeft
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading1': return 'Titre 1';
      case 'heading2': return 'Titre 2';
      case 'heading3': return 'Titre 3';
      case 'quote': return 'Citation...';
      case 'paragraph': return 'Tapez "/" pour les commandes ou commencez à écrire...';
      default: return 'Tapez quelque chose...';
    }
  };

  const getClassName = () => {
    const baseClass = "w-full bg-transparent border-none outline-none resize-none";
    switch (block.type) {
      case 'heading1': return `${baseClass} text-3xl font-bold`;
      case 'heading2': return `${baseClass} text-2xl font-semibold`;
      case 'heading3': return `${baseClass} text-xl font-medium`;
      case 'quote': return `${baseClass} text-lg italic border-l-4 border-gray-300 pl-4`;
      default: return `${baseClass} text-base`;
    }
  };

  if (block.type === 'image') {
    return (
      <div className="my-4">
        {block.content ? (
          <div className="relative group">
            <img
              src={block.content}
              alt="Contenu"
              className="max-w-full h-auto rounded-lg border"
            />
            {/* Bouton pour ajouter un bloc après l'image */}
            <div className="flex justify-center mt-2">
              <button
                onClick={onEnter}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-sm text-gray-600"
              >
                + Ajouter un bloc
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`image-upload-${block.id}`}
            />
            <label htmlFor={`image-upload-${block.id}`} className="cursor-pointer">
              <div className="mx-auto mb-2 text-gray-400">
                <Upload size="large" />
              </div>
              <p className="text-sm text-gray-600">
                Cliquez pour ajouter une image
              </p>
            </label>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'heading1' || block.type === 'heading2' || block.type === 'heading3') {
    return (
      <input
        ref={inputRef}
        type="text"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={getPlaceholder()}
        className={getClassName()}
      />
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={block.content}
      onChange={(e) => onUpdate(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      placeholder={getPlaceholder()}
      className={getClassName()}
      rows={1}
      style={{ minHeight: '1.5rem' }}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
      }}
    />
  );
}

export function NotionEditor({ blocks, onChange }: NotionEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
    blockId: string | null;
    filter: string;
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    blockId: null,
    filter: ''
  });

  const createNewBlock = (type: BlockType = 'paragraph'): EditorBlock => ({
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content: '',
  });

  const updateBlock = (blockId: string, updates: Partial<EditorBlock>) => {
    console.log('Updating block:', blockId, 'with updates:', updates);
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    console.log('New blocks after update:', newBlocks);
    onChange(newBlocks);
  };

  const addBlockAfter = (afterBlockId: string, newBlock?: EditorBlock) => {
    const blockIndex = blocks.findIndex(b => b.id === afterBlockId);
    const newBlockToAdd = newBlock || createNewBlock();
    const newBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlockToAdd,
      ...blocks.slice(blockIndex + 1)
    ];
    onChange(newBlocks);
    setActiveBlockId(newBlockToAdd.id);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length <= 1) return;
    
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    onChange(newBlocks);
    
    // Focus sur le bloc précédent
    if (blockIndex > 0) {
      setActiveBlockId(blocks[blockIndex - 1].id);
    } else if (newBlocks.length > 0) {
      setActiveBlockId(newBlocks[0].id);
    }
  };

  const handleSlashCommand = (blockId: string, position: { top: number; left: number }) => {
    setMenuState({
      isOpen: true,
      position,
      blockId,
      filter: ''
    });
  };

  const handleBlockTypeSelect = (type: BlockType) => {
    if (menuState.blockId) {
      // Pour les images, on ne vide pas le contenu immédiatement
      const updates: Partial<EditorBlock> = { type };
      if (type !== 'image') {
        updates.content = '';
      }
      updateBlock(menuState.blockId, updates);
      setActiveBlockId(menuState.blockId);
    }
    setMenuState({ ...menuState, isOpen: false });
  };

  const handleImageUpload = (blockId: string, file: File) => {
    console.log('Starting image upload for block:', blockId);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      console.log('Image loaded, updating block with URL:', imageUrl?.substring(0, 50) + '...');
      
      updateBlock(blockId, { 
        content: imageUrl,
        imageFile: file 
      });
      
      // Ajouter automatiquement un nouveau bloc paragraphe après l'image
      setTimeout(() => {
        console.log('Adding new block after image');
        addBlockAfter(blockId);
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // Initialiser avec un bloc vide si aucun bloc
  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createNewBlock()]);
    }
  }, [blocks.length, onChange]);

  return (
    <div className="relative">
      <Card className="p-6 min-h-96">
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="group relative">
              <EditableBlock
                block={block}
                isActive={activeBlockId === block.id}
                onUpdate={(content) => updateBlock(block.id, { content })}
                onImageUpload={(file) => handleImageUpload(block.id, file)}
                onEnter={() => addBlockAfter(block.id)}
                onBackspace={() => removeBlock(block.id)}
                onSlashCommand={(position) => handleSlashCommand(block.id, position)}
                onFocus={() => setActiveBlockId(block.id)}
              />
            </div>
          ))}
        </div>
      </Card>

      <BlockMenu
        isOpen={menuState.isOpen}
        position={menuState.position}
        onSelect={handleBlockTypeSelect}
        onClose={() => setMenuState({ ...menuState, isOpen: false })}
        filter={menuState.filter}
      />
    </div>
  );
}