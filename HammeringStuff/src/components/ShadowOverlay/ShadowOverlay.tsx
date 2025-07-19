// src/components/ShadowOverlay/ShadowOverlay.tsx
import React from 'react';
import type { Position, InputMode, ShadowConfig } from 'types/game';
import styles from './ShadowOverlay.module.css';

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
  onHammerClick
}) => {

  // Calculate shadow size based on configuration
  const shadowRadius = shadowConfig.radius;
  const shadowDiameter = shadowRadius * 2;

  // Handle click/tap events
  const handleShadowClick = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isPrimaryObjectReady && !isAnimating) {
      onHammerClick();
    }
  };

  // Get shadow classes based on current state
  const getShadowClasses = (): string => {
    const classes = [styles.shadowOverlay];
    
    classes.push(styles[`input-${inputMode}`]);
    
    if (isPrimaryObjectReady) {
      classes.push(styles.readyToHammer);
    }
    
    if (isAnimating) {
      classes.push(styles.hammering);
    }
    
    if (inputMode === 'mobile') {
      if (isFirstTouch) {
        classes.push(styles.firstTouch);
      } else {
        classes.push(styles.tapToHammer);
      }
    }
    
    return classes.join(' ');
  };

  // Calculate shadow positioning
  const getShadowStyles = (): React.CSSProperties => {
    return {
      left: shadowPosition.x - shadowRadius,
      top: shadowPosition.y - shadowRadius,
      width: shadowDiameter,
      height: shadowDiameter,
      '--shadow-opacity': shadowConfig.opacity,
      '--shadow-blur': `${shadowConfig.blurAmount}px`,
      '--shadow-radius': `${shadowRadius}px`
    } as React.CSSProperties;
  };

  // Don't render shadow at origin position
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
      {/* Main shadow circle */}
      <div className={styles.shadowCircle}>
        {/* Subtle ready glow effect - no icons */}
        {isPrimaryObjectReady && (
          <div className={styles.readyGlow} />
        )}
        
        {/* Pulsing effect during animation */}
        {isAnimating && (
          <div className={styles.hammerPulse} />
        )}
      </div>
    </div>
  );
};

export default ShadowOverlay;