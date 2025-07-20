import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../styles/animations.css';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'tip';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: React.ReactNode;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  className?: string;
}

export const NotificationContext = React.createContext<{
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}>({
  addNotification: () => '',
  removeNotification: () => {},
  clearNotifications: () => {}
});

export const useNotifications = () => React.useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, clearNotifications }}>
      {children}
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps & {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}> = ({
  position = 'top-right',
  maxNotifications = 5,
  className = '',
  notifications,
  removeNotification
}) => {
  const getPositionStyle = () => {
    switch (position) {
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-center':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: '20px', right: '20px' };
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'tip':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
            <path d="M9 21h6"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return { background: '#f0f7ff', color: '#0366d6', iconColor: '#0366d6', borderColor: '#cce5ff' };
      case 'success':
        return { background: '#f0fff4', color: '#38a169', iconColor: '#38a169', borderColor: '#c6f6d5' };
      case 'warning':
        return { background: '#fffbeb', color: '#d97706', iconColor: '#d97706', borderColor: '#fef3c7' };
      case 'error':
        return { background: '#fff5f5', color: '#e53e3e', iconColor: '#e53e3e', borderColor: '#fed7d7' };
      case 'tip':
        return { background: '#f7fafc', color: '#4a5568', iconColor: '#4a5568', borderColor: '#edf2f7' };
      default:
        return { background: '#f7fafc', color: '#4a5568', iconColor: '#4a5568', borderColor: '#edf2f7' };
    }
  };

  const visibleNotifications = notifications.slice(-maxNotifications);

  return createPortal(
    <div
      className={`notification-system ${className}`}
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%',
        ...getPositionStyle()
      }}
    >
      <TransitionGroup>
        {visibleNotifications.map(notification => {
          const { id, type, title, message, duration = 5000, dismissible = true, action } = notification;
          const colors = getNotificationColor(type);

          return (
            <CSSTransition
              key={id}
              timeout={300}
              classNames={{
                enter: 'animate-fade-in',
                exit: 'animate-fade-out'
              }}
            >
              <NotificationItem
                id={id}
                type={type}
                title={title}
                message={message}
                duration={duration}
                dismissible={dismissible}
                action={action}
                colors={colors}
                icon={getNotificationIcon(type)}
                onClose={() => removeNotification(id)}
              />
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>,
    document.body
  );
};

interface NotificationItemProps extends Notification {
  colors: {
    background: string;
    color: string;
    iconColor: string;
    borderColor: string;
  };
  icon: React.ReactNode;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  duration,
  dismissible,
  action,
  colors,
  icon,
  onClose
}) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className="notification-item"
      style={{
        backgroundColor: colors.background,
        color: colors.color,
        borderLeft: `4px solid ${colors.borderColor}`,
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <div
        className="notification-icon"
        style={{
          color: colors.iconColor,
          marginRight: '12px',
          marginTop: '2px'
        }}
      >
        {icon}
      </div>
      
      <div className="notification-content" style={{ flex: 1 }}>
        {title && (
          <div
            className="notification-title"
            style={{
              fontWeight: 600,
              marginBottom: '4px',
              fontSize: '15px'
            }}
          >
            {title}
          </div>
        )}
        
        <div
          className="notification-message"
          style={{
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          {message}
        </div>
        
        {action && (
          <button
            className="notification-action"
            onClick={action.onClick}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.iconColor,
              cursor: 'pointer',
              fontWeight: 600,
              padding: '8px 0 0 0',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      
      {dismissible && (
        <button
          className="notification-close"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.color,
            cursor: 'pointer',
            opacity: 0.6,
            padding: '0',
            marginLeft: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            lineHeight: 1,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default NotificationSystem;