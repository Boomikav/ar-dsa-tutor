/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Deterministic Policy Engine
 * 
 * Maps validated interaction sequences and deterministic algorithm state to formal
 * pedagogical interventions with verifiable, machine-readable rationales.
 */

import {
  EGEAInteractionEvent,
  validateEventSequence,
} from './EGEAEventSchema';
import { EGEAPacingModel } from './EGEAPacingModel';
import { canonicalizeStepIdentifier } from './EGEAStepCanonicalizer';

export type EGEAInterventionType =
  | 'CONTEXTUAL_HINT'       // Isolated error: directional spatial guidance
  | 'HIGHLIGHT_ELEMENT'     // Spatial attention lapse: pulse / brighten target element
  | 'STEPWISE_SLOWDOWN'     // Rapid impulsive clicking: enforce deliberate pause
  | 'WORKED_EXAMPLE'        // Persistent failure (3+ attempts on step): step-by-step walk-through
  | 'PREREQUISITE_REVIEW'   // Systemic breakdown: recommend foundational topic review
  | 'REDUCE_GUIDANCE';      // Success streak (3+ correct): fade scaffolds for autonomy

export type EGEARationaleCode =
  | 'RAPID_GUESSING_DETECTED'
  | 'PERSISTENT_STEP_FAILURE'
  | 'PREREQUISITE_DEFICIT'
  | 'ATTENTION_SALIENCE_LAPSE'
  | 'ISOLATED_CONCEPTUAL_MISCONCEPTION'
  | 'INDEPENDENT_MASTERY_STREAK'
  | 'HINT_ASSISTED_PROGRESSION'
  | 'NORMAL_PROGRESSION';

export interface EGEAInterventionDecision {
  interventionType: EGEAInterventionType;
  targetElementId?: string;
  rationaleCode: EGEARationaleCode;
  explanationText: string;
  confidence: number;                 // 0.0 - 1.0
  groundingState: Record<string, unknown>;
  timestamp: string;
}

