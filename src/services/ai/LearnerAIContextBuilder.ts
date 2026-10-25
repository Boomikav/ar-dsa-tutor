import { DSATopic } from '../../models/topic';
import { LearnerState } from '../../models/learner';
import { MisconceptionDiagnosis } from '../../models/misconception';
import { CurrentOperationState, PedagogicalStyle } from '../../models/ai';
import { LearnerAIContext } from '../../models/multiAgent';

export interface BuildLearnerAIContextOptions {
  topic: DSATopic;
  learnerState: LearnerState;
  currentOperation?: Partial<CurrentOperationState>;
  activeMisconception?: MisconceptionDiagnosis | null;
  overrideStyle?: PedagogicalStyle;
  recentMistakesHistory?: Array<{
    type: string;
    userChoice: string;
    expectedChoice: string;
    currentNodeValue?: number | string;
    targetValue?: number | string;
    timestamp?: string;
  }>;
  recentAccuracyRate?: number;
}

/**
 * Shared context builder extracting authoritative learner, DSA topic, operation,
 * and cognitive mistake history into a centralized LearnerAIContext object.
 * Used by all specialized agents and the AIOrchestrator.
 */
export class LearnerAIContextBuilder {
  public static buildContext(options: BuildLearnerAIContextOptions): LearnerAIContext {
    const {
      topic,
      learnerState,
      currentOperation,
      activeMisconception,
      overrideStyle,
      recentMistakesHistory = [],
      recentAccuracyRate
    } = options;

    const topicRecord = learnerState.masteryMap[topic.id];
    const preferredStyle: PedagogicalStyle = 
      overrideStyle || learnerState.profile.aiPreferences?.tutoringStyle || 'socratic';

    // 1. Student Profile Snapshot
    const studentProfile = {
      fullName: learnerState.profile.fullName || 'Student',
      academicLevel: learnerState.profile.academicLevel || 'Undergraduate',
      preferredStyle,
      dailyStreak: learnerState.history.dailyStreak || 1
    };

    // 2. Topic Context
    const topicContext = {
      id: topic.id,
      title: topic.title,
      category: topic.category,
      difficulty: topic.difficulty,
      coreInvariant: topic.shortDescription || 'Left < Root < Right',
      averageTimeComplexity: topic.timeComplexity?.average || 'O(log N)',
      prerequisites: topic.prerequisites || []
    };

    // 3. Topic Mastery Snapshot
    const masterySnapshot = {
      masteryPercentage: topicRecord?.masteryPercentage ?? 0,
      confidence: topicRecord?.confidence ?? 0.3,
      attemptsCount: topicRecord?.attemptsCount ?? 0,
      mistakesCount: topicRecord?.incorrectAttempts ?? 0,
      needsReview: topicRecord?.needsReview ?? false
    };

    // 4. Current Deterministic Operation
    const opState = currentOperation ? {
      operationType: currentOperation.operationType || 'none',
      targetValue: currentOperation.targetValue,
      currentNodeValue: currentOperation.currentNodeValue,
      stepNumber: currentOperation.stepNumber,
      comparisonText: currentOperation.comparisonText,
      deterministicDecision: currentOperation.deterministicDecision,
      isCompleted: currentOperation.isCompleted ?? false
    } : undefined;

    // 5. Misconception History Mapping
    const misconceptionHistory = recentMistakesHistory.map(m => ({
      type: m.type,
      userChoice: m.userChoice,
      expectedChoice: m.expectedChoice,
      currentNodeValue: m.currentNodeValue,
      targetValue: m.targetValue,
      timestamp: m.timestamp || new Date().toISOString()
    }));

    // If active misconception exists and is not yet in history, prepend it
    if (activeMisconception && !misconceptionHistory.some(m => m.type === activeMisconception.type && m.timestamp === activeMisconception.timestamp)) {
      misconceptionHistory.unshift({
        type: activeMisconception.type,
        userChoice: activeMisconception.userChoice,
        expectedChoice: activeMisconception.expectedChoice,
        currentNodeValue: activeMisconception.currentNodeValue,
        targetValue: activeMisconception.targetValue,
        timestamp: activeMisconception.timestamp
      });
    }

    // 6. Analytics Summary
    const totalInteractions = (topicRecord?.attemptsCount || 0) + recentMistakesHistory.length;
    const computedAccuracy = recentAccuracyRate !== undefined
      ? recentAccuracyRate
      : (topicRecord?.attemptsCount && topicRecord.attemptsCount > 0
          ? (topicRecord.correctAttempts || 0) / topicRecord.attemptsCount
          : 0.5);

    const recentAnalyticsSummary = {
      recentInteractionsCount: Math.max(1, totalInteractions),
      recentAccuracyRate: +computedAccuracy.toFixed(2),
      repeatedErrorCount: misconceptionHistory.length
    };

    const adaptiveContext = {
      currentDifficulty: topicRecord?.currentDifficulty || 'FOUNDATIONAL',
      independentSuccessRate: topicRecord?.independentSuccessRate ?? 0,
      masteryTrend: topicRecord?.masteryTrend || 'INSUFFICIENT_DATA',
      needsReviewReasons: topicRecord?.needsReviewReasons || []
    };

    return {
      studentProfile,
      topic: topicContext,
      masterySnapshot,
      currentOperation: opState,
      activeMisconception: activeMisconception || null,
      misconceptionHistory,
      recentAnalyticsSummary,
      adaptiveContext
    };
  }
}
