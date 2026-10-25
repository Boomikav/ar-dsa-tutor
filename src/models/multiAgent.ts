import { TutorResponse, PedagogicalStyle } from './ai';
import { MisconceptionDiagnosis } from './misconception';

/**
 * Explicit educational events that trigger specialized agent activation.
 */
export type EducationalEventType = 
  | 'STUDENT_REQUESTED_HINT'
  | 'STUDENT_REQUESTED_EXPLANATION'
  | 'STUDENT_MADE_MISTAKE'
  | 'REPEATED_MISCONCEPTION'
  | 'ASSESSMENT_REQUIRED'
  | 'TOPIC_MASTERY_CHANGED'
  | 'TOPIC_COMPLETED'
  | 'LEARNING_PATH_DECISION_REQUIRED';

/**
 * Shared, structured learner AI context provided to all specialized agents.
 * Centralized to prevent duplicated context assembly across agents.
 */
export interface LearnerAIContext {
  studentProfile: {
    fullName: string;
    academicLevel: string;
    preferredStyle: PedagogicalStyle;
    dailyStreak: number;
  };
  topic: {
    id: string;
    title: string;
    category: 'data-structure' | 'algorithm';
    difficulty: string;
    coreInvariant: string;
    averageTimeComplexity: string;
    prerequisites: string[];
  };
  masterySnapshot: {
    masteryPercentage: number;
    confidence: number;
    attemptsCount: number;
    mistakesCount: number;
    needsReview: boolean;
  };
  currentOperation?: {
    operationType: 'insert' | 'search' | 'delete' | 'none' | (string & {});
    targetValue?: number;
    currentNodeValue?: number;
    stepNumber?: number;
    comparisonText?: string;
    deterministicDecision?: string;
    isCompleted?: boolean;
  };
  activeMisconception?: MisconceptionDiagnosis | null;
  misconceptionHistory: Array<{
    type: string;
    userChoice: string;
    expectedChoice: string;
    currentNodeValue?: number | string;
    targetValue?: number | string;
    timestamp: string;
  }>;
  recentAnalyticsSummary: {
    recentInteractionsCount: number;
    recentAccuracyRate: number;
    repeatedErrorCount: number;
  };
  adaptiveContext?: {
    currentDifficulty?: string;
    independentSuccessRate?: number;
    masteryTrend?: string;
    needsReviewReasons?: string[];
  };
}

/**
 * Structured output produced by the Misconception Agent.
 */
export interface MisconceptionAnalysisResult {
  misconceptionDetected: boolean;
  misconceptionType?: string;
  recurrence: 'FIRST_OCCURRENCE' | 'REPEATED' | 'CHRONIC' | 'RESOLVED' | 'NONE';
  confidence: number;
  evidence: string[];
  recommendedIntervention: string;
  rootCauseAnalysis?: string;
  timestamp: string;
  isFallback: boolean;
}

/**
 * Structured output produced by the Assessment Agent.
 */
export interface GeneratedAssessmentQuestion {
  questionType: 'multiple_choice' | 'conceptual_check' | 'directional_prediction' | 'invariant_verification';
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  expectedSkill: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  explanationRequired: boolean;
  topicId: string;
  timestamp: string;
  isFallback: boolean;
}

/**
 * Structured output produced by the Recommendation Agent.
 */
export interface LearningRecommendationResult {
  recommendationType: 
    | 'REVIEW_PREREQUISITE' 
    | 'REPEAT_CURRENT_CONCEPT' 
    | 'ATTEMPT_EASIER_EXERCISE' 
    | 'ATTEMPT_HARDER_EXERCISE' 
    | 'SPACED_REPETITION' 
    | 'AR_SPATIAL_PRACTICE' 
    | 'MOVE_TO_NEXT_CONCEPT';
  targetTopicId: string;
  targetTopicTitle: string;
  rationale: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  isFallback: boolean;
}

/**
 * Combined orchestration result returned by the AIOrchestrator.
 */
export interface OrchestrationResult {
  eventId: string;
  eventType: EducationalEventType;
  activatedAgents: Array<'TutorAgent' | 'MisconceptionAgent' | 'AssessmentAgent' | 'RecommendationAgent'>;
  primaryAction: string;
  tutorResponse?: TutorResponse;
  misconceptionAnalysis?: MisconceptionAnalysisResult;
  assessmentQuestion?: GeneratedAssessmentQuestion;
  recommendation?: LearningRecommendationResult;
  executionTimeMs: number;
  isFallback: boolean;
  timestamp: string;
}

/**
 * Agent boundary interfaces (Provider-independent).
 */
export interface ITutorAgent {
  readonly agentName: 'TutorAgent';
  handleRequest(context: LearnerAIContext, requestedHelp?: string): Promise<TutorResponse>;
}

export interface IMisconceptionAgent {
  readonly agentName: 'MisconceptionAgent';
  analyzeMisconception(context: LearnerAIContext): Promise<MisconceptionAnalysisResult>;
}

export interface IAssessmentAgent {
  readonly agentName: 'AssessmentAgent';
  generateDiagnosticQuestion(context: LearnerAIContext): Promise<GeneratedAssessmentQuestion>;
}

export interface IRecommendationAgent {
  readonly agentName: 'RecommendationAgent';
  recommendNextStep(context: LearnerAIContext): Promise<LearningRecommendationResult>;
}

export interface IAIOrchestrator {
  dispatchEducationalEvent(
    eventType: EducationalEventType,
    context: LearnerAIContext
  ): Promise<OrchestrationResult>;
}
