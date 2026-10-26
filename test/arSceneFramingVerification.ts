/**
 * Automated Verification Suite for ARSceneFraming Engine
 * 
 * Verifies:
 * 1. Bounding box computation from Three.js Object3D hierarchies (meshes, groups)
 * 2. Frustum-based camera distance calculation across mobile portrait and desktop viewports
 * 3. Handling of degenerate bounds: empty groups, zero-extents, NaN, and infinity
 * 4. Safety distance clamping ([minDistance, maxDistance])
 * 5. HUD vertical aperture offset: shifting target downwards to prevent bottom card occlusion
 * 6. Framing diagnostic generation contract (ARFramingDiagnostic)
 * 7. Integration with IARService refitScene and getFramingDiagnostics
 */

import * as THREE from 'three';
import { ARSceneFraming } from '../src/services/ar/ARSceneFraming';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { MockARService } from '../src/services/ar/MockARService';

async function runARSceneFramingVerification() {
  console.log('======================================================================');
  console.log(' AR-DSA TUTOR: AR SCENE FRAMING ENGINE VERIFICATION SUITE');
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
  // TEST 1: Normal Bounds Computation
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Normal Object3D Bounds Calculation ---');
  const group = new THREE.Group();
  const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.40, 0.30, 0.10),
    new THREE.MeshBasicMaterial()
  );
  boxMesh.position.set(0, 0.15, 0);
  group.add(boxMesh);

  const bounds = ARSceneFraming.computeBoundingBox(group);
  assert(bounds.isValid === true, 'Case 1a: Bounds marked valid for normal mesh hierarchy');
  assert(Math.abs(bounds.size.x - 0.40) < 0.001, `Case 1b: Width matches expected 0.40m (got ${bounds.size.x.toFixed(3)})`);
  assert(Math.abs(bounds.size.y - 0.30) < 0.001, `Case 1c: Height matches expected 0.30m (got ${bounds.size.y.toFixed(3)})`);
  assert(Math.abs(bounds.size.z - 0.10) < 0.001, `Case 1d: Depth matches expected 0.10m (got ${bounds.size.z.toFixed(3)})`);
  assert(Math.abs(bounds.center.y - 0.15) < 0.001, `Case 1e: Center Y matches 0.15m (got ${bounds.center.y.toFixed(3)})`);

  // --------------------------------------------------------------------------
  // TEST 2: Degenerate and Fallback Bounds Handling
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Degenerate, Empty, and NaN Bounds Fallback ---');
  const emptyGroup = new THREE.Group();
  const emptyBounds = ARSceneFraming.computeBoundingBox(emptyGroup);
  assert(emptyBounds.isValid === false, 'Case 2a: Empty group falls back to tabletop defaults with isValid=false');
  assert(emptyBounds.size.x > 0 && emptyBounds.size.y > 0, 'Case 2b: Fallback bounds provide positive non-zero extents');

  const nullBounds = ARSceneFraming.computeBoundingBox(null as any);
  assert(nullBounds.isValid === false, 'Case 2c: Null target safely returns fallback bounds');

  // Invisible child filtering
  const invisibleGroup = new THREE.Group();
  const hiddenMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0));
  hiddenMesh.visible = false;
  invisibleGroup.add(hiddenMesh);
  const hiddenBounds = ARSceneFraming.computeBoundingBox(invisibleGroup);
  assert(hiddenBounds.isValid === false, 'Case 2d: Invisible children are ignored in bounding calculation');

  // --------------------------------------------------------------------------
  // TEST 3: Perspective Frustum Fit Math (Desktop vs Mobile Portrait)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Responsive Frustum Fitting Math ---');
  // Wide model: width 0.50m, height 0.20m, depth 0.05m
  const wideBounds = {
    box: new THREE.Box3(new THREE.Vector3(-0.25, 0.0, -0.025), new THREE.Vector3(0.25, 0.20, 0.025)),
    size: new THREE.Vector3(0.50, 0.20, 0.05),
    center: new THREE.Vector3(0.0, 0.10, 0.0),
    maxDim: 0.50,
    isValid: true
  };

  // Desktop (1280x800, aspect 1.6)
  const desktopFit = ARSceneFraming.computeCameraFit(wideBounds, {
    fovDegrees: 60,
    aspectRatio: 1.6
  });
  // Mobile Portrait (390x844, aspect 0.462)
  const mobileFit = ARSceneFraming.computeCameraFit(wideBounds, {
    fovDegrees: 60,
    aspectRatio: 390 / 844
  });

  const halfFovV = (30 * Math.PI) / 180;
  const mobileVh = 2 * mobileFit.distance * Math.tan(halfFovV);
  const mobileVw = mobileVh * (390 / 844);
  const desktopVh = 2 * desktopFit.distance * Math.tan(halfFovV);

  assert(
    mobileFit.distance > desktopFit.distance,
    `Case 3a: Narrow mobile portrait pulls camera back further (${mobileFit.distance.toFixed(3)}m > ${desktopFit.distance.toFixed(3)}m) to frame wide model`
  );
  assert(
    mobileVw >= wideBounds.size.x,
    `Case 3b: Mobile visible width (${mobileVw.toFixed(3)}m) accommodates model width (0.50m)`
  );
  assert(
    desktopVh >= wideBounds.size.y,
    `Case 3c: Desktop visible height (${desktopVh.toFixed(3)}m) accommodates model height (0.20m)`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Vertical Aperture Offset (Avoiding HUD Overlap)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: HUD Aperture Offset ---');
  assert(
    desktopFit.targetPosition.y < wideBounds.center.y,
    `Case 4a: Desktop look-at target Y (${desktopFit.targetPosition.y.toFixed(3)}) is below center Y (${wideBounds.center.y}) to elevate model into clear aperture`
  );
  assert(
    mobileFit.targetPosition.y < wideBounds.center.y,
    `Case 4b: Mobile look-at target Y (${mobileFit.targetPosition.y.toFixed(3)}) is below center Y (${wideBounds.center.y}) to avoid bottom action card`
  );

  // --------------------------------------------------------------------------
  // TEST 5: Safety Distance Clamping
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Distance Clamping Limits ---');
  const tinyBounds = {
    box: new THREE.Box3(new THREE.Vector3(-0.001, 0, -0.001), new THREE.Vector3(0.001, 0.002, 0.001)),
    size: new THREE.Vector3(0.002, 0.002, 0.002),
    center: new THREE.Vector3(0, 0.001, 0),
    maxDim: 0.002,
    isValid: true
  };
  const clampedMinFit = ARSceneFraming.computeCameraFit(tinyBounds, {
    fovDegrees: 60,
    aspectRatio: 1.6,
    minDistance: 0.35
  });
  assert(clampedMinFit.distance >= 0.35, `Case 5a: Distance clamped to minimum 0.35m (got ${clampedMinFit.distance.toFixed(3)}m)`);

  const hugeBounds = {
    box: new THREE.Box3(new THREE.Vector3(-10, 0, -10), new THREE.Vector3(10, 20, 10)),
    size: new THREE.Vector3(20, 20, 20),
    center: new THREE.Vector3(0, 10, 0),
    maxDim: 20,
    isValid: true
  };
  const clampedMaxFit = ARSceneFraming.computeCameraFit(hugeBounds, {
    fovDegrees: 60,
    aspectRatio: 1.6,
    maxDistance: 2.50
  });
  assert(clampedMaxFit.distance <= 2.50, `Case 5b: Distance clamped to maximum 2.50m (got ${clampedMaxFit.distance.toFixed(3)}m)`);

  // --------------------------------------------------------------------------
  // TEST 6: Framing Diagnostic Snapshot Contract
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Framing Diagnostic Contract ---');
  const diagnostic = ARSceneFraming.generateDiagnostic(
    wideBounds,
    desktopFit,
    'algo-bubble-sort',
    'CANVAS_3D_FALLBACK',
    1280,
    800,
    60
  );

  assert(diagnostic.activeAlgorithm === 'algo-bubble-sort', 'Case 6a: Diagnostic records activeAlgorithm');
  assert(diagnostic.renderingMode === 'CANVAS_3D_FALLBACK', 'Case 6b: Diagnostic records renderingMode');
  assert(diagnostic.aspectRatio === 1.6, 'Case 6c: Diagnostic computes aspect ratio');
  assert(diagnostic.modelBounds.size.length === 3, 'Case 6d: Model bounds size array formatted properly');
  assert(diagnostic.fitSuccess === true, 'Case 6e: Fit marked as success');

  // --------------------------------------------------------------------------
  // TEST 7: Mock and WebXR Service Framing Contract
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Service Framing Interface Compliance ---');
  const mockService = new MockARService();
  assert(typeof mockService.refitScene === 'function', 'Case 7a: MockARService implements refitScene');
  assert(typeof mockService.getFramingDiagnostics === 'function', 'Case 7b: MockARService implements getFramingDiagnostics');
  const mockDiag = mockService.getFramingDiagnostics();
  assert(mockDiag !== null && mockDiag.fitSuccess === true, 'Case 7c: MockARService returns valid framing diagnostics');

  const webxrService = new WebXRARService();
  assert(typeof webxrService.refitScene === 'function', 'Case 7d: WebXRARService implements refitScene');
  assert(typeof webxrService.getFramingDiagnostics === 'function', 'Case 7e: WebXRARService implements getFramingDiagnostics');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(` RESULTS: ${passed} / ${passed + failed} passed (${failed} failures)`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runARSceneFramingVerification().catch(err => {
  console.error('Unexpected error during ARSceneFraming verification:', err);
  process.exit(1);
});
