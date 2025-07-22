import React from "react";
import { getResponsiveLayoutConfig } from 'utils/responsiveLayout';
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
  hammerObject: (objectId: string) => void;
}

const GameField: React.FC<GameFieldProps> = ({
  shadowConfig = GAME_CONFIG.shadowConfig,
  className,
  gameState,
  hammerObject,
}) => {

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
  // UNIFIED SCALING: Use the same scale calculation as the responsive layout system
  // This ensures that objects are rendered at the exact size our placement algorithm expects
  const scaleFactor = React.useMemo(() => {
    const responsiveConfig = getResponsiveLayoutConfig();
    return responsiveConfig.objectScale;
  }, []); // We recalculate this rarely since viewport changes are infrequent

  const {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    onAnimationComplete,
  } = useHammerAnimation(hammerObject);

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

  return (
    <div
      className={`${styles.gameField} ${
        gameState.isGameComplete ? styles.gameComplete : ""
      } ${styles[`input-${inputMode}`]} ${className || ""}`}
    >
      <div className={styles.gameArea}>
        {gameState.objects.map((gameObject) => {
          const objectMaskData = collisionResult.intersectingObjects.find(
            (maskData) => maskData.objectId === gameObject.id
          );

          const isObjectAnimating =
            isAnimating && gameObject.id === targetObjectId;

          return (
            <TransformableObject
              key={gameObject.id}
              gameObject={gameObject}
              maskData={objectMaskData}
              scaleFactor={scaleFactor}
              isAnimating={isObjectAnimating}
              animationProgress={0}
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
