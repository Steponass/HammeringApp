// Different types of animations in the game
export type AnimationType = 'hammer-swing' | 'object-transform' | 'nail-sink';

// Animation timing configuration
export interface AnimationConfig {
  type: AnimationType;
  duration: number;             // Animation length in milliseconds
  easing: string;              // CSS easing function
  delay?: number;              // Optional delay before starting
}

// Animation state for individual elements
export interface ElementAnimation {
  elementId: string;           // Which element is being animated
  config: AnimationConfig;     // Animation parameters
  startTime: number;           // When animation started
  isComplete: boolean;         // Whether animation has finished
}

// Keyframe data for complex animations
export interface AnimationKeyframe {
  progress: number;            // Point in animation (0-1)
  transform: string;           // CSS transform at this point
  opacity?: number;            // Optional opacity change
}