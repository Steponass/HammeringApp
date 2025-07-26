import React, { useEffect, useState, useRef, useMemo } from "react";
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

  const previousXRef = useRef(gameObject.position.x);
  const previousYRef = useRef(gameObject.position.y);
  const [isPositionTransitioning, setIsPositionTransitioning] = useState(false);
  const [animateClass, setAnimateClass] = useState('');

  useEffect(() => {
    const currentX = gameObject.position.x;
    const currentY = gameObject.position.y;
    const previousX = previousXRef.current;
    const previousY = previousYRef.current;

    const significantPositionChange =
      Math.abs(currentX - previousX) > 3 || Math.abs(currentY - previousY) > 3;

    if (significantPositionChange && isRepositioning) {
      setIsPositionTransitioning(true);

      const transitionTimeout = setTimeout(() => {
        setIsPositionTransitioning(false);
      }, 300);

      previousXRef.current = currentX;
      previousYRef.current = currentY;

      return () => clearTimeout(transitionTimeout);
    }

    // Always update coordinate references for the next comparison
    previousXRef.current = currentX;
    previousYRef.current = currentY;
  }, [gameObject.position.x, gameObject.position.y, isRepositioning]);

  // Handle CSS animation trigger for hammered nail
  useEffect(() => {
    if (gameObject.state === "hammered") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setAnimateClass('animate');
      }, 50);
    } else {
      setAnimateClass('');
    }
  }, [gameObject.state]);

  const adjustedSize = useMemo(() => {
    return gameObject.size * scaleFactor;
  }, [gameObject.size, scaleFactor]);

  const containerStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: gameObject.position.x,
      top: gameObject.position.y,
      width: adjustedSize,
      height: adjustedSize,
      opacity: isRepositioning
        ? Math.max(0.95, 1 - animationProgress * 0.05)
        : 1,
    };

    if (isPositionTransitioning || isRepositioning) {
      return {
        ...baseStyle,
        transition:
          "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease, height 0.3s ease, opacity 0.2s ease",
      };
    }

    return baseStyle;
  }, [
    gameObject.position.x,
    gameObject.position.y,
    adjustedSize,
    isPositionTransitioning,
    isRepositioning,
    animationProgress,
  ]);

  const containerClassName = useMemo(() => {
    const classes = [styles.container];

    if (isRepositioning) classes.push("repositioning");
    if (isPositionTransitioning) classes.push("position-transitioning");
    if (isAnimating) classes.push("hammer-animating");

    return classes.join(" ");
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
    <div className={containerClassName} style={containerStyle}>
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

      {gameObject.state === "hammered" && (
        <img
          src={nailDef.hammeredSvgPath}
          alt={`${nailDef.name} (Hammered)`}
          className={`${styles.hammeredNailLayer} ${animateClass ? styles.animate : ''}`}
          style={{
            ...getHammeredNailMaskStyles(),
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      )}
    </div>
  );
};

export default TransformableObject;