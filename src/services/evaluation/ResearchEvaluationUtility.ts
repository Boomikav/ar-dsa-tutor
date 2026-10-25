/**
 * Phase 7: Research Evaluation Utility
 * 
 * Provides deterministic learning evaluation metrics to support future empirical studies:
 * - Pre- vs Post-Assessment Learning Gain (Absolute Gain & Hake's Normalized Gain)
 * - Independent Success Rate
 * - Misconception Reduction Factor
 * - Assistance Dependency Factor
 * - Cohort Comparison Structures (Baseline vs Adaptive Condition)
 * 
 * Invariants:
 * - Does NOT fabricate experimental human data or claim statistical significance.
 * - Serves as a transparent computational framework for experimental research.
 */

import { 
  PerformanceEvidence, 
  ResearchEvaluationMetrics 
} from '../../models/adaptiveLearner';

export interface CohortEvaluationSummary {
  condition: 'BASELINE_STATIC' | 'ADAPTIVE_AI_AR';
  participantCount: number;
  averagePreScore: number;
  averagePostScore: number;
  averageAbsoluteGain: number;
  averageNormalizedGain: number;
  averageIndependentSuccessRate: number;
  totalMisconceptionsLogged: number;
}

export class ResearchEvaluationUtility {
  /**
   * Calculates absolute learning gain:
   * Absolute Gain = Post-Assessment Score - Pre-Assessment Score
   */
  public static calculateAbsoluteGain(preScore: number, postScore: number): number {
    return Math.round((postScore - preScore) * 10) / 10;
  }

  /**
   * Calculates Hake's normalized learning gain:
   * g = (Post - Pre) / (100 - Pre)
   * If Pre >= 100, returns 0.
   */
  public static calculateNormalizedGain(preScore: number, postScore: number): number {
    if (preScore >= 100) return 0;
    const gain = (postScore - preScore) / (100 - preScore);
    return Math.round(gain * 100) / 100;
  }

  /**
   * Compiles comprehensive evaluation metrics from a learner's evidence history.
   */
  public static calculateEvaluationMetrics(
    preAssessmentScore: number,
    postAssessmentScore: number,
    evidenceHistory: PerformanceEvidence[]
  ): ResearchEvaluationMetrics {
    const attempts = evidenceHistory.filter(
      e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT'
    );
    const correctCount = attempts.filter(a => a.correct).length;
    const accuracy = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

    const independentSuccesses = attempts.filter(
      a => a.correct && !a.usedHint && !a.requestedExplanation
    ).length;
    const independentSuccessRate = attempts.length > 0
      ? Math.round((independentSuccesses / attempts.length) * 100)
      : 0;

    const hints = evidenceHistory.filter(e => e.usedHint || e.eventType === 'HINT_USED').length;
    const hintDependency = attempts.length > 0
      ? Math.round((hints / attempts.length) * 100) / 100
      : 0;

    // Misconception reduction: Compare first half of attempts to second half
    let misconceptionReduction = 0;
    if (evidenceHistory.length >= 4) {
      const mid = Math.floor(evidenceHistory.length / 2);
      const earlyMisconceptions = evidenceHistory.slice(0, mid).filter(e => e.misconceptionDetected).length;
      const lateMisconceptions = evidenceHistory.slice(mid).filter(e => e.misconceptionDetected).length;
      misconceptionReduction = earlyMisconceptions - lateMisconceptions;
    }

    const difficultyProgression = evidenceHistory
      .map(e => e.difficulty)
      .filter((d, idx, arr) => idx === 0 || d !== arr[idx - 1]);

    return {
      preAssessmentScore,
      postAssessmentScore,
      absoluteGain: this.calculateAbsoluteGain(preAssessmentScore, postAssessmentScore),
      normalizedGain: this.calculateNormalizedGain(preAssessmentScore, postAssessmentScore),
      accuracy,
      independentSuccessRate,
      misconceptionReduction,
      hintDependency,
      difficultyProgression
    };
  }

  /**
   * Compiles synthetic cohort summaries to compare baseline vs adaptive conditions.
   * Useful for testing research analysis pipelines prior to human subject trials.
   */
  public static summarizeCohort(
    condition: 'BASELINE_STATIC' | 'ADAPTIVE_AI_AR',
    dataset: Array<{ preScore: number; postScore: number; evidence: PerformanceEvidence[] }>
  ): CohortEvaluationSummary {
    if (dataset.length === 0) {
      return {
        condition,
        participantCount: 0,
        averagePreScore: 0,
        averagePostScore: 0,
        averageAbsoluteGain: 0,
        averageNormalizedGain: 0,
        averageIndependentSuccessRate: 0,
        totalMisconceptionsLogged: 0
      };
    }

    let totalPre = 0;
    let totalPost = 0;
    let totalAbsGain = 0;
    let totalNormGain = 0;
    let totalIndepRate = 0;
    let totalMisconceptions = 0;

    for (const item of dataset) {
      totalPre += item.preScore;
      totalPost += item.postScore;
      totalAbsGain += this.calculateAbsoluteGain(item.preScore, item.postScore);
      totalNormGain += this.calculateNormalizedGain(item.preScore, item.postScore);

      const attempts = item.evidence.filter(
        e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT'
      );
      const indep = attempts.filter(a => a.correct && !a.usedHint && !a.requestedExplanation).length;
      totalIndepRate += attempts.length > 0 ? (indep / attempts.length) * 100 : 0;
      totalMisconceptions += item.evidence.filter(e => e.misconceptionDetected).length;
    }

    const n = dataset.length;
    return {
      condition,
      participantCount: n,
      averagePreScore: Math.round((totalPre / n) * 10) / 10,
      averagePostScore: Math.round((totalPost / n) * 10) / 10,
      averageAbsoluteGain: Math.round((totalAbsGain / n) * 10) / 10,
      averageNormalizedGain: Math.round((totalNormGain / n) * 100) / 100,
      averageIndependentSuccessRate: Math.round(totalIndepRate / n),
      totalMisconceptionsLogged: totalMisconceptions
    };
  }
}
