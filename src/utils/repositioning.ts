import type { GameObject, PlacementConfig } from 'types/game';
import type { ResponsiveLayoutConfig } from 'utils/responsiveLayout';
import { getRandomObjectPlacement } from 'utils/layout';
import { GAME_CONFIG } from 'data/gameConfig';

export interface RepositioningStrategy {
  strategy: 'maintain-relative' | 'recompute-optimal' | 'hybrid';
  transitionDuration: number;
  performanceMode: 'smooth' | 'fade' | 'instant';
}

/*
 * Main function to reposition existing objects when viewport changes
 */
export const repositionExistingObjects = (
  currentObjects: GameObject[],
  oldConfig: ResponsiveLayoutConfig,
  newConfig: ResponsiveLayoutConfig,
  strategy: RepositioningStrategy = { 
    strategy: 'hybrid', 
    transitionDuration: 300,
    performanceMode: 'smooth'
  }
): GameObject[] => {
  
  // Handle edge case: no objects to reposition
  if (currentObjects.length === 0) {
    return currentObjects;
  }

  // Choose repositioning method based on strategy
  switch (strategy.strategy) {
    case 'maintain-relative':
      return maintainRelativePositions(currentObjects, oldConfig, newConfig);
      
    case 'recompute-optimal':
      return recomputeOptimalPositions(currentObjects, newConfig);
      
    case 'hybrid':
    default:
      return hybridRepositioning(currentObjects, oldConfig, newConfig);
  }
};

/*
 * Strategy 1: Maintain relative positions with smart scaling
 * This keeps objects roughly where they were but adjusts for the new viewport
 */
const maintainRelativePositions = (
  objects: GameObject[],
  oldConfig: ResponsiveLayoutConfig,
  newConfig: ResponsiveLayoutConfig
): GameObject[] => {
  
  const currentViewportWidth = window.innerWidth;
  const currentViewportHeight = window.innerHeight;

  const oldMargin = GAME_CONFIG.screenMargin * oldConfig.marginMultiplier;
  const newMargin = GAME_CONFIG.screenMargin * newConfig.marginMultiplier;
  
  const oldUsableWidth = currentViewportWidth - (oldMargin * 2);
  const oldUsableHeight = currentViewportHeight - (oldMargin * 2) - 40;
  
  const newUsableWidth = currentViewportWidth - (newMargin * 2);
  const newUsableHeight = currentViewportHeight - (newMargin * 2) - 40;

  const positionScaleX = newUsableWidth / oldUsableWidth;
  const positionScaleY = newUsableHeight / oldUsableHeight;
  
  const objectScaleRatio = newConfig.objectScale / oldConfig.objectScale;

  return objects.map(obj => {

    const relativeX = (obj.position.x - oldMargin) / oldUsableWidth;
    const relativeY = (obj.position.y - oldMargin) / oldUsableHeight;
    
    const scaledX = relativeX * positionScaleX;
    const scaledY = relativeY * positionScaleY;
    
    const newX = newMargin + (scaledX * newUsableWidth);
    const newY = newMargin + (scaledY * newUsableHeight);
    
    const newRadius = obj.radius * objectScaleRatio;

    const maxX = currentViewportWidth - newMargin - (newRadius * 2);
    const maxY = currentViewportHeight - newMargin - 40 - (newRadius * 2);
    
    const clampedX = Math.max(newMargin, Math.min(newX, maxX));
    const clampedY = Math.max(newMargin, Math.min(newY, maxY));

    return {
      ...obj,
      position: { x: clampedX, y: clampedY },
      radius: newRadius
    };
  });
};

/*
 * Strategy 2: Completely recompute positions for optimal spacing
 * This gives best final layout but ignores original positions
 */
const recomputeOptimalPositions = (
  objects: GameObject[],
  newConfig: ResponsiveLayoutConfig
): GameObject[] => {
  
  const repositionedObjects: GameObject[] = [];
  
  // Sort objects by size (largest first) for better packing
  const sortedObjects = [...objects].sort((a, b) => b.radius - a.radius);
  
  const placementConfig: PlacementConfig = {
    minDistance: GAME_CONFIG.minObjectDistance,
    margin: GAME_CONFIG.screenMargin,
    maxAttempts: GAME_CONFIG.difficulty.placementAttempts,
  };
  
  for (const obj of sortedObjects) {
    const newRadius = obj.radius * newConfig.objectScale;
    
    const newPosition = getRandomObjectPlacement(
      repositionedObjects,
      placementConfig,
      newRadius
    );

    const repositionedObject: GameObject = {
      ...obj,
      position: newPosition,
      radius: newRadius
    };

    repositionedObjects.push(repositionedObject);
  }

  // Return objects in their original order
  return repositionedObjects.sort((a, b) => {
    const originalIndexA = objects.findIndex(obj => obj.id === a.id);
    const originalIndexB = objects.findIndex(obj => obj.id === b.id);
    return originalIndexA - originalIndexB;
  });
};

/*
 * Strategy 3: Hybrid approach
 * Preferred approach that adapts to the type of change
 */
const hybridRepositioning = (
  objects: GameObject[],
  oldConfig: ResponsiveLayoutConfig,
  newConfig: ResponsiveLayoutConfig
): GameObject[] => {
  
  // Analyze the type of change to choose the best strategy
  const deviceTypeChanged = oldConfig.deviceType !== newConfig.deviceType;
  const majorScaleChange = Math.abs(oldConfig.objectScale - newConfig.objectScale) > 0.3;
  const majorSpacingChange = Math.abs(oldConfig.spacingMultiplier - newConfig.spacingMultiplier) > 0.3;
  const significantObjectCountChange = Math.abs(oldConfig.objectCount - newConfig.objectCount) > 3;

  const needsCompleteRepositioning = (
    deviceTypeChanged ||
    majorScaleChange ||
    majorSpacingChange ||
    significantObjectCountChange
  );

  if (needsCompleteRepositioning) {
    return recomputeOptimalPositions(objects, newConfig);
  } else {
    return maintainRelativePositions(objects, oldConfig, newConfig);
  }
};

/*
 * Utility function to detect if objects need repositioning during edge cases
 */
export const shouldDelayRepositioning = (
  isHammerAnimating: boolean,
  isSpawningNewObject: boolean
): boolean => {
  // - Wait for hammer animation to complete
  // - Wait for object spawning to complete
  return isHammerAnimating || isSpawningNewObject;
};