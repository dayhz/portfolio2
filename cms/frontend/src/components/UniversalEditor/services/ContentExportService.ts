/**
 * Service pour exporter le contenu de l'éditeur vers différents formats
 * et l'intégrer dans les templates du site
 */

export interface ExportOptions {
  cleanupEditorClasses?: boolean;
  optimizeImages?: boolean;
  minifyHtml?: boolean;
  validateContent?: boolean;
  templateName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContentExportService {
  /**
   * Exporte le contenu HTML de l'éditeur vers un format compatible avec le site
   */
  static exportToSiteFormat(content: string, options: ExportOptions = {}): string {
    const {
      cleanupEditorClasses = true,
      optimizeImages = true,
      minifyHtml = false,
      validateContent = true
    } = options;
    
    // Nettoyer les classes spécifiques à l'éditeur
    let processedContent = content;
    
    if (cleanupEditorClasses) {
      processedContent = this.cleanupEditorClasses(processedContent);
    }
    
    // Optimiser les images
    if (optimizeImages) {
      processedContent = this.optimizeImages(processedContent);
    }
    
    // Valider le contenu
    if (validateContent) {
      const validationResult = this.validateContent(processedContent);
      if (!validationResult.isValid) {
        console.warn('Validation warnings:', validationResult.warnings);
        console.error('Validation errors:', validationResult.errors);
      }
    }
    
    // Minifier le HTML si demandé
    if (minifyHtml) {
      processedContent = this.minifyHtml(processedContent);
    }
    
    return processedContent;
  }
  
  /**
   * Intègre le contenu dans un template spécifique
   */
  static integrateWithTemplate(content: string, templateName: string, metadata: Record<string, any> = {}): string {
    // Charger le template
    const template = this.getTemplate(templateName);
    
    // Remplacer les placeholders dans le template
    let result = template;
    
    // Injecter le contenu principal
    result = result.replace('{{content}}', content);
    
    // Injecter les métadonnées
    Object.entries(metadata).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    // Ajouter l'année courante
    result = result.replace(/{{currentYear}}/g, new Date().getFullYear().toString());
    
    return result;
  }
  
  /**
   * Exporte le contenu au format JSON pour l'API
   */
  static exportToJson(content: string, metadata: Record<string, any> = {}): string {
    const exportData = {
      content,
      metadata,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData);
  }
  
  /**
   * Nettoie les classes spécifiques à l'éditeur
   */
  private static cleanupEditorClasses(content: string): string {
    // Supprimer les classes liées à l'éditeur
    let result = content;
    
    // Remplacer les classes d'éditeur
    const editorClassPatterns = [
      /\bProseMirror-\w+\b/g,
      /\btiptap-\w+\b/g,
      /\buniversal-editor-\w+\b/g,
      /\beditable-\w+\b/g,
      /\bnode-\w+\b/g,
      /\bselected\b/g
    ];
    
    editorClassPatterns.forEach(pattern => {
      result = result.replace(pattern, '');
    });
    
    // Nettoyer les attributs data spécifiques à l'éditeur
    result = result
      .replace(/\sdata-node-view="[^"]*"/g, '')
      .replace(/\scontenteditable="[^"]*"/g, '');
    
    // Nettoyer les classes vides
    result = result.replace(/\sclass="\s*"/g, '');
    
    return result;
  }
  
  /**
   * Optimise les images pour le site
   */
  private static optimizeImages(content: string): string {
    let result = content;
    
    // Ajouter l'attribut loading="lazy" aux images
    result = result.replace(/<img([^>]*)>/g, '<img$1 loading="lazy">');
    
    // Ajouter la classe fade-in aux images qui ne l'ont pas déjà
    result = result.replace(/<img([^>]*class="[^"]*)"([^>]*)>/g, (match, before, after) => {
      if (!match.includes('fade-in')) {
        return `<img${before} fade-in"${after}>`;
      }
      return match;
    });
    
