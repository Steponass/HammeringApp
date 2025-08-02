import React from "react";
import styles from "./SplashScreen.module.css";
import { motion } from "motion/react";

interface SplashScreenProps {
  onStartGame: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame }) => {
  const handleStartClick = (): void => {
    onStartGame();
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      handleStartClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 1,
        scale: 10,
      }}
      transition={{
        duration: 1.2,
        ease: "easeIn",
      }}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <main className={styles.splash_main}>
        <div>
          <motion.div
            className={styles.splash_text_container}
            initial={{ opacity: 0, scale: 0.9, y: -300 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.8,
              type: "spring",
              damping: 20,
              stiffness: 120,
              mass: 1.2,
            }}
          >
            <h1>If all you have is a hammer,</h1>
          </motion.div>

          <motion.div
            className={styles.splash_text_container}
            initial={{ opacity: 0, scale: 0.9, y: 500 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 2.4,
              type: "spring",
              damping: 20,
              stiffness: 120,
              mass: 1.2,
            }}
          >
            <h1>everything looks like a nail.</h1>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: -270 }}
          animate={{ opacity: 1, scale: 1, rotate: 1 }}
          transition={{
            delay: 4.6,
            type: "spring",
            damping: 18,
            stiffness: 150,
            mass: 1.1,
          }}
        >
          <motion.button
            className={styles.splash_button}
            onClick={handleStartClick}
            whileHover={{
              scale: 2.5,
              rotate: [2, -2],
              boxShadow: "0 3px 4px -1px hsla(225, 42%, 5%, 1)",
              transition: {
                scale: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              },
            }}
            onKeyDown={handleKeyDown}
            type="button"
          >
            Hammer time
          </motion.button>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default SplashScreen;
