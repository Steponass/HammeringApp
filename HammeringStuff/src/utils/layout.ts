import type { GameObject, PlacementConfig } from "types/game";
import { calculateDistance } from "./helpers";
import { getResponsiveLayoutConfig, type ResponsiveLayoutConfig } from "./responsiveLayout";

/*
 * Calculate minimum safe distance between two objects with responsive scaling
 */
const calculateMinimumSafeDistance = (
  objectARadius: number,
  objectBRadius: number,
  responsiveConfig: ResponsiveLayoutConfig
): number => {
  const scaledRadiusA = objectARadius * responsiveConfig.objectScale;
  const scaledRadiusB = objectBRadius * responsiveConfig.objectScale;
  
  const radiusBasedDistance = (scaledRadiusA + scaledRadiusB) * responsiveConfig.spacingMultiplier + responsiveConfig.safetyBuffer;
  
  return Math.max(radiusBasedDistance, responsiveConfig.minAbsoluteDistance);
};

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

const hasPositionConflict = (
  candidatePosition: { x: number; y: number },
  candidateRadius: number,
  existingObjects: GameObject[],
  responsiveConfig: ResponsiveLayoutConfig
): boolean => {
  const candidateCenter = calculateObjectCenter(candidatePosition, candidateRadius, responsiveConfig);

  return existingObjects.some((existingObject) => {

    const existingCenter = calculateObjectCenter(existingObject.position, existingObject.radius, responsiveConfig);
    
    // Measure center-to-center distance
    const centerDistance = calculateDistance(candidateCenter, existingCenter);
    
    const minimumDistance = calculateMinimumSafeDistance(
      candidateRadius, 
      existingObject.radius,
      responsiveConfig
    );
    
    // Conflict exists if objects are too close
    return centerDistance < minimumDistance;
  });
};

export const getRandomObjectPlacement = (
  existingObjects: GameObject[],
  config: PlacementConfig,
  newObjectRadius: number
): { x: number; y: number } => {
  const responsiveConfig = getResponsiveLayoutConfig();
  
  const { margin, maxAttempts } = config;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const responsiveMargin = margin * responsiveConfig.marginMultiplier;
  const scaledObjectSize = newObjectRadius * 2 * responsiveConfig.objectScale;

  const minX = responsiveMargin;
  const maxX = viewportWidth - responsiveMargin - scaledObjectSize;
  const minY = responsiveMargin;
  const maxY = viewportHeight - responsiveMargin - 40 - scaledObjectSize;

  // For dense placement, try grid-based approach first

  const gridThreshold = responsiveConfig.objectCount > 12 ? 8 : 12;
  if (existingObjects.length > gridThreshold) {
    const gridPosition = tryGridPlacementWithResponsiveSpacing(
      existingObjects,
      minX,
      maxX,
      minY,
      maxY,
      newObjectRadius,
      responsiveConfig
    );
    if (gridPosition) {
      return gridPosition;
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidatePosition = {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    };

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
  const averageRadius = existingObjects.length > 0 
    ? existingObjects.reduce((sum, obj) => sum + obj.radius, 0) / existingObjects.length
    : newObjectRadius;
  
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

/*
 * Responsive spiral placement as last resort
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

  const angleIncrement = responsiveConfig.objectScale < 0.9 ? 0.7 : 0.6; // Tighter spiral on mobile
  const radiusIncrement = responsiveConfig.minAbsoluteDistance * 0.8;
  
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