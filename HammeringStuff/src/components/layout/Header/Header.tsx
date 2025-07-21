import styles from "./Header.module.css";
import React from "react";

interface HeaderProps {
  hammeredCount: number;
  totalCount: number;
  resetGame: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  hammeredCount,
  totalCount,
  resetGame,
  isLoading,
}) => {
  return (
    <header className={styles.header}>
      <h5>hammer time.</h5>
      <div className={styles.gameStats}>
        <span className={styles.statItem}>
          Objects: {hammeredCount} / {totalCount}
        </span>
        <button
          className={styles.resetButton}
          onClick={resetGame}
          disabled={isLoading}
        >
          Reset Game
        </button>
      </div>
    </header>
  );
};

export default Header;
export type { HeaderProps };
