import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast, ToastOptions } from 'sonner';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  link?: string;
  linkText?: string;
  autoDelete?: boolean;
  expiresAt?: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, options?: {
    link?: string;
    linkText?: string;
    autoDelete?: boolean;
    expiresIn?: number; // en millisecondes
    showToast?: boolean;
  }) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (type: NotificationType, message: string, options?: ToastOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte de notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};

// Clé pour le stockage local des notifications
const STORAGE_KEY = 'portfolio-cms-notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Récupérer les notifications du stockage local au chargement
    const savedNotifications = localStorage.getItem(STORAGE_KEY);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convertir les chaînes de date en objets Date
        return parsed.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
          expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return [];
      }
    }
    return [];
  });

  // Nombre de notifications non lues
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Sauvegarder les notifications dans le stockage local à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Nettoyer les notifications expirées
  useEffect(() => {
    const now = new Date();
    setNotifications(prev => 
      prev.filter(notification => 
        !notification.expiresAt || new Date(notification.expiresAt) > now
      )
    );
    
    // Vérifier périodiquement les notifications expirées
    const interval = setInterval(() => {
      const currentTime = new Date();
      setNotifications(prev => 
        prev.filter(notification => 
          !notification.expiresAt || new Date(notification.expiresAt) > currentTime
        )
      );
    }, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(interval);
  }, []);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((
    type: NotificationType, 
    title: string, 
    message: string, 
    options?: {
      link?: string;
      linkText?: string;
      autoDelete?: boolean;
      expiresIn?: number;
      showToast?: boolean;
    }
  ) => {
    const id = Date.now().toString();
    
    const newNotification: Notification = {
      id,
      type,
      title,
      message,
      read: false,
      timestamp: new Date(),
      link: options?.link,
      linkText: options?.linkText,
      autoDelete: options?.autoDelete ?? false,
      expiresAt: options?.expiresIn ? new Date(Date.now() + options.expiresIn) : undefined
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Optionnellement afficher un toast
    if (options?.showToast !== false) {
      showToast(type, title, { description: message });
    }

    return id;
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Supprimer toutes les notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Afficher un toast
  const showToast = useCallback((type: NotificationType, message: string, options?: ToastOptions) => {
    // Utiliser setTimeout pour éviter les problèmes de rendu
    setTimeout(() => {
      switch (type) {
        case 'info':
          toast.info(message, options);
          break;
        case 'success':
          toast.success(message, options);
          break;
        case 'warning':
          toast.warning(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
      }
    }, 0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        showToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};