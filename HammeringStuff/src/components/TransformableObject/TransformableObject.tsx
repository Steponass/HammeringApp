// components/TransformableObject/TransformableObject.tsx - Fixed useEffect dependency
import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { GameObject, ObjectMaskData } from "types/game";
import { getObjectDefinition, getNailDefinition } from "data/objectDefinitions";
import styles from "./TransformableObject.module.css";

interface TransformableObjectProps {
  gameObject: GameObject;
  maskData?: ObjectMaskData;
  scaleFactor: number;
  isAnimating: boolean;
  isRepositioning?: boolean;
  animationProgress: number;
}

const TransformableObject: React.FC<TransformableObjectProps> = ({
  gameObject,
  maskData,
  scaleFactor,
  isAnimating,
  isRepositioning = false,
  animationProgress,
}) => {
  const objectDef = getObjectDefinition(gameObject.objectType);
  const nailDef = getNailDefinition(gameObject.nailType);

  // EXPLANATION: Instead of storing the entire position object, we store the individual coordinates
  // This makes our dependency tracking much clearer and more precise
  const previousXRef = useRef(gameObject.position.x);
  const previousYRef = useRef(gameObject.position.y);
  const [isPositionTransitioning, setIsPositionTransitioning] = useState(false);
  const [responsiveTransitionActive, setResponsiveTransitionActive] = useState(false);

  // FIXED: Restructured effect to be explicit about which values it depends on
  useEffect(() => {
    // EXPLANATION: Instead of accessing gameObject.position directly, we work with
    // the individual x and y values that are already in our dependency array
    const currentX = gameObject.position.x;
    const currentY = gameObject.position.y;
    const previousX = previousXRef.current;
    const previousY = previousYRef.current;
    
    // EXPLANATION: Now our position change calculation uses the individual coordinates
    // This makes the dependency relationship crystal clear to both React and future developers
    const significantPositionChange = (
      Math.abs(currentX - previousX) > 3 ||
      Math.abs(currentY - previousY) > 3
    );

    if (significantPositionChange && isRepositioning) {
      setIsPositionTransitioning(true);
      setResponsiveTransitionActive(true);
      
      const transitionTimeout = setTimeout(() => {
        setIsPositionTransitioning(false);
        setResponsiveTransitionActive(false);
      }, 300);

      // EXPLANATION: Update our individual coordinate references
      // This is cleaner than storing the entire position object
      previousXRef.current = currentX;
      previousYRef.current = currentY;

      return () => clearTimeout(transitionTimeout);
    }

    // EXPLANATION: Always update our coordinate references for the next comparison
    previousXRef.current = currentX;
    previousYRef.current = currentY;
  }, [gameObject.position.x, gameObject.position.y, isRepositioning]); 
  // FIXED: Now our dependency array perfectly matches what we're actually using in the effect

  const adjustedSize = useMemo(() => {
    return gameObject.size * scaleFactor;
  }, [gameObject.size, scaleFactor]);

  const containerStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: gameObject.position.x,
      top: gameObject.position.y,
      width: adjustedSize,
      height: adjustedSize,
      opacity: isRepositioning ? 
        Math.max(0.95, 1 - (animationProgress * 0.05)) : 1,
    };

    if (isPositionTransitioning || isRepositioning) {
      return {
        ...baseStyle,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease, height 0.3s ease, opacity 0.2s ease',
        pointerEvents: responsiveTransitionActive ? ('none' as const) : ('auto' as const),
      };
    }

    return baseStyle;
  }, [
    gameObject.position.x, 
    gameObject.position.y, 
    adjustedSize, 
    isPositionTransitioning, 
    isRepositioning,
    responsiveTransitionActive,
    animationProgress
  ]);

  const containerClassName = useMemo(() => {
    const classes = [styles.container];
    
    if (isRepositioning) classes.push('repositioning');
    if (isPositionTransitioning) classes.push('position-transitioning');
    if (isAnimating) classes.push('hammer-animating');
    
    return classes.join(' ');
  }, [isRepositioning, isPositionTransitioning, isAnimating]);

  if (!objectDef || !nailDef) {
    return null;
  }

  const getOriginalMaskStyles = (): React.CSSProperties => {
    if (!maskData?.hasIntersection || gameObject.state === "hammered") {
      return {};
    }

    return {
      clipPath: `circle(100% at 50% 50%) subtract circle(${maskData.maskCoordinates.radius}px at ${maskData.maskCoordinates.centerX}px ${maskData.maskCoordinates.centerY}px)`,
    };
  };

  const getNailMaskStyles = (): React.CSSProperties => {
    if (gameObject.state === "hammered") {
      return { display: "none" };
    }

    if (!maskData?.hasIntersection) {
      return { display: "none" };
    }

    return {
      clipPath: `circle(${maskData.maskCoordinates.radius}px at ${maskData.maskCoordinates.centerX}px ${maskData.maskCoordinates.centerY}px)`,
    };
  };

  const getHammeredNailMaskStyles = (): React.CSSProperties => {
    if (gameObject.state !== "hammered") {
      return { display: "none" };
    }
    return {};
  };

  return (
    <div
      className={containerClassName}
      style={containerStyle}
    >
      {gameObject.state !== "hammered" && (
        <img
          src={objectDef.svgPath}
          alt={objectDef.name}
          className={styles.originalLayer}
          style={getOriginalMaskStyles()}
        />
      )}

      {maskData?.hasIntersection && gameObject.state !== "hammered" && (
        <img
          src={nailDef.svgPath}
          alt={`${nailDef.name} (Ready)`}
          className={styles.nailLayer}
          style={getNailMaskStyles()}
        />
      )}

      <AnimatePresence>
        {gameObject.state === "hammered" && (
          <motion.img
            src={nailDef.hammeredSvgPath}
            alt={`${nailDef.name} (Hammered)`}
            className={styles.hammeredNailLayer}
            style={getHammeredNailMaskStyles()}
            initial={{ 
              y: 0, 
              scaleY: 1, 
              scaleX: 1 
            }}
            animate={{ 
              y: responsiveTransitionActive ? [0, 2, -1, 0] : [0, 3, -2, 0],
              scaleY: responsiveTransitionActive ? [1, 0.98, 1.02, 1] : [1, 0.97, 1.03, 1],
              scaleX: responsiveTransitionActive ? [1, 1.02, 0.98, 1] : [1, 1.03, 0.97, 1],
            }}
            transition={{
              duration: responsiveTransitionActive ? 0.25 : 0.2,
              ease: "easeInOut",
              times: [0, 0.2, 0.6, 1],
            }}
          />
        )}
      </AnimatePresence>

      {responsiveTransitionActive && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.6)',
            animation: 'pulse 1s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
};

export default TransformableObject;