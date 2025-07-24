import React from "react";
import type { Position, InputMode, ShadowConfig } from "types/game";
import styles from "./ShadowOverlay.module.css";

interface ShadowOverlayProps {
  shadowPosition: Position;
  inputMode: InputMode;
  isFirstTouch: boolean;
  shadowConfig: ShadowConfig;
  isPrimaryObjectReady: boolean;
  isAnimating: boolean;
  onHammerClick: () => void;
}

const ShadowOverlay: React.FC<ShadowOverlayProps> = ({
  shadowPosition,
  inputMode,
  isFirstTouch,
  shadowConfig,
  isPrimaryObjectReady,
  isAnimating,
  onHammerClick,
}) => {
  const shadowRadius = shadowConfig.radius;
  const shadowDiameter = shadowRadius * 2;

  const handleShadowClick = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isPrimaryObjectReady && !isAnimating) {
      onHammerClick();
    }
  };

  const getShadowClasses = (): string => {
    const classes = [styles.shadowOverlay];

    classes.push(styles[`input-${inputMode}`]);

    if (isPrimaryObjectReady) {
      classes.push(styles.readyToHammer);
    }

    if (isAnimating) {
      classes.push(styles.hammering);
    }

    if (inputMode === "mobile") {
      if (isFirstTouch) {
        classes.push(styles.firstTouch);
      } else {
        classes.push(styles.tapToHammer);
      }
    }

    return classes.join(" ");
  };

  const getShadowStyles = (): React.CSSProperties => {
    return {
      left: shadowPosition.x - shadowRadius,
      top: shadowPosition.y - shadowRadius + 70, // Offset shadow 70px lower - KEY VISUAL PARAMETER
      width: shadowDiameter,
      height: shadowDiameter,
      "--shadow-opacity": shadowConfig.opacity,
      "--shadow-blur": `${shadowConfig.blurAmount}px`,
      "--shadow-radius": `${shadowRadius}px`,
    } as React.CSSProperties;
  };

  if (shadowPosition.x === 0 && shadowPosition.y === 0) {
    return null;
  }

  return (
    <div
      className={getShadowClasses()}
      style={getShadowStyles()}
      onClick={handleShadowClick}
      onTouchEnd={handleShadowClick}
    >
      <div className={styles.shadowCircle}></div>
    </div>
  );
};

export default ShadowOverlay;
