import { ILearnerService } from './ILearnerService';
import { LearnerState, StudentProfile, ConceptMastery, AssessmentResult } from '../../models/learner';
import { LearnerTopicState, PerformanceEvidence, AdaptationRecord, AdaptiveDifficultyLevel } from '../../models/adaptiveLearner';
import { LearnerModelEngine } from './LearnerModelEngine';
import { MOCK_INITIAL_LEARNER_STATE } from '../../data/mockLearnerData';

const STORAGE_KEY = 'ar_dsa_tutor_learner_state_v1';

/**
 * In-memory & LocalStorage learner service implementation.
 * Integrates the deterministic LearnerModelEngine for evidence-based mastery scoring.
 */
export class LocalLearnerService implements ILearnerService {
  readonly isMock = true;
  private state: LearnerState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LearnerState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.topicStates) parsed.topicStates = {};
        if (!parsed.adaptationHistory) parsed.adaptationHistory = [];
        return parsed;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    const defaultState = JSON.parse(JSON.stringify(MOCK_INITIAL_LEARNER_STATE));
    if (!defaultState.topicStates) defaultState.topicStates = {};
    if (!defaultState.adaptationHistory) defaultState.adaptationHistory = [];
    return defaultState;
  }

  private persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore in restricted environments
    }
  }

  async getLearnerState(): Promise<LearnerState> {
    return JSON.parse(JSON.stringify(this.state));
  }

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    this.state.profile = { ...this.state.profile, ...updates };
    this.persistState();
    return JSON.parse(JSON.stringify(this.state.profile));
  }

  async getTopicState(topicId: string): Promise<LearnerTopicState> {
    if (!this.state.topicStates) this.state.topicStates = {};
    if (!this.state.topicStates[topicId]) {
      const existingMastery = this.state.masteryMap[topicId];
      const initial = LearnerModelEngine.createInitialTopicState(
        topicId,
        existingMastery?.prerequisiteStatus || 'in_progress'
      );
      if (existingMastery) {
        initial.masteryScore = existingMastery.masteryPercentage || 0;
        initial.confidenceScore = Math.round((existingMastery.confidence || 0.2) * 100);
        initial.attempts = existingMastery.attemptsCount || 0;
        initial.correctAttempts = existingMastery.correctAttempts || 0;
        initial.incorrectAttempts = existingMastery.incorrectAttempts || 0;
        initial.needsReview = existingMastery.needsReview || false;

        const baseEvidence: PerformanceEvidence[] = [];
        for (let i = 0; i < (existingMastery.correctAttempts || 0); i++) {
          baseEvidence.push({
            id: `base-c-${i}`,
            topicId,
            eventType: 'PRACTICE_ATTEMPT',
            correct: true,
            difficulty: 'MEDIUM',
            usedHint: false,
            requestedExplanation: false,
            misconceptionDetected: false,
            timestamp: new Date().toISOString()
          });
        }
        for (let i = 0; i < (existingMastery.incorrectAttempts || 0); i++) {
          baseEvidence.push({
            id: `base-ic-${i}`,
            topicId,
            eventType: 'PRACTICE_ATTEMPT',
            correct: false,
            difficulty: 'MEDIUM',
            usedHint: false,
            requestedExplanation: false,
            misconceptionDetected: true,
            misconceptionType: 'BST_WRONG_DIRECTION',
            timestamp: new Date().toISOString()
          });
        }
        initial.evidenceHistory = baseEvidence;
      }
      this.state.topicStates[topicId] = initial;
    }
    return JSON.parse(JSON.stringify(this.state.topicStates[topicId]));
  }

  async recordPerformanceEvidence(
    evidence: Omit<PerformanceEvidence, 'id' | 'timestamp'>
  ): Promise<LearnerTopicState> {
    if (!this.state.topicStates) this.state.topicStates = {};

    const currentTopicState = await this.getTopicState(evidence.topicId);
    const fullEvidence: PerformanceEvidence = {
      ...evidence,
      id: `evid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    const updated = LearnerModelEngine.processNewEvidence(currentTopicState, fullEvidence);
    this.state.topicStates[evidence.topicId] = updated;

    // Synchronize backwards-compatible ConceptMastery record
    const existingMastery: ConceptMastery = this.state.masteryMap[evidence.topicId] || {
      topicId: evidence.topicId,
      masteryPercentage: 0,
      confidence: 0.2,
      attemptsCount: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      recentPerformanceScore: 0,
      historicalPerformanceScores: [],
      lastReviewedAt: new Date().toISOString(),
      lastStudiedTimestamp: new Date().toISOString(),
      prerequisiteStatus: 'in_progress',
      learningProgress: 0.1,
      retentionScore: 0.5,
      needsReview: false
    };

    existingMastery.masteryPercentage = updated.masteryScore;
    existingMastery.confidence = +(updated.confidenceScore / 100).toFixed(2);
    existingMastery.attemptsCount = updated.attempts;
    existingMastery.correctAttempts = updated.correctAttempts;
    existingMastery.incorrectAttempts = updated.incorrectAttempts;
    existingMastery.recentPerformanceScore = updated.recentAccuracy;
    existingMastery.needsReview = updated.needsReview;
    existingMastery.needsReviewReasons = updated.needsReviewReasons;
    existingMastery.currentDifficulty = updated.currentDifficulty;
    existingMastery.independentSuccessRate = updated.independentSuccessRate;
    existingMastery.masteryTrend = updated.masteryTrend;
    existingMastery.lastStudiedTimestamp = fullEvidence.timestamp;
    existingMastery.lastReviewedAt = fullEvidence.timestamp;

    if (updated.masteryScore >= 70) {
      existingMastery.prerequisiteStatus = 'mastered';
      existingMastery.learningProgress = 1.0;
      if (!this.state.history.completedTopicIds.includes(evidence.topicId)) {
        this.state.history.completedTopicIds.push(evidence.topicId);
      }
    }

    this.state.masteryMap[evidence.topicId] = existingMastery;
    this.persistState();

    return JSON.parse(JSON.stringify(updated));
  }

  async recordAssessmentResult(result: AssessmentResult): Promise<LearnerState> {
    this.state.history.assessmentHistory.unshift(result);

    await this.recordPerformanceEvidence({
      topicId: result.topicId,
      eventType: 'ASSESSMENT_ATTEMPT',
      correct: result.scorePercentage >= 70,
      difficulty: 'MEDIUM',
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: result.conceptWeaknesses.length > 0,
      assessmentScore: result.scorePercentage
    });

    return this.getLearnerState();
  }

  async recordPracticeCompletion(
    topicId: string,
    mistakesCount: number,
    scorePercentage: number
  ): Promise<LearnerState> {
    await this.recordPerformanceEvidence({
      topicId,
      eventType: 'TOPIC_COMPLETED',
      correct: mistakesCount === 0,
      difficulty: 'MEDIUM',
      usedHint: false,
      requestedExplanation: false,
      misconceptionDetected: mistakesCount > 0,
      assessmentScore: scorePercentage
    });

    return this.getLearnerState();
  }

  async recordPracticeStep(
    topicId: string,
    isCorrect: boolean,
    misconceptionType?: string,
    options?: {
      difficulty?: AdaptiveDifficultyLevel;
      usedHint?: boolean;
      requestedExplanation?: boolean;
    }
  ): Promise<LearnerState> {
    const currentDifficulty = this.state.topicStates?.[topicId]?.currentDifficulty || 'FOUNDATIONAL';

    await this.recordPerformanceEvidence({
      topicId,
      eventType: 'PRACTICE_ATTEMPT',
      correct: isCorrect,
      difficulty: options?.difficulty || currentDifficulty,
      usedHint: !!options?.usedHint,
      requestedExplanation: !!options?.requestedExplanation,
      misconceptionDetected: !isCorrect && !!misconceptionType,
      misconceptionType
    });

    return this.getLearnerState();
  }

  async recordAdaptation(record: AdaptationRecord): Promise<void> {
    if (!this.state.adaptationHistory) this.state.adaptationHistory = [];
    this.state.adaptationHistory.unshift(record);

    if (this.state.topicStates && this.state.topicStates[record.topicId]) {
      this.state.topicStates[record.topicId].currentDifficulty = record.newDifficulty;
    }
    if (this.state.masteryMap && this.state.masteryMap[record.topicId]) {
      this.state.masteryMap[record.topicId].currentDifficulty = record.newDifficulty;
    }

    this.persistState();
  }

  async getAdaptationHistory(topicId?: string): Promise<AdaptationRecord[]> {
    const history = this.state.adaptationHistory || [];
    if (topicId) {
      return history.filter(h => h.topicId === topicId);
    }
    return [...history];
  }

  async updateTopicDifficulty(topicId: string, difficulty: AdaptiveDifficultyLevel): Promise<void> {
    const currentTopicState = await this.getTopicState(topicId);
    currentTopicState.currentDifficulty = difficulty;
    if (this.state.topicStates) {
      this.state.topicStates[topicId] = currentTopicState;
    }
    if (this.state.masteryMap[topicId]) {
      this.state.masteryMap[topicId].currentDifficulty = difficulty;
    }
    this.persistState();
  }

  async updateConceptMastery(topicId: string, percentageDelta: number): Promise<ConceptMastery> {
    const current: ConceptMastery = this.state.masteryMap[topicId] || {
      topicId,
      masteryPercentage: 0,
      confidence: 0.2,
      attemptsCount: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      recentPerformanceScore: 0,
      historicalPerformanceScores: [],
      lastReviewedAt: new Date().toISOString(),
      lastStudiedTimestamp: new Date().toISOString(),
      prerequisiteStatus: 'in_progress',
      learningProgress: 0.1,
      retentionScore: 0.5,
      needsReview: false
    };

    current.masteryPercentage = Math.min(100, Math.max(0, current.masteryPercentage + percentageDelta));
    current.lastReviewedAt = new Date().toISOString();
    current.lastStudiedTimestamp = new Date().toISOString();
    this.state.masteryMap[topicId] = current;
    this.persistState();
    return current;
  }

  async recordSessionActivity(topicId: string, durationMinutes: number): Promise<void> {
    this.state.history.totalStudyMinutes += durationMinutes;
    this.state.history.totalSessions += 1;
    this.state.history.recentTopicId = topicId;
    this.state.history.lastActiveTimestamp = new Date().toISOString();

    if (!this.state.history.inProgressTopicIds.includes(topicId)) {
      this.state.history.inProgressTopicIds.push(topicId);
    }
    this.persistState();
  }

  async resetToDefault(): Promise<LearnerState> {
    this.state = JSON.parse(JSON.stringify(MOCK_INITIAL_LEARNER_STATE));
    this.persistState();
    return this.getLearnerState();
  }
}
