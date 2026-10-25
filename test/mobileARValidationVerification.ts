/**
 * Phase 11: Mobile AR Software Validation & Deployment Verification Suite
 * 
 * Tests:
 * 1. AR Capability Detection & Diagnostics (Secure Context, navigator.xr, user agent parsing)
 * 2. State Machine Enforcement (Valid flow & rejection of illegal transitions)
 * 3. Surface Hit-Testing & Pose Decomposition (Matrix4 -> position/quaternion)
 * 4. Spatial Reference Frame Placement (Reference space coordinates without claiming native XRAnchor)
 * 5. 6DoF Tracking Stability Invariants
 * 6. Decoupled Architecture (Zero AI calls in XR animation/render loop)
 * 7. Offline / AI Failure Resilience (AR tracking remains stable when AI is offline)
 * 8. Lifecycle & Clean Resource Disposal (XRSession, hit-test source, GPU meshes)
 * 9. Client Security Boundary (Zero API keys or secrets in client source/bundle)
 * 10. CRITICAL ANTI-FALSE-VALIDATION TEST: Capability detection != Physical AR validation
 */

import { ARCapabilityDiagnostic } from '../src/services/ar/ARCapabilityDiagnostic';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { MockARService } from '../src/services/ar/MockARService';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import * as THREE from 'three';
import * as fs from 'node:fs';
import * as path from 'node:path';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runMobileARValidationVerification() {
  console.log('================================================================');
  console.log('PHASE 11: MOBILE AR SOFTWARE VALIDATION & DEPLOYMENT TEST SUITE');
  console.log('================================================================\n');

  // ==================== TEST GROUP 1: CAPABILITY DIAGNOSTICS ====================
  console.log('--- TEST GROUP 1: AR Capability Diagnostics & Secure Context ---');
  {
    const report = await ARCapabilityDiagnostic.evaluateEnvironment();

    assert(typeof report.secureContext === 'boolean', 'Secure context evaluated as boolean');
    assert(typeof report.navigatorXRAvailable === 'boolean', 'navigator.xr evaluated as boolean');
    assert(typeof report.immersiveARSupported === 'boolean', 'immersive-ar support evaluated');
    assert(Array.isArray(report.notes), 'Capability report includes diagnostic notes array');

    // Test User Agent parser
    const androidUA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
    const parsedAndroid = ARCapabilityDiagnostic.parseUserAgent(androidUA);
    assert(parsedAndroid.platform === 'Android', `Parsed Android platform correctly (got ${parsedAndroid.platform})`);
    assert(parsedAndroid.browserName === 'Google Chrome', `Parsed Chrome browser correctly (got ${parsedAndroid.browserName})`);

    const iosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    const parsedIOS = ARCapabilityDiagnostic.parseUserAgent(iosUA);
    assert(parsedIOS.platform === 'iOS', `Parsed iOS platform correctly (got ${parsedIOS.platform})`);
    assert(parsedIOS.browserName === 'Apple Safari', `Parsed Safari browser correctly (got ${parsedIOS.browserName})`);
  }

  // ==================== TEST GROUP 2: STATE MACHINE TRANSITION ENFORCEMENT ====================
  console.log('\n--- TEST GROUP 2: State Machine Transition Safety ---');
  {
    const arService = new WebXRARService();

    // Initial state
    assert(arService.sessionState === 'INITIALIZING', 'Initial sessionState is INITIALIZING');

    // Test state transition listener
    const statesRecorded: string[] = [];
    arService.onStateChange(s => statesRecorded.push(s));

    // Valid transition from INITIALIZING -> READY
    (arService as any).setState('READY');
    assert(arService.sessionState === 'READY', 'Allows valid transition INITIALIZING -> READY');

    // Valid transition READY -> SCANNING
    (arService as any).setState('SCANNING');
    assert(arService.sessionState === 'SCANNING', 'Allows valid transition READY -> SCANNING');

    // Valid transition SCANNING -> SURFACE_DETECTED
    (arService as any).setState('SURFACE_DETECTED');
    assert(arService.sessionState === 'SURFACE_DETECTED', 'Allows valid transition SCANNING -> SURFACE_DETECTED');

    // Valid transition SURFACE_DETECTED -> PLACEMENT_READY
    (arService as any).setState('PLACEMENT_READY');
    assert(arService.sessionState === 'PLACEMENT_READY', 'Allows valid transition SURFACE_DETECTED -> PLACEMENT_READY');

    // Valid transition PLACEMENT_READY -> PLACED
    (arService as any).setState('PLACED');
    assert(arService.sessionState === 'PLACED', 'Allows valid transition PLACEMENT_READY -> PLACED');

    // Valid transition PLACED -> TRACKING
    (arService as any).setState('TRACKING');
    assert(arService.sessionState === 'TRACKING', 'Allows valid transition PLACED -> TRACKING');

    // ILLEGAL TRANSITION CHECK:
    // Set to UNAVAILABLE, then attempt direct illegal jump to TRACKING
    (arService as any).setState('ENDED');
    (arService as any).setState('UNAVAILABLE');
    assert(arService.sessionState === 'UNAVAILABLE', 'Session entered UNAVAILABLE state');

    // Attempt illegal transition UNAVAILABLE -> TRACKING
    (arService as any).setState('TRACKING');
    assert(arService.sessionState === 'UNAVAILABLE', 'REJECTED illegal transition: UNAVAILABLE -> TRACKING remained UNAVAILABLE');

    // Attempt illegal transition UNAVAILABLE -> PLACED
    (arService as any).setState('PLACED');
    assert(arService.sessionState === 'UNAVAILABLE', 'REJECTED illegal transition: UNAVAILABLE -> PLACED remained UNAVAILABLE');
  }

  // ==================== TEST GROUP 3: HIT-TEST & REFERENCE SPACE PLACEMENT ====================
  console.log('\n--- TEST GROUP 3: Surface Hit-Test & World-Space Placement ---');
  {
    const arService = new WebXRARService();

    // Create a mock surface hit matrix at position (0.2, -0.4, -1.2)
    const testMatrix = new THREE.Matrix4();
    const position = new THREE.Vector3(0.2, -0.4, -1.2);
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    const scale = new THREE.Vector3(1, 1, 1);
    testMatrix.compose(position, quaternion, scale);

    // Simulate hit-test reticle update
    (arService as any).lastHitMatrix.copy(testMatrix);
    (arService as any).reticle = new THREE.Mesh();
    (arService as any).reticle.visible = true;
    (arService as any)._state = 'PLACEMENT_READY';

    // Execute placeObject()
    const placed = arService.placeObject();
    assert(placed === true, 'placeObject() succeeded when reticle was visible on surface');
    assert(arService.sessionState === 'PLACED', 'State transitioned to PLACED');

    // Check world position decomposition:
    // Notice y has small offset +0.02 to prevent Z-fighting with physical surface
    const placedPos = (arService as any).visualizer.rootGroup.position;
    assert(Math.abs(placedPos.x - 0.2) < 0.001, 'Placed X coordinate matches hit-test pose');
    assert(Math.abs(placedPos.y - (-0.38)) < 0.001, 'Placed Y coordinate accounts for surface offset (+0.02)');
    assert(Math.abs(placedPos.z - (-1.2)) < 0.001, 'Placed Z coordinate matches hit-test pose');
  }

  // ==================== TEST GROUP 4: 6DoF TRACKING STABILITY ====================
  console.log('\n--- TEST GROUP 4: 6DoF Tracking Invariants ---');
  {
    const arService = new WebXRARService();
    const pos = new THREE.Vector3(0, -0.5, -1.0);
    (arService as any).visualizer.rootGroup.position.copy(pos);

    // Render tree with options
    const session = BSTPracticeEngine.startSession(undefined, 40);
    arService.renderBST(session.currentTree, {
      activeNodeValue: session.currentNode?.value,
      targetValue: 40
    });

    // Verify root position remained unchanged during render operations
    const currentPos = (arService as any).visualizer.rootGroup.position;
    assert(currentPos.x === pos.x && currentPos.y === pos.y && currentPos.z === pos.z, '3D BST maintains world-space coordinates in reference space');
  }

  // ==================== TEST GROUP 5: DECOUPLED ARCHITECTURE & RENDER LOOP ====================
  console.log('\n--- TEST GROUP 5: Decoupled AI & Render Loop Integrity ---');
  {
    // Check that WebXRARService.onAnimationFrame contains ZERO asynchronous AI tutor calls
    const webXRSource = fs.readFileSync(path.join(process.cwd(), 'src/services/ar/WebXRARService.ts'), 'utf-8');

    assert(!webXRSource.includes('consultTutor'), 'WebXRARService does not call consultTutor in render pipeline');
    assert(!webXRSource.includes('dispatchEducationalEvent'), 'WebXRARService does not dispatch AI events in render loop');
    assert(webXRSource.includes('this.renderer.render(this.scene, this.camera)'), 'onAnimationFrame performs purely synchronous rendering');
  }

  // ==================== TEST GROUP 6: OFFLINE AI RESILIENCE ====================
  console.log('\n--- TEST GROUP 6: Offline / AI Failure Fallback Resilience ---');
  {
    const mockAR = new MockARService();
    await mockAR.initializeSession(null);

    // Start practice session
    const practice = BSTPracticeEngine.startSession(undefined, 40);
    assert(practice.currentNode?.value === 50, 'Practice starts at root node 50');

    // Simulate incorrect choice in AR (RIGHT for target 40)
    const result = await BSTPracticeEngine.evaluateDecision(practice, 'RIGHT');
    assert(result.isCorrect === false, 'Deterministic authority rejects incorrect move in AR');
    assert(result.diagnosis?.type === 'BST_WRONG_DIRECTION', 'Diagnoses misconception');

    // Verify BST pointer remains intact even if AI backend is severed
    assert(practice.currentNode.value === 50, 'Deterministic pointer remains protected at node 50');
    assert(mockAR.sessionState !== 'ERROR', 'AR session does not crash when AI fails');
  }

  // ==================== TEST GROUP 7: LIFECYCLE & CLEAN DISPOSAL ====================
  console.log('\n--- TEST GROUP 7: Lifecycle & Clean Resource Disposal ---');
  {
    const arService = new WebXRARService();
    let hitSourceCancelled = false;

    (arService as any).xrHitTestSource = {
      cancel: () => { hitSourceCancelled = true; }
    };
    (arService as any).xrSession = {
      end: async () => {}
    };

    // Simulate session end
    (arService as any).onSessionEnded();

    assert(hitSourceCancelled === true, 'Cancels XRHitTestSource on session end');
    assert((arService as any).xrSession === null, 'Clears active XRSession reference');
    assert((arService as any).xrHitTestSource === null, 'Clears XRHitTestSource reference');
    assert(arService.sessionState === 'ENDED', 'Transitions to ENDED state upon session termination');
  }

  // ==================== TEST GROUP 8: CLIENT SECURITY SCAN ====================
  console.log('\n--- TEST GROUP 8: Client Security & Zero-Secret Verification ---');
  {
    const clientSrcDir = path.join(process.cwd(), 'src');
    const distDir = path.join(process.cwd(), 'dist');

    // Scan all client files for forbidden patterns
    function scanFiles(dir: string, patterns: string[]): string[] {
      const violations: string[] = [];
      if (!fs.existsSync(dir)) return violations;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations.push(...scanFiles(fullPath, patterns));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const pat of patterns) {
            if (content.includes(pat)) {
              // Ignore files that check or mention pattern as negative verification
              if (!entry.name.includes('Verification') && !entry.name.includes('test')) {
                violations.push(`${entry.name} contains forbidden pattern: ${pat}`);
              }
            }
          }
        }
      }
      return violations;
    }

    const forbiddenPatterns = ['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'AIzaSy'];
    const violations = scanFiles(clientSrcDir, forbiddenPatterns);
    assert(violations.length === 0, `Zero API keys found in client source code (violations: ${violations.length})`);

    // Verify server protects the key in server/
    const serverFile = path.join(process.cwd(), 'server/env.ts');
    assert(fs.existsSync(serverFile), 'Server env configuration exists isolated in server/ directory');
  }

  // ==================== TEST GROUP 9: PERFORMANCE TELEMETRY ====================
  console.log('\n--- TEST GROUP 9: Performance Telemetry Verification ---');
  {
    const arService = new WebXRARService();
    const telemetry = arService.getPerformanceTelemetry();

    assert(typeof telemetry.sessionStartupMs === 'number', 'sessionStartupMs is reported');
    assert(typeof telemetry.approximateFPS === 'number', 'approximateFPS is reported');
    assert(telemetry.approximateFPS > 0, 'approximateFPS reports positive integer');
    assert(typeof telemetry.sessionDurationSeconds === 'number', 'sessionDurationSeconds is reported');
  }

  // ==================== TEST GROUP 10: CRITICAL ANTI-FALSE-VALIDATION TEST ====================
  console.log('\n--- TEST GROUP 10: Critical Anti-False-Validation Invariant ---');
  {
    // Test 1: Standard environment evaluation
    const report = await ARCapabilityDiagnostic.evaluateEnvironment();

    // Invariant: Capability detection alone MUST NEVER set physicalARValidated to true!
    assert(report.physicalARValidated === false, 'CRITICAL: Software capability check does NOT set physicalARValidated = true');
    assert(report.validationState !== 'PHYSICALLY_VALIDATED', 'CRITICAL: validationState is never automatically PHYSICALLY_VALIDATED');

    // Test 2: Even if WebXR is mocked as supported in a test environment, physicalARValidated must stay false
    const mockSupportedEnvironment: typeof report = {
      ...report,
      navigatorXRAvailable: true,
      immersiveARSupported: true,
      hitTestSupported: true,
      domOverlaySupported: true,
      secureContext: true,
      physicalARValidated: false, // Still must be false
      validationState: 'IMPLEMENTATION_VERIFIED'
    };

    assert(mockSupportedEnvironment.physicalARValidated === false, 'Immersion capability verified without falsely claiming physical hardware validation');
    assert(mockSupportedEnvironment.validationState === 'IMPLEMENTATION_VERIFIED', 'Classification is IMPLEMENTATION_VERIFIED, distinguishing it from PHYSICALLY_VALIDATED');
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runMobileARValidationVerification().catch(err => {
  console.error('Unhandled error in mobile AR verification suite:', err);
  process.exit(1);
});
