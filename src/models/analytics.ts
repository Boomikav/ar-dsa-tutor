/**
 * Analytics and Telemetry domain models.
 * Captures cognitive performance, spatial interaction events, and time metrics.
 */

export interface AnalyticsEvent {
  id: string;
  userId: string;
  topicId?: string;
  eventType: 
    | 'screen_view'
    | 'quiz_attempt'
    | 'ar_anchor_placed'
    | 'ar_interaction_step'
    | 'ai_prompt_sent'
    | 'concept_mastery_updated'
    | 'prerequisite_unlocked';
  timestamp: string;
  payload: Record<string, any>;
}

export interface QuizAttempt {
  attemptId: string;
  topicId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  responseTimeMs: number;
  hintUsed: boolean;
}

export interface TopicAnalytics {
  topicId: string;
  totalTimeSpentSeconds: number;
  totalInteractions: number;
  quizSuccessRate: number; // 0.0 to 1.0
  arExplorationTimeSeconds: number;
  aiQueriesCount: number;
}
