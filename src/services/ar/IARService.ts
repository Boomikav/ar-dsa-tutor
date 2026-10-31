import { BSTNode } from '../../models/bst';
import { DSATopic, VisualAssetSpec } from '../../models/topic';

/**
 * Deterministic AR session state machine.
 * States transition meaningfully based on physical surface hit testing and user placement.
 */
export type ARSessionState =
  | 'UNAVAILABLE'
  | 'INITIALIZING'
  | 'READY'
  | 'SCANNING'
  | 'SURFACE_DETECTED'
  | 'PLACEMENT_READY'
  | 'PLACED'
  | 'TRACKING'
  | 'PAUSED'
  | 'ENDED'
  | 'ERROR';

// Legacy compatibility alias
export type ARTrackingState = 
  | 'unsupported'
  | 'initializing'
  | 'detecting_surface'
  | 'surface_placed'
  | 'tracking_lost'
  | 'paused';

export interface ARCapabilities {
  webXRAvailable: boolean;
  immersiveARSupported: boolean;
  hitTestSupported: boolean;
  domOverlaySupported: boolean;
  cameraAccessGranted: boolean;
  lightingEstimationSupported: boolean;
  depthSensingSupported: boolean;
  referenceSpaceType: 'local-floor' | 'local' | 'none';
  runtimeEnvironment: 'WEBXR_AR' | 'CANVAS_3D_FALLBACK' | 'UNSUPPORTED';
}

export interface ARPerformanceTelemetry {
  sessionStartupMs?: number;
  surfaceDetectionLatencyMs?: number;
  placementLatencyMs?: number;
  approximateFPS?: number;
  sessionDurationSeconds?: number;
}

export interface ARSpatialDiagnostic {
  activeAlgorithm: string;
  renderingMode: 'WEBXR_AR' | 'CANVAS_3D_FALLBACK';
  referenceSpaceType: 'local-floor' | 'local' | 'none';
  placementDistance: number;
  objectScale: [number, number, number];
  placementPosition: [number, number, number];
  cameraPosition: [number, number, number];
  cameraToModelDistance: number;
  modelBounds: {
    min?: any;
    max?: any;
    size: any;
    center: any;
    isValid: boolean;
  };
  viewportWidth: number;
  viewportHeight: number;
  timestamp: number;
}

/**
 * World-space spatial placement in the XR reference space.
 * Note: Represents a local transform in reference space; does NOT claim native WebXR XRAnchor API.
 */
export interface ARSpatialPlacement {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  timestamp: string;
}

// Alias for backward compatibility
export type ARSpatialAnchor = ARSpatialPlacement;

export interface ARHitTestResult {
  hasHit: boolean;
  matrix?: Float32Array | number[];
  position?: { x: number; y: number; z: number };
}

export interface ARInteractionEvent {
  action: 'select_node' | 'rotate' | 'scale' | 'translate' | 'step_next' | 'step_prev' | 'reset';
  payload?: any;
}

export interface ARSessionConfig {
  enableSurfaceOverlay?: boolean;
  autoRotate?: boolean;
  enableLightEstimation?: boolean;
  renderQuality?: 'low' | 'medium' | 'high';
}

export interface BST3DRenderOptions {
  activeNodeValue?: number | null;
  highlightPathValues?: number[];
  targetValue?: number | null;
  ghostInsertPosition?: { parentValue: number; direction: 'LEFT' | 'RIGHT' } | null;
  traversalOrder?: number[];
}

/**
 * Framework-independent boundary interface for Mobile Augmented Reality.
 * Decouples the UI layer from Three.js and WebXR APIs while maintaining
 * strict deterministic authority over state transitions.
 * 
 * Technical specification:
 * - Uses real-world surface hit testing (XRHitTestSource).
 * - Places objects in the XR reference space (local-floor with local fallback).
 * - Does NOT use the WebXR Plane Detection API (XRPlane) or WebXR Anchor API (XRAnchor).
 */
