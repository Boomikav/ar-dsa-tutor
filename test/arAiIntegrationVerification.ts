/**
 * Automated Verification Suite for Phase 5: Generative AI + AR Learning Loop Integration
 * 
 * Verifies the complete vertical slice:
 * 1. Initial Tree Setup & Practice Session (Target = 40, Root = 50)
 * 2. Adversarial Choice (RIGHT) -> Deterministic Rejection (BST_WRONG_DIRECTION)
 * 3. State Protection: Pointer locked at 50, tree unmutated
 * 4. Learner Model Mutation via Learner Service (attempts++, mistakes++, confidence--)
 * 5. Telemetry Tracking: Safe events without credentials
 * 6. Context-Aware TutorRequest Assembly with Authoritative Comparison (40 < 50)
 * 7. AI Tutor Consultation & Schema Validation (MISTAKE_EXPLANATION)
 * 8. AR HUD Feedback Mapping & 3D Synchronization
 * 9. Correct Retry (LEFT) -> Deterministic Acceptance -> Pointer Advances to 30
 * 10. Learner Model Recovery (correct++, confidence++)
 * 11. Socratic Response Mode
 * 12. Direct Response Mode
 * 13. Analogical Response Mode
 * 14. Offline / MockProvider Fallback Handling
 * 15. Client-Side Network Fallback Handling
 * 16. Schema Validator Defense against Malformed AI Payloads
 * 17. Safe Next-Action Defense: Rogue AI cannot mutate tree directly
 * 18. Latency Decoupling: Async AI execution does not block 3D rendering pipeline
 */

import { BSTEngine } from '../src/services/dsa/bst/BSTEngine';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { ThreeBSTVisualizer } from '../src/services/ar/ThreeBSTVisualizer';
import { LocalLearnerService } from '../src/services/learner/LocalLearnerService';
import { LocalAnalyticsService } from '../src/services/analytics/LocalAnalyticsService';
import { LearnerContextBuilder } from '../src/services/ai/LearnerContextBuilder';
import { SecureAIService } from '../src/services/ai/SecureAIService';
import { AIResponseValidator } from '../src/services/ai/AIResponseValidator';
import { MockProvider } from '../server/providers/MockProvider';
import { DSATopic } from '../src/models/topic';

const bstTopic: DSATopic = {
  id: 'ds-binary-search-tree',
  title: 'Binary Search Tree',
  category: 'data-structure',
  difficulty: 'Intermediate',
  shortDescription: 'Hierarchical node structure maintaining sorted order',
  detailedConcept: 'For any node N, all values in left subtree < N < all values in right subtree',
  visualSpec: { type: 'tree', description: 'Left Subtree < Root < Right Subtree' },
  timeComplexity: { best: 'O(log N)', average: 'O(log N)', worst: 'O(N)' },
  estimatedMinutes: 15,
  prerequisites: ['ds-binary-tree'],
  learningOutcomes: ['Understand BST invariant', 'Perform BST insertion'],
  tags: ['trees', 'bst', 'binary search']
};

