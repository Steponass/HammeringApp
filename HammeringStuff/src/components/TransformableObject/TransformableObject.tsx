import React from 'react';
import type { GameObject, ObjectMaskData } from 'types/game';
import { getObjectDefinition, getNailDefinition } from 'data/objectDefinitions';
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
  scaleFactor
}) => {
  const { objectType, nailType, state, size, position } = gameObject;
  
  const objectDef = getObjectDefinition(objectType);
  const nailDef = getNailDefinition(nailType);
  
  if (!objectDef || !nailDef) {
    return null;
  }

  const adjustedSize = size * scaleFactor;

  // Calculate masking styles for original object (hide where shadow overlaps)
  const getOriginalMaskStyles = (): React.CSSProperties => {
    if (!maskData?.hasIntersection || state === 'hammered') {
      return {};
    }

    // Create inverse mask - hide the circular area where shadow overlaps
    return {
      clipPath: `circle(100% at 50% 50%) subtract circle(${maskData.maskCoordinates.radius}px at ${maskData.maskCoordinates.centerX}px ${maskData.maskCoordinates.centerY}px)`
    };
  };

  // Calculate masking styles for nail layer (show only where shadow overlaps)
  const getNailMaskStyles = (): React.CSSProperties => {
    if (state === 'hammered') {
      // When hammered, show full nail
      return {};
    }

    if (!maskData?.hasIntersection) {
      return { display: 'none' };
    }

    // Show only the circular area where shadow overlaps
    return {
      clipPath: `circle(${maskData.maskCoordinates.radius}px at ${maskData.maskCoordinates.centerX}px ${maskData.maskCoordinates.centerY}px)`
    };
  };

  return (
    <div 
      className={styles.container}
      style={{
        left: position.x,
        top: position.y,
        width: adjustedSize,
        height: adjustedSize
      }}
    >
      {/* Original object - real SVG */}
      {state !== 'hammered' && (
        <img 
          src={objectDef.svgPath}
          alt={objectDef.name}
          className={styles.originalLayer}
          style={getOriginalMaskStyles()}
        />
      )}
      
      {/* Nail layer - placeholder icon until SVGs ready */}
      {(maskData?.hasIntersection || state === 'hammered') && (
        <div 
          className={styles.nailLayer}
          style={getNailMaskStyles()}
        >
          {nailDef.placeholder}
        </div>
      )}
    </div>
  );
};

export default TransformableObject;