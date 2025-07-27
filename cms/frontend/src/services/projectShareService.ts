import { ZestyProjectData } from './templateProjectService';

export class ProjectShareService {
  /**
   * Génère une URL de partage pour un projet sauvegardé
   */
  static generateProjectURL(projectId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/project/${projectId}`;
  }

  /**
   * Génère une URL avec les données du projet encodées (pour partage direct)
   */
  static generateDataURL(projectData: ZestyProjectData): string {
    try {
      const encodedData = btoa(JSON.stringify(projectData));
      const baseUrl = window.location.origin;
      return `${baseUrl}/project?data=${encodedData}`;
    } catch (error) {
      console.error('Error encoding project data:', error);
      throw new Error('Impossible de générer l\'URL de partage');
    }
  }

  /**
   * Copie l'URL dans le presse-papiers
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback pour les navigateurs plus anciens
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Génère un QR Code pour l'URL (optionnel)
   */
  static generateQRCodeURL(url: string): string {
    // Utilise un service gratuit de génération de QR codes
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }

  /**
   * Génère les métadonnées pour le partage social
   */
  static generateSocialMeta(projectData: ZestyProjectData): {
    title: string;
    description: string;
    image?: string;
  } {
    return {
      title: `${projectData.title} - Portfolio`,
      description: projectData.challenge || `Projet ${projectData.title} réalisé pour ${projectData.client}`,
      image: projectData.heroImage
    };
  }

  /**
   * Génère un lien de partage pour les réseaux sociaux
   */
  static generateSocialShareLinks(url: string, projectData: ZestyProjectData) {
    const meta = this.generateSocialMeta(projectData);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(meta.title);
    const encodedDescription = encodeURIComponent(meta.description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    };
  }

  /**
   * Valide si une URL de projet est valide
   */
  static validateProjectURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/project');
    } catch {
      return false;
    }
  }

  /**
   * Extrait l'ID du projet depuis une URL
   */
  static extractProjectId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      if (pathParts[1] === 'project' && pathParts[2]) {
        return pathParts[2];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Génère un nom de fichier pour l'export
   */
  static generateExportFilename(projectData: ZestyProjectData, extension: string = 'html'): string {
    const title = projectData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const client = projectData.client.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    return `${title}_${client}_${date}.${extension}`;
  }
}