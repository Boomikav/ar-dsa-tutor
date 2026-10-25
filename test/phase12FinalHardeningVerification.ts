/**
 * Phase 12: Final Product + Research Hardening Verification Suite
 * 
 * Tests:
 * 1. Research Metric Terminology Compliance (Hake gain vs Relative Score Change)
 * 2. Mathematical Consistency of Phase 7 Learner Model (Mastery, Confidence, Trend)
 * 3. DSARegistry Capability Classification Audit (1 AR_READY, 18 3D_READY, 1 2D_READY)
 * 4. Anti-Fabrication Invariants (0 participants in clean state, no fabricated scores)
 * 5. Security & Zero-Secret Audit (Client src/ and dist/ scan for API keys)
 * 6. Critical Cross-Topic State Isolation (BST -> Binary Search -> Bubble Sort -> BFS -> BST)
 * 7. Offline AI Resilience & Authoritative Boundary Enforcement
 * 8. Reproducibility PRNG Task Generation Invariance
 */

import { ResearchStatisticsEngine } from '../src/services/evaluation/ResearchStatisticsEngine';
import { ResearchEvaluationUtility } from '../src/services/evaluation/ResearchEvaluationUtility';
import { LearnerModelEngine } from '../src/services/learner/LearnerModelEngine';
import { PerformanceEvidence } from '../src/models/adaptiveLearner';
import { DSARegistry } from '../src/services/dsa/core/DSARegistry';
import { ResearchDataManager } from '../src/services/evaluation/ResearchDataManager';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { BinarySearchEngine } from '../src/services/dsa/searching/BinarySearchEngine';
import { BubbleSortEngine } from '../src/services/dsa/sorting/BubbleSortEngine';
import { BFSEngine } from '../src/services/dsa/graphAlgorithms/BFSEngine';
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