export interface IARService {
  readonly isMock: boolean;
  readonly sessionState: ARSessionState;
  readonly trackingState: ARTrackingState;
  readonly isObjectPlaced: boolean;

  /** Checks device and browser WebXR / AR capabilities */
  checkCapabilities(): Promise<ARCapabilities>;

  /** Quick capability predicate */
  isARSupported(): Promise<boolean>;

  /**
   * Initializes the 3D rendering context on the canvas.
   * If AR is supported, prepares WebXR context; otherwise prepares 3D fallback mode.
   */
  initializeSession(
    canvasElement: HTMLCanvasElement | null,
    domOverlayElement?: HTMLElement | null,
    config?: ARSessionConfig
  ): Promise<boolean>;

  /** Starts the genuine WebXR immersive-ar session */
  startARSession(domOverlayElement?: HTMLElement | null): Promise<boolean>;

  /** Ends the active WebXR session and returns to normal 3D mode */
  endARSession(): Promise<void>;

  /**
   * Places the 3D BST at the active surface hit-test location.
   * Returns true if successfully placed.
   */
  placeObject(): boolean;

  /** Resets the object placement back to scanning state */
  resetPlacement(): void;

  /** Helper for placing data structure from specification */
  anchorDataStructure(
    topic: DSATopic,
    spec: VisualAssetSpec
  ): Promise<ARSpatialPlacement>;

  /**
   * Renders the authoritative BST state into the 3D scene.
   * The 3D renderer only visualizes; it never computes tree operations.
   */
  renderBST(root: BSTNode | null, options?: BST3DRenderOptions): void;

  /** Sets active algorithm and cleans up previous algorithm's scene graph */
  setActiveAlgorithm?(algorithmId: string): void;

  /** Renders Bubble Sort state into the active 3D spatial scene */
  renderBubbleSort?(state: any, options?: any): void;

  /** Renders Binary Search state into the active 3D spatial scene */
  renderBinarySearch?(state: any, options?: any): void;

  /** Renders Breadth-First Search state into the active 3D spatial scene */
  renderBFS?(state: any, options?: any): void;

  /** Renders Stack state into the active 3D spatial scene */
  renderStack?(state: any, options?: any): void;

  /** Renders Merge Sort state into the active 3D spatial scene */
  renderMergeSort?(state: any, options?: any): void;

  /** Renders AVL Tree state into the active 3D spatial scene */
  renderAVLTree?(state: any, options?: any): void;

  /** Renders Dijkstra's Algorithm state into the active 3D spatial scene */
  renderDijkstra?(state: any, options?: any): void;

  /**
   * Raycasts into the 3D scene from screen coordinates to select an algorithm element.
   */
  selectElementAt?(screenX: number, screenY: number): any;

  /**
   * Raycasts into the 3D scene from screen coordinates to select a node.
   */
  selectNodeAt(screenX: number, screenY: number): BSTNode | null;

  /** Modifies 3D model scale and rotation */
  updateTransform(
    scaleDelta?: number,
    rotationDelta?: { x: number; y: number; z: number }
  ): void;

  /** Step through visualization sequence */
  stepVisualization(forward: boolean): number;

  /** Resets placement and model transforms */
  resetAnchor(): void;

  /** Releases all WebGL, WebXR, and Three.js resources */
  disposeSession(): Promise<void>;

  /** Subscribes to AR state changes */
  onStateChange(callback: (state: ARSessionState) => void): () => void;
  onTrackingStateChange(callback: (state: ARTrackingState) => void): () => void;

  /** Returns performance timing and frame rate telemetry */
  getPerformanceTelemetry?(): ARPerformanceTelemetry;

  /** Returns camera framing and scene dimension diagnostics */
  getFramingDiagnostics?(): any;

  /** Returns authoritative WebXR spatial placement and physical transform diagnostics */
  getSpatialDiagnostics?(): ARSpatialDiagnostic | null;

  /** Recalculates bounding box and refits camera framing to active visualization */
  refitScene?(): boolean;
}
