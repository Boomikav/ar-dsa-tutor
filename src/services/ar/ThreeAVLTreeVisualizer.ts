/**
 * Three.js Spatial Visualizer for AVL Tree (Self-Balancing)
 * 
 * Renders hierarchical 3D balanced tree:
 * - Spheres with values (R = 0.045m, matching BST standard)
 * - Balance factor badges ([BF: 0, ±1] in cyan/emerald; [BF: ±2] in amber/rose)
 * - Connection cylinders between parent and child nodes
 * - Distinct highlight on imbalanced and rotating pivot nodes
 * - Base elevation >= 0.14m to clear mobile AR HUD horizon
 */

import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { AVLTreeState, AVLNode } from '../dsa/tree/AVLTreeEngine';

interface Node3DLayout {
  node: AVLNode;
  x: number;
  y: number;
  z: number;
}

export class ThreeAVLTreeVisualizer implements IARAlgorithmVisualizer<AVLTreeState> {
  readonly id = 'ds-avl-tree';
  readonly title = 'AVL Tree';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly nodeMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'avl-tree-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'avl-tree-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: AVLTreeState): void {
    this.clear();

    if (!state.root) return;

    const baseElevation = 0.14; // Leaf elevation >= 14cm
    const levelHeight = 0.09;   // 9cm height between tree levels
    const treeHeight = Math.max(state.treeHeight, 1);
    const rootY = baseElevation + (treeHeight - 1) * levelHeight;

    // 1. Compute 3D node coordinates
    const layoutMap = new Map<string, Node3DLayout>();
    this.computeLayout(state.root, 0, rootY, 0, 0.16, layoutMap);

    // 2. Render Edges (Cylinders)
    this.renderEdges(state.root, layoutMap);

    // 3. Render Nodes (Spheres + Value Sprite + Balance Factor Badge)
    for (const item of layoutMap.values()) {
      const { node, x, y, z } = item;
      const isImbalanced = node.value === state.imbalancedNodeValue;
      const isPivot = node.value === state.pivotNodeValue;
      const isActive = node.value === state.activeNodeValue;

      // Sphere geometry
      const sphereGeom = new THREE.SphereGeometry(0.045, 24, 24);
      this.disposables.push(sphereGeom);

      let nodeColor = 0x38bdf8; // Cyan default
      let emissive = 0x082f49;

      if (isImbalanced) {
        nodeColor = 0xf43f5e; // Rose for imbalanced node (|BF| > 1)
        emissive = 0x881337;
      } else if (isPivot) {
        nodeColor = 0xf59e0b; // Amber for rotation pivot
        emissive = 0x78350f;
      } else if (isActive) {
        nodeColor = 0x10b981; // Emerald for newly inserted/modified node
        emissive = 0x064e3b;
      }

      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive,
        roughness: 0.2,
        metalness: 0.2
      });
      this.disposables.push(sphereMat);

      const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
      sphereMesh.position.set(x, y, z);
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      sphereMesh.userData = { nodeValue: node.value, balanceFactor: node.balanceFactor };
      this.visualGroup.add(sphereMesh);
      this.nodeMeshes.push(sphereMesh);

      // Value label sprite
      const valueSprite = this.createValueSprite(String(node.value));
      valueSprite.position.set(x, y, z);
      this.visualGroup.add(valueSprite);

      // Balance factor pill sprite
      const bfText = `BF: ${node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}`;
      const bfSprite = this.createBalanceBadgeSprite(bfText, Math.abs(node.balanceFactor) > 1);
      bfSprite.position.set(x, y + 0.058, z);
      this.visualGroup.add(bfSprite);
    }
  }

  private computeLayout(
    node: AVLNode | null,
    x: number,
    y: number,
    z: number,
    horizontalSpread: number,
    map: Map<string, Node3DLayout>
  ): void {
    if (!node) return;

    map.set(node.id, { node, x, y, z });

    const nextY = y - 0.09;
    const nextSpread = horizontalSpread * 0.52;

    if (node.left) {
      this.computeLayout(node.left, x - horizontalSpread, nextY, z, nextSpread, map);
    }
    if (node.right) {
      this.computeLayout(node.right, x + horizontalSpread, nextY, z, nextSpread, map);
    }
  }

  private renderEdges(node: AVLNode | null, layoutMap: Map<string, Node3DLayout>): void {
    if (!node) return;

    const parentLayout = layoutMap.get(node.id);
    if (!parentLayout) return;

    const children = [node.left, node.right];
    for (const child of children) {
      if (child) {
        const childLayout = layoutMap.get(child.id);
        if (childLayout) {
          this.createEdgeCylinder(
            new THREE.Vector3(parentLayout.x, parentLayout.y, parentLayout.z),
            new THREE.Vector3(childLayout.x, childLayout.y, childLayout.z)
          );
          this.renderEdges(child, layoutMap);
        }
      }
    }
  }

  private createEdgeCylinder(start: THREE.Vector3, end: THREE.Vector3): void {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const radius = 0.007; // 7mm edge cylinder

    const geom = new THREE.CylinderGeometry(radius, radius, length, 12);
    this.disposables.push(geom);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.4,
      metalness: 0.1
    });
    this.disposables.push(mat);

    const cylinder = new THREE.Mesh(geom, mat);
    cylinder.position.copy(start).add(direction.clone().multiplyScalar(0.5));
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    cylinder.castShadow = true;
    this.visualGroup.add(cylinder);
  }

  private createValueSprite(text: string): THREE.Sprite {
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
      ctx.font = 'bold 64px "Inter", -apple-system, sans-serif';
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

  private createBalanceBadgeSprite(text: string, isImbalanced: boolean): THREE.Sprite {
    const spriteSize = 0.035;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isImbalanced ? 0xf43f5e : 0x10b981, transparent: true });
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
      // Pill container
      ctx.fillStyle = isImbalanced ? 'rgba(136, 19, 55, 0.95)' : 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(8, 8, 144, 48, 16);
      ctx.fill();

      ctx.strokeStyle = isImbalanced ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = 'bold 26px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = isImbalanced ? '#fecdd3' : '#38bdf8';
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

  public pickElement(raycaster: THREE.Raycaster): any {
    const intersects = raycaster.intersectObjects(this.nodeMeshes);
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
    this.nodeMeshes.length = 0;
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
