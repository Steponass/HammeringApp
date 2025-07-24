/*
 * Generate a unique ID for game objects
 * Uses timestamp + random number for uniqueness
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `obj_${timestamp}_${randomPart}`;
};

/*
 * Calculate distance between two positions
 * Used for collision detection and placement validation
 */
export const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};