import { LearnerState } from '../models/learner';

/**
 * Realistic Mock Initial Learner State.
 * Clearly marked as mock data for Phase 1.
 * Provides realistic initial mastery, learning history, and student profile.
 */
export const MOCK_INITIAL_LEARNER_STATE: LearnerState = {
  profile: {
    id: 'student-usr-4092',
    fullName: 'Alex Chen',
    username: 'achen_cs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    academicLevel: 'Undergraduate',
    preferredLearningPace: 'visual-first',
    enrolledAt: '2026-08-15T08:00:00.000Z',
    arPreferences: {
      enablePlaneOverlay: true,
      autoRotate3D: false,
      spatialAudio: true,
      renderQuality: 'high'
    },
    aiPreferences: {
      tutoringStyle: 'socratic',
      verbosity: 'concise'
    }
  },
  history: {
    totalStudyMinutes: 240,
    totalSessions: 14,
    completedTopicIds: ['ds-array', 'algo-linear-search', 'ds-stack'],
    inProgressTopicIds: ['ds-linked-list', 'ds-binary-tree', 'algo-binary-search'],
    recentTopicId: 'ds-linked-list',
    lastActiveTimestamp: '2026-09-20T18:45:00.000Z',
    dailyStreak: 6,
    assessmentHistory: [
      {
        id: 'asmt-001',
        topicId: 'ds-array',
        timestamp: '2026-09-18T14:20:00.000Z',
        totalQuestions: 5,
        correctCount: 5,
        scorePercentage: 100,
        timeSpentSeconds: 120,
        conceptWeaknesses: []
      },
      {
        id: 'asmt-002',
        topicId: 'ds-stack',
        timestamp: '2026-09-19T10:15:00.000Z',
        totalQuestions: 5,
        correctCount: 4,
        scorePercentage: 80,
        timeSpentSeconds: 150,
        conceptWeaknesses: ['call-stack-boundary']
      }
    ]
  },
  masteryMap: {
    'ds-array': {
      topicId: 'ds-array',
      masteryPercentage: 92,
      confidence: 0.95,
      attemptsCount: 3,
      correctAttempts: 3,
      incorrectAttempts: 0,
      recentPerformanceScore: 100,
      historicalPerformanceScores: [80, 90, 100],
      lastReviewedAt: '2026-09-18T14:20:00.000Z',
      lastStudiedTimestamp: '2026-09-18T14:20:00.000Z',
      prerequisiteStatus: 'mastered',
      learningProgress: 1.0,
      retentionScore: 0.95,
      needsReview: false
    },
    'algo-linear-search': {
      topicId: 'algo-linear-search',
      masteryPercentage: 88,
      confidence: 0.9,
      attemptsCount: 2,
      correctAttempts: 2,
      incorrectAttempts: 0,
      recentPerformanceScore: 90,
      historicalPerformanceScores: [85, 90],
      lastReviewedAt: '2026-09-18T15:00:00.000Z',
      lastStudiedTimestamp: '2026-09-18T15:00:00.000Z',
      prerequisiteStatus: 'mastered',
      learningProgress: 1.0,
      retentionScore: 0.9,
      needsReview: false
    },
    'ds-stack': {
      topicId: 'ds-stack',
      masteryPercentage: 82,
      confidence: 0.85,
      attemptsCount: 2,
      correctAttempts: 1,
      incorrectAttempts: 1,
      recentPerformanceScore: 80,
      historicalPerformanceScores: [70, 80],
      lastReviewedAt: '2026-09-19T10:15:00.000Z',
      lastStudiedTimestamp: '2026-09-19T10:15:00.000Z',
      prerequisiteStatus: 'mastered',
      learningProgress: 1.0,
      retentionScore: 0.85,
      needsReview: false
    },
    'ds-linked-list': {
      topicId: 'ds-linked-list',
      masteryPercentage: 45,
      confidence: 0.6,
      attemptsCount: 1,
      correctAttempts: 0,
      incorrectAttempts: 1,
      recentPerformanceScore: 50,
      historicalPerformanceScores: [50],
      lastReviewedAt: '2026-09-20T18:45:00.000Z',
      lastStudiedTimestamp: '2026-09-20T18:45:00.000Z',
      prerequisiteStatus: 'in_progress',
      learningProgress: 0.45,
      retentionScore: 0.65,
      needsReview: false
    },
    'algo-binary-search': {
      topicId: 'algo-binary-search',
      masteryPercentage: 35,
      confidence: 0.5,
      attemptsCount: 1,
      correctAttempts: 0,
      incorrectAttempts: 1,
      recentPerformanceScore: 40,
      historicalPerformanceScores: [40],
      lastReviewedAt: '2026-09-17T11:00:00.000Z',
      lastStudiedTimestamp: '2026-09-17T11:00:00.000Z',
      prerequisiteStatus: 'in_progress',
      learningProgress: 0.35,
      retentionScore: 0.55,
      needsReview: true
    },
    'ds-binary-tree': {
      topicId: 'ds-binary-tree',
      masteryPercentage: 75,
      confidence: 0.8,
      attemptsCount: 2,
      correctAttempts: 2,
      incorrectAttempts: 0,
      recentPerformanceScore: 80,
      historicalPerformanceScores: [70, 80],
      lastReviewedAt: '2026-09-20T14:00:00.000Z',
      lastStudiedTimestamp: '2026-09-20T14:00:00.000Z',
      prerequisiteStatus: 'mastered',
      learningProgress: 1.0,
      retentionScore: 0.85,
      needsReview: false
    },
    'ds-binary-search-tree': {
      topicId: 'ds-binary-search-tree',
      masteryPercentage: 25,
      confidence: 0.4,
      attemptsCount: 1,
      correctAttempts: 0,
      incorrectAttempts: 1,
      recentPerformanceScore: 30,
      historicalPerformanceScores: [30],
      lastReviewedAt: '2026-09-21T08:00:00.000Z',
      lastStudiedTimestamp: '2026-09-21T08:00:00.000Z',
      prerequisiteStatus: 'in_progress',
      learningProgress: 0.25,
      retentionScore: 0.7,
      needsReview: false
    }
  },
  currentGoalTopicId: 'ds-binary-search-tree'
};
