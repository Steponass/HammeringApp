// src/hooks/useHammerAnimation.ts
import { useState, useCallback, useEffect, useRef } from "react";
import type { HammerAnimation } from "types/animation";
import { GAME_CONFIG } from "data/gameConfig";

interface UseHammerAnimationReturn {
  hammerAnimation: HammerAnimation;
  isAnimating: boolean;
  triggerHammerAnimation: (objectId: string) => void;
  resetAnimation: () => void;
}

interface AnimationTimers {
  hammerSwing: number | null;
  objectImpact: number | null;
}

/**
 * Custom hook for managing hammer swing and object impact animations
 * Manual trigger only - requires explicit user action (click/tap)
 *
 * Key Features:
 * - Manual triggering via triggerHammerAnimation function
 * - Coordinated hammer swing + object impact animations
 * - Clean animation state management
 * - Performance optimized with RAF
 */
const useHammerAnimation = (
  onObjectHammered: (objectId: string) => void
): UseHammerAnimationReturn => {
  // Current animation state
  const [hammerAnimation, setHammerAnimation] = useState<HammerAnimation>({
    isActive: false,
    targetObjectId: null,
    progress: 0,
    duration: GAME_CONFIG.animation.hammerSwingDuration,
  });

  // Track if any animation is currently running
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Track animation timers for cleanup
  const animationTimers = useRef<AnimationTimers>({
    hammerSwing: null,
    objectImpact: null,
  });

  // Track which objects have been triggered to prevent double-hammering
  const triggeredObjects = useRef<Set<string>>(new Set());

  // Animation frame ID for cleanup
  const animationFrameId = useRef<number | null>(null);

  /**
   * Trigger object impact animation and transformation
   * This happens at the end of the hammer swing
   */
  const triggerObjectImpact = useCallback(
    (objectId: string): void => {
      // Start object impact animation (scale, shake, etc.)
      const impactDuration = GAME_CONFIG.animation.transformDuration;

      // Use timeout for impact animation (simpler than RAF for this case)
      animationTimers.current.objectImpact = window.setTimeout(() => {
        // Notify parent that object should be hammered
        onObjectHammered(objectId);

        // Reset animation state
        setHammerAnimation({
          isActive: false,
          targetObjectId: null,
          progress: 0,
          duration: GAME_CONFIG.animation.hammerSwingDuration,
        });

        setIsAnimating(false);

        // Clear the triggered object after a delay to allow re-triggering
        setTimeout(() => {
          triggeredObjects.current.delete(objectId);
        }, 1000);
      }, impactDuration);
    },
    [onObjectHammered]
  );

  /**
   * Start hammer swing animation
   * Triggers visual hammer movement from raised to impact position
   */
  const startHammerSwing = useCallback(
    (targetObjectId: string): void => {
      const startTime = performance.now();
      const duration = GAME_CONFIG.animation.hammerSwingDuration;

      // Clear any existing animation
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Set initial animation state
      setHammerAnimation({
        isActive: true,
        targetObjectId,
        progress: 0,
        duration,
      });

      setIsAnimating(true);

      // Animation loop using requestAnimationFrame for smooth 60fps
      const animateHammer = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Update animation progress
        setHammerAnimation((prev) => ({
          ...prev,
          progress,
        }));

        if (progress < 1) {
          // Continue animation
          animationFrameId.current = requestAnimationFrame(animateHammer);
        } else {
          // Animation complete - trigger impact
          triggerObjectImpact(targetObjectId);
        }
      };

      animationFrameId.current = requestAnimationFrame(animateHammer);
    },
    [triggerObjectImpact]
  );

  /**
   * Manually trigger hammer animation for a specific object
   * This is the main entry point - called when user clicks/taps
   */
  const triggerHammerAnimation = useCallback(
    (objectId: string): void => {
      // Don't trigger if already animating or object already triggered
      if (isAnimating || triggeredObjects.current.has(objectId)) {
        return;
      }

      triggeredObjects.current.add(objectId);
      startHammerSwing(objectId);
    },
    [isAnimating, startHammerSwing]
  );

  /**
   * Reset all animation state
   * Useful for game resets or cleanup
   */
  const resetAnimation = useCallback((): void => {
    // Cancel any running animations
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    // Clear timers
    if (animationTimers.current.hammerSwing) {
      clearTimeout(animationTimers.current.hammerSwing);
      animationTimers.current.hammerSwing = null;
    }

    if (animationTimers.current.objectImpact) {
      clearTimeout(animationTimers.current.objectImpact);
      animationTimers.current.objectImpact = null;
    }

    // Reset state
    setHammerAnimation({
      isActive: false,
      targetObjectId: null,
      progress: 0,
      duration: GAME_CONFIG.animation.hammerSwingDuration,
    });

    setIsAnimating(false);
    triggeredObjects.current.clear();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      resetAnimation();
    };
  }, [resetAnimation]);

  return {
    hammerAnimation,
    isAnimating,
    triggerHammerAnimation,
    resetAnimation,
  };
};

export default useHammerAnimation;
