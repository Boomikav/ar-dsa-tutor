import { IAIService, AIMessage, AIExplanationRequest, AIHintRequest, DiagnosticQuestion } from './IAIService';
import { DSATopic } from '../../models/topic';
import { LearnerState } from '../../models/learner';
import { MisconceptionDiagnosis } from '../../models/misconception';
import { TutorRequest, TutorResponse } from '../../models/ai';
import { LearnerContextBuilder } from './LearnerContextBuilder';
import { AIResponseValidator } from './AIResponseValidator';
import { MockAIService } from './MockAIService';
import { IAnalyticsService } from '../analytics/IAnalyticsService';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Secure Generative AI Service.
 * Frontend client implementation of IAIService.
 * 
 * Invariants:
 * - NO API keys or secrets are present in this service.
 * - Communicates strictly via the backend boundary: POST /api/ai/tutor.
 * - If backend or network is unavailable, falls back gracefully to MockAIService.
 * - Emits safe educational telemetry events to IAnalyticsService.
 */
export class SecureAIService implements IAIService {
  readonly isMock = false;
  private readonly fallbackMockService = new MockAIService();
  private readonly analyticsService: IAnalyticsService;
  private readonly apiEndpoint = API_ENDPOINTS.aiTutor;

  constructor(analyticsService: IAnalyticsService) {
    this.analyticsService = analyticsService;
  }

