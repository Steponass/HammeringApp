// Basic coordinate position
export interface Position {
  x: number;
  y: number;
}

// Input method detection
export type InputMode = 'desktop' | 'mobile';

// Object states during the game lifecycle
export type ObjectState = 'normal' | 'transformed' | 'hammered';

// Individual game object definition
export interface GameObject {
  id: string;                    // Unique identifier for each object
  position: Position;            // Where the object is placed on screen
  objectType: string;            // What kind of object it is (phone, cup, etc.)
  nailType: string;             // What kind of nail it transforms into
  state: ObjectState;           // Current interaction state
  radius: number;               // Collision detection radius
  size: number;                 // Visual size for responsive scaling
}

// Mouse/touch tracking data
export interface CursorState {
  cursorPosition: Position;      // Actual cursor/finger position
  shadowPosition: Position;     // Where the hammer shadow appears
  inputMode: InputMode;         // Desktop mouse or mobile touch
  isFirstTouch: boolean;        // For mobile: first touch moves, second hammers
}

// Game progression and win condition
export interface GameState {
  objects: GameObject[];         // All interactive objects in the game
  hammeredCount: number;        // How many objects have been hammered
  totalCount: number;           // Total number of objects
  isGameComplete: boolean;      // Whether all objects are hammered
  gameStartTime: number;        // When the game started (for timing)
}

// Animation control for hammer swinging
export interface HammerAnimation {
  isActive: boolean;            // Whether hammer animation is playing
  targetObjectId: string | null; // Which object is being hammered
  progress: number;             // Animation progress (0-1)
  duration: number;             // How long the animation takes (ms)
}

// Collision detection result
export interface ObjectMaskData {
  objectId: string;
  hasIntersection: boolean;
  maskCoordinates: {
    // Position relative to object's coordinate system (for CSS clip-path)
    centerX: number;    // Shadow center X relative to object top-left
    centerY: number;    // Shadow center Y relative to object top-left  
    radius: number;     // Shadow radius
  };
  intersectionPercentage: number; // How much of object is revealed (0-1)
  isFullyCovered: boolean;        // True when entire object is under shadow
}

export interface CollisionDetectionResult {
  intersectingObjects: ObjectMaskData[];
  primaryObject: string | null;  // Object with highest intersection percentage
  totalIntersections: number;     // How many objects are being revealed
}

export interface ShadowConfig {
  radius: number;           // Shadow circle radius in pixels
  opacity: number;          // Visual opacity of shadow overlay
  blurAmount: number;       // CSS blur for soft shadow edges
}

// Responsive layout calculations
export interface LayoutDimensions {
  viewportWidth: number;        // Current screen width
  viewportHeight: number;       // Current screen height
  objectBaseSize: number;       // Base size for objects at current scale
  shadowSize: number;           // Shadow interaction area size
  scaleFactor: number;          // Overall scaling multiplier
}

// Configuration for object placement
export interface PlacementConfig {
  minDistance: number;          // Minimum distance between objects
  margin: number;               // Margin from screen edges
  maxAttempts: number;          // How many times to try placing an object
}