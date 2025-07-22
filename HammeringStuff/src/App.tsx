import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header/Header";
import TestGame from "games/TestGame";
import NotificationSystem from "components/NotificationSystem/NotificationSystem";
import useGameState from "hooks/useGameState";
import useNotifications from "hooks/useNotifications";
import { getRandomHammerMessage } from "data/notificationMessages";
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

  const { gameState, isLoading, resetGame, hammerObject } = useGameState();

  const {
    notifications,
    addNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  } = useNotifications();

  // For now, set isAnimating to false (or wire up if available)
  const isAnimating = false;

  /**
   * Enhanced hammer function that triggers notifications on even counts
   * This wraps your existing hammerObject function with notification logic
   */
  const handleHammerObject = useCallback(
    (objectId: string): void => {
      // First, call your existing hammer logic
      hammerObject(objectId);

      // Calculate what the new hammered count will be after this hammer action
      const targetObject = gameState.objects.find((obj) => obj.id === objectId);

      // Only proceed if we found the object and it's not already hammered
      if (targetObject && targetObject.state !== "hammered") {
        const newHammeredCount = gameState.hammeredCount + 1;

        // Check if the new count is even (every 2nd, 4th, 6th, etc.)
        const shouldShowNotification = newHammeredCount % 2 === 0;

        if (shouldShowNotification) {
          // Add the 100ms delay as requested before showing notification
          setTimeout(() => {
            const randomMessage = getRandomHammerMessage();
            addNotification(randomMessage);
          }, 100);
        }
      }
    },
    [hammerObject, gameState.objects, gameState.hammeredCount, addNotification]
  );

  /**
   * Enhanced reset function that also clears all notifications
   * This ensures notifications don't persist after game reset
   */
  const handleResetGame = useCallback((): void => {
    resetGame();
    clearAllNotifications();
  }, [resetGame, clearAllNotifications]);

  const handleStartGame = (): void => {
    setAppState({ showSplash: false });
  };

useEffect(() => {
  if (gameState.isGameComplete && gameState.totalCount > 0) {
    // Add a short delay to let the final hammer animation complete
    setTimeout(() => {
      addCompletionMessage("You saw the world — and whacked it good.");
    }, 800);
  }
}, [gameState.isGameComplete, gameState.totalCount, addCompletionMessage]);


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
          >
            <Header
              hammeredCount={gameState.hammeredCount}
              totalCount={gameState.totalCount}
              resetGame={handleResetGame} // Use enhanced reset function
            />
            <TestGame
              gameState={gameState}
              isLoading={isLoading}
              isAnimating={isAnimating}
              hammerObject={handleHammerObject} // Use enhanced hammer function
            />
            {/* Add the notification system - positioned at bottom-center */}
            <NotificationSystem
              notifications={notifications}
              onStartRemoving={startRemovingNotification}
              onFinishRemoving={finishRemovingNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
