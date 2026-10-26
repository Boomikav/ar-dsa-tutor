import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { BFSState } from '../dsa/graphAlgorithms/BFSEngine';

export interface BFSVisualizerOptions {
  highlightedEdges?: Array<[string, string]>;
}

export class ThreeBFSVisualizer implements IARAlgorithmVisualizer<BFSState, BFSVisualizerOptions> {
  readonly id = 'algo-breadth-first-search';
  readonly title = 'Breadth-First Search';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly vertexMeshes: THREE.Mesh[] = [];

  /**
   * Deterministic 3D spatial layout for breadth-first search graph traversal.
   * Hierarchical level-by-level layout:
   * Level 0: Vertex A (top apex, root)
   * Level 1: Vertices B, C (first frontier level)
   * Level 2: Vertices D, E, F (second frontier level with cross edge E-F)
   *
   * Form-factor: 37cm width x 33cm height x 10cm depth (aspect ~1.12),
   * providing optimal visual occupancy on both portrait mobile and landscape desktop.
   */
  public static readonly VERTEX_COORDINATES: Record<string, { x: number; y: number; z: number }> = {
    A: { x: 0.00, y: 0.44, z: -0.03 },
    B: { x: -0.19, y: 0.28, z: 0.03 },
    C: { x: 0.19, y: 0.28, z: 0.03 },
    D: { x: -0.23, y: 0.14, z: -0.02 },
    E: { x: -0.04, y: 0.13, z: 0.04 },
    F: { x: 0.22, y: 0.14, z: -0.01 }
  };

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'bfs-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'bfs-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: BFSState, _options?: BFSVisualizerOptions): void {
    this.clear();

    const vertices = state.vertices || ['A', 'B', 'C', 'D', 'E', 'F'];
    const current = state.currentVertex;
    const queue = state.queue || [];
    const visited = state.visited || [];
    const traversalOrder = state.traversalOrder || [];
    const nodeRadius = 0.045; // 4.5cm radius (9.0cm diameter, matching BST sphere presence)

    // 1. Render Edges first so spheres sit in front
    const renderedEdges = new Set<string>();
    const adj = state.adjacencyList || {};

    for (const u of vertices) {
      const neighbors = adj[u] || [];
      const posU = ThreeBFSVisualizer.VERTEX_COORDINATES[u] || { x: 0, y: 0, z: 0 };

      for (const v of neighbors) {
        const edgeKey = [u, v].sort().join('-');
        if (renderedEdges.has(edgeKey)) continue;
        renderedEdges.add(edgeKey);

        const posV = ThreeBFSVisualizer.VERTEX_COORDINATES[v] || { x: 0, y: 0, z: 0 };
        const isTraversedEdge = traversalOrder.includes(u) && traversalOrder.includes(v);

        this.createEdge(posU, posV, isTraversedEdge);
      }
    }

    // 2. Render Vertices with prominent 3D sphere geometries and state materials
    for (const v of vertices) {
      const pos = ThreeBFSVisualizer.VERTEX_COORDINATES[v] || { x: 0, y: 0, z: 0 };
      const isCurrent = current === v;
      const isInQueue = queue.includes(v);
      const isProcessed = traversalOrder.includes(v);
      const isDiscovered = visited.includes(v);

      const geometry = new THREE.SphereGeometry(nodeRadius, 28, 28);
      this.disposables.push(geometry);

      let baseColor = 0x1e293b;
      let emissiveColor = 0x334155;
      let emissiveIntensity = 0.25;

      if (isCurrent) {
        baseColor = 0x78350f;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.95;
      } else if (isProcessed) {
        baseColor = 0x064e3b;
        emissiveColor = 0x10b981;
        emissiveIntensity = 0.70;
      } else if (isInQueue) {
        baseColor = 0x075985;
        emissiveColor = 0x38bdf8;
        emissiveIntensity = 0.85;
      } else if (isDiscovered) {
        baseColor = 0x0f766e;
        emissiveColor = 0x14b8a6;
        emissiveIntensity = 0.45;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.25,
        metalness: 0.65
      });
      this.disposables.push(material);

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(pos.x, pos.y, pos.z);
      sphere.userData = { vertex: v, isCurrent, isInQueue, isProcessed };
      sphere.name = `bfs-vertex-${v}`;
      this.vertexMeshes.push(sphere);
      this.visualGroup.add(sphere);

      // Label sprite positioned at front face of node
      const labelSprite = this.createTextBillboard(v, isCurrent, isProcessed, isInQueue);
      labelSprite.position.set(pos.x, pos.y, pos.z + nodeRadius + 0.005);
      this.visualGroup.add(labelSprite);

      // Status badge floating above node
      if (isCurrent) {
        const currentBadge = this.createStatusBadge('CURRENT', '#f59e0b');
        currentBadge.position.set(pos.x, pos.y + nodeRadius + 0.028, pos.z);
        this.visualGroup.add(currentBadge);
      } else if (queue.length > 0 && queue[0] === v) {
        const nextBadge = this.createStatusBadge('FRONT', '#38bdf8');
        nextBadge.position.set(pos.x, pos.y + nodeRadius + 0.028, pos.z);
        this.visualGroup.add(nextBadge);
      }
    }
  }

  private createEdge(
    posA: { x: number; y: number; z: number },
    posB: { x: number; y: number; z: number },
    isTraversed: boolean
  ): void {
    const vA = new THREE.Vector3(posA.x, posA.y, posA.z);
    const vB = new THREE.Vector3(posB.x, posB.y, posB.z);
    const distance = vA.distanceTo(vB);
    const direction = new THREE.Vector3().subVectors(vB, vA).normalize();
    const midPoint = new THREE.Vector3().addVectors(vA, vB).multiplyScalar(0.5);

    // Prominent 3D cylinders (12mm - 16mm diameter) for solid visibility
    const radius = isTraversed ? 0.008 : 0.006;
    const geometry = new THREE.CylinderGeometry(radius, radius, distance, 14);
    this.disposables.push(geometry);

    const material = new THREE.MeshStandardMaterial({
      color: isTraversed ? 0x10b981 : 0x64748b,
      emissive: isTraversed ? 0x10b981 : 0x334155,
      emissiveIntensity: isTraversed ? 0.65 : 0.25,
      roughness: 0.35,
      metalness: 0.6
    });
    this.disposables.push(material);

    const edgeMesh = new THREE.Mesh(geometry, material);
    edgeMesh.position.copy(midPoint);

    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    edgeMesh.quaternion.copy(quaternion);

    this.visualGroup.add(edgeMesh);
  }

  private createTextBillboard(text: string, isCurrent: boolean, isProcessed: boolean, isInQueue: boolean): THREE.Sprite {
    const spriteSize = 0.058;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({
        color: isCurrent ? 0xf59e0b : (isProcessed ? 0x10b981 : (isInQueue ? 0x38bdf8 : 0xffffff)),
        transparent: true,
        depthTest: false
      });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 256, 256);
      ctx.font = 'bold 140px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Subtle shadow for legibility against bright backgrounds
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(text, 128, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize, spriteSize, 1);
    return sprite;
  }

  private createStatusBadge(text: string, color: string): THREE.Sprite {
    const spriteSize = 0.026;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0x38bdf8, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 3, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 200, 60);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(4, 4, 192, 52, 10);
      ctx.fill();

      ctx.font = 'bold 30px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 100, 30);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 3.3, spriteSize, 1);
    return sprite;
  }

  public pickElement(raycaster: THREE.Raycaster): string | null {
    const intersects = raycaster.intersectObjects(this.vertexMeshes, false);
    if (intersects.length > 0) {
      return (intersects[0].object.userData as any).vertex || null;
    }
    return null;
  }

  public clear(): void {
    while (this.visualGroup.children.length > 0) {
      const child = this.visualGroup.children[0];
      this.visualGroup.remove(child);
    }
    this.vertexMeshes.length = 0;
    for (const item of this.disposables) {
      try {
        item.dispose();
      } catch {
        // Ignored
      }
    }
    this.disposables.length = 0;
  }

  public dispose(): void {
    this.clear();
    if (this.visualGroup.parent) {
      this.visualGroup.parent.remove(this.visualGroup);
    }
  }
}
