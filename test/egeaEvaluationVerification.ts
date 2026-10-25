/**
 * EGEA Evaluation Verification Test Suite
 * 
 * Verifies:
 * 1. Strongly typed event schema validation and rejection of malformed inputs
 * 2. Monotonic sequence ordering and session encapsulation
 * 3. Deterministic policy evaluation across all 6 pedagogical intervention classes
 * 4. Comparative superiority over Fixed Hint and Simple Error Rule baselines
 * 5. Sub-5ms decision latency guarantee
 */

import {
  EGEAInteractionEvent,
  validateEGEAEvent,
  validateEventSequence,
} from '../src/services/research/egea/EGEAEventSchema';
import { EGEAEventAdapter } from '../src/services/research/egea/EGEAEventAdapter';
import {
  EGEAPolicyEngine,
} from '../src/services/research/egea/EGEAPolicyEngine';
import {
  FixedHintBaseline,
  SimpleErrorRuleBaseline,
} from '../src/services/research/egea/EGEABaselines';
import { EGEAEvaluationHarness } from '../src/services/research/egea/EGEAEvaluationHarness';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    failedTests++;
    console.error(`  FAIL: ${message}`);
    throw new Error(message);
  }
  passedTests++;
}

console.log('--- Starting EGEA Evaluation Verification ---');

// =========================================================================
// 1. Schema Validation Tests
// =========================================================================
console.log('Testing EGEA Schema Validation...');

const validEvent: EGEAInteractionEvent = {
  eventId: 'test-event-1',
  sequenceNumber: 1,
  sessionId: 'test-session',
  algorithmId: 'ds-binary-search-tree',
  stepIdentifier: 'node-50',
  attemptedAction: 'TRAVERSE_LEFT',
  expectedAction: 'TRAVERSE_RIGHT',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  hintExposureCount: 0,
  timeSinceLastActionMs: 2500,
  stateContext: { targetValue: 60, currentValue: 50 },
  timestamp: new Date().toISOString(),
};

const res1 = validateEGEAEvent(validEvent);
assert(res1.valid === true, 'Valid event should pass schema validation');
assert(res1.errors.length === 0, 'Valid event should have no errors');

// Malformed events
const badSeq = { ...validEvent, sequenceNumber: -1 };
assert(validateEGEAEvent(badSeq).valid === false, 'Negative sequence number should fail');

const badAlgo = { ...validEvent, algorithmId: 'invalid-algo' };
assert(validateEGEAEvent(badAlgo).valid === false, 'Invalid algorithm ID should fail');

const badCorrectness = { ...validEvent, isCorrect: true, errorCategory: 'VALUE_COMPARISON' };
assert(validateEGEAEvent(badCorrectness).valid === false, 'isCorrect=true with non-NONE errorCategory should fail');

const badErrorCat = { ...validEvent, isCorrect: false, errorCategory: 'NONE' };
assert(validateEGEAEvent(badErrorCat).valid === false, 'isCorrect=false with errorCategory=NONE should fail');

const badTimestamp = { ...validEvent, timestamp: 'invalid-date-string' };
assert(validateEGEAEvent(badTimestamp).valid === false, 'Invalid date string should fail');

// =========================================================================
// 2. Monotonic Sequence Validation Tests
// =========================================================================
console.log('Testing Monotonic Sequence Validation...');

const seq1: EGEAInteractionEvent = { ...validEvent, sequenceNumber: 1 };
const seq2: EGEAInteractionEvent = {
  ...validEvent,
  eventId: 'test-event-2',
  sequenceNumber: 2,
  timestamp: new Date(Date.now() + 1000).toISOString(),
};
const seq3: EGEAInteractionEvent = {
  ...validEvent,
  eventId: 'test-event-3',
  sequenceNumber: 3,
  timestamp: new Date(Date.now() + 2000).toISOString(),
};

assert(validateEventSequence([seq1, seq2, seq3]).valid === true, 'Monotonic 1, 2, 3 sequence should pass');

// Sequence with gap (1, 3)
assert(validateEventSequence([seq1, seq3]).valid === false, 'Sequence with gap should fail');

// Sequence with session mismatch
const wrongSession = { ...seq2, sessionId: 'other-session' };
assert(validateEventSequence([seq1, wrongSession]).valid === false, 'Session mismatch in sequence should fail');

// Sequence with algorithm mismatch
const wrongAlgo = { ...seq2, algorithmId: 'algo-bubble-sort' as any };
assert(validateEventSequence([seq1, wrongAlgo]).valid === false, 'Algorithm mismatch in sequence should fail');

