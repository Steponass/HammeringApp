// Re-export all types for easy importing
export type {
  Position,
  InputMode,
  ObjectState,
  GameObject,
  CursorState,
  GameState,
  HammerAnimation,
  ObjectMaskData,
  CollisionDetectionResult, 
  ShadowConfig,
  LayoutDimensions,
  PlacementConfig
} from './game';

export type {
  ObjectDefinition,
  NailDefinition,
  ObjectToNailMapping
} from './objects';

export type {
  AnimationType,
  AnimationConfig,
  ElementAnimation,
  AnimationKeyframe
} from './animation';