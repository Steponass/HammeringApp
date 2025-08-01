import { useState, useEffect, useCallback, useRef } from "react";
import type { Position, InputMode } from "types/game";

interface UseMouseTrackingReturn {
  cursorPosition: Position;
  shadowPosition: Position;
  inputMode: InputMode;
  isFirstTouch: boolean;
  resetTouchState: () => void;
}

const useMouseTracking = (): UseMouseTrackingReturn => {
  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [shadowPosition, setShadowPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [inputMode, setInputMode] = useState<InputMode>("desktop");
  const [isFirstTouch, setIsFirstTouch] = useState<boolean>(true);

  const hasDetectedTouch = useRef<boolean>(false);
  const isDragging = useRef<boolean>(false);

  const HEADER_HEIGHT = 50;

  /*
   * Extract position calculation to eliminate duplication
   */
  const calculatePosition = useCallback((clientX: number, clientY: number): Position => {
    return {
      x: clientX,
      y: clientY - HEADER_HEIGHT,
    };
  }, []);

  /*
   * Check if the touch target is within the header area or is a button/interactive element
   */
  const isHeaderElement = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) {
      return false;
    }
    
    let current: Element | null = target;
    while (current) {
      if (current.closest('header')) {
        return true;
      }

      if (current.closest('[class*="reset_button"]')) {
        return true;
      }
      
      if (current.tagName === 'BUTTON') {
        return true;
      }
      
      if (current.hasAttribute('data-no-touch-override')) {
        return true;
      }
      
      current = current.parentElement;
    }
    return false;
  }, []);

  /*
   * Switch to mobile mode when touch is first detected
   */
  const enableMobileMode = useCallback((): void => {
    if (!hasDetectedTouch.current) {
      hasDetectedTouch.current = true;
      setInputMode("mobile");
    }
  }, []);

  /*
   * Reset touch interaction state
   */
  const resetTouchState = useCallback((): void => {
    setIsFirstTouch(true);
    isDragging.current = false;
  }, []);

  /*
   * Set up event listeners when component mounts
   */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      const newPosition = calculatePosition(event.clientX, event.clientY);
      setCursorPosition(newPosition);

      if (!hasDetectedTouch.current) {
        setShadowPosition(newPosition);
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      if (isHeaderElement(event.target)) {
        return;
      }

      enableMobileMode();
      event.preventDefault();

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newPosition = calculatePosition(touch.clientX, touch.clientY);
        
        setCursorPosition(newPosition);

        if (isFirstTouch) {
          setShadowPosition(newPosition);
          setIsFirstTouch(false);
          isDragging.current = true;
        } else {
          setIsFirstTouch(true);
          isDragging.current = false;
        }
      }
    };

    const handleTouchMove = (event: TouchEvent): void => {
      if (isHeaderElement(event.target)) {
        return;
      }

      enableMobileMode();
      event.preventDefault();

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newPosition = calculatePosition(touch.clientX, touch.clientY);
        
        setCursorPosition(newPosition);

        if (isDragging.current) {
          setShadowPosition(newPosition);
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent): void => {
      if (isHeaderElement(event.target)) {
        return;
      }

      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isFirstTouch, calculatePosition, isHeaderElement, enableMobileMode]);

  return {
    cursorPosition,
    shadowPosition,
    inputMode,
    isFirstTouch,
    resetTouchState,
  };
};

export default useMouseTracking;