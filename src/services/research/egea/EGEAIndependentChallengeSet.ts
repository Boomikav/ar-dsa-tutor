/**
 * EGEA Independent Engineering Challenge Suite
 * 
 * An independently authored evaluation suite comprising 18 realistic, nuanced
 * learner interaction trajectories across the 5 DSA algorithms.
 * 
 * Pedagogical Design Rubric:
 * - Frozen specification: Scenarios and target labels are established prior to evaluation.
 * - Balanced class distribution: 3 scenarios per intervention class (18 total).
 * - Rigorous counterexamples: Deliberate pauses vs rapid guessing, fluent expert pacing vs
 *   rushing errors, single step impasse vs alternating errors, hint-reliance vs autonomy.
 * - Non-circular provenance: Represents learner behavioral patterns rather than internal
 *   unit-test predicates.
 * 
 * Note on Provenance:
 * Authored as an Engineering Challenge Benchmark based on Sweller's Cognitive Load
 * Scaffolding Theory. No external third-party human panel was recruited.
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

export interface EngineeringChallengeScenario {
  id: string;
  name: string;
  algorithmId: string;
  targetIntervention: EGEAInterventionType;
  pedagogicalRationale: string;
  distinguishesFrom: string;
  buildHistory: () => readonly EGEAInteractionEvent[];
}

export const ENGINEERING_CHALLENGE_SUITE: EngineeringChallengeScenario[] = [
  // =========================================================================
  // CLASS 1: CONTEXTUAL_HINT (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-01',
    name: 'Deliberate Pondering Followed by Second Error',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'CONTEXTUAL_HINT',
    pedagogicalRationale: 'Learner pauses for 18 seconds between attempts. This indicates deliberate reflection rather than impulsive guessing. A localized invariant hint is appropriate.',
    distinguishesFrom: 'STEPWISE_SLOWDOWN (pacing is slow, not fast)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-01', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'node-root',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: { val: 50 },
      });
      const ev2 = adapter.recordInteraction({
        stepIdentifier: 'node-right-child',
        attemptedAction: 'LEFT',
        expectedAction: 'RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: { val: 75 },
      });
      ev2.timeSinceLastActionMs = 18000;
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-02',
    name: 'First Step Encounter Error on Empty Stack',
    algorithmId: 'ds-stack',
    targetIntervention: 'CONTEXTUAL_HINT',
    pedagogicalRationale: 'Learner on the first step of practice attempts to pop from an empty stack. This is an early boundary slip, not a systemic prerequisite failure.',
    distinguishesFrom: 'PREREQUISITE_REVIEW (isolated first encounter, not multi-step collapse)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-02', 'ds-stack');
      adapter.recordInteraction({
        stepIdentifier: 'stack-initial-pop',
        attemptedAction: 'POP',
        expectedAction: 'PUSH',
        isCorrect: false,
        errorCategory: 'CAPACITY_LIMIT',
        stateContext: { stackSize: 0 },
      });
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-03',
    name: 'Isolated Binary Search Boundary Error After Progress',
    algorithmId: 'algo-binary-search',
    targetIntervention: 'CONTEXTUAL_HINT',
    pedagogicalRationale: 'Learner halves correctly on step 1, then makes an isolated comparison error on step 2 with deliberate pacing (3500ms).',
    distinguishesFrom: 'WORKED_EXAMPLE (first failure on this step, not 3x impasse)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-03', 'algo-binary-search');
      adapter.recordInteraction({
        stepIdentifier: 'bs-step-1',
        attemptedAction: 'HALVE_LEFT',
        expectedAction: 'HALVE_LEFT',
        isCorrect: true,
        stateContext: { low: 0, high: 7, mid: 3 },
      });
      const ev2 = adapter.recordInteraction({
        stepIdentifier: 'bs-step-2',
        attemptedAction: 'HALVE_LEFT',
        expectedAction: 'HALVE_RIGHT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: { low: 4, high: 7, mid: 5 },
      });
      ev2.timeSinceLastActionMs = 3500;
      return adapter.getEvents();
    },
  },

  // =========================================================================
  // CLASS 2: STEPWISE_SLOWDOWN (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-04',
    name: 'Impulsive Trial-and-Error Button Mashing in Bubble Sort',
    algorithmId: 'algo-bubble-sort',
    targetIntervention: 'STEPWISE_SLOWDOWN',
    pedagogicalRationale: 'Learner clicks swap button twice within 600ms without inspecting adjacent elements. Throttling and reflection are required.',
    distinguishesFrom: 'CONTEXTUAL_HINT (rapid guessing violates deliberate practice)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-04', 'algo-bubble-sort');
      adapter.recordInteraction({
        stepIdentifier: 'bubble-swap-0',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'bubble-swap-0',
        attemptedAction: 'SWAP',
        expectedAction: 'ADVANCE',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 600;
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-05',
    name: 'Rapid Panic Alternation on Tree Branching',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'STEPWISE_SLOWDOWN',
    pedagogicalRationale: 'Learner toggles left and right in 900ms panic response after an initial mistake.',
    distinguishesFrom: 'HIGHLIGHT_ELEMENT (pacing is the acute hazard, not spatial saliency)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-05', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'node-30',
        attemptedAction: 'RIGHT',
        expectedAction: 'LEFT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'node-30',
        attemptedAction: 'LEFT',
        expectedAction: 'LEFT',
        isCorrect: false,
        errorCategory: 'VALUE_COMPARISON',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 900;
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-06',
    name: 'Rapid Double Click on Disconnected BFS Graph',
    algorithmId: 'algo-breadth-first-search',
    targetIntervention: 'STEPWISE_SLOWDOWN',
    pedagogicalRationale: 'Learner rapidly clicks non-adjacent nodes (< 1100ms) trying to guess the next BFS traversal path.',
    distinguishesFrom: 'HIGHLIGHT_ELEMENT (speed indicates guesswork over confusion)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-06', 'algo-breadth-first-search');
      adapter.recordInteraction({
        stepIdentifier: 'bfs-node-B',
        attemptedAction: 'VISIT_E',
        expectedAction: 'VISIT_C',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'bfs-node-B',
        attemptedAction: 'VISIT_F',
        expectedAction: 'VISIT_C',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: {},
      });
      ev.timeSinceLastActionMs = 1050;
      return adapter.getEvents();
    },
  },

  // =========================================================================
  // CLASS 3: HIGHLIGHT_ELEMENT (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-07',
    name: 'Spatial Adjacency Disorientation in 3D BFS Graph',
    algorithmId: 'algo-breadth-first-search',
    targetIntervention: 'HIGHLIGHT_ELEMENT',
    pedagogicalRationale: 'Learner pauses deliberately (4500ms), studying 3D perspective, but selects a non-adjacent vertex. Saliency highlighting redirects attention.',
    distinguishesFrom: 'STEPWISE_SLOWDOWN (learner was careful and slow, not guessing)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-07', 'algo-breadth-first-search');
      adapter.recordInteraction({
        stepIdentifier: 'bfs-root',
        attemptedAction: 'ENQUEUE_ROOT',
        expectedAction: 'ENQUEUE_ROOT',
        isCorrect: true,
        stateContext: { activeNode: 'A' },
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'bfs-visit-adj',
        attemptedAction: 'VISIT_VERTEX_E',
        expectedAction: 'VISIT_VERTEX_B',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: { targetNodeId: 'vertex-B', attemptedNodeId: 'vertex-E' },
      });
      ev.timeSinceLastActionMs = 4500;
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-08',
    name: 'Graph Cycle Revisitation Confusion in BFS',
    algorithmId: 'algo-breadth-first-search',
    targetIntervention: 'HIGHLIGHT_ELEMENT',
    pedagogicalRationale: 'Learner tries to re-enqueue an already visited vertex. Spatially pulsing the active queue element clarifies the next valid target.',
    distinguishesFrom: 'CONTEXTUAL_HINT (visual pulse directly solves spatial ambiguity)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-08', 'algo-breadth-first-search');
      adapter.recordInteraction({
        stepIdentifier: 'bfs-step-1',
        attemptedAction: 'VISIT_A',
        expectedAction: 'VISIT_A',
        isCorrect: true,
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'bfs-step-2',
        attemptedAction: 'RE_VISIT_A',
        expectedAction: 'VISIT_B',
        isCorrect: false,
        errorCategory: 'CYCLE_OR_UNVISITED',
        stateContext: { targetNodeId: 'vertex-B' },
      });
      ev.timeSinceLastActionMs = 3800;
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-09',
    name: 'Tree Branch Traversal Disconnect in BST',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'HIGHLIGHT_ELEMENT',
    pedagogicalRationale: 'Learner misses the target sub-tree node during deep traversal. Visual highlight focuses spatial attention.',
    distinguishesFrom: 'CONTEXTUAL_HINT (spatial orientation is the core obstacle)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-09', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'node-root',
        attemptedAction: 'TRAVERSE',
        expectedAction: 'TRAVERSE',
        isCorrect: true,
        stateContext: {},
      });
      const ev = adapter.recordInteraction({
        stepIdentifier: 'node-lvl-2',
        attemptedAction: 'JUMP_ACROSS',
        expectedAction: 'FOLLOW_BRANCH',
        isCorrect: false,
        errorCategory: 'TRAVERSAL_DIRECTION',
        stateContext: { targetNodeId: 'node-child-42' },
      });
      ev.timeSinceLastActionMs = 3200;
      return adapter.getEvents();
    },
  },

  // =========================================================================
  // CLASS 4: WORKED_EXAMPLE (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-10',
    name: 'Persistent Binary Search Midpoint Impasse (3x Attempts)',
    algorithmId: 'algo-binary-search',
    targetIntervention: 'WORKED_EXAMPLE',
    pedagogicalRationale: 'Learner repeatedly fails 3 times on the exact same midpoint decision. Text hints have proven ineffective; an animated 3D worked-example demonstration is necessary.',
    distinguishesFrom: 'CONTEXTUAL_HINT (single hint has already failed repeatedly)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-10', 'algo-binary-search');
      for (let i = 1; i <= 3; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: 'midpoint-decision-step-1',
          attemptedAction: 'HALVE_LEFT',
          expectedAction: 'HALVE_RIGHT',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: { low: 0, high: 7, mid: 3, targetVal: 45, midVal: 20 },
        });
        ev.timeSinceLastActionMs = 3500;
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-11',
    name: 'Persistent Bubble Sort Inversion Swap Impasse (3x Attempts)',
    algorithmId: 'algo-bubble-sort',
    targetIntervention: 'WORKED_EXAMPLE',
    pedagogicalRationale: 'Learner is unable to determine whether elements at index 3 and 4 should be swapped across 3 consecutive deliberate attempts.',
    distinguishesFrom: 'STEPWISE_SLOWDOWN (learner is deliberate at 4s intervals, but stuck conceptually)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-11', 'algo-bubble-sort');
      for (let i = 1; i <= 3; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: 'bubble-pair-3-4',
          attemptedAction: 'ADVANCE',
          expectedAction: 'SWAP',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: { idx1: 3, idx2: 4, val1: 88, val2: 24 },
        });
        ev.timeSinceLastActionMs = 4000;
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-12',
    name: 'Persistent BST Insertion Anchor Impasse (3x Attempts)',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'WORKED_EXAMPLE',
    pedagogicalRationale: 'Learner fails 3 times to find the correct leaf node insertion position for value 35.',
    distinguishesFrom: 'PREREQUISITE_REVIEW (failure is localized to a single step, not whole-tree collapse)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-12', 'ds-binary-search-tree');
      for (let i = 1; i <= 3; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: 'insert-leaf-35',
          attemptedAction: 'ATTACH_LEFT',
          expectedAction: 'ATTACH_RIGHT',
          isCorrect: false,
          errorCategory: 'VALUE_COMPARISON',
          stateContext: { parentVal: 30, insertVal: 35 },
        });
        ev.timeSinceLastActionMs = 3100;
      }
      return adapter.getEvents();
    },
  },

  // =========================================================================
  // CLASS 5: PREREQUISITE_REVIEW (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-13',
    name: 'Systemic Conceptual Collapse Across Tree Levels',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'PREREQUISITE_REVIEW',
    pedagogicalRationale: 'Learner fails 4 consecutive steps across 4 distinct tree levels (> 60% failure rate). Lacks foundational hierarchy concepts.',
    distinguishesFrom: 'WORKED_EXAMPLE (failure is systemic across multiple steps, not one step)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-13', 'ds-binary-search-tree');
      adapter.recordInteraction({
        stepIdentifier: 'step-0',
        attemptedAction: 'INIT',
        expectedAction: 'INIT',
        isCorrect: true,
        stateContext: {},
      });
      for (let i = 1; i <= 4; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `step-${i}`,
          attemptedAction: `WRONG_${i}`,
          expectedAction: `CORRECT_${i}`,
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
    id: 'CHAL-14',
    name: 'Chronic Multi-Step Failure in Binary Search Invariants',
    algorithmId: 'algo-binary-search',
    targetIntervention: 'PREREQUISITE_REVIEW',
    pedagogicalRationale: 'Learner fails across low, mid, and high pointer updates across 4 successive subproblems (80% failure rate).',
    distinguishesFrom: 'CONTEXTUAL_HINT (localized hints cannot fix fundamental ordering gap)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-14', 'algo-binary-search');
      adapter.recordInteraction({
        stepIdentifier: 'init',
        attemptedAction: 'START',
        expectedAction: 'START',
        isCorrect: true,
        stateContext: {},
      });
      for (let i = 1; i <= 4; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `subproblem-${i}`,
          attemptedAction: `WRONG_POINTER_${i}`,
          expectedAction: `CORRECT_POINTER_${i}`,
          isCorrect: false,
          errorCategory: 'BOUNDARY_OVERFLOW',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 2800;
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-15',
    name: 'Stack Structural Model Failure Across Push/Pop Steps',
    algorithmId: 'ds-stack',
    targetIntervention: 'PREREQUISITE_REVIEW',
    pedagogicalRationale: 'Learner repeatedly violates both capacity and ordering rules across 4 steps without understanding LIFO principles.',
    distinguishesFrom: 'CONTEXTUAL_HINT (systemic failure across operations)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-15', 'ds-stack');
      adapter.recordInteraction({
        stepIdentifier: 'init',
        attemptedAction: 'START',
        expectedAction: 'START',
        isCorrect: true,
        stateContext: {},
      });
      for (let i = 1; i <= 4; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `stack-op-${i}`,
          attemptedAction: `WRONG_STACK_OP_${i}`,
          expectedAction: `RIGHT_STACK_OP_${i}`,
          isCorrect: false,
          errorCategory: 'CAPACITY_LIMIT',
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 2900;
      }
      return adapter.getEvents();
    },
  },

  // =========================================================================
  // CLASS 6: REDUCE_GUIDANCE (3 Scenarios)
  // =========================================================================
  {
    id: 'CHAL-16',
    name: 'Fluent Expert Practice (Fast Correct Moves)',
    algorithmId: 'ds-binary-search-tree',
    targetIntervention: 'REDUCE_GUIDANCE',
    pedagogicalRationale: 'Learner executes 4 correct BST moves in rapid succession (< 800ms each). Fast correct moves indicate schema automation. Scaffolding should be faded.',
    distinguishesFrom: 'STEPWISE_SLOWDOWN (actions are correct; system must never throttle fluent experts)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-16', 'ds-binary-search-tree');
      for (let i = 1; i <= 4; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `step-${i}`,
          attemptedAction: `CORRECT_MOVE_${i}`,
          expectedAction: `CORRECT_MOVE_${i}`,
          isCorrect: true,
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 750;
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-17',
    name: 'Autonomous Mastery Streak (3 Consecutive Correct Steps)',
    algorithmId: 'algo-bubble-sort',
    targetIntervention: 'REDUCE_GUIDANCE',
    pedagogicalRationale: 'Learner completes 3 consecutive swap decisions correctly without accessing hints. Scaffolds should fade to foster autonomous retrieval.',
    distinguishesFrom: 'CONTEXTUAL_HINT (learner has mastered the pass)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-17', 'algo-bubble-sort');
      for (let i = 1; i <= 3; i++) {
        adapter.recordInteraction({
          stepIdentifier: `pass-pair-${i}`,
          attemptedAction: `CORRECT_ACTION_${i}`,
          expectedAction: `CORRECT_ACTION_${i}`,
          isCorrect: true,
          stateContext: {},
        });
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-18',
    name: 'Self-Correction Recovery After Early Slip',
    algorithmId: 'ds-stack',
    targetIntervention: 'REDUCE_GUIDANCE',
    pedagogicalRationale: 'Learner slips on step 1, immediately self-corrects on step 2, and succeeds on step 3. Normal progression should be maintained without intrusive guidance.',
    distinguishesFrom: 'CONTEXTUAL_HINT (learner resolved the issue autonomously)',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('sess-chal-18', 'ds-stack');
      adapter.recordInteraction({
        stepIdentifier: 's1',
        attemptedAction: 'POP',
        expectedAction: 'PUSH',
        isCorrect: false,
        errorCategory: 'CAPACITY_LIMIT',
        stateContext: {},
      });
      adapter.recordInteraction({
        stepIdentifier: 's2',
        attemptedAction: 'PUSH',
        expectedAction: 'PUSH',
        isCorrect: true,
        stateContext: {},
      });
      adapter.recordInteraction({
        stepIdentifier: 's3',
        attemptedAction: 'PUSH',
        expectedAction: 'PUSH',
        isCorrect: true,
        stateContext: {},
      });
      return adapter.getEvents();
    },
  },
];

export interface DetailedClassMetric {
  precision: number;
  recall: number;
  f1: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

export interface SystemChallengeEvaluationResult {
  systemName: string;
  totalScenarios: number;
  correctPredictions: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1Unweighted: number; // Standard unweighted average of class F1s
  macroF1Harmonic: number;   // Harmonic mean of macro-P and macro-R
  classMetrics: Record<EGEAInterventionType, DetailedClassMetric>;
  confusionMatrix: Record<string, Record<string, number>>;
}

export function evaluateEngineeringChallengeSuite(): {
  fixedHint: SystemChallengeEvaluationResult;
  simpleRule: SystemChallengeEvaluationResult;
  egea: SystemChallengeEvaluationResult;
} {
  const classes: EGEAInterventionType[] = [
    'CONTEXTUAL_HINT',
    'STEPWISE_SLOWDOWN',
    'HIGHLIGHT_ELEMENT',
    'WORKED_EXAMPLE',
    'PREREQUISITE_REVIEW',
    'REDUCE_GUIDANCE',
  ];

  const evaluateSystem = (
    name: string,
    predictFn: (history: readonly EGEAInteractionEvent[]) => EGEAInterventionType
  ): SystemChallengeEvaluationResult => {
    const confusion: Record<string, Record<string, number>> = {};
    classes.forEach(c => {
      confusion[c] = {};
      classes.forEach(p => { confusion[c][p] = 0; });
    });

    let correctCount = 0;

    ENGINEERING_CHALLENGE_SUITE.forEach(scenario => {
      const history = scenario.buildHistory();
      const predicted = predictFn(history);
      const expected = scenario.targetIntervention;

      confusion[expected][predicted] = (confusion[expected][predicted] || 0) + 1;
      if (predicted === expected) {
        correctCount += 1;
      }
    });

    const classMetrics: Record<EGEAInterventionType, DetailedClassMetric> = {} as any;
    let sumPrecision = 0;
    let sumRecall = 0;
    let sumF1 = 0;

    classes.forEach(c => {
      const tp = confusion[c][c] || 0;
      let fp = 0;
      let fn = 0;

      classes.forEach(other => {
        if (other !== c) {
          fp += confusion[other][c] || 0;
          fn += confusion[c][other] || 0;
        }
      });

      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      classMetrics[c] = {
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        f1: Math.round(f1 * 1000) / 1000,
        truePositives: tp,
        falsePositives: fp,
        falseNegatives: fn,
      };

      sumPrecision += precision;
      sumRecall += recall;
      sumF1 += f1;
    });

    const macroPrecision = sumPrecision / classes.length;
    const macroRecall = sumRecall / classes.length;
    const macroF1Unweighted = sumF1 / classes.length;
    const macroF1Harmonic = (macroPrecision + macroRecall) > 0
      ? (2 * macroPrecision * macroRecall) / (macroPrecision + macroRecall)
      : 0;

    return {
      systemName: name,
      totalScenarios: ENGINEERING_CHALLENGE_SUITE.length,
      correctPredictions: correctCount,
      accuracy: Math.round((correctCount / ENGINEERING_CHALLENGE_SUITE.length) * 1000) / 10,
      macroPrecision: Math.round(macroPrecision * 1000) / 1000,
      macroRecall: Math.round(macroRecall * 1000) / 1000,
      macroF1Unweighted: Math.round(macroF1Unweighted * 1000) / 1000,
      macroF1Harmonic: Math.round(macroF1Harmonic * 1000) / 1000,
      classMetrics,
      confusionMatrix: confusion,
    };
  };

  const fixedHint = evaluateSystem('Fixed Hint Baseline', h => FixedHintBaseline.evaluate(h).interventionType);
  const simpleRule = evaluateSystem('Simple Error Rule Baseline', h => SimpleErrorRuleBaseline.evaluate(h).interventionType);
  const egea = evaluateSystem('EGEA Adaptive Policy', h => EGEAPolicyEngine.evaluateIntervention(h).interventionType);

  return {
    fixedHint,
    simpleRule,
    egea,
  };
}
