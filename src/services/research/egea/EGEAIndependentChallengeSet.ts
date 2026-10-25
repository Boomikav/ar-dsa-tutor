/**
 * Independent Pedagogical Challenge Set for EGEA and Baselines
 * 
 * Distinct from synthetic unit-test scenarios:
 * Represents complex, realistic learner interaction trajectories, edge cases,
 * and boundary conditions not designed to mirror EGEA's internal predicates.
 * 
 * Evaluates pedagogical defensibility under human-authored pedagogical criteria.
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

export interface ChallengeScenario {
  id: string;
  name: string;
  pedagogicalContext: string;
  humanExpertIntervention: EGEAInterventionType;
  humanExpertRationale: string;
  buildHistory: () => readonly EGEAInteractionEvent[];
}

export const INDEPENDENT_CHALLENGES: ChallengeScenario[] = [
  {
    id: 'CHAL-01',
    name: 'Deliberate Pondering Followed by Second Error',
    pedagogicalContext: 'Learner makes an error, waits 18 seconds studying the 3D tree, then makes another error on a different node.',
    humanExpertIntervention: 'CONTEXTUAL_HINT',
    humanExpertRationale: 'The learner is thinking deliberately, not guessing impulsively. A contextual hint is appropriate; slowing down is counterproductive.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-1', 'ds-binary-search-tree');
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
      ev2.timeSinceLastActionMs = 18000; // 18s deliberate pause
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-02',
    name: 'Rapid Expert Flow (Fast Correct Clicks)',
    pedagogicalContext: 'Competent learner executes 4 correct BST operations in rapid succession (< 800ms each).',
    humanExpertIntervention: 'REDUCE_GUIDANCE',
    humanExpertRationale: 'Fast correct moves signify fluency, not impulsive guessing. System must not throttle fluent learners.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-2', 'ds-binary-search-tree');
      for (let i = 1; i <= 4; i++) {
        const ev = adapter.recordInteraction({
          stepIdentifier: `step-${i}`,
          attemptedAction: `CORRECT_MOVE_${i}`,
          expectedAction: `CORRECT_MOVE_${i}`,
          isCorrect: true,
          stateContext: {},
        });
        ev.timeSinceLastActionMs = 700; // rapid fluent clicks
      }
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-03',
    name: 'Early Encounter Failure (Step 1)',
    pedagogicalContext: 'Learner on their very first practice step commits a capacity limit error on a Stack.',
    humanExpertIntervention: 'CONTEXTUAL_HINT',
    humanExpertRationale: 'Learner is orienting to the interface. Provide immediate invariant guidance, not prerequisite referral.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-3', 'ds-stack');
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
    id: 'CHAL-04',
    name: 'Spatial Disorientation on Complex Graph',
    pedagogicalContext: 'Learner correctly enqueues root, then attempts to traverse to an unlinked distant vertex in BFS.',
    humanExpertIntervention: 'HIGHLIGHT_ELEMENT',
    humanExpertRationale: 'The learner lost track of adjacency in 3D perspective. Visually pulsing the connected valid edges/nodes is best.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-4', 'algo-breadth-first-search');
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
    id: 'CHAL-05',
    name: 'Persistent Binary Search Midpoint Confusion',
    pedagogicalContext: 'Learner repeatedly (3x) calculates or chooses wrong half when target > mid in Binary Search.',
    humanExpertIntervention: 'WORKED_EXAMPLE',
    humanExpertRationale: 'After 3 consecutive failures on the exact same decision, textual hints have failed. A step-by-step spatial demonstration is needed.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-5', 'algo-binary-search');
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
    id: 'CHAL-06',
    name: 'Impulsive Trial-and-Error Swapping',
    pedagogicalContext: 'Learner mashes the Swap button 3 times within 2 seconds without comparing Bubble Sort elements.',
    humanExpertIntervention: 'STEPWISE_SLOWDOWN',
    humanExpertRationale: 'Rapid guessing violates deliberate practice. Enforce reflection pause.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-6', 'algo-bubble-sort');
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
      ev.timeSinceLastActionMs = 600; // 600ms rapid click
      return adapter.getEvents();
    },
  },
  {
    id: 'CHAL-07',
    name: 'Chronic Conceptual Collapse Across Topics',
    pedagogicalContext: 'Learner fails 5 consecutive operations across distinct tree levels in BST practice.',
    humanExpertIntervention: 'PREREQUISITE_REVIEW',
    humanExpertRationale: 'The learner lacks foundational tree/ordering schema. Remediate with foundational review.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-7', 'ds-binary-search-tree');
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
    id: 'CHAL-08',
    name: 'Intermittent Error Followed by Immediate Self-Correction',
    pedagogicalContext: 'Learner makes a mistake on step 1, self-corrects on step 2, and succeeds on step 3.',
    humanExpertIntervention: 'REDUCE_GUIDANCE',
    humanExpertRationale: 'Self-correction shows the learner is back on track. Maintain normal progression without intrusive scaffolding.',
    buildHistory: () => {
      const adapter = new EGEAEventAdapter('chal-sess-8', 'ds-stack');
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

export interface ChallengeComparisonSummary {
  scenarioId: string;
  name: string;
  expertLabel: EGEAInterventionType;
  fixedHintPrediction: EGEAInterventionType;
  simpleRulePrediction: EGEAInterventionType;
  egeaPrediction: EGEAInterventionType;
  egeaMatchesExpert: boolean;
  fixedHintMatchesExpert: boolean;
  simpleRuleMatchesExpert: boolean;
}

export function evaluateIndependentChallenges(): {
  results: ChallengeComparisonSummary[];
  fixedHintAccuracy: number;
  simpleRuleAccuracy: number;
  egeaAccuracy: number;
} {
  const results: ChallengeComparisonSummary[] = INDEPENDENT_CHALLENGES.map(scen => {
    const history = scen.buildHistory();
    const fixedHint = FixedHintBaseline.evaluate(history).interventionType;
    const simpleRule = SimpleErrorRuleBaseline.evaluate(history).interventionType;
    const egea = EGEAPolicyEngine.evaluateIntervention(history).interventionType;

    return {
      scenarioId: scen.id,
      name: scen.name,
      expertLabel: scen.humanExpertIntervention,
      fixedHintPrediction: fixedHint,
      simpleRulePrediction: simpleRule,
      egeaPrediction: egea,
      egeaMatchesExpert: egea === scen.humanExpertIntervention,
      fixedHintMatchesExpert: fixedHint === scen.humanExpertIntervention,
      simpleRuleMatchesExpert: simpleRule === scen.humanExpertIntervention,
    };
  });

  const egeaCorrect = results.filter(r => r.egeaMatchesExpert).length;
  const fixedCorrect = results.filter(r => r.fixedHintMatchesExpert).length;
  const simpleCorrect = results.filter(r => r.simpleRuleMatchesExpert).length;

  return {
    results,
    egeaAccuracy: (egeaCorrect / results.length) * 100,
    fixedHintAccuracy: (fixedCorrect / results.length) * 100,
    simpleRuleAccuracy: (simpleCorrect / results.length) * 100,
  };
}
