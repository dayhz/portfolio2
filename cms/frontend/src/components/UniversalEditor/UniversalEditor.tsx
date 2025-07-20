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
import { useContentExport } from './hooks/useContentExport';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';
import { BackupRecovery } from './components/BackupRecovery';
import { DynamicToolbar } from './components/DynamicToolbar';
import { BlockSelectionManager } from './components/BlockSelectionManager';
// VersionHistoryPanel est maintenant importé via lazy loading
// Import des composants lazy loadés
import { 
  LazyContentPreview, 
  LazyTemplateSelector, 
  LazyVersionHistoryPanel,
  preloadFrequentComponents
} from './lazyComponents';
import { SimplePreview } from './components/SimplePreview';
// TemplateSelector est maintenant importé via lazy loading

// Import des extensions
import { ImageExtension } from './extensions/ImageExtension';
import { TextExtension } from './extensions/TextExtension';
import { TestimonyExtension } from './extensions/TestimonyExtension';
import { ImageGridExtension } from './extensions/ImageGridExtension';
import { VideoExtension } from './extensions/VideoExtension';
import { HeadingExtension } from './extensions/HeadingExtension';

export function UniversalEditor({ 
  content = '', 
  onChange, 
  projectId,
  autoSave = true,
  templateType = 'poesial'
}: UniversalEditorProps) {
  const [blockMenuState, setBlockMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    query: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, query: '' });

  const [showBackupRecovery, setShowBackupRecovery] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState(templateType);

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
  
  // Hook d'export de contenu
  const {
    isExporting,
    exportedContent,
    validationResult,
    exportContent,
    exportToJson,
    integrateWithTemplate,
    setExportedContent
  } = useContentExport({
    defaultTemplate: selectedTemplateType,
    onExport: (content: string) => {
      console.log('Export réussi:', content.substring(0, 100) + '...');
    },
    onValidationError: (result) => {
      console.error('Erreur de validation lors de l\'export:', result.errors);
    }
  });

  // Injecter les styles du site au montage et précharger les composants fréquemment utilisés
  useEffect(() => {
    injectSiteStyles();
    
    // Vérifier s'il y a une sauvegarde à récupérer
    const backup = loadFromBackup();
    if (backup && backup.content !== content) {
      setShowBackupRecovery(true);
    }
    
    // Précharger les composants fréquemment utilisés
    // Cela améliore l'expérience utilisateur en chargeant les composants
    // avant qu'ils ne soient nécessaires
    preloadFrequentComponents();
    
    // Nettoyer au démontage
    return () => {
      removeSiteStyles();
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactiver l'extension heading par défaut car nous utilisons notre propre extension
        heading: false,
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
      HeadingExtension,
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
  
  // Gestion de la prévisualisation et de l'export
  const handlePreview = useCallback(() => {
    if (editor) {
      console.log('Prévisualisation avec template:', selectedTemplateType);
      
      // Approche simplifiée : afficher directement le contenu de l'éditeur
      setShowContentPreview(true);
      console.log('showContentPreview défini à true');
      
      /* Ancienne approche avec exportContent
      const html = editor.getHTML();
      console.log('Contenu HTML à prévisualiser:', html.substring(0, 100) + '...');
      
      try {
        const exported = exportContent(html, {
          cleanupEditorClasses: true,
          optimizeImages: true,
          templateName: selectedTemplateType
        });
        
        console.log('Contenu exporté:', exported ? 'Succès' : 'Échec');
        console.log('showContentPreview avant:', showContentPreview);
        
        if (exported) {
          setShowContentPreview(true);
          console.log('showContentPreview après:', true);
        } else {
          console.error('Échec de l\'export du contenu');
        }
      } catch (error) {
        console.error('Erreur lors de la prévisualisation:', error);
      }
      */
    } else {
      console.error('Éditeur non disponible');
    }
  }, [editor, selectedTemplateType]);
  
  // Gestion du changement de template
  const handleTemplateChange = useCallback((newTemplateType: string) => {
    console.log('Changement de template:', newTemplateType);
    setSelectedTemplateType(newTemplateType);
    
    // Forcer une prévisualisation avec le nouveau template
    if (editor) {
      const html = editor.getHTML();
      console.log('Prévisualisation après changement de template');
      const exported = exportContent(html, {
        cleanupEditorClasses: true,
        optimizeImages: true,
        templateName: newTemplateType
      });
      
      if (exported && showContentPreview) {
        // Si la prévisualisation est déjà ouverte, la mettre à jour
        console.log('Mise à jour de la prévisualisation avec le nouveau template');
      }
    }
  }, [editor, exportContent, showContentPreview]);
  
  const handlePublish = useCallback(() => {
    if (editor) {
      setIsPublishing(true);
      
      try {
        const html = editor.getHTML();
        
        // Exporter le contenu
        const exportedHtml = exportContent(html, {
          cleanupEditorClasses: true,
          optimizeImages: true,
          minifyHtml: true,
          templateName: selectedTemplateType,
          validateContent: true
        });
        
        // Exporter également en JSON pour l'API
        const exportedJson = exportToJson(html, {
          metadata: { templateName: selectedTemplateType }
        });
        
        if (exportedHtml && exportedJson) {
          // Ici, vous pourriez envoyer le contenu exporté à une API
          console.log('Publication du contenu:', { html: exportedHtml, json: exportedJson });
          
          // Créer une version étiquetée pour la publication
          addVersion(html, `Publication ${new Date().toLocaleString()}`);
          
          // Fermer la prévisualisation
          setShowContentPreview(false);
          
          // Notifier l'utilisateur
          alert('Contenu publié avec succès!');
        } else {
          throw new Error('Échec de l\'export du contenu');
        }
      } catch (error) {
        console.error('Erreur lors de la publication:', error);
        alert(`Erreur lors de la publication: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsPublishing(false);
      }
    }
  }, [editor, exportContent, exportToJson, selectedTemplateType, addVersion]);
  
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
        console.log('Insertion d\'un titre H1');
        // Utiliser setHeading au lieu de toggleHeading
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        console.log('Insertion d\'un titre H2');
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        console.log('Insertion d\'un titre H3');
        editor.chain().focus().setHeading({ level: 3 }).run();
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
        
        /* Styles pour les titres */
        .universal-editor-content h1,
        .universal-editor-content .universal-heading-1,
        .universal-editor-content .universal-heading[data-level="1"] {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 2rem;
          color: #111827;
          line-height: 1.2;
        }
        
        .universal-editor-content h2,
        .universal-editor-content .universal-heading-2,
        .universal-editor-content .universal-heading[data-level="2"] {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          color: #1f2937;
          line-height: 1.3;
        }
        
        .universal-editor-content h3,
        .universal-editor-content .universal-heading-3,
        .universal-editor-content .universal-heading[data-level="3"] {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1.25rem;
          color: #374151;
          line-height: 1.4;
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
            <button
              className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm flex items-center gap-1"
              onClick={handlePreview}
              title="Prévisualiser"
            >
              <span className="text-xs">👁️</span>
              <span>Prévisualiser</span>
            </button>
            <button
              className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm flex items-center gap-1"
              onClick={() => setShowTemplateSelector(true)}
              title="Changer de template"
            >
              <span className="text-xs">🖼️</span>
              <span>Template: {selectedTemplateType}</span>
            </button>
            <button
              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm flex items-center gap-1"
              onClick={() => {
                console.log('Forcer la prévisualisation');
                if (editor) {
                  const html = editor.getHTML();
                  setExportedContent(html);
                  setShowContentPreview(true);
                }
              }}
              title="Forcer la prévisualisation (debug)"
            >
              <span className="text-xs">🔧</span>
              <span>Debug Preview</span>
            </button>
            <button
              className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-sm flex items-center gap-1"
              onClick={() => {
                console.log('Test des titres');
                if (editor) {
                  // Insérer des titres de test avec la nouvelle approche
                  editor.chain()
                    .focus()
                    .clearContent()
                    .insertContent('<p>Test des titres :</p>')
                    .setHeading({ level: 1 })
                    .insertContent('Titre H1 de test')
                    .insertContent('<p>Paragraphe après H1</p>')
                    .setHeading({ level: 2 })
                    .insertContent('Titre H2 de test')
                    .insertContent('<p>Paragraphe après H2</p>')
                    .setHeading({ level: 3 })
                    .insertContent('Titre H3 de test')
                    .insertContent('<p>Paragraphe après H3</p>')
                    .run();
                }
              }}
              title="Tester les titres"
            >
              <span className="text-xs">📝</span>
              <span>Test Titres</span>
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
      
      {/* Panneau d'historique des versions (lazy loaded) */}
      {showVersionHistory && (
        <LazyVersionHistoryPanel
          versions={versions}
          currentVersionIndex={currentVersionIndex}
          onRestoreVersion={handleRestoreVersion}
          onLabelVersion={handleLabelVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      
      {/* Prévisualisation du contenu */}
      {showContentPreview && editor ? (
        <div>
          <div className="bg-blue-100 p-2 mb-2 rounded">
            Prévisualisation active: Template {selectedTemplateType}
          </div>
          
          {/* Utiliser la prévisualisation simplifiée pour tester */}
          <SimplePreview
            content={editor.getHTML()}
            templateName={selectedTemplateType}
            onClose={() => {
              console.log('Fermeture de la prévisualisation');
              setShowContentPreview(false);
            }}
          />
          
          {/* Version lazy loaded du ContentPreview (commenté pour le moment)
          <LazyContentPreview
            content={exportedContent || editor.getHTML()}
            templateName={selectedTemplateType}
            metadata={{ title: "Prévisualisation", description: "Aperçu du contenu" }}
            onClose={() => {
              console.log('Fermeture de la prévisualisation');
              setShowContentPreview(false);
            }}
            className="mt-4"
          />
          */}
        </div>
      ) : (
        showContentPreview && (
          <div className="bg-red-100 p-4 rounded mt-4">
            Impossible d'afficher la prévisualisation. Contenu exporté non disponible.
          </div>
        )
      )}
      
      {/* Sélecteur de template (lazy loaded) */}
      {showTemplateSelector && (
        <LazyTemplateSelector
          selectedTemplate={selectedTemplateType}
          onTemplateChange={handleTemplateChange}
          className="mt-4"
        />
      )}
    </div>
  );
}