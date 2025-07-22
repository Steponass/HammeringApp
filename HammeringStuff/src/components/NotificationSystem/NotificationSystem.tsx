import React from 'react';
import Notification from 'components/Notification/Notification';
import type { NotificationData } from 'types/notifications';
import styles from './NotificationSystem.module.css';

interface NotificationSystemProps {
  notifications: NotificationData[];
  onStartRemoving: (id: string) => void;
  onFinishRemoving: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onStartRemoving,
  onFinishRemoving,
}) => {
  if (notifications.length === 0) return null;

  /**
   * Group notifications by their positioning needs
   * This allows us to render different types in different containers
   */
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const variant = notification.variant || 'hammer';
    const position = variant === 'completion' ? 'center' : 'bottom-center';
    
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(notification);
    return groups;
  }, {} as Record<string, NotificationData[]>);

  return (
    <>
      {/* Bottom-center notifications (hammer messages) */}
      {groupedNotifications['bottom-center'] && (
        <div className={`${styles.notificationSystem} ${styles.bottomCenter}`}>
          {groupedNotifications['bottom-center'].map((notification, index) => (
            <Notification
              key={notification.id}
              notification={notification}
              onStartRemoving={onStartRemoving}
              onFinishRemoving={onFinishRemoving}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Center notifications (completion messages) */}
      {groupedNotifications['center'] && (
        <div className={`${styles.notificationSystem} ${styles.center}`}>
          {groupedNotifications['center'].map((notification, index) => (
            <Notification
              key={notification.id}
              notification={notification}
              onStartRemoving={onStartRemoving}
              onFinishRemoving={onFinishRemoving}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default NotificationSystem;