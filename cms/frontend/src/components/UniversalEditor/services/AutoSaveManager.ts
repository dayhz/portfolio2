/**
 * Gestionnaire d'auto-sauvegarde intelligent pour l'éditeur universel
 * Gère la sauvegarde automatique avec debouncing et récupération d'erreurs
 */

import { AUTO_SAVE_CONFIG } from '../constants';

export interface SaveData {
  content: string;
  projectId?: string;
  timestamp: number;
  version: number;
}

export interface SaveOptions {
  immediate?: boolean;
  skipDebounce?: boolean;
  retryOnError?: boolean;
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved?: Date;
  error?: string;
  pendingChanges: boolean;
}

export type SaveCallback = (data: SaveData) => Promise<void>;

export class AutoSaveManager {
  private static instance: AutoSaveManager;
  private saveCallback: SaveCallback | null = null;
  private debounceTimer: number | null = null;
  private retryTimer: number | null = null;
  private currentData: SaveData | null = null;
  private status: SaveStatus = {
    status: 'idle',
    pendingChanges: false
  };
  private listeners: Array<(status: SaveStatus) => void> = [];
  private retryCount = 0;
  private isOnline = navigator.onLine;

  private constructor() {
    // Écouter les changements de connexion
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Écouter la fermeture de la page pour sauvegarder
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  static getInstance(): AutoSaveManager {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  /**
   * Configure le callback de sauvegarde
   */
  setSaveCallback(callback: SaveCallback): void {
    this.saveCallback = callback;
  }

  /**
   * Ajoute un listener pour les changements de statut
   */
  addStatusListener(listener: (status: SaveStatus) => void): () => void {
    this.listeners.push(listener);
    // Retourner une fonction de nettoyage
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Met à jour le statut et notifie les listeners
   */
  private updateStatus(updates: Partial<SaveStatus>): void {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(listener => listener(this.status));
  }

  /**
   * Sauvegarde le contenu avec debouncing
   */
  save(content: string, projectId?: string, options: SaveOptions = {}): void {
    const data: SaveData = {
      content,
      projectId,
      timestamp: Date.now(),
      version: (this.currentData?.version || 0) + 1
    };

    this.currentData = data;
    this.updateStatus({ pendingChanges: true });

    // Sauvegarde immédiate si demandée
    if (options.immediate || options.skipDebounce) {
      this.performSave(data, options);
      return;
    }

    // Annuler le timer précédent
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Programmer la sauvegarde avec debounce
    this.debounceTimer = setTimeout(() => {
      this.performSave(data, options);
    }, AUTO_SAVE_CONFIG.DEBOUNCE_DELAY);
  }

  /**
   * Effectue la sauvegarde
   */
  private async performSave(data: SaveData, options: SaveOptions = {}): Promise<void> {
    if (!this.saveCallback) {
      console.warn('AutoSaveManager: Aucun callback de sauvegarde configuré');
      return;
    }

    if (!this.isOnline) {
      this.updateStatus({ 
        status: 'offline',
        error: 'Hors ligne - La sauvegarde sera effectuée à la reconnexion'
      });
      return;
    }

    this.updateStatus({ status: 'saving', error: undefined });

    try {
      await this.saveCallback(data);
      
      this.updateStatus({
        status: 'saved',
        lastSaved: new Date(),
        pendingChanges: false,
        error: undefined
      });
      
      this.retryCount = 0;
      
      // Retourner au statut idle après un délai
      setTimeout(() => {
        if (this.status.status === 'saved') {
          this.updateStatus({ status: 'idle' });
        }
      }, 2000);

    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur de sauvegarde';
      this.updateStatus({
        status: 'error',
        error: errorMessage
      });

      // Retry automatique si activé
      if (options.retryOnError !== false && this.retryCount < AUTO_SAVE_CONFIG.MAX_RETRIES) {
        this.scheduleRetry(data, options);
      }
    }
  }

  /**
   * Programme un retry
   */
  private scheduleRetry(data: SaveData, options: SaveOptions): void {
    this.retryCount++;
    
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    const delay = AUTO_SAVE_CONFIG.RETRY_DELAY * Math.pow(2, this.retryCount - 1); // Backoff exponentiel
    
    this.retryTimer = setTimeout(() => {
      console.log(`Tentative de sauvegarde ${this.retryCount}/${AUTO_SAVE_CONFIG.MAX_RETRIES}`);
      this.performSave(data, options);
    }, delay);
  }

  /**
   * Force une sauvegarde immédiate
   */
  forceSave(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentData) {
        resolve();
        return;
      }

      const originalCallback = this.saveCallback;
      this.saveCallback = async (data) => {
        try {
          await originalCallback?.(data);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      this.performSave(this.currentData, { immediate: true, retryOnError: false });
    });
  }

  /**
   * Obtient le statut actuel
   */
  getStatus(): SaveStatus {
    return { ...this.status };
  }

  /**
   * Vérifie s'il y a des changements non sauvegardés
   */
  hasPendingChanges(): boolean {
    return this.status.pendingChanges;
  }

  /**
   * Gestion de la reconnexion
   */
  private handleOnline(): void {
    this.isOnline = true;
    
    // Tenter de sauvegarder si des changements sont en attente
    if (this.currentData && this.status.pendingChanges) {
      console.log('Reconnexion détectée - Tentative de sauvegarde');
      this.performSave(this.currentData, { retryOnError: true });
    }
  }

  /**
   * Gestion de la déconnexion
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.updateStatus({ 
      status: 'offline',
      error: 'Connexion perdue - Les modifications seront sauvegardées à la reconnexion'
    });
  }

  /**
   * Gestion de la fermeture de page
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): string | undefined {
    if (this.status.pendingChanges) {
      const message = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
      event.returnValue = message;
      return message;
    }
    return undefined;
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    this.listeners.length = 0;
  }

  /**
   * Sauvegarde dans le localStorage comme backup
   */
  saveToLocalStorage(data: SaveData): void {
    try {
      const key = `autosave_${data.projectId || 'default'}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de sauvegarder dans localStorage:', error);
    }
  }

  /**
   * Récupère depuis le localStorage
   */
  loadFromLocalStorage(projectId?: string): SaveData | null {
    try {
      const key = `autosave_${projectId || 'default'}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Impossible de charger depuis localStorage:', error);
      return null;
    }
  }

  /**
   * Supprime la sauvegarde locale
   */
  clearLocalStorage(projectId?: string): void {
    try {
      const key = `autosave_${projectId || 'default'}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Impossible de supprimer localStorage:', error);
    }
  }
}

// Export de l'instance singleton
export const autoSaveManager = AutoSaveManager.getInstance();