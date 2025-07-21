// src/components/HammerVisual/HammerVisual.tsx
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

  // Animation variants with proper typing
  const hammerVariants: Variants = {
    // Idle state with gentle floating
    idle: {
      rotate: 5,
      scale: 0.8,
      y: [0, -4, 0], // Gentle float up and down
      transition: {
        rotate: { type: "spring", damping: 10, stiffness: 100 },
        scale: { type: "spring", damping: 10, stiffness: 100 },
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        },
      },
    },

    // Hammer swing sequence: raise → swing → impact → recoil
    swing: {
      rotate: [5, 50, -30, 5],
      scale: [0.8, 0.85, 1.1, 0.8],
      y: [0, -10, 5, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.5, 0.75, 1],
        ease: "easeInOut", // Use predefined easing
        y: {
          duration: 0.6,
          times: [0, 0.5, 0.75, 1],
          ease: "easeOut",
        },
      },
    },

    // Entry animation when hammer first appears
    enter: {
      opacity: 1,
      scale: 0.8,
      rotate: 5,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },

    // Exit animation when hammer disappears
    exit: {
      opacity: 0,
      scale: 0.6,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  // Motion blur effect variants
  const blurVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 1.4],
      transition: {
        duration: 0.25,
        times: [0, 0.6, 1],
        ease: "easeOut",
      },
    },
  };

  // Calculate hammer position
  const hammerPosition = React.useMemo(
    () => ({
      x: shadowPosition.x - 20,
      y: shadowPosition.y + 60 - 160, // Align with shadowOverlay's +60 offset, then apply -160 for visual alignment
    }),
    [shadowPosition]
  );

  // Trigger swing animation when isAnimating changes
  React.useEffect(() => {
    const runAnimation = async () => {
      if (isAnimating && targetObjectId) {
        // Stop any current animation and start swing
        await controls.stop();
        await controls.start("swing");

        // Notify completion
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
            left: hammerPosition.x, // center hammer horizontally (width: 120px)
            top: hammerPosition.y,
            position: "fixed",
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

          {/* Motion blur effect during swing */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className={styles.motionBlur}
                variants={blurVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HammerVisual;
