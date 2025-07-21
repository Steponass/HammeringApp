import { useState, useEffect, useCallback, useRef } from "react";
import type { Position, InputMode } from "types/game";

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

  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [shadowPosition, setShadowPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  // Track what input method we're using - start with desktop as default
  const [inputMode, setInputMode] = useState<InputMode>("desktop");

  // Track touch interaction state for mobile
  const [isFirstTouch, setIsFirstTouch] = useState<boolean>(true);

  const hasDetectedTouch = useRef<boolean>(false);

  const isDragging = useRef<boolean>(false);

  /**
   * Update cursor position for desktop mouse movement
   * On desktop, shadow follows cursor exactly
   */
  const updateCursorPosition = useCallback(
    (event: MouseEvent): void => {
      const newPosition: Position = {
        x: event.clientX,
        y: event.clientY,
      };

      setCursorPosition(newPosition);

      if (inputMode === "desktop") {
        setShadowPosition(newPosition);
      }
    },
    [inputMode]
  );

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
        y: touch.clientY,
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
  const handleTouchStart = useCallback(
    (event: TouchEvent): void => {
      if (!hasDetectedTouch.current) {
        hasDetectedTouch.current = true;
        setInputMode("mobile");
      }

      event.preventDefault();

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newPosition: Position = {
          x: touch.clientX,
          y: touch.clientY,
        };

        setCursorPosition(newPosition);

        if (isFirstTouch) {
          setShadowPosition(newPosition);
          setIsFirstTouch(false);
          isDragging.current = true;
        } else {
          // Second touch: trigger hammer action in parent component
          // Reset state for next interaction cycle
          setIsFirstTouch(true);
          isDragging.current = false;
        }
      }
    },
    [isFirstTouch]
  );

  /**
   * Reset touch interaction state
   */
  const resetTouchState = useCallback((): void => {
    setIsFirstTouch(true);
    isDragging.current = false;
  }, []);

  /**
   * Set up event listeners when component mounts
   */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newPosition: Position = {
        x: event.clientX,
        y: event.clientY,
      };

      setCursorPosition(newPosition);

      // Always update shadow on mouse move if we haven't switched to mobile
      if (!hasDetectedTouch.current) {
        setShadowPosition(newPosition);
      }
    };

    const handleTouchMoveEvent = (event: TouchEvent) => {
      // Switch to mobile mode if not already detected
      if (!hasDetectedTouch.current) {
        hasDetectedTouch.current = true;
        setInputMode("mobile");
      }

      event.preventDefault();

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newPosition: Position = {
          x: touch.clientX,
          y: touch.clientY,
        };

        setCursorPosition(newPosition);

        if (isDragging.current) {
          setShadowPosition(newPosition);
        }
      }
    };

    const handleTouchStartEvent = (event: TouchEvent) => {
      if (!hasDetectedTouch.current) {
        hasDetectedTouch.current = true;
        setInputMode("mobile");
      }

      event.preventDefault();

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newPosition: Position = {
          x: touch.clientX,
          y: touch.clientY,
        };

        setCursorPosition(newPosition);

        if (isFirstTouch) {
          setShadowPosition(newPosition);
          setIsFirstTouch(false);
          isDragging.current = true;
        } else {
          // Second touch: trigger hammer action in parent component
          // Reset state for next interaction cycle
          setIsFirstTouch(true);
          isDragging.current = false;
        }
      }
    };

    // Touch end handler
    const handleTouchEndEvent = () => {
      isDragging.current = false;
    };

    // Add event listeners to document for global coverage
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("touchstart", handleTouchStartEvent, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMoveEvent, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEndEvent, {
      passive: true,
    });

    // Cleanup function: remove all event listeners
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleTouchStartEvent);
      document.removeEventListener("touchmove", handleTouchMoveEvent);
      document.removeEventListener("touchend", handleTouchEndEvent);
    };
  }, [isFirstTouch]); // Only depend on isFirstTouch

  // Return all the data and functions that components will need
  return {
    cursorPosition,
    shadowPosition,
    inputMode,
    isFirstTouch,
    updateCursorPosition,
    updateTouchPosition,
    handleTouchStart,
    resetTouchState,
  };
};

export default useMouseTracking;
