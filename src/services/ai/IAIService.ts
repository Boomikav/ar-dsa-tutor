import { DSATopic } from '../../models/topic';
import { LearnerState } from '../../models/learner';
import { MisconceptionDiagnosis } from '../../models/misconception';
import { TutorRequest, TutorResponse } from '../../models/ai';

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai-tutor' | 'system';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isStreaming?: boolean;
}

export interface AIExplanationRequest {
  topic: DSATopic;
  learnerState: LearnerState;
  specificConceptOrCode?: string;
  userQuery?: string;
  stepContext?: string;
}

export interface AIHintRequest {
  topic: DSATopic;
  currentStepIndex: number;
  userProblemContext?: string;
  currentNodeValue?: number;
  targetValue?: number;
}

export type QuestionCategory = 
  | 'conceptual'
  | 'prediction'
  | 'sequence'
  | 'error_detection'
  | 'operation_reasoning';

export interface DiagnosticQuestion {
  id: string;
  topicId: string;
  category?: QuestionCategory;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

/**
 * Service boundary interface for Generative AI Tutoring.
 * Decouples pedagogical reasoning from underlying LLM / Multi-Agent backends.
 */
export interface IAIService {
  readonly isMock: boolean;
  
  askQuestion(
    question: string,
    topicContext: DSATopic,
    learnerState: LearnerState
  ): Promise<AIMessage>;

  requestHint(request: AIHintRequest): Promise<string>;

  explainConcept(request: AIExplanationRequest): Promise<string>;

  explainMistake(diagnosis: MisconceptionDiagnosis): Promise<string>;

  generateDiagnosticQuestions(
    topic: DSATopic,
    count?: number
  ): Promise<DiagnosticQuestion[]>;

  consultTutor?(request: TutorRequest): Promise<TutorResponse>;
}
