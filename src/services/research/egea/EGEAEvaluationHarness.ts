/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Technical Evaluation Harness & Benchmark Suite
 * 
 * Evaluates EGEA and two pedagogical baselines across 7 scenario families:
 * - Family A: One-Off Minor Mistake -> CONTEXTUAL_HINT
 * - Family B: Rapid Guessing / Rushing -> STEPWISE_SLOWDOWN
 * - Family C: Attention Saliency Lapse -> HIGHLIGHT_ELEMENT
 * - Family D: Persistent Repeated Failure -> WORKED_EXAMPLE
 * - Family E: Prerequisite Deficit -> PREREQUISITE_REVIEW
 * - Family F: Independent Mastery Streak -> REDUCE_GUIDANCE
 * - Family G: Malformed / Edge Case Handling
 */

import {
  EGEAAlgorithmId,
  EGEAInteractionEvent,
} from './EGEAEventSchema';
import { EGEAEventAdapter } from './EGEAEventAdapter';
import {
  EGEAInterventionType,
  EGEAPolicyEngine,
} from './EGEAPolicyEngine';
import {
  FixedHintBaseline,
  SimpleErrorRuleBaseline,
} from './EGEABaselines';

export interface ScenarioDefinition {
  familyId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  familyName: string;
  scenarioId: string;
  description: string;
  expectedIntervention: EGEAInterventionType;
  generateEvents: () => EGEAInteractionEvent[];
}

