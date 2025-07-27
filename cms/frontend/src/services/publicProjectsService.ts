import { templateProjectService, type SavedProject } from './templateProjectService';

/**
 * Service pour exposer les projets publiés au site principal
 */
export class PublicProjectsService {
  /**
   * Récupère tous les projets publiés pour le site principal
   */
  static getPublishedProjects(): SavedProject[] {
    return templateProjectService.getPublishedProjects()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Récupère un projet publié par ID
   */
  static getPublishedProject(id: string): SavedProject | null {
    const project = templateProjectService.getProject(id);
    return project && project.status === 'published' ? project : null;
  }

  /**
   * Génère les données pour la section portfolio du site principal
   */
  static generatePortfolioData() {
    const projects = this.getPublishedProjects();
    
    return {
      projects: projects.map(project => ({
        id: project.id,
        title: project.title,
        client: project.client,
        year: project.year,
        type: project.type,
        industry: project.industry,
        heroImage: project.heroImage,
        challenge: project.challenge,
        scope: project.scope,
        url: `/project/${project.id}` // Lien vers la page dynamique
      })),
      stats: {
        totalProjects: projects.length,
        clients: new Set(projects.map(p => p.client)).size,
        industries: new Set(projects.map(p => p.industry)).size
      }
    };
  }

  /**
   * Génère le JSON pour intégration externe
   */
  static exportForMainSite(): string {
    return JSON.stringify(this.generatePortfolioData(), null, 2);
  }

  /**
   * Génère les métadonnées pour le SEO du site principal
   */
  static generateSEOData() {
    const projects = this.getPublishedProjects().slice(0, 3); // 3 derniers projets
    
    return {
      featuredProjects: projects.map(project => ({
        title: project.title,
        description: project.challenge || `Projet ${project.title} réalisé pour ${project.client}`,
        image: project.heroImage,
        url: `/project/${project.id}`
      })),
      portfolio: {
        title: `Portfolio - ${projects.length} projets réalisés`,
        description: `Découvrez mes derniers projets : ${projects.map(p => p.title).join(', ')}`,
        projectCount: projects.length
      }
    };
  }
}

// Fonction globale pour accès depuis le site principal
(window as any).getPortfolioData = () => PublicProjectsService.generatePortfolioData();
(window as any).getPublishedProjects = () => PublicProjectsService.getPublishedProjects();