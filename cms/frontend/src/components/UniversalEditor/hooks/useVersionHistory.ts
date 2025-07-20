/**
 * Hook pour utiliser le gestionnaire de versions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VersionHistoryManager, Version } from '../services/VersionHistoryManager';

interface UseVersionHistoryOptions {
  projectId?: string;
  maxVersions?: number;
  autoSaveInterval?: number;
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function useVersionHistory({
  projectId = 'default',
  maxVersions = 50,
  autoSaveInterval = 60000,
  initialContent = '',
  onChange
}: UseVersionHistoryOptions = {}) {
  const [content, setContent] = useState(initialContent);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
  const [isUndoAvailable, setIsUndoAvailable] = useState(false);
  const [isRedoAvailable, setIsRedoAvailable] = useState(false);
  
  // Créer le gestionnaire de versions
  const versionManager = useMemo(() => {
    return new VersionHistoryManager({
      projectId,
      maxVersions,
      autoSaveInterval
    });
  }, [projectId, maxVersions, autoSaveInterval]);
  
  // Initialiser l'historique
  useEffect(() => {
    // Charger les versions existantes
    const allVersions = versionManager.getAllVersions();
    setVersions(allVersions);
    
    // Définir l'index de la version actuelle
    const currentVersion = versionManager.getCurrentVersion();
    if (currentVersion) {
      setCurrentVersionIndex(allVersions.findIndex(v => v.id === currentVersion.id));
      setContent(currentVersion.content);
    } else if (initialContent) {
      // Si pas de version mais contenu initial, créer une première version
      const newVersion = versionManager.addVersion(initialContent, 'Version initiale');
      setVersions([newVersion]);
      setCurrentVersionIndex(0);
    }
    
    // Démarrer l'auto-sauvegarde
    versionManager.startAutoSave(() => content);
    
    return () => {
      versionManager.stopAutoSave();
    };
  }, [versionManager, initialContent]);
  
  // Mettre à jour les états d'undo/redo
  useEffect(() => {
    setIsUndoAvailable(currentVersionIndex > 0);
    setIsRedoAvailable(currentVersionIndex < versions.length - 1);
  }, [currentVersionIndex, versions]);
  
  // Ajouter une nouvelle version
  const addVersion = useCallback((newContent: string, label?: string) => {
    const newVersion = versionManager.addVersion(newContent, label);
    setContent(newContent);
    setVersions(versionManager.getAllVersions());
    setCurrentVersionIndex(versionManager.getAllVersions().findIndex(v => v.id === newVersion.id));
    
    if (onChange) {
      onChange(newContent);
    }
  }, [versionManager, onChange]);
  
  // Undo
  const undo = useCallback(() => {
    const previousVersion = versionManager.undo();
    if (previousVersion) {
      setContent(previousVersion.content);
      setVersions(versionManager.getAllVersions());
      setCurrentVersionIndex(versionManager.getAllVersions().findIndex(v => v.id === previousVersion.id));
      
      if (onChange) {
        onChange(previousVersion.content);
      }
      
      return previousVersion;
    }
    return null;
  }, [versionManager, onChange]);
  
  // Redo
  const redo = useCallback(() => {
    const nextVersion = versionManager.redo();
    if (nextVersion) {
      setContent(nextVersion.content);
      setVersions(versionManager.getAllVersions());
      setCurrentVersionIndex(versionManager.getAllVersions().findIndex(v => v.id === nextVersion.id));
      
      if (onChange) {
        onChange(nextVersion.content);
      }
      
      return nextVersion;
    }
    return null;
  }, [versionManager, onChange]);
  
  // Restaurer une version spécifique
  const restoreVersion = useCallback((versionId: string) => {
    const restoredVersion = versionManager.restoreVersion(versionId);
    if (restoredVersion) {
      setContent(restoredVersion.content);
      setVersions(versionManager.getAllVersions());
      setCurrentVersionIndex(versionManager.getAllVersions().findIndex(v => v.id === restoredVersion.id));
      
      if (onChange) {
        onChange(restoredVersion.content);
      }
      
      return restoredVersion;
    }
    return null;
  }, [versionManager, onChange]);
  
  // Ajouter un label à une version
  const labelVersion = useCallback((versionId: string, label: string) => {
    const success = versionManager.labelVersion(versionId, label);
    if (success) {
      setVersions(versionManager.getAllVersions());
    }
    return success;
  }, [versionManager]);
  
  // Effacer l'historique
  const clearHistory = useCallback(() => {
    versionManager.clearHistory();
    setVersions([]);
    setCurrentVersionIndex(-1);
  }, [versionManager]);
  
  return {
    content,
    versions,
    currentVersionIndex,
    isUndoAvailable,
    isRedoAvailable,
    addVersion,
    undo,
    redo,
    restoreVersion,
    labelVersion,
    clearHistory
  };
}