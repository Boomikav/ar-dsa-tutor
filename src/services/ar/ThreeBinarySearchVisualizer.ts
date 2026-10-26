import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { BinarySearchState } from '../dsa/searching/BinarySearchEngine';

export interface BinarySearchVisualizerOptions {
  highlightMid?: boolean;
}

export class ThreeBinarySearchVisualizer implements IARAlgorithmVisualizer<BinarySearchState, BinarySearchVisualizerOptions> {
  readonly id = 'algo-binary-search';
  readonly title = 'Binary Search';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly elementMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'binary-search-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'binary-search-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: BinarySearchState, _options?: BinarySearchVisualizerOptions): void {
    this.clear();

    const arr = state.array || [];
    if (arr.length === 0) return;

    const n = arr.length;
    const blockSize = 0.055; // 5.5cm cube block
    const spacing = 0.02; // 2cm spacing
    const totalWidth = n * blockSize + (n - 1) * spacing;
    const startX = -totalWidth / 2 + blockSize / 2;
    const baseElevation = 0.06;

    const low = state.low;
    const high = state.high;
    const mid = state.mid;
    const isFound = state.isFound;

    for (let idx = 0; idx < n; idx++) {
      const val = arr[idx];
      const isWithinRange = idx >= low && idx <= high;
      const isMid = idx === mid;
      const isMatch = isFound && isMid;

      // Dim and recess eliminated elements outside the current search range [low .. high]
      const y = isWithinRange ? baseElevation : baseElevation - 0.015;
      const x = startX + idx * (blockSize + spacing);

      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
      this.disposables.push(geometry);

      let baseColor = 0x1e293b;
      let emissiveColor = 0x0ea5e9;
      let emissiveIntensity = 0.2;
      let opacity = 1.0;
      let transparent = false;

      if (isMatch) {
        baseColor = 0x064e3b;
        emissiveColor = 0x10b981;
        emissiveIntensity = 0.7;
      } else if (isMid) {
        baseColor = 0x78350f;
        emissiveColor = 0xf59e0b;
        emissiveIntensity = 0.75;
      } else if (isWithinRange) {
        baseColor = 0x0f172a;
        emissiveColor = 0x38bdf8;
        emissiveIntensity = 0.35;
      } else {
        // Eliminated partition
        baseColor = 0x0f172a;
        emissiveColor = 0x334155;
        emissiveIntensity = 0.05;
        opacity = 0.35;
        transparent = true;
      }

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.3,
        metalness: 0.6,
        transparent,
        opacity
      });
      this.disposables.push(material);

      const blockMesh = new THREE.Mesh(geometry, material);
      blockMesh.position.set(x, y, 0);
      blockMesh.userData = { index: idx, value: val };
      blockMesh.name = `binary-search-block-${idx}-${val}`;
      this.elementMeshes.push(blockMesh);
      this.visualGroup.add(blockMesh);

      // High-contrast value sprite
      const labelSprite = this.createTextBillboard(String(val), isMid, isMatch, !isWithinRange);
      labelSprite.position.set(x, y, blockSize / 2 + 0.005);
      this.visualGroup.add(labelSprite);

      // Index label
      const indexSprite = this.createSubscriptBillboard(`[${idx}]`, isWithinRange);
      indexSprite.position.set(x, y - blockSize / 2 - 0.015, 0);
      this.visualGroup.add(indexSprite);

      // Low / High / Mid Caliper Markers
      if (idx === low && !state.isComplete) {
        const lowMarker = this.createCaliperMarker('LOW', '#38bdf8');
        lowMarker.position.set(x, y + blockSize / 2 + 0.045, 0);
        this.visualGroup.add(lowMarker);
      }
      if (idx === high && !state.isComplete && high !== low) {
        const highMarker = this.createCaliperMarker('HIGH', '#38bdf8');
        highMarker.position.set(x, y + blockSize / 2 + 0.045, 0);
        this.visualGroup.add(highMarker);
      }
      if (isMid) {
        const midMarker = this.createCaliperMarker(isMatch ? 'MATCH!' : 'MID', isMatch ? '#10b981' : '#f59e0b');
        midMarker.position.set(x, y + blockSize / 2 + (idx === low || idx === high ? 0.075 : 0.045), 0);
        this.visualGroup.add(midMarker);
      }
    }
  }

  private createTextBillboard(text: string, isMid: boolean, isMatch: boolean, isDimmed: boolean): THREE.Sprite {
    const spriteSize = 0.045;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({
        color: isMatch ? 0x10b981 : (isMid ? 0xf59e0b : 0xffffff),
        transparent: true,
        opacity: isDimmed ? 0.4 : 1.0,
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
      ctx.font = 'bold 64px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = isDimmed ? '#475569' : (isMatch ? '#34d399' : (isMid ? '#fbbf24' : '#ffffff'));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: isDimmed ? 0.35 : 1.0, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize, spriteSize, 1);
    return sprite;
  }

  private createCaliperMarker(label: string, color: string): THREE.Sprite {
    const spriteSize = 0.035;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: 0x38bdf8, transparent: true, depthTest: false });
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
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(8, 8, 144, 48, 10);
      ctx.fill();

      ctx.font = 'bold 28px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 80, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 2.5, spriteSize, 1);
    return sprite;
  }

  private createSubscriptBillboard(text: string, isWithinRange: boolean): THREE.Sprite {
    const spriteSize = 0.025;

    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isWithinRange ? 0x94a3b8 : 0x475569, transparent: true, depthTest: false });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 128, 64);
      ctx.font = 'bold 36px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = isWithinRange ? '#94a3b8' : '#334155';
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
    if (this.visualGroup.parent) {
      this.visualGroup.parent.remove(this.visualGroup);
    }
  }
}
