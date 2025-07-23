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
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
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
}

export default new ProjectService();