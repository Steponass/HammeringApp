import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header/Header";
import TestGame from "games/TestGame";
import "./styles/css-reset.css";
import "./styles/variables.css";
import "./styles/fonts.css";
import "./styles/globals.css";
import useGameState from "hooks/useGameState";

interface AppState {
  showSplash: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    showSplash: true,
  });
  const { gameState, isLoading, resetGame, hammerObject } = useGameState();

  // For now, set isAnimating to false (or wire up if available)
  const isAnimating = false;

  const handleStartGame = (): void => {
    setAppState({ showSplash: false });
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {appState.showSplash ? (
          <SplashScreen key="splash" onStartGame={handleStartGame} />
        ) : (
          <motion.div
          key="game"
          initial={{ opacity: 1, scale: 3 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          >
        <Header
          hammeredCount={gameState.hammeredCount}
          totalCount={gameState.totalCount}
          resetGame={resetGame}
        />
        <TestGame
          gameState={gameState}
          isLoading={isLoading}
          isAnimating={isAnimating}
          hammerObject={hammerObject}
        />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default App;
