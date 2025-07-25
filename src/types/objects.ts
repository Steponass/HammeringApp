export interface ObjectDefinition {
  id: string;                   // Unique object type identifier
  name: string;                 // Human-readable name
  svgPath: string;             // Path to the SVG file
  baseSize: number;            // Default size in pixels
  nailType: string;            // Which nail this object becomes
}

export interface NailDefinition {
  id: string;                   // Unique nail type identifier
  name: string;                 // Human-readable name
  svgPath: string;             // Path to the nail SVG file
  hammeredSvgPath: string;     // Path to the hammered nail SVG file
  placeholder: string;        // Emoji placeholder if SVG fails
}

// Mapping between objects and their nail transformations
export interface ObjectToNailMapping {
  objectType: string;           // Original object type
  nailType: string;            // What nail it becomes
  transformationStyle?: string; // Optional: special CSS class for transformation
}