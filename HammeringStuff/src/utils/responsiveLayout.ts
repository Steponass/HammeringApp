// utils/responsiveLayout.ts
import { GAME_CONFIG } from "data/gameConfig";

export interface ResponsiveLayoutConfig {
  objectCount: number;
  objectScale: number;
  spacingMultiplier: number;
  marginMultiplier: number;
  safetyBuffer: number;
  minAbsoluteDistance: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  area: number;
  aspectRatio: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isPortrait: boolean;
}

/**
 * Analyze the current viewport to understand device constraints
 * This function acts like a surveyor, measuring the available space
 * and determining what kind of device we're working with
 */
export const getViewportInfo = (): ViewportInfo => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const area = width * height;
  const aspectRatio = width / height;
  const isPortrait = height > width;

  // Determine device type based on width and typical breakpoints
  // Think of this as categorizing the "size of the canvas" we're working with
  let deviceType: ViewportInfo['deviceType'] = 'desktop';
  if (width <= 480) {
    deviceType = 'mobile';
  } else if (width <= GAME_CONFIG.responsive.mobileBreakpoint) {
    deviceType = 'tablet';
  }

  return {
    width,
    height,
    area,
    aspectRatio,
    deviceType,
    isPortrait,
  };
};

/**
 * Calculate optimal object count based on screen real estate
 * This is like determining how many puzzle pieces will fit comfortably on your table
 * We want enough objects to be challenging, but not so many that they're cramped
 */
const calculateOptimalObjectCount = (viewport: ViewportInfo): number => {
  const { area, deviceType } = viewport;
  
  // Base calculation: roughly one object per 25,000 square pixels
  // This ratio was chosen through testing to provide comfortable density
  const baseCount = Math.floor(area / 25000);
  
  // Device-specific adjustments for gameplay comfort
  // Mobile users need fewer objects because touch interaction requires more space
  const deviceMultipliers = {
    mobile: 0.6,   // 40% fewer objects on mobile (touch-friendly)
    tablet: 0.8,   // 20% fewer objects on tablet (medium touch targets)
    desktop: 1.0   // Full count on desktop (precise mouse interaction)
  };
  
  const adjustedCount = Math.floor(baseCount * deviceMultipliers[deviceType]);
  
  // Ensure we stay within reasonable bounds for good gameplay
  const minObjects = deviceType === 'mobile' ? 12 : 16;
  const maxObjects = deviceType === 'mobile' ? 18 : 24;
  
  return Math.max(minObjects, Math.min(maxObjects, adjustedCount));
};

/**
 * Calculate spacing multiplier based on screen density
 * Think of this as adjusting the "personal space bubble" around each object
 * Mobile devices need bigger bubbles because fingers are less precise than mouse cursors
 */
const calculateSpacingMultiplier = (viewport: ViewportInfo): number => {
  const { deviceType, isPortrait } = viewport;
  
  // Base multipliers for different device types
  // These values were determined through user testing for comfortable interaction
  const baseMultipliers = {
    mobile: 1.4,   // 40% more spacing on mobile (for touch targets)
    tablet: 1.2,   // 20% more spacing on tablet (hybrid interaction)
    desktop: 1.0   // Standard spacing on desktop (precise mouse)
  };
  
  let multiplier = baseMultipliers[deviceType];
  
  // Extra adjustment for very small mobile screens
  // Small phones need even more generous spacing
  if (deviceType === 'mobile' && viewport.width < 375) {
    multiplier *= 1.2; // Even more spacing for small phones
  }
  
  // Portrait mode creates height constraints, so we need slightly more spacing
  // to prevent objects from feeling cramped vertically
  if (isPortrait && deviceType !== 'desktop') {
    multiplier *= 1.1;
  }
  
  return multiplier;
};

/**
 * Calculate object scale factor for this device
 * This is like choosing the right size plates for your table
 * Smaller devices get proportionally smaller objects to maximize space usage
 */
const calculateObjectScale = (viewport: ViewportInfo): number => {
  const { deviceType, width } = viewport;
  
  // Start with configured scale factors from your game config
  const baseScale = GAME_CONFIG.responsive.scaleFactors[deviceType];
  
  // Additional scaling for very small screens
  // If someone has a really tiny phone, make objects even smaller
  if (deviceType === 'mobile' && width < 375) {
    return baseScale * 0.9; // 10% smaller on very small phones
  }
  
  return baseScale;
};

/**
 * Generate complete responsive layout configuration
 * This is the main function that orchestrates all the other calculations
 * Think of it as the conductor that brings together all the musicians in the orchestra
 */
export const getResponsiveLayoutConfig = (): ResponsiveLayoutConfig => {
  const viewport = getViewportInfo();
  
  const objectCount = calculateOptimalObjectCount(viewport);
  const objectScale = calculateObjectScale(viewport);
  const spacingMultiplier = calculateSpacingMultiplier(viewport);
  
  // Calculate responsive margins - smaller devices need proportionally smaller margins
  // This ensures we use screen real estate efficiently
  const marginMultiplier = viewport.deviceType === 'mobile' ? 0.8 : 1.0;
  
  // Safety buffer scales with device type and object size
  // Larger spacing multipliers need larger safety buffers to maintain proportion
  const baseSafetyBuffer = 20;
  const safetyBuffer = Math.floor(baseSafetyBuffer * spacingMultiplier * objectScale);
  
  // Minimum distance also scales responsively
  // This ensures objects never get too close, regardless of their calculated spacing
  const baseMinDistance = 80;
  const minAbsoluteDistance = Math.floor(baseMinDistance * spacingMultiplier);
  
  return {
    objectCount,
    objectScale,
    spacingMultiplier,
    marginMultiplier,
    safetyBuffer,
    minAbsoluteDistance,
  };
};

/**
 * Debug function to understand what's happening on current device
 * This is like having a diagnostic tool that shows you exactly what decisions
 * the responsive system is making and why
 */
export const logResponsiveInfo = (): void => {
  const viewport = getViewportInfo();
  const config = getResponsiveLayoutConfig();
  
  console.group('🔧 Responsive Layout Debug Info');
  console.log('📱 Viewport:', {
    size: `${viewport.width}x${viewport.height}`,
    area: viewport.area.toLocaleString(),
    deviceType: viewport.deviceType,
    isPortrait: viewport.isPortrait
  });
  console.log('⚙️ Layout Config:', {
    objectCount: config.objectCount,
    objectScale: `${Math.round(config.objectScale * 100)}%`,
    spacingMultiplier: `${Math.round(config.spacingMultiplier * 100)}%`,
    safetyBuffer: `${config.safetyBuffer}px`,
    minDistance: `${config.minAbsoluteDistance}px`
  });
  console.groupEnd();
};