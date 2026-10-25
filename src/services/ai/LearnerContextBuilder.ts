import { DSATopic } from '../../models/topic';
import { LearnerState } from '../../models/learner';
import { MisconceptionDiagnosis } from '../../models/misconception';
import { 
  TutorRequest, 
  TutorHelpLevel, 
  PedagogicalStyle,
  CurrentOperationState,
  StudentContext,
  TopicContext,
  LearnerTopicSnapshot
} from '../../models/ai';

export interface ContextBuildOptions {
  topic: DSATopic;
  learnerState: LearnerState;
  helpLevel: TutorHelpLevel;
  currentOperation?: Partial<CurrentOperationState>;
  misconception?: MisconceptionDiagnosis | null;
  userQuery?: string;
  overrideStyle?: PedagogicalStyle;
}

/**
 * LearnerContextBuilder
 * 
 * Assembles educational context into a compact, standardized TutorRequest payload.
 * Combines:
 * - Academic level & preferred tutoring style (Socratic, Direct, Analogical)
 * - Topic invariants & asymptotic complexity
 * - Topic-specific mastery percentage & confidence
 * - Authoritative deterministic operation state (from BSTEngine)
 * - Structured misconception diagnoses (from BSTPracticeEngine)
 */
export class LearnerContextBuilder {
  static buildRequest(options: ContextBuildOptions): TutorRequest {
    const { topic, learnerState, helpLevel, currentOperation, misconception, userQuery, overrideStyle } = options;

    // 1. Student Context
    const studentContext: StudentContext = {
      fullName: learnerState.profile.fullName || 'Student',
      academicLevel: learnerState.profile.academicLevel || 'Undergraduate',
      preferredStyle: overrideStyle || learnerState.profile.aiPreferences?.tutoringStyle || 'socratic',
      streakDays: learnerState.history.dailyStreak || 1
    };

    // 2. Topic Context
    const topicContext: TopicContext = {
      id: topic.id,
      title: topic.title,
      category: topic.category,
      difficulty: topic.difficulty,
      coreInvariant: topic.shortDescription || 'Left Subtree < Root < Right Subtree',
      averageTimeComplexity: topic.timeComplexity?.average || 'O(log N)'
    };

    // 3. Topic-Specific Learner Mastery Snapshot
    const masteryRecord = learnerState.masteryMap[topic.id];
    const learnerSnapshot: LearnerTopicSnapshot = {
      masteryPercentage: masteryRecord?.masteryPercentage ?? 0,
      confidence: masteryRecord?.confidence ?? 0.3,
      attemptsCount: masteryRecord?.attemptsCount ?? 0,
      mistakesCount: masteryRecord?.incorrectAttempts ?? 0,
      needsReview: masteryRecord?.needsReview ?? false
    };

    // 4. Deterministic Operation State
    const opState: CurrentOperationState = {
      operationType: currentOperation?.operationType || 'none',
      targetValue: currentOperation?.targetValue,
      currentNodeValue: currentOperation?.currentNodeValue,
      stepNumber: currentOperation?.stepNumber,
      comparisonText: currentOperation?.comparisonText,
      deterministicDecision: currentOperation?.deterministicDecision,
      isCompleted: currentOperation?.isCompleted ?? false
    };

    return {
      studentContext,
      topicContext,
      learnerState: learnerSnapshot,
      currentOperation: opState,
      misconception: misconception || null,
      requestedHelpLevel: helpLevel,
      userQuery: userQuery?.trim()
    };
  }
}