  /**
   * Primary method to consult the Generative AI Tutor with full educational context.
   */
  async consultTutor(tutorRequest: TutorRequest): Promise<TutorResponse> {
    const startTime = Date.now();

    // 1. Record telemetry for outgoing AI request (safe metadata only)
    this.analyticsService.trackEvent({
      userId: tutorRequest.studentContext.fullName,
      topicId: tutorRequest.topicContext.id,
      eventType: 'ai_prompt_sent',
      payload: {
        actionType: 'AI_TUTOR_REQUEST',
        stepNumber: tutorRequest.currentOperation?.stepNumber || 0
      }
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const rawJson = await response.json();

      // Validate schema on the client side as defense-in-depth
      const validation = AIResponseValidator.validate(
        rawJson,
        rawJson.provider || 'server-ai',
        rawJson.model || 'gemini',
        tutorRequest.topicContext.coreInvariant
      );

      const validated = validation.validatedResponse;
      validated.latencyMs = Date.now() - startTime;

      // 2. Record telemetry for successful AI response
      this.analyticsService.trackEvent({
        userId: tutorRequest.studentContext.fullName,
        topicId: tutorRequest.topicContext.id,
        eventType: 'ai_prompt_sent',
        payload: {
          actionType: 'AI_TUTOR_RESPONSE',
          durationSeconds: Math.round(validated.latencyMs / 1000)
        }
      });

      return validated;
    } catch (err: any) {
      console.warn(`[SecureAIService] Backend call failed (${err.message}). Activating local Mock fallback.`);

      // 3. Record fallback telemetry event
      this.analyticsService.trackEvent({
        userId: tutorRequest.studentContext.fullName,
        topicId: tutorRequest.topicContext.id,
        eventType: 'ai_prompt_sent',
        payload: {
          actionType: 'AI_TUTOR_FALLBACK',
          durationSeconds: Math.round((Date.now() - startTime) / 1000),
          reason: err.message
        }
      });

      return this.generateClientFallback(tutorRequest, err.message, Date.now() - startTime);
    }
  }

  /**
   * Generates a safe, structured fallback response when network/server is unavailable.
   */
  private generateClientFallback(
    request: TutorRequest,
    errorReason: string,
    latencyMs: number
  ): TutorResponse {
    const { studentContext, currentOperation, misconception, requestedHelpLevel } = request;
    const style = studentContext.preferredStyle;

    let message = '';
    let reasoning = '';
    let nextAction: TutorResponse['nextAction'] = 'CONTINUE_EXPLORING';

    if (misconception || requestedHelpLevel === 'mistake_remediation') {
      const target = currentOperation.targetValue ?? 40;
      const node = currentOperation.currentNodeValue ?? 50;
      const expected = misconception?.expectedChoice || 'LEFT';

      if (style === 'socratic') {
        message = `[Fallback] Compare ${target} and ${node}. Is ${target} less than ${node}? Remember which branch stores smaller items.`;
        reasoning = `Socratic invariant check. (Offline Fallback)`;
        nextAction = 'RETRY_DECISION';
      } else {
        message = `[Fallback] Because ${target} is less than ${node}, you must branch to the ${expected} subtree.`;
        reasoning = `Direct ordering rule. (Offline Fallback)`;
        nextAction = expected === 'LEFT' ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      }
    } else if (requestedHelpLevel === 'hint') {
      const target = currentOperation.targetValue;
      const node = currentOperation.currentNodeValue;
      if (style === 'socratic') {
        message = `[Fallback] Compare target ${target ?? 'value'} with node ${node ?? 'key'}. Which subtree holds values smaller than ${node ?? 'key'}?`;
        reasoning = `Socratic invariant hint. (Offline Fallback)`;
        nextAction = target && node && target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      } else if (style === 'analogical') {
        message = `[Fallback] Imagine a hiking trail branching at elevation ${node ?? 'key'}. For elevation ${target ?? 'value'}, which branch do you follow?`;
        reasoning = `Analogical spatial hint. (Offline Fallback)`;
        nextAction = target && node && target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      } else {
        message = `[Fallback] Compare target ${target ?? 'value'} with node ${node ?? 'key'}. Remember: Left < Node < Right.`;
        reasoning = `Invariant hint. (Offline Fallback)`;
        nextAction = target && node && target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      }
    } else {
      message = `[Fallback] In ${request.topicContext.title}, elements are hierarchically partitioned to guarantee average O(log N) operations.`;
      reasoning = `General definition. (Offline Fallback: ${errorReason})`;
    }

    return {
      responseType: misconception ? 'MISTAKE_EXPLANATION' : requestedHelpLevel === 'hint' ? 'HINT' : 'EXPLANATION',
      message,
      reasoning,
      nextAction,
      concept: request.topicContext.coreInvariant,
      difficulty: 'INTERMEDIATE',
      suggestedPrompts: ['Explain more simply', 'Show me an example'],
      isFallback: true,
      provider: 'client-offline-fallback',
      model: 'rule-based-mock',
      timestamp: new Date().toISOString(),
      latencyMs
    };
  }

  // --- IAIService Contract Implementation ---

  async askQuestion(
    question: string,
    topicContext: DSATopic,
    learnerState: LearnerState
  ): Promise<AIMessage> {
    const request = LearnerContextBuilder.buildRequest({
      topic: topicContext,
      learnerState,
      helpLevel: 'general_question',
      userQuery: question
    });

    const response = await this.consultTutor(request);

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai-tutor',
      content: response.message,
      timestamp: response.timestamp,
      suggestedQuestions: response.suggestedPrompts
    };
  }

  async requestHint(request: AIHintRequest): Promise<string> {
    this.analyticsService.trackEvent({
      userId: 'Student',
      topicId: request.topic.id,
      eventType: 'ai_prompt_sent',
      payload: {
        actionType: 'AI_HINT_REQUEST',
        stepNumber: request.currentStepIndex
      }
    });

    const tutorReq = LearnerContextBuilder.buildRequest({
      topic: request.topic,
      learnerState: {
        profile: {
          id: 'u1',
          fullName: 'Student',
          username: 'student',
          academicLevel: 'Undergraduate',
          preferredLearningPace: 'visual-first',
          enrolledAt: new Date().toISOString(),
          arPreferences: { enablePlaneOverlay: true, autoRotate3D: false, spatialAudio: false, renderQuality: 'medium' },
          aiPreferences: { tutoringStyle: 'socratic', verbosity: 'concise' }
        },
        masteryMap: {},
        history: {
          totalStudyMinutes: 0,
          totalSessions: 0,
          completedTopicIds: [],
          inProgressTopicIds: [],
          dailyStreak: 1,
          lastActiveTimestamp: new Date().toISOString(),
          assessmentHistory: []
        },
        currentGoalTopicId: request.topic.id
      },
      helpLevel: 'hint',
      currentOperation: {
        operationType: 'insert',
        targetValue: request.targetValue,
        currentNodeValue: request.currentNodeValue,
        stepNumber: request.currentStepIndex
      }
    });

    const response = await this.consultTutor(tutorReq);
    return response.message;
  }

