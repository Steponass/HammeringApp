import { useMemo } from 'react';
import type { 
  Position, 
  GameObject, 
  ObjectMaskData, 
  CollisionDetectionResult,
  ShadowConfig 
} from 'types/game';

// Default shadow configuration
const DEFAULT_SHADOW_CONFIG: ShadowConfig = {
  radius: 60,           // 60px radius shadow circle
  opacity: 0.3,         // Semi-transparent
  blurAmount: 4         // Soft edges
};

/**
 * Custom hook for detecting shadow-object intersections and calculating masking data
 * 
 * @param shadowPosition - Global shadow position from useMouseTracking
 * @param objects - Array of all game objects
 * @param shadowConfig - Shadow appearance and size configuration
 * @returns Intersection data and masking coordinates for each object
 */
const useCollisionDetection = (
  shadowPosition: Position,
  objects: GameObject[],
  shadowConfig: ShadowConfig = DEFAULT_SHADOW_CONFIG
): CollisionDetectionResult => {

  /**
   * Calculate if a circle intersects with a rectangle
   * Used to determine basic shadow-object overlap
   */
  const calculateCircleRectIntersection = (
    circleCenter: Position,
    circleRadius: number,
    rectPosition: Position,
    rectSize: number
  ): boolean => {
    // Find the closest point on rectangle to circle center
    const closestX = Math.max(
      rectPosition.x, 
      Math.min(circleCenter.x, rectPosition.x + rectSize)
    );
    const closestY = Math.max(
      rectPosition.y, 
      Math.min(circleCenter.y, rectPosition.y + rectSize)
    );

    // Calculate distance between circle center and closest point
    const deltaX = circleCenter.x - closestX;
    const deltaY = circleCenter.y - closestY;
    const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);

    // Intersection occurs if distance is less than radius
    return distanceSquared <= (circleRadius * circleRadius);
  };

  /**
   * Calculate what percentage of the object is covered by shadow
   * Approximation based on how much of shadow circle overlaps object bounds
   */
  const calculateIntersectionPercentage = (
    shadowCenter: Position,
    shadowRadius: number,
    objectCenter: Position,
    objectSize: number
  ): number => {
    // Calculate distance between shadow center and object center
    const deltaX = shadowCenter.x - objectCenter.x;
    const deltaY = shadowCenter.y - objectCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate object radius from size
    const objectRadius = objectSize / 2;

    // If shadow completely contains object
    if (distance + objectRadius <= shadowRadius) {
      return 1.0; // 100% covered
    }

    // If no intersection
    if (distance >= shadowRadius + objectRadius) {
      return 0.0; // 0% covered
    }

    // Approximate percentage for partial intersection
    // This is a simplified calculation - could be more precise if needed
    const overlapDistance = shadowRadius + objectRadius - distance;
    const maxOverlap = Math.min(shadowRadius, objectRadius) * 2;
    return Math.min(1.0, overlapDistance / maxOverlap);
  };

  /**
   * Convert global shadow position to coordinates relative to object
   * This is what we'll use for CSS clip-path positioning
   */
  const calculateRelativePosition = (
    shadowPosition: Position,
    objectPosition: Position
  ): Position => {
    return {
      x: shadowPosition.x - objectPosition.x,
      y: shadowPosition.y - objectPosition.y
    };
  };

  /**
   * Check if object is fully covered by shadow
   * Useful for different visual effects or game mechanics
   */
  const isObjectFullyCovered = (
    shadowCenter: Position,
    shadowRadius: number,
    objectCenter: Position,
    objectSize: number
  ): boolean => {
    const deltaX = shadowCenter.x - objectCenter.x;
    const deltaY = shadowCenter.y - objectCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const objectRadius = objectSize / 2;
    
    // Object is fully covered if shadow radius encompasses entire object
    return distance + objectRadius <= shadowRadius;
  };

  /**
   * Main collision detection calculation
   * Uses useMemo for performance - only recalculates when inputs change
   */
  const collisionResult = useMemo((): CollisionDetectionResult => {
    const intersectingObjects: ObjectMaskData[] = [];

    // Check each object for intersection with shadow
    objects.forEach((object) => {
      // Skip objects that are already hammered (no longer interactive)
      if (object.state === 'hammered') {
        return;
      }

      // Calculate object center for easier collision math
      const objectCenter: Position = {
        x: object.position.x + (object.size / 2),
        y: object.position.y + (object.size / 2)
      };

      // Check if shadow intersects with this object
      const hasIntersection = calculateCircleRectIntersection(
        shadowPosition,
        shadowConfig.radius,
        object.position,
        object.size
      );

      if (hasIntersection) {
        // Calculate relative position for CSS masking
        const relativePosition = calculateRelativePosition(
          shadowPosition,
          object.position
        );

        // Calculate how much of object is revealed
        const intersectionPercentage = calculateIntersectionPercentage(
          shadowPosition,
          shadowConfig.radius,
          objectCenter,
          object.size
        );

        // Check if entire object is covered
        const isFullyCovered = isObjectFullyCovered(
          shadowPosition,
          shadowConfig.radius,
          objectCenter,
          object.size
        );

        // Add to results
        intersectingObjects.push({
          objectId: object.id,
          hasIntersection: true,
          maskCoordinates: {
            centerX: relativePosition.x,
            centerY: relativePosition.y,
            radius: shadowConfig.radius
          },
          intersectionPercentage,
          isFullyCovered
        });
      }
    });

    // Find object with highest intersection percentage (primary interaction)
    let primaryObject: string | null = null;
    let maxIntersection = 0;

    intersectingObjects.forEach((maskData) => {
      if (maskData.intersectionPercentage > maxIntersection) {
        maxIntersection = maskData.intersectionPercentage;
        primaryObject = maskData.objectId;
      }
    });

    return {
      intersectingObjects,
      primaryObject,
      totalIntersections: intersectingObjects.length
    };
  }, [shadowPosition, objects, shadowConfig]);

  return collisionResult;
};

export default useCollisionDetection;