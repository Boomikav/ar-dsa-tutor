/**
 * Phase 7: Deterministic Learner Model Engine
 * 
 * Provides transparent, explainable, evidence-based learner modeling:
 * - Deterministic mathematical formulas for Mastery and Confidence
 * - Distinct, decoupled evaluation of Mastery (capability) vs Confidence (independence/consistency)
 * - Independent Success Rate tracking
 * - Historical vs Recent Accuracy trend calculation
 * - Multi-trigger explainable Needs-Review evaluation
 * 
 * Invariants:
 * - PURE TypeScript domain service (no React, no DOM, no LLM, no WebXR).
 * - Deterministic and 100% reproducible.
 * - Bound to 0–100 for all scores.
 */

import { 
  LearnerTopicState, 
  PerformanceEvidence, 
  MasteryTrend 
} from '../../models/adaptiveLearner';

export class LearnerModelEngine {
  /**
   * Generates a default, empty LearnerTopicState for a newly introduced topic.
   */
  public static createInitialTopicState(topicId: string, initialPrerequisiteStatus: import('../../models/learner').PrerequisiteStatus = 'in_progress'): LearnerTopicState {
    return {
      topicId,
      masteryScore: 0,
      confidenceScore: 20,
      attempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      recentAccuracy: 0,
      historicalAccuracy: 0,
      misconceptionCount: 0,
      repeatedMisconceptionCount: 0,
      hintCount: 0,
      explanationCount: 0,
      independentSuccessRate: 0,
      currentDifficulty: 'FOUNDATIONAL',
      prerequisiteStatus: initialPrerequisiteStatus,
      masteryTrend: 'INSUFFICIENT_DATA',
      needsReview: false,
      needsReviewReasons: [],
      evidenceHistory: []
    };
  }

  /**
   * Calculates the independent success rate (0–100).
   * Measures the ratio of correct attempts achieved without requesting hints or explanations.
   * 
   * Formula:
   * Independent Attempts = Count(attempt.correct && !attempt.usedHint && !attempt.requestedExplanation)
   * Rate = (Independent Attempts / Total Attempts) * 100
   */
  public static calculateIndependentSuccessRate(evidence: PerformanceEvidence[]): number {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length === 0) return 0;

    const independentSuccesses = attempts.filter(
      a => a.correct && !a.usedHint && !a.requestedExplanation
    ).length;

