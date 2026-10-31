/**
 * Three.js Spatial Visualizer for Merge Sort
 * 
 * Renders 3D dual-tier divide-and-conquer architecture:
 * - Lower tier: Working array segmented into left/right subarrays
 * - Upper tier: Auxiliary merged array buffer
 * - Dynamic color highlights for active comparison, placement write, and sorted completion
 * - Calibrated tabletop bounds (width ~0.55m, height ~0.35m, base elevation >= 0.12m)
 */

import * as THREE from 'three';
import { IARAlgorithmVisualizer } from './IARAlgorithmVisualizer';
import { MergeSortState } from '../dsa/sorting/MergeSortEngine';

export class ThreeMergeSortVisualizer implements IARAlgorithmVisualizer<MergeSortState> {
  readonly id = 'algo-merge-sort';
  readonly title = 'Merge Sort';

  public readonly rootGroup: THREE.Group;
  public readonly visualGroup: THREE.Group;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  public readonly elementMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'merge-sort-root-group';
    this.rootGroup.visible = true;

    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'merge-sort-visual-group';
    this.rootGroup.add(this.visualGroup);
  }

  public render(state: MergeSortState): void {
    this.clear();

    const arr = state.array || [];
    if (arr.length === 0) return;

    const n = arr.length;
    const blockWidth = 0.065; // 6.5cm width per bar
    const blockDepth = 0.065; // 6.5cm depth
    const spacing = 0.015;    // 1.5cm gap between bars
    const totalWidth = n * blockWidth + (n - 1) * spacing;
    const startX = -totalWidth / 2 + blockWidth / 2;
    const baseElevation = 0.14; // 14cm base elevation to clear mobile HUD horizon
    const auxElevation = 0.28;  // 28cm elevation for auxiliary buffer tier

    const maxVal = Math.max(...arr, 1);
    const minHeight = 0.06;
    const maxHeight = 0.16;

    const compared = state.activeComparedIndices;
    const writeIdx = state.activeWriteIndex;

    // 1. Render Lower Tier: Working Array Bars
    for (let idx = 0; idx < n; idx++) {
      const val = arr[idx];
      const normalizedHeight = minHeight + ((val / maxVal) * (maxHeight - minHeight));
      const x = startX + idx * (blockWidth + spacing);
      const y = baseElevation + normalizedHeight / 2;

      const isCompared = compared ? (idx === compared[0] || idx === compared[1]) : false;
      const isComplete = state.isComplete;

      // Color coding:
      // - Complete: Emerald Green
      // - Active Comparison: Amber Gold
      // - Normal: Split into left cyan vs right indigo
      let barColor = 0x38bdf8; // Cyan
      let emissive = 0x082f49;

      if (isComplete) {
        barColor = 0x10b981; // Emerald
        emissive = 0x064e3b;
      } else if (isCompared) {
        barColor = 0xf59e0b; // Amber
        emissive = 0x78350f;
      } else if (idx >= Math.floor(n / 2)) {
        barColor = 0x818cf8; // Indigo for right half
        emissive = 0x312e81;
      }

      const geom = new THREE.BoxGeometry(blockWidth, normalizedHeight, blockDepth);
      this.disposables.push(geom);

      const mat = new THREE.MeshStandardMaterial({
        color: barColor,
        emissive,
        roughness: 0.25,
        metalness: 0.1
      });
      this.disposables.push(mat);

      const barMesh = new THREE.Mesh(geom, mat);
      barMesh.position.set(x, y, 0);
      barMesh.castShadow = true;
      barMesh.receiveShadow = true;
      this.visualGroup.add(barMesh);
      this.elementMeshes.push(barMesh);

      // Value label sprite
      const labelSprite = this.createLabelSprite(String(val), isCompared, isComplete);
      labelSprite.position.set(x, baseElevation + normalizedHeight + 0.03, 0);
      this.visualGroup.add(labelSprite);

      // Index subscript sprite
      const idxSprite = this.createSubscriptBillboard(`[${idx}]`, isCompared);
      idxSprite.position.set(x, baseElevation - 0.015, 0);
      this.visualGroup.add(idxSprite);
    }

    // 2. Render Upper Tier: Auxiliary Merged Buffer Slots
    if (state.auxiliaryArray) {
      for (let idx = 0; idx < n; idx++) {
        const auxVal = state.auxiliaryArray[idx];
        const x = startX + idx * (blockWidth + spacing);
        const y = auxElevation;

        const isWriting = writeIdx === idx;
        const hasVal = auxVal !== null && auxVal !== undefined;

        // Wireframe / translucent slot frame
        const slotGeom = new THREE.BoxGeometry(blockWidth * 0.9, 0.04, blockDepth * 0.9);
        this.disposables.push(slotGeom);

        const slotMat = new THREE.MeshStandardMaterial({
          color: isWriting ? 0x34d399 : (hasVal ? 0x0284c7 : 0x475569),
          emissive: isWriting ? 0x059669 : 0x0f172a,
          roughness: 0.3,
          transparent: true,
          opacity: hasVal ? 0.9 : 0.35
        });
        this.disposables.push(slotMat);

        const slotMesh = new THREE.Mesh(slotGeom, slotMat);
        slotMesh.position.set(x, y, 0);
        this.visualGroup.add(slotMesh);

        if (hasVal) {
          const auxSprite = this.createLabelSprite(String(auxVal), false, true, 0.045);
          auxSprite.position.set(x, y + 0.035, 0);
          this.visualGroup.add(auxSprite);
        }
      }

      // Tier label
      const tierLabel = this.createSubscriptBillboard('AUX BUFFER (MERGE ZONE)', false, '#38bdf8');
      tierLabel.position.set(0, auxElevation + 0.07, 0);
      this.visualGroup.add(tierLabel);
    }
  }

  private createLabelSprite(text: string, isHighlighted: boolean, isSuccess = false, spriteSize = 0.055): THREE.Sprite {
    if (typeof document === 'undefined') {
      const mat = new THREE.SpriteMaterial({ color: isSuccess ? 0x10b981 : (isHighlighted ? 0xf59e0b : 0x38bdf8), transparent: true });
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
      const mat = new THREE.SpriteMaterial({ color: isHighlighted ? 0xf59e0b : 0x94a3b8, transparent: true });
      this.disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(spriteSize * 2, spriteSize, 1);
      return sprite;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 256, 64);
      ctx.font = 'bold 32px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = colorOverride || (isHighlighted ? '#f59e0b' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.disposables.push(spriteMat);
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(spriteSize * 3, spriteSize, 1);
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
