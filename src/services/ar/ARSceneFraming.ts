import * as THREE from 'three';

/**
 * ARSceneFraming
 * 
 * Production scene-framing and bounding-box calculation engine for AR-DSA Tutor.
 * 
 * Responsibilities:
 * 1. Computes authoritative world-space bounding boxes for all 5 visualizers.
 * 2. Implements aspect-ratio and FOV-aware perspective camera framing.
 * 3. Accounts for viewport aperture differences between mobile portrait and desktop landscape.
 * 4. Compensates for HUD overlays (header bar + bottom action card) to prevent occlusion.
 * 5. Provides fail-safe guards against empty, zero, NaN, and infinite geometry bounds.
 * 6. Records diagnostics for verification and automated regression testing.
 */

export interface BoundingBoxResult {
  box: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
  maxDim: number;
  isValid: boolean;
}

export interface CameraFramingOptions {
  /** Vertical field of view in degrees (default: 60) */
  fovDegrees?: number;
  /** Viewport aspect ratio (width / height) */
  aspectRatio: number;
  /** Margin multiplier (e.g. 1.25 = 25% margin around model) */
  paddingMultiplier?: number;
  /** Minimum clamped camera distance in meters */
  minDistance?: number;
  /** Maximum clamped camera distance in meters */
  maxDistance?: number;
  /** Downward pitch angle in radians (default: ~16 degrees = 0.28 rad) */
  elevationAngleRad?: number;
  /** Yaw angle in radians around Y axis (default: 0) */
  azimuthAngleRad?: number;
  /** Vertical center shift ratio (-1.0 to 1.0) to avoid HUD occlusion (default: -0.10) */
  verticalOffsetRatio?: number;
}

export interface CameraFramingResult {
  cameraPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  distance: number;
  isValid: boolean;
  box: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
    center: [number, number, number];
  };
}

export interface ARFramingDiagnostic {
  activeAlgorithm: string;
  renderingMode: 'WEBXR_AR' | 'CANVAS_3D_FALLBACK';
  viewportWidth: number;
  viewportHeight: number;
  aspectRatio: number;
  fovDegrees: number;
  cameraDistance: number;
  cameraPosition: [number, number, number];
  targetPosition: [number, number, number];
  modelBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
    center: [number, number, number];
  };
  fitSuccess: boolean;
  timestamp: number;
}

