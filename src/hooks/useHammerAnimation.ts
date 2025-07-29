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
  
  // Track timeouts for proper cleanup
  const impactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef<boolean>(true);

  /**
   * Detect if we're on a mobile device
   */
  const isMobileDevice = useCallback((): boolean => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }, []);


  /*
   * Clear all animation timeouts
   */
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

  /**
   * Reset animation state to initial values
   */
  const resetAnimationState = useCallback((): void => {
    if (!isComponentMountedRef.current) return;
    
    setIsAnimating(false);
    setTargetObjectId(null);
    clearAllTimeouts();
  }, [clearAllTimeouts]);

  /**
   * Trigger hammer animation with mobile optimizations
   * 
   * KEEPS the 450ms delay but adds mobile-specific preparations
   */
  const triggerHammerAnimation = useCallback((objectId: string): void => {
    // Prevent multiple concurrent animations
    if (isAnimating) return;
    
    // Validate input
    if (!objectId || typeof objectId !== 'string') {
      console.warn('triggerHammerAnimation: Invalid objectId provided');
      return;
    }

    clearAllTimeouts();
    
    // Set animation state immediately (hammer starts swinging)
    setIsAnimating(true);
    setTargetObjectId(objectId);
    
    // MAINTAIN ORIGINAL TIMING: Impact happens at 450ms (75% through 600ms)
    // This preserves the realistic feel where nail transforms at hammer impact
    impactTimeoutRef.current = setTimeout(() => {
      if (isComponentMountedRef.current) {
        onObjectHammered(objectId);
      }
    }, 450);
    
    // Mobile devices get slightly faster total animation for better responsiveness
    const totalAnimationDuration = isMobileDevice() ? 520 : 600;
    
    // Schedule cleanup after animation completes
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

  /**
   * Handle animation completion from external components
   */
  const onAnimationComplete = useCallback((): void => {
    // If called before natural timeout, clean up immediately
    resetAnimationState();
  }, [resetAnimationState]);

  /**
   * Manual animation reset
   */
  const resetAnimation = useCallback((): void => {
    resetAnimationState();
  }, [resetAnimationState]);

  /**
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