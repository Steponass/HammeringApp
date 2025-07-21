// src/components/GameField/GameField.tsx
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

  // Hammer animation management (updated for Framer Motion)
  const {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    onAnimationComplete,
  } = useHammerAnimation(hammerObject);

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

  // Calculate scale factor based on viewport size
  const scaleFactor = React.useMemo(() => {
    const baseSize = 60; // Base object size from config
    const minViewportDim = Math.min(window.innerWidth, window.innerHeight);
    const targetSize = Math.max(baseSize, minViewportDim * 0.08);
    return targetSize / baseSize;
  }, []);

  // Handle hammer click/tap
  const handleHammerClick = React.useCallback(() => {
    if (
      !isPrimaryObjectReady ||
      isAnimating ||
      !collisionResult.primaryObject
    ) {
      return;
    }

    // Trigger hammer animation for the primary object
    triggerHammerAnimation(collisionResult.primaryObject);
  }, [
    isPrimaryObjectReady,
    isAnimating,
    collisionResult.primaryObject,
    triggerHammerAnimation,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`${styles.gameField} ${styles.loading} ${className || ""}`}
      >
        <div className={styles.loadingMessage}>
          <p>Setting up the workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.gameField} ${
        gameState.isGameComplete ? styles.gameComplete : ""
      } ${styles[`input-${inputMode}`]} ${className || ""}`}
    >
      {/* Game Header with Stats */}
      <div className={styles.gameHeader}>
        <div className={styles.gameStats}>
          <span className={styles.statItem}>
            Objects: {gameState.hammeredCount} / {gameState.totalCount}
          </span>
          {collisionResult.primaryObject && (
            <span className={styles.statItem}>
              Coverage:{" "}
              {Math.round(
                (collisionResult.intersectingObjects.find(
                  (obj) => obj.objectId === collisionResult.primaryObject
                )?.intersectionPercentage || 0) * 100
              )}
              %
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
            isAnimating && targetObjectId === gameObject.id;

          return (
            <TransformableObject
              key={gameObject.id}
              gameObject={gameObject}
              maskData={objectMaskData}
              scaleFactor={scaleFactor}
              isAnimating={isObjectAnimating}
              animationProgress={0} // Not used with Framer Motion
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

        {/* Hammer Visual Animation (Framer Motion) */}
        <HammerVisual
          isAnimating={isAnimating}
          targetObjectId={targetObjectId}
          shadowPosition={shadowPosition}
          isVisible={true}
          onAnimationComplete={onAnimationComplete}
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

      {/* Mobile Instructions */}
      {inputMode === "mobile" &&
        gameState.objects.length > 0 &&
        !gameState.isGameComplete && (
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
    </div>
  );
};

export default GameField;
