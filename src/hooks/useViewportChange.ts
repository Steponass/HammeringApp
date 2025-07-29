import { useState, useEffect, useCallback, useRef } from 'react';
import { getResponsiveLayoutConfig } from 'utils/responsiveLayout';
import type { ResponsiveLayoutConfig } from 'utils/responsiveLayout';

interface ViewportChangeHook {
  responsiveConfig: ResponsiveLayoutConfig;
  previousConfig: ResponsiveLayoutConfig | null;
  isResizing: boolean;
  hasSignificantChange: boolean;
  acknowledgeSignificantChange: () => void;
}

const useViewportChange = (): ViewportChangeHook => {
  // Current responsive configuration based on viewport
  const [responsiveConfig, setResponsiveConfig] = useState(() => 
    getResponsiveLayoutConfig()
  );
  
  // Track the previous config to detect significant changes
  const [previousConfig, setPreviousConfig] = useState<ResponsiveLayoutConfig | null>(null);
  
  // Indicates if we're currently in the middle of a resize operation
  const [isResizing, setIsResizing] = useState(false);
  
  // Indicates if there's been a change significant enough to require repositioning
  const [hasSignificantChange, setHasSignificantChange] = useState(false);

  // FIXED: Use refs for values we need in event handlers to avoid stale closure issues
  const currentConfigRef = useRef(responsiveConfig);
  
  // EXPLANATION: For timeout refs, we use `undefined` as the initial value
  // This tells TypeScript "this will eventually hold a timeout, but starts empty"
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // EXPLANATION: Boolean refs need an initial boolean value
  const isResizingRef = useRef(false);

  // Helper function to determine if a config change is significant enough to warrant repositioning
  const isSignificantConfigChange = useCallback((
    oldConfig: ResponsiveLayoutConfig, 
    newConfig: ResponsiveLayoutConfig
  ): boolean => {
    // Device type changes always require repositioning (mobile to desktop, etc.)
    if (oldConfig.deviceType !== newConfig.deviceType) {
      return true;
    }
    
    // Significant object scale changes (more than 10% difference)
    if (Math.abs(oldConfig.objectScale - newConfig.objectScale) > 0.1) {
      return true;
    }
    
    // Significant spacing changes (more than 10% difference)
    if (Math.abs(oldConfig.spacingMultiplier - newConfig.spacingMultiplier) > 0.1) {
      return true;
    }
    
    // Object count changes (different density requirements)
    if (oldConfig.objectCount !== newConfig.objectCount) {
      return true;
    }

    return false;
  }, []);

  // Main function to update responsive configuration
  const updateResponsiveConfig = useCallback(() => {
    const newConfig = getResponsiveLayoutConfig();
    const oldConfig = currentConfigRef.current;
    
    // Check if this change requires repositioning objects
    const needsRepositioning = isSignificantConfigChange(oldConfig, newConfig);

    if (needsRepositioning) {
      setPreviousConfig(oldConfig);
      setHasSignificantChange(true);
    }

    // Update the current configuration
    setResponsiveConfig(newConfig);
    currentConfigRef.current = newConfig;
    
    // Clear the resizing flag
    setIsResizing(false);
    isResizingRef.current = false;
  }, [isSignificantConfigChange]);

  // Handle window resize events with debouncing for performance
  useEffect(() => {
    const handleResize = () => {
      // Immediately set resizing flag for UI feedback
      if (!isResizingRef.current) {
        setIsResizing(true);
        isResizingRef.current = true;
      }
      
      // EXPLANATION: Now we can safely check if the timeout exists before clearing it
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce the actual recalculation for 150ms after resizing stops
      // This prevents excessive calculations during active resizing
      resizeTimeoutRef.current = setTimeout(updateResponsiveConfig, 150);
    };

    // Handle orientation changes (mobile/tablet devices)
    const handleOrientationChange = () => {
      setIsResizing(true);
      isResizingRef.current = true;
      
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Orientation changes need a longer delay because the viewport
      // dimensions update after the orientation change event fires
      resizeTimeoutRef.current = setTimeout(updateResponsiveConfig, 300);
    };

    // Add event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      // EXPLANATION: Clean up the timeout when the component unmounts
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [updateResponsiveConfig]);

  // Function for components to acknowledge they've handled the significant change
  const acknowledgeSignificantChange = useCallback(() => {
    setHasSignificantChange(false);
    setPreviousConfig(null);
  }, []);

  return {
    responsiveConfig,
    previousConfig,
    isResizing,
    hasSignificantChange,
    acknowledgeSignificantChange
  };
};

export default useViewportChange;