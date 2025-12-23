import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header/Header";
import Game from "games/Game";
import NotificationSystem from "components/NotificationSystem/NotificationSystem";
import useGameState from "hooks/useGameState";
import useViewportChange from "hooks/useViewportChange";
import useNotifications from "hooks/useNotifications";
import useHammerAnimation from "hooks/useHammerAnimation";
import { getRandomCompletionMessage } from "data/completionMessages";
import "./styles/css-reset.css";
import "./styles/variables.css";
import "./styles/fonts.css";
import "./styles/globals.css";

interface AppState {
  showSplash: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    showSplash: true,
  });

  const {
    gameState,
    isLoading,
    isRepositioning,
    resetGame,
    hammerObject,
    repositionObjects,
  } = useGameState();

  const {
    responsiveConfig,
    previousConfig,
    isResizing,
    hasSignificantChange,
    acknowledgeSignificantChange,
  } = useViewportChange();

  const {
    notifications,
    addHammerNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  } = useNotifications();

  const {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    resetAnimation,
  } = useHammerAnimation((objectId: string) => {
    hammerObject(objectId);

    const newHammeredCount = gameState.hammeredCount + 1;
    const shouldShowNotification = newHammeredCount % 2 === 0;

    if (shouldShowNotification) {
      setTimeout(() => {
        addHammerNotification();
      }, 100);
    }
  });

  useEffect(() => {
    if (gameState.isGameComplete && gameState.totalCount > 0) {
      setTimeout(() => {
        const randomCompletionMessage = getRandomCompletionMessage();
        addCompletionMessage(randomCompletionMessage);
      }, 700);
    }
  }, [gameState.isGameComplete, gameState.totalCount, addCompletionMessage]);

  useEffect(() => {
    if (
      hasSignificantChange &&
      gameState.objects.length > 0 &&
      previousConfig
    ) {
      const shouldRespectOngoingAnimation = isAnimating;

      const executeResponsiveRepositioning = () => {
        repositionObjects(previousConfig, responsiveConfig);
        acknowledgeSignificantChange();
      };

      if (shouldRespectOngoingAnimation) {
        setTimeout(executeResponsiveRepositioning, 300);
      } else {
        executeResponsiveRepositioning();
      }
    }
  }, [
    hasSignificantChange,
    gameState.objects.length,
    previousConfig,
    responsiveConfig,
    isAnimating,
    repositionObjects,
    acknowledgeSignificantChange,
  ]);

  const handleResetGame = useCallback((): void => {
    resetAnimation();
    resetGame();
    clearAllNotifications();
  }, [resetAnimation, resetGame, clearAllNotifications]);

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
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              opacity: isRepositioning ? 0.98 : 1,
              transition: "opacity 0.2s ease-out",
            }}
          >
            <Header
              hammeredCount={gameState.hammeredCount}
              totalCount={gameState.totalCount}
              resetGame={handleResetGame}
            />

            <Game
              gameState={gameState}
              isLoading={isLoading}
              isAnimating={isAnimating}
              isRepositioning={isRepositioning}
              isResizing={isResizing}
              responsiveConfig={responsiveConfig}
              targetObjectId={targetObjectId}
              triggerHammerAnimation={triggerHammerAnimation}
            />

            <NotificationSystem
              notifications={notifications}
              onStartRemoving={startRemovingNotification}
              onFinishRemoving={finishRemovingNotification}
              resetGame={handleResetGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
