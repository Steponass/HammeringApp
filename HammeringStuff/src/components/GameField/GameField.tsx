// components/GameField/GameField.tsx - Fixed version that matches your existing interfaces
import React, { useMemo, useRef, useEffect } from "react";
import { getResponsiveLayoutConfig } from 'utils/responsiveLayout';
import type { ResponsiveLayoutConfig } from 'utils/responsiveLayout';
import TransformableObject from "components/TransformableObject";
import ShadowOverlay from "components/ShadowOverlay";
import HammerVisual from "components/HammerVisual/HammerVisual";
import useMouseTracking from "hooks/useMouseTracking";
import useCollisionDetection from "hooks/useCollisionDetection";
import useHammerAnimation from "hooks/useHammerAnimation";
import type { ShadowConfig, GameState } from "types/game";
import { GAME_CONFIG } from "data/gameConfig";
import styles from "./GameField.module.css";

interface GameFieldProps {
  shadowConfig?: ShadowConfig;
  className?: string;
  gameState: GameState;
  isAnimating?: boolean;
  isRepositioning?: boolean;        // NEW: Track when objects are being repositioned
  responsiveConfig?: ResponsiveLayoutConfig; // NEW: Current responsive configuration
  hammerObject: (objectId: string) => void;
}

const GameField: React.FC<GameFieldProps> = ({
  shadowConfig = GAME_CONFIG.shadowConfig,
  className,
  gameState,
  // REMOVED: isAnimating prop since we're getting animation state from useHammerAnimation
  isRepositioning = false,      // NEW: Default to false for backward compatibility
  responsiveConfig,             // NEW: Optional responsive configuration
  hammerObject,
}) => {

  const { shadowPosition, inputMode, isFirstTouch } = useMouseTracking();

  // Track previous responsive configuration for change detection
  const previousResponsiveConfigRef = useRef<ResponsiveLayoutConfig | null>(null);

  // Effect to detect responsive configuration changes
  useEffect(() => {
    if (responsiveConfig && previousResponsiveConfigRef.current) {
      const configChanged = (
        responsiveConfig.deviceType !== previousResponsiveConfigRef.current.deviceType ||
        Math.abs(responsiveConfig.objectScale - previousResponsiveConfigRef.current.objectScale) > 0.05
      );
      
      if (configChanged) {
        // Here you could add special transition effects if needed
        console.log('Responsive configuration changed, applying smooth transitions');
      }
    }
    
    if (responsiveConfig) {
      previousResponsiveConfigRef.current = responsiveConfig;
    }
  }, [responsiveConfig]);

  // Calculate visual shadow position
  const visualShadowPosition = useMemo(
    () => ({
      x: shadowPosition.x,
      y: shadowPosition.y,
    }),
    [shadowPosition]
  );

  // FIXED: Use the original useCollisionDetection call signature (2-3 arguments, not 4)
  // We'll handle the repositioning logic in the collision result processing instead
  const collisionResult = useCollisionDetection(
    visualShadowPosition,
    gameState.objects,
    shadowConfig
  );

  // Check if primary object is ready for hammering (disable during repositioning)
  const isPrimaryObjectReady = useMemo(() => {
    if (isRepositioning) return false; // Disable interactions during repositioning
    
    if (!collisionResult.primaryObject) return false;

    const primaryObjectData = collisionResult.intersectingObjects.find(
      (obj) => obj.objectId === collisionResult.primaryObject
    );

    return primaryObjectData
      ? primaryObjectData.intersectionPercentage >= 0.8
      : false;
  }, [collisionResult, isRepositioning]);

  // Calculate unified scale factor for responsive rendering
  const scaleFactor = useMemo(() => {
    if (responsiveConfig) {
      return responsiveConfig.objectScale;
    }
    
    const currentResponsiveConfig = getResponsiveLayoutConfig();
    return currentResponsiveConfig.objectScale;
  }, [responsiveConfig]);

  // Get hammer animation state from the hook
  const {
    isAnimating: isHammerAnimating,
    targetObjectId,
    triggerHammerAnimation,
    onAnimationComplete,
  } = useHammerAnimation(hammerObject);

  // Enhanced hammer click handler with responsive awareness
  const handleHammerClick = React.useCallback(() => {
    if (
      !isPrimaryObjectReady ||
      isHammerAnimating ||
      isRepositioning || // Prevent hammering during repositioning
      !collisionResult.primaryObject
    ) {
      return;
    }
    triggerHammerAnimation(collisionResult.primaryObject);
  }, [
    isPrimaryObjectReady,
    isHammerAnimating,
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
      className || ""
    ];
    
    // Add responsive state classes for CSS-based responsive feedback
    if (isRepositioning) {
      baseClasses.push('repositioning'); // Use string literal since styles.repositioning might not exist yet
    }
    
    return baseClasses.join(' ').trim();
  }, [
    gameState.isGameComplete, 
    inputMode, 
    className, 
    isRepositioning
  ]);

  return (
    <div className={containerClassName}>
      <div className={styles.gameArea}>
        {gameState.objects.map((gameObject) => {
          const objectMaskData = collisionResult.intersectingObjects.find(
            (maskData) => maskData.objectId === gameObject.id
          );

          const isObjectAnimating =
            isHammerAnimating && gameObject.id === targetObjectId;

          // FIXED: Only pass props that TransformableObject actually accepts
          // We'll add isRepositioning support to TransformableObject in the next step
          return (
            <TransformableObject
              key={gameObject.id}
              gameObject={gameObject}
              maskData={objectMaskData}
              scaleFactor={scaleFactor}
              isAnimating={isObjectAnimating}
              animationProgress={0}
              // NOTE: We'll add isRepositioning prop to TransformableObject interface next
            />
          );
        })}

        <ShadowOverlay
          shadowPosition={shadowPosition}
          inputMode={inputMode}
          isFirstTouch={isFirstTouch}
          shadowConfig={shadowConfig}
          isPrimaryObjectReady={isPrimaryObjectReady}
          isAnimating={isHammerAnimating || isRepositioning} // Include repositioning in animation state
          onHammerClick={handleHammerClick}
        />

        <HammerVisual
          isAnimating={isHammerAnimating}
          targetObjectId={targetObjectId}
          shadowPosition={shadowPosition}
          isVisible={!isRepositioning} // Hide hammer during repositioning for cleaner experience
          onAnimationComplete={onAnimationComplete}
        />
      </div>
      
      {/* Optional responsive transition feedback */}
      {isRepositioning && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};

export default GameField;