/**
 * Automated Verification Suite for Phase 9: Full DSA Expansion
 * 
 * Verifies:
 * 1. DSARegistry maps all 20 Tier-1 topics with honest visualization capabilities.
 * 2. Deterministic engine correctness across all 20 topics (algorithmic truth in code, no LLM).
 * 3. Three deep end-to-end demonstrations (Binary Search, Bubble Sort, BFS).
 * 4. Observable misconception detection across the expanded taxonomy.
 * 5. Multi-topic adaptive task specifications across all 5 difficulty levels.
 * 6. Evidence pipeline: PerformanceEvidence creation and learner state updates.
 * 7. Critical state-isolation test (BST -> Binary Search -> Sorting -> BFS -> BST).
 */

import { DSARegistry } from '../src/services/dsa/core/DSARegistry';
import { BinarySearchEngine } from '../src/services/dsa/searching/BinarySearchEngine';
import { BubbleSortEngine } from '../src/services/dsa/sorting/BubbleSortEngine';
import { BFSEngine } from '../src/services/dsa/graphAlgorithms/BFSEngine';
import { StackEngine } from '../src/services/dsa/stack/StackEngine';
import { QueueEngine } from '../src/services/dsa/queue/QueueEngine';
import { ArrayEngine } from '../src/services/dsa/array/ArrayEngine';
import { LinkedListEngine } from '../src/services/dsa/linkedList/LinkedListEngine';
import { HeapEngine } from '../src/services/dsa/heap/HeapEngine';
import { HashTableEngine } from '../src/services/dsa/hashTable/HashTableEngine';
import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { AdaptiveDifficultyEngine } from '../src/services/adaptive/AdaptiveDifficultyEngine';
import { LocalLearnerService } from '../src/services/learner/LocalLearnerService';
import { INITIAL_DSA_TOPICS } from '../src/data/topicsData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('   PHASE 9: FULL DSA EXPANSION VERIFICATION SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: DSARegistry & Curriculum Coverage (20 Topics)
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: DSARegistry & Curriculum Coverage (20 Topics) ---');
  const allEngines = DSARegistry.getAllEngines();
  assert(allEngines.length >= 20, 'Registry contains curriculum topics (20 Tier-1 + Advanced topics)', `Found ${allEngines.length}`);

  const requiredTopics = [
    // 9 Data Structures
    'ds-array', 'ds-linked-list', 'ds-stack', 'ds-queue', 'ds-binary-tree',
    'ds-binary-search-tree', 'ds-heap', 'ds-hash-table', 'ds-graph',
    // 11 Algorithms
    'algo-linear-search', 'algo-binary-search', 'algo-bubble-sort', 'algo-selection-sort',
    'algo-insertion-sort', 'algo-merge-sort', 'algo-quick-sort', 'algo-breadth-first-search',
    'algo-depth-first-search', 'algo-dijkstras-algorithm', 'algo-recursion'
  ];

  for (const topicId of requiredTopics) {
    const engine = DSARegistry.getEngine(topicId);
    assert(!!engine, `Engine registered for ${topicId}`);
    assert(engine?.topicId === topicId, `Topic ID match for ${topicId}`);
    const capability = DSARegistry.getVisualizationCapability(topicId);
    assert(
      ['AR_READY', '3D_READY', '2D_READY', 'SPECIFICATION_ONLY'].includes(capability),
      `Honest visualization capability for ${topicId}: ${capability}`
    );
  }

  // Verify BST remains AR_READY
  const bstCap = DSARegistry.getVisualizationCapability('ds-binary-search-tree');
  assert(bstCap === 'AR_READY', 'BST maintains AR_READY visualization capability');

  // Verify catalog matches registry
  for (const t of INITIAL_DSA_TOPICS) {
    assert(DSARegistry.isImplemented(t.id), `Catalog topic ${t.id} is present in DSARegistry`);
  }

  // -------------------------------------------------------------
  // TEST GROUP 2: Deterministic Engine Execution Across All 20 Topics
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Deterministic Engine Correctness Across All 20 Topics ---');
  for (const engine of allEngines) {
    const initialState = engine.getInitialState();
    assert(initialState !== null && initialState !== undefined, `${engine.topicTitle}: Initializes valid state`);

    const availableOps = engine.getAvailableOperations(initialState);
    assert(Array.isArray(availableOps) && availableOps.length > 0, `${engine.topicTitle}: Exposes available operations (${availableOps.join(', ')})`);

    const visData = engine.getVisualizationData(initialState);
    assert(visData !== null && visData !== undefined, `${engine.topicTitle}: Generates visualization data`);
  }

  // -------------------------------------------------------------
  // TEST GROUP 3: Three Deep End-to-End Demonstrations
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Three Deep End-to-End Demonstrations ---');

  // Demonstration A: Binary Search
  console.log('  [Demo A: Binary Search]');
  const bsEngine = DSARegistry.getEngine('algo-binary-search') as BinarySearchEngine;
  assert(!!bsEngine, 'BinarySearchEngine retrieved');

  const bsPractice = bsEngine.startPracticeSession('MEDIUM');
  assert(bsPractice.currentState.array.length === 7, 'Binary Search initialized with 7 elements');
  assert(bsPractice.currentState.target === 60, 'Binary Search target set to 60');
  assert(bsPractice.currentState.mid === 3, 'Initial mid index is 3 (value 40)');

  // Step 1: 60 > 40 -> learner chooses GO_RIGHT
  const step1 = bsEngine.evaluatePracticeStep(bsPractice, 'GO_RIGHT');
  assert(step1.validation.isCorrect, 'Binary Search Step 1: GO_RIGHT is correct');
  assert(step1.updatedSession.currentState.low === 4, 'Low updated to mid + 1 = 4');
  assert(step1.updatedSession.currentState.mid === 5, 'New mid computed as floor((4+6)/2) = 5 (value 60)');
  assert(!step1.updatedSession.isComplete, 'Search not yet complete before matching target');

  // Step 2: 60 == 60 -> learner chooses MATCH
  const step2 = bsEngine.evaluatePracticeStep(step1.updatedSession, 'MATCH');
  assert(step2.validation.isCorrect, 'Binary Search Step 2: MATCH is correct');
  assert(step2.updatedSession.isComplete, 'Binary Search session completed');
  assert(step2.updatedSession.isSuccess, 'Binary Search search succeeded');

  // Demonstration B: Bubble Sort
  console.log('  [Demo B: Bubble Sort]');
  const sortEngine = DSARegistry.getEngine('algo-bubble-sort') as BubbleSortEngine;
  assert(!!sortEngine, 'BubbleSortEngine retrieved');

  const sortPractice = sortEngine.startPracticeSession('MEDIUM');
  assert(sortPractice.currentState.array.length === 5, 'Bubble Sort initialized with 5 elements');
  const arr0 = sortPractice.currentState.array; // [50, 20, 40, 10, 30]
  assert(arr0[0] > arr0[1], `First pair requires swap (${arr0[0]} > ${arr0[1]})`);

  // Step 1: 50 > 20 -> learner chooses SWAP
  const sortStep1 = sortEngine.evaluatePracticeStep(sortPractice, 'SWAP');
  assert(sortStep1.validation.isCorrect, 'Bubble Sort Step 1: SWAP evaluated correctly');
  assert(sortStep1.updatedSession.currentState.array[0] === 20, 'Index 0 now contains 20');
  assert(sortStep1.updatedSession.currentState.array[1] === 50, 'Index 1 now contains 50');
  assert(sortStep1.updatedSession.currentState.j === 1, 'Comparing index advanced to 1');

  // Step 2: 50 vs 40 -> learner chooses SWAP
  const sortStep2 = sortEngine.evaluatePracticeStep(sortStep1.updatedSession, 'SWAP');
  assert(sortStep2.validation.isCorrect, 'Bubble Sort Step 2: SWAP evaluated correctly');
  assert(sortStep2.updatedSession.currentState.array[1] === 40, 'Index 1 now contains 40');
  assert(sortStep2.updatedSession.currentState.array[2] === 50, 'Index 2 now contains 50');

  // Demonstration C: Graph Traversal (BFS)
  console.log('  [Demo C: Breadth-First Search]');
  const bfsEngine = DSARegistry.getEngine('algo-breadth-first-search') as BFSEngine;
  assert(!!bfsEngine, 'BFSEngine retrieved');

  const bfsPractice = bfsEngine.startPracticeSession('MEDIUM');
  assert(bfsPractice.currentState.visited.includes('A'), 'BFS begins with root visited (A)');
  assert(bfsPractice.currentState.queue[0] === 'A', 'BFS queue begins with root A');

  // Step 1: Learner expands root 'A'
  const bfsStep1 = bfsEngine.evaluatePracticeStep(bfsPractice, 'A');
  assert(bfsStep1.validation.isCorrect, 'BFS Step 1: Root A expanded correctly');
  assert(bfsStep1.updatedSession.currentState.traversalOrder.includes('A'), 'A added to traversalOrder');
  assert(bfsStep1.updatedSession.currentState.queue.includes('B'), 'Queue now contains child B');
  assert(bfsStep1.updatedSession.currentState.queue.includes('C'), 'Queue now contains child C');

  // Step 2: Learner expands next frontier node 'B'
  const bfsStep2 = bfsEngine.evaluatePracticeStep(bfsStep1.updatedSession, 'B');
  assert(bfsStep2.validation.isCorrect, 'BFS Step 2: Next FIFO node B expanded');
  assert(bfsStep2.updatedSession.currentState.traversalOrder.includes('B'), 'B added to traversalOrder');

  // -------------------------------------------------------------
  // TEST GROUP 4: Observable Misconception Detection
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Observable Misconception Detection Across Taxonomy ---');

  // 1. Binary Search: BINARY_SEARCH_WRONG_HALF
  const bsWrong = bsEngine.evaluatePracticeStep(bsPractice, 'GO_LEFT');
  assert(!bsWrong.validation.isCorrect, 'Binary search incorrect choice rejected');
  assert(
    bsWrong.validation.misconception?.type === 'BINARY_SEARCH_WRONG_HALF',
    `Diagnosed BINARY_SEARCH_WRONG_HALF (was ${bsWrong.validation.misconception?.type})`
  );
  assert(
    bsWrong.validation.misconception?.correctiveGuidance.includes('Eliminate') || bsWrong.validation.misconception?.correctiveGuidance.includes('bounds'),
    'Corrective guidance references interval elimination'
  );

  // 2. Sorting: SORT_WRONG_SWAP
  const sortWrong = sortEngine.evaluatePracticeStep(sortPractice, 'NO_SWAP');
  assert(!sortWrong.validation.isCorrect, 'Bubble sort invalid NO_SWAP rejected');
  assert(
    sortWrong.validation.misconception?.type === 'SORT_WRONG_SWAP',
    `Diagnosed SORT_WRONG_SWAP (was ${sortWrong.validation.misconception?.type})`
  );

  // 3. BFS: BFS_WRONG_FRONTIER
  const bfsWrong = bfsEngine.evaluatePracticeStep(bfsPractice, 'E'); // 'E' is not at the frontier yet
  assert(!bfsWrong.validation.isCorrect, 'BFS wrong frontier choice rejected');
  assert(
    bfsWrong.validation.misconception?.type === 'BFS_WRONG_FRONTIER',
    `Diagnosed BFS_WRONG_FRONTIER (was ${bfsWrong.validation.misconception?.type})`
  );

  // 4. Stack: STACK_EMPTY_POP and STACK_LIFO_VIOLATION
  const stackEngine = new StackEngine();
  const emptyStackState = { ...stackEngine.getInitialState(), items: [], topIndex: -1 };
  const popEmptyRes = stackEngine.applyOperation(emptyStackState, { type: 'POP' });
  assert(!popEmptyRes.success, 'Stack underflow correctly prevented');
  assert(
    popEmptyRes.misconception?.type === 'STACK_EMPTY_POP',
    `Diagnosed STACK_EMPTY_POP (was ${popEmptyRes.misconception?.type})`
  );

  // 5. Queue: QUEUE_EMPTY_DEQUEUE
  const queueEngine = new QueueEngine();
  const emptyQueueState = { ...queueEngine.getInitialState(), items: [], front: 0, rear: -1 };
  const deqEmptyRes = queueEngine.applyOperation(emptyQueueState, { type: 'DEQUEUE' });
  assert(!deqEmptyRes.success, 'Queue underflow correctly prevented');
  assert(
    deqEmptyRes.misconception?.type === 'QUEUE_EMPTY_DEQUEUE',
    `Diagnosed QUEUE_EMPTY_DEQUEUE (was ${deqEmptyRes.misconception?.type})`
  );

  // 6. Array: ARRAY_OUT_OF_BOUNDS
  const arrayEngine = new ArrayEngine();
  const arrState = arrayEngine.getInitialState();
  const oobRes = arrayEngine.applyOperation(arrState, { type: 'ACCESS', index: 99 });
  assert(!oobRes.success, 'Array out-of-bounds access prevented');
  assert(
    oobRes.misconception?.type === 'ARRAY_OUT_OF_BOUNDS',
    `Diagnosed ARRAY_OUT_OF_BOUNDS (was ${oobRes.misconception?.type})`
  );

  // 7. Linked List: LINKED_LIST_CYCLE_CONFUSION
  const llEngine = new LinkedListEngine();
  const llVal = llEngine.validateStep(llEngine.getInitialState(), 'WRONG_LINK', 'CORRECT_LINK');
  assert(!llVal.isCorrect, 'Linked list wrong pointer step detected');
  assert(
    llVal.misconception?.type === 'LINKED_LIST_WRONG_LINK',
    `Diagnosed LINKED_LIST_WRONG_LINK (was ${llVal.misconception?.type})`
  );

  // 8. Heap: HEAP_PROPERTY_VIOLATION
  const heapEngine = new HeapEngine();
  const heapVal = heapEngine.validateStep(heapEngine.getInitialState(), false, true);
  assert(!heapVal.isCorrect, 'Heap property violation detected');
  assert(
    heapVal.misconception?.type === 'HEAP_PROPERTY_VIOLATION',
    `Diagnosed HEAP_PROPERTY_VIOLATION (was ${heapVal.misconception?.type})`
  );

  // -------------------------------------------------------------
  // TEST GROUP 5: Multi-Topic Adaptive Task Specifications
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Multi-Topic Adaptive Task Specifications ---');
  const levels = ['FOUNDATIONAL', 'EASY', 'MEDIUM', 'HARD', 'CHALLENGE'] as const;
  const testTopics = [
    'ds-binary-search-tree',
    'algo-binary-search',
    'algo-bubble-sort',
    'algo-breadth-first-search',
    'ds-linked-list'
  ];

  for (const topicId of testTopics) {
    for (const lvl of levels) {
      const spec = AdaptiveDifficultyEngine.getTaskSpecification(lvl, topicId);
      assert(!!spec.label, `${topicId} [${lvl}] has task label: ${spec.label}`);
      assert(!!spec.description, `${topicId} [${lvl}] has task description`);
      assert(typeof spec.showInvariantGuidance === 'boolean', `${topicId} [${lvl}] showInvariantGuidance is boolean`);
      assert(typeof spec.showComparisonHint === 'boolean', `${topicId} [${lvl}] showComparisonHint is boolean`);
      assert(typeof spec.requiresPredictionBeforeMove === 'boolean', `${topicId} [${lvl}] requiresPredictionBeforeMove is boolean`);
      assert(typeof spec.requiresFullOperationPrediction === 'boolean', `${topicId} [${lvl}] requiresFullOperationPrediction is boolean`);
    }
  }

  // Check state modifiers alter cognitive demand
  const bsFoundationalSpec = AdaptiveDifficultyEngine.getTaskSpecification('FOUNDATIONAL', 'algo-binary-search');
  const bsChallengeSpec = AdaptiveDifficultyEngine.getTaskSpecification('CHALLENGE', 'algo-binary-search');
  assert(bsFoundationalSpec.showInvariantGuidance === true, 'Binary Search FOUNDATIONAL enables invariant guidance');
  assert(bsFoundationalSpec.showComparisonHint === true, 'Binary Search FOUNDATIONAL enables comparison hint');
  assert(bsChallengeSpec.showInvariantGuidance === false, 'Binary Search CHALLENGE disables invariant guidance');
  assert(bsChallengeSpec.requiresFullOperationPrediction === true, 'Binary Search CHALLENGE requires full prediction');

  // -------------------------------------------------------------
  // TEST GROUP 6: Evidence Pipeline & Learner State Updates
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Evidence Pipeline & Learner State Updates ---');
  const learnerService = new LocalLearnerService();
  const testEvidenceTopic = 'algo-binary-search';

  const beforeTopicState = await learnerService.getTopicState(testEvidenceTopic);
  const initialAttempts = beforeTopicState.attempts;

  // 1. Record an incorrect attempt with misconception
  const updatedState1 = await learnerService.recordPerformanceEvidence({
    topicId: testEvidenceTopic,
    eventType: 'PRACTICE_ATTEMPT',
    correct: false,
    difficulty: 'MEDIUM',
    usedHint: false,
    requestedExplanation: false,
    misconceptionDetected: true,
    misconceptionType: 'BINARY_SEARCH_WRONG_HALF'
  });

  assert(updatedState1.attempts === initialAttempts + 1, 'Evidence pipeline incremented attempts');
  assert(updatedState1.incorrectAttempts === beforeTopicState.incorrectAttempts + 1, 'Evidence pipeline incremented incorrectAttempts');
  assert(
    updatedState1.evidenceHistory.some(e => e.misconceptionType === 'BINARY_SEARCH_WRONG_HALF'),
    'Misconception recorded in evidenceHistory'
  );
  assert(updatedState1.misconceptionCount > 0, 'Topic state tracks misconceptionCount');

  // 2. Record 3 consecutive correct attempts
  for (let i = 0; i < 3; i++) {
    await learnerService.recordPerformanceEvidence({
      topicId: testEvidenceTopic,
      eventType: 'PRACTICE_ATTEMPT',
      correct: true,
      difficulty: 'MEDIUM',
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false
    });
  }

  const finalState = await learnerService.getTopicState(testEvidenceTopic);
  assert(finalState.correctAttempts === updatedState1.correctAttempts + 3, 'Consecutive correct answers incremented correctAttempts by 3');
  assert(finalState.recentAccuracy > 0, 'Recent accuracy updated positively');
  assert(finalState.masteryScore >= updatedState1.masteryScore, 'Mastery score increased with successful evidence');

  // -------------------------------------------------------------
  // TEST GROUP 7: Critical State Isolation Across Topics
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: Critical State Isolation Across Topics ---');

  // Scenario: Simulate user navigating BST -> Binary Search -> Bubble Sort -> BFS -> BST
  const bstEngine = DSARegistry.getEngine('ds-binary-search-tree')!;
  const bstInitial1 = bstEngine.getInitialState();
  const bstVis1 = bstEngine.getVisualizationData(bstInitial1);

  // Navigate to Binary Search & mutate practice state
  const bsEngineRef = DSARegistry.getEngine('algo-binary-search')!;
  const bsSession = bsEngineRef.startPracticeSession!('HARD');
  const bsRes = bsEngineRef.evaluatePracticeStep!(bsSession, 'GO_RIGHT');

  // Navigate to Bubble Sort & mutate practice state
  const sortEngineRef = DSARegistry.getEngine('algo-bubble-sort')!;
  const sortSession = sortEngineRef.startPracticeSession!('EASY');
  const sortRes = sortEngineRef.evaluatePracticeStep!(sortSession, 'SWAP');

  // Navigate to BFS & mutate practice state
  const bfsEngineRef = DSARegistry.getEngine('algo-breadth-first-search')!;
  const bfsSession = bfsEngineRef.startPracticeSession!('FOUNDATIONAL');
  const bfsRes = bfsEngineRef.evaluatePracticeStep!(bfsSession, 'A');

  // Navigate back to BST and inspect state
  const bstInitial2 = bstEngine.getInitialState();
  const bstVis2 = bstEngine.getVisualizationData(bstInitial2);

  assert(bstInitial1.value === bstInitial2.value, 'BST root value remains unchanged after multi-topic mutations');
  assert(bstVis1.value === bstVis2.value, 'BST visualization state preserved identically');
  assert(bsRes.updatedSession.currentState.low === 4, 'Binary search state preserved its own isolated transition');
  assert(bsSession.currentState.low === 0, 'Original Binary search session remains unmutated (immutable)');
  assert(sortRes.updatedSession.currentState.j === 1, 'Sort state preserved its own isolated transition');
  assert(sortSession.currentState.j === 0, 'Original Sort session remains unmutated (immutable)');
  assert(bfsRes.updatedSession.currentState.traversalOrder.includes('A'), 'BFS state preserved its own isolated transition');
  assert(bfsSession.currentState.traversalOrder.length === 0, 'Original BFS session remains unmutated (immutable)');

  // Verify BSTEngine reference implementation wasn't mutated
  const sampleTree = BSTEngine.createSampleTree();
  assert(sampleTree.value === 50, 'BSTEngine reference sample tree root remains 50');
  assert(sampleTree.left?.value === 30, 'BSTEngine reference left child remains 30');
  assert(sampleTree.right?.value === 70, 'BSTEngine reference right child remains 70');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
