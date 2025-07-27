import { PublicProjectsService } from '@/services/publicProjectsService';

/**
 * API endpoints pour les projets publics
 * Peut être utilisé par le site principal ou des applications externes
 */

// Simuler une API REST simple
export const projectsAPI = {
  /**
   * GET /api/projects - Récupère tous les projets publiés
   */
  getAll: () => {
    return {
      success: true,
      data: PublicProjectsService.getPublishedProjects(),
      meta: {
        total: PublicProjectsService.getPublishedProjects().length,
        timestamp: new Date().toISOString()
      }
    };
  },

  /**
   * GET /api/projects/:id - Récupère un projet spécifique
   */
  getById: (id: string) => {
    const project = PublicProjectsService.getPublishedProject(id);
    
    if (!project) {
      return {
        success: false,
        error: 'Project not found or not published',
        data: null
      };
    }

    return {
      success: true,
      data: project
    };
  },

  /**
   * GET /api/portfolio - Données formatées pour le site principal
   */
  getPortfolioData: () => {
    return {
      success: true,
      data: PublicProjectsService.generatePortfolioData()
    };
  },

  /**
   * GET /api/seo - Métadonnées SEO pour le site principal
   */
  getSEOData: () => {
    return {
      success: true,
      data: PublicProjectsService.generateSEOData()
    };
  }
};

// Exposer l'API globalement pour le site principal
(window as any).portfolioAPI = projectsAPI;