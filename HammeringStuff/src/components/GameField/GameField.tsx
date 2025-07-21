// src/components/GameField/GameField.tsx
import React from "react";
import TransformableObject from "components/TransformableObject";
import ShadowOverlay from "components/ShadowOverlay";
import HammerVisual from "components/HammerVisual/HammerVisual";
import useMouseTracking from "hooks/useMouseTracking";
import useCollisionDetection from "hooks/useCollisionDetection";
import useHammerAnimation from "hooks/useHammerAnimation";
import type { ShadowConfig } from "types/game";
import { GAME_CONFIG } from "data/gameConfig";
import styles from "./GameField.module.css";
import type { GameState } from "types/game";

interface GameFieldProps {
  shadowConfig?: ShadowConfig;
  className?: string;
  gameState: GameState;
  isLoading: boolean;
  hammerObject: (objectId: string) => void;
}

/**
 * Main game field component that orchestrates the hammer game
 * Now supports click-to-hammer interaction with visual hammer animation
 */
const GameField: React.FC<GameFieldProps> = ({
  shadowConfig = GAME_CONFIG.shadowConfig,
  className,
  gameState,
  isLoading,
  hammerObject,
}) => {
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

  const {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    onAnimationComplete,
  } = useHammerAnimation(hammerObject);

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
            isAnimating && gameObject.id === targetObjectId;

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

        <ShadowOverlay
          shadowPosition={shadowPosition}
          inputMode={inputMode}
          isFirstTouch={isFirstTouch}
          shadowConfig={shadowConfig}
          isPrimaryObjectReady={isPrimaryObjectReady}
          isAnimating={isAnimating}
          onHammerClick={handleHammerClick}
        />

        <HammerVisual
          isAnimating={isAnimating}
          targetObjectId={targetObjectId}
          shadowPosition={shadowPosition}
          isVisible={true}
          onAnimationComplete={onAnimationComplete}
        />
      </div>
    </div>
  );
};

export default GameField;
