type ProjectStatus = 'draft' | 'published' | 'archived';

interface ZestyProjectData {
  title: string;
  heroImage: string;
  challenge: string;
  approach: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  image1: string;
  textSection1: string;
  image2: string;
  image3: string;
  image4: string;
  video1: string;
  video1Poster: string;
  video2: string;
  video2Poster: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  testimonialImage: string;
  finalImage: string;
  textSection2: string;
  finalImage1: string;
  finalImage2: string;
  // Nouveau champ pour l'état
  status: ProjectStatus;
}

interface SavedProject extends ZestyProjectData {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string; // Date de publication
}

class TemplateProjectService {
  private apiUrl = '/api/template-projects';
  private storageKey = 'zesty-template-projects';
  private useLocalStorage = false;

  // Vérifier si l'API est disponible
  private async checkAPIAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}?limit=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });
      return response.ok;
    } catch (error) {
      console.warn('API not available, falling back to localStorage:', error);
      this.useLocalStorage = true;
      return false;
    }
  }

  // Méthodes localStorage (fallback)
  private saveToStorage(projects: SavedProject[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Impossible de sauvegarder le projet. Vérifiez l\'espace de stockage disponible.');
    }
  }

  private getFromStorage(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Sauvegarder un projet
  async saveProject(projectData: ZestyProjectData, id?: string): Promise<SavedProject> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        if (id) {
          // Mise à jour d'un projet existant
          const response = await fetch(`${this.apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
          });

          if (!response.ok) {
            throw new Error(`Failed to update project: ${response.statusText}`);
          }

          return await response.json();
        } else {
          // Nouveau projet
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...projectData,
              status: projectData.status || 'draft'
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create project: ${response.statusText}`);
          }

          return await response.json();
        }
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const projects = this.getFromStorage();
    const now = new Date().toISOString();
    
    if (id) {
      // Mise à jour d'un projet existant
      const existingIndex = projects.findIndex(p => p.id === id);
      if (existingIndex !== -1) {
        const updatedProject: SavedProject = {
          ...projectData,
          id,
          createdAt: projects[existingIndex].createdAt,
          updatedAt: now,
          publishedAt: projects[existingIndex].publishedAt
        };
        projects[existingIndex] = updatedProject;
        this.saveToStorage(projects);
        return updatedProject;
      }
    }
    
    // Nouveau projet
    const newProject: SavedProject = {
      ...projectData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      status: projectData.status || 'draft'
    };
    
    projects.push(newProject);
    this.saveToStorage(projects);
    return newProject;
  }

  // Récupérer tous les projets
  async getAllProjects(): Promise<SavedProject[]> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(this.apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.map((project: any) => ({
          ...project,
          scope: JSON.parse(project.scope || '[]') // Parser le JSON scope
        }));
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    return this.getFromStorage();
  }

  // Récupérer un projet par ID
  async getProject(id: string): Promise<SavedProject | null> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(`${this.apiUrl}/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch project: ${response.statusText}`);
        }

        const project = await response.json();
        return {
          ...project,
          scope: JSON.parse(project.scope || '[]') // Parser le JSON scope
        };
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const projects = this.getFromStorage();
    return projects.find(p => p.id === id) || null;
  }

  // Supprimer un projet
  async deleteProject(id: string): Promise<boolean> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(`${this.apiUrl}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete project: ${response.statusText}`);
        }

        return true;
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const projects = this.getFromStorage();
    const filteredProjects = projects.filter(p => p.id !== id);
    
    if (filteredProjects.length !== projects.length) {
      this.saveToStorage(filteredProjects);
      return true;
    }
    return false;
  }

  // Dupliquer un projet
  async duplicateProject(id: string): Promise<SavedProject | null> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(`${this.apiUrl}/${id}/duplicate`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`Failed to duplicate project: ${response.statusText}`);
        }

        const result = await response.json();
        return {
          ...result.project,
          scope: JSON.parse(result.project.scope || '[]')
        };
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const project = await this.getProject(id);
    if (!project) return null;

    const { id: _, createdAt: __, updatedAt: ___, ...projectData } = project;
    const duplicatedProject = {
      ...projectData,
      title: `${projectData.title} (Copie)`,
      client: `${projectData.client} (Copie)`
    };

    return this.saveProject(duplicatedProject);
  }



  // Exporter un projet en JSON
  async exportProject(id: string): Promise<string | null> {
    const project = await this.getProject(id);
    if (!project) return null;
    
    return JSON.stringify(project, null, 2);
  }

  // Importer un projet depuis JSON
  async importProject(jsonData: string): Promise<SavedProject> {
    try {
      const projectData = JSON.parse(jsonData);
      
      // Valider les données importées
      if (!this.isValidProjectData(projectData)) {
        throw new Error('Format de données invalide');
      }

      // Supprimer les métadonnées pour créer un nouveau projet
      const { id: _, createdAt: __, updatedAt: ___, publishedAt: ____, ...cleanData } = projectData;
      
      // Les projets importés sont en brouillon par défaut
      cleanData.status = cleanData.status || 'draft';
      
      return this.saveProject(cleanData);
    } catch (error) {
      console.error('Error importing project:', error);
      throw new Error('Impossible d\'importer le projet. Vérifiez le format des données.');
    }
  }

  private isValidProjectData(data: any): data is ZestyProjectData {
    const requiredFields = ['title', 'client', 'year'];
    return requiredFields.every(field => typeof data[field] === 'string');
  }

  // Changer le statut d'un projet
  async updateProjectStatus(id: string, status: ProjectStatus): Promise<SavedProject> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(`${this.apiUrl}/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update project status: ${response.statusText}`);
        }

        const result = await response.json();
        return {
          ...result.project,
          scope: JSON.parse(result.project.scope || '[]')
        };
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const projects = this.getFromStorage();
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Projet non trouvé');
    }

    const now = new Date().toISOString();
    projects[projectIndex].status = status;
    projects[projectIndex].updatedAt = now;
    
    // Si on publie le projet, enregistrer la date de publication
    if (status === 'published' && !projects[projectIndex].publishedAt) {
      projects[projectIndex].publishedAt = now;
    }

    this.saveToStorage(projects);
    return projects[projectIndex];
  }

  // Publier un projet
  async publishProject(id: string): Promise<SavedProject> {
    return this.updateProjectStatus(id, 'published');
  }

  // Mettre en brouillon
  async draftProject(id: string): Promise<SavedProject> {
    return this.updateProjectStatus(id, 'draft');
  }

  // Archiver un projet
  async archiveProject(id: string): Promise<SavedProject> {
    return this.updateProjectStatus(id, 'archived');
  }

  // Obtenir les projets par statut
  async getProjectsByStatus(status: ProjectStatus): Promise<SavedProject[]> {
    // Vérifier la disponibilité de l'API
    const apiAvailable = await this.checkAPIAvailability();

    if (apiAvailable && !this.useLocalStorage) {
      try {
        const response = await fetch(`${this.apiUrl}?status=${status}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.map((project: any) => ({
          ...project,
          scope: JSON.parse(project.scope || '[]')
        }));
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
        this.useLocalStorage = true;
      }
    }

    // Fallback vers localStorage
    const allProjects = this.getFromStorage();
    return allProjects.filter(project => project.status === status);
  }

  // Obtenir les projets publiés uniquement
  async getPublishedProjects(): Promise<SavedProject[]> {
    return this.getProjectsByStatus('published');
  }

  // Obtenir les brouillons
  async getDraftProjects(): Promise<SavedProject[]> {
    return this.getProjectsByStatus('draft');
  }

  // Obtenir les projets archivés
  async getArchivedProjects(): Promise<SavedProject[]> {
    return this.getProjectsByStatus('archived');
  }

  // Vérifier si un projet est accessible publiquement
  async isProjectPublic(id: string): Promise<boolean> {
    const project = await this.getProject(id);
    return project ? project.status === 'published' : false;
  }



  private isValidProjectData(data: any): data is ZestyProjectData {
    const requiredFields = ['title', 'client', 'year'];
    return requiredFields.every(field => typeof data[field] === 'string');
  }
}

export const templateProjectService = new TemplateProjectService();
export type { ZestyProjectData, SavedProject, ProjectStatus };