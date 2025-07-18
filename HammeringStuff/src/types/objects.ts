// Definition for different object types
export interface ObjectDefinition {
  id: string;                   // Unique object type identifier
  name: string;                 // Human-readable name
  svgPath: string;             // Path to the SVG file
  baseSize: number;            // Default size in pixels
  nailType: string;            // Which nail this object becomes
}

// Definition for different nail types
export interface NailDefinition {
  id: string;                   // Unique nail type identifier
  name: string;                 // Human-readable name (wood screw, railroad spike, etc.)
  svgPath: string;             // Path to the nail SVG file
  hammerSound?: string;        // Optional: sound file for hammering (future feature)
}

// Mapping between objects and their nail transformations
export interface ObjectToNailMapping {
  objectType: string;           // Original object type
  nailType: string;            // What nail it becomes
  transformationStyle?: string; // Optional: special CSS class for transformation
}