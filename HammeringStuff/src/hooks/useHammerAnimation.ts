import { useState, useCallback, useRef, useEffect } from "react";

interface UseHammerAnimationReturn {
  isAnimating: boolean;
  targetObjectId: string | null;
  triggerHammerAnimation: (objectId: string) => void;
  resetAnimation: () => void;
  onAnimationComplete: () => void;
}

/**
 * Hook for managing hammer animation state and timing
 * 
 * REFACTOR NOTES:
 * - Maintains realistic 450ms impact delay for better game feel
 * - Adds mobile-specific optimizations to prevent animation skipping
 * - Pre-warms animation layers on mobile devices
 * - Better cleanup and edge case handling
 */
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

  /**
   * Pre-warm animation layers on mobile to prevent first-time lag
   * This ensures the GPU layers are ready before the animation starts
   */
  const preWarmMobileAnimations = useCallback((objectId: string): void => {
    if (!isMobileDevice()) return;
    
    // Find the target object's hammer layer element
    const objectElement = document.querySelector(`[data-object-id="${objectId}"]`);
    if (!objectElement) return;
    
    const hammerLayer = objectElement.querySelector('.hammeredNailLayer, [class*="hammeredNailLayer"]');
    if (!hammerLayer) return;
    
    // Force hardware acceleration and pre-initialize transform matrix
    const element = hammerLayer as HTMLElement;
    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
    
    // Trigger a micro-animation to initialize GPU layers
    const preWarmAnimation = element.animate([
      { 
        transform: 'translateZ(0) scale(1)', 
        opacity: 0 
      },
      { 
        transform: 'translateZ(0.001px) scale(1.001)', 
        opacity: 0.001 
      }
    ], { 
      duration: 16, // One frame at 60fps
      fill: 'forwards',
      easing: 'linear'
    });
    
    // Clean up the pre-warm animation
    preWarmAnimation.addEventListener('finish', () => {
      element.style.transform = '';
      element.style.opacity = '';
      preWarmAnimation.cancel();
    });
  }, [isMobileDevice]);

  /**
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

    // Clear any existing timeouts
    clearAllTimeouts();
    
    // Pre-warm animations on mobile devices
    preWarmMobileAnimations(objectId);
    
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
    const totalAnimationDuration = isMobileDevice() ? 550 : 600;
    
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
    preWarmMobileAnimations
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

  /**
   * Mobile-specific initialization
   * Add global styles for better mobile animation performance
   */
  useEffect(() => {
    if (isMobileDevice()) {
      // Add mobile-optimized CSS custom properties
      document.documentElement.style.setProperty('--mobile-animation-ready', '1');
      
      // Ensure smooth scrolling is disabled during animations to prevent interference
      const originalOverflow = document.body.style.overflow;
      if (isAnimating) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnimating, isMobileDevice]);

  /**
   * Development debugging
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (isAnimating && targetObjectId) {
        console.log(`🔨 Hammer animation started for object: ${targetObjectId}`);
        console.log(`⏱️  Impact will occur in 450ms`);
        
        if (isMobileDevice()) {
          console.log(`📱 Mobile optimizations active`);
        }
      }
    }
  }, [isAnimating, targetObjectId, isMobileDevice]);

  return {
    isAnimating,
    targetObjectId,
    triggerHammerAnimation,
    resetAnimation,
    onAnimationComplete,
  };
};

export default useHammerAnimation;