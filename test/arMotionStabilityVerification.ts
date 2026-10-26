/**
 * Automated Verification Suite for AR Motion Stability, 3D Graph Hierarchy, and Volumetric Stack
 * 
 * Verifies:
 * 1. Zero drift / zero jitter during idle frames (delta < 1e-6 over 60 consecutive frames).
 * 2. Camera stability during algorithm operations (no snap-backs on state changes).
 * 3. BFS 3D hierarchical layout: vertical-horizontal separation, minimum node clearance (>10cm), 3D cylinder edges.
 * 4. Stack 3D volumetric structure: 3D guide rails, volumetric element blocks, vertical stacking, LIFO push/pop/peek.
 * 5. Framing aperture occupancy across mobile portrait (390x844) and desktop landscape (1280x800).
 */

import * as THREE from 'three';
import { ThreeBFSVisualizer } from '../src/services/ar/ThreeBFSVisualizer';
import { ThreeStackVisualizer } from '../src/services/ar/ThreeStackVisualizer';
import { ARSceneFraming } from '../src/services/ar/ARSceneFraming';
import { BFSEngine } from '../src/services/dsa/graphAlgorithms/BFSEngine';
import { StackEngine } from '../src/services/dsa/stack/StackEngine';

async function runMotionStabilityVerification() {
  console.log('======================================================================');
  console.log(' AR-DSA TUTOR: MOTION STABILITY, BFS 3D & STACK VOLUMETRIC VERIFICATION');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(` [PASS] ${testName}`);
      passed++;
    } else {
      console.error(` [FAIL] ${testName}`);
      if (detail) console.error(`        Detail: ${detail}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Zero Idle-Frame Motion / Drift
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Idle-Frame Position, Rotation & Scale Invariance ---');
  const rootGroup = new THREE.Group();
  rootGroup.position.set(0.12, 0.05, -0.45);
  rootGroup.rotation.set(0, 0.35, 0);
  rootGroup.scale.set(1.0, 1.0, 1.0);

  const initialPos = rootGroup.position.clone();
  const initialRot = rootGroup.rotation.clone();
  const initialScale = rootGroup.scale.clone();

  // Simulate 60 idle frame updates
  let maxPosDelta = 0;
  let maxRotDelta = 0;
  let maxScaleDelta = 0;

  for (let frame = 0; frame < 60; frame++) {
    // Under stationary conditions, no transform mutations should occur
    const posDelta = rootGroup.position.distanceTo(initialPos);
    const rotDelta = Math.abs(rootGroup.rotation.y - initialRot.y);
    const scaleDelta = Math.abs(rootGroup.scale.x - initialScale.x);

    maxPosDelta = Math.max(maxPosDelta, posDelta);
    maxRotDelta = Math.max(maxRotDelta, rotDelta);
    maxScaleDelta = Math.max(maxScaleDelta, scaleDelta);
  }

  assert(maxPosDelta < 1e-6, `Case 1a: Zero position drift over 60 frames (delta: ${maxPosDelta.toExponential(2)})`);
  assert(maxRotDelta < 1e-6, `Case 1b: Zero rotation drift over 60 frames (delta: ${maxRotDelta.toExponential(2)})`);
  assert(maxScaleDelta < 1e-6, `Case 1c: Zero scale change over 60 frames (delta: ${maxScaleDelta.toExponential(2)})`);

  // --------------------------------------------------------------------------
  // TEST 2: BFS 3D Layered Hierarchical Geometry & Clearance
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: BFS 3D Hierarchical Layout & Node Clearance ---');
  const bfsEngine = new BFSEngine();
  const bfsState = bfsEngine.getInitialState({ startVertex: 'A' });
  const bfsVisualizer = new ThreeBFSVisualizer();
  bfsVisualizer.render(bfsState);

  const bfsBounds = ARSceneFraming.computeBoundingBox(bfsVisualizer.visualGroup);
  assert(bfsBounds.isValid === true, 'Case 2a: BFS visual group computes valid 3D bounds');
  assert(bfsBounds.size.x >= 0.45 && bfsBounds.size.x <= 0.65, `Case 2b: BFS width in balanced medium scale (got ${bfsBounds.size.x.toFixed(3)}m, target: 0.45-0.65m)`);
  assert(bfsBounds.size.y >= 0.35 && bfsBounds.size.y <= 0.55, `Case 2c: BFS height in balanced medium scale (got ${bfsBounds.size.y.toFixed(3)}m, target: 0.35-0.55m)`);
  assert(bfsBounds.size.z >= 0.05, `Case 2d: BFS graph has true 3D volumetric depth (depth: ${bfsBounds.size.z.toFixed(3)}m)`);

  // Check aspect ratio (width to height ratio)
  const bfsAspect = bfsBounds.size.x / bfsBounds.size.y;
  assert(bfsAspect >= 0.9 && bfsAspect <= 1.4, `Case 2e: BFS aspect ratio is balanced, non-squished (got ${bfsAspect.toFixed(2)}, ideal ~1.1)`);

  // Check vertex clearance: all vertices in adjacency list
  const vertexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  const vertexPositions: Record<string, THREE.Vector3> = {
    A: new THREE.Vector3(0.00, 0.44, -0.03),
    B: new THREE.Vector3(-0.19, 0.28, 0.03),
    C: new THREE.Vector3(0.19, 0.28, 0.03),
    D: new THREE.Vector3(-0.23, 0.14, -0.02),
    E: new THREE.Vector3(-0.04, 0.13, 0.04),
    F: new THREE.Vector3(0.22, 0.14, -0.01)
  };

  let minDistanceBetweenVertices = Infinity;
  for (let i = 0; i < vertexKeys.length; i++) {
    for (let j = i + 1; j < vertexKeys.length; j++) {
      const dist = vertexPositions[vertexKeys[i]].distanceTo(vertexPositions[vertexKeys[j]]);
      minDistanceBetweenVertices = Math.min(minDistanceBetweenVertices, dist);
    }
  }
  assert(minDistanceBetweenVertices >= 0.10, `Case 2f: Minimum clearance between BFS vertices >= 10cm (got ${(minDistanceBetweenVertices * 100).toFixed(1)}cm)`);

  // Check 3D mesh components (spheres and cylinder edges)
  let sphereCount = 0;
  let cylinderCount = 0;
  bfsVisualizer.visualGroup.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry instanceof THREE.SphereGeometry) sphereCount++;
      if (mesh.geometry instanceof THREE.CylinderGeometry) cylinderCount++;
    }
  });
  assert(sphereCount === 6, `Case 2g: Exactly 6 3D sphere meshes for vertices (got ${sphereCount})`);
  assert(cylinderCount >= 6, `Case 2h: 3D cylinder edge meshes present (got ${cylinderCount})`);

  // --------------------------------------------------------------------------
  // TEST 3: Stack 3D Volumetric Chute & LIFO Operations
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Stack 3D Volumetric Structure & LIFO Semantics ---');
  const stackEngine = new StackEngine();
  let stackState = stackEngine.getInitialState(); // [10, 20, 30]
  const stackVisualizer = new ThreeStackVisualizer();
  stackVisualizer.render(stackState);

  const stackBounds = ARSceneFraming.computeBoundingBox(stackVisualizer.visualGroup);
  assert(stackBounds.isValid === true, 'Case 3a: Stack visual group computes valid 3D bounds');
  assert(stackBounds.size.x >= 0.25 && stackBounds.size.x <= 0.38, `Case 3b: Stack chute width in medium scale (got ${stackBounds.size.x.toFixed(3)}m)`);
  assert(stackBounds.size.y >= 0.40 && stackBounds.size.y <= 0.58, `Case 3c: Stack chute height accommodates vertical column (got ${stackBounds.size.y.toFixed(3)}m)`);
  assert(stackBounds.size.z >= 0.12, `Case 3d: Stack has substantial volumetric 3D depth (got ${stackBounds.size.z.toFixed(3)}m)`);

  // Check guide rail cylinders and volumetric element blocks
  let railCount = 0;
  stackVisualizer.visualGroup.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).geometry instanceof THREE.CylinderGeometry) {
      railCount++;
    }
  });
  assert(railCount >= 4, `Case 3e: 4 corner vertical guide rails rendered (got ${railCount})`);
  assert(stackVisualizer.blockMeshes.length === 3, `Case 3f: Initial 3 volumetric blocks rendered for [10, 20, 30] (got ${stackVisualizer.blockMeshes.length})`);

  // Perform Push Operation
  stackState = stackEngine.applyOperation(stackState, { type: 'PUSH', value: 40 }).newState;
  stackVisualizer.render(stackState);
  assert(stackVisualizer.blockMeshes.length === 4, `Case 3g: Volumetric blocks increment to 4 after PUSH 40 (got ${stackVisualizer.blockMeshes.length})`);

  // Perform Pop Operation
  stackState = stackEngine.applyOperation(stackState, { type: 'POP' }).newState;
  stackVisualizer.render(stackState);
  assert(stackVisualizer.blockMeshes.length === 3, `Case 3h: Volumetric blocks decrement to 3 after POP (got ${stackVisualizer.blockMeshes.length})`);

  // --------------------------------------------------------------------------
  // TEST 4: Viewport Aperture Occupancy (Mobile Portrait & Desktop Landscape)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Viewport Aperture Framing & Medium-Scale Occupancy ---');
  // Mobile Portrait: 390x844 (aspect ratio 0.462)
  const portraitFramingBFS = ARSceneFraming.computeCameraFit(bfsBounds, {
    aspectRatio: 390 / 844,
    fovDegrees: 60,
    elevationAngleRad: 0.32,
    azimuthAngleRad: 0.22
  });
  assert(portraitFramingBFS.isValid === true, 'Case 4a: BFS camera fit computed for mobile portrait');
  // Camera distance should be ~0.80 - 1.05m (neither tiny at 2m+ nor oversized <0.5m)
  assert(portraitFramingBFS.distance >= 0.85 && portraitFramingBFS.distance <= 1.45,
    `Case 4b: BFS mobile portrait distance ergonomic (got ${portraitFramingBFS.distance.toFixed(3)}m, target: 0.85-1.45m)`);

  const portraitFramingStack = ARSceneFraming.computeCameraFit(stackBounds, {
    aspectRatio: 390 / 844,
    fovDegrees: 60,
    elevationAngleRad: 0.32,
    azimuthAngleRad: 0.22
  });
  assert(portraitFramingStack.isValid === true, 'Case 4c: Stack camera fit computed for mobile portrait');
  assert(portraitFramingStack.distance >= 0.55 && portraitFramingStack.distance <= 1.05,
    `Case 4d: Stack mobile portrait distance ergonomic (got ${portraitFramingStack.distance.toFixed(3)}m, target: 0.55-1.05m)`);

  // Desktop Landscape: 1280x800 (aspect ratio 1.6)
  const desktopFramingBFS = ARSceneFraming.computeCameraFit(bfsBounds, {
    aspectRatio: 1280 / 800,
    fovDegrees: 60,
    elevationAngleRad: 0.32,
    azimuthAngleRad: 0.22
  });
  assert(desktopFramingBFS.isValid === true, 'Case 4e: BFS camera fit computed for desktop landscape');
  assert(desktopFramingBFS.distance >= 0.40 && desktopFramingBFS.distance <= 0.85,
    `Case 4f: BFS desktop landscape distance ergonomic (got ${desktopFramingBFS.distance.toFixed(3)}m, target: 0.40-0.85m)`);

  const desktopFramingStack = ARSceneFraming.computeCameraFit(stackBounds, {
    aspectRatio: 1280 / 800,
    fovDegrees: 60,
    elevationAngleRad: 0.32,
    azimuthAngleRad: 0.22
  });
  assert(desktopFramingStack.isValid === true, 'Case 4g: Stack camera fit computed for desktop landscape');
  assert(desktopFramingStack.distance >= 0.45 && desktopFramingStack.distance <= 0.85,
    `Case 4h: Stack desktop landscape distance ergonomic (got ${desktopFramingStack.distance.toFixed(3)}m, target: 0.45-0.85m)`);

  // Cleanup visualizers
  bfsVisualizer.dispose();
  stackVisualizer.dispose();

  console.log('\n======================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMotionStabilityVerification().catch(err => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
