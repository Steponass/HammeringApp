import React, { useState } from "react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header";
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

  if (appState.showSplash) {
    return <SplashScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="App">
      <Header
        hammeredCount={gameState.hammeredCount}
        totalCount={gameState.totalCount}
        resetGame={resetGame}
        isLoading={isLoading}
      />
      <TestGame
        gameState={gameState}
        isLoading={isLoading}
        isAnimating={isAnimating}
        hammerObject={hammerObject}
      />
    </div>
  );
};

export default App;
