import axiosInstance, { API_URL } from '../utils/axiosConfig';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'WEBSITE' | 'PRODUCT' | 'MOBILE';
  thumbnail: string;
  images: string; // JSON array as string
  year: number;
  client: string;
  duration?: string;
  industry?: string;
  scope?: string; // JSON array as string
  challenge?: string;
  approach?: string;
  testimonial?: string;
  content?: string; // Rich text content
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: 'WEBSITE' | 'PRODUCT' | 'MOBILE';
  thumbnail: string;
  images: string[]; // Array of image URLs
  year: number;
  client: string;
  duration?: string;
  industry?: string;
  scope?: string[]; // Array of scope items
  challenge?: string;
  approach?: string;
  testimonial?: string;
  content?: string; // Rich text content
  isPublished?: boolean;
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectOrderItem {
  id: string;
  order: number;
}

class ProjectService {
  /**
   * Récupère tous les projets avec pagination et filtres optionnels
   */
  async getProjects(
    page = 1, 
    limit = 50, 
    category?: string, 
    isPublished?: boolean
  ): Promise<ProjectsResponse> {
    let url = `/projects?page=${page}&limit=${limit}`;
    
    if (category) {
      url += `&category=${category}`;
    }
    
    if (isPublished !== undefined) {
      url += `&isPublished=${isPublished}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Récupère un projet par son ID
   */
  async getProject(id: string): Promise<Project> {
    console.log('ProjectService.getProject - Récupération du projet avec ID:', id);
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      console.log('ProjectService.getProject - Projet récupéré:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProjectService.getProject - Erreur lors de la récupération du projet:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau projet
   */
  async createProject(projectData: ProjectFormData): Promise<Project> {
    // Convertir les tableaux en chaînes JSON
    const formattedData = {
      ...projectData,
      images: JSON.stringify(projectData.images),
      scope: projectData.scope ? JSON.stringify(projectData.scope) : undefined
    };
    
    // Récupérer le token manuellement pour le débogage
    const token = localStorage.getItem('auth-token');
    console.log('ProjectService.createProject - Token from localStorage:', token);
    
    // Utiliser l'instance axios configurée avec l'intercepteur d'authentification
    const response = await axiosInstance.post(`/projects`, formattedData);
    return response.data;
  }

  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, projectData: ProjectFormData): Promise<Project> {
    // Convertir les tableaux en chaînes JSON
    const formattedData = {
      ...projectData,
      images: JSON.stringify(projectData.images),
      scope: projectData.scope ? JSON.stringify(projectData.scope) : undefined
    };
    
    const response = await axiosInstance.put(`/projects/${id}`, formattedData);
    return response.data;
  }

  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  }

  /**
   * Change le statut de publication d'un projet
   */
  async toggleProjectPublication(id: string, isPublished: boolean): Promise<{ message: string; project: Project }> {
    const response = await axiosInstance.patch(`/projects/${id}/publish`, { isPublished });
    return response.data;
  }

  /**
   * Réorganise les projets
   */
  async reorderProjects(projectOrders: ProjectOrderItem[]): Promise<{ message: string }> {
    const response = await axiosInstance.put(`/projects/reorder`, { projectOrders });
    return response.data;
  }

  /**
   * Duplique un projet
   */
  async duplicateProject(id: string): Promise<{ message: string; project: Project }> {
    const response = await axiosInstance.post(`/projects/${id}/duplicate`);
    return response.data;
  }
  
  /**
   * Formate un projet pour l'affichage ou l'édition
   */
  formatProjectForDisplay(project: Project): ProjectFormData {
    return {
      ...project,
      images: JSON.parse(project.images),
      scope: project.scope ? JSON.parse(project.scope) : undefined
    };
  }
  
  /**
   * Formate un projet pour l'envoi à l'API
   */
  formatProjectForApi(project: ProjectFormData): any {
    return {
      ...project,
      images: JSON.stringify(project.images),
      scope: project.scope ? JSON.stringify(project.scope) : undefined
    };
  }

  /**
   * Récupère le contenu d'un projet
   */
  async getProjectContent(id: string): Promise<string> {
    try {
      console.log('ProjectService.getProjectContent - Récupération du contenu pour le projet ID:', id);
      
      // Essayer d'abord l'endpoint dédié au contenu
      try {
        const response = await axiosInstance.get(`/projects/${id}/content`);
        console.log('ProjectService.getProjectContent - Réponse de l\'API:', response.data);
        
        if (response.data && typeof response.data.content === 'string') {
          console.log('ProjectService.getProjectContent - Contenu récupéré de l\'endpoint dédié');
          return response.data.content;
        } else {
          console.log('ProjectService.getProjectContent - Format de réponse inattendu de l\'endpoint dédié');
          throw new Error('Format de réponse inattendu');
        }
      } catch (contentError) {
        console.error('ProjectService.getProjectContent - Erreur avec l\'endpoint dédié:', contentError);
        
        // En cas d'échec, essayer de récupérer le projet complet
        console.log('ProjectService.getProjectContent - Tentative de récupération du projet complet');
        const project = await this.getProject(id);
        
        if (project && typeof project.content === 'string') {
          console.log('ProjectService.getProjectContent - Contenu récupéré du projet complet');
          return project.content;
        } else {
          console.log('ProjectService.getProjectContent - Pas de contenu dans le projet complet');
          return '';
        }
      }
    } catch (error) {
      console.error('ProjectService.getProjectContent - Erreur lors de la récupération du contenu:', error);
      return '';
    }
  }

  /**
   * Met à jour le contenu d'un projet
   */
  async updateProjectContent(id: string, content: string): Promise<{ message: string; project: { id: string; content: string } }> {
    try {
      console.log('Mise à jour du contenu pour le projet', id);
      const response = await axiosInstance.put(`/projects/${id}/content`, { content });
      console.log('Réponse de mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contenu:', error);
      throw error;
    }
  }
}

export default new ProjectService();