// Sequence with timestamp inversion
const timeInverted = { ...seq2, timestamp: new Date(Date.now() - 50000).toISOString() };
assert(validateEventSequence([seq1, timeInverted]).valid === false, 'Timestamp inversion in sequence should fail');

// =========================================================================
// 3. EGEA Policy Engine Decision Tests
// =========================================================================
console.log('Testing EGEA Policy Engine Decisions across 6 Classes...');

// A. Empty History -> Default Exploratory Guidance
const emptyDec = EGEAPolicyEngine.evaluateIntervention([]);
assert(emptyDec.interventionType === 'REDUCE_GUIDANCE', 'Empty history should yield REDUCE_GUIDANCE');
assert(emptyDec.rationaleCode === 'NORMAL_PROGRESSION', 'Empty history rationale should be NORMAL_PROGRESSION');

// B. One-Off Isolated Error -> CONTEXTUAL_HINT
const adapterA = new EGEAEventAdapter('sess-a', 'ds-binary-search-tree');
adapterA.recordInteraction({
  stepIdentifier: 's1',
  attemptedAction: 'LEFT',
  expectedAction: 'RIGHT',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: { targetElementId: 'node-50' },
});
const decA = EGEAPolicyEngine.evaluateIntervention(adapterA.getEvents());
assert(decA.interventionType === 'CONTEXTUAL_HINT', 'Isolated error should yield CONTEXTUAL_HINT');
assert(decA.rationaleCode === 'ISOLATED_CONCEPTUAL_MISCONCEPTION', 'Rationale should be ISOLATED_CONCEPTUAL_MISCONCEPTION');
assert(decA.targetElementId === 'node-50', 'Target element ID should be preserved');

// C. Rapid Impulsive Guessing (< 1500ms latency) -> STEPWISE_SLOWDOWN
const adapterB = new EGEAEventAdapter('sess-b', 'algo-bubble-sort');
adapterB.recordInteraction({
  stepIdentifier: 'b1',
  attemptedAction: 'SWAP',
  expectedAction: 'ADVANCE',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: {},
});
const evB2 = adapterB.recordInteraction({
  stepIdentifier: 'b2',
  attemptedAction: 'SWAP',
  expectedAction: 'ADVANCE',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: {},
});
// Enforce rapid pacing (< 1500ms)
evB2.timeSinceLastActionMs = 900;
const decB = EGEAPolicyEngine.evaluateIntervention(adapterB.getEvents());
assert(decB.interventionType === 'STEPWISE_SLOWDOWN', 'Rapid consecutive errors should yield STEPWISE_SLOWDOWN');
assert(decB.rationaleCode === 'RAPID_GUESSING_DETECTED', 'Rationale should be RAPID_GUESSING_DETECTED');

// D. Attention Saliency Lapse -> HIGHLIGHT_ELEMENT
const adapterC = new EGEAEventAdapter('sess-c', 'algo-breadth-first-search');
adapterC.recordInteraction({
  stepIdentifier: 'c1',
  attemptedAction: 'VISIT_REPEATED',
  expectedAction: 'VISIT_UNVISITED',
  isCorrect: false,
  errorCategory: 'CYCLE_OR_UNVISITED',
  stateContext: { targetNodeId: 'node-vertex-B' },
});
const decC = EGEAPolicyEngine.evaluateIntervention(adapterC.getEvents());
assert(decC.interventionType === 'HIGHLIGHT_ELEMENT', 'Traversal cycle error should yield HIGHLIGHT_ELEMENT');
assert(decC.rationaleCode === 'ATTENTION_SALIENCE_LAPSE', 'Rationale should be ATTENTION_SALIENCE_LAPSE');
assert(decC.targetElementId === 'node-vertex-B', 'Target node should match targetNodeId');

// E. Persistent Repeated Failure (3+ on same step) -> WORKED_EXAMPLE
const adapterD = new EGEAEventAdapter('sess-d', 'algo-binary-search');
for (let i = 1; i <= 3; i++) {
  const ev = adapterD.recordInteraction({
    stepIdentifier: 'fixed-step-midpoint',
    attemptedAction: `TRY_${i}`,
    expectedAction: 'HALVE_RIGHT',
    isCorrect: false,
    errorCategory: 'VALUE_COMPARISON',
    stateContext: { targetElementId: 'mid-index-4' },
  });
  ev.timeSinceLastActionMs = 2500;
}
const decD = EGEAPolicyEngine.evaluateIntervention(adapterD.getEvents());
assert(decD.interventionType === 'WORKED_EXAMPLE', '3 consecutive failures on same step should yield WORKED_EXAMPLE');
assert(decD.rationaleCode === 'PERSISTENT_STEP_FAILURE', 'Rationale should be PERSISTENT_STEP_FAILURE');
assert(decD.targetElementId === 'mid-index-4', 'Target element should match stateContext target');