    return Math.round((independentSuccesses / attempts.length) * 100);
  }

  /**
   * Calculates Recent Accuracy (0–100) based on the last 5 attempts.
   */
  public static calculateRecentAccuracy(evidence: PerformanceEvidence[], windowSize: number = 5): number {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length === 0) return 0;

    const recent = attempts.slice(-windowSize);
    const correctCount = recent.filter(a => a.correct).length;
    return Math.round((correctCount / recent.length) * 100);
  }

  /**
   * Calculates Historical Accuracy (0–100) across all attempts prior to the recent window.
   * If total attempts <= windowSize, evaluates across all available attempts.
   */
  public static calculateHistoricalAccuracy(evidence: PerformanceEvidence[], windowSize: number = 5): number {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length === 0) return 0;

    if (attempts.length <= windowSize) {
      const correct = attempts.filter(a => a.correct).length;
      return Math.round((correct / attempts.length) * 100);
    }

    const historical = attempts.slice(0, attempts.length - windowSize);
    const correct = historical.filter(a => a.correct).length;
    return Math.round((correct / historical.length) * 100);
  }

  /**
   * Calculates Mastery Score (0–100).
   * 
   * Mathematical Model:
   * 1. Base Score = (0.35 * Historical Accuracy) + (0.40 * Recent Accuracy) + (0.25 * Latest Assessment Factor)
   * 2. Assistance Penalty = Up to -15 points if assistance rate (hints + explanations) > 20%
   * 3. Misconception Penalty = Up to -20 points (repeated misconceptions penalize 7 pts, single 3 pts)
   * 4. Bounded: clamp(0, 100, Base - Assistance Penalty - Misconception Penalty)
   */
  public static calculateMastery(evidence: PerformanceEvidence[]): number {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length === 0) return 0;

    const histAcc = this.calculateHistoricalAccuracy(evidence);
    const recAcc = this.calculateRecentAccuracy(evidence);

    // Latest assessment score factor
    const assessments = evidence.filter(e => e.eventType === 'ASSESSMENT_ATTEMPT' && e.assessmentScore !== undefined);
    const latestAssessmentScore = assessments.length > 0
      ? assessments[assessments.length - 1].assessmentScore!
      : recAcc; // Use recent accuracy if no formal assessment taken yet

    const baseScore = (0.35 * histAcc) + (0.40 * recAcc) + (0.25 * latestAssessmentScore);

    // Assistance dependency penalty
    const assistedAttempts = attempts.filter(a => a.usedHint || a.requestedExplanation).length;
    const assistanceRate = assistedAttempts / attempts.length;
    let assistancePenalty = 0;
    if (assistanceRate > 0.20) {
      assistancePenalty = Math.round(15 * ((assistanceRate - 0.20) / 0.80));
    }

    // Misconception penalty (recent 5 events)
    const recentEvents = evidence.slice(-5);
    const misconceptions = recentEvents.filter(e => e.misconceptionDetected);
    const misconceptionTypes = new Set(misconceptions.map(m => m.misconceptionType || 'GENERAL'));
    let misconceptionPenalty = 0;
    for (const type of misconceptionTypes) {
      const occurrences = misconceptions.filter(m => (m.misconceptionType || 'GENERAL') === type).length;
      if (occurrences >= 2) {
        misconceptionPenalty += 7 * occurrences;
      } else {
        misconceptionPenalty += 3;
      }
    }
    misconceptionPenalty = Math.min(20, misconceptionPenalty);

    const rawMastery = Math.round(baseScore - assistancePenalty - misconceptionPenalty);
    return Math.max(0, Math.min(100, rawMastery));
  }

  /**
   * Calculates Confidence Score (0–100).
   * 
   * Distinct from Mastery:
   * - Mastery measures correctness and conceptual depth.
   * - Confidence measures consistency, independence, and stability over time.
   * 
   * Mathematical Model:
   * 1. Independence Factor (0–40): (Independent Success Rate * 0.40)
   * 2. Sample Volume Factor (0–30): min(1.0, Total Attempts / 10) * 30
   * 3. Streak Factor (0–30): min(1.0, Current Consecutive Correct / 4) * 30
   * 4. Instability Penalty (0 or 15): Deduct 15 if multiple recent misconceptions exist.
   * 5. Bounded: clamp(0, 100, Independence + Sample Volume + Streak - Instability)
   */
  public static calculateConfidence(evidence: PerformanceEvidence[]): number {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length === 0) return 20; // baseline default confidence

    const independentRate = this.calculateIndependentSuccessRate(evidence);
    const independenceFactor = (independentRate / 100) * 40;

    const sampleVolumeFactor = Math.min(1.0, attempts.length / 10) * 30;

    // Consecutive correct streak
    let streak = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].correct) {
        streak += 1;
      } else {
        break;
      }
    }
    const streakFactor = Math.min(1.0, streak / 4) * 30;

    // Instability check
    const recentMisconceptions = evidence.slice(-5).filter(e => e.misconceptionDetected).length;
    const instabilityPenalty = recentMisconceptions >= 2 ? 15 : 0;

    const rawConfidence = Math.round(independenceFactor + sampleVolumeFactor + streakFactor - instabilityPenalty);
    return Math.max(0, Math.min(100, rawConfidence));
  }

  /**
   * Calculates Directional Mastery Trend.
   * 
   * Rules:
   * - If total attempts < 3: INSUFFICIENT_DATA
   * - If Recent Accuracy >= Historical Accuracy + 12: IMPROVING
   * - If Recent Accuracy <= Historical Accuracy - 12: DECLINING
   * - Otherwise: STABLE
   */
  public static calculateTrend(evidence: PerformanceEvidence[]): MasteryTrend {
    const attempts = evidence.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT');
    if (attempts.length < 3) {
      return 'INSUFFICIENT_DATA';
    }

    const recAcc = this.calculateRecentAccuracy(evidence);
    const histAcc = this.calculateHistoricalAccuracy(evidence);

    if (recAcc >= histAcc + 12) {
      return 'IMPROVING';
    }
    if (recAcc <= histAcc - 12) {
      return 'DECLINING';
    }
    return 'STABLE';
  }

  /**
   * Evaluates whether a topic needs review, producing explainable reasons.
   */
  public static evaluateNeedsReview(
    topicState: Partial<LearnerTopicState>,
    prerequisitesMet: boolean = true
  ): { needsReview: boolean; reasons: string[] } {
    const reasons: string[] = [];

    const attempts = topicState.attempts || 0;
    const mastery = topicState.masteryScore || 0;
    const trend = topicState.masteryTrend || 'INSUFFICIENT_DATA';
    const repeatedErrors = topicState.repeatedMisconceptionCount || 0;
    const independentSuccess = topicState.independentSuccessRate || 0;

    if (trend === 'DECLINING') {
      reasons.push('Recent performance shows a declining accuracy trend');
    }

    if (repeatedErrors >= 2) {
      reasons.push(`Repeated misconception detected (${repeatedErrors} occurrences)`);
    }

    if (attempts >= 3 && mastery < 60) {
      reasons.push(`Mastery score (${mastery}%) is below foundational threshold (60%)`);
    }

    if (attempts >= 4 && independentSuccess < 40) {
      reasons.push(`High assistance dependency: independent success rate is ${independentSuccess}%`);
    }

    if (topicState.misconceptionCount && topicState.misconceptionCount > 0 && mastery < 70) {
      reasons.push('Active misconception detected requiring review');
    }

    if (!prerequisitesMet) {
      reasons.push('Prerequisite concepts are unmastered or require review');
    }

    return {
      needsReview: reasons.length > 0,
      reasons
    };
  }

  /**
   * Processes a new piece of PerformanceEvidence, updating the LearnerTopicState immutably.
   */
  public static processNewEvidence(
    currentState: LearnerTopicState,
    newEvidence: PerformanceEvidence,
    prerequisitesMet: boolean = true
  ): LearnerTopicState {
    const updatedHistory = [...currentState.evidenceHistory, newEvidence];

    const attempts = updatedHistory.filter(e => e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT').length;
    const correctAttempts = updatedHistory.filter(e => (e.eventType === 'PRACTICE_ATTEMPT' || e.eventType === 'ASSESSMENT_ATTEMPT') && e.correct).length;
    const incorrectAttempts = attempts - correctAttempts;

    const recentAccuracy = this.calculateRecentAccuracy(updatedHistory);
    const historicalAccuracy = this.calculateHistoricalAccuracy(updatedHistory);

    const hintCount = updatedHistory.filter(e => e.usedHint || e.eventType === 'HINT_USED').length;
    const explanationCount = updatedHistory.filter(e => e.requestedExplanation || e.eventType === 'EXPLANATION_REQUESTED').length;

    // Count misconceptions
    const misconceptions = updatedHistory.filter(e => e.misconceptionDetected);
    const misconceptionCount = misconceptions.length;

    // Count repeated occurrences of same misconception type
    const typeCounts: Record<string, number> = {};
    for (const m of misconceptions) {
      const t = m.misconceptionType || 'GENERAL';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
    const repeatedMisconceptionCount = Object.values(typeCounts).filter(c => c >= 2).reduce((sum, c) => sum + (c - 1), 0);

    const independentSuccessRate = this.calculateIndependentSuccessRate(updatedHistory);
    const masteryScore = this.calculateMastery(updatedHistory);
    const confidenceScore = this.calculateConfidence(updatedHistory);
    const masteryTrend = this.calculateTrend(updatedHistory);

    const { needsReview, reasons } = this.evaluateNeedsReview({
      attempts,
      masteryScore,
      masteryTrend,
      repeatedMisconceptionCount,
      misconceptionCount: newEvidence.misconceptionDetected ? 1 : 0,
      independentSuccessRate
    }, prerequisitesMet);

    // If new evidence explicitly detected a misconception, ensure review is flagged.
    // When the learner executes a correct step, the immediate review flag is cleared.
    const finalNeedsReview = newEvidence.misconceptionDetected 
      ? true 
      : newEvidence.correct 
      ? false 
      : needsReview;

    const finalReasons = newEvidence.misconceptionDetected && !reasons.some(r => r.includes('misconception'))
      ? [...reasons, `Active misconception (${newEvidence.misconceptionType || 'BST_ERROR'}) detected`]
      : newEvidence.correct
      ? []
      : reasons;

    return {
      ...currentState,
      masteryScore,
      confidenceScore,
      attempts,
      correctAttempts,
      incorrectAttempts,
      recentAccuracy,
      historicalAccuracy,
      misconceptionCount,
      repeatedMisconceptionCount,
      hintCount,
      explanationCount,
      independentSuccessRate,
      masteryTrend,
      needsReview: finalNeedsReview,
      needsReviewReasons: finalReasons,
      lastAttemptAt: newEvidence.timestamp,
      lastAssessmentAt: newEvidence.eventType === 'ASSESSMENT_ATTEMPT' ? newEvidence.timestamp : currentState.lastAssessmentAt,
      evidenceHistory: updatedHistory
    };
  }
}
