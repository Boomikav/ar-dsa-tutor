/**
 * Phase 7: Adaptive Learner Intelligence & Measurable Evaluation Models
 * 
 * Defines formal, transparent, deterministic models for:
 * 1. Performance Evidence
 * 2. Learner Topic State
 * 3. Adaptive Difficulty Levels & Decisions
 * 4. Adaptation Audit History
 * 5. Research Evaluation Metrics
 */

import { PrerequisiteStatus } from './learner';

/**
 * Categorical levels for pedagogical adaptive difficulty.
 */
export type AdaptiveDifficultyLevel = 
  | 'FOUNDATIONAL' 
  | 'EASY' 
  | 'MEDIUM' 
  | 'HARD' 
  | 'CHALLENGE';

/**
 * Directional trend of mastery over recent learning events.
 */
export type MasteryTrend = 
  | 'IMPROVING' 
  | 'STABLE' 
  | 'DECLINING' 
  | 'INSUFFICIENT_DATA';

/**
 * Meaningful educational events that contribute to the performance evidence record.
 */
export type EvidenceEventType = 
  | 'PRACTICE_ATTEMPT'
  | 'ASSESSMENT_ATTEMPT'
  | 'MISCONCEPTION'
  | 'HINT_USED'
  | 'EXPLANATION_REQUESTED'
  | 'TOPIC_COMPLETED';

/**
 * Deterministic evidence record logged for each meaningful learning event.
 * Contains zero personal identifying information or credentials.
 */
export interface PerformanceEvidence {
  id: string;
  topicId: string;
  eventType: EvidenceEventType;
  correct: boolean;
  difficulty: AdaptiveDifficultyLevel;
  usedHint: boolean;
  requestedExplanation: boolean;
  misconceptionDetected: boolean;
  misconceptionType?: string;
  responseTimeMs?: number;
  assessmentScore?: number; // 0–100 when eventType === 'ASSESSMENT_ATTEMPT'
  timestamp: string;
}

/**
 * Formal, transparent learner state for a specific DSA topic.
 * Fully explainable, testable, and independent of LLM hallucination.
 */
export interface LearnerTopicState {
  topicId: string;
  masteryScore: number; // 0–100 (demonstrated capability)
  confidenceScore: number; // 0–100 (consistency & independence of performance)
  
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  
  recentAccuracy: number; // 0–100 (last 5 attempts)
  historicalAccuracy: number; // 0–100 (overall lifetime)
  
  misconceptionCount: number;
  repeatedMisconceptionCount: number;
  
  hintCount: number;
  explanationCount: number;
  
  independentSuccessRate: number; // 0–100 (correct attempts without hints or explanations)
  
  currentDifficulty: AdaptiveDifficultyLevel;
  prerequisiteStatus: PrerequisiteStatus;
  
  lastAttemptAt?: string;
  lastAssessmentAt?: string;
  
  masteryTrend: MasteryTrend;
  needsReview: boolean;
  needsReviewReasons: string[];
  
  evidenceHistory: PerformanceEvidence[];
}

/**
 * Transparent, explainable decision produced by the AdaptiveDifficultyEngine.
 */
export interface DifficultyDecision {
  previousDifficulty: AdaptiveDifficultyLevel;
  recommendedDifficulty: AdaptiveDifficultyLevel;
  direction: 'INCREASE' | 'MAINTAIN' | 'REDUCE' | 'REMEDIATION';
  reasons: string[];
  
  masteryScore: number;
  recentAccuracy: number;
  independentSuccessRate: number;
  misconceptionRate: number;
  confidence: number;
  
  recommendedTaskType?: string;
  timestamp: string;
}

/**
 * Persistent audit record documenting why an adaptation decision occurred.
 * Crucial for research reproducibility and educational accountability.
 */
export interface AdaptationRecord {
  id: string;
  topicId: string;
  previousDifficulty: AdaptiveDifficultyLevel;
  newDifficulty: AdaptiveDifficultyLevel;
  direction: 'INCREASE' | 'MAINTAIN' | 'REDUCE' | 'REMEDIATION';
  trigger: string;
  reasons: string[];
  masteryAtDecision: number;
  confidenceAtDecision: number;
  timestamp: string;
}

/**
 * Deterministic research evaluation metrics for comparing learning gains
 * between baseline and adaptive conditions without fabricating experimental participants.
 */
export interface ResearchEvaluationMetrics {
  preAssessmentScore: number; // 0–100
  postAssessmentScore: number; // 0–100
  absoluteGain: number; // postScore - preScore
  normalizedGain?: number; // (post - pre) / (100 - pre) when pre < 100
  accuracy: number;
  independentSuccessRate: number;
  misconceptionReduction: number; // reduction in misconception count
  hintDependency: number; // hintCount / totalAttempts
  difficultyProgression: AdaptiveDifficultyLevel[];
}

/**
 * Concrete task modification configuration for AR / practice visualization.
 */
export interface AdaptiveTaskSpec {
  difficulty: AdaptiveDifficultyLevel;
  targetValue: number;
  requiresPredictionBeforeMove: boolean;
  requiresFullOperationPrediction: boolean;
  showComparisonHint: boolean;
  showInvariantGuidance: boolean;
  label: string;
  description: string;
}
