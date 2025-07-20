/**
 * Hook React pour utiliser l'AutoSaveManager
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { autoSaveManager, SaveStatus, SaveData, SaveOptions } from '../services/AutoSaveManager';

export interface UseAutoSaveOptions {
  projectId?: string;
  onSave?: (data: SaveData) => Promise<void>;
  enableLocalBackup?: boolean;
}

export interface UseAutoSaveReturn {
  save: (content: string, options?: SaveOptions) => void;
  forceSave: () => Promise<void>;
  status: SaveStatus;
  hasPendingChanges: boolean;
  loadFromBackup: () => SaveData | null;
  clearBackup: () => void;
}

export function useAutoSave({
  projectId,
  onSave,
  enableLocalBackup = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>(autoSaveManager.getStatus());
  const onSaveRef = useRef(onSave);

  // Mettre à jour la référence du callback
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Configurer l'AutoSaveManager
  useEffect(() => {
    const saveCallback = async (data: SaveData) => {
      // Sauvegarder localement si activé
      if (enableLocalBackup) {
        autoSaveManager.saveToLocalStorage(data);
      }

      // Appeler le callback personnalisé
      if (onSaveRef.current) {
        await onSaveRef.current(data);
      }
    };

    autoSaveManager.setSaveCallback(saveCallback);

    // S'abonner aux changements de statut
    const unsubscribe = autoSaveManager.addStatusListener(setStatus);

    return () => {
      unsubscribe();
    };
  }, [enableLocalBackup]);

  // Fonction de sauvegarde
  const save = useCallback((content: string, options: SaveOptions = {}) => {
    autoSaveManager.save(content, projectId, options);
  }, [projectId]);

  // Force la sauvegarde
  const forceSave = useCallback(async () => {
    return autoSaveManager.forceSave();
  }, []);

  // Charge depuis le backup local
  const loadFromBackup = useCallback(() => {
    return autoSaveManager.loadFromLocalStorage(projectId);
  }, [projectId]);

  // Supprime le backup local
  const clearBackup = useCallback(() => {
    autoSaveManager.clearLocalStorage(projectId);
  }, [projectId]);

  return {
    save,
    forceSave,
    status,
    hasPendingChanges: status.pendingChanges,
    loadFromBackup,
    clearBackup,
  };
}