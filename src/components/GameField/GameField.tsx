import React, { useMemo, useRef, useEffect } from "react";
import { getResponsiveLayoutConfig } from "utils/responsiveLayout";
import type { ResponsiveLayoutConfig } from "utils/responsiveLayout";
import TransformableObject from "components/TransformableObject";
import ShadowOverlay from "components/ShadowOverlay";
import HammerVisual from "components/HammerVisual/HammerVisual";
import useMouseTracking from "hooks/useMouseTracking";
import useCollisionDetection from "hooks/useCollisionDetection";
import type { ShadowConfig, GameState } from "types/game";
import { GAME_CONFIG } from "data/gameConfig";
import styles from "./GameField.module.css";

interface GameFieldProps {
  shadowConfig?: ShadowConfig;
  className?: string;
  gameState: GameState;
  isAnimating?: boolean;
  isRepositioning?: boolean;
  responsiveConfig?: ResponsiveLayoutConfig;
  targetObjectId: string | null;
  triggerHammerAnimation: (objectId: string) => void;
}

const GameField: React.FC<GameFieldProps> = ({
  shadowConfig = GAME_CONFIG.shadowConfig,
  className,
  gameState,
  isAnimating = false,
  isRepositioning = false,
  responsiveConfig,
  targetObjectId,
  triggerHammerAnimation,
}) => {
  const { shadowPosition, inputMode, isFirstTouch } = useMouseTracking();

  // Track previous responsive configuration for change detection
  const previousResponsiveConfigRef = useRef<ResponsiveLayoutConfig | null>(
    null
  );

  // Effect to detect responsive configuration changes
  useEffect(() => {
    if (responsiveConfig) {
      previousResponsiveConfigRef.current = responsiveConfig;
    }
  }, [responsiveConfig]);

  const visualShadowPosition = useMemo(
    () => ({
      x: shadowPosition.x,
      y: shadowPosition.y,
    }),
    [shadowPosition]
  );

  const collisionResult = useCollisionDetection(
    visualShadowPosition,
    gameState.objects,
    shadowConfig
  );

  // Check if primary object is ready for hammering (disable during repositioning)
  const isPrimaryObjectReady = useMemo(() => {
    if (isRepositioning) return false;

    if (!collisionResult.primaryObject) return false;

    const primaryObjectData = collisionResult.intersectingObjects.find(
      (obj) => obj.objectId === collisionResult.primaryObject
    );

    return primaryObjectData
      ? primaryObjectData.intersectionPercentage >= 0.8
      : false;
  }, [collisionResult, isRepositioning]);

  const scaleFactor = useMemo(() => {
    if (responsiveConfig) {
      return responsiveConfig.objectScale;
    }

    const currentResponsiveConfig = getResponsiveLayoutConfig();
    return currentResponsiveConfig.objectScale;
  }, [responsiveConfig]);

  const handleHammerClick = React.useCallback(() => {
    if (
      !isPrimaryObjectReady ||
      isAnimating ||
      isRepositioning ||
      !collisionResult.primaryObject
    ) {
      return;
    }
    triggerHammerAnimation(collisionResult.primaryObject);
  }, [
    isPrimaryObjectReady,
    isAnimating,
    isRepositioning,
    collisionResult.primaryObject,
    triggerHammerAnimation,
  ]);

  // Create responsive-aware container styling
  const containerClassName = useMemo(() => {
    const baseClasses = [
      styles.gameField,
      gameState.isGameComplete ? styles.gameComplete : "",
      styles[`input-${inputMode}`],
      className || "",
    ];

    if (isRepositioning) {
      baseClasses.push("repositioning");
    }

    return baseClasses.join(" ").trim();
  }, [gameState.isGameComplete, inputMode, className, isRepositioning]);

  return (
    <div className={containerClassName}>
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
          isAnimating={isAnimating || isRepositioning}
          onHammerClick={handleHammerClick}
        />

        <HammerVisual
          isAnimating={isAnimating}
          targetObjectId={targetObjectId}
          shadowPosition={shadowPosition}
          isVisible={!isRepositioning}
        />
      </div>
    </div>
  );
};

export default GameField;
