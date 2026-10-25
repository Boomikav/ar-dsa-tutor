/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Pedagogical Baselines for Scientific Comparison
 * 
 * Implements two standard educational technology baselines:
 * 1. FixedHintBaseline (Generic static reminder)
 * 2. SimpleErrorRuleBaseline (Stateless category-to-hint lookup)
 * 
 * Used in technical benchmarks to demonstrate the necessity of multi-event,
 * history-aware, execution-grounded adaptation.
 */

import { EGEAInteractionEvent } from './EGEAEventSchema';
import {
  EGEAInterventionDecision,
  EGEAInterventionType,
  EGEAPolicyEngine,
} from './EGEAPolicyEngine';

export interface BaselineDecision {
  baselineName: 'FIXED_HINT' | 'SIMPLE_ERROR_RULE' | 'EGEA_ADAPTIVE';
  interventionType: EGEAInterventionType;
  hintText: string;
  isHistoryAware: boolean;
  supportsPacingDetection: boolean;
  supportsScaffoldingFade: boolean;
  targetElementId?: string;
}

/**
 * Baseline 1: Generic Fixed Hint
 * Always delivers a static non-adaptive reminder upon error.
 */
export class FixedHintBaseline {
  public static evaluate(events: readonly EGEAInteractionEvent[]): BaselineDecision {
    if (!events || events.length === 0) {
      return {
        baselineName: 'FIXED_HINT',
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Welcome. Explore the algorithm freely.',
        isHistoryAware: false,
        supportsPacingDetection: false,
        supportsScaffoldingFade: false,
      };
    }

    const last = events[events.length - 1];
    if (last.isCorrect) {
      return {
        baselineName: 'FIXED_HINT',
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Action recorded.',
        isHistoryAware: false,
        supportsPacingDetection: false,
        supportsScaffoldingFade: false,
      };
    }

    return {
      baselineName: 'FIXED_HINT',
      interventionType: 'CONTEXTUAL_HINT',
      hintText: 'Check the algorithm rules and try again.',
      isHistoryAware: false,
      supportsPacingDetection: false,
      supportsScaffoldingFade: false,
    };
  }
}

/**
 * Baseline 2: Simple Current-Error-to-Hint Rule
 * Stateless 1-to-1 lookup based purely on the immediate error category.
 */
export class SimpleErrorRuleBaseline {
  public static evaluate(events: readonly EGEAInteractionEvent[]): BaselineDecision {
    if (!events || events.length === 0) {
      return {
        baselineName: 'SIMPLE_ERROR_RULE',
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Initial state ready.',
        isHistoryAware: false,
        supportsPacingDetection: false,
        supportsScaffoldingFade: false,
      };
    }

    const last = events[events.length - 1];
    if (last.isCorrect) {
      return {
        baselineName: 'SIMPLE_ERROR_RULE',
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Correct move.',
        isHistoryAware: false,
        supportsPacingDetection: false,
        supportsScaffoldingFade: false,
      };
    }

    let hintText = 'Review the current algorithm operation.';
    let interventionType: EGEAInterventionType = 'CONTEXTUAL_HINT';

    switch (last.errorCategory) {
      case 'VALUE_COMPARISON':
        hintText = 'Compare the element values carefully before choosing direction.';
        break;
      case 'BOUNDARY_OVERFLOW':
        hintText = 'Verify search interval boundaries (low and high pointers).';
        break;
      case 'TRAVERSAL_DIRECTION':
        hintText = 'Follow the directed tree branch or graph edge.';
        interventionType = 'HIGHLIGHT_ELEMENT';
        break;
      case 'CYCLE_OR_UNVISITED':
        hintText = 'Ensure each vertex is visited at most once.';
        interventionType = 'HIGHLIGHT_ELEMENT';
        break;
      case 'CAPACITY_LIMIT':
        hintText = 'Check stack size limit (maximum 5 elements).';
        break;
      default:
        hintText = 'Check your operation against algorithm rules.';
        break;
    }

    return {
      baselineName: 'SIMPLE_ERROR_RULE',
      interventionType,
      hintText,
      isHistoryAware: false,
      supportsPacingDetection: false,
      supportsScaffoldingFade: false,
      targetElementId: String(last.stateContext.targetElementId || ''),
    };
  }
}

/**
 * Tripartite evaluation comparator for benchmarking.
 */
export class EGEAComparativeEvaluator {
  public static compareAll(events: readonly EGEAInteractionEvent[]): {
    fixedHint: BaselineDecision;
    simpleRule: BaselineDecision;
    egea: EGEAInterventionDecision;
  } {
    const fixedHint = FixedHintBaseline.evaluate(events);
    const simpleRule = SimpleErrorRuleBaseline.evaluate(events);
    const egea = EGEAPolicyEngine.evaluateIntervention(events);

    return {
      fixedHint,
      simpleRule,
      egea,
    };
  }
}
