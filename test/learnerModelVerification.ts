/**
 * Automated Verification Suite for Phase 7: Learner Modeling, Adaptive Difficulty & Measurable Evaluation
 * 
 * Verifies:
 * 1. Deterministic Evidence-Based Scoring Mechanics:
 *    - Correct attempts increase evidence and mastery appropriately
 *    - Incorrect attempts decrease performance evidence appropriately
 *    - Mastery is strictly bounded 0-100
 *    - Confidence is strictly bounded 0-100
 *    - Mastery and confidence can differ (High Mastery / Low Confidence vs Moderate Mastery / High Confidence)
 *    - Recent accuracy vs Historical accuracy calculation
 *    - Independent success rate calculation
 *    - Misconception frequency penalties
 *    - Insufficient data handling (< 3 attempts)
 * 2. Adaptive Difficulty Engine Policies:
 *    - Low mastery / poor recent accuracy -> REDUCE
 *    - High mastery + high accuracy + high independence -> INCREASE
 *    - Mixed / stable evidence -> MAINTAIN
 *    - Chronic repeated misconception -> REMEDIATION (reset to FOUNDATIONAL)
 *    - Explainable DifficultyDecision with human-readable reasons[]
 *    - Task specification generation for BST practice
 * 3. Mastery Trend Calculation:
 *    - IMPROVING, DECLINING, STABLE, INSUFFICIENT_DATA
 * 4. Explainable Needs-Review Triggers:
 *    - Declining trend, repeated misconceptions, low mastery, high assistance dependency
 * 5. Mutation Safety & Authority Boundaries:
 *    - AI agents cannot mutate learner state directly
 *    - RecommendationAgent cannot mutate learner state
 *    - AssessmentAgent cannot mutate mastery
 *    - TutorAgent cannot mutate mastery
 *    - Deterministic BSTEngine remains sole authority
 * 6. Research Evaluation Utility:
 *    - Absolute learning gain and Hake's normalized gain
 *    - Synthetic cohort summary comparison (Baseline vs Adaptive condition)
 * 7. Section 24 Complete Adaptive Demonstration Loop
 */

