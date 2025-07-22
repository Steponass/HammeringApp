import styles from "./Header.module.css";
import React from "react";
import { motion } from "motion/react"

interface HeaderProps {
  hammeredCount: number;
  totalCount: number;
  resetGame: () => void;
}

const Header: React.FC<HeaderProps> = ({
  hammeredCount,
  totalCount,
  resetGame,
}) => {
  return (
    <header className={styles.header}>
      <h5>Hammer time</h5>
      <div className={styles.gameStats}>
        <span className={styles.statItem}>
          Hammered: {hammeredCount}/{totalCount}
        </span>
        <motion.button
        className={styles.reset_button}
        onClick={resetGame}
        whileHover={{ 
          scale: 1.05, 
          rotate: 2,
          boxShadow: "0 2px 4px -1px hsla(225, 42%, 5%, 1)"
        }}
        whileTap={{ scale: 0.95, rotate: 3 }}
        type="button"
      >
        Reset
      </motion.button>
      </div>
    </header>
  );
};

export default Header;
export type { HeaderProps };
