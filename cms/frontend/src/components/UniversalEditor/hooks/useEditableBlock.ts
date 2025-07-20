/**
 * Hook pour gérer l'état d'édition des blocs
 */

import { useState, useCallback, useEffect } from 'react';

interface UseEditableBlockOptions {
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  autoSave?: boolean;
  saveDelay?: number;
}

export function useEditableBlock({
  onEdit,
  onSave,
  onCancel,
  autoSave = true,
  saveDelay = 1000
}: UseEditableBlockOptions = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Démarrer l'édition
  const startEditing = useCallback(() => {
    setIsEditing(true);
    if (onEdit) onEdit();
  }, [onEdit]);
  
  // Terminer l'édition et sauvegarder
  const saveEditing = useCallback(() => {
    setIsEditing(false);
    setIsDirty(false);
    if (onSave) onSave();
  }, [onSave]);
  
  // Annuler l'édition
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setIsDirty(false);
    if (onCancel) onCancel();
  }, [onCancel]);
  
  // Marquer comme modifié
  const markAsDirty = useCallback(() => {
    setIsDirty(true);
    
    // Si l'auto-sauvegarde est activée, programmer une sauvegarde
    if (autoSave) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      const timeout = setTimeout(() => {
        saveEditing();
      }, saveDelay);
      
      setSaveTimeout(timeout);
    }
  }, [autoSave, saveDelay, saveTimeout, saveEditing]);
  
  // Gérer le hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Nettoyer le timeout à la destruction
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);
  
  return {
    isEditing,
    isDirty,
    isHovered,
    startEditing,
    saveEditing,
    cancelEditing,
    markAsDirty,
    handleMouseEnter,
    handleMouseLeave
  };
}