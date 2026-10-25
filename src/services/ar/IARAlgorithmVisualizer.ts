import * as THREE from 'three';

/**
 * Universal interface for spatial algorithm visualizers in mobile WebXR.
 * Visualizers manage their own Three.js scene graphs, meshes, materials, and textures
 * inside an authoritative rootGroup that is placed via real-world surface hit testing.
 */
export interface IARAlgorithmVisualizer<TState = any, TOptions = any> {
  /** Unique topic identifier matching the DSA engine (e.g. 'algo-bubble-sort') */
  readonly id: string;

  /** Human-readable display title */
  readonly title: string;

  /** Authoritative root group attached to the physical XR reference space */
  readonly rootGroup: THREE.Group;

  /**
   * Updates or rebuilds the 3D visualization to match the deterministic state.
   * Modifies only local scene graph; never alters the physical placement anchor.
   */
  render(state: TState, options?: TOptions): void;

  /**
   * Raycasting helper for interactive element selection.
   */
  pickElement?(raycaster: THREE.Raycaster): any;

  /**
   * Releases all GPU buffers, geometries, materials, and canvas textures.
   */
  dispose(): void;
}
