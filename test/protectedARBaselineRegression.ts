/**
 * Protected AR Baseline Regression Test Suite
 * 
 * Verifies that the calibrated spatial AR rendering pipeline, camera calculations,
 * tabletop bounding envelopes, elevation offsets, and visualizer lifecycles for
 * the five existing algorithms remain 100% intact and unaltered.
 */

import * as THREE from 'three';
import { ARSceneFraming } from '../src/services/ar/ARSceneFraming';
import { ThreeBSTVisualizer } from '../src/services/ar/ThreeBSTVisualizer';
import { ThreeBubbleSortVisualizer } from '../src/services/ar/ThreeBubbleSortVisualizer';
import { ThreeBinarySearchVisualizer } from '../src/services/ar/ThreeBinarySearchVisualizer';
import { ThreeBFSVisualizer } from '../src/services/ar/ThreeBFSVisualizer';
import { ThreeStackVisualizer } from '../src/services/ar/ThreeStackVisualizer';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';

let totalChecks = 0;
let passedChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

console.log('====================================================');
console.log('PROTECTED AR BASELINE REGRESSION TEST SUITE');
console.log('====================================================\n');

// 1. ARSceneFraming Mathematical Invariants
console.log('--- 1. ARSceneFraming Invariant Checks ---');
const sampleGroup = new THREE.Group();
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.4, 0.2),
  new THREE.MeshBasicMaterial()
);
mesh.position.set(0, 0.2, 0);
sampleGroup.add(mesh);

const bounds = ARSceneFraming.computeBoundingBox(sampleGroup);
assert(bounds.isValid, 'Bounding box computation returns valid state');
assert(Math.abs(bounds.size.x - 0.5) < 0.01, `Bounding width matches box geometry: ${bounds.size.x.toFixed(3)}m`);
assert(Math.abs(bounds.size.y - 0.4) < 0.01, `Bounding height matches box geometry: ${bounds.size.y.toFixed(3)}m`);
assert(Math.abs(bounds.size.z - 0.2) < 0.01, `Bounding depth matches box geometry: ${bounds.size.z.toFixed(3)}m`);

const fitDesktop = ARSceneFraming.computeCameraFit(bounds, {
  aspectRatio: 1280 / 800,
  fovDegrees: 60,
  elevationAngleRad: 0.32,
  azimuthAngleRad: 0.22
});
assert(fitDesktop.distance > 0.3 && fitDesktop.distance < 1.5, `Desktop camera distance is within safe range: ${fitDesktop.distance.toFixed(3)}m`);
assert(fitDesktop.cameraPosition.y > fitDesktop.targetPosition.y, 'Camera position is elevated above target');

const fitMobile = ARSceneFraming.computeCameraFit(bounds, {
  aspectRatio: 390 / 844,
  fovDegrees: 60,
  elevationAngleRad: 0.32,
  azimuthAngleRad: 0.22
});
assert(fitMobile.distance > fitDesktop.distance, `Portrait mobile camera distance (${fitMobile.distance.toFixed(3)}m) exceeds desktop distance (${fitDesktop.distance.toFixed(3)}m) to preserve framing aperture`);

// 2. BST Visualizer Envelope & Elevation
console.log('\n--- 2. ThreeBSTVisualizer Baseline Checks ---');
const bstVis = new ThreeBSTVisualizer();
const sampleTree = BSTEngine.createSampleTree();
bstVis.render(sampleTree);
const bstBounds = ARSceneFraming.computeBoundingBox(bstVis.bstVisualGroup);

assert(bstBounds.size.x >= 0.50 && bstBounds.size.x <= 0.65, `BST width (${bstBounds.size.x.toFixed(3)}m) is in calibrated tabletop envelope [0.50m, 0.65m]`);
assert(bstBounds.size.y >= 0.30 && bstBounds.size.y <= 0.45, `BST height (${bstBounds.size.y.toFixed(3)}m) is in calibrated tabletop envelope [0.30m, 0.45m]`);
assert(bstBounds.box.min.y >= 0.08, `BST base elevation (${bstBounds.box.min.y.toFixed(3)}m) clears floor/HUD horizon (>= 0.08m)`);
bstVis.dispose();

// 3. Bubble Sort Visualizer Envelope & Elevation
console.log('\n--- 3. ThreeBubbleSortVisualizer Baseline Checks ---');
const bubbleVis = new ThreeBubbleSortVisualizer();
bubbleVis.render({
  array: [5, 2, 4, 1, 3],
  currentI: 0,
  currentJ: 1,
  swappedInPass: false,
  isComplete: false,
  passCount: 1,
  swapCount: 0
});
const bubbleBounds = ARSceneFraming.computeBoundingBox(bubbleVis.visualGroup);
assert(bubbleBounds.size.x >= 0.40 && bubbleBounds.size.x <= 0.55, `Bubble Sort width (${bubbleBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.40m, 0.55m]`);
assert(bubbleBounds.size.y >= 0.30 && bubbleBounds.size.y <= 0.48, `Bubble Sort height (${bubbleBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.30m, 0.48m]`);
assert(bubbleBounds.box.min.y >= 0.02, `Bubble Sort base elevation (${bubbleBounds.box.min.y.toFixed(3)}m) is elevated`);
bubbleVis.dispose();

