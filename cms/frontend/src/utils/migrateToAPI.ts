import { templateProjectService, type SavedProject } from '@/services/templateProjectService';

/**
 * Utilitaire pour migrer les projets du localStorage vers l'API
 */
export class MigrationUtility {
  private static readonly STORAGE_KEY = 'zesty-template-projects';
  private static readonly MIGRATION_KEY = 'template-projects-migrated';

  /**
   * Vérifie si la migration a déjà été effectuée
   */
  static isMigrationCompleted(): boolean {
    return localStorage.getItem(this.MIGRATION_KEY) === 'true';
  }

  /**
   * Marque la migration comme terminée
   */
  static markMigrationCompleted(): void {
    localStorage.setItem(this.MIGRATION_KEY, 'true');
  }

  /**
   * Récupère les projets depuis le localStorage
   */
  static getLocalStorageProjects(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading localStorage projects:', error);
      return [];
    }
  }

  /**
   * Migre tous les projets du localStorage vers l'API
   */
  static async migrateProjects(): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const localProjects = this.getLocalStorageProjects();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    if (localProjects.length === 0) {
      console.log('No projects to migrate');
      this.markMigrationCompleted();
      return results;
    }

    console.log(`Starting migration of ${localProjects.length} projects...`);

    for (const project of localProjects) {
      try {
        // Extraire les données du projet sans les métadonnées
        const { id, createdAt, updatedAt, publishedAt, ...projectData } = project;
        
        // Créer le projet via l'API
        await templateProjectService.saveProject(projectData);
        results.success++;
        console.log(`✅ Migrated: ${project.title}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate "${project.title}": ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    if (results.failed === 0) {
      // Migration réussie, marquer comme terminée
      this.markMigrationCompleted();
      console.log(`🎉 Migration completed successfully! ${results.success} projects migrated.`);
    } else {
      console.warn(`⚠️ Migration completed with errors: ${results.success} success, ${results.failed} failed`);
    }

    return results;
  }

  /**
   * Sauvegarde les projets localStorage en tant que backup avant migration
   */
  static createBackup(): void {
    const projects = this.getLocalStorageProjects();
    if (projects.length > 0) {
      const backup = {
        timestamp: new Date().toISOString(),
        projects
      };
      localStorage.setItem(`${this.STORAGE_KEY}-backup`, JSON.stringify(backup));
      console.log(`📦 Backup created with ${projects.length} projects`);
    }
  }

  /**
   * Restaure les projets depuis le backup
   */
  static restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(`${this.STORAGE_KEY}-backup`);
      if (backup) {
        const backupData = JSON.parse(backup);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backupData.projects));
        console.log(`🔄 Restored ${backupData.projects.length} projects from backup`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Nettoie les données localStorage après migration réussie
   */
  static cleanupLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(`${this.STORAGE_KEY}-backup`);
    console.log('🧹 LocalStorage cleaned up');
  }

  /**
   * Migration automatique avec gestion d'erreurs
   */
  static async autoMigrate(): Promise<boolean> {
    if (this.isMigrationCompleted()) {
      console.log('Migration already completed');
      return true;
    }

    try {
      // Créer un backup avant migration
      this.createBackup();

      // Effectuer la migration
      const results = await this.migrateProjects();

      if (results.failed === 0) {
        // Migration réussie, nettoyer le localStorage
        this.cleanupLocalStorage();
        return true;
      } else {
        // Migration partielle, garder les données locales
        console.warn('Migration incomplete, keeping localStorage data');
        return false;
      }
    } catch (error) {
      console.error('Auto-migration failed:', error);
      return false;
    }
  }
}