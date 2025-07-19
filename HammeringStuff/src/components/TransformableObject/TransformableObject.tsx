import React from 'react';
import type { GameObject, ObjectMaskData } from 'types/game';
import { GAME_CONFIG } from 'data/gameConfig';
import styles from './TransformableObject.module.css';

interface TransformableObjectProps {
  gameObject: GameObject;
  maskData?: ObjectMaskData;
  scaleFactor: number;
  isAnimating: boolean;
  animationProgress: number;
}

/**
 * Individual game object that can be transformed into a nail
 * Handles visual states, masking effects, and animations
 */
const TransformableObject: React.FC<TransformableObjectProps> = ({
  gameObject,
  maskData,
  scaleFactor,
  isAnimating,
  animationProgress
}) => {
  const { id, position, objectType, state, size } = gameObject;
  
  // Get object configuration for display
  const objectConfig = GAME_CONFIG.availableObjects[objectType];
  const adjustedSize = size * scaleFactor;
  
  // Determine what to display based on object state
  const getDisplayContent = (): string => {
    switch (state) {
      case 'normal':
        return objectConfig?.placeholder || '❓';
      case 'transformed':
        return objectConfig?.placeholder || '❓'; // Still showing object during transformation
      case 'hammered':
        return '🔩'; // Generic nail placeholder - will be replaced with proper nail SVGs
      default:
        return '❓';
    }
  };

  // Calculate CSS custom properties for masking
  const getMaskingStyles = (): React.CSSProperties => {
    if (!maskData || !maskData.hasIntersection) {
      return {};
    }

    return {
      '--mask-x': `${maskData.maskCoordinates.centerX}px`,
      '--mask-y': `${maskData.maskCoordinates.centerY}px`,
      '--mask-radius': `${maskData.maskCoordinates.radius}px`,
      '--intersection-percentage': maskData.intersectionPercentage
    } as React.CSSProperties;
  };

  // Calculate animation transform
  const getAnimationStyles = (): React.CSSProperties => {
    if (!isAnimating) {
      return {};
    }

    // Impact animation: scale and shake effect
    const scaleEffect = 1 + (Math.sin(animationProgress * Math.PI) * 0.2);
    const shakeX = Math.sin(animationProgress * Math.PI * 8) * 3;
    const shakeY = Math.cos(animationProgress * Math.PI * 6) * 2;

    return {
      transform: `scale(${scaleEffect}) translate(${shakeX}px, ${shakeY}px)`
    };
  };

  // Build CSS classes based on current state
  const getObjectClasses = (): string => {
    const classes = [styles.transformableObject];
    
    // Add state-specific classes
    classes.push(styles[`state-${state}`]);
    
    // Add intersection class if object is being revealed
    if (maskData?.hasIntersection) {
      classes.push(styles.intersecting);
    }
    
    // Add animation class
    if (isAnimating) {
      classes.push(styles.animating);
    }
    
    // Add coverage threshold class for visual feedback
    if (maskData && maskData.intersectionPercentage >= 0.8) {
      classes.push(styles.readyToHammer);
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={getObjectClasses()}
      style={{
        left: position.x,
        top: position.y,
        width: adjustedSize,
        height: adjustedSize,
        ...getMaskingStyles(),
        ...getAnimationStyles()
      }}
      data-object-id={id}
      data-object-type={objectType}
      data-coverage={maskData?.intersectionPercentage || 0}
    >
      {/* Object Content */}
      <div className={styles.objectContent}>
        <span className={styles.objectEmoji}>
          {getDisplayContent()}
        </span>
      </div>

      {/* Masking Overlay - shows the "hammered" area */}
      {maskData?.hasIntersection && state === 'normal' && (
        <div 
          className={styles.maskOverlay}
          style={{
            clipPath: `circle(var(--mask-radius) at var(--mask-x) var(--mask-y))`
          }}
        >
          <div className={styles.revealedContent}>
            <span className={styles.nailEmoji}>
              🔩 {/* This will be replaced with proper nail SVG */}
            </span>
          </div>
        </div>
      )}

      {/* Coverage Indicator for debugging (remove in production) */}
      {process.env.NODE_ENV === 'development' && maskData?.hasIntersection && (
        <div className={styles.debugInfo}>
          {Math.round(maskData.intersectionPercentage * 100)}%
        </div>
      )}
    </div>
  );
};

export default TransformableObject;