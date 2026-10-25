/**
 * AR-DSA Tutor — Phase 2 Research Hardening Verification Suite
 * 
 * Comprehensive automated regression testing for:
 * 1. Phase 2 (EDGE-01 Fix): EWMA temporal pacing, boundary handling, NaN/infinity safety.
 * 2. Phase 3 (EDGE-02 Fix): Touch jitter debouncing, rapid multi-control action preservation.
 * 3. Phase 4 (EDGE-03 Fix): Centralized step canonicalization, alias mappings, distinct step isolation.
 * 4. Phase 5 (EDGE-04 Fix): Independent vs. hint-assisted mastery differentiation, scaffold protection.
 * 5. Phase 6 (Robustness): Session resets, sequence idempotence, missing metadata fallbacks.
 */

import { EGEAPacingModel } from '../src/services/research/egea/EGEAPacingModel';
import { canonicalizeStepIdentifier, areStepIdentifiersEquivalent } from '../src/services/research/egea/EGEAStepCanonicalizer';
import { EGEAEventAdapter } from '../src/services/research/egea/EGEAEventAdapter';
import { EGEAPolicyEngine } from '../src/services/research/egea/EGEAPolicyEngine';
import { validateEGEAEvent, EGEAInteractionEvent } from '../src/services/research/egea/EGEAEventSchema';

