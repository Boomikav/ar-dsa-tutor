import { IAnalyticsService } from './IAnalyticsService';
import { AnalyticsEvent, QuizAttempt, TopicAnalytics } from '../../models/analytics';

/**
 * Local implementation of IAnalyticsService.
 * Captures telemetry in-memory with diagnostic logs, preparing for cloud ingestion.
 */
export class LocalAnalyticsService implements IAnalyticsService {
  readonly isMock = true;
  private events: AnalyticsEvent[] = [];
  private quizAttempts: QuizAttempt[] = [];

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.events.unshift(fullEvent);
    // Keep bounded in memory
    if (this.events.length > 500) this.events.pop();

    // Telemetry trace log
    console.debug(`[AnalyticsService:Telemetry]`, fullEvent.eventType, fullEvent.payload);
  }

  async recordQuizAttempt(attempt: Omit<QuizAttempt, 'attemptId'>): Promise<void> {
    const fullAttempt: QuizAttempt = {
      ...attempt,
      attemptId: `att-${Date.now()}`
    };
    this.quizAttempts.unshift(fullAttempt);
    await this.trackEvent({
      userId: 'student-usr-4092',
      topicId: attempt.topicId,
      eventType: 'quiz_attempt',
      payload: {
        isCorrect: attempt.isCorrect,
        responseTimeMs: attempt.responseTimeMs,
        questionId: attempt.questionId
      }
    });
  }

  async getTopicAnalytics(topicId: string): Promise<TopicAnalytics> {
    const attempts = this.quizAttempts.filter(a => a.topicId === topicId);
    const correct = attempts.filter(a => a.isCorrect).length;
    const rate = attempts.length > 0 ? correct / attempts.length : 0.8;

    return {
      topicId,
      totalTimeSpentSeconds: 1200,
      totalInteractions: 34,
      quizSuccessRate: rate,
      arExplorationTimeSeconds: 420,
      aiQueriesCount: 6
    };
  }

  async getRecentEvents(limit: number = 20): Promise<AnalyticsEvent[]> {
    return this.events.slice(0, limit);
  }
}
