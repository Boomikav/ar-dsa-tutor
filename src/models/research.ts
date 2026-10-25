/**
 * Phase 10: Research Evaluation & Experimental Framework Models
 * 
 * Formal research interfaces ensuring:
 * - Deterministic experimental evaluation
 * - Separation between operational learner model and research dataset
 * - Longitudinal misconception tracking
 * - Pseudonymous privacy preservation (no unnecessary PII)
 * - Reproducible task generation
 * - Standardized usability assessment (official SUS)
 */

export type StudyCondition = 'CONTROL' | 'AR_DSA_TUTOR';
export type ActualVisualizationMode = 'AR' | '3D_FALLBACK' | '2D';

export interface StudyConfiguration {
  studyId: string;
  title: string;
  version: string;
  condition: StudyCondition;
  targetPopulation: string;
  targetSampleSize?: number; // Configurable; never claims power without formal power analysis
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  randomizationMethod?: string;
  preTestEnabled: boolean;
  postTestEnabled: boolean;
  delayedPostTestEnabled: boolean;
  delayedPostTestDays?: number; // Default: 7 days
}

export interface ExperimentConfig {
  studyId: string;
  version: string;
  protocolVersion: string;
  questionBankVersion: string;
  engineVersion: string;
  conditions: StudyCondition[];
  topics: string[];
  preTestQuestionIds: string[];
  postTestQuestionIds: string[];
  delayedPostTestQuestionIds: string[];
  retentionDelayDays: number;
  randomizationSeed: number;
}

export interface ParticipantRecord {
  participantId: string; // Pseudonymous identifier (e.g. 'P001')
  condition: StudyCondition;
  actualVisMode?: ActualVisualizationMode;
  demographicGroup?: string;
  priorDSAExperience?: 'NONE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  enrolledTimestamp: string;
}

export type AssessmentStage = 'PRETEST' | 'PRACTICE' | 'POSTTEST' | 'DELAYED_POSTTEST';

export interface AssessmentAttempt {
  attemptId: string;
  participantId: string;
  topicId: string;
  assessmentType: AssessmentStage;
  questionId: string;
  response: string;
  correct: boolean;
  timestamp: string;
  responseTimeMs?: number;
}

export interface LearningOutcome {
  participantId: string;
  condition: StudyCondition;
  preTestScore: number;
  postTestScore: number;
  delayedPostTestScore?: number;
  absoluteGain: number;
  normalizedGain?: number;
  retentionRate?: number;
  isComplete: boolean;
}

export interface MisconceptionEpisode {
  participantId: string;
  topicId: string;
  misconceptionType: string;
  firstDetectedAt: string;
  recurrenceCount: number;
  remediationAttempts: number;
  resolvedAt?: string; // Defined as: no recurrence across next N consecutive relevant opportunities
}

export interface ResearchEvent {
  eventId: string;
  studyId: string;
  participantId: string;
  sessionId: string;
  timestamp: string;
  eventType: 
    | 'ENROLLMENT'
    | 'PRETEST_SUBMISSION'
    | 'LEARNING_STEP'
    | 'PRACTICE_SUBMISSION'
    | 'MISCONCEPTION_TRIGGERED'
    | 'DIFFICULTY_ADAPTATION'
    | 'AI_INTERACTION'
    | 'POSTTEST_SUBMISSION'
    | 'DELAYED_POSTTEST_SUBMISSION'
    | 'SUS_SURVEY_SUBMISSION';
  topicId?: string;
  taskId?: string;
  difficulty?: string;
  payload: Record<string, unknown>;
}

export interface SUSSurveyResponse {
  participantId: string;
  timestamp: string;
  // Official 10-item Likert scores (1 = Strongly Disagree to 5 = Strongly Agree)
  // Q1: I think that I would like to use this system frequently.
  // Q2: I found the system unnecessarily complex.
  // Q3: I thought the system was easy to use.
  // Q4: I think that I would need the support of a technical person to be able to use this system.
  // Q5: I found the various functions in this system were well integrated.
  // Q6: I thought there was too much inconsistency in this system.
  // Q7: I would imagine that most people would learn to use this system very quickly.
  // Q8: I found the system very cumbersome to use.
  // Q9: I felt very confident using the system.
  // Q10: I needed to learn a lot of things before I could get going with this system.
  responses: [number, number, number, number, number, number, number, number, number, number];
  computedSUSScore: number; // 0 - 100
}

export interface AIEvaluationRecord {
  interactionId: string;
  participantId: string;
  topicId: string;
  timestamp: string;
  // Deterministic checks
  schemaValidity: boolean;
  topicCorrectness: boolean;
  operationConsistency: boolean;
  nextActionValidity: boolean;
  stateMutationViolation: boolean;
  // Optional human ratings (Likert 1-5, null if unrated by human evaluator)
  humanRatings?: {
    clarity?: number;
    relevance?: number;
    pedagogicalUsefulness?: number;
    groundedness?: number;
    helpfulness?: number;
  };
}

export interface PersonalizationMetrics {
  difficultyAdaptationRate: number;
  difficultyAlignment: number;
  adaptationResponsiveness: number;
  trajectoryDiversity: number;
}

export interface DataQualityReport {
  totalRecordsChecked: number;
  validRecords: number;
  excludedRecords: number;
  exclusionReasons: Array<{
    recordId: string;
    reason: string;
  }>;
}
