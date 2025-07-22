import { useState, useCallback } from 'react';
import type { NotificationData } from 'types/notifications';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((message: string): void => {
    const newNotification: NotificationData = {
      id: `notification-${Date.now()}-${Math.random()}`,
      message,
      isRemoving: false, // Start in visible state
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  /**
   * Phase 1: Mark notification for removal (starts exit animation)
   * This doesn't remove the notification yet, just marks it as "leaving"
   */
  const startRemovingNotification = useCallback((id: string): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRemoving: true }
          : notification
      )
    );
  }, []);

  /**
   * Phase 2: Actually remove notification from state (after exit animation)
   * This is called by the component after its exit animation finishes
   */
  const finishRemovingNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  };
};

export default useNotifications;