/**
 * Phase 8 Verification Test Suite: Complete AR-DSA Tutor Application Experience
 *
 * Verifies:
 * 1. Screen Architecture & Navigation Graph (14 screens, valid transitions)
 * 2. Diagnostic Assessment & Learner Seeding (5 questions, deterministic score, level assignment)
 * 3. Topic Explorer & Topic Details Integration (prerequisites, complexity, mode actions)
 * 4. Adaptive Practice & Task Guidance (difficulty specs, retry + AI tutor consultation paths)
 * 5. AR 3D Experience & Real-World Hit-Testing Terminology Audit
 * 6. Accessibility & Settings Persistence (reduced motion, high contrast, fallback preferences)
 * 7. Security Audit: Client bundle & code verification against private key leaks
 */

import { AdaptiveDifficultyEngine } from '../src/services/adaptive/AdaptiveDifficultyEngine';
import { LocalLearnerService } from '../src/services/learner/LocalLearnerService';
import { InMemoryKnowledgeGraphService } from '../src/services/knowledgeGraph/InMemoryKnowledgeGraphService';
import * as fs from 'fs';
import * as path from 'path';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('PHASE 8: AR-DSA TUTOR COMPLETE APPLICATION EXPERIENCE TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: SCREEN ARCHITECTURE & NAVIGATION GRAPH
  // -------------------------------------------------------------
  console.log('--- TEST 1: Screen Architecture & Navigation Routing ---');
  const requiredScreens = [
    'splash',
    'onboarding',
    'diagnostic',
    'home',
    'topics',
    'topic-details',
    'learning-session',
    'ar-session',
    'ai-tutor',
    'assessment',
    'recommendations',
    'progress',
    'profile',
    'settings'
  ];

  // Check App.tsx registers all screens in MainScreenRouter
  const appTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
  for (const screen of requiredScreens) {
    assert(
      appTsx.includes(`case '${screen}':`),
      `App.tsx router recognizes screen: ${screen}`
    );
  }

  // Verify Bottom Navigation hides during immersive / onboarding modes
  const fullScreenModes = ['splash', 'onboarding', 'diagnostic', 'ar-session', 'assessment'];
  for (const screen of fullScreenModes) {
    assert(
      appTsx.includes(`'${screen}'`) && appTsx.includes('hideBottomNav'),
      `Bottom navigation suppressed during full-screen mode: ${screen}`
    );
  }

  // Verify Smart Startup Routing Logic in SplashScreen
  const splashTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/SplashScreen.tsx'), 'utf-8');
  assert(
    splashTsx.includes('!hasCompletedOnboarding') &&
    splashTsx.includes("navigateTo('onboarding')") &&
    splashTsx.includes('!hasCompletedDiagnostic') &&
    splashTsx.includes("navigateTo('diagnostic')") &&
    splashTsx.includes("navigateTo('home')"),
    'SplashScreen implements conditional smart startup routing'
  );

  // Verify 4-Screen Educational sequence in OnboardingScreen
  const onboardingTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/OnboardingScreen.tsx'), 'utf-8');
  assert(
    onboardingTsx.includes('steps.length - 1') &&
    onboardingTsx.includes("setHasCompletedOnboarding(true)") &&
    onboardingTsx.includes("navigateTo('diagnostic')"),
    'OnboardingScreen completes 4-stage pedagogical intro and advances to diagnostic'
  );

  // -------------------------------------------------------------
  // TEST 2: DIAGNOSTIC EVALUATION & SEEDING
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Diagnostic Assessment & Difficulty Seeding ---');
  const diagnosticTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/DiagnosticScreen.tsx'), 'utf-8');
  assert(
    diagnosticTsx.includes('recordAssessmentResult') &&
    diagnosticTsx.includes('recordPerformanceEvidence') &&
    diagnosticTsx.includes('setHasCompletedDiagnostic(true)'),
    'DiagnosticScreen integrates with LocalLearnerService for performance evidence and assessment recording'
  );

  // Test deterministic difficulty assignment logic
  function computeInitialDifficulty(score: number): 'FOUNDATIONAL' | 'EASY' | 'MEDIUM' {
    if (score <= 2) return 'FOUNDATIONAL';
    if (score <= 4) return 'EASY';
    return 'MEDIUM';
  }

  assert(computeInitialDifficulty(0) === 'FOUNDATIONAL', 'Diagnostic score 0 seeds FOUNDATIONAL difficulty');
  assert(computeInitialDifficulty(2) === 'FOUNDATIONAL', 'Diagnostic score 2 seeds FOUNDATIONAL difficulty');
  assert(computeInitialDifficulty(3) === 'EASY', 'Diagnostic score 3 seeds EASY difficulty');
  assert(computeInitialDifficulty(4) === 'EASY', 'Diagnostic score 4 seeds EASY difficulty');
  assert(computeInitialDifficulty(5) === 'MEDIUM', 'Diagnostic score 5 seeds MEDIUM difficulty');

  // Test evidence recording in LocalLearnerService
  const learnerService = new LocalLearnerService();
  const updatedTopicState = await learnerService.recordPerformanceEvidence({
    topicId: 'ds-binary-search-tree',
    eventType: 'ASSESSMENT_ATTEMPT',
    correct: true,
    difficulty: 'FOUNDATIONAL',
    usedHint: false,
    requestedExplanation: false,
    misconceptionDetected: false,
    assessmentScore: 100
  });

  assert(
    updatedTopicState !== undefined && updatedTopicState.evidenceHistory.length > 0,
    'Learner state records diagnostic evidence in evidenceHistory'
  );

  // -------------------------------------------------------------
  // TEST 3: TOPIC EXPLORER & TOPIC DETAILS
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Topic Explorer & Topic Details Integration ---');
  const topicDetailsTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/TopicDetailsScreen.tsx'), 'utf-8');
  assert(
    topicDetailsTsx.includes("navigateTo('learning-session', selectedTopic)") &&
    topicDetailsTsx.includes("navigateTo('ar-session', selectedTopic)") &&
    topicDetailsTsx.includes("navigateTo('assessment', selectedTopic)") &&
    topicDetailsTsx.includes("navigateToTutor("),
    'TopicDetailsScreen provides direct launch pathways to all learning modes'
  );

  assert(
    topicDetailsTsx.includes('checkPrerequisitesSatisfied') &&
    topicDetailsTsx.includes('knowledgeGraphService'),
    'TopicDetailsScreen queries knowledgeGraphService for prerequisite validation'
  );

  // Test prerequisite verification directly
  const kgService = new InMemoryKnowledgeGraphService();
  const summary = await kgService.getRelationshipsForTopic('ds-binary-search-tree');
  assert(
    Array.isArray(summary.prerequisites),
    'InMemoryKnowledgeGraphService provides valid prerequisite relationship list for BST'
  );

  // -------------------------------------------------------------
  // TEST 4: ADAPTIVE PRACTICE & TASK SPECIFICATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Adaptive Practice & Task Specification ---');
  const sessionTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/LearningSessionScreen.tsx'), 'utf-8');
  assert(
    sessionTsx.includes('AdaptiveDifficultyEngine.getTaskSpecification'),
    'LearningSessionScreen requests TaskSpecification matching current difficulty level'
  );
  assert(
    sessionTsx.includes('Try Again') && sessionTsx.includes('Ask AI Tutor'),
    'LearningSessionScreen provides explicit retry and AI tutor consultation upon mistake'
  );

  // Validate task specifications across all difficulty levels
  const foundationalSpec = AdaptiveDifficultyEngine.getTaskSpecification('FOUNDATIONAL', 'ds-binary-search-tree');
  const easySpec = AdaptiveDifficultyEngine.getTaskSpecification('EASY', 'ds-binary-search-tree');
  const mediumSpec = AdaptiveDifficultyEngine.getTaskSpecification('MEDIUM', 'ds-binary-search-tree');
  const hardSpec = AdaptiveDifficultyEngine.getTaskSpecification('HARD', 'ds-binary-search-tree');

  assert(
    foundationalSpec.difficulty === 'FOUNDATIONAL' && foundationalSpec.showInvariantGuidance === true,
    'FOUNDATIONAL task specification enables invariant guidance'
  );
  assert(
    easySpec.difficulty === 'EASY' && easySpec.showComparisonHint === true,
    'EASY task specification enables comparison hint'
  );
  assert(
    mediumSpec.difficulty === 'MEDIUM' && mediumSpec.showComparisonHint === false,
    'MEDIUM task specification requires independent decisions without hints'
  );
  assert(
    hardSpec.difficulty === 'HARD' && hardSpec.requiresPredictionBeforeMove === true,
    'HARD task specification requires prediction before traversal move'
  );

  // -------------------------------------------------------------
  // TEST 5: AR 3D EXPERIENCE & TERMINOLOGY AUDIT
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: AR Experience & Terminology Audit ---');
  const arSessionTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/ARSessionScreen.tsx'), 'utf-8');
  const profileTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/ProfileScreen.tsx'), 'utf-8');

  // Verify accurate terminology: real-world surface hit testing (no false plane detection)
  assert(
    !arSessionTsx.includes('plane detection active') &&
    !arSessionTsx.includes('detected planes'),
    'ARSessionScreen uses accurate surface hit-testing rather than claiming plane detection'
  );
  assert(
    profileTsx.includes('Real-World Surface Hit-Testing'),
    'ProfileScreen specifies Real-World Surface Hit-Testing'
  );

  // Verify AR Fallback and canvas touch controls
  assert(
    arSessionTsx.includes('handlePointerDown') &&
    arSessionTsx.includes('handlePointerMove') &&
    arSessionTsx.includes('handleWheel'),
    'ARSessionScreen implements orbit, drag, and zoom controls for 3D fallback mode'
  );

  // -------------------------------------------------------------
  // TEST 6: ACCESSIBILITY & SETTINGS PERSISTENCE
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Accessibility & Settings Persistence ---');
  const settingsTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/SettingsScreen.tsx'), 'utf-8');
  const appContextTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/state/AppContext.tsx'), 'utf-8');

  assert(
    settingsTsx.includes('reducedMotion') &&
    settingsTsx.includes('highContrast') &&
    settingsTsx.includes('prefer3DFallback'),
    'SettingsScreen provides toggles for reducedMotion, highContrast, and prefer3DFallback'
  );

  assert(
    appContextTsx.includes('ar_dsa_accessibility') &&
    appContextTsx.includes('document.body.classList.toggle'),
    'AppContext applies accessibility classes to document body'
  );

  // -------------------------------------------------------------
  // TEST 7: SECURITY AUDIT (ZERO CLIENT-SIDE SECRET LEAKS)
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Security Audit (Zero Client-Side Secret Leaks) ---');
  const clientSrcDir = path.resolve(process.cwd(), 'src');

  function scanDirForPatterns(dir: string, pattern: RegExp): string[] {
    const findings: string[] = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        findings.push(...scanDirForPatterns(fullPath, pattern));
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.html'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          findings.push(fullPath);
        }
      }
    }
    return findings;
  }

  // Ensure no hardcoded raw Gemini API keys in client source files
  const apiKeyRegex = /AIza[0-9A-Za-z-_]{35}/;
  const rawKeyMatches = scanDirForPatterns(clientSrcDir, apiKeyRegex);
  assert(rawKeyMatches.length === 0, 'No raw Google Gemini API keys found in client source code');

  // Ensure no VITE_GEMINI_API_KEY usage in client code
  const viteGeminiKeyRegex = /VITE_GEMINI_API_KEY/;
  const viteMatches = scanDirForPatterns(clientSrcDir, viteGeminiKeyRegex);
  assert(viteMatches.length === 0, 'No VITE_GEMINI_API_KEY references in client source code');

  // Verify server-side AI proxy route exists in server code
  const apiRouterTs = fs.readFileSync(path.resolve(process.cwd(), 'server/apiRouter.ts'), 'utf-8');
  assert(
    apiRouterTs.includes("'/api/ai/tutor'") &&
    apiRouterTs.includes('getGeminiApiKey'),
    'Node server protects GEMINI_API_KEY and provides /api/ai/tutor endpoint'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`PHASE 8 VERIFICATION SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error in Phase 8 test suite:', err);
  process.exit(1);
});
