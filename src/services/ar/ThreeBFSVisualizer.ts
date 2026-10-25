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

  // Deterministic 3D spatial layout for vertices (balanced, zero-overlap)
  // Dimensions stay within 45cm x 35cm
  private static readonly VERTEX_COORDINATES: Record<string, { x: number; y: number; z: number }> = {
    A: { x: 0.0, y: 0.22, z: 0.0 },
    B: { x: -0.16, y: 0.12, z: 0.0 },
    C: { x: 0.16, y: 0.12, z: 0.0 },
    D: { x: -0.22, y: 0.02, z: 0.0 },
    E: { x: -0.04, y: 0.02, z: 0.0 },
    F: { x: 0.18, y: 0.02, z: 0.0 }
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
    const nodeRadius = 0.038; // 3.8cm radius

    // 1. Render Edges first so nodes sit in front
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

    // 2. Render Vertices
    for (const v of vertices) {
      const pos = ThreeBFSVisualizer.VERTEX_COORDINATES[v] || { x: 0, y: 0, z: 0 };
      const isCurrent = current === v;
      const isInQueue = queue.includes(v);
      const isProcessed = traversalOrder.includes(v);
      const isDiscovered = visited.includes(v);

      const geometry = new THREE.SphereGeometry(nodeRadius, 24, 24);
      this.disposables.push(geometry);

      let baseColor = 0x1e293b;
      let emissiveColor = 0x475569;
      let emissiveIntensity = 0.2;

      if (isCurrent) {
        baseColor = 0x78350f;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.9;
      } else if (isProcessed) {
        baseColor = 0x064e3b;
        emissiveColor = 0x10b981;
        emissiveIntensity = 0.6;
      } else if (isInQueue) {
        baseColor = 0x0369a1;
        emissiveColor = 0x38bdf8;
        emissiveIntensity = 0.7;
      } else if (isDiscovered) {
        baseColor = 0x0f766e;
        emissiveColor = 0x14b8a6;
        emissiveIntensity = 0.4;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.2,
        metalness: 0.7
      });
      this.disposables.push(material);

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(pos.x, pos.y, pos.z);
      sphere.userData = { vertex: v, isCurrent, isInQueue, isProcessed };
      sphere.name = `bfs-vertex-${v}`;
      this.vertexMeshes.push(sphere);
      this.visualGroup.add(sphere);

      // Label sprite
      const labelSprite = this.createTextBillboard(v, isCurrent, isProcessed, isInQueue);
      labelSprite.position.set(pos.x, pos.y, pos.z + nodeRadius + 0.005);
      this.visualGroup.add(labelSprite);

      // Badge indicator above node (e.g. "CURRENT", "QUEUE[0]", etc.)
      if (isCurrent) {
        const currentBadge = this.createStatusBadge('CURRENT', '#f59e0b');
        currentBadge.position.set(pos.x, pos.y + nodeRadius + 0.03, pos.z);
        this.visualGroup.add(currentBadge);
      } else if (queue.length > 0 && queue[0] === v) {
        const nextBadge = this.createStatusBadge('FRONT', '#38bdf8');
        nextBadge.position.set(pos.x, pos.y + nodeRadius + 0.03, pos.z);
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

    const radius = isTraversed ? 0.005 : 0.003;
    const geometry = new THREE.CylinderGeometry(radius, radius, distance, 12);
    this.disposables.push(geometry);

    const material = new THREE.MeshStandardMaterial({
      color: isTraversed ? 0x10b981 : 0x475569,
      emissive: isTraversed ? 0x10b981 : 0x334155,
      emissiveIntensity: isTraversed ? 0.6 : 0.2,
      roughness: 0.4
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
    const spriteSize = 0.045;

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
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = 'bold 72px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
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
    const spriteSize = 0.025;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0x38bdf8, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 3, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 160, 48);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 40, 8);
      ctx.fill();

      ctx.font = 'bold 24px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 80, 24);
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
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
    }
  }
}
