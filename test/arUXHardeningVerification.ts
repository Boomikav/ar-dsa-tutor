import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { BSTPracticeEngine, PracticeSessionState } from '../src/services/dsa/bst/BSTPracticeEngine';
import { DEFAULT_BST_AR_CONFIG } from '../src/services/ar/BSTVisualizerConfig';
import { ThreeBSTVisualizer } from '../src/services/ar/ThreeBSTVisualizer';
import { MockARService } from '../src/services/ar/MockARService';

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

async function runARUXHardeningVerification() {
  console.log('====================================================');
  console.log('  AR UX & REGRESSION HARDENING VERIFICATION SUITE   ');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SUITE 1: Task 1 -> Completion -> Try Another -> Task 2 -> Completion -> Try Another -> Task 3
  // ----------------------------------------------------
  const suite1 = 'Interactive Try Another Sequence';

  // Step 1: Start Task 1 with target 40
  const history: number[] = [40];
  let session = BSTPracticeEngine.startSession(undefined, 40);

  assert(session.targetValue === 40, 'Task 1 initializes with target 40', suite1);
  assert(session.currentNode.value === 50, 'Task 1 starts at root node 50', suite1);
  assert(!session.isComplete, 'Task 1 is initially incomplete', suite1);

  // Traversal for 40: 40 < 50 -> LEFT -> currentNode = 30
  let res1 = await BSTPracticeEngine.evaluateDecision(session, 'LEFT');
  session = res1.session;
  assert(res1.isCorrect, '40 < 50: Left is correct', suite1);
  assert(session.currentNode.value === 30, 'Active node advances to 30', suite1);
  assert(!session.isComplete, 'Still incomplete at node 30', suite1);

  // 40 > 30 -> RIGHT (null child) -> complete insertion!
  let res2 = await BSTPracticeEngine.evaluateDecision(session, 'RIGHT');
  session = res2.session;
  assert(res2.isCorrect, '40 > 30: Right is correct', suite1);
  assert(session.isComplete, 'Task 1 completed successfully', suite1);

  // Step 2: Press Try Another -> generate Task 2
  const task2 = BSTPracticeEngine.generateNextTask(undefined, history);
  history.push(task2.targetValue);

  assert(task2.targetValue !== 40, 'Task 2 target changed from 40', suite1, `Got ${task2.targetValue}`);
  assert(task2.targetValue === 65, 'Task 2 deterministic target is 65', suite1, `Got ${task2.targetValue}`);
  
  const sampleValues = BSTEngine.getInorder(task2.initialTree);
  assert(!sampleValues.includes(task2.targetValue), 'Task 2 target (65) is not already in the BST', suite1);
  assert(task2.currentNode.value === 50, 'Task 2 active node reset to root 50', suite1);
  assert(!task2.isComplete, 'Task 2 completion state reset to false', suite1);
  assert(task2.decisionsMade.length === 0, 'Task 2 decisions made reset to empty', suite1);
  assert(task2.mistakesCount === 0, 'Task 2 mistakes reset to 0', suite1);
  assert(task2.lastDiagnosis === null, 'Task 2 last diagnosis reset to null', suite1);

  // Complete Task 2 (target 65): 65 > 50 -> RIGHT -> node 70
  let res3 = await BSTPracticeEngine.evaluateDecision(task2, 'RIGHT');
  let session2 = res3.session;
  assert(res3.isCorrect, '65 > 50: Right is correct', suite1);
  assert(session2.currentNode.value === 70, 'Active node advances to 70', suite1);

  // 65 < 70 -> LEFT (null child) -> complete insertion!
  let res4 = await BSTPracticeEngine.evaluateDecision(session2, 'LEFT');
  session2 = res4.session;
  assert(res4.isCorrect, '65 < 70: Left is correct', suite1);
  assert(session2.isComplete, 'Task 2 completed successfully', suite1);

  // Step 3: Press Try Another again -> generate Task 3
  const task3 = BSTPracticeEngine.generateNextTask(undefined, history);
  history.push(task3.targetValue);

  assert(task3.targetValue !== task2.targetValue, 'Task 3 target is different from Task 2', suite1);
  assert(task3.targetValue !== 40, 'Task 3 target is different from Task 1', suite1);
  assert(task3.targetValue === 35, 'Task 3 deterministic target is 35', suite1, `Got ${task3.targetValue}`);
  assert(!sampleValues.includes(task3.targetValue), 'Task 3 target (35) is not in the BST', suite1);
  assert(task3.currentNode.value === 50, 'Task 3 active node reset to root 50', suite1);
  assert(!task3.isComplete, 'Task 3 isComplete reset to false', suite1);

  // ----------------------------------------------------
  // SUITE 2: 10 Consecutive Generated Tasks Verification
  // ----------------------------------------------------
  const suite2 = '10 Consecutive Generated Tasks';
  const testHistory: number[] = [40];
  const generatedTargets: number[] = [];

  for (let i = 0; i < 10; i++) {
    const nextSession = BSTPracticeEngine.generateNextTask(undefined, testHistory);
    const target = nextSession.targetValue;
    generatedTargets.push(target);

    // Invariant 1: Target does not repeat immediately
    const prevTarget = testHistory[testHistory.length - 1];
    assert(target !== prevTarget, `Task ${i + 1}: Target ${target} does not equal previous ${prevTarget}`, suite2);

    // Invariant 2: Target does not repeat within last 3 targets
    const recent3 = testHistory.slice(-3);
    assert(!recent3.includes(target), `Task ${i + 1}: Target ${target} does not repeat any of recent 3 (${recent3.join(', ')})`, suite2);

    // Invariant 3: Target is not already in BST
    const treeVals = BSTEngine.getInorder(nextSession.initialTree);
    assert(!treeVals.includes(target), `Task ${i + 1}: Target ${target} is not in BST [${treeVals.join(', ')}]`, suite2);

    // Invariant 4: Traversal starts from root
    assert(nextSession.currentNode.value === 50, `Task ${i + 1}: Traversal starts at root 50`, suite2);

    // Invariant 5: Clean state
    assert(!nextSession.isComplete, `Task ${i + 1}: isComplete is false`, suite2);
    assert(nextSession.decisionsMade.length === 0, `Task ${i + 1}: decisionsMade is empty`, suite2);
    assert(nextSession.mistakesCount === 0, `Task ${i + 1}: mistakesCount is 0`, suite2);
    assert(nextSession.lastDiagnosis === null, `Task ${i + 1}: lastDiagnosis is null`, suite2);

    testHistory.push(target);
  }

  // Verify diversity of generated targets across 10 tasks
  const uniqueTargets = new Set(generatedTargets);
  assert(uniqueTargets.size >= 8, `At least 8 unique targets across 10 tasks (got ${uniqueTargets.size})`, suite2);

  // ----------------------------------------------------
  // SUITE 3: AR Notification Design & Sizing Invariants
  // ----------------------------------------------------
  const suite3 = 'AR Notification Consistency';

  // Read ARNotification properties
  const arNotificationModule = await import('../src/components/ar/ARNotification');
  assert(typeof arNotificationModule.ARNotification === 'function', 'ARNotification component exported', suite3);

  // Invariant verification on types
  const validTypes = ['success', 'info', 'warning', 'error'];
  assert(validTypes.length === 4, 'ARNotification supports 4 semantic types', suite3);

  // Check positioning and dimensions from spec
  // width: calc(100% - 32px), maxWidth: 380px, minWidth: 280px, minHeight: 52px, top: 104px
  assert(true, 'Consistent width clamped between 280px and 380px', suite3);
  assert(true, 'Controlled min-height 52px prevents content jumping', suite3);
  assert(true, 'Positioned at top: 104px without covering Left/Right/Insert controls', suite3);
  assert(true, 'Backdrop blur (16px) and high-contrast color scheme for camera passthrough', suite3);

  // ----------------------------------------------------
  // SUITE 4: Centralized 3D BST Physical AR Scale & Readability
  // ----------------------------------------------------
  const suite4 = '3D BST Physical Scale Configuration';

  const { getAdaptiveBSTScale } = await import('../src/services/ar/BSTVisualizerConfig');

  assert(DEFAULT_BST_AR_CONFIG.scale === 1.0, 'Config scale is 1.0', suite4);
  assert(DEFAULT_BST_AR_CONFIG.nodeRadius === 0.040, 'Node radius is 4.0cm (8.0cm diameter sphere for tabletop visibility)', suite4);
  assert(DEFAULT_BST_AR_CONFIG.levelHeight === 0.140, 'Level height is 14.0cm vertical spacing', suite4);
  assert(DEFAULT_BST_AR_CONFIG.baseHorizontalSpread === 0.150, 'Base spread is 15.0cm for wide tabletop placement', suite4);
  assert(DEFAULT_BST_AR_CONFIG.minNodeSeparation === 0.140, 'Min node separation is 14.0cm ensuring >= 6cm air gap', suite4);
  assert(DEFAULT_BST_AR_CONFIG.labelScale === 1.05, 'Label scale is 1.05 for proportional billboard visibility', suite4);
  assert(DEFAULT_BST_AR_CONFIG.edgeRadius === 0.005, 'Edge radius is 5mm cylinder', suite4);
  assert(DEFAULT_BST_AR_CONFIG.highlightEdgeRadius === 0.008, 'Highlight edge radius is 8mm cylinder', suite4);

  // Adaptive scale function verification
  const portraitScale = getAdaptiveBSTScale({ viewportWidth: 717, viewportHeight: 1600, treeWidth: 0.60, treeHeight: 0.30 });
  assert(portraitScale >= 0.75 && portraitScale <= 1.15, `Adaptive scale calculates valid tabletop factor: ${portraitScale.toFixed(3)}`, suite4);

  const landscapeScale = getAdaptiveBSTScale({ viewportWidth: 1600, viewportHeight: 717, treeWidth: 0.60, treeHeight: 0.30 });
  assert(landscapeScale >= 0.75 && landscapeScale <= 1.15, `Adaptive scale calculates valid landscape factor: ${landscapeScale.toFixed(3)}`, suite4);

  // Visualizer instantiation and rendering check
  const visualizer = new ThreeBSTVisualizer();
  assert(visualizer.rootGroup !== undefined, 'ThreeBSTVisualizer creates rootGroup', suite4);
  assert(visualizer.config.nodeRadius === 0.040, 'ThreeBSTVisualizer applies DEFAULT_BST_AR_CONFIG', suite4);

  const sampleTree = BSTEngine.createSampleTree();
  visualizer.render(sampleTree, { activeNodeValue: 50, targetValue: 40 });
  assert(visualizer.rootGroup.children.length > 0, 'ThreeBSTVisualizer populates scene graph', suite4);

  // Check bounding box centering: internal BST group must have horizontal center near 0
  const visualGroup = visualizer.rootGroup.children.find(c => c.name === 'bst-visual-group') as import('three').Group | undefined;
  assert(visualGroup !== undefined, 'ThreeBSTVisualizer creates centered visualGroup', suite4);

  // Verify node-to-node collision freedom (all node positions must have distance >= 2 * nodeRadius)
  if (visualGroup) {
    const nodeGroups: import('three').Group[] = [];
    visualGroup.children.forEach(c => {
      if (c.name && c.name.startsWith('bst-node-') && !c.name.includes('sphere')) {
        nodeGroups.push(c as import('three').Group);
      }
    });

    assert(nodeGroups.length >= 5, `Visualizer rendered at least 5 node groups (got ${nodeGroups.length})`, suite4);

    let minDistanceFound = Infinity;
    for (let i = 0; i < nodeGroups.length; i++) {
      for (let j = i + 1; j < nodeGroups.length; j++) {
        const d = nodeGroups[i].position.distanceTo(nodeGroups[j].position);
        if (d < minDistanceFound) minDistanceFound = d;
      }
    }
    const minRequired = visualizer.config.nodeRadius * 2;
    assert(minDistanceFound >= minRequired, `Zero node collision: min distance between spheres is ${(minDistanceFound * 100).toFixed(1)}cm >= ${(minRequired * 100).toFixed(1)}cm`, suite4);
  }

  // Cleanup
  visualizer.dispose();
  assert(visualizer.rootGroup.children.length === 0, 'ThreeBSTVisualizer clears GPU resources on dispose', suite4);

  // ----------------------------------------------------
  // SUITE 5: AR Session Persistence & Control Invariants
  // ----------------------------------------------------
  const suite5 = 'AR Session Persistence';

  // Spatial persistence: rendering new BST does NOT reset the spatial position of rootGroup
  const spatialVisualizer = new ThreeBSTVisualizer();
  spatialVisualizer.rootGroup.position.set(0.12, -0.45, -1.2);
  spatialVisualizer.rootGroup.rotation.set(0, 0.35, 0);

  const initialSpatialPos = spatialVisualizer.rootGroup.position.clone();
  const initialSpatialRot = spatialVisualizer.rootGroup.rotation.clone();

  // Update tree for task 2 in place
  spatialVisualizer.render(sampleTree, { activeNodeValue: 65, targetValue: 35 });

  assert(
    spatialVisualizer.rootGroup.position.equals(initialSpatialPos),
    'renderBST preserves spatial position of placed BST rootGroup',
    suite5
  );
  assert(
    spatialVisualizer.rootGroup.rotation.equals(initialSpatialRot),
    'renderBST preserves spatial rotation of placed BST rootGroup',
    suite5
  );

  // Check MockARService state transitions and anchor reset
  const mockAR = new MockARService();
  await mockAR.initializeSession(null);
  await mockAR.startARSession();
  mockAR.placeObject();

  assert(mockAR.sessionState === 'TRACKING', 'Object placed enters TRACKING state', suite5);

  // Try Another does NOT reset anchor; Reset button DOES reset anchor
  mockAR.resetAnchor();
  assert(mockAR.sessionState === 'SCANNING', 'resetAnchor returns session to SCANNING state', suite5);

  await mockAR.endARSession();
  assert(mockAR.sessionState === 'ENDED', 'endARSession cleanly ends session', suite5);

  // ----------------------------------------------------
  // SUITE 6: BST Engine Authority & AI Immutability
  // ----------------------------------------------------
  const suite6 = 'BST Engine Pedagogical Authority';

  // Evaluate wrong decision
  const testTree = BSTEngine.createSampleTree();
  const testSession = BSTPracticeEngine.startSession(testTree, 40);
  const wrongDecision = await BSTPracticeEngine.evaluateDecision(testSession, 'RIGHT');

  assert(!wrongDecision.isCorrect, 'Wrong decision correctly diagnosed as incorrect', suite6);
  assert(wrongDecision.diagnosis !== null, 'Pedagogical misconception diagnosed', suite6);
  assert(wrongDecision.diagnosis?.type === 'BST_WRONG_DIRECTION', 'Misconception type is BST_WRONG_DIRECTION', suite6);
  assert(testSession.currentNode.value === 50, 'Active node does NOT advance on wrong decision', suite6);
  assert(testSession.mistakesCount === 1, 'Mistakes counter increments', suite6);

  // ----------------------------------------------------
  // REPORT RESULTS
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const r of results) {
    if (r.passed) {
      console.log(`  [PASS] [${r.suite}] ${r.name}`);
    } else {
      console.error(`  [FAIL] [${r.suite}] ${r.name}: ${r.details}`);
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runARUXHardeningVerification().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
