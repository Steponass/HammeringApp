import { useState, useCallback, useRef } from 'react';
import type { NotificationData, NotificationVariant } from 'types/notifications';
import { getRandomHammerMessage } from 'data/notificationMessages';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const usedHammerMessagesRef = useRef<string[]>([]);

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

  const addHammerNotification = useCallback((): void => {
    const { message: randomMessage, shouldResetUsed } = getRandomHammerMessage(
      usedHammerMessagesRef.current
    );

    if (shouldResetUsed) {
      usedHammerMessagesRef.current = [randomMessage];
    } else {
      usedHammerMessagesRef.current = [...usedHammerMessagesRef.current, randomMessage];
    }

    addNotification(randomMessage, 'hammer');
  }, [addNotification]);

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
    addHammerNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  };
};

export default useNotifications;