export class ARSceneFraming {
  /**
   * Computes the world-space bounding box of a visualizer object or group.
   * Filters out invisible objects, lights, empty geometries, and uninitialized meshes.
   */
  public static computeBoundingBox(root: THREE.Object3D): BoundingBoxResult {
    if (!root) {
      return this.createFallbackBounds();
    }

    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    let validMeshCount = 0;

    root.traverse((obj) => {
      if (!obj.visible) return;

      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) {
          if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
          }
          if (mesh.geometry.boundingBox && !mesh.geometry.boundingBox.isEmpty()) {
            const meshBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            if (
              isFinite(meshBox.min.x) && isFinite(meshBox.max.x) &&
              isFinite(meshBox.min.y) && isFinite(meshBox.max.y) &&
              isFinite(meshBox.min.z) && isFinite(meshBox.max.z)
            ) {
              box.union(meshBox);
              validMeshCount++;
            }
          }
        }
      } else if ((obj as THREE.Sprite).isSprite) {
        // Sprites: estimate bounding extents from world position and scale
        const pos = new THREE.Vector3();
        obj.getWorldPosition(pos);
        const halfSize = Math.max(0.02, (obj.scale.x || 0.05) / 2);
        box.expandByPoint(new THREE.Vector3(pos.x - halfSize, pos.y - halfSize, pos.z - 0.01));
        box.expandByPoint(new THREE.Vector3(pos.x + halfSize, pos.y + halfSize, pos.z + 0.01));
        validMeshCount++;
      } else if ((obj as THREE.Line).isLine) {
        const line = obj as THREE.Line;
        if (line.geometry) {
          if (!line.geometry.boundingBox) {
            line.geometry.computeBoundingBox();
          }
          if (line.geometry.boundingBox && !line.geometry.boundingBox.isEmpty()) {
            const lineBox = line.geometry.boundingBox.clone().applyMatrix4(line.matrixWorld);
            box.union(lineBox);
            validMeshCount++;
          }
        }
      }
    });

    if (validMeshCount === 0 || box.isEmpty()) {
      return this.createFallbackBounds();
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const isValid =
      isFinite(size.x) && isFinite(size.y) && isFinite(size.z) &&
      size.x > 0 && size.y > 0 &&
      isFinite(center.x) && isFinite(center.y) && isFinite(center.z);

    if (!isValid) {
      return this.createFallbackBounds();
    }

    return {
      box,
      size,
      center,
      maxDim: Math.max(size.x, size.y, size.z),
      isValid: true
    };
  }

  /**
   * Safe fallback bounds (tabletop dimensions: width 40cm, height 25cm, depth 10cm, centered at y=15cm).
   */
  public static createFallbackBounds(): BoundingBoxResult {
    const box = new THREE.Box3(
      new THREE.Vector3(-0.20, 0.02, -0.05),
      new THREE.Vector3(0.20, 0.28, 0.05)
    );
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return {
      box,
      size,
      center,
      maxDim: 0.40,
      isValid: false
    };
  }

  /**
   * Computes the optimal perspective camera distance and placement to fit the model bounds.
   * Resolves both horizontal and vertical frustum constraints with responsive aspect ratio handling.
   */
  public static computeCameraFit(
    bounds: BoundingBoxResult,
    options: CameraFramingOptions
  ): CameraFramingResult {
    const fov = options.fovDegrees ?? 60;
    const aspect = Math.max(0.1, options.aspectRatio);
    // Responsive padding and vertical aperture offset:
    // In both desktop landscape and mobile portrait, the top header occupies ~6% and the bottom control card occupies ~26-30% of screen height.
    // Setting paddingV (~1.50) and negative verticalOffset (-0.09 to -0.11) perfectly frames the model in the unobstructed central aperture.
    const isPortrait = aspect < 0.9;
    const paddingV = options.paddingMultiplier ?? (isPortrait ? 1.40 : 1.35);
    const paddingH = options.paddingMultiplier ?? (isPortrait ? 1.20 : 1.20);
    const minDistance = options.minDistance ?? 0.35;
    const maxDistance = options.maxDistance ?? 2.50;
    const elevation = options.elevationAngleRad ?? 0.32;
    const azimuth = options.azimuthAngleRad ?? 0.22;
    const verticalOffset = options.verticalOffsetRatio ?? (isPortrait ? -0.06 : -0.05);

    const fovRad = (fov * Math.PI) / 180;
    const halfFovV = fovRad / 2;
    const halfFovH = Math.atan(aspect * Math.tan(halfFovV));

    const W = Math.max(0.05, bounds.size.x);
    const H = Math.max(0.05, bounds.size.y);
    const D = Math.max(0.02, bounds.size.z);

    // Vertical frustum distance requirement
    const distV = (H * paddingV) / (2 * Math.tan(halfFovV)) + D / 2;

    // Horizontal frustum distance requirement (critical for narrow portrait screens)
    const distH = (W * paddingH) / (2 * Math.tan(halfFovH)) + D / 2;

    // Choose the dominant constraint so neither width nor height is clipped
    let distance = Math.max(distV, distH);

    // Apply safety limits
    distance = Math.max(minDistance, Math.min(maxDistance, distance));

    // Target position is the model's actual spatial center
    const target = bounds.center.clone();

    // Apply vertical aperture offset
    if (verticalOffset !== 0) {
      const visibleHeightAtDist = 2 * distance * Math.tan(halfFovV);
      target.y += verticalOffset * visibleHeightAtDist;
    }

    // Camera position from spherical coordinates around target
    const camPos = new THREE.Vector3(
      target.x + distance * Math.sin(azimuth) * Math.cos(elevation),
      target.y + distance * Math.sin(elevation),
      target.z + distance * Math.cos(azimuth) * Math.cos(elevation)
    );

    return {
      cameraPosition: camPos,
      targetPosition: target,
      distance,
      isValid: bounds.isValid && isFinite(distance) && isFinite(camPos.x),
      box: {
        min: [bounds.box.min.x, bounds.box.min.y, bounds.box.min.z],
        max: [bounds.box.max.x, bounds.box.max.y, bounds.box.max.z],
        size: [bounds.size.x, bounds.size.y, bounds.size.z],
        center: [bounds.center.x, bounds.center.y, bounds.center.z]
      }
    };
  }

  /**
   * Applies the computed camera framing directly to a Three.js perspective camera.
   */
  public static applyCameraFraming(
    camera: THREE.PerspectiveCamera,
    framing: CameraFramingResult
  ): void {
    if (!camera || !framing.isValid) return;

    camera.position.copy(framing.cameraPosition);
    camera.lookAt(framing.targetPosition);
    camera.updateMatrixWorld();
  }

  /**
   * Generates a telemetry and diagnostic snapshot of the scene framing calculation.
   */
  public static generateDiagnostic(
    bounds: BoundingBoxResult,
    framing: CameraFramingResult,
    activeAlgorithm: string,
    renderingMode: 'WEBXR_AR' | 'CANVAS_3D_FALLBACK',
    viewportWidth: number,
    viewportHeight: number,
    fovDegrees: number = 60
  ): ARFramingDiagnostic {
    return {
      activeAlgorithm,
      renderingMode,
      viewportWidth,
      viewportHeight,
      aspectRatio: viewportWidth / Math.max(1, viewportHeight),
      fovDegrees,
      cameraDistance: framing.distance,
      cameraPosition: [framing.cameraPosition.x, framing.cameraPosition.y, framing.cameraPosition.z],
      targetPosition: [framing.targetPosition.x, framing.targetPosition.y, framing.targetPosition.z],
      modelBounds: {
        min: [bounds.box.min.x, bounds.box.min.y, bounds.box.min.z],
        max: [bounds.box.max.x, bounds.box.max.y, bounds.box.max.z],
        size: [bounds.size.x, bounds.size.y, bounds.size.z],
        center: [bounds.center.x, bounds.center.y, bounds.center.z]
      },
      fitSuccess: framing.isValid,
      timestamp: Date.now()
    };
  }
}
