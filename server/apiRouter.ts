import { IncomingMessage, ServerResponse } from 'node:http';
import { TutorRequest } from '../src/models/ai';
import { ILLMProvider } from './providers/ILLMProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { MockProvider } from './providers/MockProvider';
import { loadServerEnv, getGeminiApiKey } from './env';

/**
 * Creates the active LLM provider based on server environment.
 */
export function createActiveProvider(): ILLMProvider {
  loadServerEnv();
  const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = getGeminiApiKey();
  if (providerType === 'gemini' && apiKey) {
    return new GeminiProvider();
  }
  // If provider is mock or no GEMINI_API_KEY is configured
  return new MockProvider();
}

export function getActiveProvider(): ILLMProvider {
  return createActiveProvider();
}

/**
 * Reads and parses JSON payload from Node IncomingMessage.
 */
function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 512 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', err => reject(err));
  });
}

/**
 * Handles server-side AI API routing.
 * Returns true if the request was handled, or false if it should pass through to next middleware.
 */
export async function handleAiApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  const provider = getActiveProvider();

  // 1. Health check endpoint: GET /api/ai/health
  if (url === '/api/ai/health' || url.startsWith('/api/ai/health?')) {
    const isAvail = await provider.isAvailable();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      activeProvider: provider.providerName,
      defaultModel: provider.defaultModel,
      isConfigured: isAvail,
      timestamp: new Date().toISOString()
    }));
    return true;
  }

  // 2. Main Tutor endpoint: POST /api/ai/tutor
  if (url === '/api/ai/tutor') {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return true;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return true;
    }

    try {
      const body = await readJsonBody(req);
      const tutorRequest = body as TutorRequest;

      if (!tutorRequest || !tutorRequest.topicContext || !tutorRequest.studentContext) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required studentContext or topicContext' }));
        return true;
      }

      const tutorResponse = await provider.generateTutorResponse(tutorRequest);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(tutorResponse));
      return true;
    } catch (err: any) {
      console.error('[API Router] Error processing /api/ai/tutor:', err.message);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
      return true;
    }
  }

  // 3. Multi-Agent Orchestrator endpoint: POST /api/ai/orchestrator
  if (url === '/api/ai/orchestrator') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return true;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return true;
    }

    const startTime = Date.now();

    try {
      const body = await readJsonBody(req);
      const { eventType, context } = body;

      if (!eventType || !context) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required eventType or context' }));
        return true;
      }

      // Convert shared context to TutorRequest for TutorAgent
      const tutorRequest: TutorRequest = {
        studentContext: {
          fullName: context.studentProfile?.fullName || 'Student',
          academicLevel: context.studentProfile?.academicLevel || 'Undergraduate',
          preferredStyle: context.studentProfile?.preferredStyle || 'socratic',
          streakDays: context.studentProfile?.dailyStreak || 1
        },
        topicContext: {
          id: context.topic?.id || 'ds-binary-search-tree',
          title: context.topic?.title || 'Binary Search Tree',
          category: context.topic?.category || 'data-structure',
          difficulty: context.topic?.difficulty || 'Intermediate',
          coreInvariant: context.topic?.coreInvariant || 'Left < Root < Right',
          averageTimeComplexity: context.topic?.averageTimeComplexity || 'O(log N)'
        },
        learnerState: {
          masteryPercentage: context.masterySnapshot?.masteryPercentage ?? 0,
          confidence: context.masterySnapshot?.confidence ?? 0.3,
          attemptsCount: context.masterySnapshot?.attemptsCount ?? 0,
          mistakesCount: context.masterySnapshot?.mistakesCount ?? 0,
          needsReview: context.masterySnapshot?.needsReview ?? false
        },
        currentOperation: context.currentOperation || {
          operationType: 'none',
          isCompleted: false
        },
        misconception: context.activeMisconception || null,
        requestedHelpLevel: eventType === 'STUDENT_REQUESTED_HINT' 
          ? 'hint' 
          : eventType === 'STUDENT_MADE_MISTAKE' || eventType === 'REPEATED_MISCONCEPTION'
          ? 'mistake_remediation'
          : 'explanation'
      };

      const activatedAgents: Array<'TutorAgent' | 'MisconceptionAgent' | 'AssessmentAgent' | 'RecommendationAgent'> = [];
      let tutorResp;
      let miscAnalysis;
      let assessmentQ;
      let recommendation;
      let primaryAction = 'CONTINUE_EXPLORING';

      // Event-driven Agent Activation Routing Policy
      switch (eventType) {
        case 'STUDENT_REQUESTED_HINT':
        case 'STUDENT_REQUESTED_EXPLANATION':
          activatedAgents.push('TutorAgent');
          tutorResp = await provider.generateTutorResponse(tutorRequest);
          primaryAction = tutorResp.nextAction || 'CONTINUE_EXPLORING';
          break;

        case 'STUDENT_MADE_MISTAKE':
          activatedAgents.push('TutorAgent');
          tutorResp = await provider.generateTutorResponse(tutorRequest);
          primaryAction = tutorResp.nextAction || 'RETRY_DECISION';
          break;

        case 'REPEATED_MISCONCEPTION':
          activatedAgents.push('MisconceptionAgent', 'AssessmentAgent', 'TutorAgent', 'RecommendationAgent');
          const [mRes, aRes, tRes, rRes] = await Promise.all([
            provider.generateMisconceptionAnalysis(context),
            provider.generateAssessmentQuestion(context),
            provider.generateTutorResponse(tutorRequest),
            provider.generateRecommendation(context)
          ]);
          miscAnalysis = mRes;
          assessmentQ = aRes;
          tutorResp = tRes;
          recommendation = rRes;
          primaryAction = 'REVIEW_INVARIANT';
          break;

        case 'TOPIC_COMPLETED':
          activatedAgents.push('AssessmentAgent', 'RecommendationAgent');
          const [assDone, recDone] = await Promise.all([
            provider.generateAssessmentQuestion(context),
            provider.generateRecommendation(context)
          ]);
          assessmentQ = assDone;
          recommendation = recDone;
          primaryAction = 'MOVE_TO_NEXT_CONCEPT';
          break;

        case 'ASSESSMENT_REQUIRED':
          activatedAgents.push('AssessmentAgent');
          assessmentQ = await provider.generateAssessmentQuestion(context);
          primaryAction = 'COMPLETE_ASSESSMENT';
          break;

        case 'LEARNING_PATH_DECISION_REQUIRED':
          activatedAgents.push('RecommendationAgent');
          recommendation = await provider.generateRecommendation(context);
          primaryAction = recommendation.recommendationType;
          break;

        default:
          activatedAgents.push('TutorAgent');
          tutorResp = await provider.generateTutorResponse(tutorRequest);
          primaryAction = tutorResp.nextAction || 'CONTINUE_EXPLORING';
          break;
      }

      const orchestrationResult = {
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventType,
        activatedAgents,
        primaryAction,
        tutorResponse: tutorResp,
        misconceptionAnalysis: miscAnalysis,
        assessmentQuestion: assessmentQ,
        recommendation,
        executionTimeMs: Date.now() - startTime,
        isFallback: Boolean(tutorResp?.isFallback || miscAnalysis?.isFallback || assessmentQ?.isFallback || recommendation?.isFallback),
        timestamp: new Date().toISOString()
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(orchestrationResult));
      return true;
    } catch (err: any) {
      console.error('[API Router] Error processing /api/ai/orchestrator:', err.message);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error in Orchestrator',
        message: err.message
      }));
      return true;
    }
  }

  return false;
}
