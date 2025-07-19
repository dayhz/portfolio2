/**
 * Utilitaires pour l'éditeur universel
 */

import { SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from './constants';
import { UploadError, ValidationResult, ProjectContent } from './types';

/**
 * Valide un fichier image avant upload
 */
export const validateImageFile = (file: File): UploadError | null => {
  // Vérifier le format
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      type: 'format',
      message: ERROR_MESSAGES.UNSUPPORTED_IMAGE_FORMAT,
      file
    };
  }

  // Vérifier la taille
  if (file.size > FILE_SIZE_LIMITS.IMAGE) {
    return {
      type: 'size',
      message: ERROR_MESSAGES.IMAGE_TOO_LARGE,
      file
    };
  }

  return null;
};

/**
 * Valide un fichier vidéo avant upload
 */
export const validateVideoFile = (file: File): UploadError | null => {
  // Vérifier le format
  if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    return {
      type: 'format',
      message: ERROR_MESSAGES.UNSUPPORTED_VIDEO_FORMAT,
      file
    };
  }

  // Vérifier la taille
  if (file.size > FILE_SIZE_LIMITS.VIDEO) {
    return {
      type: 'size',
      message: ERROR_MESSAGES.VIDEO_TOO_LARGE,
      file
    };
  }

  return null;
};

/**
 * Convertit un fichier en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Génère un ID unique pour les blocs
 */
export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valide le contenu d'un projet
 */
export const validateProjectContent = (content: ProjectContent): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier les champs obligatoires
  if (!content.title?.trim()) {
    errors.push('Le titre du projet est obligatoire');
  }

  if (!content.description?.trim()) {
    warnings.push('La description du projet est recommandée');
  }

  // Vérifier les blocs
  content.blocks.forEach((block, index) => {
    if (!block.id) {
      errors.push(`Bloc ${index + 1} sans identifiant`);
    }

    if (!block.type) {
      errors.push(`Bloc ${index + 1} sans type défini`);
    }

    // Vérifications spécifiques par type
    switch (block.type) {
      case 'universalImage':
        if (!block.attributes?.src) {
          errors.push(`Image ${index + 1} sans source`);
        }
        break;
      
      case 'universalText':
        if (!block.content?.trim() && !block.attributes?.content?.trim()) {
          warnings.push(`Bloc de texte ${index + 1} vide`);
        }
        break;
      
      case 'testimony':
        if (!block.attributes?.quote?.trim()) {
          errors.push(`Témoignage ${index + 1} sans citation`);
        }
        if (!block.attributes?.authorName?.trim()) {
          warnings.push(`Témoignage ${index + 1} sans nom d'auteur`);
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Nettoie le HTML généré pour l'export
 */
export const cleanHTMLForExport = (html: string): string => {
  return html
    // Supprimer les attributs de l'éditeur
    .replace(/data-pm-[^=]*="[^"]*"/g, '')
    .replace(/contenteditable="[^"]*"/g, '')
    .replace(/spellcheck="[^"]*"/g, '')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    // Nettoyer les balises vides
    .replace(/<([^>]+)>\s*<\/\1>/g, '')
    .trim();
};

/**
 * Génère les métadonnées d'un projet
 */
export const generateProjectMetadata = (content: string) => {
  const now = new Date().toISOString();
  
  return {
    createdAt: now,
    updatedAt: now,
    wordCount: content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    blockCount: (content.match(/<div[^>]*data-type="[^"]*"/g) || []).length,
    hasImages: content.includes('comp-img'),
    hasVideos: content.includes('video'),
    hasTestimonies: content.includes('temp-comp-testimony')
  };
};

/**
 * Debounce function pour l'auto-sauvegarde
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Formate la taille d'un fichier pour l'affichage
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Vérifie si une URL est valide
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};