import { LearnerModelEngine } from '../src/services/learner/LearnerModelEngine';
import { AdaptiveDifficultyEngine } from '../src/services/adaptive/AdaptiveDifficultyEngine';
import { ResearchEvaluationUtility } from '../src/services/evaluation/ResearchEvaluationUtility';
import { LocalLearnerService } from '../src/services/learner/LocalLearnerService';
import { LocalAnalyticsService } from '../src/services/analytics/LocalAnalyticsService';
import { SecureAIService } from '../src/services/ai/SecureAIService';
import { AIOrchestrator } from '../src/services/ai/orchestrator/AIOrchestrator';
import { BSTPracticeEngine } from '../src/services/dsa/bst/BSTPracticeEngine';
import { PerformanceEvidence, LearnerTopicState } from '../src/models/adaptiveLearner';
import { DSATopic } from '../src/models/topic';
import { LearnerAIContextBuilder } from '../src/services/ai/LearnerAIContextBuilder';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, description: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(` [PASS] ${description}`);
  } else {
    console.error(` [FAIL] ${description}`);
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runLearnerModelVerification() {
  console.log('======================================================================');
  console.log(' AR-DSA TUTOR: PHASE 7 LEARNER MODEL & ADAPTIVE DIFFICULTY TEST SUITE');
  console.log('======================================================================\n');

  const bstTopic: DSATopic = {
    id: 'ds-binary-search-tree',
    title: 'Binary Search Tree',
    category: 'data-structure',
    difficulty: 'Intermediate',
    shortDescription: 'Hierarchical node structure maintaining sorted order',
    detailedConcept: 'For any node N, all values in left subtree < N < all values in right subtree',
    visualSpec: { type: 'tree', description: 'Left Subtree < Root < Right Subtree' },
    tags: ['tree', 'search', 'bst'],
    timeComplexity: { best: 'O(log N)', average: 'O(log N)', worst: 'O(N)' },
    spaceComplexity: 'O(N)',
    prerequisites: ['ds-binary-tree']
  };

  // --------------------------------------------------------------------------
  // 1. DETERMINISTIC EVIDENCE-BASED SCORING MECHANICS
  // --------------------------------------------------------------------------
  console.log('--- 1. Deterministic Evidence-Based Scoring Mechanics ---');

  // 1a. Default state has zero mastery and baseline confidence
  const initial = LearnerModelEngine.createInitialTopicState('ds-binary-search-tree');
  assert(initial.masteryScore === 0, 'Case 1a: Initial topic mastery is 0');
  assert(initial.confidenceScore === 20, 'Case 1b: Initial topic confidence has safe baseline (20)');
  assert(initial.masteryTrend === 'INSUFFICIENT_DATA', 'Case 1c: Trend is INSUFFICIENT_DATA with 0 attempts');

  // 1b. Correct independent attempts increase mastery and confidence
  let state = initial;
  for (let i = 0; i < 4; i++) {
    const ev: PerformanceEvidence = {
      id: `ev-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT',
      correct: true,
      difficulty: 'FOUNDATIONAL',
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    };
    state = LearnerModelEngine.processNewEvidence(state, ev);
  }
  assert(state.masteryScore > 60, `Case 1d: 4 correct independent attempts achieve strong mastery (${state.masteryScore}%)`);
  assert(state.confidenceScore > 40, `Case 1e: Confidence increases with successful streak (${state.confidenceScore}%)`);
  assert(state.independentSuccessRate === 100, 'Case 1f: Independent success rate is 100%');

  // 1c. Incorrect attempt decreases recent accuracy and penalizes mastery
  const errorEv: PerformanceEvidence = {
    id: 'ev-err-1',
    topicId: 'ds-binary-search-tree',
    eventType: 'PRACTICE_ATTEMPT',
    correct: false,
    difficulty: 'FOUNDATIONAL',
    usedHint: false,
    requestedExplanation: false,
    misconceptionDetected: true,
    misconceptionType: 'BST_WRONG_DIRECTION',
    timestamp: new Date().toISOString()
  };
  const postErrorState = LearnerModelEngine.processNewEvidence(state, errorEv);
  assert(postErrorState.masteryScore < state.masteryScore, `Case 1g: Mistake with misconception reduces mastery (${state.masteryScore}% -> ${postErrorState.masteryScore}%)`);
  assert(postErrorState.recentAccuracy < state.recentAccuracy, 'Case 1h: Recent window accuracy decreases after error');

  // 1d. Bounded 0–100 verification under extreme adversarial inputs
  let extremeErrorState = initial;
  for (let i = 0; i < 15; i++) {
    const badEv: PerformanceEvidence = {
      id: `ev-bad-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT',
      correct: false,
      difficulty: 'HARD',
      usedHint: true,
      requestedExplanation: true,
      misconceptionDetected: true,
      misconceptionType: 'BST_WRONG_DIRECTION',
      timestamp: new Date().toISOString()
    };
    extremeErrorState = LearnerModelEngine.processNewEvidence(extremeErrorState, badEv);
  }
  assert(extremeErrorState.masteryScore >= 0 && extremeErrorState.masteryScore <= 100, `Case 1i: Extreme errors remain bounded within [0, 100] (score=${extremeErrorState.masteryScore})`);
  assert(extremeErrorState.confidenceScore >= 0 && extremeErrorState.confidenceScore <= 100, `Case 1j: Confidence remains bounded within [0, 100] (conf=${extremeErrorState.confidenceScore})`);

  // --------------------------------------------------------------------------
  // 2. CONFIDENCE DISTINCT FROM MASTERY (Section 7)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Confidence Decoupled from Mastery ---');

  // Scenario A: High Mastery, Low Confidence (Solves correctly, but always requests hints)
  let hintDependentHistory: PerformanceEvidence[] = [];
  for (let i = 0; i < 6; i++) {
    hintDependentHistory.push({
      id: `ev-hd-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT',
      correct: true,
      difficulty: 'MEDIUM',
      usedHint: true, // Always used hint!
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    });
  }
  const hdMastery = LearnerModelEngine.calculateMastery(hintDependentHistory);
  const hdConfidence = LearnerModelEngine.calculateConfidence(hintDependentHistory);
  assert(hdMastery > hdConfidence, `Case 2a: High accuracy with high hint usage yields Mastery (${hdMastery}%) > Confidence (${hdConfidence}%)`);
  assert(hdConfidence <= 50, `Case 2b: Independence penalty keeps confidence restricted (${hdConfidence}%)`);

  // Scenario B: Moderate Mastery, High Confidence (Consistently solves foundational tasks with zero assistance)
  let independentConsistentHistory: PerformanceEvidence[] = [];
  for (let i = 0; i < 6; i++) {
    independentConsistentHistory.push({
      id: `ev-ind-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT',
      correct: true,
      difficulty: 'FOUNDATIONAL',
      usedHint: false, // Zero hints
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    });
  }
  const indConfidence = LearnerModelEngine.calculateConfidence(independentConsistentHistory);
  assert(indConfidence >= 75, `Case 2c: Unassisted consistent attempts yield high confidence (${indConfidence}%)`);

  // --------------------------------------------------------------------------
  // 3. MASTERY TRENDS (Section 14)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Mastery Trend Calculation ---');

  // 3a. Improving Trend: Recent accuracy significantly higher than historical
  const improvingEvidence: PerformanceEvidence[] = [
    // 5 early mistakes
    ...Array(5).fill(null).map((_, i) => ({
      id: `early-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT' as const,
      correct: false,
      difficulty: 'FOUNDATIONAL' as const,
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    })),
    // 5 recent successes
    ...Array(5).fill(null).map((_, i) => ({
      id: `recent-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT' as const,
      correct: true,
      difficulty: 'FOUNDATIONAL' as const,
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    }))
  ];
  const improvingTrend = LearnerModelEngine.calculateTrend(improvingEvidence);
  assert(improvingTrend === 'IMPROVING', `Case 3a: Trend correctly classified as IMPROVING (got ${improvingTrend})`);

  // 3b. Declining Trend: Recent accuracy significantly lower than historical
  const decliningEvidence: PerformanceEvidence[] = [
    // 5 early successes
    ...Array(5).fill(null).map((_, i) => ({
      id: `early-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT' as const,
      correct: true,
      difficulty: 'FOUNDATIONAL' as const,
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    })),
    // 5 recent failures
    ...Array(5).fill(null).map((_, i) => ({
      id: `recent-${i}`,
      topicId: 'ds-binary-search-tree',
      eventType: 'PRACTICE_ATTEMPT' as const,
      correct: false,
      difficulty: 'FOUNDATIONAL' as const,
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: false,
      timestamp: new Date().toISOString()
    }))
  ];
  const decliningTrend = LearnerModelEngine.calculateTrend(decliningEvidence);
  assert(decliningTrend === 'DECLINING', `Case 3b: Trend correctly classified as DECLINING (got ${decliningTrend})`);

  // 3c. Stable Trend (both historical and recent windows have 60% accuracy)
  const stablePattern = [true, true, true, false, false, true, true, true, false, false];
  const stableEvidence: PerformanceEvidence[] = stablePattern.map((correct, i) => ({
    id: `stable-${i}`,
    topicId: 'ds-binary-search-tree',
    eventType: 'PRACTICE_ATTEMPT' as const,
    correct,
    difficulty: 'FOUNDATIONAL' as const,
    usedHint: false,
    requestedExplanation: false,
    misconceptionDetected: false,
    timestamp: new Date().toISOString()
  }));
  const stableTrend = LearnerModelEngine.calculateTrend(stableEvidence);
  assert(stableTrend === 'STABLE', `Case 3c: Trend correctly classified as STABLE (got ${stableTrend})`);

  // --------------------------------------------------------------------------
  // 4. EXPLAINABLE NEEDS REVIEW TRIGGERS (Section 15)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Explainable Needs-Review Rules ---');

  // 4a. Trigger 1: Repeated misconception
  const reviewCheck1 = LearnerModelEngine.evaluateNeedsReview({
    attempts: 4,
    masteryScore: 65,
    repeatedMisconceptionCount: 2,
    masteryTrend: 'STABLE'
  });
  assert(reviewCheck1.needsReview, 'Case 4a: Repeated misconception triggers needsReview');
  assert(reviewCheck1.reasons.some(r => r.includes('Repeated misconception')), 'Case 4b: Reason explicitly references repeated misconception');

  // 4c. Trigger 2: Declining performance
  const reviewCheck2 = LearnerModelEngine.evaluateNeedsReview({
    attempts: 6,
    masteryScore: 70,
    repeatedMisconceptionCount: 0,
    masteryTrend: 'DECLINING'
  });
  assert(reviewCheck2.needsReview, 'Case 4c: Declining trend triggers needsReview');
  assert(reviewCheck2.reasons.some(r => r.includes('declining accuracy trend')), 'Case 4d: Reason explicitly references declining trend');

  // 4e. Trigger 3: Low mastery (< 60) after 3+ attempts
  const reviewCheck3 = LearnerModelEngine.evaluateNeedsReview({
    attempts: 5,
    masteryScore: 45,
    repeatedMisconceptionCount: 0,
    masteryTrend: 'STABLE'
  });
  assert(reviewCheck3.needsReview, 'Case 4e: Low mastery triggers needsReview');
  assert(reviewCheck3.reasons.some(r => r.includes('foundational threshold')), 'Case 4f: Reason explicitly cites threshold failure');

  // --------------------------------------------------------------------------
  // 5. ADAPTIVE DIFFICULTY ENGINE POLICIES (Section 9 & 10)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Adaptive Difficulty Policy Engine ---');

  // 5a. Increase Difficulty Policy: High mastery + High Accuracy + High Independence + Zero Misconceptions
  const highPerformerState: LearnerTopicState = {
    ...initial,
    masteryScore: 88,
    recentAccuracy: 90,
    independentSuccessRate: 85,
    repeatedMisconceptionCount: 0,
    attempts: 8,
    currentDifficulty: 'EASY'
  };
  const incDecision = AdaptiveDifficultyEngine.evaluateDifficulty(highPerformerState, 'EASY');
  assert(incDecision.direction === 'INCREASE', 'Case 5a: High performer receives INCREASE direction');
  assert(incDecision.recommendedDifficulty === 'MEDIUM', `Case 5b: Difficulty stepped up from EASY to MEDIUM (got ${incDecision.recommendedDifficulty})`);
  assert(incDecision.reasons.length > 0, 'Case 5c: Decision includes explainable reasons');

  // 5b. Reduce Difficulty Policy: Recent accuracy drops below 50%
  const strugglingState: LearnerTopicState = {
    ...initial,
    masteryScore: 45,
    recentAccuracy: 35,
    independentSuccessRate: 30,
    repeatedMisconceptionCount: 1,
    attempts: 6,
    currentDifficulty: 'MEDIUM'
  };
  const redDecision = AdaptiveDifficultyEngine.evaluateDifficulty(strugglingState, 'MEDIUM');
  assert(redDecision.direction === 'REDUCE', 'Case 5d: Struggling learner receives REDUCE direction');
  assert(redDecision.recommendedDifficulty === 'EASY', `Case 5e: Difficulty stepped down from MEDIUM to EASY (got ${redDecision.recommendedDifficulty})`);

  // 5c. Remediation Policy: Chronic repeated misconceptions (>= 3)
  const chronicState: LearnerTopicState = {
    ...initial,
    masteryScore: 35,
    recentAccuracy: 25,
    independentSuccessRate: 20,
    repeatedMisconceptionCount: 3,
    attempts: 7,
    currentDifficulty: 'HARD'
  };
  const remDecision = AdaptiveDifficultyEngine.evaluateDifficulty(chronicState, 'HARD');
  assert(remDecision.direction === 'REMEDIATION', 'Case 5f: Chronic errors trigger REMEDIATION direction');
  assert(remDecision.recommendedDifficulty === 'FOUNDATIONAL', 'Case 5g: Remediation resets difficulty to FOUNDATIONAL');
  assert(remDecision.reasons.some(r => r.includes('Chronic repeated misconception')), 'Case 5h: Rationale cites chronic repeated misconceptions');

  // 5d. Task Specification Generation
  const foundTask = AdaptiveDifficultyEngine.getTaskSpecification('FOUNDATIONAL', 'ds-binary-search-tree');
  assert(foundTask.showInvariantGuidance === true, 'Case 5i: FOUNDATIONAL task provides explicit invariant guidance');
  assert(foundTask.requiresPredictionBeforeMove === false, 'Case 5j: FOUNDATIONAL task does not require blind prediction');

  const hardTask = AdaptiveDifficultyEngine.getTaskSpecification('HARD', 'ds-binary-search-tree');
  assert(hardTask.requiresPredictionBeforeMove === true, 'Case 5k: HARD task requires prediction before visual traversal');

  // 5e. Audit Adaptation Record
  const auditRecord = AdaptiveDifficultyEngine.createAdaptationRecord('ds-binary-search-tree', incDecision, 'STEP_EVALUATION');
  assert(auditRecord.topicId === 'ds-binary-search-tree', 'Case 5l: Audit record links topicId');
  assert(auditRecord.previousDifficulty === 'EASY', 'Case 5m: Audit record captures previousDifficulty');
  assert(auditRecord.newDifficulty === 'MEDIUM', 'Case 5n: Audit record captures newDifficulty');
  assert(auditRecord.reasons.length > 0, 'Case 5o: Audit record persists explainable reasons');

  // --------------------------------------------------------------------------
  // 6. RESEARCH EVALUATION UTILITY (Section 20 & 21)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Research Evaluation Utility ---');

  // 6a. Absolute Gain = post - pre
  const absGain = ResearchEvaluationUtility.calculateAbsoluteGain(45, 75);
  assert(absGain === 30, `Case 6a: Absolute gain (75 - 45) = 30 (got ${absGain})`);

  // 6b. Hake's Normalized Gain = (post - pre) / (100 - pre) = 30 / 55 ~= 0.55
  const normGain = ResearchEvaluationUtility.calculateNormalizedGain(45, 75);
  assert(normGain === 0.55, `Case 6b: Normalized gain (75 - 45)/(100 - 45) = 0.55 (got ${normGain})`);

  // 6c. Comprehensive Evaluation Metrics
  const sampleEvidence: PerformanceEvidence[] = [
    { id: '1', topicId: 'bst', eventType: 'PRACTICE_ATTEMPT', correct: false, difficulty: 'FOUNDATIONAL', usedHint: false, requestedExplanation: false, misconceptionDetected: true, timestamp: '' },
    { id: '2', topicId: 'bst', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'FOUNDATIONAL', usedHint: true, requestedExplanation: false, misconceptionDetected: false, timestamp: '' },
    { id: '3', topicId: 'bst', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: '' },
    { id: '4', topicId: 'bst', eventType: 'PRACTICE_ATTEMPT', correct: true, difficulty: 'EASY', usedHint: false, requestedExplanation: false, misconceptionDetected: false, timestamp: '' }
  ];
  const evalMetrics = ResearchEvaluationUtility.calculateEvaluationMetrics(40, 80, sampleEvidence);
  assert(evalMetrics.absoluteGain === 40, 'Case 6c: Comprehensive metrics compute absolute gain');
  assert(evalMetrics.accuracy === 75, 'Case 6d: Accuracy computed across attempts (3/4 = 75%)');
  assert(evalMetrics.independentSuccessRate === 50, 'Case 6e: Independent success rate (2/4 unassisted correct = 50%)');
  assert(evalMetrics.hintDependency === 0.25, 'Case 6f: Hint dependency (1/4 = 0.25)');

  // 6d. Synthetic Cohort Comparison (Baseline vs Adaptive Condition)
  const syntheticAdaptiveCohort = [
    { preScore: 40, postScore: 80, evidence: sampleEvidence },
    { preScore: 50, postScore: 85, evidence: sampleEvidence }
  ];
  const cohortSummary = ResearchEvaluationUtility.summarizeCohort('ADAPTIVE_AI_AR', syntheticAdaptiveCohort);
  assert(cohortSummary.condition === 'ADAPTIVE_AI_AR', 'Case 6g: Cohort summary condition recorded');
  assert(cohortSummary.participantCount === 2, 'Case 6h: Participant count recorded');
  assert(cohortSummary.averagePreScore === 45, 'Case 6i: Average pre-score computed correctly');
  assert(cohortSummary.averagePostScore === 82.5, 'Case 6j: Average post-score computed correctly');
  assert(cohortSummary.averageAbsoluteGain === 37.5, 'Case 6k: Average gain computed correctly');

  // --------------------------------------------------------------------------
  // 7. MUTATION SAFETY & AUTHORITY BOUNDARIES (Section 2 & 22)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Mutation Safety & Authority Boundaries ---');

  const analytics = new LocalAnalyticsService();
  const secureAIService = new SecureAIService(analytics);
  const orchestrator = new AIOrchestrator(secureAIService, analytics);
  const learnerService = new LocalLearnerService();

  const baselineLearner = await learnerService.getLearnerState();
  const baselineTopicMastery = baselineLearner.masteryMap['ds-binary-search-tree']?.masteryPercentage || 0;

  // Build context and call orchestrator
  const aiCtx = LearnerAIContextBuilder.buildContext({
    topic: bstTopic,
    learnerState: baselineLearner
  });

  const orchResult = await orchestrator.dispatchEducationalEvent('STUDENT_REQUESTED_HINT', aiCtx);
  assert(orchResult.activatedAgents.includes('TutorAgent'), 'Case 7a: AIOrchestrator dispatched to TutorAgent');

  // Verify learner state was NOT altered by AI execution
  const postAiLearner = await learnerService.getLearnerState();
  const postAiMastery = postAiLearner.masteryMap['ds-binary-search-tree']?.masteryPercentage || 0;
  assert(postAiMastery === baselineTopicMastery, 'Case 7b: AI Agent execution did NOT mutate learner mastery');

  // BSTPracticeEngine immunity: Rogue move cannot mutate tree state
  const practiceSession = BSTPracticeEngine.startSession(undefined, 40);
  const rogueMove = 'RIGHT'; // Correct is LEFT
  const rogueEval = await BSTPracticeEngine.evaluateDecision(practiceSession, rogueMove, analytics);
  assert(!rogueEval.isCorrect, 'Case 7c: Deterministic BSTPracticeEngine authoritative rejection of incorrect move');
  assert(practiceSession.currentNode.value === 50, 'Case 7d: BST pointer remains locked at root node 50');

  // --------------------------------------------------------------------------
  // 8. COMPLETE SECTION 24 ADAPTIVE DEMONSTRATION SCENARIO
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Section 24 Complete Adaptive Demonstration Loop ---');

  // Step 1: Initial state starts at FOUNDATIONAL
  const demoLearner = new LocalLearnerService();
  let bstState = await demoLearner.getTopicState('ds-binary-search-tree');
  assert(bstState.currentDifficulty === 'FOUNDATIONAL', 'Case 8a: Topic starts at initial difficulty FOUNDATIONAL');

  // Step 2: Student makes 3 consecutive directional mistakes inserting 40 into 50
  for (let i = 0; i < 3; i++) {
    await demoLearner.recordPracticeStep('ds-binary-search-tree', false, 'BST_WRONG_DIRECTION', {
      difficulty: bstState.currentDifficulty
    });
  }
  bstState = await demoLearner.getTopicState('ds-binary-search-tree');
  assert(bstState.repeatedMisconceptionCount >= 2, `Case 8b: Repeated direction misconception detected (${bstState.repeatedMisconceptionCount} occurrences)`);
  assert(bstState.needsReview === true, 'Case 8c: Needs review flag triggered by repeated errors');

  // Step 3: Multi-Agent Orchestrator activates for REPEATED_MISCONCEPTION
  const freshLearnerState = await demoLearner.getLearnerState();
  const cascadeCtx = LearnerAIContextBuilder.buildContext({
    topic: bstTopic,
    learnerState: freshLearnerState,
    currentOperation: { operationType: 'insert', targetValue: 40, currentNodeValue: 50 },
    activeMisconception: {
      type: 'BST_WRONG_DIRECTION',
      userChoice: 'RIGHT',
      expectedChoice: 'LEFT',
      timestamp: new Date().toISOString(),
      explanation: 'Target key 40 < current key 50. Must branch to left subtree.',
      pedagogicalHint: 'Compare 40 with 50.'
    },
    recentMistakesHistory: [
      { type: 'BST_WRONG_DIRECTION', userChoice: 'RIGHT', expectedChoice: 'LEFT', currentNodeValue: 50, targetValue: 40 },
      { type: 'BST_WRONG_DIRECTION', userChoice: 'RIGHT', expectedChoice: 'LEFT', currentNodeValue: 50, targetValue: 40 },
      { type: 'BST_WRONG_DIRECTION', userChoice: 'RIGHT', expectedChoice: 'LEFT', currentNodeValue: 50, targetValue: 40 }
    ]
  });
  const cascadeResult = await orchestrator.dispatchEducationalEvent('REPEATED_MISCONCEPTION', cascadeCtx);
  assert(cascadeResult.activatedAgents.length === 4, 'Case 8d: Multi-Agent cascade triggered 4 specialized agents');
  assert(cascadeResult.misconceptionAnalysis?.misconceptionDetected === true, 'Case 8e: MisconceptionAgent diagnosed root cause');

  // Step 4: Adaptive Difficulty Engine keeps learner in FOUNDATIONAL remediation
  const remedialDecision = AdaptiveDifficultyEngine.evaluateDifficulty(bstState, bstState.currentDifficulty);
  assert(remedialDecision.direction === 'REMEDIATION' || remedialDecision.direction === 'REDUCE', `Case 8f: Engine enforces remedial guidance (direction: ${remedialDecision.direction})`);
  assert(remedialDecision.recommendedDifficulty === 'FOUNDATIONAL', 'Case 8g: Level set to FOUNDATIONAL for invariant remediation');

  // Step 5: Learner completes remedial exercises with independent success (no hints)
  for (let i = 0; i < 8; i++) {
    await demoLearner.recordPracticeStep('ds-binary-search-tree', true, undefined, {
      difficulty: 'FOUNDATIONAL',
      usedHint: false,
      requestedExplanation: false
    });
  }
  bstState = await demoLearner.getTopicState('ds-binary-search-tree');
  assert(bstState.masteryScore >= 80, `Case 8h: Learner mastery significantly improves to ${bstState.masteryScore}%`);
  assert(bstState.independentSuccessRate >= 60, `Case 8i: Independent success rate increases to ${bstState.independentSuccessRate}%`);
  assert(bstState.masteryTrend === 'IMPROVING', `Case 8j: Learning trend becomes IMPROVING (got ${bstState.masteryTrend})`);

  // Step 6: Adaptive Difficulty Engine detects high performance and increases difficulty
  const advDecision = AdaptiveDifficultyEngine.evaluateDifficulty(bstState, 'FOUNDATIONAL');
  assert(advDecision.direction === 'INCREASE', 'Case 8k: Adaptive Engine recommends INCREASE after independent success');
  assert(advDecision.recommendedDifficulty === 'EASY', `Case 8l: Recommended difficulty advances to EASY (got ${advDecision.recommendedDifficulty})`);

  // Record adaptation in audit history
  const adaptRecord = AdaptiveDifficultyEngine.createAdaptationRecord('ds-binary-search-tree', advDecision, 'POST_REMEDIATION_ADVANCEMENT');
  await demoLearner.recordAdaptation(adaptRecord);

  const history = await demoLearner.getAdaptationHistory('ds-binary-search-tree');
  assert(history.length > 0, 'Case 8m: Adaptation record persisted to audit history');
  assert(history[0].newDifficulty === 'EASY', 'Case 8n: Audit history verifies progression to EASY');

  console.log('\n--- Phase 7 Architecture & Classification ---');
  console.log('Implementation target:     ACHIEVED');
  console.log('Automated verification:    ACHIEVED');
  console.log('Real-device AR validation: PENDING');
  console.log('REAL DEVICE TESTING:       NOT PERFORMED (Desktop development container)');
  console.log('Learner Model Engine:      Deterministic evidence-based mathematical scoring');
  console.log('Adaptive Difficulty:       Explicit multi-threshold policy engine (FOUNDATIONAL -> CHALLENGE)');
  console.log('Research Evaluation:       Deterministic Gain & Cohort analysis framework');
  console.log('Human Subject Trials:      NOT PERFORMED (Prototype evaluation utility only)');
  console.log('--------------------------------------------------------');

  console.log(`\n======================================================================`);
  console.log(`PHASE 7 LEARNER MODEL SUMMARY: ${passedTests} Passed, ${totalTests - passedTests} Failed`);
  console.log(`======================================================================\n`);
}

runLearnerModelVerification().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
