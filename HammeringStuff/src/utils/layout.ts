import type { GameObject, PlacementConfig } from "types/game";
import { calculateDistance } from "./helpers";
import { getResponsiveLayoutConfig, type ResponsiveLayoutConfig } from "./responsiveLayout";

/**
 * Calculate the minimum safe distance between two objects with responsive scaling
 * Now considers device type and scales appropriately
 */
const calculateMinimumSafeDistance = (
  objectARadius: number,
  objectBRadius: number,
  responsiveConfig: ResponsiveLayoutConfig
): number => {
  // Scale both radii according to responsive object scale
  const scaledRadiusA = objectARadius * responsiveConfig.objectScale;
  const scaledRadiusB = objectBRadius * responsiveConfig.objectScale;
  
  // Calculate base distance with responsive spacing
  const radiusBasedDistance = (scaledRadiusA + scaledRadiusB) * responsiveConfig.spacingMultiplier + responsiveConfig.safetyBuffer;
  
  // Ensure minimum distance is respected
  return Math.max(radiusBasedDistance, responsiveConfig.minAbsoluteDistance);
};

/**
 * Calculate object center with responsive scaling applied
 */
const calculateObjectCenter = (
  position: { x: number; y: number }, 
  radius: number,
  responsiveConfig: ResponsiveLayoutConfig
) => {
  const scaledRadius = radius * responsiveConfig.objectScale;
  return {
    x: position.x + scaledRadius,
    y: position.y + scaledRadius
  };
};

/**
 * Check if a new object position conflicts with existing objects
 * Now uses responsive calculations throughout
 */
const hasPositionConflict = (
  candidatePosition: { x: number; y: number },
  candidateRadius: number,
  existingObjects: GameObject[],
  responsiveConfig: ResponsiveLayoutConfig
): boolean => {
  // Calculate the center position of the candidate object with responsive scaling
  const candidateCenter = calculateObjectCenter(candidatePosition, candidateRadius, responsiveConfig);

  // Check against every existing object
  return existingObjects.some((existingObject) => {
    // Calculate the center position of the existing object with responsive scaling
    const existingCenter = calculateObjectCenter(existingObject.position, existingObject.radius, responsiveConfig);
    
    // Measure center-to-center distance
    const centerDistance = calculateDistance(candidateCenter, existingCenter);
    
    // Calculate minimum safe distance with responsive considerations
    const minimumDistance = calculateMinimumSafeDistance(
      candidateRadius, 
      existingObject.radius,
      responsiveConfig
    );
    
    // Conflict exists if objects are too close
    return centerDistance < minimumDistance;
  });
};

/**
 * Generate a random position for object placement with full responsive support
 * This is the main entry point that now handles all device types properly
 */
export const getRandomObjectPlacement = (
  existingObjects: GameObject[],
  config: PlacementConfig,
  newObjectRadius: number
): { x: number; y: number } => {
  // Get responsive configuration for current device
  const responsiveConfig = getResponsiveLayoutConfig();
  // REMOVED: enhancedConfig since we can use responsiveConfig directly
  
  const { margin, maxAttempts } = config;

  // Get current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate responsive margins
  const responsiveMargin = margin * responsiveConfig.marginMultiplier;
  const scaledObjectSize = newObjectRadius * 2 * responsiveConfig.objectScale;

  // Calculate valid placement area with responsive considerations
  const minX = responsiveMargin;
  const maxX = viewportWidth - responsiveMargin - scaledObjectSize;
  const minY = responsiveMargin;
  const maxY = viewportHeight - responsiveMargin - 40 - scaledObjectSize; // 80px for UI elements

  // For dense placement, try grid-based approach first
  // Use responsive threshold - mobile needs grid placement sooner
  const gridThreshold = responsiveConfig.objectCount > 12 ? 8 : 12;
  if (existingObjects.length > gridThreshold) {
    const gridPosition = tryGridPlacementWithResponsiveSpacing(
      existingObjects,
      minX,
      maxX,
      minY,
      maxY,
      newObjectRadius,
      responsiveConfig // Pass responsiveConfig directly
    );
    if (gridPosition) {
      return gridPosition;
    }
  }

  // Fallback to random placement with responsive conflict detection
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidatePosition = {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    };

    // Use the responsive conflict detection
    const hasConflict = hasPositionConflict(
      candidatePosition,
      newObjectRadius,
      existingObjects,
      responsiveConfig // Pass responsiveConfig directly
    );

    if (!hasConflict) {
      return candidatePosition;
    }
  }

  // If we couldn't find a valid position, use responsive spiral placement
  return getSpiralPlacement(existingObjects.length, minX, maxX, minY, maxY, responsiveConfig);
};

/**
 * Grid placement with responsive spacing calculations
 * Adapts grid density based on device constraints
 */
function tryGridPlacementWithResponsiveSpacing(
  existingObjects: GameObject[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  newObjectRadius: number,
  responsiveConfig: ResponsiveLayoutConfig
): { x: number; y: number } | null {
  // Calculate responsive grid spacing
  const averageRadius = existingObjects.length > 0 
    ? existingObjects.reduce((sum, obj) => sum + obj.radius, 0) / existingObjects.length
    : newObjectRadius;
  
  // Grid spacing accounts for responsive scaling and spacing multiplier
  const baseSpacing = (averageRadius + newObjectRadius) * 2 * responsiveConfig.objectScale;
  const gridSpacing = Math.max(
    baseSpacing * responsiveConfig.spacingMultiplier + responsiveConfig.safetyBuffer,
    responsiveConfig.minAbsoluteDistance
  );

  const cols = Math.floor((maxX - minX) / gridSpacing);
  const rows = Math.floor((maxY - minY) / gridSpacing);

  // More attempts on mobile since space is more constrained
  const maxAttempts = responsiveConfig.objectCount < 16 ? 20 : 15;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);

    // Add some randomness within grid cells for natural look
    const randomnessPercentage = responsiveConfig.objectScale < 0.9 ? 0.2 : 0.3;
    const candidatePosition = {
      x: minX + col * gridSpacing + Math.random() * gridSpacing * randomnessPercentage,
      y: minY + row * gridSpacing + Math.random() * gridSpacing * randomnessPercentage,
    };

    // Use the responsive conflict detection
    const hasConflict = hasPositionConflict(
      candidatePosition,
      newObjectRadius,
      existingObjects,
      responsiveConfig
    );

    if (!hasConflict) {
      return candidatePosition;
    }
  }

  return null;
}

/**
 * Responsive spiral placement as last resort
 * Adapts spiral parameters based on device type
 */
function getSpiralPlacement(
  objectIndex: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  responsiveConfig: ResponsiveLayoutConfig
): { x: number; y: number } {
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Responsive spiral parameters
  const angleIncrement = responsiveConfig.objectScale < 0.9 ? 0.7 : 0.6; // Tighter spiral on mobile
  const radiusIncrement = responsiveConfig.minAbsoluteDistance * 0.8; // Based on minimum distance
  
  const angle = objectIndex * angleIncrement;
  const radius = Math.min(
    60 + objectIndex * radiusIncrement,
    Math.min(maxX - minX, maxY - minY) / 3
  );

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}