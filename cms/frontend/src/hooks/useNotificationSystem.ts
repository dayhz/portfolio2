import { useCallback } from 'react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour faciliter l'utilisation du système de notifications
 * dans toute l'application.
 */
export const useNotificationSystem = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    showToast
  } = useNotifications();

  /**
   * Ajoute une notification d'information
   */
  const info = useCallback((title: string, message: string, options?: {
    link?: string;
    linkText?: string;
    autoDelete?: boolean;
    expiresIn?: number;
    showToast?: boolean;
  }) => {
    return addNotification('info', title, message, options);
  }, [addNotification]);

  /**
   * Ajoute une notification de succès
   */
  const success = useCallback((title: string, message: string, options?: {
    link?: string;
    linkText?: string;
    autoDelete?: boolean;
    expiresIn?: number;
    showToast?: boolean;
  }) => {
    return addNotification('success', title, message, options);
  }, [addNotification]);

  /**
   * Ajoute une notification d'avertissement
   */
  const warning = useCallback((title: string, message: string, options?: {
    link?: string;
    linkText?: string;
    autoDelete?: boolean;
    expiresIn?: number;
    showToast?: boolean;
  }) => {
    return addNotification('warning', title, message, options);
  }, [addNotification]);

  /**
   * Ajoute une notification d'erreur
   */
  const error = useCallback((title: string, message: string, options?: {
    link?: string;
    linkText?: string;
    autoDelete?: boolean;
    expiresIn?: number;
    showToast?: boolean;
  }) => {
    return addNotification('error', title, message, options);
  }, [addNotification]);

  /**
   * Affiche un toast sans ajouter de notification persistante
   */
  const toast = useCallback((type: NotificationType, message: string) => {
    showToast(type, message);
  }, [showToast]);

  return {
    notifications,
    unreadCount,
    info,
    success,
    warning,
    error,
    toast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
};

export default useNotificationSystem;