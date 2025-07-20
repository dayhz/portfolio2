/**
 * Service de gestion des versions et de l'historique
 */

export interface Version {
  id: string;
  content: string;
  timestamp: number;
  label?: string;
  isAutoSave?: boolean;
}

export interface VersionHistoryOptions {
  maxVersions?: number;
  projectId?: string;
  autoSaveInterval?: number;
  storagePrefix?: string;
}

export class VersionHistoryManager {
  private versions: Version[] = [];
  private currentVersionIndex: number = -1;
  private maxVersions: number;
  private projectId: string;
  private autoSaveInterval: number;
  private storagePrefix: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  
  constructor({
    maxVersions = 50,
    projectId = 'default',
    autoSaveInterval = 60000, // 1 minute
    storagePrefix = 'universal-editor-history'
  }: VersionHistoryOptions = {}) {
    this.maxVersions = maxVersions;
    this.projectId = projectId;
    this.autoSaveInterval = autoSaveInterval;
    this.storagePrefix = storagePrefix;
    
    // Charger l'historique depuis le stockage local
    this.loadHistory();
  }
  
  /**
   * Ajouter une nouvelle version à l'historique
   */
  addVersion(content: string, label?: string, isAutoSave: boolean = false): Version {
    // Créer la nouvelle version
    const newVersion: Version = {
      id: this.generateVersionId(),
      content,
      timestamp: Date.now(),
      label,
      isAutoSave
    };
    
    // Si nous ne sommes pas à la dernière version, supprimer toutes les versions suivantes
    if (this.currentVersionIndex < this.versions.length - 1) {
      this.versions = this.versions.slice(0, this.currentVersionIndex + 1);
    }
    
    // Ajouter la nouvelle version
    this.versions.push(newVersion);
    this.currentVersionIndex = this.versions.length - 1;
    
    // Limiter le nombre de versions
    if (this.versions.length > this.maxVersions) {
      // Garder toujours la première version
      const firstVersion = this.versions[0];
      
      // Filtrer les versions à conserver (non auto-save ou avec label)
      const importantVersions = this.versions.slice(1).filter(v => !v.isAutoSave || v.label);
      
      // Garder les versions importantes + les plus récentes jusqu'à maxVersions
      const versionsToKeep = [firstVersion, ...importantVersions];
      
      // Si on a encore trop de versions, garder les plus récentes
      if (versionsToKeep.length > this.maxVersions) {
        versionsToKeep.splice(1, versionsToKeep.length - this.maxVersions);
      }
      
      this.versions = versionsToKeep;
      this.currentVersionIndex = this.versions.length - 1;
    }
    
    // Sauvegarder l'historique
    this.saveHistory();
    
    return newVersion;
  }
  
  /**
   * Obtenir la version actuelle
   */
  getCurrentVersion(): Version | null {
    if (this.currentVersionIndex >= 0 && this.currentVersionIndex < this.versions.length) {
      return this.versions[this.currentVersionIndex];
    }
    return null;
  }
  
  /**
   * Obtenir toutes les versions
   */
  getAllVersions(): Version[] {
    return [...this.versions];
  }
  
  /**
   * Revenir à une version précédente (undo)
   */
  undo(): Version | null {
    if (this.currentVersionIndex > 0) {
      this.currentVersionIndex--;
      return this.versions[this.currentVersionIndex];
    }
    return null;
  }
  
  /**
   * Avancer à une version suivante (redo)
   */
  redo(): Version | null {
    if (this.currentVersionIndex < this.versions.length - 1) {
      this.currentVersionIndex++;
      return this.versions[this.currentVersionIndex];
    }
    return null;
  }
  
  /**
   * Restaurer une version spécifique
   */
  restoreVersion(versionId: string): Version | null {
    const versionIndex = this.versions.findIndex(v => v.id === versionId);
    if (versionIndex >= 0) {
      this.currentVersionIndex = versionIndex;
      return this.versions[versionIndex];
    }
    return null;
  }
  
  /**
   * Ajouter un label à une version
   */
  labelVersion(versionId: string, label: string): boolean {
    const versionIndex = this.versions.findIndex(v => v.id === versionId);
    if (versionIndex >= 0) {
      this.versions[versionIndex].label = label;
      this.saveHistory();
      return true;
    }
    return false;
  }
  
  /**
   * Démarrer l'auto-sauvegarde
   */
  startAutoSave(contentProvider: () => string): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      const content = contentProvider();
      
      // Vérifier si le contenu a changé depuis la dernière version
      const currentVersion = this.getCurrentVersion();
      if (!currentVersion || currentVersion.content !== content) {
        this.addVersion(content, undefined, true);
      }
    }, this.autoSaveInterval);
  }
  
  /**
   * Arrêter l'auto-sauvegarde
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
  
  /**
   * Effacer tout l'historique
   */
  clearHistory(): void {
    this.versions = [];
    this.currentVersionIndex = -1;
    this.saveHistory();
  }
  
  /**
   * Générer un ID unique pour une version
   */
  private generateVersionId(): string {
    return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Sauvegarder l'historique dans le stockage local
   */
  private saveHistory(): void {
    try {
      const historyData = {
        versions: this.versions,
        currentVersionIndex: this.currentVersionIndex
      };
      
      localStorage.setItem(
        `${this.storagePrefix}-${this.projectId}`,
        JSON.stringify(historyData)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  }
  
  /**
   * Charger l'historique depuis le stockage local
   */
  private loadHistory(): void {
    try {
      const historyData = localStorage.getItem(`${this.storagePrefix}-${this.projectId}`);
      
      if (historyData) {
        const { versions, currentVersionIndex } = JSON.parse(historyData);
        
        if (Array.isArray(versions) && versions.length > 0) {
          this.versions = versions;
          this.currentVersionIndex = currentVersionIndex;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }
}