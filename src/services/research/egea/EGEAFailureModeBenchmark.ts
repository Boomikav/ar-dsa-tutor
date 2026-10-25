/**
 * EGEA Failure Mode & Counterexample Benchmark
 * 
 * Specifically designed to test the boundary limits, failure modes,
 * and edge cases of the EGEA Policy Engine and Baselines:
 * 
 * 1. Pacing Threshold Boundary: Guessing at 1600ms (threshold cutoff failure)
 * 2. Touch Jitter Artifact: Rapid double-tap (< 200ms touch glitch)
 * 3. Step Identifier Mismatch: Same conceptual problem with variant step IDs
 * 4. Hint-Reliance Boundary: Correct moves with continuous hint consumption
 * 5. Transient Slip: Single error after extensive 10-step mastery streak
 * 6. Floundering Across Steps: 3 errors across 3 different steps (not worked example)
 */

import { EGEAInteractionEvent } from './EGEAEventSchema';
import { EGEAEventAdapter } from './EGEAEventAdapter';
import {
  EGEAInterventionType,
  EGEAPolicyEngine,
} from './EGEAPolicyEngine';
import {
  FixedHintBaseline,
  SimpleErrorRuleBaseline,
} from './EGEABaselines';
import { MatchedHistoryBaseline } from './EGEAMatchedHistoryBaseline';

export interface FailureModeCase {
  id: string;
  name: string;
  description: string;
  intendedIdealIntervention: EGEAInterventionType;
  expectedEGEAFailureOrSuccess: 'EXPECTED_SUCCESS' | 'DOCUMENTED_LIMITATION_OR_FAILURE';
  failureAnalysis: string;
  buildHistory: () => readonly EGEAInteractionEvent[];
}

