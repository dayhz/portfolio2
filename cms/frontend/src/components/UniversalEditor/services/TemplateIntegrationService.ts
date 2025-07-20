/**
 * Service pour l'intégration des templates
 */

export interface TemplateMetadata {
  title: string;
  description?: string;
  client?: string;
  year?: string;
  type?: string;
  industry?: string;
  headerImage?: string;
  tags?: string[];
  [key: string]: any;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  requiredMetadata: string[];
  optionalMetadata: string[];
}

export class TemplateIntegrationService {
  /**
   * Liste des templates disponibles
   */
  static getAvailableTemplates(): TemplateInfo[] {
    return [
      {
        id: 'poesial',
        name: 'Poesial',
        description: 'Template élégant avec mise en page centrée sur le contenu',
        thumbnail: '/templates/poesial-thumb.jpg',
        requiredMetadata: ['title', 'client', 'year'],
        optionalMetadata: ['description', 'type', 'industry']
      },
      {
        id: 'zesty',
        name: 'Zesty',
        description: 'Template moderne avec accents colorés et mise en page dynamique',
        thumbnail: '/templates/zesty-thumb.jpg',
        requiredMetadata: ['title', 'description'],
        optionalMetadata: ['client', 'year', 'type', 'industry']
      },
      {
        id: 'nobe',
        name: 'Nobe',
        description: 'Template minimaliste avec beaucoup d\'espace blanc',
        thumbnail: '/templates/nobe-thumb.jpg',
        requiredMetadata: ['title', 'headerImage'],
        optionalMetadata: ['description', 'client', 'year']
      },
      {
        id: 'ordine',
        name: 'Ordine',
        description: 'Template structuré avec une mise en page en grille',
        thumbnail: '/templates/ordine-thumb.jpg',
        requiredMetadata: ['title', 'description'],
        optionalMetadata: ['client', 'year', 'type', 'tags']
      }
    ];
  }
  
  /**
   * Récupère les informations d'un template spécifique
   */
  static getTemplateInfo(templateId: string): TemplateInfo | null {
    const templates = this.getAvailableTemplates();
    return templates.find(template => template.id === templateId) || null;
  }
  
  /**
   * Valide les métadonnées pour un template spécifique
   */
  static validateMetadata(templateId: string, metadata: TemplateMetadata): { isValid: boolean; missingFields: string[] } {
    const templateInfo = this.getTemplateInfo(templateId);
    
    if (!templateInfo) {
      return { isValid: false, missingFields: ['Template non trouvé'] };
    }
    
    const missingFields = templateInfo.requiredMetadata.filter(field => !metadata[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
  
  /**
   * Génère un slug à partir du titre
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/--+/g, '-') // Remplacer les tirets multiples par un seul
      .trim();
  }
  
  /**
   * Génère le chemin de fichier pour le projet
   */
  static generateFilePath(templateId: string, metadata: TemplateMetadata): string {
    const slug = this.generateSlug(metadata.title);
    return `${slug}.html`;
  }
  
  /**
   * Prépare les métadonnées pour l'export
   */
  static prepareMetadataForExport(metadata: TemplateMetadata): TemplateMetadata {
    // Ajouter l'année courante si non spécifiée
    if (!metadata.year) {
      metadata.year = new Date().getFullYear().toString();
    }
    
    // Générer un slug
    if (!metadata.slug) {
      metadata.slug = this.generateSlug(metadata.title);
    }
    
    return {
      ...metadata,
      exportedAt: new Date().toISOString()
    };
  }
}