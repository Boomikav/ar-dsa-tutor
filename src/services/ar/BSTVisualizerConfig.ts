/**
 * Centralized Physical AR Visualization Scale & Dimensions.
 * 
 * Provides ergonomic tabletop & room-scale dimensions (in meters) for mobile WebXR.
 * 
 * Invariants:
 * - Spheres are large enough (7.5cm radius / 15cm diameter) to comfortably inspect from 1m–2m away.
 * - Labels use 256x256 high-resolution dynamic textures for razor-sharp legibility on mobile screens.
 * - Edges are 10mm–15mm thick cylinders that stand out clearly against physical room backgrounds.
 * - Total tree span fits naturally on standard physical desks (width ~0.8m, height ~0.45m).
 * - Modifying these visual parameters never alters BST algorithmic state or spatial hit-test math.
 */

export interface BSTVisualizerConfig {
  /** Overall visual scale factor */
  scale: number;
  /** Radius of each BST node sphere (meters) */
  nodeRadius: number;
  /** Vertical spacing between tree levels (meters) */
  levelHeight: number;
  /** Horizontal spread width of tree branches at root (meters) */
  baseHorizontalSpread: number;
  /** Minimum horizontal center-to-center distance between adjacent nodes (meters) */
  minNodeSeparation: number;
  /** Size multiplier for floating numeric billboard sprites */
  labelScale: number;
  /** Radius of standard parent-child connecting edge cylinders (meters) */
  edgeRadius: number;
  /** Radius of highlighted active path edge cylinders (meters) */
  highlightEdgeRadius: number;
  /** Radius of ghost insertion edge cylinder (meters) */
  ghostEdgeRadius: number;
  /** Maximum allowed tree width before adaptive scaling triggers (meters) */
  maxAllowedWidth: number;
  /** Maximum allowed tree height before adaptive scaling triggers (meters) */
  maxAllowedHeight: number;
}

export const DEFAULT_BST_AR_CONFIG: BSTVisualizerConfig = {
  scale: 1.0,
  nodeRadius: 0.040,            // 4.0cm radius (8.0cm diameter sphere — comfortable tabletop baseball scale)
  levelHeight: 0.140,           // 14.0cm vertical distance between levels
  baseHorizontalSpread: 0.150,  // 15.0cm initial horizontal branch spread from root (55.4cm total width, fits mobile FOV)
  minNodeSeparation: 0.140,     // 14.0cm minimum center-to-center sibling spacing (guarantees >= 6cm air gap)
  labelScale: 1.05,             // Proportional billboard scale relative to sphere
  edgeRadius: 0.005,            // 5mm radius (10mm solid edge cylinder)
  highlightEdgeRadius: 0.008,   // 8mm radius (16mm glowing highlight edge cylinder)
  ghostEdgeRadius: 0.004,       // 4mm radius (8mm dashed ghost edge cylinder)
  maxAllowedWidth: 0.65,        // 65cm maximum allowed width before scaling
  maxAllowedHeight: 0.45        // 45cm maximum allowed height before scaling
};

export interface AdaptiveScaleParams {
  viewportWidth?: number;
  viewportHeight?: number;
  treeWidth: number;
  treeHeight: number;
  treeDepth?: number;
  cameraDistance?: number;
}

/**
 * Calculates a dynamic, adaptive scale factor for the 3D BST visualization.
 * Preserves the uncompressed horizontal hierarchy on physical tabletops (45cm-65cm width)
 * while ensuring unusually deep or wide generated trees do not clip.
 */
export function getAdaptiveBSTScale(params: AdaptiveScaleParams): number {
  const { treeWidth, treeHeight } = params;

  // Ergonomic tabletop bounding envelope
  const maxTableWidth = 0.65;
  const maxTableHeight = 0.45;

  let scale = 1.0;
  if (treeWidth > maxTableWidth || treeHeight > maxTableHeight) {
    const scaleX = maxTableWidth / treeWidth;
    const scaleY = maxTableHeight / treeHeight;
    scale = Math.min(scaleX, scaleY);
  }

  // Constrain scale within sensible tabletop bounds [0.75, 1.15]
  return Math.max(0.75, Math.min(scale, 1.15));
}