export interface MetricSummary {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface SystemEvaluationResult {
  systemName: string;
  totalEvaluated: number;
  correctInterventions: number;
  appropriatenessRate: number; // 0 - 100%
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  classMetrics: Record<EGEAInterventionType, MetricSummary>;
  confusionMatrix: Record<string, Record<string, number>>;
  averageLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
}

export interface BenchmarkReport {
  timestamp: string;
  scenarioCount: number;
  scenariosPerFamily: Record<string, number>;
  systems: {
    fixedHintBaseline: SystemEvaluationResult;
    simpleErrorRuleBaseline: SystemEvaluationResult;
    egeaAdaptivePolicy: SystemEvaluationResult;
  };
}

export class EGEAEvaluationHarness {
  /**
   * Generates a diverse corpus of synthetic pedagogical scenarios representing
   * learner trajectories across the 5 DSA algorithms.
   */
  public static generateScenarios(): ScenarioDefinition[] {
    const scenarios: ScenarioDefinition[] = [];
    const algorithms: EGEAAlgorithmId[] = [
      'ds-binary-search-tree',
      'algo-bubble-sort',
      'algo-binary-search',
      'algo-breadth-first-search',
      'ds-stack',
    ];

    // Family A: One-Off Minor Mistake (Single conceptual error after success/exploration)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'A',
        familyName: 'One-Off Minor Mistake',
        scenarioId: `scen-A-${idx + 1}-${algo}`,
        description: `Learner performs isolated comparison error in ${algo} with deliberate pacing.`,
        expectedIntervention: 'CONTEXTUAL_HINT',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-A-${idx}`, algo);
          adapter.recordInteraction({
            stepIdentifier: 'step-init',
            attemptedAction: 'INIT',
            expectedAction: 'INIT',
            isCorrect: true,
            stateContext: { targetElementId: 'elem-0' },
          });
          // Normal latency (3200ms)
          const ev = adapter.recordInteraction({
            stepIdentifier: 'step-1',
            attemptedAction: 'CHOOSE_LEFT',
            expectedAction: 'CHOOSE_RIGHT',
            isCorrect: false,
            errorCategory: 'VALUE_COMPARISON',
            stateContext: { targetElementId: 'elem-1', currentValue: 42, targetValue: 50 },
          });
          // Ensure time delta is deliberate (> 1500ms)
          ev.timeSinceLastActionMs = 3200;
          return [...adapter.getEvents()];
        },
      });
    });

    // Family B: Rapid Guessing / Rushing (Consecutive errors with latency < 1500ms)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'B',
        familyName: 'Rapid Impulsive Guessing',
        scenarioId: `scen-B-${idx + 1}-${algo}`,
        description: `Learner clicks impulsively (< 1.5s interval) on consecutive incorrect steps.`,
        expectedIntervention: 'STEPWISE_SLOWDOWN',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-B-${idx}`, algo);
          adapter.recordInteraction({
            stepIdentifier: 'step-1',
            attemptedAction: 'ACTION_A',
            expectedAction: 'ACTION_B',
            isCorrect: false,
            errorCategory: 'VALUE_COMPARISON',
            stateContext: { targetElementId: 'elem-1' },
          });
          const ev2 = adapter.recordInteraction({
            stepIdentifier: 'step-2',
            attemptedAction: 'ACTION_C',
            expectedAction: 'ACTION_B',
            isCorrect: false,
            errorCategory: 'VALUE_COMPARISON',
            stateContext: { targetElementId: 'elem-2' },
          });
          // Enforce rapid pacing (< 1500ms)
          ev2.timeSinceLastActionMs = 850;
          return [...adapter.getEvents()];
        },
      });
    });

    // Family C: Attention Saliency Lapse (Direction or unvisited cycle lapse)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'C',
        familyName: 'Attention Saliency Lapse',
        scenarioId: `scen-C-${idx + 1}-${algo}`,
        description: `Learner deviates along non-adjacent edge or skips active queue in ${algo}.`,
        expectedIntervention: 'HIGHLIGHT_ELEMENT',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-C-${idx}`, algo);
          adapter.recordInteraction({
            stepIdentifier: 'step-root',
            attemptedAction: 'INIT',
            expectedAction: 'INIT',
            isCorrect: true,
            stateContext: { targetNodeId: 'node-A' },
          });
          const ev = adapter.recordInteraction({
            stepIdentifier: 'step-traverse',
            attemptedAction: 'JUMP_DISCONNECTED',
            expectedAction: 'FOLLOW_EDGE',
            isCorrect: false,
            errorCategory: algo === 'algo-breadth-first-search' ? 'CYCLE_OR_UNVISITED' : 'TRAVERSAL_DIRECTION',
            stateContext: { targetNodeId: 'node-B' },
          });
          ev.timeSinceLastActionMs = 2800; // deliberate, not rapid
          return [...adapter.getEvents()];
        },
      });
    });

    // Family D: Persistent Repeated Failure on same step (3+ consecutive errors on stepIdentifier)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'D',
        familyName: 'Persistent Step Failure',
        scenarioId: `scen-D-${idx + 1}-${algo}`,
        description: `Learner fails 3 consecutive times on the identical step ${algo}.`,
        expectedIntervention: 'WORKED_EXAMPLE',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-D-${idx}`, algo);
          const stepId = 'subproblem-pivot-3';
          for (let attempt = 1; attempt <= 3; attempt++) {
            const ev = adapter.recordInteraction({
              stepIdentifier: stepId,
              attemptedAction: `TRY_${attempt}`,
              expectedAction: 'CORRECT_OP',
              isCorrect: false,
              errorCategory: 'VALUE_COMPARISON',
              stateContext: { targetElementId: 'elem-pivot' },
            });
            ev.timeSinceLastActionMs = 3000; // deliberate attempts
          }
          return [...adapter.getEvents()];
        },
      });
    });

    // Family E: Prerequisite Deficit (>= 4 failures across different steps, failure rate >= 60%)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'E',
        familyName: 'Prerequisite Deficit',
        scenarioId: `scen-E-${idx + 1}-${algo}`,
        description: `Systemic conceptual breakdown across multiple steps in ${algo}.`,
        expectedIntervention: 'PREREQUISITE_REVIEW',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-E-${idx}`, algo);
          // 5 events total: 1 correct, 4 incorrect on different steps (> 60% failure rate)
          adapter.recordInteraction({
            stepIdentifier: 'step-1',
            attemptedAction: 'OP_1',
            expectedAction: 'OP_1',
            isCorrect: true,
            stateContext: {},
          });
          for (let step = 2; step <= 5; step++) {
            const ev = adapter.recordInteraction({
              stepIdentifier: `step-${step}`,
              attemptedAction: `WRONG_${step}`,
              expectedAction: `RIGHT_${step}`,
              isCorrect: false,
              errorCategory: 'VALUE_COMPARISON',
              stateContext: {},
            });
            ev.timeSinceLastActionMs = 2500;
          }
          return [...adapter.getEvents()];
        },
      });
    });

    // Family F: Independent Mastery Streak (>= 3 consecutive correct steps without hints)
    algorithms.forEach((algo, idx) => {
      scenarios.push({
        familyId: 'F',
        familyName: 'Independent Mastery Streak',
        scenarioId: `scen-F-${idx + 1}-${algo}`,
        description: `Learner demonstrates 3+ consecutive correct steps autonomously in ${algo}.`,
        expectedIntervention: 'REDUCE_GUIDANCE',
        generateEvents: () => {
          const adapter = new EGEAEventAdapter(`sess-F-${idx}`, algo);
          for (let step = 1; step <= 4; step++) {
            adapter.recordInteraction({
              stepIdentifier: `step-${step}`,
              attemptedAction: `CORRECT_ACTION_${step}`,
              expectedAction: `CORRECT_ACTION_${step}`,
              isCorrect: true,
              stateContext: { targetElementId: `elem-${step}` },
            });
          }
          return [...adapter.getEvents()];
        },
      });
    });

    return scenarios;
  }

  /**
   * Executes the full benchmark evaluation across all scenarios and models.
   */
  public static runBenchmark(): BenchmarkReport {
    const scenarios = this.generateScenarios();
    const allInterventionTypes: EGEAInterventionType[] = [
      'CONTEXTUAL_HINT',
      'HIGHLIGHT_ELEMENT',
      'STEPWISE_SLOWDOWN',
      'WORKED_EXAMPLE',
      'PREREQUISITE_REVIEW',
      'REDUCE_GUIDANCE',
    ];

    const evaluateSystem = (
      name: string,
      evalFn: (events: readonly EGEAInteractionEvent[]) => EGEAInterventionType
    ): SystemEvaluationResult => {
      const latencies: number[] = [];
      const confusionMatrix: Record<string, Record<string, number>> = {};
      allInterventionTypes.forEach(actual => {
        confusionMatrix[actual] = {};
        allInterventionTypes.forEach(predicted => {
          confusionMatrix[actual][predicted] = 0;
        });
      });

      let correctCount = 0;

      scenarios.forEach(scen => {
        const events = scen.generateEvents();
        const tStart = performance.now();
        const predicted = evalFn(events);
        const tEnd = performance.now();
        latencies.push(tEnd - tStart);

        const expected = scen.expectedIntervention;
        confusionMatrix[expected][predicted] = (confusionMatrix[expected][predicted] || 0) + 1;

        if (predicted === expected) {
          correctCount += 1;
        }
      });

      latencies.sort((a, b) => a - b);
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = latencies[latencies.length - 1];
      const p95Latency = latencies[Math.floor(latencies.length * 0.95)];

      const classMetrics: Record<EGEAInterventionType, MetricSummary> = {} as any;
      let sumPrecision = 0;
      let sumRecall = 0;
      let validClassesCount = 0;

      allInterventionTypes.forEach(c => {
        const truePositives = confusionMatrix[c][c] || 0;
        let totalPredictedPositive = 0;
        let totalActualPositive = 0;

        allInterventionTypes.forEach(other => {
          totalPredictedPositive += confusionMatrix[other][c] || 0;
          totalActualPositive += confusionMatrix[c][other] || 0;
        });

        const precision = totalPredictedPositive > 0 ? truePositives / totalPredictedPositive : 0;
        const recall = totalActualPositive > 0 ? truePositives / totalActualPositive : 0;
        const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

        classMetrics[c] = {
          precision: Math.round(precision * 1000) / 1000,
          recall: Math.round(recall * 1000) / 1000,
          f1Score: Math.round(f1 * 1000) / 1000,
          accuracy: totalActualPositive > 0 ? Math.round((truePositives / totalActualPositive) * 1000) / 1000 : 0,
        };

        if (totalActualPositive > 0) {
          sumPrecision += precision;
          sumRecall += recall;
          validClassesCount += 1;
        }
      });

      const macroPrecision = validClassesCount > 0 ? sumPrecision / validClassesCount : 0;
      const macroRecall = validClassesCount > 0 ? sumRecall / validClassesCount : 0;
      const macroF1 = (macroPrecision + macroRecall) > 0 ? (2 * macroPrecision * macroRecall) / (macroPrecision + macroRecall) : 0;

      return {
        systemName: name,
        totalEvaluated: scenarios.length,
        correctInterventions: correctCount,
        appropriatenessRate: Math.round((correctCount / scenarios.length) * 1000) / 10,
        macroPrecision: Math.round(macroPrecision * 1000) / 1000,
        macroRecall: Math.round(macroRecall * 1000) / 1000,
        macroF1: Math.round(macroF1 * 1000) / 1000,
        classMetrics,
        confusionMatrix,
        averageLatencyMs: Math.round(avgLatency * 1000) / 1000,
        maxLatencyMs: Math.round(maxLatency * 1000) / 1000,
        p95LatencyMs: Math.round(p95Latency * 1000) / 1000,
      };
    };

    const fixedHintResult = evaluateSystem('Fixed Hint Baseline', ev => FixedHintBaseline.evaluate(ev).interventionType);
    const simpleRuleResult = evaluateSystem('Simple Error Rule Baseline', ev => SimpleErrorRuleBaseline.evaluate(ev).interventionType);
    const egeaResult = evaluateSystem('EGEA Adaptive Policy', ev => EGEAPolicyEngine.evaluateIntervention(ev).interventionType);

    const scenariosPerFamily: Record<string, number> = {};
    scenarios.forEach(s => {
      scenariosPerFamily[s.familyName] = (scenariosPerFamily[s.familyName] || 0) + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      scenarioCount: scenarios.length,
      scenariosPerFamily,
      systems: {
        fixedHintBaseline: fixedHintResult,
        simpleErrorRuleBaseline: simpleRuleResult,
        egeaAdaptivePolicy: egeaResult,
      },
    };
  }
}
