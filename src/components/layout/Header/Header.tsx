import styles from "./Header.module.css";
import React from "react";
import { motion } from "motion/react";
import AnimatedCounter from "../../AnimatedCounter/AnimatedCounter";

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
      <h1 className={styles.header_title}>Hammer away</h1>
      <div className={styles.game_stats}>
        <span className={styles.stat_item}>
          Nailed: <AnimatedCounter value={hammeredCount} />/{totalCount}
        </span>
        <motion.button
          className={styles.reset_button}
          onClick={resetGame}
          whileHover={{
            scale: 1.05,
            rotate: [2, -2],
            boxShadow: "0 2px 4px -1px hsla(225, 42%, 5%, 1)",
            transition: {
              scale: { duration: 0.3 },
              boxShadow: { duration: 0.3 },
              rotate: {
                duration: 1.6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            },
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
