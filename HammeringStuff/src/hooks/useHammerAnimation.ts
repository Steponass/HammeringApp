// src/hooks/useHammerAnimation.ts
import { useState, useCallback } from "react";

interface UseHammerAnimationReturn {
  isAnimating: boolean;
  targetObjectId: string | null;
  triggerHammerAnimation: (objectId: string) => void;
  resetAnimation: () => void;
  onAnimationComplete: () => void; // Fixed property name
}

const useHammerAnimation = (
  onObjectHammered: (objectId: string) => void
): UseHammerAnimationReturn => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetObjectId, setTargetObjectId] = useState<string | null>(null);

  const triggerHammerAnimation = useCallback((objectId: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTargetObjectId(objectId);
    
    // The animation completion will be handled by the component
    // We'll trigger the object hammering after a delay that matches the impact timing
    setTimeout(() => {
      onObjectHammered(objectId);
    }, 450); // 75% through the 600ms animation (impact point)
  }, [isAnimating, onObjectHammered]);

  const onAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setTargetObjectId(null);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setTargetObjectId(null);
  }, []);

  return {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    resetAnimation,
    onAnimationComplete, // This matches the interface
  };
};

export default useHammerAnimation;