// F. Prerequisite Deficit (>= 4 failures across steps, >= 60% failure rate) -> PREREQUISITE_REVIEW
const adapterE = new EGEAEventAdapter('sess-e', 'ds-stack');
adapterE.recordInteraction({
  stepIdentifier: 's1',
  attemptedAction: 'PUSH',
  expectedAction: 'PUSH',
  isCorrect: true,
  stateContext: {},
});
for (let i = 2; i <= 5; i++) {
  const ev = adapterE.recordInteraction({
    stepIdentifier: `step-${i}`,
    attemptedAction: `WRONG_${i}`,
    expectedAction: 'CORRECT',
    isCorrect: false,
    errorCategory: 'CAPACITY_LIMIT',
    stateContext: {},
  });
  ev.timeSinceLastActionMs = 2500;
}
const decE = EGEAPolicyEngine.evaluateIntervention(adapterE.getEvents());
assert(decE.interventionType === 'PREREQUISITE_REVIEW', 'High cumulative error rate across steps should yield PREREQUISITE_REVIEW');
assert(decE.rationaleCode === 'PREREQUISITE_DEFICIT', 'Rationale should be PREREQUISITE_DEFICIT');

// G. Independent Mastery Streak (>= 3 consecutive correct without hints) -> REDUCE_GUIDANCE
const adapterF = new EGEAEventAdapter('sess-f', 'ds-binary-search-tree');
for (let i = 1; i <= 4; i++) {
  adapterF.recordInteraction({
    stepIdentifier: `step-${i}`,
    attemptedAction: `MOVE_${i}`,
    expectedAction: `MOVE_${i}`,
    isCorrect: true,
    stateContext: {},
  });
}
const decF = EGEAPolicyEngine.evaluateIntervention(adapterF.getEvents());
assert(decF.interventionType === 'REDUCE_GUIDANCE', 'Mastery streak should yield REDUCE_GUIDANCE');
assert(decF.rationaleCode === 'INDEPENDENT_MASTERY_STREAK', 'Rationale should be INDEPENDENT_MASTERY_STREAK');

// =========================================================================
// 4. Baseline Superiority Tests
// =========================================================================
console.log('Testing Baselines Comparison...');

// When learner guesses rapidly:
// Fixed hint baseline only outputs generic text
const b1Guess = FixedHintBaseline.evaluate(adapterB.getEvents());
assert(b1Guess.interventionType === 'CONTEXTUAL_HINT', 'Fixed hint baseline cannot detect rapid guessing');

// Simple error rule baseline only outputs category lookup
const b2Guess = SimpleErrorRuleBaseline.evaluate(adapterB.getEvents());
assert(b2Guess.interventionType === 'CONTEXTUAL_HINT', 'Simple error rule cannot detect rapid guessing');

// EGEA adapts with STEPWISE_SLOWDOWN
const b3Guess = EGEAPolicyEngine.evaluateIntervention(adapterB.getEvents());
assert(b3Guess.interventionType === 'STEPWISE_SLOWDOWN', 'EGEA correctly intervenes with STEPWISE_SLOWDOWN');

// When learner has 3x persistent failure:
const b1Persist = FixedHintBaseline.evaluate(adapterD.getEvents());
assert(b1Persist.interventionType === 'CONTEXTUAL_HINT', 'Fixed hint cannot offer worked examples');

const b2Persist = SimpleErrorRuleBaseline.evaluate(adapterD.getEvents());
assert(b2Persist.interventionType === 'CONTEXTUAL_HINT', 'Simple error rule cannot offer worked examples');

const b3Persist = EGEAPolicyEngine.evaluateIntervention(adapterD.getEvents());
assert(b3Persist.interventionType === 'WORKED_EXAMPLE', 'EGEA correctly escalates to WORKED_EXAMPLE');

// =========================================================================
// 5. Latency Benchmark Guarantee (< 5ms)
// =========================================================================
console.log('Testing Latency Benchmark Guarantee...');

const sampleEvents = adapterE.getEvents();
const latencies: number[] = [];
for (let i = 0; i < 100; i++) {
  const t0 = performance.now();
  EGEAPolicyEngine.evaluateIntervention(sampleEvents);
  const t1 = performance.now();
  latencies.push(t1 - t0);
}
const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
assert(avgLatency < 5.0, `Average decision latency must be < 5.0ms (measured: ${avgLatency.toFixed(3)}ms)`);

console.log(`\nAll EGEA Evaluation Verification Tests Passed: ${passedTests} passed, ${failedTests} failed.`);
