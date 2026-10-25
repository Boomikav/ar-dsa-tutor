import { MisconceptionDiagnosis } from './misconception';

/**
 * Pedagogical response modes supported by the Tutor Agent.
 */
export type PedagogicalStyle = 'socratic' | 'direct' | 'analogical';

/**
 * Help level requested by the learner or triggered by session state.
 */
export type TutorHelpLevel = 
  | 'hint' 
  | 'explanation' 
  | 'mistake_remediation' 
  | 'general_question'
  | 'operation_walkthrough';

/**
 * Categorized AI Response Types.
 */
export type TutorResponseType = 
  | 'EXPLANATION' 
  | 'HINT' 
  | 'MISTAKE_EXPLANATION' 
  | 'ENCOURAGEMENT' 
  | 'CONCEPT_CHECK' 
  | 'NEXT_STEP';

/**
 * Recommended next action for the student in the interactive engine.
 */
export type TutorNextAction = 
  | 'MOVE_LEFT' 
  | 'MOVE_RIGHT' 
  | 'CONFIRM_INSERT' 
  | 'RETRY_DECISION' 
  | 'REVIEW_INVARIANT' 
  | 'CONTINUE_EXPLORING';

/**
 * Compact, structured student context sent to the AI boundary.
 */
export interface StudentContext {
  fullName: string;
  academicLevel: string;
  preferredStyle: PedagogicalStyle;
  streakDays: number;
}

/**
 * Topic context passed to AI prompt construction.
 */
export interface TopicContext {
  id: string;
  title: string;
  category: 'data-structure' | 'algorithm';
  difficulty: string;
  coreInvariant: string;
  averageTimeComplexity: string;
}

/**
 * Learner state snapshot for the current topic.
 */
export interface LearnerTopicSnapshot {
  masteryPercentage: number;
  confidence: number;
  attemptsCount: number;
  mistakesCount: number;
  needsReview: boolean;
}

/**
 * Active deterministic algorithm operation state.
 * Authority: BSTEngine (The LLM must NOT recalculate or contradict this).
 */
export interface CurrentOperationState {
  operationType: 'insert' | 'search' | 'delete' | 'none' | (string & {});
  targetValue?: number;
  currentNodeValue?: number;
  stepNumber?: number;
  comparisonText?: string;
  deterministicDecision?: string;
  isCompleted?: boolean;
}

/**
 * Structured request sent to the secure backend AI API.
 */
export interface TutorRequest {
  studentContext: StudentContext;
  topicContext: TopicContext;
  learnerState: LearnerTopicSnapshot;
  currentOperation: CurrentOperationState;
  misconception: MisconceptionDiagnosis | null;
  requestedHelpLevel: TutorHelpLevel;
  userQuery?: string;
}

/**
 * Validated, structured response returned by the Tutor Agent / LLM provider.
 */
export interface TutorResponse {
  responseType: TutorResponseType;
  message: string;
  reasoning: string;
  nextAction?: TutorNextAction;
  concept: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  suggestedPrompts: string[];
  isFallback: boolean;
  provider: string;
  model: string;
  timestamp: string;
  latencyMs?: number;
}