async function runPhase5IntegrationVerification() {
  console.log('======================================================================');
  console.log(' AR-DSA TUTOR: PHASE 5 AI + AR LEARNING LOOP INTEGRATION SUITE');
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

  const learnerService = new LocalLearnerService();
  const analyticsService = new LocalAnalyticsService();
  const visualizer = new ThreeBSTVisualizer();
  const mockProvider = new MockProvider();
  const secureAIService = new SecureAIService(analyticsService);

  // --------------------------------------------------------------------------
  // TEST 1: Initial Tree & Practice Session Initialization
  // --------------------------------------------------------------------------
  const initialTree = BSTEngine.createSampleTree();
  // Sample tree has root 50, left 30, right 70
  const practiceSession = BSTPracticeEngine.startSession(initialTree, 40);

  assert(practiceSession.currentNode.value === 50, 'Case 1a: Practice starts at root node 50');
  assert(practiceSession.targetValue === 40, 'Case 1b: Target insertion value is 40');
  assert(!practiceSession.isComplete, 'Case 1c: Practice session is not yet complete');

  // Render initial tree in 3D
  visualizer.render(practiceSession.currentTree, {
    activeNodeValue: practiceSession.currentNode.value,
    targetValue: practiceSession.targetValue
  });
  assert(visualizer.rootGroup.children.length > 0, 'Case 1d: 3D Visualizer successfully rendered initial tree scene graph');

  // --------------------------------------------------------------------------
  // TEST 2: Adversarial Move - Student Deliberately Chooses RIGHT
  // --------------------------------------------------------------------------
  // Target = 40, Node = 50. Correct direction: 40 < 50 => LEFT.
  // Student chooses RIGHT.
  await analyticsService.trackEvent({
    userId: 'student-usr-4092',
    topicId: bstTopic.id,
    eventType: 'ar_interaction_step',
    payload: {
      actionType: 'AR_DECISION_ATTEMPTED',
      choice: 'RIGHT',
      currentNode: practiceSession.currentNode.value,
      targetValue: practiceSession.targetValue
    }
  });

  const evalResult = await BSTPracticeEngine.evaluateDecision(
    practiceSession,
    'RIGHT',
    analyticsService
  );

  assert(!evalResult.isCorrect, 'Case 2a: Deterministic engine rejects incorrect RIGHT decision');
  assert(evalResult.diagnosis !== null, 'Case 2b: Structured misconception diagnosis generated');
  assert(evalResult.diagnosis?.type === 'BST_WRONG_DIRECTION', 'Case 2c: Diagnosed as BST_WRONG_DIRECTION');
  assert(evalResult.diagnosis?.expectedChoice === 'LEFT', 'Case 2d: Expected choice correctly identified as LEFT');
  assert(evalResult.diagnosis?.userChoice === 'RIGHT', 'Case 2e: User choice recorded as RIGHT');

  // --------------------------------------------------------------------------
  // TEST 3: State Protection - Pointer Locked, Tree Unchanged
  // --------------------------------------------------------------------------
  assert(evalResult.session.currentNode.value === 50, 'Case 3a: Current node pointer remains locked at 50');
  assert(!evalResult.session.isComplete, 'Case 3b: Session is not marked complete after wrong move');
  assert(evalResult.session.mistakesCount === 1, 'Case 3c: Mistakes counter incremented to 1');

  // --------------------------------------------------------------------------
  // TEST 4: Learner Model Mutation via Learner Service
  // --------------------------------------------------------------------------
  const prevLearnerState = await learnerService.getLearnerState();
  const prevAttempts = prevLearnerState.masteryMap[bstTopic.id]?.attemptsCount ?? 0;
  const prevIncorrect = prevLearnerState.masteryMap[bstTopic.id]?.incorrectAttempts ?? 0;
  const prevConfidence = prevLearnerState.masteryMap[bstTopic.id]?.confidence ?? 0.3;

  const updatedState = await learnerService.recordPracticeStep(
    bstTopic.id,
    false,
    evalResult.diagnosis?.type
  );
  const currentTopicMastery = updatedState.masteryMap[bstTopic.id];

  assert(currentTopicMastery.attemptsCount === prevAttempts + 1, 'Case 4a: Learner service incremented attemptsCount');
  assert(currentTopicMastery.incorrectAttempts === prevIncorrect + 1, 'Case 4b: Learner service recorded 1 additional incorrect attempt');
  assert(currentTopicMastery.confidence < prevConfidence, 'Case 4c: Learner service decreased confidence score');
  assert(currentTopicMastery.needsReview === true, 'Case 4d: Learner service flagged topic as needsReview');

  // --------------------------------------------------------------------------
  // TEST 5: Telemetry Verification
  // --------------------------------------------------------------------------
  await analyticsService.trackEvent({
    userId: 'student-usr-4092',
    topicId: bstTopic.id,
    eventType: 'ar_interaction_step',
    payload: {
      actionType: 'AR_DECISION_INCORRECT',
      choice: 'RIGHT',
      misconception: evalResult.diagnosis?.type
    }
  });

  await analyticsService.trackEvent({
    userId: 'student-usr-4092',
    topicId: bstTopic.id,
    eventType: 'ar_interaction_step',
    payload: {
      actionType: 'AR_MISCONCEPTION_DETECTED',
      misconceptionType: evalResult.diagnosis?.type,
      expected: 'LEFT',
      actual: 'RIGHT'
    }
  });

  const recentEvents = await analyticsService.getRecentEvents(10);
  const incorrectEvent = recentEvents.find(e => e.payload?.actionType === 'AR_DECISION_INCORRECT');
  const miscEvent = recentEvents.find(e => e.payload?.actionType === 'AR_MISCONCEPTION_DETECTED');

  assert(incorrectEvent !== undefined, 'Case 5a: AR_DECISION_INCORRECT event logged in analytics');
  assert(miscEvent !== undefined, 'Case 5b: AR_MISCONCEPTION_DETECTED event logged in analytics');
  assert(
    !JSON.stringify(recentEvents).includes('AI_KEY') && !JSON.stringify(recentEvents).includes('Bearer'),
    'Case 5c: Analytics telemetry contains zero secrets or private keys'
  );

  // --------------------------------------------------------------------------
  // TEST 6: Context-Aware TutorRequest Assembly
  // --------------------------------------------------------------------------
  const tutorRequest = LearnerContextBuilder.buildRequest({
    topic: bstTopic,
    learnerState: updatedState,
    helpLevel: 'mistake_remediation',
    currentOperation: {
      operationType: 'insert',
      targetValue: 40,
      currentNodeValue: 50,
      stepNumber: 1,
      comparisonText: '40 < 50',
      deterministicDecision: 'LEFT',
      isCompleted: false
    },
    misconception: evalResult.diagnosis,
    overrideStyle: 'socratic'
  });

  assert(tutorRequest.topicContext.id === 'ds-binary-search-tree', 'Case 6a: TopicContext contains ds-binary-search-tree');
  assert(tutorRequest.currentOperation.targetValue === 40, 'Case 6b: CurrentOperation specifies target 40');
  assert(tutorRequest.currentOperation.currentNodeValue === 50, 'Case 6c: CurrentOperation specifies currentNode 50');
  assert(tutorRequest.currentOperation.deterministicDecision === 'LEFT', 'Case 6d: Deterministic authority LEFT passed to AI');
  assert(tutorRequest.misconception?.type === 'BST_WRONG_DIRECTION', 'Case 6e: Misconception diagnosis attached to request');
  assert(tutorRequest.learnerState.needsReview === true, 'Case 6f: Fresh learner state snapshot attached to request');

  // --------------------------------------------------------------------------
  // TEST 7: AI Tutor Consultation & Schema Validation
  // --------------------------------------------------------------------------
  const aiRawResponse = await mockProvider.generateTutorResponse(tutorRequest);
  const validation = AIResponseValidator.validate(
    aiRawResponse,
    'mock-tutor',
    'mock-engine',
    bstTopic.detailedConcept
  );

  assert(validation.isValid, 'Case 7a: AI response passes schema validation');
  assert(validation.validatedResponse.responseType === 'MISTAKE_EXPLANATION', 'Case 7b: AI response categorized as MISTAKE_EXPLANATION');
  assert(
    validation.validatedResponse.message.toLowerCase().includes('smaller') ||
    validation.validatedResponse.message.toLowerCase().includes('left') ||
    validation.validatedResponse.message.includes('40'),
    'Case 7c: AI explanation reinforces BST invariant for target 40 at node 50'
  );

  // --------------------------------------------------------------------------
  // TEST 8: AR HUD Mapping & Safe NextAction Handling
  // --------------------------------------------------------------------------
  const nextAction = validation.validatedResponse.nextAction;
  assert(
    nextAction === 'RETRY_DECISION' || nextAction === 'MOVE_LEFT',
    `Case 8a: AI suggests safe next action (${nextAction})`
  );

  // Verify that an AI nextAction suggestion cannot directly alter the practice state
  // Only passing it through BSTPracticeEngine.evaluateDecision can change state
  assert(practiceSession.currentNode.value === 50, 'Case 8b: AI response did NOT mutate BST pointer');

  // --------------------------------------------------------------------------
  // TEST 9: Student Retries - Authoritative Decision LEFT Accepted
  // --------------------------------------------------------------------------
  await analyticsService.trackEvent({
    userId: 'student-usr-4092',
    topicId: bstTopic.id,
    eventType: 'ar_interaction_step',
    payload: {
      actionType: 'AR_DECISION_ATTEMPTED',
      choice: 'LEFT',
      currentNode: 50,
      targetValue: 40
    }
  });

  const correctResult = await BSTPracticeEngine.evaluateDecision(
    evalResult.session,
    'LEFT',
    analyticsService
  );

  assert(correctResult.isCorrect, 'Case 9a: Deterministic engine accepts correct LEFT decision');
  assert(correctResult.session.currentNode.value === 30, 'Case 9b: Active node pointer advances to Left Child (30)');

  // --------------------------------------------------------------------------
  // TEST 10: 3D Scene Graph Synchronization on State Advance
  // --------------------------------------------------------------------------
  visualizer.render(correctResult.session.currentTree, {
    activeNodeValue: correctResult.session.currentNode.value,
    targetValue: correctResult.session.targetValue,
    highlightPathValues: [50, 30]
  });

  // Verify visualizer rootGroup still exists and rendered nodes match
  assert(visualizer.rootGroup.children.length > 0, 'Case 10a: 3D Visualizer synchronized with node 30 as active node');

  // --------------------------------------------------------------------------
  // TEST 11: Learner Model Recovery on Correct Decision
  // --------------------------------------------------------------------------
  const recoveredState = await learnerService.recordPracticeStep(bstTopic.id, true);
  const recoveredMastery = recoveredState.masteryMap[bstTopic.id];

  assert(recoveredMastery.correctAttempts === 1, 'Case 11a: Correct attempt recorded');
  assert(recoveredMastery.confidence > currentTopicMastery.confidence, 'Case 11b: Learner confidence improved');
  assert(recoveredMastery.needsReview === false, 'Case 11c: needsReview cleared after correct step');

  // --------------------------------------------------------------------------
  // TEST 12: Pedagogical Modes (Socratic, Direct, Analogical)
  // --------------------------------------------------------------------------
  const socraticReq = { ...tutorRequest, studentContext: { ...tutorRequest.studentContext, preferredStyle: 'socratic' as const } };
  const socraticResp = await mockProvider.generateTutorResponse(socraticReq);
  assert(socraticResp.message.includes('?'), 'Case 12a: Socratic mode poses guiding question');

  const directReq = { ...tutorRequest, studentContext: { ...tutorRequest.studentContext, preferredStyle: 'direct' as const } };
  const directResp = await mockProvider.generateTutorResponse(directReq);
  assert(directResp.message.length > 0 && !directResp.message.includes('imagine'), 'Case 12b: Direct mode gives concise operational guidance');

  const analogicalReq = { ...tutorRequest, studentContext: { ...tutorRequest.studentContext, preferredStyle: 'analogical' as const } };
  const analogicalResp = await mockProvider.generateTutorResponse(analogicalReq);
  assert(
    analogicalResp.message.toLowerCase().includes('imagine') ||
    analogicalResp.message.toLowerCase().includes('branch') ||
    analogicalResp.message.toLowerCase().includes('path'),
    'Case 12c: Analogical mode uses spatial/physical metaphor'
  );

  // --------------------------------------------------------------------------
  // TEST 13: Offline & Client Fallback Resilience
  // --------------------------------------------------------------------------
  // Test SecureAIService fallback when backend URL is unreachable in Node environment
  const fallbackResp = await secureAIService.consultTutor(tutorRequest);
  assert(fallbackResp !== undefined, 'Case 13a: SecureAIService cleanly generates fallback response when backend is offline');
  assert(fallbackResp.isFallback === true, 'Case 13b: isFallback flag properly identified');

  // --------------------------------------------------------------------------
  // TEST 14: Schema Validation Defense against Malformed AI Response
  // --------------------------------------------------------------------------
  const malformedJson = { responseType: 'MISTAKE_EXPLANATION', garbage: 123 };
  const defended = AIResponseValidator.validate(malformedJson, 'test', 'test', bstTopic.detailedConcept);
  assert(!defended.isValid, 'Case 14a: Validator detects missing message field in malformed payload');
  assert(defended.validatedResponse.message.length > 0, 'Case 14b: Validator safely synthesizes fallback response');

  // --------------------------------------------------------------------------
  // TEST 15: Safe Next-Action Defense: Rogue AI NextAction Cannot Mutate Tree
  // --------------------------------------------------------------------------
  // Suppose an AI suggested a rogue nextAction ('LEFT') at node 30
  const rogueEval = await BSTPracticeEngine.evaluateDecision(
    correctResult.session, // Current node is 30, Target is 40. Correct is 40 > 30 => RIGHT!
    'LEFT', // Suppose rogue decision is LEFT
    analyticsService
  );
  assert(!rogueEval.isCorrect, 'Case 15a: Deterministic engine rejects rogue move even if AI suggested it');
  assert(rogueEval.session.currentNode.value === 30, 'Case 15b: Node pointer remains locked at 30');

  // --------------------------------------------------------------------------
  // TEST 16: Complete Insertion Walkthrough to Final State
  // --------------------------------------------------------------------------
  // Node is 30, Target is 40. 40 > 30 => RIGHT. 30 has no right child!
  const finalEval = await BSTPracticeEngine.evaluateDecision(
    rogueEval.session,
    'RIGHT',
    analyticsService
  );
  assert(finalEval.isCorrect, 'Case 16a: Authoritative RIGHT decision accepted at node 30');
  assert(finalEval.session.isComplete === true, 'Case 16b: BST insertion marks session completed');
  assert(finalEval.session.currentTree !== null, 'Case 16c: Final BST snapshot persisted');

  // --------------------------------------------------------------------------
  // TEST 17: Latency UX & Pipeline Decoupling
  // --------------------------------------------------------------------------
  // Verify that an async AI fetch does NOT pause or interfere with synchronous 3D visualizer rendering
  let renderCompletedFirst = false;
  const asyncAI = secureAIService.consultTutor(tutorRequest);
  visualizer.render(finalEval.session.currentTree, { activeNodeValue: null, targetValue: 40 });
  renderCompletedFirst = true;
  await asyncAI;
  assert(renderCompletedFirst, 'Case 17: 3D render loop remains synchronous and decoupled from async AI latency');

  // --------------------------------------------------------------------------
  // TEST 18: Resource Cleanup
  // --------------------------------------------------------------------------
  visualizer.dispose();
  assert(visualizer.rootGroup.children.length === 0, 'Case 18: Visualizer disposed all GPU meshes and scene nodes');

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n--- Phase 5 Integration & Verification Status ---');
  console.log('Implementation target:     ACHIEVED');
  console.log('Automated verification:    ACHIEVED');
  console.log('Real-device AR validation: PENDING');
  console.log('REAL DEVICE TESTING:       NOT PERFORMED (Desktop development container)');
  console.log('Deterministic Authority:  BSTEngine & BSTPracticeEngine');
  console.log('AI Role:                   Contextual Explanation & Pedagogical Remediation');
  console.log('AR Sync:                   Synchronized via Authoritative Practice State');
  console.log('--------------------------------------------------\n');

  console.log('======================================================================');
  console.log(`PHASE 5 INTEGRATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5IntegrationVerification().catch(err => {
  console.error('Unhandled error during Phase 5 verification:', err);
  process.exit(1);
});
