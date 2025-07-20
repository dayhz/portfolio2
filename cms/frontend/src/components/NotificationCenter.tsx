import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Notification } from 'react-iconly';
import { Badge } from '@/components/ui/badge';

interface NotificationCenterProps {
  maxHeight?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ maxHeight = '400px' }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fermer le menu de notifications lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
  };

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(notification => !notification.read);

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        onClick={toggleNotificationCenter}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
      >
        <Notification size="medium" primaryColor="currentColor" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] min-h-[1.2rem] flex items-center justify-center text-xs"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            <div className="flex space-x-2">
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                disabled={unreadCount === 0}
              >
                Tout marquer comme lu
              </Button>
              <Button
                onClick={clearAllNotifications}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={notifications.length === 0}
              >
                Effacer tout
              </Button>
            </div>
          </div>

          <div className="border-b">
            <div className="px-3 pt-2">
              <div className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`text-xs py-1.5 px-3 rounded-md ${activeTab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`text-xs py-1.5 px-3 rounded-md ${activeTab === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  Non lues ({unreadCount})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight }}>
            {activeTab === 'all' && (
              <>
                {notifications.length === 0 ? (
                  <div className="py-8 px-3 text-sm text-gray-500 text-center">
                    <div className="flex justify-center mb-2">
                      <Notification size="large" primaryColor="#9ca3af" />
                    </div>
                    Aucune notification
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                        onRemove={removeNotification}
                        getIcon={getNotificationIcon}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'unread' && (
              <>
                {unreadCount === 0 ? (
                  <div className="py-8 px-3 text-sm text-gray-500 text-center">
                    <div className="flex justify-center mb-2">
                      <Notification size="large" primaryColor="#9ca3af" />
                    </div>
                    Aucune notification non lue
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                        onRemove={removeNotification}
                        getIcon={getNotificationIcon}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  onClick: (id: string, link?: string) => void;
  onRemove: (id: string) => void;
  getIcon: (type: NotificationType) => React.ReactNode;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onRemove,
  getIcon
}) => {
  return (
    <div
      className={`py-3 px-4 hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {getIcon(notification.type)}
        </div>
        <div className="ml-3 w-0 flex-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
          {notification.link && (
            <Link
              to={notification.link}
              className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={() => onClick(notification.id, notification.link)}
            >
              {notification.linkText || 'Voir plus'}
            </Link>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onRemove(notification.id)}
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour formater les dates sans dépendance externe
function formatTimeAgo(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Moins d'une minute
  if (seconds < 60) {
    return "à l'instant";
  }

  // Moins d'une heure
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Moins d'un jour
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }

  // Moins d'un mois
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  // Moins d'un an
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `il y a ${months} mois`;
  }

  // Plus d'un an
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

export default NotificationCenter;