  async explainConcept(request: AIExplanationRequest): Promise<string> {
    const tutorReq = LearnerContextBuilder.buildRequest({
      topic: request.topic,
      learnerState: request.learnerState,
      helpLevel: 'explanation',
      userQuery: request.userQuery
    });

    const response = await this.consultTutor(tutorReq);
    return `### ${response.concept}\n\n${response.message}\n\n**Pedagogical Rationale**: ${response.reasoning}`;
  }

  async explainMistake(diagnosis: MisconceptionDiagnosis): Promise<string> {
    this.analyticsService.trackEvent({
      userId: 'Student',
      topicId: 'ds-binary-search-tree',
      eventType: 'ai_prompt_sent',
      payload: {
        actionType: 'AI_MISTAKE_EXPLANATION',
        stepNumber: 0
      }
    });

    const tutorReq = LearnerContextBuilder.buildRequest({
      topic: {
        id: 'ds-binary-search-tree',
        slug: 'binary-search-tree',
        title: 'Binary Search Tree',
        category: 'data-structure',
        difficulty: 'Intermediate',
        shortDescription: 'BST node insertion and search',
        detailedConcept: 'Ordering invariant: Left < Root < Right',
        learningObjectives: ['Understand BST ordering invariant', 'Trace insertion'],
        prerequisites: [],
        visualSpec: { hasArModel: true },
        estimatedMinutes: 15,
        tags: ['tree', 'bst'],
        orderIndex: 6
      },
      learnerState: {
        profile: {
          id: 'u1',
          fullName: 'Student',
          username: 'student',
          academicLevel: 'Undergraduate',
          preferredLearningPace: 'visual-first',
          enrolledAt: new Date().toISOString(),
          arPreferences: { enablePlaneOverlay: true, autoRotate3D: false, spatialAudio: false, renderQuality: 'medium' },
          aiPreferences: { tutoringStyle: 'socratic', verbosity: 'concise' }
        },
        masteryMap: {},
        history: {
          totalStudyMinutes: 0,
          totalSessions: 0,
          completedTopicIds: [],
          inProgressTopicIds: [],
          dailyStreak: 1,
          lastActiveTimestamp: new Date().toISOString(),
          assessmentHistory: []
        }
      },
      helpLevel: 'mistake_remediation',
      misconception: diagnosis,
      currentOperation: {
        operationType: 'insert',
        targetValue: typeof diagnosis.targetValue === 'number' ? diagnosis.targetValue : (diagnosis.targetValue ? Number(diagnosis.targetValue) || undefined : undefined),
        currentNodeValue: typeof diagnosis.currentNodeValue === 'number' ? diagnosis.currentNodeValue : (diagnosis.currentNodeValue ? Number(diagnosis.currentNodeValue) || undefined : undefined),
        deterministicDecision: diagnosis.expectedChoice
      }
    });

    const response = await this.consultTutor(tutorReq);
    return `### Pedagogical Diagnosis: ${diagnosis.type}\n\n${response.message}\n\n**Corrective Guidance**: ${diagnosis.correctiveGuidance}\n\n*Rationale: ${response.reasoning}*`;
  }

  async generateDiagnosticQuestions(topic: DSATopic, count: number = 5): Promise<DiagnosticQuestion[]> {
    // Diagnostic questions use the authoritative curriculum question bank
    return this.fallbackMockService.generateDiagnosticQuestions(topic, count);
  }
}
