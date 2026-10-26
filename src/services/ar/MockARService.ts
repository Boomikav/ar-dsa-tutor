import { 
  IARService, 
  ARSessionState, 
  ARTrackingState, 
  ARCapabilities, 
  ARSpatialAnchor, 
  ARSessionConfig, 
  BST3DRenderOptions 
} from './IARService';
import { BSTNode } from '../../models/bst';
import { DSATopic, VisualAssetSpec } from '../../models/topic';

/**
 * Mock AR Service Implementation for Testing and Simulation Environments.
 * Adheres strictly to the IARService contract and deterministic state machine.
 */
export class MockARService implements IARService {
  readonly isMock = true;
  private _sessionState: ARSessionState = 'UNAVAILABLE';
  private _stateListeners: Array<(state: ARSessionState) => void> = [];
  private _trackingListeners: Array<(state: ARTrackingState) => void> = [];
  private _currentStep = 0;
  private _activeTree: BSTNode | null = null;
  private _scale = 1.0;

  get sessionState(): ARSessionState {
    return this._sessionState;
  }

  get trackingState(): ARTrackingState {
    switch (this._sessionState) {
      case 'UNAVAILABLE': return 'unsupported';
      case 'INITIALIZING': return 'initializing';
      case 'SCANNING':
      case 'SURFACE_DETECTED':
      case 'PLACEMENT_READY': return 'detecting_surface';
      case 'PLACED':
      case 'TRACKING': return 'surface_placed';
      case 'PAUSED': return 'paused';
      default: return 'unsupported';
    }
  }

  get isObjectPlaced(): boolean {
    return this._sessionState === 'PLACED' || this._sessionState === 'TRACKING' || this._sessionState === 'UNAVAILABLE';
  }

  private setSessionState(newState: ARSessionState): void {
    this._sessionState = newState;
    this._stateListeners.forEach(cb => cb(this._sessionState));
    const legacy = this.trackingState;
    this._trackingListeners.forEach(cb => cb(legacy));
  }

  async checkCapabilities(): Promise<ARCapabilities> {
    return {
      webXRAvailable: false,
      immersiveARSupported: false,
      hitTestSupported: false,
      domOverlaySupported: false,
      cameraAccessGranted: false,
      lightingEstimationSupported: false,
      depthSensingSupported: false,
      referenceSpaceType: 'none',
      runtimeEnvironment: 'CANVAS_3D_FALLBACK'
    };
  }

  async isARSupported(): Promise<boolean> {
    return false;
  }

  async initializeSession(
    _canvasElement: HTMLCanvasElement | null,
    _domOverlayElement?: HTMLElement | null,
    _config?: ARSessionConfig
  ): Promise<boolean> {
    this.setSessionState('UNAVAILABLE');
    return true;
  }

  async startARSession(_domOverlayElement?: HTMLElement | null): Promise<boolean> {
    this.setSessionState('INITIALIZING');
    this.setSessionState('SCANNING');
    return true;
  }

  async endARSession(): Promise<void> {
    this.setSessionState('ENDED');
  }

  placeObject(): boolean {
    this.setSessionState('PLACED');
    this.setSessionState('TRACKING');
    return true;
  }

  resetPlacement(): void {
    this.setSessionState('SCANNING');
  }

  renderBST(root: BSTNode | null, _options?: BST3DRenderOptions): void {
    this._activeTree = root;
  }

  setActiveAlgorithm(_algorithmId: string): void {
    // Mock algorithm switch
  }

  renderBubbleSort(_state: any, _options?: any): void {
    // Mock Bubble Sort
  }

  renderBinarySearch(_state: any, _options?: any): void {
    // Mock Binary Search
  }

  renderBFS(_state: any, _options?: any): void {
    // Mock BFS
  }

  renderStack(_state: any, _options?: any): void {
    // Mock Stack
  }

  selectElementAt(_screenX: number, _screenY: number): any {
    return null;
  }

  selectNodeAt(_screenX: number, _screenY: number): BSTNode | null {
    return this._activeTree;
  }

  async anchorDataStructure(
    topic: DSATopic,
    spec: VisualAssetSpec
  ): Promise<ARSpatialAnchor> {
    this.placeObject();
    return {
      id: `anchor-${topic.id}-${Date.now()}`,
      position: { x: 0, y: 0, z: -(spec.defaultCameraDistance || 1.5) },
      rotation: { x: 0, y: 0, z: 0 },
      scale: this._scale,
      timestamp: new Date().toISOString()
    };
  }

  updateTransform(
    scaleDelta?: number,
    _rotationDelta?: { x: number; y: number; z: number }
  ): void {
    if (scaleDelta) {
      this._scale = Math.max(0.2, Math.min(3.0, this._scale + scaleDelta));
    }
  }

  stepVisualization(forward: boolean): number {
    this._currentStep = forward ? this._currentStep + 1 : Math.max(0, this._currentStep - 1);
    return this._currentStep;
  }

  resetAnchor(): void {
    this.resetPlacement();
  }

  async disposeSession(): Promise<void> {
    this._sessionState = 'ENDED';
    this._stateListeners = [];
    this._trackingListeners = [];
  }

  onStateChange(callback: (state: ARSessionState) => void): () => void {
    this._stateListeners.push(callback);
    callback(this._sessionState);
    return () => {
      this._stateListeners = this._stateListeners.filter(cb => cb !== callback);
    };
  }

  onTrackingStateChange(callback: (state: ARTrackingState) => void): () => void {
    this._trackingListeners.push(callback);
    callback(this.trackingState);
    return () => {
      this._trackingListeners = this._trackingListeners.filter(cb => cb !== callback);
    };
  }

  getPerformanceTelemetry() {
    return {
      sessionStartupMs: 120,
      surfaceDetectionLatencyMs: 350,
      placementLatencyMs: 400,
      approximateFPS: 60,
      sessionDurationSeconds: 15
    };
  }

  getFramingDiagnostics() {
    return {
      activeAlgorithm: 'ds-binary-search-tree',
      renderingMode: 'CANVAS_3D_FALLBACK' as const,
      viewportWidth: 1280,
      viewportHeight: 800,
      aspectRatio: 1.6,
      fovDegrees: 60,
      cameraDistance: 0.85,
      cameraPosition: [0, 0.40, 0.81] as [number, number, number],
      targetPosition: [0, 0.15, 0] as [number, number, number],
      modelBounds: {
        min: [-0.25, 0.0, -0.05] as [number, number, number],
        max: [0.25, 0.30, 0.05] as [number, number, number],
        size: [0.50, 0.30, 0.10] as [number, number, number],
        center: [0, 0.15, 0] as [number, number, number]
      },
      fitSuccess: true,
      timestamp: Date.now()
    };
  }

  refitScene(): boolean {
    return true;
  }
}
