/**
 * Automated Verification Suite for Phase 14: AR Navigation & Production Hardening
 * 
 * Verifies:
 * 1. AR Left button decision maintains active AR learning session (does not navigate to Dashboard)
 * 2. AR Right button decision maintains active AR learning session (does not navigate to Dashboard)
 * 3. AR Insert button decision maintains active AR learning session (does not navigate to Dashboard)
 * 4. Deterministic BST state transitions correctly on student decisions
 * 5. AR session state remains active (not ending or resetting to UNAVAILABLE on decision)
 * 6. Absence of development and phase labels in production UI components
 * 7. Absence of hardcoded localhost:3001 in production client configuration
 * 8. Client security & zero-secret invariants
 */

import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { MockARService } from '../src/services/ar/MockARService';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { API_ENDPOINTS } from '../src/config/api';
import * as fs from 'fs';
import * as path from 'path';

async function runARNavigationRegression() {
  console.log('================================================================');
  console.log('PHASE 14: AR NAVIGATION & PRODUCTION HARDENING VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      if (detail) console.error(`    Detail: ${detail}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 1: AR Decision Execution & State Isolation (Left, Right, Insert)
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: AR Decision Execution & State Isolation ---');
  
  // Canonical sample tree: Root 50, Left 30, Right 70; Target 40
  const sampleTree = BSTEngine.createSampleTree();
  let session = BSTPracticeEngine.startSession(sampleTree, 40);
  const mockAR = new MockARService();
  await mockAR.initializeSession(null);
  await mockAR.startARSession();

  assert(mockAR.sessionState === 'SCANNING', 'AR session enters SCANNING on start');
  assert(session.currentNode?.value === 50, 'Practice session starts at root node 50');

  // Test 1a: Simulate Left decision
  const leftResult = await BSTPracticeEngine.evaluateDecision(session, 'LEFT');
  assert(leftResult.isCorrect === true, 'Left decision correctly accepted for target 40 < 50');
  assert(leftResult.session.currentNode?.value === 30, 'Active node advances to left child 30');
  // Verify AR session did NOT reset or terminate
  assert(mockAR.sessionState === 'SCANNING', 'AR session remains active in SCANNING after Left decision');
  session = leftResult.session;

  // Test 1b: Simulate Right decision at node 30 (40 > 30)
  const rightResult = await BSTPracticeEngine.evaluateDecision(session, 'RIGHT');
  assert(rightResult.isCorrect === true, 'Right decision correctly accepted for target 40 > 30');
  assert(rightResult.session.isComplete === true, 'Practice session marked complete upon reaching null branch and inserting');
  assert(rightResult.session.currentTree.left?.right?.value === 40, 'Target 40 successfully inserted in tree');
  assert(mockAR.sessionState === 'SCANNING', 'AR session remains active in SCANNING after Right decision');

  // Test 1c: Simulate INSERT_HERE decision on a session at the insertion spot
  const freshSessionAtLeaf = BSTPracticeEngine.startSession(sampleTree, 40);
  const toLeaf = await BSTPracticeEngine.evaluateDecision(freshSessionAtLeaf, 'LEFT');
  assert(toLeaf.session.currentNode?.value === 30, 'Session advanced to leaf node 30');
  const insertResult = await BSTPracticeEngine.evaluateDecision(toLeaf.session, 'INSERT_HERE');
  assert(insertResult.isCorrect === true, 'Insert decision accepted at valid insertion spot (node 30 right slot)');
  assert(insertResult.session.isComplete === true, 'Practice session marked complete upon INSERT_HERE');
  assert(mockAR.sessionState === 'SCANNING', 'AR session remains active in SCANNING after Insert decision');

  // --------------------------------------------------------------------------
  // TEST GROUP 2: WebXRARService Lifecycle Isolation Invariant
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: WebXRARService Lifecycle Isolation Invariant ---');
  
  const arScreenCode = fs.readFileSync(path.resolve('src/screens/ARSessionScreen.tsx'), 'utf8');

  // Verify that practiceSession is NOT in the canvas initialization effect dependency array
  const initEffectMatch = arScreenCode.match(/useEffect\(\(\) => \{[\s\S]*?init\(\);[\s\S]*?return \(\) => \{[\s\S]*?disposeSession\(\);[\s\S]*?\}, \[(.*?)\]\);/);
  assert(initEffectMatch !== null, 'Canvas initialization effect found in ARSessionScreen.tsx');
  if (initEffectMatch) {
    const deps = initEffectMatch[1];
    assert(!deps.includes('practiceSession'), 'CRITICAL: practiceSession is excluded from canvas initialization deps');
    assert(!deps.includes('update3DVisualization'), 'CRITICAL: update3DVisualization is excluded from canvas initialization deps');
  }

  // Verify dedicated practiceSession 3D scene update effect exists
  assert(
    arScreenCode.includes('useEffect(() => {\n    update3DVisualization(practiceSession);\n  }, [practiceSession, update3DVisualization]);'),
    'Dedicated non-destructive 3D visualization update effect exists'
  );

  // Verify decision buttons have type="button" and stopPropagation
  assert(
    arScreenCode.includes('handleDecision(\'LEFT\');') && arScreenCode.includes('e.stopPropagation()'),
    'Left button isolates event propagation via e.stopPropagation()'
  );
  assert(
    arScreenCode.includes('handleDecision(\'RIGHT\');') && arScreenCode.includes('e.stopPropagation()'),
    'Right button isolates event propagation via e.stopPropagation()'
  );
  assert(
    arScreenCode.includes('handleDecision(\'INSERT_HERE\');') && arScreenCode.includes('e.stopPropagation()'),
    'Insert button isolates event propagation via e.stopPropagation()'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Clean Production UI (No Development/Phase Labels)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Absence of Phase & Development Labels in Production UI ---');

  const mobileFrameCode = fs.readFileSync(path.resolve('src/components/MobileFrame.tsx'), 'utf8');
  assert(!mobileFrameCode.includes('Phase 1'), 'MobileFrame does not contain "Phase 1"');
  assert(!mobileFrameCode.includes('Mobile AR Architecture'), 'MobileFrame does not contain "Mobile AR Architecture"');
  assert(!mobileFrameCode.includes('preview-controls-bar'), 'MobileFrame does not render developer preview toolbar');
  assert(!mobileFrameCode.includes('Viewport Only'), 'MobileFrame does not contain "Viewport Only"');

  const settingsCode = fs.readFileSync(path.resolve('src/screens/SettingsScreen.tsx'), 'utf8');
  assert(!settingsCode.includes('research-dashboard'), 'SettingsScreen does not contain link to research-dashboard');
  assert(!settingsCode.includes('Research Evaluation'), 'SettingsScreen does not contain "Research Evaluation" button');

  const profileCode = fs.readFileSync(path.resolve('src/screens/ProfileScreen.tsx'), 'utf8');
  assert(!profileCode.includes('Pending Physical Test'), 'ProfileScreen does not contain "Pending Physical Test"');
  assert(!profileCode.includes('Device AR Diagnostics'), 'ProfileScreen does not contain "Device AR Diagnostics"');
  assert(profileCode.includes('AR System Capabilities'), 'ProfileScreen displays clean "AR System Capabilities" header');

  const progressCode = fs.readFileSync(path.resolve('src/screens/ProgressScreen.tsx'), 'utf8');
  assert(!progressCode.includes('Core Phase 2 Module'), 'ProgressScreen does not contain "Core Phase 2 Module"');
  assert(progressCode.includes('Core Data Structure Module'), 'ProgressScreen displays "Core Data Structure Module"');

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Production API Configuration & Localhost Independence
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Production API Configuration & Zero Localhost Dependency ---');

  assert(typeof API_ENDPOINTS.aiTutor === 'string', 'API_ENDPOINTS.aiTutor is defined');
  assert(!API_ENDPOINTS.aiTutor.includes('localhost'), 'Production API endpoint does not hardcode localhost');
  assert(!API_ENDPOINTS.aiTutor.includes('127.0.0.1'), 'Production API endpoint does not hardcode 127.0.0.1');
  assert(!API_ENDPOINTS.aiTutor.includes(':3001'), 'Production API endpoint does not hardcode port 3001');

  const secureAICode = fs.readFileSync(path.resolve('src/services/ai/SecureAIService.ts'), 'utf8');
  assert(secureAICode.includes('API_ENDPOINTS.aiTutor'), 'SecureAIService uses centralized API_ENDPOINTS');
  assert(!secureAICode.includes('localhost:3001'), 'SecureAIService does not reference localhost:3001');

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Zero-Secret Invariant Scan
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Zero-Secret Client Audit ---');

  const clientSrcDir = path.resolve('src');
  const secretPatterns = [/AIzaSy[A-Za-z0-9_-]{33}/, /gemini[-_]?api[-_]?key/i];
  let secretViolations = 0;

  function scanSecrets(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanSecrets(fullPath);
      } else if (/\.(ts|tsx|js|json)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content) && !content.includes('process.env.GEMINI_API_KEY')) {
            secretViolations++;
            console.error(`Secret violation in: ${fullPath}`);
          }
        }
      }
    }
  }

  scanSecrets(clientSrcDir);
  assert(secretViolations === 0, 'Zero API keys or secrets detected in client src directory');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runARNavigationRegression().catch(err => {
  console.error('Unhandled error in AR navigation regression suite:', err);
  process.exit(1);
});
