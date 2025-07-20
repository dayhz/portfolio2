/**
 * Service pour exporter le contenu de l'éditeur vers différents formats
 * et l'intégrer dans les templates du site
 */

export interface ExportOptions {
  cleanupEditorClasses?: boolean;
  optimizeImages?: boolean;
  minifyHtml?: boolean;
  templateType?: string;
  validateContent?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContentExportService {
  /**
   * Exporte le contenu de l'éditeur vers le format HTML final
   */
  static exportToHtml(content: string, options: ExportOptions = {}): string {
    let result = content;
    
    // Nettoyer les classes d'édition si demandé
    if (options.cleanupEditorClasses) {
      result = this.cleanupEditorClasses(result);
    }
    
    // Optimiser les images si demandé
    if (options.optimizeImages) {
      result = this.optimizeImages(result);
    }
    
    // Appliquer les transformations spécifiques au template
    if (options.templateType) {
      result = this.applyTemplateTransformations(result, options.templateType);
    }
    
    // Minifier le HTML si demandé
    if (options.minifyHtml) {
      result = this.minifyHtml(result);
    }
    
    return result;
  }
  
  /**
   * Exporte le contenu de l'éditeur vers le format JSON
   */
  static exportToJson(content: string, options: ExportOptions = {}): any {
    // Extraire les sections du contenu
    const sections = this.extractSections(content);
    
    // Convertir en structure JSON
    const blocks = this.convertToBlocks(sections);
    
    // Appliquer les transformations spécifiques au template
    if (options.templateType) {
      this.applyTemplateTransformationsToJson(blocks, options.templateType);
    }
    
    return {
      version: '1.0',
      templateType: options.templateType || 'default',
      blocks,
      metadata: {
        exportedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Valide le contenu avant export
   */
  static validateContent(content: string, templateType?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Analyser le HTML
    const root = parse(content);
    
    // Vérifier les images sans alt text
    const imagesWithoutAlt = root.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      warnings.push(`${imagesWithoutAlt.length} image(s) sans texte alternatif`);
    }
    
    // Vérifier les liens sans texte
    const emptyLinks = root.querySelectorAll('a:empty');
    if (emptyLinks.length > 0) {
      warnings.push(`${emptyLinks.length} lien(s) sans texte`);
    }
    
    // Vérifier les vidéos sans contrôles
    const videosWithoutControls = root.querySelectorAll('video:not([controls])');
    if (videosWithoutControls.length > 0) {
      warnings.push(`${videosWithoutControls.length} vidéo(s) sans contrôles`);
    }
    
    // Vérifications spécifiques au template
    if (templateType) {
      const templateErrors = this.validateTemplateSpecificContent(root, templateType);
      errors.push(...templateErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Intègre le contenu dans un template
   */
  static integrateWithTemplate(content: string, templateHtml: string, placeholderId: string): string {
    const templateRoot = parse(templateHtml);
    const placeholder = templateRoot.querySelector(`#${placeholderId}`);
    
    if (!placeholder) {
      throw new Error(`Placeholder #${placeholderId} non trouvé dans le template`);
    }
    
    // Remplacer le contenu du placeholder
    placeholder.set_content(content);
    
    return templateRoot.toString();
  }
  
  /**
   * Nettoie les classes utilisées uniquement pour l'édition
   */
  private static cleanupEditorClasses(root: HTMLElement): void {
    // Supprimer les classes d'édition
    const editorClasses = [
      'ProseMirror',
      'ProseMirror-focused',
      'selected',
      'editing',
      'drag-over',
      'dragging',
      'universal-editor-content'
    ];
    
    editorClasses.forEach(className => {
      root.querySelectorAll(`.${className}`).forEach(element => {
        element.classList.remove(className);
      });
    });
    
    // Supprimer les attributs data spécifiques à l'éditeur
    root.querySelectorAll('[data-drag-handle]').forEach(element => {
      element.removeAttribute('data-drag-handle');
    });
    
    root.querySelectorAll('[contenteditable]').forEach(element => {
      element.removeAttribute('contenteditable');
    });
  }
  
  /**
   * Optimise les images pour le site
   */
  private static optimizeImages(root: HTMLElement): void {
    // Ajouter les attributs de chargement paresseux
    root.querySelectorAll('img').forEach(img => {
      img.setAttribute('loading', 'lazy');
      
      // Ajouter des classes pour les effets de transition
      img.classList.add('fade-in');
      
      // Vérifier si l'image a un alt text
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        img.setAttribute('alt', 'Image');
      }
    });
    
    // Optimiser les vidéos
    root.querySelectorAll('video').forEach(video => {
      video.setAttribute('preload', 'metadata');
      
      // S'assurer que les vidéos ont des contrôles
      if (!video.hasAttribute('controls')) {
        video.setAttribute('controls', 'true');
      }
    });
  }
  
  /**
   * Applique des transformations spécifiques au template
   */
  private static applyTemplateTransformations(root: HTMLElement, templateType: string): void {
    switch (templateType.toLowerCase()) {
      case 'poesial':
        // Transformations spécifiques à Poesial
        root.querySelectorAll('.section').forEach(section => {
          section.classList.add('poesial-section');
        });
        break;
        
      case 'zesty':
        // Transformations spécifiques à Zesty
        root.querySelectorAll('.section').forEach(section => {
          section.classList.add('zesty-section');
        });
        break;
        
      case 'ordine':
        // Transformations spécifiques à Ordine
        root.querySelectorAll('.section').forEach(section => {
          section.classList.add('ordine-section');
        });
        break;
        
      case 'nobe':
        // Transformations spécifiques à Nobe
        root.querySelectorAll('.section').forEach(section => {
          section.classList.add('nobe-section');
        });
        break;
        
      default:
        // Transformations par défaut
        break;
    }
  }
  
  /**
   * Applique des transformations spécifiques au template pour le format JSON
   */
  private static applyTemplateTransformationsToJson(blocks: any[], templateType: string): void {
    // Ajouter des métadonnées spécifiques au template
    blocks.forEach(block => {
      block.templateType = templateType;
    });
  }
  
  /**
   * Convertit le HTML en structure de blocs JSON
   */
  private static convertToBlocks(root: HTMLElement): any[] {
    const blocks: any[] = [];
    
    // Parcourir les sections
    root.querySelectorAll('.section').forEach((section, index) => {
      const blockType = this.determineBlockType(section);
      
      const block: any = {
        id: `block-${index}`,
        type: blockType,
        content: section.toString(),
        position: index
      };
      
      // Extraire les attributs spécifiques selon le type de bloc
      switch (blockType) {
        case 'image':
          const img = section.querySelector('img');
          if (img) {
            block.attributes = {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              variant: section.getAttribute('data-wf--template-section-image--variant') || 'auto'
            };
          }
          break;
          
        case 'video':
          const video = section.querySelector('video');
          if (video) {
            block.attributes = {
              src: video.getAttribute('src'),
              controls: video.hasAttribute('controls'),
              autoplay: video.hasAttribute('autoplay'),
              loop: video.hasAttribute('loop'),
              muted: video.hasAttribute('muted')
            };
          }
          break;
          
        case 'text':
          const textContainer = section.querySelector('.temp-rich, .temp-comp-text');
          if (textContainer) {
            block.attributes = {
              variant: textContainer.classList.contains('temp-rich') ? 'rich' : 'simple',
              content: textContainer.innerHTML
            };
          }
          break;
          
        case 'testimony':
          const quote = section.querySelector('.testimony');
          const authorName = section.querySelector('.testimony-profile-name');
          const authorRole = section.querySelector('.testimony-profile-role');
          const authorImage = section.querySelector('.testimonial-img-item');
          
          block.attributes = {
            quote: quote ? quote.innerHTML : '',
            authorName: authorName ? authorName.innerHTML : '',
            authorRole: authorRole ? authorRole.innerHTML : '',
            authorImage: authorImage ? authorImage.getAttribute('src') : null
          };
          break;
          
        case 'imageGrid':
          const images = section.querySelectorAll('img');
          block.attributes = {
            images: Array.from(images).map(img => ({
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt')
            })),
            layout: '2-columns'
          };
          break;
      }
      
      blocks.push(block);
    });
    
    return blocks;
  }
  
  /**
   * Détermine le type de bloc à partir d'une section
   */
  private static determineBlockType(section: HTMLElement): string {
    if (section.querySelector('.temp-img')) {
      return 'image';
    }
    
    if (section.querySelector('video')) {
      return 'video';
    }
    
    if (section.querySelector('.temp-comp-img_grid')) {
      return 'imageGrid';
    }
    
    if (section.querySelector('.temp-comp-testimony')) {
      return 'testimony';
    }
    
    if (section.querySelector('.temp-rich, .temp-comp-text')) {
      return 'text';
    }
    
    if (section.querySelector('.temp-about_container')) {
      return 'about';
    }
    
    return 'unknown';
  }
  
  /**
   * Valide le contenu spécifique à un template
   */
  private static validateTemplateSpecificContent(root: HTMLElement, templateType: string): string[] {
    const errors: string[] = [];
    
    switch (templateType.toLowerCase()) {
      case 'poesial':
        // Vérifications spécifiques à Poesial
        if (!root.querySelector('.temp-about_container')) {
          errors.push('Le template Poesial nécessite une section "À propos"');
        }
        break;
        
      case 'zesty':
        // Vérifications spécifiques à Zesty
        if (!root.querySelector('.temp-comp-testimony')) {
          errors.push('Le template Zesty nécessite au moins un témoignage');
        }
        break;
        
      case 'ordine':
        // Vérifications spécifiques à Ordine
        break;
        
      case 'nobe':
        // Vérifications spécifiques à Nobe
        break;
    }
    
    return errors;
  }
  
  /**
   * Minifie le HTML
   */
  private static minifyHtml(html: string): string {
    return html
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }
}