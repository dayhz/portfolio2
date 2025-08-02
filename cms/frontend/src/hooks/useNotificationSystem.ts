/**
 * Hook pour le système de notifications
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

export interface NotificationSystem {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  hideNotification: (id: string) => void;
  clearAll: () => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  // Méthodes attendues par les tests
  notifySuccess: (title: string, message?: string, options?: any) => string;
  notifyError: (title: string, message?: string, options?: any) => string;
  notifyWarning: (title: string, message?: string, options?: any) => string;
  notifyInfo: (title: string, message?: string, options?: any) => string;
  notifySaveStart: (section: string) => string;
  notifySaveSuccess: (section: string, isAutoSave?: boolean) => string;
  notifySaveError: (section: string, error: any) => string;
  notifyPublishStart: () => string;
  notifyPublishSuccess: () => string;
  notifyPublishError: (error: any) => string;
  notifyValidationErrors: (errors: any[], section?: string) => string;
  notifyAutoSave: (section: string) => string;
  notifyConnectionLost: () => string;
  notifyConnectionRestored: () => string;
  notifyBatchOperation: (operation: string, total: number, completed: number, errors: number) => string;
  cleanup?: () => void;
}

export function useNotificationSystem(): NotificationSystem {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: Notification = {
      ...notification,
      id
    };

    setNotifications(prev => [...prev, newNotification]);

    // Utiliser sonner pour l'affichage
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          duration: notification.duration
        });
        break;
      case 'error':
        toast.error(notification.title, {
          description: notification.message,
          duration: notification.duration
        });
        break;
      case 'warning':
        toast.warning(notification.title, {
          description: notification.message,
          duration: notification.duration
        });
        break;
      case 'info':
        toast.info(notification.title, {
          description: notification.message,
          duration: notification.duration
        });
        break;
    }

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'info', title, message });
  }, [showNotification]);

  // Méthodes attendues par les tests (aliases)
  const notifySuccess = useCallback((title: string, message?: string, options?: any) => {
    return showSuccess(title, message);
  }, [showSuccess]);

  const notifyError = useCallback((title: string, message?: string, options?: any) => {
    return showError(title, message);
  }, [showError]);

  const notifyWarning = useCallback((title: string, message?: string, options?: any) => {
    return showWarning(title, message);
  }, [showWarning]);

  const notifyInfo = useCallback((title: string, message?: string, options?: any) => {
    return showInfo(title, message);
  }, [showInfo]);

  // Méthodes spécialisées pour les opérations
  const notifySaveStart = useCallback((section: string) => {
    return showInfo(`Sauvegarde en cours`, `Section ${section}`);
  }, [showInfo]);

  const notifySaveSuccess = useCallback((section: string, isAutoSave?: boolean) => {
    const prefix = isAutoSave ? 'Auto-sauvegarde' : 'Sauvegarde';
    return showSuccess(`${prefix} réussie`, `Section ${section}`);
  }, [showSuccess]);

  const notifySaveError = useCallback((section: string, error: any) => {
    const message = typeof error === 'string' ? error : error?.message || 'Erreur inconnue';
    return showError(`Erreur de sauvegarde`, `Section ${section}: ${message}`);
  }, [showError]);

  const notifyPublishStart = useCallback(() => {
    return showInfo('Publication en cours', 'Mise à jour du site...');
  }, [showInfo]);

  const notifyPublishSuccess = useCallback(() => {
    return showSuccess('Publication réussie', 'Le site a été mis à jour');
  }, [showSuccess]);

  const notifyPublishError = useCallback((error: any) => {
    const message = typeof error === 'string' ? error : error?.message || 'Erreur inconnue';
    return showError('Erreur de publication', message);
  }, [showError]);

  const notifyValidationErrors = useCallback((errors: any[], section?: string) => {
    if (!errors || errors.length === 0) return '';
    
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;
    
    let message = '';
    if (errorCount > 0) message += `${errorCount} erreur${errorCount > 1 ? 's' : ''}`;
    if (warningCount > 0) {
      if (message) message += ' et ';
      message += `${warningCount} avertissement${warningCount > 1 ? 's' : ''}`;
    }
    
    return showWarning('Erreurs de validation', message);
  }, [showWarning]);

  const notifyAutoSave = useCallback((section: string) => {
    return showInfo('Auto-sauvegarde', `Section ${section} sauvegardée automatiquement`);
  }, [showInfo]);

  const notifyConnectionLost = useCallback(() => {
    return showError('Connexion perdue', 'Vérifiez votre connexion internet');
  }, [showError]);

  const notifyConnectionRestored = useCallback(() => {
    return showSuccess('Connexion rétablie', 'Vous êtes de nouveau en ligne');
  }, [showSuccess]);

  const notifyBatchOperation = useCallback((operation: string, total: number, completed: number, errors: number) => {
    if (completed < total) {
      // En cours
      const message = errors > 0 
        ? `${completed}/${total} (${errors} erreur${errors > 1 ? 's' : ''})`
        : `${completed}/${total}`;
      return showInfo(`${operation} en cours`, message);
    } else {
      // Terminé
      if (errors > 0) {
        return showWarning(`${operation} terminé avec erreurs`, `${errors} erreur${errors > 1 ? 's' : ''} sur ${total}`);
      } else {
        return showSuccess(`${operation} terminé`, `${total} élément${total > 1 ? 's' : ''} traité${total > 1 ? 's' : ''}`);
      }
    }
  }, [showInfo, showWarning, showSuccess]);

  const cleanup = useCallback(() => {
    clearAll();
  }, [clearAll]);

  return {
    notifications,
    showNotification,
    hideNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifySaveStart,
    notifySaveSuccess,
    notifySaveError,
    notifyPublishStart,
    notifyPublishSuccess,
    notifyPublishError,
    notifyValidationErrors,
    notifyAutoSave,
    notifyConnectionLost,
    notifyConnectionRestored,
    notifyBatchOperation,
    cleanup
  };
}