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
  private storageKey = 'zesty-template-projects';

  // Sauvegarder un projet
  async saveProject(projectData: ZestyProjectData, id?: string): Promise<SavedProject> {
    const projects = this.getAllProjects();
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
          publishedAt: projects[existingIndex].publishedAt // Conserver la date de publication
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
      // Nouveau projet en brouillon par défaut
      status: projectData.status || 'draft'
    };
    
    projects.push(newProject);
    this.saveToStorage(projects);
    return newProject;
  }

  // Récupérer tous les projets
  getAllProjects(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  // Récupérer un projet par ID
  getProject(id: string): SavedProject | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  // Supprimer un projet
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    
    if (filteredProjects.length !== projects.length) {
      this.saveToStorage(filteredProjects);
      return true;
    }
    return false;
  }

  // Dupliquer un projet
  duplicateProject(id: string): SavedProject | null {
    const project = this.getProject(id);
    if (!project) return null;

    const { id: _, createdAt: __, updatedAt: ___, ...projectData } = project;
    const duplicatedProject = {
      ...projectData,
      title: `${projectData.title} (Copie)`,
      client: `${projectData.client} (Copie)`
    };

    return this.saveProject(duplicatedProject);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveToStorage(projects: SavedProject[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
      throw new Error('Impossible de sauvegarder le projet. Vérifiez l\'espace de stockage disponible.');
    }
  }

  // Exporter un projet en JSON
  exportProject(id: string): string | null {
    const project = this.getProject(id);
    if (!project) return null;
    
    return JSON.stringify(project, null, 2);
  }

  // Importer un projet depuis JSON
  importProject(jsonData: string): SavedProject {
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

  // Changer le statut d'un projet
  updateProjectStatus(id: string, status: ProjectStatus): SavedProject {
    const projects = this.getAllProjects();
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

    localStorage.setItem(this.storageKey, JSON.stringify(projects));
    return projects[projectIndex];
  }

  // Publier un projet
  publishProject(id: string): SavedProject {
    return this.updateProjectStatus(id, 'published');
  }

  // Mettre en brouillon
  draftProject(id: string): SavedProject {
    return this.updateProjectStatus(id, 'draft');
  }

  // Archiver un projet
  archiveProject(id: string): SavedProject {
    return this.updateProjectStatus(id, 'archived');
  }

  // Obtenir les projets par statut
  getProjectsByStatus(status: ProjectStatus): SavedProject[] {
    return this.getAllProjects().filter(project => project.status === status);
  }

  // Obtenir les projets publiés uniquement
  getPublishedProjects(): SavedProject[] {
    return this.getProjectsByStatus('published');
  }

  // Obtenir les brouillons
  getDraftProjects(): SavedProject[] {
    return this.getProjectsByStatus('draft');
  }

  // Obtenir les projets archivés
  getArchivedProjects(): SavedProject[] {
    return this.getProjectsByStatus('archived');
  }

  // Vérifier si un projet est accessible publiquement
  isProjectPublic(id: string): boolean {
    const project = this.getProject(id);
    return project ? project.status === 'published' : false;
  }

  // Migration des projets existants pour ajouter le statut
  migrateExistingProjects(): void {
    const projects = this.getAllProjects();
    let hasChanges = false;

    const migratedProjects = projects.map(project => {
      // Si le projet n'a pas de statut, l'ajouter
      if (!project.status) {
        hasChanges = true;
        return {
          ...project,
          status: 'draft' as ProjectStatus // Projets existants en brouillon par défaut
        };
      }
      return project;
    });

    if (hasChanges) {
      localStorage.setItem(this.storageKey, JSON.stringify(migratedProjects));
      console.log('Migration completed: Added status to existing projects');
    }
  }

  private isValidProjectData(data: any): data is ZestyProjectData {
    const requiredFields = ['title', 'client', 'year'];
    return requiredFields.every(field => typeof data[field] === 'string');
  }
}

export const templateProjectService = new TemplateProjectService();
export type { ZestyProjectData, SavedProject, ProjectStatus };