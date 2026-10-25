/**
 * Matched-Information History Baseline for EGEA Evaluation
 * 
 * A competitive, history-aware baseline that receives the EXACT SAME information
 * as EGEA: full event history, sequence numbers, error categories, and inter-action
 * latencies (timeSinceLastActionMs).
 * 
 * Architecture:
 * - Uses standard frequency-based and pacing threshold rules.
 * - Does NOT feature EGEA's step-identifier persistence tracking (WORKED_EXAMPLE)
 *   or multi-level hierarchical priority cascade.
 * 
 * Serves as an ablation baseline to demonstrate whether EGEA's performance is
 * due to having access to history, or due to its specific execution-grounded
 * priority architecture.
 */

import { EGEAInteractionEvent } from './EGEAEventSchema';
import { BaselineDecision } from './EGEABaselines';

export class MatchedHistoryBaseline {
  public static evaluate(events: readonly EGEAInteractionEvent[]): BaselineDecision {
    if (!events || events.length === 0) {
      return {
        baselineName: 'EGEA_ADAPTIVE', // Matched-history type
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Initial state ready.',
        isHistoryAware: true,
        supportsPacingDetection: true,
        supportsScaffoldingFade: true,
      };
    }

    const last = events[events.length - 1];

    // Rule 1: Correct move -> maintain normal progress
    if (last.isCorrect) {
      return {
        baselineName: 'EGEA_ADAPTIVE',
        interventionType: 'REDUCE_GUIDANCE',
        hintText: 'Correct step executed.',
        isHistoryAware: true,
        supportsPacingDetection: true,
        supportsScaffoldingFade: true,
      };
    }

    // Rule 2: Rapid Pacing Detection (History-aware)
    if (events.length >= 2) {
      const prev = events[events.length - 2];
      if (!prev.isCorrect && last.timeSinceLastActionMs < 1500) {
        return {
          baselineName: 'EGEA_ADAPTIVE',
          interventionType: 'STEPWISE_SLOWDOWN',
          hintText: 'Pacing alert: Take a moment to inspect before acting.',
          isHistoryAware: true,
          supportsPacingDetection: true,
          supportsScaffoldingFade: false,
        };
      }
    }

    // Rule 3: High-frequency error threshold (Cumulative history-aware)
    const totalErrors = events.filter(e => !e.isCorrect).length;
    if (events.length >= 5 && totalErrors >= 4) {
      return {
        baselineName: 'EGEA_ADAPTIVE',
        interventionType: 'PREREQUISITE_REVIEW',
        hintText: 'Multiple errors logged: Review prerequisite concepts.',
        isHistoryAware: true,
        supportsPacingDetection: true,
        supportsScaffoldingFade: false,
      };
    }

    // Rule 4: Traversal orientation lapse
    if (last.errorCategory === 'TRAVERSAL_DIRECTION' || last.errorCategory === 'CYCLE_OR_UNVISITED') {
      return {
        baselineName: 'EGEA_ADAPTIVE',
        interventionType: 'HIGHLIGHT_ELEMENT',
        hintText: 'Attention: Review the directed branch or queue.',
        isHistoryAware: true,
        supportsPacingDetection: false,
        supportsScaffoldingFade: false,
        targetElementId: String(last.stateContext.targetNodeId || ''),
      };
    }

    // Rule 5: Default localized hint
    return {
      baselineName: 'EGEA_ADAPTIVE',
      interventionType: 'CONTEXTUAL_HINT',
      hintText: 'Verify your decision against algorithm rules.',
      isHistoryAware: true,
      supportsPacingDetection: false,
      supportsScaffoldingFade: false,
      targetElementId: String(last.stateContext.targetElementId || ''),
    };
  }
}
