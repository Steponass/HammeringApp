import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import type { NotificationData, NotificationVariant } from 'types/notifications';
import styles from './Notification.module.css';

interface NotificationProps {
  notification: NotificationData;
  onStartRemoving: (id: string) => void;
  onFinishRemoving: (id: string) => void;
  index: number;
}

const Notification: React.FC<NotificationProps> = ({
  notification,
  onStartRemoving,
  onFinishRemoving,
}) => {
  const { id, message, isRemoving = false, variant = 'hammer' } = notification;

  /**
   * Get configuration based on notification variant
   * This is where we define the different behaviors
   */
  const getVariantConfig = (variant: NotificationVariant) => {
    switch (variant) {
      case 'completion':
        return {
          autoRemoveDelay: 5000,
          className: styles.completionNotification,
          animations: {
            initial: { opacity: 0, scale: 0.5, y: 0 },
            animate: { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: 0
            },
            exit: { opacity: 0, scale: 0.8, y: -20 }
          }
        };
      case 'hammer':
      default:
        return {
          autoRemoveDelay: 5000,
          className: styles.hammerNotification,
          animations: {
            initial: { opacity: 0, y: 50, scale: 0.8 },
            animate: { 
              opacity: 1, 
              y: 0, 
              scale: 1,
            },
            exit: { opacity: 0, y: 50, scale: 0.8 }
          }
        };
    }
  };

  const config = getVariantConfig(variant);

  /**
   * Auto-removal logic - only for auto-removing variants
   */
  useEffect(() => {
    if (!isRemoving && config.autoRemoveDelay > 0) {
      const timer = setTimeout(() => {
        onStartRemoving(id);
      }, config.autoRemoveDelay);
      
      return () => clearTimeout(timer);
    }
  }, [id, isRemoving, onStartRemoving, config.autoRemoveDelay]);


  const handleAnimationComplete = (): void => {
    if (isRemoving) {
      onFinishRemoving(id);
    }
  };

  return (
    <motion.div
      className={`${styles.notification} ${config.className}`}
      initial={config.animations.initial}
      animate={{
        ...config.animations.animate,
        opacity: isRemoving ? 0 : config.animations.animate.opacity,
        scale: isRemoving ? 0.8 : config.animations.animate.scale,
        y: isRemoving ? (variant === 'completion' ? -20 : 50) : config.animations.animate.y,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: isRemoving ? 0.3 : undefined,
      }}
      onAnimationComplete={handleAnimationComplete}

    >
      <div className={styles.notificationContent}>
        <span className={styles.message}>{message}</span>
      </div>
    </motion.div>
  );
};

export default Notification;