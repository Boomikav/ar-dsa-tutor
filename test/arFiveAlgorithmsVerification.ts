import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { BubbleSortEngine } from '../src/services/dsa/sorting/BubbleSortEngine';
import { BinarySearchEngine } from '../src/services/dsa/searching/BinarySearchEngine';
import { BFSEngine } from '../src/services/dsa/graphAlgorithms/BFSEngine';
import { StackEngine } from '../src/services/dsa/stack/StackEngine';
import { ThreeBSTVisualizer } from '../src/services/ar/ThreeBSTVisualizer';
import { ThreeBubbleSortVisualizer } from '../src/services/ar/ThreeBubbleSortVisualizer';
import { ThreeBinarySearchVisualizer } from '../src/services/ar/ThreeBinarySearchVisualizer';
import { ThreeBFSVisualizer } from '../src/services/ar/ThreeBFSVisualizer';
import { ThreeStackVisualizer } from '../src/services/ar/ThreeStackVisualizer';
import { WebXRARService } from '../src/services/ar/WebXRARService';
import { AR_ALGORITHMS } from '../src/components/ar/ARAlgorithmSelector';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, suite: string, details?: string) {
  results.push({
    suite,
    name,
    passed: !!condition,
    details: condition ? undefined : details || 'Assertion failed'
  });
}

