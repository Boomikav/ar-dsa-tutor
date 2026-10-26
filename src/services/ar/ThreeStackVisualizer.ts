import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { StackState } from '../dsa/stack/StackEngine';

export interface StackVisualizerOptions {
  highlightTop?: boolean;
}

export class ThreeStackVisualizer implements IARAlgorithmVisualizer<StackState, StackVisualizerOptions> {
  readonly id = 'ds-stack';
  readonly title = 'Stack';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly blockMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'stack-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'stack-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: StackState, _options?: StackVisualizerOptions): void {
    this.clear();

    const items = state.items || [];
    const capacity = state.capacity || 6;
    const blockWidth = 0.20; // 20cm width (bold, readable tabletop block)
    const blockHeight = 0.065; // 6.5cm height per block (volumetric, solid thickness)
    const blockDepth = 0.13; // 13cm depth
    const spacing = 0.010; // 10mm gap between elements
    const baseElevation = 0.10; // 10cm above surface to elevate bottom block above HUD horizon

    // 1. Render Foundation Pedestal Base
    const baseWidth = blockWidth + 0.06;
    const baseHeight = 0.016;
    const baseDepth = blockDepth + 0.05;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    this.disposables.push(baseGeo);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8
    });
    this.disposables.push(baseMat);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, baseElevation + baseHeight / 2, 0);
    this.visualGroup.add(baseMesh);

    // 2. Render 4 Corner Vertical Guide Rods (marking the physical 3D chamber)
    const totalChuteHeight = capacity * (blockHeight + spacing) + 0.02;
    const rodRadius = 0.005; // 10mm diameter solid metal rods
    const rodGeo = new THREE.CylinderGeometry(rodRadius, rodRadius, totalChuteHeight, 12);
    this.disposables.push(rodGeo);
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.85
    });
    this.disposables.push(rodMat);

    const cornerX = blockWidth / 2 + 0.006;
    const cornerZ = blockDepth / 2 + 0.006;
    const rodCenterY = baseElevation + baseHeight + totalChuteHeight / 2;

    const corners = [
      { x: -cornerX, z: -cornerZ },
      { x: cornerX, z: -cornerZ },
      { x: -cornerX, z: cornerZ },
      { x: cornerX, z: cornerZ }
    ];

    for (const c of corners) {
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(c.x, rodCenterY, c.z);
      this.visualGroup.add(rod);
    }

    // 3. Render Slot Trays and Capacity Slots
    const bottomY = baseElevation + baseHeight + 0.01;
    for (let slot = 0; slot < capacity; slot++) {
      const slotY = bottomY + slot * (blockHeight + spacing) + blockHeight / 2;
      const isOccupied = slot < items.length;

      // Slot tray indicator
      if (!isOccupied) {
        const slotGeo = new THREE.BoxGeometry(blockWidth + 0.004, blockHeight, blockDepth + 0.004);
        this.disposables.push(slotGeo);
        const slotMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          transparent: true,
          opacity: 0.20,
          roughness: 0.4,
          metalness: 0.3
        });
        this.disposables.push(slotMat);
        const slotMesh = new THREE.Mesh(slotGeo, slotMat);
        slotMesh.position.set(0, slotY, 0);
        this.visualGroup.add(slotMesh);
      }

      // Slot index marker on the side
      const slotLabel = this.createIndexBillboard(`Slot ${slot}`, isOccupied ? '#94a3b8' : '#475569');
      slotLabel.position.set(blockWidth / 2 + 0.045, slotY, 0);
      this.visualGroup.add(slotLabel);
    }

    // 4. Render Stack Elements
    for (let i = 0; i < items.length; i++) {
      const val = items[i];
      const isTop = i === items.length - 1;
      const y = bottomY + i * (blockHeight + spacing) + blockHeight / 2;

      const geometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
      this.disposables.push(geometry);

      let baseColor = 0x075985;
      let emissiveColor = 0x0284c7;
      let emissiveIntensity = 0.50;

      if (isTop) {
        baseColor = 0x92400e;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.95;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.20,
        metalness: 0.65
      });
      this.disposables.push(material);

      const blockMesh = new THREE.Mesh(geometry, material);
      blockMesh.position.set(0, y, 0);
      blockMesh.userData = { index: i, value: val, isTop };
      blockMesh.name = `stack-block-${i}-${val}`;
      this.blockMeshes.push(blockMesh);
      this.visualGroup.add(blockMesh);

      // Value label on front face of block
      const labelSprite = this.createTextBillboard(String(val), isTop);
      labelSprite.position.set(0, y, blockDepth / 2 + 0.005);
      this.visualGroup.add(labelSprite);

      // "TOP" Pointer Marker floating directly above the topmost element
      if (isTop) {
        const topMarker = this.createTopIndicator();
        topMarker.position.set(0, y + blockHeight / 2 + 0.038, 0);
        this.visualGroup.add(topMarker);
      }
    }

    // 5. Empty Stack message if items is 0
    if (items.length === 0) {
      const emptyMarker = this.createIndexBillboard('STACK EMPTY', '#ef4444');
      emptyMarker.position.set(0, bottomY + blockHeight, 0);
      this.visualGroup.add(emptyMarker);
    }
  }

  private createTextBillboard(text: string, isTop: boolean): THREE.Sprite {
    const spriteSize = 0.055;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isTop ? 0xf59e0b : 0x38bdf8, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 256, 128);
      ctx.font = 'bold 72px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = isTop ? '#fef08a' : '#e0f2fe';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 8;
      ctx.fillText(text, 128, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.2, spriteSize, 1);
    return sprite;
  }

  private createTopIndicator(): THREE.Sprite {
    const spriteSize = 0.032;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0xf59e0b, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 180, 70);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(6, 6, 168, 58, 10);
      ctx.fill();

      ctx.font = 'bold 30px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼ TOP', 90, 35);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.8, spriteSize, 1);
    return sprite;
  }

  private createIndexBillboard(text: string, colorOverride?: string): THREE.Sprite {
    const spriteSize = 0.026;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0x64748b, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 54;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 180, 54);
      ctx.font = 'bold 26px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = colorOverride || '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 90, 27);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 3.0, spriteSize, 1);
    return sprite;
  }

  public clear(): void {
    while (this.visualGroup.children.length > 0) {
      const child = this.visualGroup.children[0];
      this.visualGroup.remove(child);
    }
    this.blockMeshes.length = 0;
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
