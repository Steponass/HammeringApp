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
  onHammerClick: () => void; // New prop for click handling
}

/**
 * Visual shadow overlay that follows cursor/touch
 * Provides visual feedback for hammer interaction areas
 * Now supports clicking when objects are ready
 */
const ShadowOverlay: React.FC<ShadowOverlayProps> = ({
  shadowPosition,
  inputMode,
  isFirstTouch,
  shadowConfig,
  isPrimaryObjectReady,
  isAnimating,
  onHammerClick
}) => {

  // Calculate shadow size based on configuration (now smaller)
  const shadowRadius = shadowConfig.radius;
  const shadowDiameter = shadowRadius * 2;

  // Handle click/tap events
  const handleShadowClick = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Only trigger if an object is ready to be hammered
    if (isPrimaryObjectReady && !isAnimating) {
      console.log('Shadow clicked - triggering hammer');
      onHammerClick();
    } else {
      console.log('Shadow clicked but conditions not met:', {
        isPrimaryObjectReady,
        isAnimating
      });
    }
  };

  // Get shadow classes based on current state
  const getShadowClasses = (): string => {
    const classes = [styles.shadowOverlay];
    
    // Add input mode class
    classes.push(styles[`input-${inputMode}`]);
    
    // Add state classes
    if (isPrimaryObjectReady) {
      classes.push(styles.readyToHammer);
    }
    
    if (isAnimating) {
      classes.push(styles.hammering);
    }
    
    // Mobile-specific classes
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

  // Don't render shadow at origin position (before first mouse movement)
  if (shadowPosition.x === 0 && shadowPosition.y === 0) {
    return null;
  }

  return (
    <div
      className={getShadowClasses()}
      style={getShadowStyles()}
      onClick={handleShadowClick}
      onTouchEnd={handleShadowClick} // Handle touch events for mobile
    >
      {/* Main shadow circle */}
      <div className={styles.shadowCircle}>
        {/* Inner glow effect for ready state */}
        {isPrimaryObjectReady && (
          <div className={styles.readyGlow} />
        )}
        
        {/* Click indicator when ready */}
        {isPrimaryObjectReady && !isAnimating && (
          <div className={styles.clickIndicator}>
            <span className={styles.clickIcon}>
              {inputMode === 'mobile' ? '👆' : '👆'}
            </span>
          </div>
        )}
        
        {/* Hammer indicator for mobile */}
        {inputMode === 'mobile' && !isFirstTouch && isPrimaryObjectReady && (
          <div className={styles.hammerIndicator}>
            <span className={styles.hammerIcon}>🔨</span>
          </div>
        )}
        
        {/* Pulsing effect during animation */}
        {isAnimating && (
          <div className={styles.hammerPulse} />
        )}
      </div>

      {/* Instruction text for mobile users */}
      {inputMode === 'mobile' && isFirstTouch && (
        <div className={styles.mobileInstructions}>
          Move to position
        </div>
      )}
      
      {inputMode === 'mobile' && !isFirstTouch && isPrimaryObjectReady && (
        <div className={styles.mobileInstructions}>
          Tap to hammer!
        </div>
      )}

      {/* Desktop instruction */}
      {inputMode === 'desktop' && isPrimaryObjectReady && !isAnimating && (
        <div className={styles.desktopInstructions}>
          Click to hammer!
        </div>
      )}
    </div>
  );
};

export default ShadowOverlay;