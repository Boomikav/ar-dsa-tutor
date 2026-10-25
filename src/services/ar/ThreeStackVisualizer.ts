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
    const blockWidth = 0.14; // 14cm width
    const blockHeight = 0.04; // 4cm height per block
    const blockDepth = 0.09; // 9cm depth
    const spacing = 0.008; // 8mm gap
    const baseElevation = 0.03; // 3cm above surface

    // 1. Render Base Foundation Plate
    const baseGeo = new THREE.BoxGeometry(blockWidth + 0.04, 0.012, blockDepth + 0.04);
    this.disposables.push(baseGeo);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.8
    });
    this.disposables.push(baseMat);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, baseElevation, 0);
    this.visualGroup.add(baseMesh);

    // 2. Render Vertical Chute Guide Rails (indicating capacity)
    for (let slot = 0; slot < capacity; slot++) {
      const slotY = baseElevation + 0.02 + slot * (blockHeight + spacing) + blockHeight / 2;

      // Slot frame wireframe showing slots available
      const slotGeo = new THREE.BoxGeometry(blockWidth + 0.004, blockHeight, blockDepth + 0.004);
      this.disposables.push(slotGeo);
      const slotMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        wireframe: true,
        transparent: true,
        opacity: slot < items.length ? 0.15 : 0.35
      });
      this.disposables.push(slotMat);
      const slotMesh = new THREE.Mesh(slotGeo, slotMat);
      slotMesh.position.set(0, slotY, 0);
      this.visualGroup.add(slotMesh);

      // Slot index marker on the side
      const slotLabel = this.createIndexBillboard(`Slot ${slot}`);
      slotLabel.position.set(blockWidth / 2 + 0.04, slotY, 0);
      this.visualGroup.add(slotLabel);
    }

    // 3. Render Stack Elements
    for (let i = 0; i < items.length; i++) {
      const val = items[i];
      const isTop = i === items.length - 1;
      const y = baseElevation + 0.02 + i * (blockHeight + spacing) + blockHeight / 2;

      const geometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
      this.disposables.push(geometry);

      let baseColor = 0x0f172a;
      let emissiveColor = 0x0284c7;
      let emissiveIntensity = 0.35;

      if (isTop) {
        baseColor = 0x78350f;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.85;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.25,
        metalness: 0.7
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

      // 4. "TOP" Pointer Marker above the topmost element
      if (isTop) {
        const topMarker = this.createTopIndicator();
        topMarker.position.set(0, y + blockHeight / 2 + 0.035, 0);
        this.visualGroup.add(topMarker);
      }
    }

    // 5. Empty Stack message if items is 0
    if (items.length === 0) {
      const emptyMarker = this.createIndexBillboard('STACK EMPTY', '#ef4444');
      emptyMarker.position.set(0, baseElevation + 0.04, 0);
      this.visualGroup.add(emptyMarker);
    }
  }

  private createTextBillboard(text: string, isTop: boolean): THREE.Sprite {
    const spriteSize = 0.035;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isTop ? 0xf59e0b : 0x38bdf8, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 256, 96);
      ctx.font = 'bold 54px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = isTop ? '#fbbf24' : '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 48);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
    return sprite;
  }

  private createTopIndicator(): THREE.Sprite {
    const spriteSize = 0.03;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0xf59e0b, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 160, 64);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(8, 8, 144, 48, 8);
      ctx.fill();

      ctx.font = 'bold 28px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼ TOP', 80, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
    return sprite;
  }

  private createIndexBillboard(text: string, colorOverride?: string): THREE.Sprite {
    const spriteSize = 0.025;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0x64748b, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 160, 48);
      ctx.font = 'bold 24px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = colorOverride || '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 80, 24);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.8, spriteSize, 1);
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
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
    }
  }
}
