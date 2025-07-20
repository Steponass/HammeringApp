import React, { useState } from "react";
import styles from "./SplashScreen.module.css";
import { motion } from "framer-motion"; // Use "framer-motion", not "motion/react"

interface SplashScreenProps {
  onStartGame: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStartClick = (): void => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    if (isAnimating) {
      onStartGame();
    }
  };

  return (
    <main className={styles.splash_main}>
      <h1>
        If all you have is a hammer,
        <br />
        everything looks like a nail.
      </h1>
      <motion.button
        className={styles.splash_button}
        onClick={handleStartClick}
        whileHover={{ 
          scale: 3, 
          rotate: 2,
          boxShadow: "0 3px 4px hsla(225, 42%, 5%, 0.3)"
        }}
        whileTap={{ scale: 2, rotate: 4 }}
        onAnimationComplete={handleAnimationComplete}
        type="button"
      >
        Hammer time
      </motion.button>
    </main>
  );
};

export default SplashScreen;
