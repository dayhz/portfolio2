/**
 * Constantes et configuration pour l'éditeur universel
 */

import { BlockType } from './types';

// Configuration des blocs disponibles
export const AVAILABLE_BLOCKS: BlockType[] = [
  {
    id: 'image-full',
    name: 'Image Pleine Largeur',
    category: 'media',
    icon: '🖼️',
    preview: '/previews/image-full.png',
    description: 'Image qui prend toute la largeur de la section'
  },
  {
    id: 'image-16-9',
    name: 'Image 16:9',
    category: 'media',
    icon: '📐',
    preview: '/previews/image-16-9.png',
    description: 'Image avec ratio 16:9 pour un rendu harmonieux'
  },
  {
    id: 'image-grid',
    name: 'Grille d\'Images',
    category: 'media',
    icon: '⚏',
    preview: '/previews/image-grid.png',
    description: 'Deux images côte à côte en grille'
  },
  {
    id: 'rich-text',
    name: 'Texte Riche',
    category: 'text',
    icon: '📝',
    preview: '/previews/rich-text.png',
    description: 'Bloc de texte avec formatage avancé'
  },
  {
    id: 'simple-text',
    name: 'Texte Simple',
    category: 'text',
    icon: '📄',
    preview: '/previews/simple-text.png',
    description: 'Bloc de texte simple sans formatage'
  },
  {
    id: 'heading-1',
    name: 'Titre H1',
    category: 'text',
    icon: '🏷️',
    preview: '/previews/heading-1.png',
    description: 'Titre principal de niveau 1'
  },
  {
    id: 'heading-2',
    name: 'Titre H2',
    category: 'text',
    icon: '🔖',
    preview: '/previews/heading-2.png',
    description: 'Titre de section de niveau 2'
  },
  {
    id: 'heading-3',
    name: 'Titre H3',
    category: 'text',
    icon: '📌',
    preview: '/previews/heading-3.png',
    description: 'Sous-titre de niveau 3'
  },
  {
    id: 'testimony',
    name: 'Témoignage',
    category: 'text',
    icon: '💬',
    preview: '/previews/testimony.png',
    description: 'Citation avec profil de l\'auteur'
  },
  {
    id: 'video',
    name: 'Vidéo',
    category: 'media',
    icon: '🎥',
    preview: '/previews/video.png',
    description: 'Vidéo avec contrôles de lecture'
  },
  {
    id: 'about-section',
    name: 'Section À Propos',
    category: 'layout',
    icon: '📋',
    preview: '/previews/about-section.png',
    description: 'Section avec informations projet (client, année, etc.)'
  }
];

// Classes CSS du site à préserver
export const SITE_CSS_CLASSES = {
  section: 'section',
  container: 'u-container',
  imageContainer: 'temp-img_container',
  image: 'comp-img',
  imageWrapper: 'img-wrp',
  richText: 'temp-rich u-color-dark w-richtext',
  simpleText: 'temp-comp-text',
  testimony: 'temp-comp-testimony',
  imageGrid: 'temp-comp-img_grid',
  gridContainer: 'img_grid-container',
  videoWrapper: 'video-wrp',
  aboutContainer: 'temp-about_container',
  aboutContent: 'temp-about_content',
  aboutInfos: 'temp-about_infos',
  sectionSpace: 'g_section_space'
} as const;

// Variants d'images supportés
export const IMAGE_VARIANTS = {
  FULL: 'auto',
  RATIO_16_9: '16-9',
  AUTO: 'auto'
} as const;

// Tailles d'images supportées
export const IMAGE_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

// Formats de fichiers supportés
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/avif'
];

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

// Limites de taille
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024  // 50MB
};

// Configuration de l'auto-sauvegarde
export const AUTO_SAVE_CONFIG = {
  DEBOUNCE_DELAY: 1000, // 1 seconde
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000 // 2 secondes
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  IMAGE_TOO_LARGE: 'Image trop volumineuse (maximum 10MB)',
  VIDEO_TOO_LARGE: 'Vidéo trop volumineuse (maximum 50MB)',
  UNSUPPORTED_IMAGE_FORMAT: 'Format d\'image non supporté (JPG, PNG, WebP, AVIF uniquement)',
  UNSUPPORTED_VIDEO_FORMAT: 'Format de vidéo non supporté (MP4, WebM, OGG uniquement)',
  UPLOAD_FAILED: 'Échec du téléchargement, veuillez réessayer',
  SAVE_FAILED: 'Échec de la sauvegarde, veuillez réessayer',
  NETWORK_ERROR: 'Erreur réseau, vérifiez votre connexion'
};