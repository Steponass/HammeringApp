import { useState, useCallback } from 'react';
import type { NotificationData, NotificationVariant } from 'types/notifications';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((
    message: string, 
    variant: NotificationVariant = 'hammer'
  ): void => {
    const newNotification: NotificationData = {
      id: `notification-${Date.now()}-${Math.random()}`,
      message,
      variant,
      isRemoving: false,
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  /*
   * Add a completion message
   */
  const addCompletionMessage = useCallback((message: string): void => {
    addNotification(message, 'completion');
  }, [addNotification]);

  const startRemovingNotification = useCallback((id: string): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRemoving: true }
          : notification
      )
    );
  }, []);

  const finishRemovingNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  };
};

export default useNotifications;