import React from "react";
import {
  motion,
  useAnimationControls,
  AnimatePresence,
  Variants,
} from "framer-motion";
import type { Position } from "types/game";
import HammerSVG from "assets/svgs/hammer/Hammer_1.svg";
import styles from "./HammerVisual.module.css";

interface HammerVisualProps {
  isAnimating: boolean;
  targetObjectId: string | null;
  shadowPosition: Position;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const HammerVisual: React.FC<HammerVisualProps> = ({
  isAnimating,
  targetObjectId,
  shadowPosition,
  isVisible,
  onAnimationComplete,
}) => {
  const controls = useAnimationControls();

  const hammerVariants: Variants = {
    idle: {
      rotate: 5,
      scale: 0.8,
      y: [0, -4, 0],
      transition: {
        rotate: { type: "spring", damping: 10, stiffness: 100 },
        scale: { type: "spring", damping: 10, stiffness: 100 },
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        },
      },
    },

    // Hammer swing sequence: raise → swing → impact → recoil
    swing: {
      rotate: [5, 50, -30, 5],
      scale: [0.8, 0.85, 0.95, 0.8],
      scaleX: [1, 0.98, 1.04, 1.02, 1],
      scaleY: [1, 1.05, 0.93, 0.8, 1],
      y: [0, -10, 5, 0],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 0.6, 0.85, 1],
        ease: "easeInOut",
      scaleX: {
        duration: 0.5,
        times: [0, 0.3, 0.6, 0.85, 1],
        ease: "easeInOut",
      },
      scaleY: {
        duration: 0.5,
        times: [0, 0.3, 0.6, 0.85, 1],
        ease: "easeInOut",
      },
      y: {
        duration: 0.5,
        times: [0, 0.3, 0.6, 1], // Only 4 keyframes for Y
        ease: "easeOut",
      },
      },
    },
  };

const hammerPosition = React.useMemo(() => {
  const isMobileDevice = window.innerWidth <= 768;
  const responsiveVerticalOffset = isMobileDevice ? -105 : -173;
  
  return {
    x: shadowPosition.x + 12,
    y: shadowPosition.y + 60 + responsiveVerticalOffset,
  };
}, [shadowPosition]);

  React.useEffect(() => {
    const runAnimation = async () => {
      if (isAnimating && targetObjectId) {
        // Stop any current animation and start swing
        await controls.stop();
        await controls.start("swing");

        onAnimationComplete?.();

        // Return to idle state
        await controls.start("idle");
      } else if (!isAnimating) {
        // Return to idle if not animating
        await controls.start("idle");
      }
    };

    runAnimation();
  }, [isAnimating, targetObjectId, controls, onAnimationComplete]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={styles.hammerVisual}
          style={{
            left: hammerPosition.x,
            top: hammerPosition.y,
            position: "fixed",
            transformOrigin: "50% 80%",
          }}
          variants={hammerVariants}
          initial="enter"
          animate={controls}
          exit="exit"
        >
          <motion.img
            src={HammerSVG}
            alt="Hammer"
            className={styles.hammerSVG}
            draggable={false}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HammerVisual;
