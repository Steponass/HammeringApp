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
            initial={{ opacity: 0, scale: 1, y: -300 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.4,
              ease: "easeOut",
              
            }}
          >
            <h1>If all you have is a hammer,</h1>
          </motion.div>

          <motion.div
            className={styles.splash_text_container}
            initial={{ opacity: 0, scale: 1, y: 500 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 2,
              ease: "easeOut",
            }}
          >
            <h1>everything looks like a nail.</h1>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -270 }}
          animate={{ opacity: 1, scale: 1, rotate: 1 }}
          transition={{
            duration: 0.4,
            delay: 3.6,
            ease: "easeOut",
          }}
        >
          <motion.button
            className={styles.splash_button}
            onClick={handleStartClick}
            whileHover={{
              scale: 3,
              rotate: 2,
              
              boxShadow: "0 3px 4px -1px hsla(225, 42%, 5%, 1)",
            }}
            whileTap={{
              scale: 2,
              rotate: 4,
              boxShadow: "0 3px 4px -1px hsla(225, 42%, 5%, 1)",
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