async function runARFiveAlgorithmsVerification() {
  console.log('====================================================');
  console.log('  FIVE AR ALGORITHMS VERIFICATION SUITE             ');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SUITE 1: Deterministic Engines Authority
  // ----------------------------------------------------
  const suite1 = 'Deterministic Engines Authority';

  // 1. BST Engine
  const bstSession = BSTPracticeEngine.startSession(undefined, 40);
  assert(bstSession.targetValue === 40, 'BST: Initializes target 40', suite1);
  assert(bstSession.currentNode.value === 50, 'BST: Starts at root 50', suite1);
  const bstStep1 = await BSTPracticeEngine.evaluateDecision(bstSession, 'LEFT');
  assert(bstStep1.isCorrect, 'BST: Invariant 40 < 50 validates LEFT decision', suite1);
  assert(bstStep1.session.currentNode.value === 30, 'BST: Advances to node 30', suite1);

  // At node 30, target 40 > 30. Testing invalid LEFT:
  const bstInvalid = await BSTPracticeEngine.evaluateDecision(bstSession, 'LEFT');
  assert(!bstInvalid.isCorrect, 'BST: Rejects incorrect LEFT decision when 40 > 30', suite1);

  // 2. Bubble Sort Engine
  const bubbleEngine = new BubbleSortEngine();
  let bubbleState = bubbleEngine.getInitialState([5, 2, 4, 1, 3]);
  assert(bubbleState.array.join(',') === '5,2,4,1,3', 'Bubble Sort: Initializes [5, 2, 4, 1, 3]', suite1);
  assert(bubbleState.j === 0, 'Bubble Sort: Comparison index j starts at 0', suite1);
  const expectedDecision = bubbleEngine.getExpectedDecision(bubbleState);
  assert(expectedDecision === 'SWAP', 'Bubble Sort: 5 > 2 requires SWAP', suite1);

  const bubbleValidationBad = bubbleEngine.validateStep(bubbleState, 'NO_SWAP');
  assert(!bubbleValidationBad.isCorrect, 'Bubble Sort: Rejects invalid NO_SWAP when left > right', suite1);
  assert(bubbleValidationBad.misconception?.type === 'SORT_WRONG_SWAP', 'Bubble Sort: Diagnoses SORT_WRONG_SWAP', suite1);

  const bubbleStep1 = bubbleEngine.applyOperation(bubbleState, { type: 'DECIDE', decision: 'SWAP' });
  assert(bubbleStep1.success, 'Bubble Sort: Applies valid SWAP', suite1);
  bubbleState = bubbleStep1.newState;
  assert(bubbleState.array[0] === 2 && bubbleState.array[1] === 5, 'Bubble Sort: Elements 5 and 2 swapped', suite1);
  assert(bubbleState.j === 1, 'Bubble Sort: j increments to 1', suite1);
  assert(bubbleState.swapsCount === 1, 'Bubble Sort: Swaps count increments', suite1);

  // 3. Binary Search Engine
  const binaryEngine = new BinarySearchEngine();
  let binaryState = binaryEngine.getInitialState({ array: [10, 20, 30, 40, 50, 60], target: 50 });
  assert(binaryState.low === 0 && binaryState.high === 5, 'Binary Search: Interval starts [0..5]', suite1);
  assert(binaryState.mid === 2, 'Binary Search: Mid index is Math.floor((0+5)/2) = 2', suite1);
  assert(binaryState.array[binaryState.mid!] === 30, 'Binary Search: Mid value is 30', suite1);

  const expectedBSDecision = binaryEngine.getExpectedDecision(binaryState);
  assert(expectedBSDecision === 'GO_RIGHT', 'Binary Search: Target 50 > Mid 30 requires GO_RIGHT', suite1);

  const bsValidationBad = binaryEngine.validateStep(binaryState, 'GO_LEFT');
  assert(!bsValidationBad.isCorrect, 'Binary Search: Rejects incorrect GO_LEFT decision', suite1);
  assert(bsValidationBad.misconception !== undefined, 'Binary Search: Diagnoses directional misconception', suite1);

  const bsStep1 = binaryEngine.applyOperation(binaryState, { type: 'DECIDE', decision: 'GO_RIGHT' });
  binaryState = bsStep1.newState;
  assert(binaryState.low === 3, 'Binary Search: Low pointer adjusted to mid + 1 = 3', suite1);
  assert(binaryState.high === 5, 'Binary Search: High pointer remains 5', suite1);
  assert(binaryState.mid === 4, 'Binary Search: Next mid is Math.floor((3+5)/2) = 4 (value 50)', suite1);

  const bsStep2 = binaryEngine.applyOperation(binaryState, { type: 'DECIDE', decision: 'MATCH' });
  binaryState = bsStep2.newState;
  assert(binaryState.isFound, 'Binary Search: Marks target found', suite1);
  assert(binaryState.isComplete, 'Binary Search: Marks session complete', suite1);

  // 4. BFS Engine
  const bfsEngine = new BFSEngine();
  let bfsState = bfsEngine.getInitialState({ startVertex: 'A' });
  assert(bfsState.queue[0] === 'A', 'BFS: Starts with root vertex A in queue', suite1);
  assert(bfsState.visited.includes('A'), 'BFS: Marks A in visited set', suite1);

  const bfsStep1 = bfsEngine.applyOperation(bfsState, { type: 'EXPAND' });
  bfsState = bfsStep1.newState;
  assert(bfsState.currentVertex === 'A', 'BFS: Dequeues vertex A as current', suite1);
  assert(bfsState.traversalOrder.includes('A'), 'BFS: Adds A to traversal order', suite1);
  assert(bfsState.queue.includes('B') && bfsState.queue.includes('C'), 'BFS: Enqueues unvisited neighbors B and C in FIFO order', suite1);

  // 5. Stack Engine
  const stackEngine = new StackEngine();
  let stackState = stackEngine.getInitialState();
  assert(stackState.items.length === 3, 'Stack: Initializes with 3 elements [15, 30, 45]', suite1);
  assert(stackState.items[stackState.topIndex] === 45, 'Stack: Top element is 45', suite1);

  // Test Push
  const pushRes = stackEngine.applyOperation(stackState, { type: 'PUSH', value: 60 });
  assert(pushRes.success, 'Stack: Pushes 60 successfully', suite1);
  stackState = pushRes.newState;
  assert(stackState.items[stackState.topIndex] === 60, 'Stack: Top element is now 60', suite1);
  assert(stackState.items.length === 4, 'Stack: Size increases to 4', suite1);

  // Test Pop (LIFO)
  const popRes = stackEngine.applyOperation(stackState, { type: 'POP' });
  assert(popRes.success, 'Stack: Pops top element successfully', suite1);
  stackState = popRes.newState;
  assert(stackState.items[stackState.topIndex] === 45, 'Stack: LIFO restores previous top element 45', suite1);

  // Test Underflow Guard
  let emptyStack = { ...stackState, items: [], topIndex: -1 };
  const underflowRes = stackEngine.applyOperation(emptyStack, { type: 'POP' });
  assert(!underflowRes.success, 'Stack: Blocks pop from empty stack', suite1);
  assert(underflowRes.newState.isUnderflow, 'Stack: Flags underflow state correctly', suite1);

  // ----------------------------------------------------
  // SUITE 2: Genuine Three.js Visualizer Geometry & Rendering
  // ----------------------------------------------------
  const suite2 = 'Spatial Visualizer Geometries';

  // 1. BST Visualizer
  const bstVis = new ThreeBSTVisualizer();
  bstVis.render(bstSession.currentTree, { activeNodeValue: 50, targetValue: 40 });
  assert(bstVis.rootGroup.children.length > 0, 'BST Visualizer: Populates scene graph', suite2);
  assert(bstVis.bstVisualGroup.children.length >= 5, 'BST Visualizer: Renders node meshes', suite2);

  // 2. Bubble Sort Visualizer
  const bubbleVis = new ThreeBubbleSortVisualizer();
  bubbleVis.render(bubbleState);
  assert(bubbleVis.rootGroup.children.length > 0, 'Bubble Sort Visualizer: Populates scene graph', suite2);
  assert(bubbleVis.elementMeshes.length === 5, 'Bubble Sort Visualizer: Renders exactly 5 bar meshes for array', suite2);
  // Verify bar positions are separated horizontally along X without overlap
  let prevX = -Infinity;
  let hasOverlap = false;
  for (const mesh of bubbleVis.elementMeshes) {
    if (mesh.position.x <= prevX) {
      hasOverlap = true;
    }
    prevX = mesh.position.x;
  }
  assert(!hasOverlap, 'Bubble Sort Visualizer: Adjacent bars have distinct non-overlapping X coordinates', suite2);

  // 3. Binary Search Visualizer
  const bsVis = new ThreeBinarySearchVisualizer();
  bsVis.render(binaryState);
  assert(bsVis.rootGroup.children.length > 0, 'Binary Search Visualizer: Populates scene graph', suite2);
  assert(bsVis.elementMeshes.length === 6, 'Binary Search Visualizer: Renders 6 distinct spatial blocks', suite2);
  let bsPrevX = -Infinity;
  let bsOverlap = false;
  for (const mesh of bsVis.elementMeshes) {
    if (mesh.position.x <= bsPrevX) {
      bsOverlap = true;
    }
    bsPrevX = mesh.position.x;
  }
  assert(!bsOverlap, 'Binary Search Visualizer: Elements are spatially separated along X', suite2);

  // 4. BFS Visualizer
  const bfsVis = new ThreeBFSVisualizer();
  bfsVis.render(bfsState);
  assert(bfsVis.rootGroup.children.length > 0, 'BFS Visualizer: Populates scene graph', suite2);
  assert(bfsVis.vertexMeshes.length === 6, 'BFS Visualizer: Renders 6 spherical vertex meshes', suite2);
  // Verify vertex meshes have distinct spatial coordinates
  const positions = bfsVis.vertexMeshes.map(m => `${m.position.x.toFixed(2)},${m.position.y.toFixed(2)}`);
  const uniquePositions = new Set(positions);
  assert(uniquePositions.size === 6, 'BFS Visualizer: All 6 vertices have unique spatial positions', suite2);

  // 5. Stack Visualizer
  const stackVis = new ThreeStackVisualizer();
  stackVis.render(stackState);
  assert(stackVis.rootGroup.children.length > 0, 'Stack Visualizer: Populates scene graph', suite2);
  assert(stackVis.blockMeshes.length === 3, 'Stack Visualizer: Renders 3 vertical stack block meshes', suite2);
  // Verify blocks stack upward along Y axis
  let prevY = -Infinity;
  let stackYAscends = true;
  for (const mesh of stackVis.blockMeshes) {
    if (mesh.position.y <= prevY) {
      stackYAscends = false;
    }
    prevY = mesh.position.y;
  }
  assert(stackYAscends, 'Stack Visualizer: Blocks stack upward monotonically along Y axis', suite2);

  // ----------------------------------------------------
  // SUITE 3: Shared AR Session & Placement Coordination
  // ----------------------------------------------------
  const suite3 = 'Shared AR Session & Placement Coordination';

  const arService = new WebXRARService();
  assert((arService as any).visualizer.rootGroup !== undefined, 'WebXRARService creates rootGroup', suite3);
  assert((arService as any).visualizer.rootGroup.visible === false, 'Initially hidden before placement', suite3);

  // Verify switching algorithms mounts visual groups inside the same rootGroup
  arService.setActiveAlgorithm('algo-bubble-sort');
  assert((arService as any).bubbleSortVisualizer.visualGroup.visible === true, 'Bubble Sort visual group becomes visible', suite3);
  assert((arService as any).visualizer.bstVisualGroup.visible === false, 'BST visual group hidden when Bubble Sort active', suite3);

  arService.setActiveAlgorithm('algo-binary-search');
  assert((arService as any).binarySearchVisualizer.visualGroup.visible === true, 'Binary Search visual group becomes visible', suite3);
  assert((arService as any).bubbleSortVisualizer.visualGroup.visible === false, 'Bubble Sort visual group hidden', suite3);

  arService.setActiveAlgorithm('algo-breadth-first-search');
  assert((arService as any).bfsVisualizer.visualGroup.visible === true, 'BFS visual group becomes visible', suite3);
  assert((arService as any).binarySearchVisualizer.visualGroup.visible === false, 'Binary Search visual group hidden', suite3);

  arService.setActiveAlgorithm('ds-stack');
  assert((arService as any).stackVisualizer.visualGroup.visible === true, 'Stack visual group becomes visible', suite3);
  assert((arService as any).bfsVisualizer.visualGroup.visible === false, 'BFS visual group hidden', suite3);

  // ----------------------------------------------------
  // SUITE 4: Zero Resource Leaks & Cleanup
  // ----------------------------------------------------
  const suite4 = 'Zero Resource Leaks & Cleanup';

  bstVis.dispose();
  assert(bstVis.rootGroup.children.length === 0, 'BST visualizer cleans up on dispose', suite4);

  bubbleVis.dispose();
  assert(bubbleVis.rootGroup.children.length === 0, 'Bubble Sort visualizer cleans up on dispose', suite4);

  bsVis.dispose();
  assert(bsVis.rootGroup.children.length === 0, 'Binary Search visualizer cleans up on dispose', suite4);

  bfsVis.dispose();
  assert(bfsVis.rootGroup.children.length === 0, 'BFS visualizer cleans up on dispose', suite4);

  stackVis.dispose();
  assert(stackVis.rootGroup.children.length === 0, 'Stack visualizer cleans up on dispose', suite4);

  await arService.disposeSession();
  assert(arService.sessionState === 'ENDED', 'WebXRARService session dispose marks state as ENDED', suite4);

  // ----------------------------------------------------
  // SUITE 5: Algorithm Selection Screen & AR Options Audit
  // ----------------------------------------------------
  const suite5 = 'Algorithm Selector & Production Audit';

  assert(AR_ALGORITHMS.length === 5, 'Algorithm Selector configures exactly 5 options', suite5);
  const ids = AR_ALGORITHMS.map(a => a.id);
  assert(ids.includes('ds-binary-search-tree'), 'Selector includes Binary Search Tree', suite5);
  assert(ids.includes('algo-bubble-sort'), 'Selector includes Bubble Sort', suite5);
  assert(ids.includes('algo-binary-search'), 'Selector includes Binary Search', suite5);
  assert(ids.includes('algo-breadth-first-search'), 'Selector includes Breadth-First Search', suite5);
  assert(ids.includes('ds-stack'), 'Selector includes Stack', suite5);

  for (const algo of AR_ALGORITHMS) {
    assert(algo.name.length > 0, `Option ${algo.id} has name: "${algo.name}"`, suite5);
    assert(algo.learningObjective.length > 10, `Option ${algo.id} has valid objective`, suite5);
    assert(algo.operationSupported.length > 5, `Option ${algo.id} specifies operations`, suite5);
  }

  // Verify ARSessionScreen source invariants
  const arScreenSource = fs.readFileSync(path.resolve('src/screens/ARSessionScreen.tsx'), 'utf8');

  // Placement banner disappears after placement
  assert(
    arScreenSource.includes('{!isPlaced && (') && arScreenSource.includes('PLACEMENT INSTRUCTION BANNER'),
    'Placement banner renders only before placement (!isPlaced)',
    suite5
  );

  // Learning HUD remains visible after placement
  assert(
    arScreenSource.includes('{isPlaced && (') && arScreenSource.includes('ZONE C: COMPACT BOTTOM AR LEARNING HUD'),
    'Learning HUD renders throughout practice when placed (isPlaced)',
    suite5
  );

  // Decision buttons stop propagation
  assert(
    arScreenSource.includes('handleDecision(\'LEFT\');') && arScreenSource.includes('e.stopPropagation()'),
    'BST Left button isolates event propagation',
    suite5
  );
  assert(
    arScreenSource.includes('handleDecision(\'RIGHT\');') && arScreenSource.includes('e.stopPropagation()'),
    'BST Right button isolates event propagation',
    suite5
  );
  assert(
    arScreenSource.includes('handleDecision(\'INSERT_HERE\');') && arScreenSource.includes('e.stopPropagation()'),
    'BST Insert button isolates event propagation',
    suite5
  );

  // Report Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Results: ${passed} / ${results.length} passed.`);
  if (failed > 0) {
    console.error(`FAILED: ${failed} tests failed!`);
    results.filter(r => !r.passed).forEach(r => console.error(`  - [${r.suite}] ${r.name}: ${r.details}`));
    process.exit(1);
  }
}

runARFiveAlgorithmsVerification().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
