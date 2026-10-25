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
  expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS' | 'BASELINE_LIMITATION';
  failureAnalysis: string;
  resolutionMechanism: string;
  buildHistory: () => readonly EGEAInteractionEvent[];
}

export const FAILURE_MODE_CASES: FailureModeCase[] = [
  {
    id: 'EDGE-01',
    name: 'Pacing Threshold Boundary (1600ms Guessing)',
    description: 'Learner guesses impulsively without reading, but inter-action latency is 1600ms (just above 1500ms cutoff).',
    intendedIdealIntervention: 'STEPWISE_SLOWDOWN',
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'Prior baseline used a crisp 1500ms cutoff evadable by 1600ms attempts.',
    resolutionMechanism: 'EGEAPacingModel with EWMA smoothing expands the sustained velocity boundary to 1800ms.',
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
      ev.timeSinceLastActionMs = 1600; // 1600ms: caught via EWMA
      return adapter.getEvents();
    },
  },
  {
    id: 'EDGE-02',
    name: 'Touch Jitter / Double-Tap Artifact (< 200ms)',
    description: 'Learner accidentally triggers a double-tap touch event (120ms delta) on mobile viewport.',
    intendedIdealIntervention: 'CONTEXTUAL_HINT',
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'Prior baseline lacked a touch debounce filter, misclassifying 120ms double-tap as cognitive guessing.',
    resolutionMechanism: 'Sub-250ms identical actions on same step/control are detected as mechanical jitter and preserve initial hint.',
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
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'Prior baseline performed raw string equality, failing when dynamic retry suffixes were attached.',
    resolutionMechanism: 'Centralized EGEAStepCanonicalizer normalizes retry/attempt suffixes to canonical step ID.',
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
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'Prior baseline reduced guidance on any 3 correct actions regardless of hint scaffolding.',
    resolutionMechanism: 'Explicit hintAssisted telemetry prevents hint-assisted correct actions from fading scaffolding.',
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
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'EGEA treats the mistake as an isolated conceptual error rather than jumping to severe remediation.',
    resolutionMechanism: 'Preserves localized single-error hint response.',
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
    expectedEGEAFailureOrSuccess: 'RESOLVED_SUCCESS',
    failureAnalysis: 'Because errors occur on different steps, EGEA does not falsely trigger WORKED_EXAMPLE.',
    resolutionMechanism: 'Canonicalizer keeps distinct steps isolated, preventing false persistence triggers.',
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
  resolutionMechanism: string;
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
      resolutionMechanism: c.resolutionMechanism,
    };
  });
}
