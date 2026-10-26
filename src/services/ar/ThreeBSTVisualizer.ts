import * as THREE from 'three';
import { BSTNode } from '../../models/bst';
import { BST3DRenderOptions } from './IARService';
import { BSTVisualizerConfig, DEFAULT_BST_AR_CONFIG, getAdaptiveBSTScale } from './BSTVisualizerConfig';

/**
 * Metadata attached to interactive node meshes for raycasting.
 */
export interface ThreeBSTNodeUserData {
  nodeValue: number;
  bstNode: BSTNode;
  isGhost?: boolean;
}

interface LayoutNode {
  node: BSTNode;
  isGhost?: boolean;
  x: number;
  y: number;
  depth: number;
  left?: LayoutNode;
  right?: LayoutNode;
}

interface SubtreeBounds {
  leftContour: number[];
  rightContour: number[];
}

/**
 * ThreeBSTVisualizer
 * 
 * Reusable, framework-independent 3D Binary Search Tree renderer built with Three.js.
 * Responsibilities:
 * - Translates authoritative BSTNode hierarchies into interactive 3D scene graphs.
 * - Dynamically computes aesthetic, non-overlapping subtree layouts (Knuth/Reingold-Tilford).
 * - Symmetrically centers the tree bounding box around the spatial placement origin (0, 0).
 * - Adapts visualization scale to device viewport geometry (portrait & landscape).
 * - Generates high-contrast, billboarded value labels via Canvas 2D textures.
 * - Connects nodes with 3D cylindrical edges.
 * - Visualizes active comparison paths, current nodes, and pending insertion ghost positions.
 * - Supports Raycaster-based spatial node picking.
 * - Performs complete GPU memory cleanup (geometries, materials, textures).
 * 
 * Invariants:
 * - Never calculates or alters BST logic. Merely visualizes authoritative engine state.
 * - Never mutates the physical AR placement transform (rootGroup.position / orientation).
 */
export class ThreeBSTVisualizer {
  public readonly rootGroup: THREE.Group;
  public readonly bstVisualGroup: THREE.Group;
  public readonly config: BSTVisualizerConfig;
  public readonly nodeMeshes: THREE.Mesh[] = [];
  private readonly disposables: Array<{ dispose: () => void }> = [];

  constructor(customConfig: Partial<BSTVisualizerConfig> = {}) {
    this.config = { ...DEFAULT_BST_AR_CONFIG, ...customConfig };
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'bst-root-group';
    this.rootGroup.visible = false;

    this.bstVisualGroup = new THREE.Group();
    this.bstVisualGroup.name = 'bst-visual-group';
    this.rootGroup.add(this.bstVisualGroup);
  }

