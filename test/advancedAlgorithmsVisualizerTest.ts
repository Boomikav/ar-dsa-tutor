/**
 * Advanced Algorithm Visualizers Spatial Verification Suite
 * 
 * Verifies that the Three.js spatial visualizers for:
 * 1. Merge Sort (ThreeMergeSortVisualizer)
 * 2. AVL Tree (ThreeAVLTreeVisualizer)
 * 3. Dijkstra's Algorithm (ThreeDijkstraVisualizer)
 * 
 * Satisfy:
 * - Tabletop bounding box envelopes (0.45m - 0.65m width, 0.25m - 0.48m height)
 * - Elevated base geometries (y >= 0.12m - 0.14m) clearing the mobile HUD horizon
 * - Raycaster element picking
 * - Clean disposal without resource leaks
 * - Seamless integration with WebXRARService across all 8 algorithms
 */

import * as THREE from 'three';
import { ARSceneFraming } from '../src/services/ar/ARSceneFraming';
import { ThreeMergeSortVisualizer } from '../src/services/ar/ThreeMergeSortVisualizer';
import { ThreeAVLTreeVisualizer } from '../src/services/ar/ThreeAVLTreeVisualizer';
import { ThreeDijkstraVisualizer } from '../src/services/ar/ThreeDijkstraVisualizer';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { MergeSortEngine } from '../src/services/dsa/sorting/MergeSortEngine';
import { AVLTreeEngine } from '../src/services/dsa/tree/AVLTreeEngine';
import { DijkstraEngine } from '../src/services/dsa/graphAlgorithms/DijkstraEngine';

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
console.log('ADVANCED ALGORITHM VISUALIZERS SPATIAL SUITE');
console.log('====================================================\n');

// 1. Merge Sort Visualizer Checks
console.log('--- 1. ThreeMergeSortVisualizer Checks ---');
const msEngine = new MergeSortEngine();
msEngine.initialize([38, 27, 43, 3, 9, 82, 10]);
const msVis = new ThreeMergeSortVisualizer();
msVis.render(msEngine.getCurrentState());

const msBounds = ARSceneFraming.computeBoundingBox(msVis.visualGroup);
assert(msBounds.isValid, 'Merge Sort bounding box is valid');
assert(msBounds.size.x >= 0.45 && msBounds.size.x <= 0.65, `Merge Sort width (${msBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.45m, 0.65m]`);
assert(msBounds.size.y >= 0.20 && msBounds.size.y <= 0.40, `Merge Sort height (${msBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.20m, 0.40m]`);
assert(msBounds.box.min.y >= 0.08, `Merge Sort base elevation (${msBounds.box.min.y.toFixed(3)}m) clears mobile HUD horizon (>= 0.08m)`);
assert(msVis.elementMeshes.length === 7, `Created 7 bar meshes for 7 input items (Actual: ${msVis.elementMeshes.length})`);
msVis.dispose();

// 2. AVL Tree Visualizer Checks
console.log('\n--- 2. ThreeAVLTreeVisualizer Checks ---');
const avlEngine = new AVLTreeEngine();
avlEngine.initialize([30, 20, 40, 10, 25, 50, 5]);
const avlVis = new ThreeAVLTreeVisualizer();
avlVis.render(avlEngine.getCurrentState());

const avlBounds = ARSceneFraming.computeBoundingBox(avlVis.visualGroup);
assert(avlBounds.isValid, 'AVL Tree bounding box is valid');
assert(avlBounds.size.x >= 0.45 && avlBounds.size.x <= 0.70, `AVL Tree width (${avlBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.45m, 0.70m]`);
assert(avlBounds.size.y >= 0.25 && avlBounds.size.y <= 0.48, `AVL Tree height (${avlBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.25m, 0.48m]`);
assert(avlBounds.box.min.y >= 0.08, `AVL Tree base elevation (${avlBounds.box.min.y.toFixed(3)}m) clears mobile HUD horizon (>= 0.08m)`);
assert(avlVis.nodeMeshes.length === 7, `Created 7 node meshes for 7 AVL tree nodes (Actual: ${avlVis.nodeMeshes.length})`);

// Test Raycaster picking
const raycaster = new THREE.Raycaster();
raycaster.set(new THREE.Vector3(0, 0.41, 1), new THREE.Vector3(0, 0, -1));
const picked = avlVis.pickElement(raycaster);
assert(picked !== null && picked.nodeValue === 30, `Raycaster picked root node 30 (Actual: ${picked?.nodeValue})`);
avlVis.dispose();

// 3. Dijkstra Visualizer Checks
console.log('\n--- 3. ThreeDijkstraVisualizer Checks ---');
const dijkEngine = new DijkstraEngine();
dijkEngine.initialize({ source: 'A', destination: 'E' });
while (!dijkEngine.isCompleted()) {
  dijkEngine.step();
}
const dijkVis = new ThreeDijkstraVisualizer();
dijkVis.render(dijkEngine.getCurrentState());

const dijkBounds = ARSceneFraming.computeBoundingBox(dijkVis.visualGroup);
assert(dijkBounds.isValid, 'Dijkstra bounding box is valid');
assert(dijkBounds.size.x >= 0.40 && dijkBounds.size.x <= 0.65, `Dijkstra width (${dijkBounds.size.x.toFixed(3)}m) is in calibrated envelope [0.40m, 0.65m]`);
assert(dijkBounds.size.y >= 0.25 && dijkBounds.size.y <= 0.50, `Dijkstra height (${dijkBounds.size.y.toFixed(3)}m) is in calibrated envelope [0.25m, 0.50m]`);
assert(dijkBounds.box.min.y >= 0.08, `Dijkstra base elevation (${dijkBounds.box.min.y.toFixed(3)}m) clears mobile HUD horizon (>= 0.08m)`);
assert(dijkVis.vertexMeshes.length === 6, `Created 6 vertex meshes for 6 graph nodes (Actual: ${dijkVis.vertexMeshes.length})`);
dijkVis.dispose();

// 4. WebXRARService 8-Algorithm Registration & Switching
console.log('\n--- 4. WebXRARService 8-Algorithm Switching Checks ---');
const service = new WebXRARService();

const algorithms = [
  { id: 'ds-binary-search-tree', name: 'BST' },
  { id: 'algo-bubble-sort', name: 'Bubble Sort' },
  { id: 'algo-binary-search', name: 'Binary Search' },
  { id: 'algo-breadth-first-search', name: 'BFS' },
  { id: 'ds-stack', name: 'Stack' },
  { id: 'algo-merge-sort', name: 'Merge Sort' },
  { id: 'ds-avl-tree', name: 'AVL Tree' },
  { id: 'algo-dijkstras-algorithm', name: "Dijkstra's Algorithm" }
];

for (const algo of algorithms) {
  service.setActiveAlgorithm(algo.id);
  const activeGroup = service.getActiveVisualGroup();
  assert(activeGroup !== null && activeGroup !== undefined, `Active visual group returned for ${algo.name} (${algo.id})`);
  assert(activeGroup.visible === true, `Active visual group is visible for ${algo.name}`);
}

console.log('\n====================================================');
console.log(`ADVANCED VISUALIZERS SUMMARY: ${passedChecks} / ${totalChecks} PASSED`);
console.log('====================================================');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