let passedAssertions = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${msg}`);
  }
  passedAssertions++;
}

console.log('====================================================');
console.log('RUNNING EGEA PHASE 2 HARDENING VERIFICATION SUITE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: EDGE-01 Pacing Model & EWMA Verification
// -----------------------------------------------------------------------------
console.log('Section 1: Pacing Model & EWMA Calculations...');

// 1.1 NaN and Non-Finite Latency Sanitization
assert(EGEAPacingModel.sanitizeLatency(NaN) === 3000, 'NaN latency sanitizes to 3000ms deliberate baseline');
assert(EGEAPacingModel.sanitizeLatency(-500) === 0, 'Negative latency clamps to 0');
assert(EGEAPacingModel.sanitizeLatency(Infinity) === 3000, 'Infinity latency sanitizes to safe deliberate baseline');
assert(EGEAPacingModel.sanitizeLatency(75000, 60000) === 60000, 'Latency above max clamps to maxValidLatencyMs');
assert(EGEAPacingModel.sanitizeLatency(1200) === 1200, 'Valid latency 1200ms preserved');

// 1.2 EWMA Update Equations
const latencies1 = [1000, 1000, 1000];
const ewma1 = EGEAPacingModel.computeEWMA(latencies1, 0.5);
assert(Math.abs(ewma1 - 1000) < 1e-4, 'Constant latency EWMA equals constant value (1000ms)');

// Step-by-step: S0 = 2000. L1 = 1000 -> S1 = 0.5*1000 + 0.5*2000 = 1500.
const latencies2 = [2000, 1000];
const ewma2 = EGEAPacingModel.computeEWMA(latencies2, 0.5);
assert(Math.abs(ewma2 - 1500) < 1e-4, 'EWMA step update matches alpha=0.5 equation');

// 1.3 Pacing Threshold Classifications
// Fast burst (< 1500ms)
const adapterFast = new EGEAEventAdapter('sess-pacing-1', 'algo-bubble-sort');
adapterFast.recordInteraction({
  stepIdentifier: 's1',
  attemptedAction: 'SWAP',
  expectedAction: 'ADVANCE',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: {},
});
const evFast = adapterFast.recordInteraction({
  stepIdentifier: 's1',
  attemptedAction: 'SWAP',
  expectedAction: 'ADVANCE',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: {},
});
evFast.timeSinceLastActionMs = 1200; // < 1500ms
const resFast = EGEAPacingModel.evaluatePacing(adapterFast.getEvents());
assert(resFast.isRapidGuessing === true, 'Latency 1200ms on consecutive errors triggers rapid guessing');

// Boundary perturbation: 1600ms (EDGE-01 fix)
evFast.timeSinceLastActionMs = 1600;
const res1600 = EGEAPacingModel.evaluatePacing(adapterFast.getEvents());
assert(res1600.isRapidGuessing === true, 'Latency 1600ms on consecutive errors caught via sustained EWMA');

// Boundary perturbation: 1750ms
evFast.timeSinceLastActionMs = 1750;
const res1750 = EGEAPacingModel.evaluatePacing(adapterFast.getEvents());
assert(res1750.isRapidGuessing === true, 'Latency 1750ms on consecutive errors caught via boundary expansion (<= 1800ms)');

// Deliberate pause: 2500ms and 3500ms
evFast.timeSinceLastActionMs = 2500;
const res2500 = EGEAPacingModel.evaluatePacing(adapterFast.getEvents());
assert(res2500.isRapidGuessing === false, 'Latency 2500ms is not flagged as rapid guessing');

evFast.timeSinceLastActionMs = 3500;
const res3500 = EGEAPacingModel.evaluatePacing(adapterFast.getEvents());
assert(res3500.isDeliberatePondering === true && res3500.isRapidGuessing === false, 'Latency 3500ms recognized as deliberate reflection');

// Single error only: never rapid guessing
const adapterSingle = new EGEAEventAdapter('sess-pacing-single', 'algo-bubble-sort');
const evSingle = adapterSingle.recordInteraction({
  stepIdentifier: 's1',
  attemptedAction: 'SWAP',
  expectedAction: 'ADVANCE',
  isCorrect: false,
  errorCategory: 'VALUE_COMPARISON',
  stateContext: {},
});
evSingle.timeSinceLastActionMs = 600;
const resSingle = EGEAPacingModel.evaluatePacing(adapterSingle.getEvents());
assert(resSingle.isRapidGuessing === false, 'Single isolated error is never classified as rapid guessing even with low latency');

// -----------------------------------------------------------------------------
// SECTION 2: EDGE-02 Touch Jitter & Debounce Verification
// -----------------------------------------------------------------------------
console.log('Section 2: Touch Jitter & Debounce Verification...');

// 2.1 Duplicate Tap Detection (< 250ms on identical step & action)
const adapterJitter = new EGEAEventAdapter('sess-jitter-1', 'ds-stack');
adapterJitter.recordInteraction({
  stepIdentifier: 'push-op',
  attemptedAction: 'PUSH',
  expectedAction: 'POP',
  isCorrect: false,
  errorCategory: 'CAPACITY_LIMIT',
  stateContext: {},
});
const evJitter = adapterJitter.recordInteraction({
  stepIdentifier: 'push-op',
  attemptedAction: 'PUSH',
  expectedAction: 'POP',
  isCorrect: false,
  errorCategory: 'CAPACITY_LIMIT',
  stateContext: {},
});
evJitter.timeSinceLastActionMs = 120; // 120ms duplicate tap

const resJitter = EGEAPacingModel.evaluatePacing(adapterJitter.getEvents());
assert(resJitter.isTouchJitter === true, 'Sub-250ms identical action classified as touch jitter');
assert(resJitter.isRapidGuessing === false, 'Touch jitter is NOT flagged as cognitive guessing');

// Policy engine on jitter returns contextual hint for initial error, NOT slowdown
const decisionJitter = EGEAPolicyEngine.evaluateIntervention(adapterJitter.getEvents());
assert(decisionJitter.interventionType === 'CONTEXTUAL_HINT', 'EGEA emits CONTEXTUAL_HINT for initial error instead of throttling double-tap');

// 2.2 Rapid Legitimate Actions on Different Controls / Steps (180ms)
const adapterLegit = new EGEAEventAdapter('sess-legit-rapid', 'algo-binary-search');
adapterLegit.recordInteraction({
  stepIdentifier: 'bs-step-1',
  attemptedAction: 'HALVE_LEFT',
  expectedAction: 'HALVE_LEFT',
  isCorrect: true,
  stateContext: {},
});
const evLegit2 = adapterLegit.recordInteraction({
  stepIdentifier: 'bs-step-2', // Different step & action
  attemptedAction: 'HALVE_RIGHT',
  expectedAction: 'HALVE_RIGHT',
  isCorrect: true,
  stateContext: {},
});
evLegit2.timeSinceLastActionMs = 180;
const resLegit = EGEAPacingModel.evaluatePacing(adapterLegit.getEvents());
assert(resLegit.isTouchJitter === false, 'Rapid action on different step/control is NOT classified as touch jitter');

// 2.3 Adapter Suppress Duplicate Option
const adapterSuppress = new EGEAEventAdapter('sess-suppress', 'ds-stack', {
  debounceIntervalMs: 250,
  suppressDuplicateEvents: true,
});
adapterSuppress.recordInteraction({
  stepIdentifier: 'op-1',
  attemptedAction: 'PUSH',
  expectedAction: 'PUSH',
  isCorrect: true,
  stateContext: {},
});
// Immediate duplicate (synchronous in test -> latency 0ms)
adapterSuppress.recordInteraction({
  stepIdentifier: 'op-1',
  attemptedAction: 'PUSH',
  expectedAction: 'PUSH',
  isCorrect: true,
  stateContext: {},
});
assert(adapterSuppress.getEvents().length === 1, 'Adapter with suppressDuplicateEvents=true omits mechanical duplicate event from event log');

// -----------------------------------------------------------------------------
// SECTION 3: EDGE-03 Step Identifier Canonicalization Verification
// -----------------------------------------------------------------------------
console.log('Section 3: Step Identifier Canonicalization...');

// 3.1 Null, Malformed, and Unknown Safety
assert(canonicalizeStepIdentifier(null) === '__UNKNOWN_STEP__', 'Null step identifier returns __UNKNOWN_STEP__');
assert(canonicalizeStepIdentifier(undefined) === '__UNKNOWN_STEP__', 'Undefined step identifier returns __UNKNOWN_STEP__');
assert(canonicalizeStepIdentifier('') === '__UNKNOWN_STEP__', 'Empty step identifier returns __UNKNOWN_STEP__');
assert(canonicalizeStepIdentifier('   ') === '__UNKNOWN_STEP__', 'Whitespace step identifier returns __UNKNOWN_STEP__');
assert(canonicalizeStepIdentifier(12345) === '__UNKNOWN_STEP__', 'Non-string identifier returns __UNKNOWN_STEP__');

// 3.2 Known Semantic Aliases
assert(canonicalizeStepIdentifier('NODE_42_L') === 'NODE_42_LEFT', 'NODE_42_L canonicalizes to NODE_42_LEFT');
assert(canonicalizeStepIdentifier('NODE_42_R') === 'NODE_42_RIGHT', 'NODE_42_R canonicalizes to NODE_42_RIGHT');
assert(canonicalizeStepIdentifier('STACK_PUSH_OP') === 'STACK_PUSH', 'STACK_PUSH_OP canonicalizes to STACK_PUSH');
assert(canonicalizeStepIdentifier('PUSH_OP') === 'STACK_PUSH', 'PUSH_OP canonicalizes to STACK_PUSH');
assert(canonicalizeStepIdentifier('BS_MIDPOINT_DECISION') === 'MIDPOINT_DECISION', 'BS_MIDPOINT_DECISION canonicalizes to MIDPOINT_DECISION');

// 3.3 Retry and Attempt Suffixes
assert(canonicalizeStepIdentifier('node-50-try-1') === 'node-50', 'node-50-try-1 strips suffix to node-50');
assert(canonicalizeStepIdentifier('node-50-try-2') === 'node-50', 'node-50-try-2 strips suffix to node-50');
assert(canonicalizeStepIdentifier('node-50-try-3') === 'node-50', 'node-50-try-3 strips suffix to node-50');
assert(canonicalizeStepIdentifier('binary-tree-attempt-2') === 'binary-tree', 'attempt suffix stripped correctly');
assert(canonicalizeStepIdentifier('search_retry_4') === 'search', 'retry suffix stripped correctly');

// 3.4 Distinct Steps Remain Non-Equivalent
assert(areStepIdentifiersEquivalent('step-1', 'step-2') === false, 'step-1 and step-2 are distinct');
assert(areStepIdentifiersEquivalent('bfs-distinct-step-1', 'bfs-distinct-step-2') === false, 'BFS distinct steps remain distinct');
assert(areStepIdentifiersEquivalent('node-root', 'node-right-child') === false, 'Tree parent and child remain distinct');
assert(areStepIdentifiersEquivalent('node-50-try-1', 'node-50-try-2') === true, 'Retry variants evaluate as equivalent');
assert(areStepIdentifiersEquivalent('NODE_42_L', 'NODE_42_LEFT') === true, 'Explicit alias and canonical evaluate as equivalent');

// 3.5 Persistent Impasse Detection Across Aliases
const adapterAlias = new EGEAEventAdapter('sess-alias-impasse', 'ds-binary-search-tree');
const aliasSteps = ['node-50-try-1', 'node-50-try-2', 'node-50-try-3'];
aliasSteps.forEach(step => {
  const ev = adapterAlias.recordInteraction({
    stepIdentifier: step,
    attemptedAction: 'LEFT',
    expectedAction: 'RIGHT',
    isCorrect: false,
    errorCategory: 'VALUE_COMPARISON',
    stateContext: {},
  });
  ev.timeSinceLastActionMs = 3500;
});
const decisionAlias = EGEAPolicyEngine.evaluateIntervention(adapterAlias.getEvents());
assert(decisionAlias.interventionType === 'WORKED_EXAMPLE', 'Repeated errors across alias suffixes trigger WORKED_EXAMPLE');

// -----------------------------------------------------------------------------
// SECTION 4: EDGE-04 Hint-Assisted Mastery Differentiation
// -----------------------------------------------------------------------------
console.log('Section 4: Hint-Assisted Mastery Differentiation...');

// 4.1 Three Pure Independent Correct Actions -> REDUCE_GUIDANCE (INDEPENDENT_MASTERY_STREAK)
const adapterAutonomous = new EGEAEventAdapter('sess-mastery-pure', 'ds-binary-search-tree');
for (let i = 1; i <= 3; i++) {
  adapterAutonomous.recordInteraction({
    stepIdentifier: `node-${i}`,
    attemptedAction: `INSERT_${i}`,
    expectedAction: `INSERT_${i}`,
    isCorrect: true,
    hintUsed: false,
    stateContext: {},
  });
}
const decisionAutonomous = EGEAPolicyEngine.evaluateIntervention(adapterAutonomous.getEvents());
assert(decisionAutonomous.interventionType === 'REDUCE_GUIDANCE', '3 independent correct actions trigger REDUCE_GUIDANCE');
assert(decisionAutonomous.rationaleCode === 'INDEPENDENT_MASTERY_STREAK', 'Rationale is INDEPENDENT_MASTERY_STREAK');

// 4.2 Three Hint-Assisted Correct Actions -> CONTEXTUAL_HINT (HINT_ASSISTED_PROGRESSION)
const adapterHintAssisted = new EGEAEventAdapter('sess-mastery-hint', 'algo-binary-search');
for (let i = 1; i <= 3; i++) {
  adapterHintAssisted.recordHintUsage();
  adapterHintAssisted.recordInteraction({
    stepIdentifier: `bs-${i}`,
    attemptedAction: 'HALVE',
    expectedAction: 'HALVE',
    isCorrect: true,
    hintUsed: true,
    stateContext: {},
  });
}
const decisionHintAssisted = EGEAPolicyEngine.evaluateIntervention(adapterHintAssisted.getEvents());
assert(decisionHintAssisted.interventionType === 'CONTEXTUAL_HINT', '3 hint-assisted correct actions do NOT reduce guidance');
assert(decisionHintAssisted.rationaleCode === 'HINT_ASSISTED_PROGRESSION', 'Rationale identifies HINT_ASSISTED_PROGRESSION');

// 4.3 Mixed: 2 Independent, 1 Assisted, 1 Independent -> Streak is not 3 independent
const adapterMixed = new EGEAEventAdapter('sess-mastery-mixed', 'algo-bubble-sort');
adapterMixed.recordInteraction({ stepIdentifier: 'p1', attemptedAction: 'A', expectedAction: 'A', isCorrect: true, stateContext: {} });
adapterMixed.recordInteraction({ stepIdentifier: 'p2', attemptedAction: 'B', expectedAction: 'B', isCorrect: true, stateContext: {} });
// Assisted:
adapterMixed.recordHintUsage();
adapterMixed.recordInteraction({ stepIdentifier: 'p3', attemptedAction: 'C', expectedAction: 'C', isCorrect: true, hintUsed: true, stateContext: {} });
// Independent:
adapterMixed.recordInteraction({ stepIdentifier: 'p4', attemptedAction: 'D', expectedAction: 'D', isCorrect: true, stateContext: {} });

const decisionMixed = EGEAPolicyEngine.evaluateIntervention(adapterMixed.getEvents());
assert(decisionMixed.rationaleCode !== 'INDEPENDENT_MASTERY_STREAK', 'Intermittent hint resets independent streak counter');

// 4.4 Error in between resets streak
const adapterBroken = new EGEAEventAdapter('sess-streak-broken', 'ds-stack');
adapterBroken.recordInteraction({ stepIdentifier: 'p1', attemptedAction: 'PUSH', expectedAction: 'PUSH', isCorrect: true, stateContext: {} });
adapterBroken.recordInteraction({ stepIdentifier: 'p2', attemptedAction: 'PUSH', expectedAction: 'PUSH', isCorrect: true, stateContext: {} });
adapterBroken.recordInteraction({ stepIdentifier: 'p3', attemptedAction: 'PUSH', expectedAction: 'POP', isCorrect: false, errorCategory: 'CAPACITY_LIMIT', stateContext: {} });
adapterBroken.recordInteraction({ stepIdentifier: 'p4', attemptedAction: 'PUSH', expectedAction: 'PUSH', isCorrect: true, stateContext: {} });

const decisionBroken = EGEAPolicyEngine.evaluateIntervention(adapterBroken.getEvents());
assert(decisionBroken.rationaleCode !== 'INDEPENDENT_MASTERY_STREAK', 'Intervening error resets independent streak counter');

// -----------------------------------------------------------------------------
// SECTION 5: Schema Validation & Event Monotonicity
// -----------------------------------------------------------------------------
console.log('Section 5: Schema Validation & Robustness...');

const eventRaw: EGEAInteractionEvent = {
  eventId: 'valid-event-1',
  sequenceNumber: 1,
  sessionId: 'test-session',
  algorithmId: 'ds-binary-search-tree',
  stepIdentifier: 'node-root',
  canonicalStepIdentifier: 'NODE_ROOT',
  attemptedAction: 'LEFT',
  expectedAction: 'LEFT',
  isCorrect: true,
  errorCategory: 'NONE',
  hintExposureCount: 0,
  hintAssisted: false,
  timeSinceLastActionMs: 2500,
  stateContext: { val: 50 },
  timestamp: new Date().toISOString(),
};

const validResult = validateEGEAEvent(eventRaw);
assert(validResult.valid === true, 'Event with new canonical and hintAssisted fields passes strict validation');

// Missing optional fields still valid
const eventLegacy: EGEAInteractionEvent = {
  eventId: eventRaw.eventId,
  sequenceNumber: eventRaw.sequenceNumber,
  sessionId: eventRaw.sessionId,
  algorithmId: eventRaw.algorithmId,
  stepIdentifier: eventRaw.stepIdentifier,
  attemptedAction: eventRaw.attemptedAction,
  expectedAction: eventRaw.expectedAction,
  isCorrect: eventRaw.isCorrect,
  errorCategory: eventRaw.errorCategory,
  hintExposureCount: eventRaw.hintExposureCount,
  timeSinceLastActionMs: eventRaw.timeSinceLastActionMs,
  stateContext: eventRaw.stateContext,
  timestamp: eventRaw.timestamp,
};
const legacyResult = validateEGEAEvent(eventLegacy);
assert(legacyResult.valid === true, 'Legacy event without optional canonicalStepIdentifier or hintAssisted remains fully valid');

// Corrupt non-boolean hintAssisted fails validation
const corruptEvent = { ...eventRaw, hintAssisted: 'true' as unknown as boolean };
const corruptResult = validateEGEAEvent(corruptEvent);
assert(corruptResult.valid === false, 'Non-boolean hintAssisted fails validation');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`ALL TESTS PASSED: ${passedAssertions} assertions verified`);
console.log('Zero regressions, 100% deterministic invariants intact.');
console.log('====================================================\n');
