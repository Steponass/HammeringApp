import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, InputMode } from 'types/game'; // Removed unused CursorState import

// Define what our hook returns for better TypeScript support
interface UseMouseTrackingReturn {
  cursorPosition: Position;
  shadowPosition: Position;
  inputMode: InputMode;
  isFirstTouch: boolean;
  updateCursorPosition: (event: MouseEvent) => void;
  updateTouchPosition: (event: TouchEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  resetTouchState: () => void;
}

/**
 * Custom hook for tracking mouse/touch position and managing input modes
 * 
 * Desktop behavior:
 * - Shadow follows mouse cursor exactly
 * - Click events handled by parent components
 * 
 * Mobile behavior:
 * - First touch: moves shadow to touch position
 * - Second touch: triggers hammer action (handled by parent)
 * - Touch and drag: moves shadow continuously
 */
const useMouseTracking = (): UseMouseTrackingReturn => {
  // Current cursor position (follows mouse/finger exactly)
  const [cursorPosition, setCursorPosition] = useState<Position>({ 
    x: 0, 
    y: 0 
  });
  
  // Shadow position (may differ from cursor on mobile)
  const [shadowPosition, setShadowPosition] = useState<Position>({ 
    x: 0, 
    y: 0 
  });
  
  // Track what input method we're using
  const [inputMode, setInputMode] = useState<InputMode>('desktop');
  
  // Track touch interaction state for mobile
  const [isFirstTouch, setIsFirstTouch] = useState<boolean>(true);
  
  // Track if we detected touch capability
  const hasDetectedTouch = useRef<boolean>(false);
  
  // Track if user is currently dragging on mobile
  const isDragging = useRef<boolean>(false);

  /**
   * Detect device input capabilities
   * Checks for touch support to determine initial input mode
   */
  const detectInputMode = useCallback((): InputMode => {
    // Check multiple ways to detect touch support
    const hasTouchSupport = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - some older browsers
      navigator.msMaxTouchPoints > 0
    );
    
    return hasTouchSupport ? 'mobile' : 'desktop';
  }, []);

  /**
   * Update cursor position for desktop mouse movement
   * On desktop, shadow follows cursor exactly
   */
  const updateCursorPosition = useCallback((event: MouseEvent): void => {
    const newPosition: Position = {
      x: event.clientX,
      y: event.clientY
    };
    
    setCursorPosition(newPosition);
    
    // On desktop, shadow always follows cursor
    if (inputMode === 'desktop') {
      setShadowPosition(newPosition);
    }
  }, [inputMode]);

  /**
   * Handle touch movement (when user drags finger)
   * Updates both cursor and shadow position during drag
   */
  const updateTouchPosition = useCallback((event: TouchEvent): void => {
    // Prevent scrolling while interacting
    event.preventDefault();
    
    // Only handle if we have at least one touch point
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const newPosition: Position = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      setCursorPosition(newPosition);
      
      // During drag, shadow follows finger
      if (isDragging.current) {
        setShadowPosition(newPosition);
      }
    }
  }, []);

  /**
   * Handle initial touch start events
   * Manages mobile interaction flow: first touch moves shadow, second touch hammers
   */
  const handleTouchStart = useCallback((event: TouchEvent): void => {
    // Switch to mobile mode if touch detected
    if (!hasDetectedTouch.current) {
      hasDetectedTouch.current = true;
      setInputMode('mobile');
    }

    // Prevent default touch behavior (scrolling, zooming, etc.)
    event.preventDefault();
    
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const newPosition: Position = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      setCursorPosition(newPosition);
      
      if (isFirstTouch) {
        // First touch: move shadow to this position
        setShadowPosition(newPosition);
        setIsFirstTouch(false);
        isDragging.current = true;
      } else {
        // Second touch: this will trigger hammer action in parent component
        // Reset state for next interaction cycle
        setIsFirstTouch(true);
        isDragging.current = false;
      }
    }
  }, [isFirstTouch]);

  /**
   * Handle touch end events
   * Stops dragging state
   */
  const handleTouchEnd = useCallback((): void => {
    isDragging.current = false;
  }, []);

  /**
   * Reset touch interaction state
   * Useful for resetting after hammer action or game events
   */
  const resetTouchState = useCallback((): void => {
    setIsFirstTouch(true);
    isDragging.current = false;
  }, []);

  /**
   * Handle mouse enter events for desktop
   * Shows cursor when mouse enters game area
   */
  const handleMouseEnter = useCallback((event: MouseEvent): void => {
    if (inputMode === 'desktop') {
      const newPosition: Position = {
        x: event.clientX,
        y: event.clientY
      };
      
      setCursorPosition(newPosition);
      setShadowPosition(newPosition);
    }
  }, [inputMode]);

  /**
   * Set up event listeners when component mounts
   */
  useEffect(() => {
    // Detect initial input mode
    const initialMode = detectInputMode();
    setInputMode(initialMode);

    // Create event handler functions that match expected signatures
    const handleMouseMove = (event: MouseEvent) => {
      updateCursorPosition(event);
    };

    const handleMouseEnterEvent = (event: MouseEvent) => {
      handleMouseEnter(event);
    };

    const handleTouchMoveEvent = (event: TouchEvent) => {
      updateTouchPosition(event);
    };

    const handleTouchStartEvent = (event: TouchEvent) => {
      handleTouchStart(event);
    };

    const handleTouchEndEvent = () => {
      handleTouchEnd();
    };

    // Add event listeners to document for global coverage
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnterEvent, { passive: true });
    document.addEventListener('touchstart', handleTouchStartEvent, { passive: false });
    document.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
    document.addEventListener('touchend', handleTouchEndEvent, { passive: true });

    // Cleanup function: remove all event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnterEvent);
      document.removeEventListener('touchstart', handleTouchStartEvent);
      document.removeEventListener('touchmove', handleTouchMoveEvent);
      document.removeEventListener('touchend', handleTouchEndEvent);
    };
  }, [
    detectInputMode,
    updateCursorPosition,
    updateTouchPosition,
    handleTouchStart,
    handleTouchEnd,
    handleMouseEnter
  ]);

  // Return all the data and functions that components will need
  return {
    cursorPosition,
    shadowPosition,
    inputMode,
    isFirstTouch,
    updateCursorPosition,
    updateTouchPosition,
    handleTouchStart,
    resetTouchState
  };
};

export default useMouseTracking;