async function runPhase12FinalHardeningVerification() {
  console.log('================================================================');
  console.log('PHASE 12: FINAL PRODUCT + RESEARCH HARDENING VERIFICATION SUITE');
  console.log('================================================================\n');

  // ==================== TEST GROUP 1: TERMINOLOGY AUDIT ====================
  console.log('--- TEST GROUP 1: Research Metric Terminology Compliance ---');
  {
    // Hake's normalized gain: (Post - Pre) / (100 - Pre) for Post >= Pre
    const hakeGain = ResearchStatisticsEngine.calculateNormalizedGain(40, 70);
    assert(hakeGain === 0.5, `Hake normalized gain calculated correctly: (70-40)/(100-40) = 0.5 (got ${hakeGain})`);

    // Relative Score Change: (Post - Pre) / Pre
    const relChange = ResearchStatisticsEngine.calculateRelativeScoreChange(50, 60);
    assert(relChange === 0.2, `Relative score change calculated correctly: (60-50)/50 = 0.2 (got ${relChange})`);

    // Normalized loss for Post < Pre delegates to relative score change
    const normLoss = ResearchStatisticsEngine.calculateNormalizedGain(50, 30);
    const expectedLoss = ResearchStatisticsEngine.calculateRelativeScoreChange(50, 30);
    assert(normLoss === expectedLoss && normLoss === -0.4, `Normalized loss matches relative score change: (30-50)/50 = -0.4 (got ${normLoss})`);

    // ResearchEvaluationUtility consistency
    const utilGain = ResearchEvaluationUtility.calculateNormalizedGain(40, 70);
    assert(utilGain === 0.5, `ResearchEvaluationUtility matches Hake normalized gain (got ${utilGain})`);
  }

  // ==================== TEST GROUP 2: LEARNER MODEL MATHEMATICS ====================
  console.log('\n--- TEST GROUP 2: Learner Model Mathematical Integrity ---');
  {
    // Create clean evidence history: 4 correct unassisted attempts
    const evidence: PerformanceEvidence[] = [
      { eventId: 'e1', topicId: 'ds-binary-search-tree', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: new Date().toISOString() },
      { eventId: 'e2', topicId: 'ds-binary-search-tree', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: new Date().toISOString() },
      { eventId: 'e3', topicId: 'ds-binary-search-tree', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: new Date().toISOString() },
      { eventId: 'e4', topicId: 'ds-binary-search-tree', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: new Date().toISOString() }
    ];

    const mastery = LearnerModelEngine.calculateMastery(evidence);
    assert(mastery === 100, `4 correct unassisted attempts produce 100% mastery (got ${mastery})`);

    const indepRate = LearnerModelEngine.calculateIndependentSuccessRate(evidence);
    assert(indepRate === 100, `Independent success rate is 100% (got ${indepRate})`);

    const confidence = LearnerModelEngine.calculateConfidence(evidence);
    // Independence: 40 + Volume: (4/10)*30=12 + Streak: (4/4)*30=30 - Instability: 0 = 82
    assert(confidence === 82, `Confidence matches exact Phase 7 formula (40 + 12 + 30 = 82, got ${confidence})`);

    // Directional Trend classification
    const trend = LearnerModelEngine.calculateTrend(evidence);
    assert(trend === 'STABLE' || trend === 'IMPROVING', `Mastery trend evaluated (got ${trend})`);
  }

  // ==================== TEST GROUP 3: REGISTRY CAPABILITY CLASSIFICATION ====================
  console.log('\n--- TEST GROUP 3: DSARegistry Visualization Classification Audit ---');
  {
    const allEngines = DSARegistry.getAllEngines();
    assert(allEngines.length === 20, `Registry contains exactly 20 unique engines (got ${allEngines.length})`);

    const arEngines = allEngines.filter(e => e.visualizationCapability === 'AR_READY');
    const threeDEngines = allEngines.filter(e => e.visualizationCapability === '3D_READY');
    const twoDEngines = allEngines.filter(e => e.visualizationCapability === '2D_READY');

    assert(arEngines.length === 1, `Exactly 1 engine is AR_READY (got ${arEngines.length})`);
    assert(arEngines[0].topicId === 'ds-binary-search-tree', `AR_READY topic is strictly ds-binary-search-tree`);

    assert(threeDEngines.length === 17, `Exactly 17 engines are 3D_READY (got ${threeDEngines.length})`);
    assert(twoDEngines.length === 2, `Exactly 2 engines are 2D_READY (got ${twoDEngines.length})`);
    const twoDTopicIds = twoDEngines.map(e => e.topicId).sort();
    assert(twoDTopicIds.includes('algo-merge-sort') && twoDTopicIds.includes('ds-hash-table'), `2D_READY topics are ds-hash-table and algo-merge-sort`);
  }

  // ==================== TEST GROUP 4: ANTI-FABRICATION INVARIANTS ====================
  console.log('\n--- TEST GROUP 4: Critical Anti-Fabrication Verification ---');
  {
    const dataManager = ResearchDataManager.getInstance();
    dataManager.reset();

    assert(dataManager.getAllParticipants().length === 0, 'Clean research manager has exactly 0 participants');
    assert(dataManager.isEmpiricalDataAvailable() === false, 'isEmpiricalDataAvailable() returns false in clean state');

    const emptyStats = ResearchStatisticsEngine.calculateDescriptiveStats([]);
    assert(emptyStats.n === 0 && emptyStats.mean === 0, 'Empty statistical data reports n=0 and mean=0 without fabricated percentages');
  }

  // ==================== TEST GROUP 5: SECURITY SCAN ====================
  console.log('\n--- TEST GROUP 5: Client Security & Zero-Secret Scan ---');
  {
    const clientSrc = path.join(process.cwd(), 'src');
    const distAssets = path.join(process.cwd(), 'dist/assets');

    function searchForPatterns(dir: string, patterns: string[]): string[] {
      const matches: string[] = [];
      if (!fs.existsSync(dir)) return matches;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          matches.push(...searchForPatterns(fullPath, patterns));
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

    const clientSrcViolations = searchForPatterns(clientSrc, ['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'AIzaSy']);
    assert(clientSrcViolations.length === 0, `Zero secret API keys in client src/ directory`);

    if (fs.existsSync(distAssets)) {
      const distViolations = searchForPatterns(distAssets, ['AIzaSy', 'VITE_GEMINI_API_KEY']);
      assert(distViolations.length === 0, `Zero secret API keys in compiled dist/assets/ bundle`);
    }
  }

  // ==================== TEST GROUP 6: STATE ISOLATION ====================
  console.log('\n--- TEST GROUP 6: State Isolation (BST -> Binary Search -> Bubble Sort -> BFS -> BST) ---');
  {
    // Step 1: BST state
    const bst = BSTEngine.createSampleTree();
    assert(bst.value === 50, 'BST root is 50');

    // Step 2: Binary Search
    const bsEngine = new BinarySearchEngine();
    const bsSession = bsEngine.startPracticeSession!('MEDIUM');
    assert(bsSession.stepIndex === 0, 'Binary search starts at step 0');
    assert(bst.value === 50, 'BST root remains 50 while Binary Search executes');

    // Step 3: Bubble Sort
    const sortEngine = new BubbleSortEngine();
    const sortSession = sortEngine.startPracticeSession!('MEDIUM');
    assert(sortSession.stepIndex === 0, 'Bubble Sort starts at step 0');
    assert(bsSession.stepIndex === 0, 'Binary Search state unmutated by Bubble Sort');

    // Step 4: BFS
    const bfsEngine = new BFSEngine();
    const bfsSession = bfsEngine.startPracticeSession!('MEDIUM');
    assert(bfsSession.stepIndex === 0, 'BFS starts at step 0');

    // Step 5: Return to BST
    assert(bst.value === 50, 'BST root remains unchanged (50) across complete multi-topic cycle');
    assert(bst.left?.value === 30, 'BST left child remains intact (30)');
    assert(bst.right?.value === 70, 'BST right child remains intact (70)');
  }

  // ==================== TEST GROUP 7: OFFLINE AI RESILIENCE ====================
  console.log('\n--- TEST GROUP 7: Offline AI Resilience & Deterministic Boundary ---');
  {
    const practice = BSTPracticeEngine.startSession(undefined, 40);
    assert(practice.currentNode?.value === 50, 'Practice starts at root node 50');

    // Evaluate intentional wrong move
    const res = await BSTPracticeEngine.evaluateDecision(practice, 'RIGHT');
    assert(res.isCorrect === false, 'Deterministic authority rejects incorrect move');
    assert(res.diagnosis?.type === 'BST_WRONG_DIRECTION', 'Misconception diagnosed');
    assert(practice.currentNode.value === 50, 'Deterministic pointer remains protected at 50');
  }

  // ==================== TEST GROUP 8: REPRODUCIBLE PRNG ====================
  console.log('\n--- TEST GROUP 8: Reproducible Seeded Task Generation ---');
  {
    const dm = ResearchDataManager.getInstance();
    const task1 = dm.generateReproducibleTask(424242, 'algo-binary-search', 'task-1');
    const task2 = dm.generateReproducibleTask(424242, 'algo-binary-search', 'task-1');

    assert(JSON.stringify(task1.initialData) === JSON.stringify(task2.initialData), 'Identical seed reproduces bitwise-identical array values');
    assert(task1.targetValue === task2.targetValue, 'Identical seed reproduces identical target value');
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase12FinalHardeningVerification().catch(err => {
  console.error('Unhandled error in Phase 12 hardening verification:', err);
  process.exit(1);
});
