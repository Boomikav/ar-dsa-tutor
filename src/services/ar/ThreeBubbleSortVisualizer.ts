import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { BubbleSortState } from '../dsa/sorting/BubbleSortEngine';

export interface BubbleSortVisualizerOptions {
  comparingIndices?: [number, number];
  isSwapping?: boolean;
}

export class ThreeBubbleSortVisualizer implements IARAlgorithmVisualizer<BubbleSortState, BubbleSortVisualizerOptions> {
  readonly id = 'algo-bubble-sort';
  readonly title = 'Bubble Sort';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly elementMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'bubble-sort-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'bubble-sort-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: BubbleSortState, _options?: BubbleSortVisualizerOptions): void {
    this.clear();

    const arr = state.array || [];
    if (arr.length === 0) return;

    const n = arr.length;
    const blockWidth = 0.055; // 5.5cm width per bar
    const blockDepth = 0.055; // 5.5cm depth
    const spacing = 0.025; // 2.5cm gap between bars
    const totalWidth = n * blockWidth + (n - 1) * spacing;
    const startX = -totalWidth / 2 + blockWidth / 2;
    const baseElevation = 0.04; // 4cm above surface

    const maxVal = Math.max(...arr, 1);
    const minHeight = 0.04;
    const maxHeight = 0.16;

    const j = state.j;
    const jCompare = j + 1;
    const sortedStartIndex = n - state.sortedSuffixCount;

    for (let idx = 0; idx < n; idx++) {
      const val = arr[idx];
      const normalizedHeight = minHeight + ((val / maxVal) * (maxHeight - minHeight));
      const x = startX + idx * (blockWidth + spacing);
      const y = baseElevation + normalizedHeight / 2;

      const isComparing = !state.isComplete && (idx === j || idx === jCompare);
      const isSortedSuffix = state.isComplete || idx >= sortedStartIndex;

      // 1. Bar geometry and material
      const geometry = new THREE.BoxGeometry(blockWidth, normalizedHeight, blockDepth);
      this.disposables.push(geometry);

      let baseColor = 0x1e293b;
      let emissiveColor = 0x0ea5e9;
      let emissiveIntensity = 0.25;

      if (state.isComplete) {
        baseColor = 0x064e3b;
        emissiveColor = 0x10b981;
        emissiveIntensity = 0.55;
      } else if (isComparing) {
        baseColor = 0x78350f;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.85;
      } else if (isSortedSuffix) {
        baseColor = 0x064e3b;
        emissiveColor = 0x10b981;
        emissiveIntensity = 0.5;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.25,
        metalness: 0.7
      });
      this.disposables.push(material);

      const barMesh = new THREE.Mesh(geometry, material);
      barMesh.castShadow = true;
      barMesh.receiveShadow = true;
      barMesh.position.set(x, y, 0);
      barMesh.userData = { index: idx, value: val };
      barMesh.name = `bubble-bar-${idx}-${val}`;
      this.elementMeshes.push(barMesh);
      this.visualGroup.add(barMesh);

      // 2. High-contrast value label above the bar
      const labelSprite = this.createTextBillboard(String(val), isComparing, isSortedSuffix);
      labelSprite.position.set(x, baseElevation + normalizedHeight + 0.035, 0);
      this.visualGroup.add(labelSprite);

      // 3. Index label below the bar
      const indexSprite = this.createSubscriptBillboard(`[${idx}]`, isComparing);
      indexSprite.position.set(x, baseElevation - 0.02, 0);
      this.visualGroup.add(indexSprite);
    }

    // 4. Comparison indicator bracket between j and j+1
    if (!state.isComplete && jCompare < n) {
      const xJ = startX + j * (blockWidth + spacing);
      const xNext = startX + jCompare * (blockWidth + spacing);
      const midX = (xJ + xNext) / 2;

      const bracketGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xJ, baseElevation - 0.035, 0),
        new THREE.Vector3(xJ, baseElevation - 0.045, 0),
        new THREE.Vector3(xNext, baseElevation - 0.045, 0),
        new THREE.Vector3(xNext, baseElevation - 0.035, 0)
      ]);
      this.disposables.push(bracketGeo);
      const bracketMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
      this.disposables.push(bracketMat);
      const bracketLine = new THREE.Line(bracketGeo, bracketMat);
      this.visualGroup.add(bracketLine);

      const vsSprite = this.createSubscriptBillboard('VS', true, '#f59e0b');
      vsSprite.position.set(midX, baseElevation - 0.06, 0);
      this.visualGroup.add(vsSprite);
    }
  }

  private createTextBillboard(text: string, isHighlighted: boolean, isSuccess: boolean): THREE.Sprite {
    const spriteSize = 0.055;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({
        color: isSuccess ? 0x10b981 : (isHighlighted ? 0xf59e0b : 0x38bdf8),
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
      ctx.fillStyle = isSuccess ? 'rgba(6, 78, 59, 0.95)' : (isHighlighted ? 'rgba(120, 53, 15, 0.95)' : 'rgba(15, 23, 42, 0.9)');
      ctx.beginPath();
      ctx.arc(128, 128, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSuccess ? '#10b981' : (isHighlighted ? '#f59e0b' : '#38bdf8');
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.font = 'bold 110px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 134);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize, spriteSize, 1);
    return sprite;
  }

  private createSubscriptBillboard(text: string, isHighlighted: boolean, colorOverride?: string): THREE.Sprite {
    const spriteSize = 0.035;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isHighlighted ? 0xf59e0b : 0x94a3b8, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 128, 64);
      ctx.font = 'bold 36px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = colorOverride || (isHighlighted ? '#f59e0b' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2, spriteSize, 1);
    return sprite;
  }

  public clear(): void {
    while (this.visualGroup.children.length > 0) {
      const child = this.visualGroup.children[0];
      this.visualGroup.remove(child);
    }
    this.elementMeshes.length = 0;
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
