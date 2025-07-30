import styles from "./Header.module.css";
import React from "react";
import ResetButton from "components/ResetButton/ResetButton";
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
        <ResetButton resetGame={resetGame}/>
      </div>
    </header>
  );
};

export default Header;
export type { HeaderProps };
