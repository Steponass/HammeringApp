interface ObjectConfig {
  nailType: string;
  baseSize: number;
  placeholder: string; // Use placeholder instead of SVG path for now
}

interface GameConfiguration {
  defaultObjectCount: number;
  minObjectDistance: number;
  screenMargin: number;
  availableObjects: Record<string, ObjectConfig>;
  shadowConfig: {
    radius: number;
    opacity: number;
    blurAmount: number;
  };
  animation: {
    hammerSwingDuration: number;
    transformDuration: number;
    easingFunction: string;
  };
}

export const GAME_CONFIG: GameConfiguration = {

  defaultObjectCount: 35,
  
  minObjectDistance: 80,
  
  screenMargin: 40,
  
  // Object types (ready for 30 different objects)
  availableObjects: {
    // Electronics
    'phone': { nailType: 'wood-screw', baseSize: 50, placeholder: '📱' },
    'laptop': { nailType: 'railroad-spike', baseSize: 70, placeholder: '💻' },
    'tablet': { nailType: 'common-nail', baseSize: 60, placeholder: '📟' },
    'headphones': { nailType: 'finishing-nail', baseSize: 45, placeholder: '🎧' },
    'camera': { nailType: 'roofing-nail', baseSize: 55, placeholder: '📷' },
    'watch': { nailType: 'brad-nail', baseSize: 35, placeholder: '⌚' },
    'keyboard': { nailType: 'wood-screw', baseSize: 65, placeholder: '⌨️' },
    'mouse': { nailType: 'finishing-nail', baseSize: 40, placeholder: '🖱️' },
    
    // Kitchen Items
    'cup': { nailType: 'finishing-nail', baseSize: 45, placeholder: '☕' },
    'plate': { nailType: 'common-nail', baseSize: 55, placeholder: '🍽️' },
    'bottle': { nailType: 'roofing-nail', baseSize: 40, placeholder: '🍼' },
    'glass': { nailType: 'finishing-nail', baseSize: 42, placeholder: '🥛' },
    'fork': { nailType: 'brad-nail', baseSize: 35, placeholder: '🍴' },
    'spoon': { nailType: 'brad-nail', baseSize: 35, placeholder: '🥄' },
    'knife': { nailType: 'common-nail', baseSize: 45, placeholder: '🔪' },
    'pot': { nailType: 'roofing-nail', baseSize: 60, placeholder: '🍲' },
    
    // Office/School
    'book': { nailType: 'common-nail', baseSize: 55, placeholder: '📖' },
    'pen': { nailType: 'brad-nail', baseSize: 30, placeholder: '🖊️' },
    'pencil': { nailType: 'brad-nail', baseSize: 30, placeholder: '✏️' },
    'ruler': { nailType: 'finishing-nail', baseSize: 50, placeholder: '📏' },
    'calculator': { nailType: 'wood-screw', baseSize: 45, placeholder: '🧮' },
    'stapler': { nailType: 'common-nail', baseSize: 48, placeholder: '📎' },
    'scissors': { nailType: 'finishing-nail', baseSize: 45, placeholder: '✂️' },
    'notebook': { nailType: 'wood-screw', baseSize: 52, placeholder: '📔' },
    
    // Tools/Hardware
    'hammer': { nailType: 'railroad-spike', baseSize: 55, placeholder: '🔨' },
    'screwdriver': { nailType: 'wood-screw', baseSize: 50, placeholder: '🪛' },
    'wrench': { nailType: 'common-nail', baseSize: 52, placeholder: '🔧' },
    'pliers': { nailType: 'finishing-nail', baseSize: 48, placeholder: '🗜️' },
    'drill': { nailType: 'roofing-nail', baseSize: 58, placeholder: '🔩' },
    'saw': { nailType: 'railroad-spike', baseSize: 65, placeholder: '🪚' }
  },
  
  // Smaller shadow for tighter object spacing
  shadowConfig: {
    radius: 45,        // Reduced shadow radius
    opacity: 0.7,      
    blurAmount: 2      
  },
  
  // Faster animations for more action with many objects
  animation: {
    hammerSwingDuration: 500,     // Slightly faster
    transformDuration: 300,       // Quicker transforms
    easingFunction: 'ease-out'    
  }
};