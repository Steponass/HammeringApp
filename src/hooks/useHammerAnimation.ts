import { useState, useCallback, useRef, useEffect } from "react";

interface UseHammerAnimationReturn {
  isAnimating: boolean;
  targetObjectId: string | null;
  triggerHammerAnimation: (objectId: string) => void;
  resetAnimation: () => void;
  onAnimationComplete: () => void;
}

const useHammerAnimation = (
  onObjectHammered: (objectId: string) => void
): UseHammerAnimationReturn => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [targetObjectId, setTargetObjectId] = useState<string | null>(null);
  
  const impactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef<boolean>(true);

  const isMobileDevice = useCallback((): boolean => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }, []);

  const clearAllTimeouts = useCallback((): void => {
    if (impactTimeoutRef.current) {
      clearTimeout(impactTimeoutRef.current);
      impactTimeoutRef.current = null;
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, []);

  const resetAnimationState = useCallback((): void => {
    if (!isComponentMountedRef.current) return;
    
    setIsAnimating(false);
    setTargetObjectId(null);
    clearAllTimeouts();
  }, [clearAllTimeouts]);

  /*
   * Trigger hammer animation with mobile optimizations
   */

  const triggerHammerAnimation = useCallback((objectId: string): void => {
    // Prevent multiple concurrent animations
    if (isAnimating) return;
    
    if (!objectId || typeof objectId !== 'string') {
      console.warn('triggerHammerAnimation: Invalid objectId provided');
      return;
    }

    clearAllTimeouts();
    
    setIsAnimating(true);
    setTargetObjectId(objectId);
    
    impactTimeoutRef.current = setTimeout(() => {
      if (isComponentMountedRef.current) {
        onObjectHammered(objectId);
      }
    }, 300);
    
    const totalAnimationDuration = isMobileDevice() ? 325 : 400;
    
    cleanupTimeoutRef.current = setTimeout(() => {
      if (isComponentMountedRef.current) {
        resetAnimationState();
      }
    }, totalAnimationDuration);
    
  }, [
    isAnimating, 
    onObjectHammered, 
    clearAllTimeouts, 
    resetAnimationState, 
    isMobileDevice,
  ]);

  /*
   * Handle animation completion from external components
   */
  const onAnimationComplete = useCallback((): void => {
    // If called before natural timeout, clean up immediately
    resetAnimationState();
  }, [resetAnimationState]);

  /*
   * Manual animation reset
   */
  const resetAnimation = useCallback((): void => {
    resetAnimationState();
  }, [resetAnimationState]);

  /*
   * Component lifecycle management
   */
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      isComponentMountedRef.current = false;
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    resetAnimation,
    onAnimationComplete,
  };
};

export default useHammerAnimation;