export const FAILURE_MODE_CASES: FailureModeCase[] = [
  {
    id: 'EDGE-01',
    name: 'Pacing Threshold Boundary (1600ms Guessing)',
    description: 'Learner guesses impulsively without reading, but inter-action latency is 1600ms (just above 1500ms cutoff).',
    intendedIdealIntervention: 'STEPWISE_SLOWDOWN',
    expectedEGEAFailureOrSuccess: 'DOCUMENTED_LIMITATION_OR_FAILURE',
    failureAnalysis: 'EGEA relies on a crisp cutoff (1500ms). Latency of 1600ms evades detection, resulting in CONTEXTUAL_HINT.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-01', 'algo-bubble-sort');
      adapter.recordInteraction({
        stepIdentifier: 'step-0',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'step-0',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 1600; // 1600ms: evades 1500ms cutoff
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-02',
    name: 'Touch Jitter / Double-Tap Artifact (< 200ms)',
    description: 'Learner accidentally triggers a double-tap touch event (120ms delta) on mobile viewport.',
    intendedIdealIntervention: 'CONTEXTUAL_HINT',
    expectedEGEAFailureOrSuccess: 'DOCUMENTED_LIMITATION_OR_FAILURE',
    failureAnalysis: 'EGEA lacks an ultra-low latency debounce filter (< 250ms). It interprets accidental touch jitter as impulsive guessing and triggers STEPWISE_SLOWDOWN.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-02', 'ds-stack');
      adapter.recordInteraction({
        stepIdentifier: 'push-op',
        attemptedAction: 'PUSH',
        expectedAction: 'POP',
        isCorrect: false,
        errorCategory: 'CAPACITY_LIMIT',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'push-op',
        attemptedAction: 'PUSH',
        expectedAction: 'POP',
        isCorrect: false,
        errorCategory: 'CAPACITY_LIMIT',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 120; // 120ms touch jitter
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-03',
    name: 'Variant Step Identifier for Identical Problem',
    description: 'Learner fails 3 times on the same BST node, but step identifiers are named dynamically (node-50-try-1, node-50-try-2, node-50-try-3).',
    intendedIdealIntervention: 'WORKED_EXAMPLE',
    expectedEGEAFailureOrSuccess: 'DOCUMENTED_LIMITATION_OR_FAILURE',
    failureAnalysis: 'EGEA performs exact string matching on stepIdentifier. Variant suffixes prevent persistent impasse detection, falling through to CONTEXTUAL_HINT.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-03', 'ds-binary-search-tree');
      for (let i = 1; i <= 3; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `node-50-try-${i}`,
          attemptedAction: 'LEFT',
          expectedAction: 'RIGHT',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 3000;
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-04',
    name: 'Maladaptive Hint-Reliance on Correct Steps',
    description: 'Learner executes 3 correct moves, but requested a hint before every single move.',
    intendedIdealIntervention: 'CONTEXTUAL_HINT',
    expectedEGEAFailureOrSuccess: 'EXPECTED_SUCCESS',
    failureAnalysis: 'EGEA correctly checks that hintExposureCount did not change during the streak. Because hints were consumed, it does NOT falsely fade scaffolds.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-04', 'algo-binary-search');
      for (let i = 1; i <= 3; i++) {
        adapter.recordHintUsage();
        adapter.recordInteraction({
          stepIdentifier: `bs-${i}`,
          attemptedAction: 'HALVE',
          expectedAction: 'HALVE',
          isCorrect: true,
          hintUsed: true,
          stateContext: {},
        });
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-05',
    name: 'Transient Error After 10-Step Mastery Streak',
    description: 'Learner completes 10 consecutive correct operations autonomously, then makes an isolated comparison slip.',
    intendedIdealIntervention: 'CONTEXTUAL_HINT',
    expectedEGEAFailureOrSuccess: 'EXPECTED_SUCCESS',
    failureAnalysis: 'EGEA treats the mistake as an isolated conceptual error rather than jumping to severe remediation.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-05', 'ds-binary-search-tree');
      for (let i = 1; i <= 10; i++) {
        adapter.recordInteraction({
          stepIdentifier: `node-${i}`,
          attemptedAction: `CORRECT_${i}`,
          expectedAction: `CORRECT_${i}`,
          isCorrect: true,
          stateContext: {},
        });
      }
      const ev = adapter.recordInteraction({
        stepIdentifier: 'node-final',
        attemptedAction: 'WRONG_BRANCH',
        expectedAction: 'RIGHT_BRANCH',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 4000;
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-06',
    name: 'Floundering Across Steps (3 Errors on 3 Distinct Steps)',
    description: 'Learner fails 3 times, but each failure is on a different step at deliberate 3s pacing.',
    intendedIdealIntervention: 'CONTEXTUAL_HINT',
    expectedEGEAFailureOrSuccess: 'EXPECTED_SUCCESS',
    failureAnalysis: 'Because errors occur on different steps, EGEA does not falsely trigger WORKED_EXAMPLE. Because total errors = 3 (< 4), it does not falsely trigger PREREQUISITE_REVIEW.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('edge-sess-06', 'algo-breadth-first-search');
      for (let i = 1; i <= 3; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `bfs-distinct-step-${i}`,
          attemptedAction: `WRONG_NEIGHBOR_${i}`,
          expectedAction: `RIGHT_NEIGHBOR_${i}`,
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 3200;
      }
      return adapter.getEvents();
    },
  },
];

export interface FailureModeEvaluationResult {
  caseId: string;
  name: string;
  intendedIdeal: EGEAInterventionType;
  fixedHintPrediction: EGEAInterventionType;
  simpleRulePrediction: EGEAInterventionType;
  matchedHistoryPrediction: EGEAInterventionType;
  egeaPrediction: EGEAInterventionType;
  egeaMatchesIdeal: boolean;
  behaviorClassification: 'SUCCESS' | 'DISCLOSED_LIMITATION';
  technicalRootCause: string;
}

export function evaluateFailureModeBenchmark(): FailureModeEvaluationResult[] {
  return FAILURE_MODE_CASES.map(c => {
    const history = c.buildHistory();
    const fPred = FixedHintBaseline.evaluate(history).interventionType;
    const sPred = SimpleErrorRuleBaseline.evaluate(history).interventionType;
    const mPred = MatchedHistoryBaseline.evaluate(history).interventionType;
    const ePred = EGEAPolicyEngine.evaluateIntervention(history).interventionType;

    const matches = ePred === c.intendedIdealIntervention;

    return {
      caseId: c.id,
      name: c.name,
      intendedIdeal: c.intendedIdealIntervention,
      fixedHintPrediction: fPred,
      simpleRulePrediction: sPred,
      matchedHistoryPrediction: mPred,
      egeaPrediction: ePred,
      egeaMatchesIdeal: matches,
      behaviorClassification: matches ? 'SUCCESS' : 'DISCLOSED_LIMITATION',
      technicalRootCause: c.failureAnalysis,
    };
  });
}
