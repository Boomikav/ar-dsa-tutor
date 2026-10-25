import { LearnerState, StudentProfile, ConceptMastery, AssessmentResult } from '../../models/learner';
import { LearnerTopicState, PerformanceEvidence, AdaptationRecord } from '../../models/adaptiveLearner';

/**
 * Service boundary interface for Learner Modeling and Intelligence.
 */
export interface ILearnerService {
  readonly isMock: boolean;

  getLearnerState(): Promise<LearnerState>;

  updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile>;

  recordAssessmentResult(result: AssessmentResult): Promise<LearnerState>;

  recordPracticeCompletion(
    topicId: string,
    mistakesCount: number,
    scorePercentage: number
  ): Promise<LearnerState>;

  recordPracticeStep(
    topicId: string,
    isCorrect: boolean,
    misconceptionType?: string,
    options?: {
      difficulty?: import('../../models/adaptiveLearner').AdaptiveDifficultyLevel;
      usedHint?: boolean;
      requestedExplanation?: boolean;
    }
  ): Promise<LearnerState>;

  recordPerformanceEvidence(
    evidence: Omit<PerformanceEvidence, 'id' | 'timestamp'>
  ): Promise<LearnerTopicState>;

  getTopicState(topicId: string): Promise<LearnerTopicState>;

  recordAdaptation(record: AdaptationRecord): Promise<void>;

  getAdaptationHistory(topicId?: string): Promise<AdaptationRecord[]>;

  updateTopicDifficulty(
    topicId: string,
    difficulty: import('../../models/adaptiveLearner').AdaptiveDifficultyLevel
  ): Promise<void>;

  updateConceptMastery(
    topicId: string,
    percentageDelta: number
  ): Promise<ConceptMastery>;

  recordSessionActivity(
    topicId: string,
    durationMinutes: number
  ): Promise<void>;

  resetToDefault(): Promise<LearnerState>;
}