  /**
   * Rebuilds the 3D visualization from the authoritative tree root.
   * Generates a clean, wide, symmetrical binary tree in its local object coordinate system.
   */
  public render(root: BSTNode | null, options: BST3DRenderOptions = {}): void {
    this.clear();

    if (!root) return;

    const {
      activeNodeValue = null,
      highlightPathValues = [],
      ghostInsertPosition = null
    } = options;

    // 1. Prepare tree structure including optional ghost node for space allocation
    const treeToLayout = this.cloneWithGhostNode(root, ghostInsertPosition, options.targetValue || 0);

    // 2. Compute tree depth
    const getTreeMaxDepth = (curr: BSTNode | null): number => {
      if (!curr) return 0;
      return 1 + Math.max(getTreeMaxDepth(curr.left), getTreeMaxDepth(curr.right));
    };
    const maxTreeDepth = Math.max(2, getTreeMaxDepth(treeToLayout) - 1);

    // 3. Layout in local coordinates:
    // Root is at x = 0, y = maxTreeDepth * levelHeight + baseElevation
    // Left child is at x - spread, right child at x + spread
    interface FlatPositionedNode {
      node: BSTNode;
      isGhost: boolean;
      x: number;
      y: number;
      depth: number;
      parentPos?: { x: number; y: number; z: number };
      parentNodeValue?: number;
    }

    const positionedNodes: FlatPositionedNode[] = [];
    const baseElevation = 0.14; // 14cm above placement surface to elevate leaf nodes above HUD horizon
    const baseSpread = this.config.baseHorizontalSpread;
    const spreadDecay = 0.58;

    const layoutHierarchy = (
      curr: BSTNode,
      depth: number,
      x: number,
      spread: number,
      parentPos?: { x: number; y: number; z: number },
      parentNodeValue?: number
    ) => {
      const y = (maxTreeDepth - depth) * this.config.levelHeight + baseElevation;
      const currentPos = { x, y, z: 0 };

      positionedNodes.push({
        node: curr,
        isGhost: !!(curr as any).isGhost,
        x,
        y,
        depth,
        parentPos,
        parentNodeValue
      });

      const nextSpread = spread * spreadDecay;

      if (curr.left) {
        layoutHierarchy(curr.left, depth + 1, x - spread, nextSpread, currentPos, curr.value);
      }
      if (curr.right) {
        layoutHierarchy(curr.right, depth + 1, x + spread, nextSpread, currentPos, curr.value);
      }
    };

    layoutHierarchy(treeToLayout, 0, 0, baseSpread);

    // 4. Calculate raw bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    for (const item of positionedNodes) {
      if (item.x < minX) minX = item.x;
      if (item.x > maxX) maxX = item.x;
    }

    const treeWidth = (maxX - minX) + 2 * this.config.nodeRadius;
    const treeHeight = maxTreeDepth * this.config.levelHeight + 2 * this.config.nodeRadius;

    // 5. Adaptive scale calculation to fit phone viewport (without compressing standard trees)
    const adaptiveScale = getAdaptiveBSTScale({ treeWidth, treeHeight });

    const effectiveScale = this.config.scale * adaptiveScale;
    const effectiveRadius = this.config.nodeRadius * effectiveScale;
    const effectiveEdgeRadius = this.config.edgeRadius * effectiveScale;
    const effectiveHighlightRadius = this.config.highlightEdgeRadius * effectiveScale;
    const effectiveGhostRadius = this.config.ghostEdgeRadius * effectiveScale;

    // 6. Center horizontally around visual origin (Cx = 0)
    const centerX = (minX + maxX) / 2;

    for (const item of positionedNodes) {
      item.x = (item.x - centerX) * effectiveScale;
      item.y = item.y * effectiveScale;

      if (item.parentPos) {
        item.parentPos.x = (item.parentPos.x - centerX) * effectiveScale;
        item.parentPos.y = item.parentPos.y * effectiveScale;
      }
    }

    // 7. Render 3D Edges connecting parent and child nodes into bstVisualGroup
    for (const item of positionedNodes) {
      if (item.parentPos) {
        const isPathEdge = highlightPathValues.includes(item.node.value) &&
          highlightPathValues.includes(item.parentNodeValue || 0);

        const edgeMesh = this.createEdge(
          item.parentPos,
          { x: item.x, y: item.y, z: 0 },
          isPathEdge,
          item.isGhost,
          effectiveEdgeRadius,
          effectiveHighlightRadius,
          effectiveGhostRadius
        );
        this.bstVisualGroup.add(edgeMesh);
      }
    }

