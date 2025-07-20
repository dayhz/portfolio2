/**
 * Hook pour charger dynamiquement les extensions Tiptap avec code splitting
 */

import { useState, useEffect } from 'react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { lazyLoadService } from '../services/LazyLoadService';
import { cacheService, CacheEntryType } from '../services/CacheService';

// Extensions de base toujours chargées
const baseExtensions = [
  StarterKit.configure({
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
];

// Types d'extensions disponibles
export type ExtensionType = 
  | 'heading'
  | 'image'
  | 'text'
  | 'testimony'
  | 'imageGrid'
  | 'video'
  | 'all';

// Interface pour les options du hook
interface UseExtensionLoaderOptions {
  initialExtensions?: ExtensionType[];
  onLoad?: (extensions: Extension[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour charger dynamiquement les extensions Tiptap
 */
export function useExtensionLoader({
  initialExtensions = ['heading'],
  onLoad,
  onError
}: UseExtensionLoaderOptions = {}) {
  const [extensions, setExtensions] = useState<Extension[]>(baseExtensions);
  const [loadedExtensionTypes, setLoadedExtensionTypes] = useState<ExtensionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Charger les extensions initiales
  useEffect(() => {
    if (initialExtensions.includes('all')) {
      loadAllExtensions();
    } else {
      loadExtensions(initialExtensions);
    }
  }, []);

  /**
   * Charger des extensions spécifiques
   * @param extensionTypes Types d'extensions à charger
   */
  const loadExtensions = async (extensionTypes: ExtensionType[]) => {
    // Filtrer les extensions déjà chargées
    const extensionsToLoad = extensionTypes.filter(
      type => !loadedExtensionTypes.includes(type)
    );

    if (extensionsToLoad.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newExtensions: Extension[] = [];

      // Charger chaque extension en parallèle
      await Promise.all(
        extensionsToLoad.map(async (type) => {
          try {
            let extension: Extension | null = null;

            // Vérifier si l'extension est en cache
            const cacheKey = `extension:${type}`;
            const cachedExtension = cacheService.get<Extension>(cacheKey);

            if (cachedExtension) {
              extension = cachedExtension;
            } else {
              // Charger l'extension dynamiquement
              switch (type) {
                case 'heading': {
                  const { HeadingExtension } = await import('../extensions/HeadingExtension');
                  extension = HeadingExtension;
                  break;
                }
                case 'image': {
                  const { ImageExtension } = await import('../extensions/ImageExtension');
                  extension = ImageExtension;
                  break;
                }
                case 'text': {
                  const { TextExtension } = await import('../extensions/TextExtension');
                  extension = TextExtension;
                  break;
                }
                case 'testimony': {
                  const { TestimonyExtension } = await import('../extensions/TestimonyExtension');
                  extension = TestimonyExtension;
                  break;
                }
                case 'imageGrid': {
                  const { ImageGridExtension } = await import('../extensions/ImageGridExtension');
                  extension = ImageGridExtension;
                  break;
                }
                case 'video': {
                  const { VideoExtension } = await import('../extensions/VideoExtension');
                  extension = VideoExtension;
                  break;
                }
              }

              // Mettre en cache l'extension
              if (extension) {
                cacheService.set(
                  cacheKey,
                  extension,
                  1024, // Taille estimée
                  CacheEntryType.COMPONENT,
                  { type }
                );
              }
            }

            if (extension) {
              newExtensions.push(extension);
            }
          } catch (err) {
            console.error(`Erreur lors du chargement de l'extension ${type}:`, err);
            throw err;
          }
        })
      );

      // Mettre à jour les extensions
      setExtensions(prev => [...prev, ...newExtensions]);
      setLoadedExtensionTypes(prev => [...prev, ...extensionsToLoad]);

      // Notifier le chargement
      if (onLoad) {
        onLoad([...extensions, ...newExtensions]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charger toutes les extensions disponibles
   */
  const loadAllExtensions = async () => {
    await loadExtensions(['heading', 'image', 'text', 'testimony', 'imageGrid', 'video']);
  };

  /**
   * Précharger des extensions pour une utilisation future
   * @param extensionTypes Types d'extensions à précharger
   */
  const preloadExtensions = (extensionTypes: ExtensionType[]) => {
    // Filtrer les extensions déjà chargées
    const extensionsToPreload = extensionTypes.filter(
      type => !loadedExtensionTypes.includes(type)
    );

    // Précharger chaque extension
    extensionsToPreload.forEach(type => {
      switch (type) {
        case 'heading':
          lazyLoadService.preloadComponent('HeadingExtension');
          break;
        case 'image':
          lazyLoadService.preloadComponent('ImageExtension');
          break;
        case 'text':
          lazyLoadService.preloadComponent('TextExtension');
          break;
        case 'testimony':
          lazyLoadService.preloadComponent('TestimonyExtension');
          break;
        case 'imageGrid':
          lazyLoadService.preloadComponent('ImageGridExtension');
          break;
        case 'video':
          lazyLoadService.preloadComponent('VideoExtension');
          break;
      }
    });
  };

  return {
    extensions,
    loadedExtensionTypes,
    isLoading,
    error,
    loadExtensions,
    loadAllExtensions,
    preloadExtensions
  };
}