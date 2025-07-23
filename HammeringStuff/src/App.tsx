// App.tsx - Enhanced with responsive behavior, preserving your existing architecture
import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header/Header";
import TestGame from "games/TestGame";
import NotificationSystem from "components/NotificationSystem/NotificationSystem";
import useGameState from "hooks/useGameState";
import useViewportChange from "hooks/useViewportChange"; // NEW: Our viewport detection system
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

  // EXPLANATION: We're now using our enhanced useGameState hook that includes responsive capabilities
  // Notice that we're extracting the new responsive-related functions alongside your existing ones
  const { 
    gameState, 
    isLoading, 
    isRepositioning, // NEW: Tells us when objects are being repositioned
    resetGame, 
    hammerObject,
    repositionObjects // NEW: Function to trigger responsive repositioning
  } = useGameState();

  // NEW: This is our responsive detection system - think of it as a smart observer
  // that watches for meaningful changes in the user's screen environment
  const {
    responsiveConfig,      // Current responsive configuration based on viewport
    previousConfig,        // Previous configuration (needed for comparison)
    isResizing,           // Whether the viewport is currently changing
    hasSignificantChange, // Whether the change requires repositioning objects
    acknowledgeSignificantChange // Function to mark that we've handled the change
  } = useViewportChange();

  const {
    notifications,
    addNotification,
    addCompletionMessage,
    startRemovingNotification,
    finishRemovingNotification,
    clearAllNotifications,
  } = useNotifications();

  // EXPLANATION: Instead of hardcoding isAnimating to false, we now track it dynamically
  // This allows our responsive system to make intelligent decisions about timing
  const [isAnimating, setIsAnimating] = useState(false);

  // NEW: This is the heart of our responsive coordination system
  // This effect acts like a conductor, orchestrating when and how to respond to viewport changes
  useEffect(() => {
    // EXPLANATION: We only take action when three conditions are met:
    // 1. There's been a significant viewport change (not just tiny adjustments)
    // 2. We have game objects that need repositioning (not an empty game state)
    // 3. We have the previous configuration to compare against
    if (hasSignificantChange && gameState.objects.length > 0 && previousConfig) {
      
      // EXPLANATION: This implements your preference for edge case handling
      // If a hammer animation is in progress, we respect that interaction and delay slightly
      const shouldRespectOngoingAnimation = isAnimating;
      
      const executeResponsiveRepositioning = () => {
        // EXPLANATION: Here we apply your preferred hybrid strategy
        // The repositionObjects function analyzes the type of change (minor adjustment vs major shift)
        // and chooses the best approach (maintain relative positions vs optimal recomputation)
        repositionObjects(previousConfig, responsiveConfig);
        
        // EXPLANATION: We tell the viewport detection system that we've handled this change
        // This prevents the system from continuously trying to reposition for the same viewport change
        acknowledgeSignificantChange();
      };

      if (shouldRespectOngoingAnimation) {
        // EXPLANATION: When a user is actively hammering an object, we let that interaction
        // complete smoothly before repositioning. This creates a more polished experience.
        setTimeout(executeResponsiveRepositioning, 300);
      } else {
        // EXPLANATION: When no interactions are happening, we can respond immediately
        // This provides the most responsive experience for viewport changes
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
    acknowledgeSignificantChange
  ]);

  /**
   * Enhanced hammer function that triggers notifications on even counts
   * NOW ALSO tracks animation state for responsive coordination
   * 
   * EXPLANATION: This builds on your existing enhancement pattern by adding another layer
   * of functionality - responsive awareness - while preserving all your existing behavior
   */
  const handleHammerObject = useCallback(
    (objectId: string): void => {
      // NEW: Signal that a hammer animation is starting
      // This information helps our responsive system make better timing decisions
      setIsAnimating(true);
      
      // EXPLANATION: Your existing hammer logic remains exactly the same
      // We're adding responsive awareness without changing your core game behavior
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

      // NEW: Clear the animation flag after the hammer animation completes
      // EXPLANATION: This timing should match your actual hammer animation duration
      // You can adjust this value based on your visual animation timing
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Adjust this to match your hammer animation duration
    },
    [hammerObject, gameState.objects, gameState.hammeredCount, addNotification]
  );

  /**
   * Enhanced reset function that also clears all notifications
   * NOW ALSO resets responsive system state for a clean start
   * 
   * EXPLANATION: Again, we're building on your existing enhancement pattern
   * by adding responsive state cleanup while preserving your existing functionality
   */
  const handleResetGame = useCallback((): void => {
    // NEW: Reset responsive system state when starting a new game
    // This ensures the responsive system starts fresh with no lingering state from the previous game
    setIsAnimating(false);
    
    // EXPLANATION: Your existing reset logic remains unchanged
    // We're just adding responsive cleanup as an additional enhancement
    resetGame();
    clearAllNotifications();
  }, [resetGame, clearAllNotifications]);

  const handleStartGame = (): void => {
    setAppState({ showSplash: false });
  };

  // EXPLANATION: Your existing game completion logic remains exactly the same
  // The responsive system doesn't interfere with your game progression logic
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
            // NEW: Add subtle visual feedback during responsive transitions
            // EXPLANATION: This preserves your existing animation while adding responsive awareness
            style={{
              opacity: isRepositioning ? 0.98 : 1,
              transition: "opacity 0.2s ease-out"
            }}
          >
            <Header
              hammeredCount={gameState.hammeredCount}
              totalCount={gameState.totalCount}
              resetGame={handleResetGame} // Your enhanced reset function
            />
            
            {/* EXPLANATION: We're extending your TestGame component with responsive props
                while preserving your existing prop structure and patterns */}
            <TestGame
              gameState={gameState}
              isLoading={isLoading}
              isAnimating={isAnimating} // Now dynamically tracked instead of hardcoded
              isRepositioning={isRepositioning} // NEW: Let game know when repositioning
              isResizing={isResizing}           // NEW: Let game know when viewport changing
              responsiveConfig={responsiveConfig} // NEW: Current responsive configuration
              hammerObject={handleHammerObject} // Your enhanced hammer function
            />
            
            {/* Your existing notification system remains exactly the same */}
            <NotificationSystem
              notifications={notifications}
              onStartRemoving={startRemovingNotification}
              onFinishRemoving={finishRemovingNotification}
            />
            
            {/* NEW: Optional subtle feedback during responsive operations
                EXPLANATION: This provides user feedback during repositioning without being intrusive
                You can customize or remove this based on your design preferences */}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;