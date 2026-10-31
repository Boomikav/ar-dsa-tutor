/**
 * Three.js Spatial Visualizer for Dijkstra's Shortest Path Algorithm
 * 
 * Renders 3D weighted graph with:
 * - Spheres for vertices (R = 0.045m) with tentative distance labels
 * - 3D edge cylinders with weight text badges
 * - Visual states for visited (settled) vs unvisited vertices
 * - Active relaxation edge pulse
 * - Final shortest path highlight from source to destination
 * - Calibrated tabletop bounds (width ~0.54m, height ~0.44m, base elevation >= 0.12m)
 */

import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { DijkstraState } from '../dsa/graphAlgorithms/DijkstraEngine';

export class ThreeDijkstraVisualizer implements IARAlgorithmVisualizer<DijkstraState> {
  readonly id = 'algo-dijkstras-algorithm';
  readonly title = "Dijkstra's Shortest Path";

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly vertexMeshes: THREE.Mesh[] = [];

  // Calibrated spatial coordinates for the 6 vertices
  private readonly vertexPositions: Record<string, THREE.Vector3> = {
    A: new THREE.Vector3(-0.22, 0.36, 0.0),
    B: new THREE.Vector3(-0.08, 0.42, 0.06),
    C: new THREE.Vector3(-0.10, 0.22, -0.05),
    D: new THREE.Vector3(0.10, 0.40, 0.04),
    E: new THREE.Vector3(0.22, 0.25, 0.0),
    F: new THREE.Vector3(0.06, 0.16, -0.06)
  };

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'dijkstra-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'dijkstra-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: DijkstraState): void {
    this.clear();

    const vertices = state.vertices || [];
    if (vertices.length === 0) return;

    const visited = state.visited || [];
    const distances = state.distances || {};
    const shortestPath = state.shortestPath || [];
    const activeRelaxed = state.activeRelaxedEdge;

    // Check if an edge is on the reconstructed shortest path
    const isEdgeOnShortestPath = (u: string, v: string): boolean => {
      if (shortestPath.length < 2) return false;
      for (let i = 0; i < shortestPath.length - 1; i++) {
        if (
          (shortestPath[i] === u && shortestPath[i + 1] === v) ||
          (shortestPath[i] === v && shortestPath[i + 1] === u)
        ) {
          return true;
        }
      }
      return false;
    };

    // 1. Render Weighted Edges
    const drawnEdges = new Set<string>();
    for (const u of vertices) {
      const neighbors = state.edges[u] || [];
      const posU = this.vertexPositions[u] || new THREE.Vector3(0, 0.2, 0);

      for (const edge of neighbors) {
        const v = edge.to;
        const edgeKey = [u, v].sort().join('-');
        if (drawnEdges.has(edgeKey)) continue;
        drawnEdges.add(edgeKey);

        const posV = this.vertexPositions[v] || new THREE.Vector3(0, 0.2, 0);
        const onPath = isEdgeOnShortestPath(u, v);
        const isRelaxing = activeRelaxed && ((activeRelaxed.from === u && activeRelaxed.to === v) || (activeRelaxed.from === v && activeRelaxed.to === u));

        this.renderEdge(posU, posV, edge.weight, onPath, Boolean(isRelaxing));
      }
    }

    // 2. Render Vertices (Spheres + Name + Distance Badge)
    for (const v of vertices) {
      const pos = this.vertexPositions[v] || new THREE.Vector3(0, 0.2, 0);
      const isSettled = visited.includes(v);
      const isCurrent = state.currentVertex === v;
      const isSource = state.source === v;
      const isDestination = state.destination === v;
      const onPath = shortestPath.includes(v);

      const sphereGeom = new THREE.SphereGeometry(0.045, 24, 24);
      this.disposables.push(sphereGeom);

      let vertexColor = 0x38bdf8; // Cyan default
      let emissive = 0x082f49;

      if (onPath) {
        vertexColor = 0x10b981; // Emerald on final shortest path
        emissive = 0x064e3b;
      } else if (isCurrent) {
        vertexColor = 0xf59e0b; // Amber for active minimum node
        emissive = 0x78350f;
      } else if (isSettled) {
        vertexColor = 0x0284c7; // Settled blue
        emissive = 0x0c4a6e;
      } else if (isDestination) {
        vertexColor = 0xa855f7; // Purple for target destination
        emissive = 0x581c87;
      }

      const sphereMat = new THREE.MeshStandardMaterial({
        color: vertexColor,
        emissive,
        roughness: 0.25,
        metalness: 0.2
      });
      this.disposables.push(sphereMat);

      const mesh = new THREE.Mesh(sphereGeom, sphereMat);
      mesh.position.copy(pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { vertex: v, distance: distances[v] };
      this.visualGroup.add(mesh);
      this.vertexMeshes.push(mesh);

      // Vertex name sprite (center)
      const nameSprite = this.createVertexNameSprite(v);
      nameSprite.position.copy(pos);
      this.visualGroup.add(nameSprite);

      // Tentative distance pill sprite (above vertex)
      const distVal = distances[v];
      const distText = distVal === Infinity ? 'd: ∞' : `d: ${distVal}`;
      const distSprite = this.createDistanceBadgeSprite(distText, isSettled, isCurrent);
      distSprite.position.set(pos.x, pos.y + 0.058, pos.z);
      this.visualGroup.add(distSprite);
    }
  }

  private renderEdge(
    start: THREE.Vector3,
    end: THREE.Vector3,
    weight: number,
    onPath: boolean,
    isRelaxing: boolean
  ): void {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const radius = onPath ? 0.012 : (isRelaxing ? 0.010 : 0.006);

    const geom = new THREE.CylinderGeometry(radius, radius, length, 12);
    this.disposables.push(geom);

    let color = 0x64748b;
    let emissive = 0x0f172a;

    if (onPath) {
      color = 0x10b981; // Green shortest path
      emissive = 0x064e3b;
    } else if (isRelaxing) {
      color = 0xf59e0b; // Amber relaxing
      emissive = 0x78350f;
    }

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive,
      roughness: 0.3,
      metalness: 0.1
    });
    this.disposables.push(mat);

    const cylinder = new THREE.Mesh(geom, mat);
    const midPoint = start.clone().add(direction.clone().multiplyScalar(0.5));
    cylinder.position.copy(midPoint);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    cylinder.castShadow = true;
    this.visualGroup.add(cylinder);

    // Edge weight sprite at midpoint
    const weightSprite = this.createWeightBadgeSprite(String(weight), onPath);
    weightSprite.position.copy(midPoint).add(new THREE.Vector3(0, 0.025, 0));
    this.visualGroup.add(weightSprite);
  }

  private createVertexNameSprite(name: string): THREE.Sprite {
    const spriteSize = 0.07;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true });
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
      ctx.font = 'bold 70px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize, spriteSize, 1);
    return sprite;
  }

  private createDistanceBadgeSprite(text: string, isSettled: boolean, isCurrent: boolean): THREE.Sprite {
    const spriteSize = 0.035;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isCurrent ? 0xf59e0b : 0x38bdf8, transparent: true });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2.2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 160, 64);
      ctx.fillStyle = isCurrent ? 'rgba(120, 53, 15, 0.95)' : (isSettled ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)');
      ctx.beginPath();
      ctx.roundRect(8, 8, 144, 48, 14);
      ctx.fill();

      ctx.strokeStyle = isCurrent ? '#f59e0b' : (isSettled ? '#10b981' : '#38bdf8');
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = 'bold 28px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 80, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
    return sprite;
  }

  private createWeightBadgeSprite(text: string, onPath: boolean): THREE.Sprite {
    const spriteSize = 0.028;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: onPath ? 0x10b981 : 0x94a3b8, transparent: true });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 1.5, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 96, 64);
      ctx.fillStyle = onPath ? 'rgba(6, 78, 59, 0.95)' : 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(4, 8, 88, 48, 12);
      ctx.fill();

      ctx.strokeStyle = onPath ? '#10b981' : '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 30px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = onPath ? '#34d399' : '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 48, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 1.6, spriteSize, 1);
    return sprite;
  }

  public pickElement(raycaster: THREE.Raycaster): any {
    const intersects = raycaster.intersectObjects(this.vertexMeshes);
    if (intersects.length > 0) {
      return intersects[0].object.userData;
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
