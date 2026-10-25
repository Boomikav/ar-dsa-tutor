/**
 * EGEA Held-Out Evaluation Suite (N = 12)
 * 
 * A distinct, pre-registered held-out evaluation suite comprising 12 realistic,
 * boundary-stressing learner interaction scenarios across all five WebXR algorithms.
 * 
 * Strict Experimental Methodology:
 * 1. Independent from tuning: These 12 cases were NOT used to calibrate EGEA thresholds or fixes.
 * 2. Unbiased baseline comparison: Evaluates Fixed Hint, Simple Error Rule, Matched History, and EGEA.
 * 3. Robustness coverage: Tests temporal boundary perturbations (1750ms, 2900ms),
 *    legitimate rapid multi-control taps vs duplicate touch jitter, structural alias mapping,
 *    distinct step preservation, intermittent hint-reliance, systemic failure, and missing telemetry (NaN).
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

export interface HeldOutScenario {
  id: string;
  name: string;
  algorithmId: string;
  targetIntervention: EGEAInterventionType;
  rationale: string;
  evaluationCategory: 'TEMPORAL_PACING' | 'TOUCH_JITTER' | 'CANONICAL_ALIASES' | 'HINT_RELIANCE' | 'SYSTEMIC_PREREQ' | 'TELEMETRY_ROBUSTNESS';
  buildHistory: () => readonly EGEAInteractionEvent[];
}

export const HELD_OUT_EVALUATION_SUITE: HeldOutScenario[] = [
  // 1. Temporal Pacing: Near-boundary perturbation at 1750ms
  {
    id: 'HOLDOUT-01',
    name: 'BST Pacing Perturbation (1750ms Consecutive Errors)',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'STEPWISE_SLOWDOWN',
    evaluationCategory: 'TEMPORAL_PACING',
    rationale: 'Learner commits two consecutive branch errors spaced at 1750ms. With EWMA smoothing (alpha=0.5), this sustained velocity falls within the boundary threshold (<= 1800ms), requiring a deliberate slowdown.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-01', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'node-root',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'node-root',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 1750;
      return adapter.getEvents();
    },
  },

  // 2. Temporal Pacing: Deliberate Hesitation just below 3000ms
  {
    id: 'HOLDOUT-02',
    name: 'Bubble Sort Deliberate Hesitation (2900ms Pacing)',
    algorithmId: 'algo-bubble-sort',
    targetIntervention: 'CONTEXTUAL_HINT',
    evaluationCategory: 'TEMPORAL_PACING',
    rationale: 'Learner makes an error after a 2900ms pause. This is deliberate thinking (> 1800ms boundary), not impulsive clicking. Contextual hint is appropriate.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-02', 'algo-bubble-sort');
      adapter.recordInteraction({
        stepIdentifier: 'step-0',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'step-1',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 2900;
      return adapter.getEvents();
    },
  },

  // 3. Touch Jitter vs Legitimate Rapid Successive Inputs on Different Controls
  {
    id: 'HOLDOUT-03',
    name: 'Binary Search Legitimate Rapid Multi-Step Execution (180ms)',
    algorithmId: 'algo-binary-search',
    targetIntervention: 'REDUCE_GUIDANCE',
    evaluationCategory: 'TOUCH_JITTER',
    rationale: 'Learner correctly executes step 1, then executes step 2 on a different control in 180ms. Because the controls/actions differ, this is legitimate rapid mastery, NOT mechanical duplicate jitter.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-03', 'algo-binary-search');
      adapter.recordInteraction({
        stepIdentifier: 'bs-step-1',
        attemptedAction: 'HALVE_LEFT',
        expectedAction: 'HALVE_LEFT',
        isCorrect: true,
        stateContext: {},
      });
      const ev2 = adapter.recordInteraction({
        stepIdentifier: 'bs-step-2',
        attemptedAction: 'HALVE_RIGHT',
        expectedAction: 'HALVE_RIGHT',
        isCorrect: true,
        stateContext: {},
      });
      ev2.timeSinceLastActionMs = 180;
      return adapter.getEvents();
    },
  },

  // 4. Touch Jitter: Duplicate tap on Spatial Attention error
  {
    id: 'HOLDOUT-04',
    name: 'BFS Duplicate Tap on Traversal Salience Error (140ms)',
    algorithmId: 'algo-breadth-first-search',
    targetIntervention: 'HIGHLIGHT_ELEMENT',
    evaluationCategory: 'TOUCH_JITTER',
    rationale: 'Learner makes a traversal direction error, followed by an immediate 140ms duplicate tap on the same control. Touch debounce recognizes jitter, preserving the underlying spatial attention intervention rather than triggering slowdown.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-04', 'algo-breadth-first-search');
      adapter.recordInteraction({
        stepIdentifier: 'bfs-vertex-C',
        attemptedAction: 'SELECT_C',
        expectedAction: 'SELECT_B',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: { targetNodeId: 'node-B' },
      });
      const ev2 = adapter.recordInteraction({
        stepIdentifier: 'bfs-vertex-C',
        attemptedAction: 'SELECT_C',
        expectedAction: 'SELECT_B',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: { targetNodeId: 'node-B' },
      });
      ev2.timeSinceLastActionMs = 140;
      return adapter.getEvents();
    },
  },

  // 5. Canonical Aliases: Stack Operations Aliasing (STACK_PUSH vs PUSH_OP)
  {
    id: 'HOLDOUT-05',
    name: 'Stack Operations Canonical Alias Impasse (3x Errors)',
    algorithmId: 'ds-stack',
    targetIntervention: 'WORKED_EXAMPLE',
    evaluationCategory: 'CANONICAL_ALIASES',
    rationale: 'Learner fails 3 times on the push step using variant aliases (STACK_PUSH_OP, PUSH_OP, STACK_PUSH). Canonicalization normalizes these to STACK_PUSH, detecting persistent impasse.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-05', 'ds-stack');
      const aliases = ['STACK_PUSH_OP', 'PUSH_OP', 'STACK_PUSH'];
      aliases.forEach(alias => {
        const ev = adapter.recordInteraction({
          stepIdentifier: alias,
          attemptedAction: 'PUSH',
          expectedAction: 'POP',
          isCorrect: false,
          errorCategory: 'CAPACITY_LIMIT',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 3500;
      });
      return adapter.getEvents();
    },
  },

  // 6. Canonical Aliases: Distinct Sibling Steps Must NOT Be Merged
  {
    id: 'HOLDOUT-06',
    name: 'BST Distinct Sibling Steps Isolation',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'CONTEXTUAL_HINT',
    evaluationCategory: 'CANONICAL_ALIASES',
    rationale: 'Learner commits errors across 3 distinct nodes (node-40-left, node-40-right, node-50-left). Canonicalizer must preserve distinct steps, preventing false WORKED_EXAMPLE.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-06', 'ds-binary-search-tree');
      const steps = ['node-40-left', 'node-40-right', 'node-50-left'];
      steps.forEach(step => {
        const ev = adapter.recordInteraction({
          stepIdentifier: step,
          attemptedAction: 'LEFT',
          expectedAction: 'RIGHT',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 3200;
      });
      return adapter.getEvents();
    },
  },

  // 7. Hint Reliance: Intermittent Hint Scaffolding
  {
    id: 'HOLDOUT-07',
    name: 'Bubble Sort Intermittent Hint Assistance',
    algorithmId: 'algo-bubble-sort',
    targetIntervention: 'REDUCE_GUIDANCE',
    evaluationCategory: 'HINT_RELIANCE',
    rationale: 'Learner executes correct moves: step 1 (independent), step 2 (hint-assisted), step 3 (independent), step 4 (independent). Total streak = 2 independent moves. Normal progression is maintained, but mastery streak is NOT falsely granted until 3 pure independent moves occur.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-07', 'algo-bubble-sort');
      adapter.recordInteraction({
        stepIdentifier: 'pair-1',
        attemptedAction: 'SWAP',
        expectedAction: 'SWAP',
        isCorrect: true,
        stateContext: {},
      });
      adapter.recordHintUsage();
      adapter.recordInteraction({
        stepIdentifier: 'pair-2',
        attemptedAction: 'ADVANCE',
        expectedAction: 'ADVANCE',
        isCorrect: true,
        hintUsed: true,
        stateContext: {},
      });
      adapter.recordInteraction({
        stepIdentifier: 'pair-3',
        attemptedAction: 'SWAP',
        expectedAction: 'SWAP',
        isCorrect: true,
        stateContext: {},
      });
      adapter.recordInteraction({
        stepIdentifier: 'pair-4',
        attemptedAction: 'ADVANCE',
        expectedAction: 'ADVANCE',
        isCorrect: true,
        stateContext: {},
      });
      return adapter.getEvents();
    },
  },

  // 8. Systemic Failure: Multi-step collapse with 5 failures
  {
    id: 'HOLDOUT-08',
    name: 'Binary Search High-Density Systemic Collapse',
    algorithmId: 'algo-binary-search',
    targetIntervention: 'PREREQUISITE_REVIEW',
    evaluationCategory: 'SYSTEMIC_PREREQ',
    rationale: 'Learner fails 5 times out of 6 attempts across distinct steps with deliberate pacing. Over 80% failure rate triggers foundational prerequisite review.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-08', 'algo-binary-search');
      adapter.recordInteraction({
        stepIdentifier: 'init',
        attemptedAction: 'HALVE_LEFT',
        expectedAction: 'HALVE_LEFT',
        isCorrect: true,
        stateContext: {},
      });
      for (let i = 1; i <= 5; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `bs-step-${i}`,
          attemptedAction: 'HALVE_LEFT',
          expectedAction: 'HALVE_RIGHT',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 3500;
      }
      return adapter.getEvents();
    },
  },

  // 9. Spatial Traversal: Breadth-First Search Unvisited Cycle
  {
    id: 'HOLDOUT-09',
    name: 'BFS Graph Cycle Traversal Salience Lapse',
    algorithmId: 'algo-breadth-first-search',
    targetIntervention: 'HIGHLIGHT_ELEMENT',
    evaluationCategory: 'TEMPORAL_PACING',
    rationale: 'Learner attempts to revisit an already-processed graph vertex in BFS. Spatial element highlighting pulses the unvisited queue neighbor.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-09', 'algo-breadth-first-search');
      const ev = adapter.recordInteraction({
        stepIdentifier: 'bfs-cycle-check',
        attemptedAction: 'VISIT_VERTEX_A',
        expectedAction: 'VISIT_VERTEX_D',
        isCorrect: false,
        errorCategory: 'CYCLE_OR_UNVISITED',
        stateContext: { targetNodeId: 'node-D' },
      });
      ev.timeSinceLastActionMs = 4200;
      return adapter.getEvents();
    },
  },

  // 10. Stack Underflow After Autonomous Push
  {
    id: 'HOLDOUT-10',
    name: 'Stack Underflow Slip After Autonomous Pushes',
    algorithmId: 'ds-stack',
    targetIntervention: 'CONTEXTUAL_HINT',
    evaluationCategory: 'HINT_RELIANCE',
    rationale: 'Learner pushes elements correctly, but attempts to pop when target was peek. Isolated capacity/boundary slip requires contextual hint.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-10', 'ds-stack');
      adapter.recordInteraction({
        stepIdentifier: 'push-1',
        attemptedAction: 'PUSH',
        expectedAction: 'PUSH',
        isCorrect: true,
        stateContext: {},
      });
      adapter.recordInteraction({
        stepIdentifier: 'push-2',
        attemptedAction: 'PUSH',
        expectedAction: 'PUSH',
        isCorrect: true,
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'peek-step',
        attemptedAction: 'POP',
        expectedAction: 'PEEK',
        isCorrect: false,
        errorCategory: 'CAPACITY_LIMIT',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 3800;
      return adapter.getEvents();
    },
  },

  // 11. Telemetry Robustness: Handling NaN / Non-Finite Latency
  {
    id: 'HOLDOUT-11',
    name: 'BST Pacing with Corrupt NaN Latency Telemetry',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'CONTEXTUAL_HINT',
    evaluationCategory: 'TELEMETRY_ROBUSTNESS',
    rationale: 'Interaction telemetry contains NaN latency on second error. EGEAPacingModel sanitizes NaN to deliberate baseline (3000ms), preventing spurious slowdown crashes.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-11', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'root-left',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'root-left',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = NaN as unknown as number; // Corrupt telemetry simulation
      return adapter.getEvents();
    },
  },

  // 12. Full Autonomous Mastery Streak (3 Pure Correct Actions)
  {
    id: 'HOLDOUT-12',
    name: 'BST Autonomous 3-Step Mastery Streak',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'REDUCE_GUIDANCE',
    evaluationCategory: 'HINT_RELIANCE',
    rationale: 'Learner performs 3 consecutive correct actions completely autonomously without hints. Fades visual guidance.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('holdout-sess-12', 'ds-binary-search-tree');
      for (let i = 1; i <= 3; i++) {
        adapter.recordInteraction({
          stepIdentifier: `node-autonomous-${i}`,
          attemptedAction: `INSERT_${i}`,
          expectedAction: `INSERT_${i}`,
          isCorrect: true,
          hintUsed: false,
          stateContext: {},
        });
      }
      return adapter.getEvents();
    },
  },
];

export interface HeldOutCaseEvaluation {
  id: string;
  name: string;
  category: string;
  intendedIdeal: EGEAInterventionType;
  fixedHint: EGEAInterventionType;
  simpleRule: EGEAInterventionType;
  matchedHistory: EGEAInterventionType;
  egea: EGEAInterventionType;
  egeaMatches: boolean;
}

export interface SystemMetrics {
  name: string;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1Unweighted: number;
  macroF1Harmonic: number;
  correctCount: number;
  totalCount: number;
  confusionMatrix: Record<string, Record<string, number>>;
}

export function evaluateHeldOutSuite(): {
  cases: HeldOutCaseEvaluation[];
  metrics: {
    fixedHint: SystemMetrics;
    simpleRule: SystemMetrics;
    matchedHistory: SystemMetrics;
    egea: SystemMetrics;
  };
} {
  const classes: EGEAInterventionType[] = [
    'CONTEXTUAL_HINT',
    'STEPWISE_SLOWDOWN',
    'HIGHLIGHT_ELEMENT',
    'WORKED_EXAMPLE',
    'PREREQUISITE_REVIEW',
    'REDUCE_GUIDANCE',
  ];

  const caseResults: HeldOutCaseEvaluation[] = [];

  const initConfusion = (): Record<string, Record<string, number>> => {
    const matrix: Record<string, Record<string, number>> = {};
    classes.forEach(c => {
      matrix[c] = {};
      classes.forEach(p => { matrix[c][p] = 0; });
    });
    return matrix;
  };

  const confusions: Record<string, Record<string, Record<string, number>>> = {
    fixedHint: initConfusion(),
    simpleRule: initConfusion(),
    matchedHistory: initConfusion(),
    egea: initConfusion(),
  };

  let correctCounts: Record<string, number> = {
    fixedHint: 0,
    simpleRule: 0,
    matchedHistory: 0,
    egea: 0,
  };

  HELD_OUT_EVALUATION_SUITE.forEach(scenario => {
    const history = scenario.buildHistory();
    const actual = scenario.targetIntervention;

    const fPred = FixedHintBaseline.evaluate(history).interventionType;
    const sPred = SimpleErrorRuleBaseline.evaluate(history).interventionType;
    const mPred = MatchedHistoryBaseline.evaluate(history).interventionType;
    const ePred = EGEAPolicyEngine.evaluateIntervention(history).interventionType;

    if (fPred === actual) correctCounts.fixedHint++;
    if (sPred === actual) correctCounts.simpleRule++;
    if (mPred === actual) correctCounts.matchedHistory++;
    if (ePred === actual) correctCounts.egea++;

    confusions.fixedHint[actual][fPred]++;
    confusions.simpleRule[actual][sPred]++;
    confusions.matchedHistory[actual][mPred]++;
    confusions.egea[actual][ePred]++;

    caseResults.push({
      id: scenario.id,
      name: scenario.name,
      category: scenario.evaluationCategory,
      intendedIdeal: actual,
      fixedHint: fPred,
      simpleRule: sPred,
      matchedHistory: mPred,
      egea: ePred,
      egeaMatches: ePred === actual,
    });
  });

  const total = HELD_OUT_EVALUATION_SUITE.length;

  const computeMetrics = (sysKey: string, name: string): SystemMetrics => {
    const matrix = confusions[sysKey];
    let sumP = 0;
    let sumR = 0;
    let sumF1 = 0;
    let validClasses = 0;

    classes.forEach(c => {
      const tp = matrix[c][c];
      let rowTotal = 0; // True instances of class c
      let colTotal = 0; // Predicted instances of class c
      classes.forEach(other => {
        rowTotal += matrix[c][other];
        colTotal += matrix[other][c];
      });

      // Only compute metrics for classes present in the held-out target distribution
      if (rowTotal > 0) {
        validClasses++;
        const prec = colTotal > 0 ? tp / colTotal : 0;
        const rec = rowTotal > 0 ? tp / rowTotal : 0;
        const f1 = (prec + rec) > 0 ? (2 * prec * rec) / (prec + rec) : 0;
        sumP += prec;
        sumR += rec;
        sumF1 += f1;
      }
    });

    const macroP = validClasses > 0 ? sumP / validClasses : 0;
    const macroR = validClasses > 0 ? sumR / validClasses : 0;
    const macroF1Unweighted = validClasses > 0 ? sumF1 / validClasses : 0;
    const macroF1Harmonic = (macroP + macroR) > 0 ? (2 * macroP * macroR) / (macroP + macroR) : 0;

    return {
      name,
      accuracy: correctCounts[sysKey] / total,
      macroPrecision: macroP,
      macroRecall: macroR,
      macroF1Unweighted,
      macroF1Harmonic,
      correctCount: correctCounts[sysKey],
      totalCount: total,
      confusionMatrix: matrix,
    };
  };

  return {
    cases: caseResults,
    metrics: {
      fixedHint: computeMetrics('fixedHint', 'Fixed Hint Baseline'),
      simpleRule: computeMetrics('simpleRule', 'Simple Error Rule Baseline'),
      matchedHistory: computeMetrics('matchedHistory', 'Matched-History Baseline'),
      egea: computeMetrics('egea', 'EGEA Policy Engine'),
    },
  };
}
