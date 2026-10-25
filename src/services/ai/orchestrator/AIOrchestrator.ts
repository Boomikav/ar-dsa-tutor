import { 
  IAIOrchestrator, 
  EducationalEventType, 
  LearnerAIContext, 
  OrchestrationResult,
  ITutorAgent,
  IMisconceptionAgent,
  IAssessmentAgent,
  IRecommendationAgent
} from '../../../models/multiAgent';
import { TutorAgent } from '../agents/TutorAgent';
import { MisconceptionAgent } from '../agents/MisconceptionAgent';
import { AssessmentAgent } from '../agents/AssessmentAgent';
import { RecommendationAgent } from '../agents/RecommendationAgent';
import { IAIService } from '../IAIService';
import { IAnalyticsService } from '../../analytics/IAnalyticsService';

/**
 * Explicit Multi-Agent AI Orchestrator.
 * 
 * Responsibilities:
 * - Receives educational events from the learning session.
 * - Inspects authoritative learner and DSA operation context.
 * - Applies event-driven activation routing policy (calls only needed agents).
 * - Coordinates sub-agent execution.
 * - Emits telemetry for agent coordination.
 * - Handles graceful fallbacks if network or agents fail.
 * 
 * Strict Invariant:
 * - Does NOT calculate BST algorithmic logic.
 * - Does NOT mutate the learner model directly.
 */
export class AIOrchestrator implements IAIOrchestrator {
  public readonly tutorAgent: ITutorAgent;
  public readonly misconceptionAgent: IMisconceptionAgent;
  public readonly assessmentAgent: IAssessmentAgent;
  public readonly recommendationAgent: IRecommendationAgent;

  private readonly analyticsService: IAnalyticsService;
  private readonly endpoint = '/api/ai/orchestrator';

  constructor(aiService: IAIService, analyticsService: IAnalyticsService) {
    this.analyticsService = analyticsService;
    this.tutorAgent = new TutorAgent(aiService);
    this.misconceptionAgent = new MisconceptionAgent();
    this.assessmentAgent = new AssessmentAgent();
    this.recommendationAgent = new RecommendationAgent();
  }

  async dispatchEducationalEvent(
    eventType: EducationalEventType,
    context: LearnerAIContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    // 1. Telemetry: Record event dispatch
    await this.analyticsService.trackEvent({
      userId: context.studentProfile.fullName,
      topicId: context.topic.id,
      eventType: 'ar_interaction_step',
      payload: {
        actionType: 'ORCHESTRATOR_EVENT_DISPATCHED',
        educationalEvent: eventType,
        currentNode: context.currentOperation?.currentNodeValue,
        targetValue: context.currentOperation?.targetValue
      }
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const resp = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, context }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const result: OrchestrationResult = await resp.json();
        result.executionTimeMs = Date.now() - startTime;
        return result;
      }
    } catch {
      // Fall through to local multi-agent fallback coordination
    }

    return this.fallbackOrchestration(eventType, context, startTime);
  }

  /**
   * Local deterministic multi-agent fallback coordination when backend is offline.
   */
  private async fallbackOrchestration(
    eventType: EducationalEventType,
    context: LearnerAIContext,
    startTime: number
  ): Promise<OrchestrationResult> {
    const activatedAgents: Array<'TutorAgent' | 'MisconceptionAgent' | 'AssessmentAgent' | 'RecommendationAgent'> = [];
    let tutorResponse;
    let misconceptionAnalysis;
    let assessmentQuestion;
    let recommendation;
    let primaryAction = 'CONTINUE_EXPLORING';

    switch (eventType) {
      case 'STUDENT_REQUESTED_HINT':
      case 'STUDENT_REQUESTED_EXPLANATION':
        activatedAgents.push('TutorAgent');
        tutorResponse = await this.tutorAgent.handleRequest(
          context,
          eventType === 'STUDENT_REQUESTED_HINT' ? 'hint' : 'explanation'
        );
        primaryAction = tutorResponse.nextAction || 'CONTINUE_EXPLORING';
        break;

      case 'STUDENT_MADE_MISTAKE':
        activatedAgents.push('TutorAgent');
        tutorResponse = await this.tutorAgent.handleRequest(context, 'mistake_remediation');
        primaryAction = tutorResponse.nextAction || 'RETRY_DECISION';
        break;

      case 'REPEATED_MISCONCEPTION':
        activatedAgents.push('MisconceptionAgent', 'AssessmentAgent', 'TutorAgent', 'RecommendationAgent');
        const [mRes, aRes, tRes, rRes] = await Promise.all([
          (this.misconceptionAgent as MisconceptionAgent).fallbackAnalysis(context),
          (this.assessmentAgent as AssessmentAgent).fallbackAssessment(context),
          this.tutorAgent.handleRequest(context, 'mistake_remediation'),
          (this.recommendationAgent as RecommendationAgent).fallbackRecommendation(context)
        ]);
        misconceptionAnalysis = mRes;
        assessmentQuestion = aRes;
        tutorResponse = tRes;
        recommendation = rRes;
        primaryAction = 'REVIEW_INVARIANT';
        break;

      case 'TOPIC_COMPLETED':
        activatedAgents.push('AssessmentAgent', 'RecommendationAgent');
        const [assRes, recRes] = await Promise.all([
          (this.assessmentAgent as AssessmentAgent).fallbackAssessment(context),
          (this.recommendationAgent as RecommendationAgent).fallbackRecommendation(context)
        ]);
        assessmentQuestion = assRes;
        recommendation = recRes;
        primaryAction = 'MOVE_TO_NEXT_CONCEPT';
        break;

      case 'ASSESSMENT_REQUIRED':
        activatedAgents.push('AssessmentAgent');
        assessmentQuestion = (this.assessmentAgent as AssessmentAgent).fallbackAssessment(context);
        primaryAction = 'COMPLETE_ASSESSMENT';
        break;

      case 'LEARNING_PATH_DECISION_REQUIRED':
        activatedAgents.push('RecommendationAgent');
        recommendation = (this.recommendationAgent as RecommendationAgent).fallbackRecommendation(context);
        primaryAction = recommendation.recommendationType;
        break;

      default:
        activatedAgents.push('TutorAgent');
        tutorResponse = await this.tutorAgent.handleRequest(context, 'explanation');
        primaryAction = tutorResponse.nextAction || 'CONTINUE_EXPLORING';
        break;
    }

    return {
      eventId: `fallback-${Date.now()}`,
      eventType,
      activatedAgents,
      primaryAction,
      tutorResponse,
      misconceptionAnalysis,
      assessmentQuestion,
      recommendation,
      executionTimeMs: Date.now() - startTime,
      isFallback: true,
      timestamp: new Date().toISOString()
    };
  }
}
