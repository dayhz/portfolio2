/**
 * Composant principal de l'éditeur universel
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { UniversalEditorProps } from './types';
import { BlockMenu } from './BlockMenu';
import { debounce } from './utils';
import { AUTO_SAVE_CONFIG } from './constants';
import { injectSiteStyles, removeSiteStyles } from './utils/styleInjector';
import { useAutoSave } from './hooks/useAutoSave';
import { useVersionHistory } from './hooks/useVersionHistory';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';
import { BackupRecovery } from './components/BackupRecovery';
import { DynamicToolbar } from './components/DynamicToolbar';
import { BlockSelectionManager } from './components/BlockSelectionManager';
import { VersionHistoryPanel } from './components/VersionHistoryPanel';

// Import des extensions
import { ImageExtension } from './extensions/ImageExtension';
import { TextExtension } from './extensions/TextExtension';
import { TestimonyExtension } from './extensions/TestimonyExtension';
import { ImageGridExtension } from './extensions/ImageGridExtension';
import { VideoExtension } from './extensions/VideoExtension';

export function UniversalEditor({ 
  content = '', 
  onChange, 
  projectId,
  autoSave = true 
}: UniversalEditorProps) {
  const [blockMenuState, setBlockMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    query: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, query: '' });

  const [showBackupRecovery, setShowBackupRecovery] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Auto-sauvegarde avec debounce
  const debouncedOnChange = useMemo(
    () => debounce(onChange, AUTO_SAVE_CONFIG.DEBOUNCE_DELAY),
    [onChange]
  );

  // Hook d'auto-sauvegarde
  const { 
    save: autoSaveContent, 
    status: saveStatus, 
    loadFromBackup, 
    clearBackup 
  } = useAutoSave({
    projectId,
    onSave: async (data) => {
      // Ici on pourrait envoyer vers une API
      console.log('Sauvegarde automatique:', data);
      // Pour l'instant, on utilise juste le callback onChange
      onChange(data.content);
    },
    enableLocalBackup: true
  });
  
  // Hook de gestion des versions
  const {
    versions,
    currentVersionIndex,
    isUndoAvailable,
    isRedoAvailable,
    addVersion,
    undo,
    redo,
    restoreVersion,
    labelVersion
  } = useVersionHistory({
    projectId,
    initialContent: content,
    onChange: (newContent) => {
      if (onChange) {
        onChange(newContent);
      }
    }
  });

  // Injecter les styles du site au montage
  useEffect(() => {
    injectSiteStyles();
    
    // Vérifier s'il y a une sauvegarde à récupérer
    const backup = loadFromBackup();
    if (backup && backup.content !== content) {
      setShowBackupRecovery(true);
    }
    
    // Nettoyer au démontage
    return () => {
      removeSiteStyles();
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'tiptap-heading',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'tiptap-blockquote',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'tiptap-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'tiptap-ordered-list',
          },
        },
        // Configurer l'historique intégré
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Titre ${node.attrs.level}...`;
          }
          return 'Tapez "/" pour voir les options ou commencez à écrire...';
        },
      }),
      // Extensions personnalisées
      ImageExtension,
      TextExtension,
      TestimonyExtension,
      ImageGridExtension,
      VideoExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      if (autoSave) {
        // Utiliser l'auto-sauvegarde
        autoSaveContent(html);
        debouncedOnChange(html);
        
        // Ajouter à l'historique des versions (sans label, auto-save)
        addVersion(html);
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'universal-editor-content',
      },
      handleKeyDown: (view, event) => {
        // Détecter la commande slash
        if (event.key === '/' && !blockMenuState.isOpen) {
          const { selection } = view.state;
          const { from } = selection;
          
          // Vérifier que le slash est au début d'une ligne ou après un espace
          const textBefore = view.state.doc.textBetween(Math.max(0, from - 1), from);
          const isValidSlashPosition = textBefore === '' || textBefore === ' ' || textBefore === '\n';
          
          if (isValidSlashPosition) {
            // Calculer la position du menu avec gestion intelligente des bords
            const coords = view.coordsAtPos(from);
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const menuHeight = 500; // Hauteur du menu avec aperçus
            const menuWidth = 384; // w-96 = 384px
            
            let menuX = coords.left;
            let menuY = coords.bottom + 5;
            
            // Gestion horizontale - éviter le débordement à droite
            if (menuX + menuWidth > viewportWidth - 20) {
              menuX = viewportWidth - menuWidth - 20;
            }
            
            // Gestion verticale - positionnement intelligent
            const spaceBelow = viewportHeight - coords.bottom;
            const spaceAbove = coords.top;
            
            if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
              // Plus d'espace au-dessus, positionner au-dessus
              menuY = coords.top - menuHeight - 5;
            } else if (spaceBelow < menuHeight) {
              // Peu d'espace des deux côtés, centrer verticalement
              menuY = Math.max(10, (viewportHeight - menuHeight) / 2);
            }
            
            // S'assurer que le menu reste dans les limites
            menuY = Math.max(10, Math.min(menuY, viewportHeight - menuHeight - 10));
            
            setBlockMenuState({
              isOpen: true,
              position: { x: menuX, y: menuY },
              query: ''
            });
            
            // Empêcher l'insertion du "/" dans l'éditeur pour l'instant
            event.preventDefault();
            return true;
          }
          
          return false; // Laisser le caractère "/" s'insérer
        }
        
        // Fermer le menu avec Escape
        if (event.key === 'Escape' && blockMenuState.isOpen) {
          setBlockMenuState({ isOpen: false, position: { x: 0, y: 0 }, query: '' });
          return true;
        }
        
        // Gérer Backspace dans le menu
        if (event.key === 'Backspace' && blockMenuState.isOpen) {
          if (blockMenuState.query.length > 0) {
            // Supprimer le dernier caractère de la query
            const newQuery = blockMenuState.query.slice(0, -1);
            setBlockMenuState(prev => ({ ...prev, query: newQuery }));
            event.preventDefault();
            return true;
          } else {
            // Si la query est vide, fermer le menu et laisser Backspace agir normalement
            setBlockMenuState({ isOpen: false, position: { x: 0, y: 0 }, query: '' });
            return false;
          }
        }
        
        // Gérer la recherche dans le menu
        if (blockMenuState.isOpen && event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== '/') {
          // Ajouter le caractère à la query de recherche
          const newQuery = blockMenuState.query + event.key;
          setBlockMenuState(prev => ({ ...prev, query: newQuery }));
          
          // Empêcher l'insertion du caractère dans l'éditeur
          event.preventDefault();
          return true;
        }
        
        return false;
      },
    },
  });

  // Gestion de la récupération de sauvegarde
  const handleRestoreBackup = useCallback((backup: any) => {
    if (editor) {
      editor.commands.setContent(backup.content);
      
      // Ajouter à l'historique des versions
      addVersion(backup.content, 'Restauration de sauvegarde');
    }
    clearBackup();
    setShowBackupRecovery(false);
  }, [editor, clearBackup, addVersion]);

  const handleDismissBackup = useCallback(() => {
    clearBackup();
    setShowBackupRecovery(false);
  }, [clearBackup]);
  
  // Gestion de l'historique des versions
  const handleCreateVersion = useCallback(() => {
    if (editor) {
      const html = editor.getHTML();
      addVersion(html, `Version manuelle ${new Date().toLocaleTimeString()}`);
    }
  }, [editor, addVersion]);
  
  const handleRestoreVersion = useCallback((versionId: string) => {
    const version = restoreVersion(versionId);
    if (version && editor) {
      editor.commands.setContent(version.content);
    }
  }, [editor, restoreVersion]);
  
  const handleLabelVersion = useCallback((versionId: string, label: string) => {
    labelVersion(versionId, label);
  }, [labelVersion]);
  
  // Gérer les raccourcis clavier pour undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo avec Ctrl+Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (isUndoAvailable) {
          const version = undo();
          if (version && editor) {
            editor.commands.setContent(version.content);
          }
        }
      }
      
      // Redo avec Ctrl+Y ou Ctrl+Shift+Z
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (isRedoAvailable) {
          const version = redo();
          if (version && editor) {
            editor.commands.setContent(version.content);
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, undo, redo, isUndoAvailable, isRedoAvailable]);

  const handleBlockSelect = useCallback((blockType: string) => {
    if (!editor) return;

    // Insérer le bloc correspondant selon le type
    switch (blockType) {
      case 'image-full':
        editor.chain().focus().setUniversalImage({ variant: 'full' }).run();
        break;
      case 'image-16-9':
        editor.chain().focus().setUniversalImage({ variant: '16-9' }).run();
        break;
      case 'image-grid':
        editor.chain().focus().setImageGrid().run();
        break;
      case 'rich-text':
        editor.chain().focus().setUniversalText({ variant: 'rich' }).run();
        break;
      case 'simple-text':
        editor.chain().focus().setUniversalText({ variant: 'simple' }).run();
        break;
      case 'testimony':
        editor.chain().focus().setTestimony().run();
        break;
      case 'about-section':
        editor.chain().focus().setUniversalText({ variant: 'about' }).run();
        break;
      case 'heading-1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'video':
        editor.chain().focus().setUniversalVideo().run();
        break;
      default:
        console.log(`Type de bloc non implémenté: ${blockType}`);
    }

    // Fermer le menu
    setBlockMenuState({ isOpen: false, position: { x: 0, y: 0 }, query: '' });
  }, [editor]);

  const handleCloseBlockMenu = useCallback(() => {
    setBlockMenuState({ isOpen: false, position: { x: 0, y: 0 }, query: '' });
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Chargement de l'éditeur universel...</p>
      </div>
    );
  }

  return (
    <div className="universal-editor relative">
      {/* Récupération de sauvegarde */}
      {showBackupRecovery && (
        <BackupRecovery
          backup={loadFromBackup()}
          onRestore={handleRestoreBackup}
          onDismiss={handleDismissBackup}
        />
      )}

      {/* Styles locaux pour l'éditeur */}
      <style>{`
        .universal-editor-content {
          outline: none;
          min-height: 400px;
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Styles d'édition Tiptap */
        .universal-editor-content .ProseMirror {
          outline: none;
        }
        
        .universal-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        /* Amélioration visuelle pour l'édition */
        .universal-editor {
          position: relative;
        }
        
        .universal-editor .border-2 {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: border-color 0.2s ease;
        }
        
        .universal-editor .border-2:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Animation pour le menu de blocs */
        .block-menu {
          animation: slideInFromTop 0.2s ease-out;
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

        /* Amélioration des kbd */
        .block-menu kbd {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* Styles pour l'édition en place */
        .universal-editor-content .ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          border-radius: 8px;
        }
        
        /* Styles pour les transitions entre modes */
        .universal-editor-content .editable-block {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        
        .universal-editor-content .editable-block.editing {
          transform: scale(1.005);
        }
        
        /* Styles pour les indicateurs de sélection */
        .universal-editor-content .block-selection-indicator {
          position: absolute;
          left: -20px;
          width: 4px;
          background-color: #3b82f6;
          border-radius: 2px;
          transition: top 0.2s ease, height 0.2s ease;
        }
        
        /* Styles pour les raccourcis clavier */
        .keyboard-shortcut {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .keyboard-shortcut kbd {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
          color: #374151;
          display: inline-block;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          padding: 2px 4px;
          white-space: nowrap;
        }
      `}</style>

      {/* En-tête avec indicateur de sauvegarde */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Éditeur Universel</h3>
          {autoSave && <SaveStatusIndicator status={saveStatus} compact />}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-1"
              onClick={() => setShowVersionHistory(true)}
              title="Historique des versions"
            >
              <span className="text-xs">📋</span>
              <span>Historique</span>
              <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{versions.length}</span>
            </button>
            <button
              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm flex items-center gap-1"
              onClick={handleCreateVersion}
              title="Créer une version"
            >
              <span className="text-xs">📌</span>
              <span>Créer version</span>
            </button>
          </div>
          {autoSave && (
            <SaveStatusIndicator 
              status={saveStatus} 
              showText={true}
              className="text-sm"
            />
          )}
        </div>
      </div>

      {/* Éditeur principal */}
      <div className="border-2 border-gray-200 rounded-lg focus-within:border-blue-500 transition-colors relative">
        <BlockSelectionManager editor={editor}>
          <EditorContent editor={editor} />
          {editor && <DynamicToolbar editor={editor} />}
        </BlockSelectionManager>
      </div>

      {/* Menu de sélection des blocs */}
      {blockMenuState.isOpen && (
        <BlockMenu
          isOpen={blockMenuState.isOpen}
          position={blockMenuState.position}
          onBlockSelect={handleBlockSelect}
          onClose={handleCloseBlockMenu}
          initialQuery={blockMenuState.query}
        />
      )}

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">/</kbd> pour ouvrir le menu des blocs</p>
        <p>• Utilisez <span className="keyboard-shortcut"><kbd>Alt</kbd> + <kbd>↑</kbd>/<kbd>↓</kbd></span> pour naviguer entre les blocs</p>
        <p>• Utilisez <span className="keyboard-shortcut"><kbd>Ctrl</kbd> + <kbd>Z</kbd></span> pour annuler et <span className="keyboard-shortcut"><kbd>Ctrl</kbd> + <kbd>Y</kbd></span> pour rétablir</p>
        <p>• Cliquez sur un bloc pour l'éditer directement</p>
        <p>• L'éditeur sauvegarde automatiquement vos modifications</p>
      </div>
      
      {/* Panneau d'historique des versions */}
      {showVersionHistory && (
        <VersionHistoryPanel
          versions={versions}
          currentVersionIndex={currentVersionIndex}
          onRestoreVersion={handleRestoreVersion}
          onLabelVersion={handleLabelVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}