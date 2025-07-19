// src/utils/layout.ts
import type { GameObject, PlacementConfig } from 'types/game';
import { calculateDistance } from './helpers';

/**
 * Generate a random position for object placement
 * Optimized for placing 30-40 objects on screen
 */
export const getRandomObjectPlacement = (
  existingObjects: GameObject[],
  config: PlacementConfig
): { x: number; y: number } => {
  const { minDistance, margin, maxAttempts } = config;
  
  // Get current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate valid placement area
  const minX = margin;
  const maxX = viewportWidth - margin;
  const minY = margin;
  const maxY = viewportHeight - margin;
  
  // For dense placement, try a grid-based approach first
  if (existingObjects.length > 20) {
    const gridPosition = tryGridPlacement(existingObjects, minX, maxX, minY, maxY, minDistance);
    if (gridPosition) {
      return gridPosition;
    }
  }
  
  // Fallback to random placement
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidatePosition = {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY
    };
    
    // Check if this position conflicts with existing objects
    const hasConflict = existingObjects.some(existingObject => {
      const distance = calculateDistance(candidatePosition, existingObject.position);
      return distance < minDistance;
    });
    
    if (!hasConflict) {
      return candidatePosition;
    }
  }
  
  // If we couldn't find a valid position, use spiral placement
  return getSpiralPlacement(existingObjects.length, minX, maxX, minY, maxY);
};

/**
 * Try to place objects in a loose grid pattern
 * Helps with dense object placement
 */
function tryGridPlacement(
  existingObjects: GameObject[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minDistance: number
): { x: number; y: number } | null {
  const cols = Math.floor((maxX - minX) / minDistance);
  const rows = Math.floor((maxY - minY) / minDistance);
  
  // Try a few random grid positions
  for (let attempt = 0; attempt < 10; attempt++) {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    const candidatePosition = {
      x: minX + (col * minDistance) + (Math.random() * minDistance * 0.3),
      y: minY + (row * minDistance) + (Math.random() * minDistance * 0.3)
    };
    
    const hasConflict = existingObjects.some(existingObject => {
      const distance = calculateDistance(candidatePosition, existingObject.position);
      return distance < minDistance * 0.8; // Slightly tighter for grid
    });
    
    if (!hasConflict) {
      return candidatePosition;
    }
  }
  
  return null;
}

/**
 * Spiral placement as last resort
 * Ensures all objects get placed even in tight spaces
 */
function getSpiralPlacement(
  objectIndex: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): { x: number; y: number } {
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  const angle = objectIndex * 0.5; // Spiral angle
  const radius = Math.min(40 + objectIndex * 8, Math.min(maxX - minX, maxY - minY) / 3);
  
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
}

/**
 * Get responsive scale factor based on viewport size
 * Adjusts for dense object placement
 */
export const getResponsiveScaleFactor = (): number => {
  const baseWidth = 1920;
  const currentWidth = window.innerWidth;
  
  // More aggressive scaling for mobile with many objects
  const scaleFactor = Math.max(0.4, Math.min(1.2, currentWidth / baseWidth));
  
  return scaleFactor;
};