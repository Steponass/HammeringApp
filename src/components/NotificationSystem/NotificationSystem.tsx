import React from "react";
import { AnimatePresence } from "motion/react";
import Notification from "components/Notification/Notification";
import type { NotificationData } from "types/notifications";
import styles from "./NotificationSystem.module.css";

interface NotificationSystemProps {
  notifications: NotificationData[];
  onStartRemoving: (id: string) => void;
  onFinishRemoving: (id: string) => void;
  resetGame: () => void; 
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onStartRemoving,
  onFinishRemoving,
  resetGame,
}) => {
  if (notifications.length === 0) return null;

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const variant = notification.variant || "hammer";
    const position = variant === "completion" ? "center" : "bottom-center";

    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(notification);
    return groups;
  }, {} as Record<string, NotificationData[]>);

  return (
    <>
      {groupedNotifications["bottom-center"] && (
        <div className={`${styles.notificationSystem} ${styles.bottomCenter}`}>
          <AnimatePresence mode="popLayout">
            {groupedNotifications["bottom-center"].map(
              (notification, index) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                  onStartRemoving={onStartRemoving}
                  onFinishRemoving={onFinishRemoving}
                  index={index}
                  resetGame={resetGame} // Pass resetGame to Notification
                />
              )
            )}
          </AnimatePresence>
        </div>
      )}

      {groupedNotifications["center"] && (
        <div className={`${styles.notificationSystem} ${styles.center}`}>
          <AnimatePresence mode="popLayout">
            {groupedNotifications["center"].map((notification, index) => (
              <Notification
                key={notification.id}
                notification={notification}
                onStartRemoving={onStartRemoving}
                onFinishRemoving={onFinishRemoving}
                index={index}
                resetGame={resetGame} // Pass resetGame to Notification
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default NotificationSystem;