export class EGEAPolicyEngine {
  /**
   * Deterministically evaluates the learner's interaction history to produce
   * a grounded, explainable adaptation decision.
   *
   * @param eventHistory Complete or windowed sequence of validated events for the active session.
   * @returns Deterministic EGEAInterventionDecision
   */
  public static evaluateIntervention(
    eventHistory: readonly EGEAInteractionEvent[]
  ): EGEAInterventionDecision {
    if (!eventHistory || eventHistory.length === 0) {
      return {
        interventionType: 'REDUCE_GUIDANCE',
        rationaleCode: 'NORMAL_PROGRESSION',
        explanationText: 'Initial session state: standard exploratory baseline guidance.',
        confidence: 0.8,
        groundingState: {},
        timestamp: new Date().toISOString(),
      };
    }

    const validation = validateEventSequence(eventHistory as EGEAInteractionEvent[]);
    if (!validation.valid) {
      throw new Error(`Invalid event sequence passed to EGEAPolicyEngine: ${validation.errors.join('; ')}`);
    }

    const lastEvent = eventHistory[eventHistory.length - 1];
    const groundingState = { ...lastEvent.stateContext };

    // Case 1: Independent Mastery Streak (Success streak >= 3 without hints)
    if (this.isMasteryStreak(eventHistory)) {
      return {
        interventionType: 'REDUCE_GUIDANCE',
        rationaleCode: 'INDEPENDENT_MASTERY_STREAK',
        explanationText: 'Learner demonstrated 3+ consecutive correct decisions independently. Fading visual scaffolding to support autonomous recall.',
        confidence: 0.95,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // If the latest event is correct:
    if (lastEvent.isCorrect) {
      // If the action was assisted by a hint, maintain guidance instead of fading scaffolding
      const isHintScaffolded = Boolean(
        lastEvent.hintAssisted ||
        (eventHistory.length >= 2 && lastEvent.hintExposureCount > eventHistory[eventHistory.length - 2].hintExposureCount)
      );

      if (isHintScaffolded) {
        return {
          interventionType: 'CONTEXTUAL_HINT',
          targetElementId: String(lastEvent.stateContext.targetElementId || lastEvent.stepIdentifier),
          rationaleCode: 'HINT_ASSISTED_PROGRESSION',
          explanationText: 'Correct move completed with active hint assistance. Maintaining instructional scaffolding until independent recall is demonstrated.',
          confidence: 0.88,
          groundingState,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        interventionType: 'REDUCE_GUIDANCE',
        rationaleCode: 'NORMAL_PROGRESSION',
        explanationText: 'Correct action executed independently. Maintaining active learning progression.',
        confidence: 0.85,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // Learner committed an error on the latest event. Now evaluate pedagogical priority:

    // Priority 1: Rapid Guessing / Rushing evaluated via EWMA Pacing Model
    const pacingAnalysis = EGEAPacingModel.evaluatePacing(eventHistory);
    if (pacingAnalysis.isRapidGuessing) {
      return {
        interventionType: 'STEPWISE_SLOWDOWN',
        rationaleCode: 'RAPID_GUESSING_DETECTED',
        explanationText: pacingAnalysis.rationale,
        confidence: 0.92,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // Priority 2: Persistent Repeated Failure on the exact same canonical step (>= 3 errors)
    if (this.isPersistentStepFailure(eventHistory)) {
      const canonicalStep = canonicalizeStepIdentifier(lastEvent.canonicalStepIdentifier || lastEvent.stepIdentifier);
      return {
        interventionType: 'WORKED_EXAMPLE',
        targetElementId: String(lastEvent.stateContext.targetElementId || canonicalStep),
        rationaleCode: 'PERSISTENT_STEP_FAILURE',
        explanationText: `Persistent failure on step ${lastEvent.stepIdentifier} across 3+ consecutive attempts. Presenting spatial worked-example demonstration.`,
        confidence: 0.98,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // Priority 3: Systemic Prerequisite Deficit (cumulative high failure rate >= 4 errors across steps)
    if (this.isPrerequisiteDeficit(eventHistory)) {
      return {
        interventionType: 'PREREQUISITE_REVIEW',
        rationaleCode: 'PREREQUISITE_DEFICIT',
        explanationText: 'Multiple conceptual breakdowns across successive steps. Recommending foundational prerequisite topic review before resuming practice.',
        confidence: 0.90,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // Priority 4: Attention / Spatial Traversal Lapse
    if (lastEvent.errorCategory === 'TRAVERSAL_DIRECTION' || lastEvent.errorCategory === 'CYCLE_OR_UNVISITED') {
      const targetElementId = String(lastEvent.stateContext.targetNodeId || lastEvent.stateContext.targetElementId || 'current-focus');
      return {
        interventionType: 'HIGHLIGHT_ELEMENT',
        targetElementId,
        rationaleCode: 'ATTENTION_SALIENCE_LAPSE',
        explanationText: `Spatial orientation lapse during ${lastEvent.algorithmId}. Pulsing visual highlight on target 3D element to guide focus.`,
        confidence: 0.88,
        groundingState,
        timestamp: new Date().toISOString(),
      };
    }

    // Priority 5: Isolated Conceptual Error (Comparison / Boundary / Capacity)
    return {
      interventionType: 'CONTEXTUAL_HINT',
      targetElementId: String(lastEvent.stateContext.targetElementId || lastEvent.stepIdentifier),
      rationaleCode: 'ISOLATED_CONCEPTUAL_MISCONCEPTION',
      explanationText: `Isolated ${lastEvent.errorCategory} error on ${lastEvent.attemptedAction}. Providing direct spatial comparison hint.`,
      confidence: 0.85,
      groundingState,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates if learner has achieved >= 3 consecutive correct actions independently (without hints).
   */
  private static isMasteryStreak(events: readonly EGEAInteractionEvent[]): boolean {
    if (events.length < 3) return false;
    const recent = events.slice(-3);
    const allCorrect = recent.every(e => e.isCorrect);
    if (!allCorrect) return false;

    // Must be completely free of hint assistance across all 3 actions
    const zeroHintsAssisted = recent.every(e => !e.hintAssisted);
    const hintCountUnchanged = recent[2].hintExposureCount === events[events.length - 3].hintExposureCount;

    return zeroHintsAssisted && hintCountUnchanged;
  }

  /**
   * Evaluates if learner has failed 3 or more times consecutively on the exact same canonical step.
   */
  private static isPersistentStepFailure(events: readonly EGEAInteractionEvent[]): boolean {
    if (events.length < 3) return false;
    const lastThree = events.slice(-3);
    const targetStep = canonicalizeStepIdentifier(lastThree[2].canonicalStepIdentifier || lastThree[2].stepIdentifier);
    if (targetStep === '__UNKNOWN_STEP__') return false;

    return lastThree.every(e => {
      if (e.isCorrect) return false;
      const canon = canonicalizeStepIdentifier(e.canonicalStepIdentifier || e.stepIdentifier);
      return canon === targetStep;
    });
  }

  /**
   * Evaluates if the learner is experiencing systemic failure across multiple steps.
   */
  private static isPrerequisiteDeficit(events: readonly EGEAInteractionEvent[]): boolean {
    if (events.length < 5) return false;
    const incorrectCount = events.filter(e => !e.isCorrect).length;
    // Over 60% failure rate with at least 4 failures
    return incorrectCount >= 4 && (incorrectCount / events.length) >= 0.6;
  }
}