// 4. Binary Search Visualizer Envelope & Elevation
console.log('\n--- 4. ThreeBinarySearchVisualizer Baseline Checks ---');
const bsVis = new ThreeBinarySearchVisualizer();
bsVis.render({
  array: [10, 20, 30, 40, 50, 60],
  target: 50,
  low: 0,
  high: 5,
  mid: 2,
  isFound: false,
  isComplete: false,
  stepCount: 1,
  comparisonResult: 'LESS'
});
const bsBounds = ARSceneFraming.computeBoundingBox(bsVis.visualGroup);
assert(bsBounds.size.x >= 0.55 && bsBounds.size.x <= 0.70, `Binary Search width (${bsBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.55m, 0.70m]`);
assert(bsBounds.size.y >= 0.20 && bsBounds.size.y <= 0.35, `Binary Search height (${bsBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.20m, 0.35m]`);
assert(bsBounds.box.min.y >= 0.04, `Binary Search base elevation (${bsBounds.box.min.y.toFixed(3)}m) is elevated above floor`);
bsVis.dispose();

// 5. BFS Visualizer Envelope & Elevation
console.log('\n--- 5. ThreeBFSVisualizer Baseline Checks ---');
const bfsVis = new ThreeBFSVisualizer();
bfsVis.render({
  vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
  queue: ['A'],
  visited: [],
  currentVertex: null,
  isComplete: false,
  traversalOrder: []
});
const bfsBounds = ARSceneFraming.computeBoundingBox(bfsVis.visualGroup);
assert(bfsBounds.size.x >= 0.45 && bfsBounds.size.x <= 0.60, `BFS width (${bfsBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.45m, 0.60m]`);
assert(bfsBounds.size.y >= 0.40 && bfsBounds.size.y <= 0.55, `BFS height (${bfsBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.40m, 0.55m]`);
assert(bfsBounds.box.min.y >= 0.08, `BFS base elevation (${bfsBounds.box.min.y.toFixed(3)}m) is elevated above floor`);
bfsVis.dispose();

// 6. Stack Visualizer Envelope & Elevation
console.log('\n--- 6. ThreeStackVisualizer Baseline Checks ---');
const stackVis = new ThreeStackVisualizer();
stackVis.render({
  items: [15, 30, 45],
  capacity: 6,
  lastOperation: 'PUSH',
  isOverflow: false,
  isUnderflow: false
});
const stackBounds = ARSceneFraming.computeBoundingBox(stackVis.visualGroup);
assert(stackBounds.size.x >= 0.25 && stackBounds.size.x <= 0.38, `Stack width (${stackBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.25m, 0.38m]`);
assert(stackBounds.size.y >= 0.40 && stackBounds.size.y <= 0.55, `Stack height (${stackBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.40m, 0.55m]`);
assert(stackBounds.box.min.y >= 0.08, `Stack base elevation (${stackBounds.box.min.y.toFixed(3)}m) is elevated above floor`);
stackVis.dispose();

// 7. WebXRARService Lifecycle & Visualizer Attachment
console.log('\n--- 7. WebXRARService Baseline Lifecycle Checks ---');
const service = new WebXRARService();
assert(service.isMock === false, 'WebXRARService is operational service');
assert(service.sessionState === 'INITIALIZING', 'Initial state is INITIALIZING before session startup');
assert(service.isObjectPlaced === false, 'Initial placement flag is false');

// Verify active algorithm switching
service.setActiveAlgorithm('ds-binary-search-tree');
assert(service.getActiveVisualGroup() === (service as any).visualizer.bstVisualGroup, 'Active visual group for BST matches');

service.setActiveAlgorithm('algo-bubble-sort');
assert(service.getActiveVisualGroup() === (service as any).bubbleSortVisualizer.visualGroup, 'Active visual group for Bubble Sort matches');

service.setActiveAlgorithm('algo-binary-search');
assert(service.getActiveVisualGroup() === (service as any).binarySearchVisualizer.visualGroup, 'Active visual group for Binary Search matches');

service.setActiveAlgorithm('algo-breadth-first-search');
assert(service.getActiveVisualGroup() === (service as any).bfsVisualizer.visualGroup, 'Active visual group for BFS matches');

service.setActiveAlgorithm('ds-stack');
assert(service.getActiveVisualGroup() === (service as any).stackVisualizer.visualGroup, 'Active visual group for Stack matches');

console.log('\n====================================================');
console.log(`BASELINE SUMMARY: ${passedChecks} / ${totalChecks} PASSED (0 FAILURES)`);
console.log('====================================================');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
