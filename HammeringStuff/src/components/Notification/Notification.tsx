// src/components/Notification/Notification.tsx
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import type { NotificationData } from 'types/notifications';
import styles from './Notification.module.css';

interface NotificationProps {
  notification: NotificationData;
  onStartRemoving: (id: string) => void;    // Phase 1: start exit animation
  onFinishRemoving: (id: string) => void;   // Phase 2: remove from state
  index: number;
}

const Notification: React.FC<NotificationProps> = ({
  notification,
  onStartRemoving,
  onFinishRemoving,
  index,
}) => {
  const { id, message, isRemoving = false } = notification;

  /**
   * Auto-removal timer - starts the exit animation after 3 seconds
   * This calls Phase 1 removal, which triggers the exit animation
   */
  useEffect(() => {
    if (!isRemoving) { // Only set timer if not already removing
      const timer = setTimeout(() => {
        onStartRemoving(id);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [id, isRemoving, onStartRemoving]);

  /**
   * Handle the completion of exit animation
   * This is where we call Phase 2 removal to actually remove from state
   */
  const handleAnimationComplete = (): void => {
    if (isRemoving) {
      onFinishRemoving(id);
    }
  };

  return (
    <motion.div
      className={styles.notification}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1,
        y: isRemoving ? 50 : 0, 
        scale: isRemoving ? 0.8 : 1,
        x: index * 10,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: isRemoving ? 0.3 : undefined,
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      <span className={styles.message}>{message}</span>
    </motion.div>
  );
};

export default Notification;