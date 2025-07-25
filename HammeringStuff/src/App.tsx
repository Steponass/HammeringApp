import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header/Header";
import TestGame from "games/TestGame";
import { NAIL_DEFINITIONS } from "data/objectDefinitions";
import NotificationSystem from "components/NotificationSystem/NotificationSystem";
import useGameState from "hooks/useGameState";
import useViewportChange from "hooks/useViewportChange";
import useNotifications from "hooks/useNotifications";
import { getRandomHammerMessage } from "data/notificationMessages";
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
    addNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  } = useNotifications();

  const [isAnimating, setIsAnimating] = useState(false);


  // Trying to preload hammerednail SVGs to fix visual bug of them not animating.
  const preloadHammeredImages = useCallback(() => {
    Object.values(NAIL_DEFINITIONS).forEach(nailDef => {
      const img = new Image();
      img.src = nailDef.hammeredSvgPath;
      
      // Optional: Add load/error logging for debugging
      img.onload = () => {
        console.log(`Preloaded hammered nail: ${nailDef.name}`);
      };
      img.onerror = () => {
        console.warn(`Failed to preload hammered nail: ${nailDef.name}`);
      };
    });
  }, []);

  // Add this useEffect to run preloading when component mounts
  useEffect(() => {
    preloadHammeredImages();
  }, [preloadHammeredImages]);

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

  const usedHammerMessagesRef = useRef<string[]>([]);

  const handleHammerObject = useCallback(
    (objectId: string): void => {
      setIsAnimating(true);
  
      hammerObject(objectId);
  
      const targetObject = gameState.objects.find((obj) => obj.id === objectId);
  
      if (targetObject && targetObject.state !== "hammered") {
        const newHammeredCount = gameState.hammeredCount + 1;
        const shouldShowNotification = newHammeredCount % 2 === 0;
  
        if (shouldShowNotification) {
          setTimeout(() => {
            const randomMessage = getRandomHammerMessage(usedHammerMessagesRef.current);
            usedHammerMessagesRef.current = [...usedHammerMessagesRef.current, randomMessage];
            addNotification(randomMessage);
          }, 100);
        }
      }
  
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    },
    [hammerObject, gameState.objects, gameState.hammeredCount, addNotification]
  );

  const handleResetGame = useCallback((): void => {
    setIsAnimating(false);
    resetGame();
    clearAllNotifications();
  }, [resetGame, clearAllNotifications]);

  const handleStartGame = (): void => {
    setAppState({ showSplash: false });
  };

  useEffect(() => {
    if (gameState.isGameComplete && gameState.totalCount > 0) {
      setTimeout(() => {
        const randomCompletionMessage = getRandomCompletionMessage();
        addCompletionMessage(randomCompletionMessage);
      }, 700);
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

            <TestGame
              gameState={gameState}
              isLoading={isLoading}
              isAnimating={isAnimating}
              isRepositioning={isRepositioning}
              isResizing={isResizing}
              responsiveConfig={responsiveConfig}
              hammerObject={handleHammerObject}
            />

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