    // Ajouter un alt vide aux images qui n'en ont pas
    result = result.replace(/<img(?![^>]*alt=)([^>]*)>/g, '<img alt=""$1>');
    
    // Optimiser les vidéos
    result = result.replace(/<video([^>]*)>/g, '<video preload="metadata"$1>');
    result = result.replace(/<video(?![^>]*controls)([^>]*)>/g, '<video controls$1>');
    
    return result;
  }
  
  /**
   * Valide le contenu avant export
   */
  private static validateContent(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Vérifier les images sans alt text
    const imgWithoutAlt = (content.match(/<img(?![^>]*alt=)[^>]*>/g) || []).length;
    if (imgWithoutAlt > 0) {
      warnings.push(`${imgWithoutAlt} image(s) sans attribut alt`);
    }
    
    // Vérifier les liens sans href
    const linksWithoutHref = (content.match(/<a(?![^>]*href=)[^>]*>/g) || []).length;
    if (linksWithoutHref > 0) {
      errors.push(`${linksWithoutHref} lien(s) sans attribut href`);
    }
    
    // Vérifier les vidéos sans source
    const videosWithoutSrc = (content.match(/<video(?![^>]*src=)[^>]*>(?![\s\S]*<source[^>]*>)/g) || []).length;
    if (videosWithoutSrc > 0) {
      errors.push(`${videosWithoutSrc} vidéo(s) sans source`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Minifie le HTML
   */
  private static minifyHtml(html: string): string {
    return html
      .replace(/\n\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*</g, '<')
      .replace(/>\s*/g, '>')
      .trim();
  }
  
  /**
   * Récupère un template par son nom
   */
  private static getTemplate(templateName: string): string {
    // Dans une implémentation réelle, ces templates seraient chargés depuis des fichiers
    // ou une base de données. Pour cet exemple, nous utilisons des templates simplifiés.
    const templates: Record<string, string> = {
      'poesial': `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Victor Berbel</title>
  <meta name="description" content="{{description}}">
  <link rel="stylesheet" href="/styles/poesial.css">
</head>
<body class="poesial-template">
  <header class="site-header"><!-- Header content --></header>
  <main class="site-main">
    <div class="project-header">
      <div class="u-container">
        <h1 class="project-title">{{title}}</h1>
        <!-- Project metadata -->
      </div>
    </div>
    <div class="project-content">
      {{content}}
    </div>
  </main>
  <footer class="site-footer">
    <div class="u-container">
      <p>&copy; {{currentYear}} Victor Berbel</p>
    </div>
  </footer>
</body>
</html>`,
      'zesty': `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Victor Berbel</title>
  <link rel="stylesheet" href="/styles/zesty.css">
</head>
<body class="zesty-template">
  <header class="site-header"><!-- Header content --></header>
  <main class="site-main">
    <div class="project-header zesty-header">
      <div class="u-container">
        <h1 class="project-title">{{title}}</h1>
      </div>
    </div>
    <div class="project-content">
      {{content}}
    </div>
  </main>
  <footer class="site-footer">
    <div class="u-container">
      <p>&copy; {{currentYear}} Victor Berbel</p>
    </div>
  </footer>
</body>
</html>`,
      'nobe': `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Victor Berbel</title>
  <link rel="stylesheet" href="/styles/nobe.css">
</head>
<body class="nobe-template">
  <header class="site-header"><!-- Header content --></header>
  <main class="site-main">
    <div class="project-header nobe-header">
      <div class="u-container">
        <h1 class="project-title">{{title}}</h1>
      </div>
    </div>
    <div class="project-content">
      {{content}}
    </div>
  </main>
  <footer class="site-footer">
    <div class="u-container">
      <p>&copy; {{currentYear}} Victor Berbel</p>
    </div>
  </footer>
</body>
</html>`
    };
    
    // Récupérer le template demandé ou utiliser un template par défaut
    return templates[templateName] || templates['poesial'];
  }
}