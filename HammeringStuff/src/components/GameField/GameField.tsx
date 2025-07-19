import React from "react";
import TransformableObject from "components/TransformableObject";
import ShadowOverlay from "components/ShadowOverlay";
import HammerVisual from "components/HammerVisual/HammerVisual";
import useMouseTracking from "hooks/useMouseTracking";
import useCollisionDetection from "hooks/useCollisionDetection";
import useHammerAnimation from "hooks/useHammerAnimation";
import useGameState from "hooks/useGameState";
import type { ShadowConfig } from "types/game";
import { GAME_CONFIG } from "data/gameConfig";
import styles from "./GameField.module.css";

interface GameFieldProps {
  shadowConfig?: ShadowConfig;
  className?: string;
}

/**
 * Main game field component that orchestrates the hammer game
 * Now supports click-to-hammer interaction with visual hammer animation
 */
const GameField: React.FC<GameFieldProps> = ({
  shadowConfig = GAME_CONFIG.shadowConfig,
  className,
}) => {
  // Game state management
  const { gameState, isLoading, hammerObject, resetGame } = useGameState();

  // Mouse/touch position tracking
  const { shadowPosition, inputMode, isFirstTouch } = useMouseTracking();

  // Offset shadow position for collision logic
  const visualShadowPosition = React.useMemo(
    () => ({
      x: shadowPosition.x,
      y: shadowPosition.y,
    }),
    [shadowPosition]
  );

  // Collision detection between shadow and objects
  const collisionResult = useCollisionDetection(
    visualShadowPosition,
    gameState.objects,
    shadowConfig
  );

  // Hammer animation management (manual trigger only)
  const { hammerAnimation, isAnimating, triggerHammerAnimation } =
    useHammerAnimation(hammerObject);

  // Check if primary object is ready for hammering (80%+ coverage)
  const isPrimaryObjectReady = React.useMemo(() => {
    if (!collisionResult.primaryObject) return false;

    const primaryObjectData = collisionResult.intersectingObjects.find(
      (obj) => obj.objectId === collisionResult.primaryObject
    );

    return primaryObjectData
      ? primaryObjectData.intersectionPercentage >= 0.8
      : false;
  }, [collisionResult]);

  // Handle hammer click/tap
  const handleHammerClick = React.useCallback(() => {
    if (
      !isPrimaryObjectReady ||
      isAnimating ||
      !collisionResult.primaryObject
    ) {
      return;
    }
    triggerHammerAnimation(collisionResult.primaryObject);
  }, [
    isPrimaryObjectReady,
    isAnimating,
    collisionResult.primaryObject,
    triggerHammerAnimation,
  ]);

  // Calculate responsive scale factor
  const scaleFactor = React.useMemo(() => {
    const baseWidth = 1920;
    const currentWidth = window.innerWidth;
    return Math.max(0.5, Math.min(1.2, currentWidth / baseWidth));
  }, []);

  // Build CSS classes for game field
  const getGameFieldClasses = (): string => {
    const classes = [styles.gameField];

    if (className) {
      classes.push(className);
    }

    if (isLoading) {
      classes.push(styles.loading);
    }

    if (gameState.isGameComplete) {
      classes.push(styles.gameComplete);
    }

    classes.push(styles[`input-${inputMode}`]);

    return classes.join(" ");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={getGameFieldClasses()}>
        <div className={styles.loadingMessage}>
          Setting up your hammering experience...
        </div>
      </div>
    );
  }

  return (
    <div className={getGameFieldClasses()}>
      {/* Game Header */}
      <div className={styles.gameHeader}>
        <div className={styles.gameStats}>
          <span className={styles.statItem}>
            Progress: {gameState.hammeredCount}/{gameState.totalCount}
          </span>
          <span className={styles.statItem}>Input: {inputMode}</span>
          {isPrimaryObjectReady && (
            <span className={styles.statItem} style={{ color: "#e53e3e" }}>
              Ready to hammer!
            </span>
          )}
        </div>

        <button
          className={styles.resetButton}
          onClick={resetGame}
          disabled={isAnimating}
        >
          Reset Game
        </button>
      </div>

      {/* Main Game Area */}
      <div className={styles.gameArea}>
        {/* Render all game objects */}
        {gameState.objects.map((gameObject) => {
          // Find collision data for this object
          const objectMaskData = collisionResult.intersectingObjects.find(
            (maskData) => maskData.objectId === gameObject.id
          );

          // Check if this object is currently being animated
          const isObjectAnimating =
            isAnimating && hammerAnimation.targetObjectId === gameObject.id;

          return (
            <TransformableObject
              key={gameObject.id}
              gameObject={gameObject}
              maskData={objectMaskData}
              scaleFactor={scaleFactor}
              isAnimating={isObjectAnimating}
              animationProgress={hammerAnimation.progress}
            />
          );
        })}

        {/* Shadow overlay with click handling */}
        <ShadowOverlay
          shadowPosition={shadowPosition}
          inputMode={inputMode}
          isFirstTouch={isFirstTouch}
          shadowConfig={shadowConfig}
          isPrimaryObjectReady={isPrimaryObjectReady}
          isAnimating={isAnimating}
          onHammerClick={handleHammerClick}
        />

        {/* NEW: Hammer Visual Animation */}
        <HammerVisual
          hammerAnimation={hammerAnimation}
          shadowPosition={shadowPosition} // Pass shadow position for rest position
          isVisible={true} // Always visible now
        />
      </div>

      {/* Game Complete Overlay */}
      {gameState.isGameComplete && (
        <div className={styles.gameCompleteOverlay}>
          <div className={styles.winMessage}>
            <h2>🎉 All Objects Hammered!</h2>
            <p>You successfully hammered {gameState.totalCount} objects!</p>
            <button className={styles.playAgainButton} onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Mobile Instructions - Updated for click behavior */}
      {inputMode === "mobile" && gameState.objects.length > 0 && (
        <div className={styles.mobileInstructions}>
          {isFirstTouch ? (
            <p>Touch and drag to move the shadow over objects</p>
          ) : isPrimaryObjectReady ? (
            <p>Tap the shadow to hammer the object!</p>
          ) : (
            <p>Cover 80% of an object to make it ready for hammering</p>
          )}
        </div>
      )}

      {/* Desktop Instructions */}
      {inputMode === "desktop" &&
        gameState.objects.length > 0 &&
        !gameState.isGameComplete && (
          <div className={styles.desktopInstructions}>
            {isPrimaryObjectReady ? (
              <p>Click the shadow to hammer!</p>
            ) : (
              <p>Move mouse to cover 80% of an object, then click to hammer</p>
            )}
          </div>
        )}

      {/* Debug Panel (Development Only) */}
      {/* Debug panel and related code removed */}
    </div>
  );
};

export default GameField;
