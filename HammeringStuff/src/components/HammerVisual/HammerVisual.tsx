// src/components/HammerVisual/HammerVisual.tsx
import React from "react";
import type { Position } from "types/game";
import type { HammerAnimation } from "types/animation";
import HammerSVG from "assets/svgs/hammer/Hammer_1.svg";
import styles from "./HammerVisual.module.css";

interface HammerVisualProps {
  hammerAnimation: HammerAnimation;
  shadowPosition: Position;
  isVisible: boolean;
}

const HammerVisual: React.FC<HammerVisualProps> = ({
  hammerAnimation,
  shadowPosition,
  isVisible,
}) => {
  const { isActive, progress } = hammerAnimation;

  // Add state for floating animation
  const [floatOffset, setFloatOffset] = React.useState(0);

  // Handle floating animation when not active
  React.useEffect(() => {
    if (!isActive) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const floatValue = Math.sin(elapsed * 0.002) * 2; // -2px to +2px
        setFloatOffset(floatValue);

        if (!isActive) {
          requestAnimationFrame(animate);
        }
      };
      const animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isActive]);

  const getHammerTransform = (): React.CSSProperties => {
    const restX = shadowPosition.x + 16;
    const restY = shadowPosition.y - 256 + 60; // Offset hammer 60px lower

    if (!isActive) {
      return {
        transform: `translate(${restX}px, ${
          restY + floatOffset
        }px) rotate(5deg) scale(0.8)`,
        opacity: isVisible ? 1 : 0.7,
      };
    }

    // Animation timing: 600ms total
    // 300ms raise (0% to 50%)
    // 150ms swing (50% to 75%)
    // 150ms recoil (75% to 100%)

    let rotation: number;
    let scale: number;

    if (progress < 0.5) {
      // RAISE PHASE (0% to 50% = 300ms)
      const raiseProgress = progress / 0.5; // Convert to 0-1 range

      rotation = 5 + raiseProgress * 45; // 5° to 50°
      scale = 0.8 + raiseProgress * 0.05; // 0.8 to 0.85
    } else if (progress < 0.75) {
      // SWING PHASE (50% to 75% = 150ms)
      const swingProgress = (progress - 0.5) / 0.25; // Convert to 0-1 range

      rotation = 50 + swingProgress * -80; // 50° to -30°
      scale = 0.85 + swingProgress * 0.25; // 0.85 to 1.1
    } else {
      // RECOIL PHASE (75% to 100% = 150ms)
      const recoilProgress = (progress - 0.75) / 0.25; // Convert to 0-1 range

      rotation = -30 + recoilProgress * 35; // -30° back to 5°
      scale = 1.1 + recoilProgress * -0.3; // 1.1 back to 0.8
    }

    return {
      transform: `translate(${restX}px, ${restY}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: 1,
      transformOrigin: "bottom center",
    };
  };

  return (
    <div className={styles.hammerVisual} style={getHammerTransform()}>
      {/* Your SVG Hammer */}
      <img src={HammerSVG} alt="Hammer" className={styles.hammerSVG} />

      {/* Motion blur during swing */}
      {isActive && progress > 0.4 && progress < 0.9 && (
        <div className={styles.motionBlur} />
      )}
    </div>
  );
};

export default HammerVisual;
