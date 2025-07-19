// src/types/game.ts
// Remove HammerAnimation from here since it belongs in animation.ts
export interface Position {
  x: number;
  y: number;
}

export type InputMode = 'desktop' | 'mobile';
export type ObjectState = 'normal' | 'transformed' | 'hammered';

export interface GameObject {
  id: string;
  position: Position;
  objectType: string;
  nailType: string;
  state: ObjectState;
  radius: number;
  size: number;
}

export interface CursorState {
  cursorPosition: Position;
  shadowPosition: Position;
  inputMode: InputMode;
  isFirstTouch: boolean;
}

export interface GameState {
  objects: GameObject[];
  hammeredCount: number;
  totalCount: number;
  isGameComplete: boolean;
  gameStartTime: number;
}

// Keep these in game.ts as they're collision-related
export interface ObjectMaskData {
  objectId: string;
  hasIntersection: boolean;
  maskCoordinates: {
    centerX: number;
    centerY: number;
    radius: number;
  };
  intersectionPercentage: number;
  isFullyCovered: boolean;
}

export interface CollisionDetectionResult {
  intersectingObjects: ObjectMaskData[];
  primaryObject: string | null;
  totalIntersections: number;
}

export interface ShadowConfig {
  radius: number;
  opacity: number;
  blurAmount: number;
}

export interface LayoutDimensions {
  viewportWidth: number;
  viewportHeight: number;
  objectBaseSize: number;
  shadowSize: number;
  scaleFactor: number;
}

export interface PlacementConfig {
  minDistance: number;
  margin: number;
  maxAttempts: number;
}