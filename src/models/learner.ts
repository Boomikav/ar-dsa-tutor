/**
 * Learner Intelligence domain models.
 * Supports personalized adaptive learning paths, cognitive mastery levels,
 * assessment histories, and real-time interaction telemetry.
 */

export type AcademicLevel = 'Undergraduate' | 'Bootcamp' | 'Self-Taught' | 'Graduate' | 'Professional';

export type PrerequisiteStatus = 'locked' | 'unlocked' | 'in_progress' | 'mastered';

export interface ConceptMastery {
  topicId: string;
  masteryPercentage: number; // 0 to 100
  confidence: number; // 0.0 to 1.0 (subjective/objective confidence score)
  attemptsCount: number; // Total attempts
  correctAttempts: number; // Successful quiz attempts
  incorrectAttempts: number; // Failed/misconception attempts
  recentPerformanceScore: number; // Recent score percentage (0 to 100)
  historicalPerformanceScores: number[]; // Trend history of past assessment percentages
  lastReviewedAt: string; // ISO timestamp (legacy compatibility)
  lastStudiedTimestamp: string; // ISO timestamp of most recent engagement
  prerequisiteStatus: PrerequisiteStatus;
  learningProgress: number; // 0.0 to 1.0 (session completion factor)
  retentionScore: number; // 0.0 to 1.0 (for spaced repetition decay)
  needsReview: boolean; // Flagged when retention drops below threshold
  needsReviewReasons?: string[];
  currentDifficulty?: import('./adaptiveLearner').AdaptiveDifficultyLevel;
  independentSuccessRate?: number;
  masteryTrend?: import('./adaptiveLearner').MasteryTrend;
  subSkills?: import('./bst').BSTSubSkillProgress;
}

export interface AssessmentResult {
  id: string;
  topicId: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  conceptWeaknesses: string[];
}

export interface InteractionEvent {
  id: string;
  sessionId: string;
  topicId: string;
  timestamp: string;
  eventType: 
    | 'view_theory' 
    | 'interact_3d' 
    | 'ar_session_start' 
    | 'ar_plane_detected' 
    | 'ai_ask_question' 
    | 'hint_requested' 
    | 'quiz_completed';
  metadata?: Record<string, any>;
}

export interface LearningHistory {
  totalStudyMinutes: number;
  totalSessions: number;
  completedTopicIds: string[];
  inProgressTopicIds: string[];
  recentTopicId?: string;
  lastActiveTimestamp: string;
  assessmentHistory: AssessmentResult[];
  dailyStreak: number;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  academicLevel: AcademicLevel;
  preferredLearningPace: 'deliberate' | 'accelerated' | 'visual-first';
  enrolledAt: string;
  arPreferences: {
    enablePlaneOverlay: boolean;
    autoRotate3D: boolean;
    spatialAudio: boolean;
    renderQuality: 'low' | 'medium' | 'high';
  };
  aiPreferences: {
    tutoringStyle: 'socratic' | 'direct' | 'analogical';
    verbosity: 'concise' | 'detailed';
  };
}

export interface LearnerState {
  profile: StudentProfile;
  history: LearningHistory;
  masteryMap: Record<string, ConceptMastery>; // Keyed by topicId
  topicStates?: Record<string, import('./adaptiveLearner').LearnerTopicState>; // Keyed by topicId
  adaptationHistory?: import('./adaptiveLearner').AdaptationRecord[];
  currentGoalTopicId?: string;
}