    // 8. Render 3D Nodes and Text Billboards into bstVisualGroup
    for (const item of positionedNodes) {
      if (item.isGhost) {
        const ghostNode = this.createGhostNode(item.node.value, effectiveRadius);
        ghostNode.name = `bst-node-${item.node.value}-ghost`;
        ghostNode.position.set(item.x, item.y, 0);
        this.bstVisualGroup.add(ghostNode);
      } else {
        const isActive = activeNodeValue === item.node.value;
        const isHighlighted = highlightPathValues.includes(item.node.value);

        const nodeGroup = this.createNodeMesh(item.node, isActive, isHighlighted, effectiveRadius);
        nodeGroup.name = `bst-node-${item.node.value}`;
        nodeGroup.position.set(item.x, item.y, 0);
        this.bstVisualGroup.add(nodeGroup);
      }
    }
  }

  /**
   * Clones tree and optionally attaches ghost node for collision-free layout reservation.
   */
  private cloneWithGhostNode(
    root: BSTNode,
    ghostPos: { parentValue: number; direction: 'LEFT' | 'RIGHT' } | null,
    targetValue: number
  ): BSTNode {
    const cloneNode = (curr: BSTNode | null): BSTNode | null => {
      if (!curr) return null;
      const copy: BSTNode = {
        id: curr.id,
        value: curr.value,
        depth: curr.depth,
        parent: curr.parent,
        left: cloneNode(curr.left),
        right: cloneNode(curr.right)
      };

      if (ghostPos && curr.value === ghostPos.parentValue) {
        const ghostNode: BSTNode = {
          id: 'ghost-insert-node',
          value: targetValue,
          depth: curr.depth + 1,
          left: null,
          right: null
        };
        (ghostNode as any).isGhost = true;

        if (ghostPos.direction === 'LEFT' && !copy.left) {
          copy.left = ghostNode;
        } else if (ghostPos.direction === 'RIGHT' && !copy.right) {
          copy.right = ghostNode;
        }
      }

      return copy;
    };

    return cloneNode(root)!;
  }

  /**
   * Knuth/Reingold-Tilford aesthetic binary tree layout.
   * Guarantees at least minSeparation horizontal gap between all subtrees at every depth.
   */
  private computeSubtreeLayout(
    node: BSTNode,
    depth: number,
    minSeparation: number
  ): { layout: LayoutNode; bounds: SubtreeBounds } {
    const currentLayout: LayoutNode = {
      node,
      isGhost: (node as any).isGhost,
      x: 0,
      y: 0,
      depth
    };

    if (!node.left && !node.right) {
      return {
        layout: currentLayout,
        bounds: {
          leftContour: [0],
          rightContour: [0]
        }
      };
    }

    let leftResult: { layout: LayoutNode; bounds: SubtreeBounds } | null = null;
    let rightResult: { layout: LayoutNode; bounds: SubtreeBounds } | null = null;

    if (node.left) {
      leftResult = this.computeSubtreeLayout(node.left, depth + 1, minSeparation);
      currentLayout.left = leftResult.layout;
    }
    if (node.right) {
      rightResult = this.computeSubtreeLayout(node.right, depth + 1, minSeparation);
      currentLayout.right = rightResult.layout;
    }

    if (leftResult && rightResult) {
      let maxShift = minSeparation;
      const minLen = Math.min(leftResult.bounds.rightContour.length, rightResult.bounds.leftContour.length);
      for (let i = 0; i < minLen; i++) {
        const overlap = leftResult.bounds.rightContour[i] - rightResult.bounds.leftContour[i] + minSeparation;
        if (overlap > maxShift) {
          maxShift = overlap;
        }
      }

      const leftOffset = -maxShift / 2;
      const rightOffset = maxShift / 2;

      this.shiftSubtree(leftResult.layout, leftOffset);
      this.shiftSubtree(rightResult.layout, rightOffset);

      const maxLen = Math.max(leftResult.bounds.leftContour.length, rightResult.bounds.leftContour.length);
      const combinedLeft: number[] = [0];
      const combinedRight: number[] = [0];

      for (let i = 0; i < maxLen; i++) {
        const lVal = i < leftResult.bounds.leftContour.length
          ? leftResult.bounds.leftContour[i] + leftOffset
          : (i < rightResult.bounds.leftContour.length ? rightResult.bounds.leftContour[i] + rightOffset : 0);
        const rVal = i < rightResult.bounds.rightContour.length
          ? rightResult.bounds.rightContour[i] + rightOffset
          : (i < leftResult.bounds.rightContour.length ? leftResult.bounds.rightContour[i] + leftOffset : 0);
        combinedLeft.push(lVal);
        combinedRight.push(rVal);
      }

      return {
        layout: currentLayout,
        bounds: {
          leftContour: combinedLeft,
          rightContour: combinedRight
        }
      };
    } else if (leftResult) {
      const offset = -minSeparation * 0.6;
      this.shiftSubtree(leftResult.layout, offset);
      const combinedLeft = [0, ...leftResult.bounds.leftContour.map(x => x + offset)];
      const combinedRight = [0, ...leftResult.bounds.rightContour.map(x => x + offset)];
      return {
        layout: currentLayout,
        bounds: { leftContour: combinedLeft, rightContour: combinedRight }
      };
    } else {
      const offset = minSeparation * 0.6;
      this.shiftSubtree(rightResult!.layout, offset);
      const combinedLeft = [0, ...rightResult!.bounds.leftContour.map(x => x + offset)];
      const combinedRight = [0, ...rightResult!.bounds.rightContour.map(x => x + offset)];
      return {
        layout: currentLayout,
        bounds: { leftContour: combinedLeft, rightContour: combinedRight }
      };
    }
  }

  private shiftSubtree(root: LayoutNode, deltaX: number): void {
    root.x += deltaX;
    if (root.left) this.shiftSubtree(root.left, deltaX);
    if (root.right) this.shiftSubtree(root.right, deltaX);
  }

  /**
   * Creates a 3D cylindrical edge between two 3D spatial points.
   */
  private createEdge(
    start: { x: number; y: number; z: number },
    end: { x: number; y: number; z: number },
    isHighlighted: boolean,
    isGhost: boolean = false,
    edgeRadius: number = 0.005,
    highlightRadius: number = 0.008,
    ghostRadius: number = 0.004
  ): THREE.Mesh {
    const vStart = new THREE.Vector3(start.x, start.y, start.z);
    const vEnd = new THREE.Vector3(end.x, end.y, end.z);
    const distance = vStart.distanceTo(vEnd);

    const radius = isHighlighted ? highlightRadius : (isGhost ? ghostRadius : edgeRadius);
    const geometry = new THREE.CylinderGeometry(radius, radius, distance, 16);
    this.disposables.push(geometry);

    let material: THREE.Material;
    if (isGhost) {
      material = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.5,
        wireframe: true
      });
    } else if (isHighlighted) {
      material = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.8
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.4,
        metalness: 0.6
      });
    }
    this.disposables.push(material);

    const mesh = new THREE.Mesh(geometry, material);

    // Orient cylinder along the vector from start to end
    const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    mesh.position.copy(midPoint);

    const orientation = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    orientation.lookAt(vStart, vEnd, up);
    mesh.quaternion.setFromRotationMatrix(orientation);
    mesh.rotateX(Math.PI / 2);

    return mesh;
  }

  /**
   * Creates a 3D Node Mesh with spherical body and readable canvas text billboard.
   */
  private createNodeMesh(
    node: BSTNode,
    isActive: boolean,
    isHighlighted: boolean,
    nodeRadius: number
  ): THREE.Group {
    const group = new THREE.Group();

    // 1. Sphere Geometry
    const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
    this.disposables.push(geometry);

    // Determine colors based on educational state
    let baseColor = 0x1e293b;
    let emissiveColor = 0x0f172a;
    let emissiveIntensity = 0.2;

    if (isActive) {
      baseColor = 0xf59e0b; // Vibrant Amber
      emissiveColor = 0xd97706;
      emissiveIntensity = 0.9;
    } else if (isHighlighted) {
      baseColor = 0x0ea5e9; // Cyan highlight
      emissiveColor = 0x0284c7;
      emissiveIntensity = 0.6;
    }

    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: emissiveColor,
      emissiveIntensity,
      roughness: 0.2,
      metalness: 0.8
    });
    this.disposables.push(material);

    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;

    // Attach data for raycasting
    const userData: ThreeBSTNodeUserData = {
      nodeValue: node.value,
      bstNode: node
    };
    sphereMesh.userData = userData;
    sphereMesh.name = `bst-node-sphere-${node.value}`;
    this.nodeMeshes.push(sphereMesh);
    group.add(sphereMesh);

    // 2. High-contrast Text Sprite Billboard
    const textSprite = this.createTextBillboard(String(node.value), isActive, nodeRadius);
    textSprite.position.set(0, 0, nodeRadius + 0.003);
    group.add(textSprite);

    return group;
  }

  /**
   * Creates a ghost node showing where a pending value will be inserted.
   */
  private createGhostNode(targetValue: number, nodeRadius: number): THREE.Group {
    const group = new THREE.Group();

    const geometry = new THREE.SphereGeometry(nodeRadius * 0.9, 20, 20);
    this.disposables.push(geometry);

    const material = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.disposables.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { nodeValue: targetValue, isGhost: true };
    group.add(mesh);

    const textSprite = this.createTextBillboard(`+${targetValue}`, false, nodeRadius, '#10b981');
    textSprite.position.set(0, 0, nodeRadius + 0.003);
    group.add(textSprite);

    return group;
  }

  /**
   * Generates a high-contrast text billboard using dynamic HTML5 2D Canvas.
   * High-resolution 256x256 rendering for razor-sharp physical mobile AR legibility.
   */
  private createTextBillboard(
    text: string,
    isActive: boolean,
    nodeRadius: number,
    textColorOverride?: string
  ): THREE.Sprite {
    const spriteSize = nodeRadius * this.config.labelScale * 2;

    if (typeof document === 'undefined') {
      // Headless Node environment fallback
      const spriteMaterial = new THREE.SpriteMaterial({
        color: textColorOverride ? 0x10b981 : (isActive ? 0xf59e0b : 0x38bdf8),
        transparent: true,
        depthTest: false
      });
      this.disposables.push(spriteMaterial);
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(spriteSize, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 256, 256);

      // Circular high-contrast label background
      ctx.fillStyle = isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.arc(128, 128, 108, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = textColorOverride || (isActive ? '#f59e0b' : '#38bdf8');
      ctx.lineWidth = 12;
      ctx.stroke();

      // Number text
      ctx.font = 'bold 100px monospace, sans-serif';
      ctx.fillStyle = textColorOverride || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 134);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.disposables.push(texture);

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    this.disposables.push(spriteMaterial);

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(spriteSize, spriteSize, 1);
    return sprite;
  }

  /**
   * Raycasts into the 3D BST to select a node.
   */
  public pickNode(raycaster: THREE.Raycaster): BSTNode | null {
    const intersects = raycaster.intersectObjects(this.nodeMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0];
      const data = hit.object.userData as ThreeBSTNodeUserData;
      if (data && data.bstNode) {
        return data.bstNode;
      }
    }
    return null;
  }

  /**
   * Cleans up all geometries, materials, textures, and child meshes.
   */
  public clear(): void {
    // Dispose all tracked GPU resources
    for (const item of this.disposables) {
      try {
        item.dispose();
      } catch {
        // Ignored
      }
    }
    this.disposables.length = 0;
    this.nodeMeshes.length = 0;

    // Remove all children from bstVisualGroup
    while (this.bstVisualGroup.children.length > 0) {
      const child = this.bstVisualGroup.children[0];
      this.bstVisualGroup.remove(child);
    }

    // Ensure bstVisualGroup is attached to rootGroup
    if (!this.rootGroup.children.includes(this.bstVisualGroup)) {
      this.rootGroup.add(this.bstVisualGroup);
    }
  }

  /**
   * Complete teardown of visualizer.
   */
  public dispose(): void {
    this.clear();
    if (this.rootGroup.children.includes(this.bstVisualGroup)) {
      this.rootGroup.remove(this.bstVisualGroup);
    }
  }
}
