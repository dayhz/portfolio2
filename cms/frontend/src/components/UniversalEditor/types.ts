/**
 * Types et interfaces pour l'éditeur universel
 */

export interface BlockType {
  id: string;
  name: string;
  category: 'media' | 'text' | 'layout';
  icon: React.ReactNode;
  preview: string;
  description: string;
}

export interface UniversalEditorProps {
  content?: string;
  onChange: (content: string) => void;
  projectId?: string;
  autoSave?: boolean;
}

export interface BlockMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onBlockSelect: (blockType: string) => void;
  onClose: () => void;
  initialQuery?: string;
}

export interface ImageAttributes {
  src: string;
  alt?: string;
  variant: 'full' | '16-9' | 'auto';
  size?: 'small' | 'medium' | 'large';
}

export interface TextAttributes {
  content: string;
  variant: 'rich' | 'simple' | 'about';
}

export interface TestimonyAttributes {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
}

export interface VideoAttributes {
  src: string;
  alt?: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface ImageGridAttributes {
  images: Array<{
    src: string;
    alt?: string;
    hasVideo?: boolean;
    videoSrc?: string;
  }>;
  layout: '2-columns' | '3-columns'; // Layout de la grille
}

export interface ContentBlock {
  id: string;
  type: string;
  attributes: Record<string, any>;
  content?: string;
  position: number;
}

export interface ProjectContent {
  id: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMetadata {
  client?: string;
  year?: string;
  duration?: string;
  type?: string;
  industry?: string;
  scope?: string[];
}

export interface BlockConfig {
  [blockType: string]: {
    extension: any; // Extension Tiptap
    view: React.ComponentType<any>;
    defaultAttributes: Record<string, any>;
    category: 'media' | 'text' | 'layout';
    allowedChildren?: string[];
  };
}

export interface UploadError {
  type: 'size' | 'format' | 'network';
  message: string;
  file?: File;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}