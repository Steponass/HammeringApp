// src/components/NotificationSystem/NotificationSystem.tsx
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

  return (
    <div className={styles.notificationSystem}>
      {notifications.map((notification, index) => (
        <Notification
          key={notification.id}
          notification={notification}
          onStartRemoving={onStartRemoving}   // Pass Phase 1 handler
          onFinishRemoving={onFinishRemoving} // Pass Phase 2 handler
          index={index}
        />
      ))}
    </div>
  );
};

export default NotificationSystem;