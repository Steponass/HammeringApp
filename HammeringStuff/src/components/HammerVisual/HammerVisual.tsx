// src/components/HammerVisual/HammerVisual.tsx
import React from 'react';
import type { Position } from 'types/game';
import type { HammerAnimation } from 'types/animation';
import styles from './HammerVisual.module.css';

interface HammerVisualProps {
  hammerAnimation: HammerAnimation;
  targetPosition: Position;
  shadowPosition: Position; // New prop for shadow position
  isVisible: boolean;
}

const HammerVisual: React.FC<HammerVisualProps> = ({
  hammerAnimation,
  targetPosition,
  shadowPosition,
  isVisible
}) => {
  const { isActive, progress } = hammerAnimation;

  // Calculate hammer position and rotation based on progress
  const getHammerTransform = (): React.CSSProperties => {
    // Rest position: 64px to top-right of shadow
    const restX = shadowPosition.x + 64;
    const restY = shadowPosition.y - 64;
    
    if (!isActive) {
      // Hammer always visible in rest position
      return {
        transform: `translate(${restX}px, ${restY}px) rotate(-30deg) scale(0.8)`,
        opacity: isVisible ? 1 : 0.7, // Slightly transparent when not animating
      };
    }

    // Animation stages (now slower, more visible):
    // 0-0.3: Raise hammer (preparation) - longer prep phase
    // 0.3-0.8: Swing down (main motion)  
    // 0.8-1.0: Impact and recoil

    const raisePhase = Math.min(progress / 0.3, 1);
    const swingPhase = Math.max(0, Math.min((progress - 0.3) / 0.5, 1));
    const impactPhase = Math.max(0, (progress - 0.8) / 0.2);

    // Raised position (before swing) - higher up for more dramatic effect
    const raisedX = shadowPosition.x + 80;
    const raisedY = shadowPosition.y - 180;
    
    // Target position (impact point)
    const targetX = targetPosition.x;
    const targetY = targetPosition.y;

    let currentX: number;
    let currentY: number;
    let rotation: number;
    let scale: number;

    if (progress <= 0.3) {
      // Raise phase: Move from rest to raised position
      currentX = restX + (raisedX - restX) * raisePhase;
      currentY = restY + (raisedY - restY) * raisePhase;
      rotation = -30 + (raisePhase * 15); // Start at rest angle, lift up
      scale = 0.8 + (raisePhase * 0.1);
    } else if (progress <= 0.8) {
      // Swing phase: Arc motion from raised to target
      // Use easing for gravity effect (slow start, fast end)
      const easedProgress = swingPhase * swingPhase; // Quadratic easing
      
      currentX = raisedX + (targetX - raisedX) * easedProgress;
      currentY = raisedY + (targetY - raisedY) * easedProgress;
      rotation = -15 + (swingPhase * 105); // Rotate through swing
      scale = 0.9 + (swingPhase * 0.5); // Get larger as it approaches
    } else {
      // Impact phase: Hit and recoil back to rest
      const impactEasing = 1 - Math.pow(1 - impactPhase, 3); // Bounce back
      
      // Return to rest position
      currentX = targetX + (restX - targetX) * impactEasing;
      currentY = targetY + (restY - targetY) * impactEasing;
      rotation = 90 + (impactEasing * -120); // Back to rest rotation
      scale = 1.4 - (impactEasing * 0.6); // Back to rest scale
    }

    return {
      transform: `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: 1,
      transformOrigin: 'bottom center', // Rotate around handle
    };
  };

  return (
    <div 
      className={styles.hammerVisual}
      style={getHammerTransform()}
    >
      {/* Hammer head */}
      <div className={styles.hammerHead}>
        <div className={styles.hammerFace} />
        <div className={styles.hammerClaw} />
      </div>
      
      {/* Hammer handle */}
      <div className={styles.hammerHandle} />
      
      {/* Motion blur effect during fast swing - now only during swing phase */}
      {isActive && progress > 0.4 && progress < 0.9 && (
        <div className={styles.motionBlur} />
      )}

      {/* Add a subtle glow when ready to hammer */}
      {!isActive && isVisible && (
        <div className={styles.readyGlow} />
      )}
    </div>
  );
};

export default HammerVisual;