import { AnalyticsEvent, QuizAttempt, TopicAnalytics } from '../../models/analytics';

/**
 * Service boundary interface for Learning Analytics and Telemetry.
 */
export interface IAnalyticsService {
  readonly isMock: boolean;

  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void>;

  recordQuizAttempt(attempt: Omit<QuizAttempt, 'attemptId'>): Promise<void>;

  getTopicAnalytics(topicId: string): Promise<TopicAnalytics>;

  getRecentEvents(limit?: number): Promise<AnalyticsEvent[]>;
}
