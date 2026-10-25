/**
 * PHASE 13: REAL MOBILE AR DEPLOYMENT & PHYSICAL DEVICE VALIDATION VERIFICATION SUITE
 * 
 * Verifies:
 * 1. ARCapabilityDiagnostic schema, secure context rules, and anti-fabrication invariants
 * 2. Standalone server network configuration (HOST 0.0.0.0 binding & /api/health endpoint)
 * 3. Client security & zero-secret scan across source and compiled bundles
 * 4. Camera privacy invariant (zero video stream capture or frame transmission routines)
 * 5. Canonical BST demonstration scenario (Target 40 at node 50: error RIGHT rejected, LEFT accepted)
 * 6. State machine lifecycle transitions and teardown safety
 * 7. Mobile evidence directory completeness (device-information.md and AR-01 through AR-09)
 * 8. Terminology integrity ("surface hit-test placement", zero false claims of physical validation)
 */

import fs from 'node:fs';
import path from 'node:path';
import { ARCapabilityDiagnostic } from '../src/services/ar/ARCapabilityDiagnostic';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { DSARegistry } from '../src/services/dsa/core/DSARegistry';

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  } else {
    passedTests++;
    console.log(`  ✓ ${message}`);
  }
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runPhase13Verification(): Promise<void> {
  console.log('================================================================');
  console.log('PHASE 13: REAL MOBILE AR DEPLOYMENT & PHYSICAL VALIDATION SUITE');
  console.log('================================================================');

  // ==================== TEST GROUP 1: AR CAPABILITY DIAGNOSTIC ====================
  console.log('\n--- TEST GROUP 1: AR Capability Diagnostic & Secure Context Rules ---');
  {
    const report = await ARCapabilityDiagnostic.evaluateEnvironment();

    assert(typeof report.secureContext === 'boolean', 'Secure context is evaluated as boolean');
    assert(typeof report.navigatorXRAvailable === 'boolean', 'navigator.xr evaluated as boolean');
    assert(typeof report.immersiveARSupported === 'boolean', 'immersiveARSupported evaluated as boolean');
    assert(typeof report.hitTestSupported === 'boolean', 'hitTestSupported evaluated as boolean');
    assert(Array.isArray(report.notes), 'Diagnostic notes array is present');

    // Anti-Fabrication invariant: physical validation MUST remain false in automated test runs
    assert(report.physicalARValidated === false, 'CRITICAL: physicalARValidated is strictly FALSE in automated tests');
    assert(report.validationState !== 'PHYSICALLY_VALIDATED', 'CRITICAL: validationState is never automatically PHYSICALLY_VALIDATED');
    assert(['CAPABILITY_ONLY', 'IMPLEMENTATION_VERIFIED'].includes(report.validationState), 'validationState is honest to current environment');

    // User-agent parser verification
    const androidChrome = ARCapabilityDiagnostic.parseUserAgent(
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    );
    assert(androidChrome.platform === 'Android', 'Parsed Android platform correctly');
    assert(androidChrome.browserName === 'Google Chrome', 'Parsed Chrome browser correctly');

    const iosSafari = ARCapabilityDiagnostic.parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    );
    assert(iosSafari.platform === 'iOS', 'Parsed iOS platform correctly');
    assert(iosSafari.browserName === 'Apple Safari', 'Parsed Safari browser correctly');
  }

  // ==================== TEST GROUP 2: SERVER NETWORK & DEPLOYMENT CONFIG ====================
  console.log('\n--- TEST GROUP 2: Standalone Server & Vite Network Configuration ---');
  {
    const serverPath = path.join(process.cwd(), 'server/server.ts');
    assert(fs.existsSync(serverPath), 'server/server.ts exists');

    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    assert(serverContent.includes("process.env.HOST || '0.0.0.0'"), 'Server binds to HOST defaulting to 0.0.0.0 for LAN/tunnel access');
    assert(serverContent.includes("server.listen(PORT, HOST"), 'server.listen accepts both PORT and HOST parameters');
    assert(serverContent.includes("parsedPath === '/api/health'"), 'Server exposes general /api/health endpoint');
    assert(serverContent.includes("handleAiApiRequest"), 'Server delegates /api/* to AI API router');

    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');
    assert(viteContent.includes("host: '0.0.0.0'"), 'vite.config.ts configures host binding 0.0.0.0 for mobile dev testing');
  }

  // ==================== TEST GROUP 3: CLIENT ZERO-SECRET & PRIVACY AUDIT ====================
  console.log('\n--- TEST GROUP 3: Client Zero-Secret & Strict Privacy Audit ---');
  {
    const clientSrc = path.join(process.cwd(), 'src');
    const distAssets = path.join(process.cwd(), 'dist/assets');

    function searchFiles(dir: string, patterns: string[]): string[] {
      const matches: string[] = [];
      if (!fs.existsSync(dir)) return matches;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          matches.push(...searchFiles(fullPath, patterns));
        } else if (entry.isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const p of patterns) {
            if (content.includes(p)) {
              if (!entry.name.includes('Verification') && !entry.name.includes('test')) {
                matches.push(`${entry.name}: ${p}`);
              }
            }
          }
        }
      }
      return matches;
    }

    const srcViolations = searchFiles(clientSrc, ['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'AIzaSy']);
    assert(srcViolations.length === 0, 'Zero API keys found in client source code');

    if (fs.existsSync(distAssets)) {
      const distViolations = searchFiles(distAssets, ['AIzaSy', 'VITE_GEMINI_API_KEY']);
      assert(distViolations.length === 0, 'Zero API keys found in compiled dist/assets/ bundle');
    }

    // Camera privacy: Verify zero canvas capture / media upload routines
    const uploadRoutines = searchFiles(clientSrc, ['toDataURL', 'getImageData', 'navigator.mediaDevices.getUserMedia']);
    // Note: WebXR uses browser camera passthrough, NOT getUserMedia or toDataURL uploads
    assert(uploadRoutines.length === 0, 'Zero canvas frame uploads or camera recording routines found in client');
  }

  // ==================== TEST GROUP 4: CANONICAL BST DEMONSTRATION SCENARIO ====================
  console.log('\n--- TEST GROUP 4: Canonical BST Demonstration Invariant (Target 40 at Node 50) ---');
  {
    const sampleTree = BSTEngine.createSampleTree();
    assert(sampleTree.value === 50, 'BST sample root is 50');
    assert(sampleTree.left?.value === 30, 'BST left child is 30');
    assert(sampleTree.right?.value === 70, 'BST right child is 70');
    assert(sampleTree.left?.left?.value === 20, 'BST left-left child is 20');
    assert(sampleTree.left?.right === null, 'BST left-right child is initially null before inserting 40');

    // Start practice session with target 40
    const practice = BSTPracticeEngine.startSession(sampleTree, 40);
    assert(practice.currentNode?.value === 50, 'Practice session starts with active node 50');
    assert(practice.targetValue === 40, 'Target value is 40');
    assert(practice.isComplete === false, 'Practice session is not complete initially');

    // Intentional student mistake: Choose RIGHT at node 50
    const mistakeResult = await BSTPracticeEngine.evaluateDecision(practice, 'RIGHT');
    assert(mistakeResult.isCorrect === false, 'Deterministic authority strictly REJECTS incorrect RIGHT move');
    assert(mistakeResult.diagnosis?.type === 'BST_WRONG_DIRECTION', 'Misconception diagnosed as BST_WRONG_DIRECTION');
    assert(practice.currentNode.value === 50, 'Active node pointer remains firmly locked at 50');

    // Authoritative correct step: Choose LEFT at node 50
    const correctStep1 = await BSTPracticeEngine.evaluateDecision(practice, 'LEFT');
    assert(correctStep1.isCorrect === true, 'Deterministic authority ACCEPTS correct LEFT move');
    assert(practice.currentNode.value === 30, 'Active node pointer advances to left child 30');

    // Final step at node 30: Target 40 > 30 -> Choose RIGHT
    const correctStep2 = await BSTPracticeEngine.evaluateDecision(practice, 'RIGHT');
    assert(correctStep2.isCorrect === true, 'Deterministic authority ACCEPTS correct RIGHT move at node 30');
    assert(practice.isComplete === true, 'Practice session completes successfully');
    assert(practice.currentTree?.left?.right?.value === 40, 'Node 40 is successfully inserted as left-right child');
  }

  // ==================== TEST GROUP 5: AR SERVICE LIFECYCLE & TEARDOWN ====================
  console.log('\n--- TEST GROUP 5: WebXRARService Lifecycle & State Transition Safety ---');
  {
    const arService = new WebXRARService();
    assert(arService.sessionState === 'INITIALIZING', 'Initial session state is INITIALIZING');

    // Valid transitions using authoritative state machine
    (arService as any).setState('READY');
    assert(arService.sessionState === 'READY', 'Allows transition INITIALIZING -> READY');

    (arService as any).setState('SCANNING');
    assert(arService.sessionState === 'SCANNING', 'Allows transition READY -> SCANNING');

    (arService as any).setState('SURFACE_DETECTED');
    assert(arService.sessionState === 'SURFACE_DETECTED', 'Allows transition SCANNING -> SURFACE_DETECTED');

    (arService as any).setState('PLACEMENT_READY');
    assert(arService.sessionState === 'PLACEMENT_READY', 'Allows transition SURFACE_DETECTED -> PLACEMENT_READY');

    (arService as any).setState('PLACED');
    assert(arService.sessionState === 'PLACED', 'Allows transition PLACEMENT_READY -> PLACED');

    (arService as any).setState('TRACKING');
    assert(arService.sessionState === 'TRACKING', 'Allows transition PLACED -> TRACKING');

    // Clean session teardown
    await arService.disposeSession();
    assert(arService.sessionState === 'ENDED', 'Transitions to ENDED upon session termination');
  }

  // ==================== TEST GROUP 6: MOBILE EVIDENCE DIRECTORY INTEGRITY ====================
  console.log('\n--- TEST GROUP 6: Mobile Evidence Directory & Checklist Completeness ---');
  {
    const mobileEvidenceDir = path.join(process.cwd(), 'docs/evidence/mobile');
    assert(fs.existsSync(mobileEvidenceDir), 'docs/evidence/mobile/ directory exists');

    const devInfoPath = path.join(mobileEvidenceDir, 'device-information.md');
    assert(fs.existsSync(devInfoPath), 'docs/evidence/mobile/device-information.md exists');
    const devInfoContent = fs.readFileSync(devInfoPath, 'utf-8');
    assert(devInfoContent.includes('PENDING PHYSICAL TEST'), 'device-information.md explicitly marks status PENDING PHYSICAL TEST');

    const expectedFolders = [
      'AR-01-app-launch',
      'AR-02-ar-session',
      'AR-03-camera',
      'AR-04-surface-detection',
      'AR-05-placement',
      'AR-06-tracking',
      'AR-07-interaction',
      'AR-08-ai-tutor',
      'AR-09-lifecycle'
    ];

    for (const folder of expectedFolders) {
      const folderPath = path.join(mobileEvidenceDir, folder);
      assert(fs.existsSync(folderPath), `Evidence folder ${folder} exists`);
      const readmePath = path.join(folderPath, 'README.md');
      assert(fs.existsSync(readmePath), `${folder}/README.md exists`);
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');
      assert(readmeContent.includes('PENDING PHYSICAL TEST'), `${folder}/README.md marks status PENDING PHYSICAL TEST`);
    }

    const checklistPath = path.join(process.cwd(), 'docs/validation/mobile-ar-physical-checklist.md');
    assert(fs.existsSync(checklistPath), 'docs/validation/mobile-ar-physical-checklist.md exists');
    const checklistContent = fs.readFileSync(checklistPath, 'utf-8');
    assert(checklistContent.includes('AR-01') && checklistContent.includes('AR-13'), 'Checklist contains all tests AR-01 through AR-13');
  }

  // ==================== TEST GROUP 7: TERMINOLOGY CONSISTENCY ====================
  console.log('\n--- TEST GROUP 7: Terminology Invariant Audit ---');
  {
    const checklistPath = path.join(process.cwd(), 'docs/validation/mobile-ar-physical-checklist.md');
    const content = fs.readFileSync(checklistPath, 'utf-8');

    assert(!content.includes('ground-plane anchoring'), 'Checklist avoids inaccurate "ground-plane anchoring" terminology');
    assert(content.includes('surface hit-test placement'), 'Checklist uses accurate "surface hit-test placement" terminology');

    // Confirm registry maintains exactly 1 AR_READY topic
    const allEngines = DSARegistry.getAllEngines();
    const arEngines = allEngines.filter(e => e.visualizationCapability === 'AR_READY');
    assert(arEngines.length === 1 && arEngines[0].topicId === 'ds-binary-search-tree', 'Authoritative registry maintains exactly 1 AR_READY topic (BST)');
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase13Verification().catch(err => {
  console.error('Unhandled error in Phase 13 verification:', err);
  process.exit(1);
});
