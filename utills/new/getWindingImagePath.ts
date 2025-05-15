// utils/getWindingImagePath.ts
export function getWindingImagePath(windingDirection?: string): string {
    const validDirections = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'] as const;
    type WindingDirection = typeof validDirections[number];
  
    // Default fallback image
    const defaultImage = '/images/bartech.png';
  
    // If windingDirection is undefined or not valid, return default
    if (!windingDirection || !validDirections.includes(windingDirection as WindingDirection)) {
      return defaultImage;
    }
  
    // Map valid windingDirection to image path
    return `/images/${windingDirection}.png`;
  }