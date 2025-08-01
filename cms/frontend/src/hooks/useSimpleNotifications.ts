import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface NotificationOptions {
  duration?: number;
  description?: string;
}

export function useSimpleNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const showSuccess = useCallback((title: string, options?: NotificationOptions) => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration || 4000
    });
  }, []);

  const showError = useCallback((title: string, options?: NotificationOptions) => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration || 6000
    });
  }, []);

  const showWarning = useCallback((title: string, options?: NotificationOptions) => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration || 5000
    });
  }, []);

  const showInfo = useCallback((title: string, options?: NotificationOptions) => {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration || 4000
    });
  }, []);

  // Services-specific notifications
  const notifySaveSuccess = useCallback((section: string) => {
    showSuccess(`${section} sauvegardé`, {
      description: 'Les modifications ont été enregistrées avec succès'
    });
  }, [showSuccess]);

  const notifySaveError = useCallback((section: string, error?: string) => {
    showError(`Erreur de sauvegarde - ${section}`, {
      description: error || 'Une erreur est survenue lors de la sauvegarde'
    });
  }, [showError]);

  const notifyValidationError = useCallback((message: string) => {
    showWarning('Erreur de validation', {
      description: message
    });
  }, [showWarning]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySaveSuccess,
    notifySaveError,
    notifyValidationError
  };
}