/**
 * Generalized DSA Learning Engine Interface.
 * 
 * Provides a uniform, deterministic architectural contract across all 20 Tier-1 DSA topics.
 * Each engine is the authoritative source of truth for:
 * - Algorithmic state & invariants
 * - Step evaluation and misconception diagnosis
 * - Guided walkthrough steps
 * - Interactive practice sessions
 * 
 * Generative AI and LLMs consume this state for pedagogical advice,
 * but NEVER calculate or mutate algorithmic state.
 */

import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export type VisualizationCapability = 'AR_READY' | '3D_READY' | '2D_READY' | 'SPECIFICATION_ONLY';

export interface DSAOperationResult<TState = any> {
  success: boolean;
  newState: TState;
  stepDescription: string;
  isTerminal?: boolean;
  misconception?: MisconceptionDiagnosis;
}

export interface StepValidationResult {
  isCorrect: boolean;
  expectedChoice: any;
  userChoice: any;
  misconception?: MisconceptionDiagnosis;
  feedbackMessage: string;
}

export interface DSAGuidedStep<TState = any> {
  stepIndex: number;
  title: string;
  description: string;
  stateSnapshot: TState;
  invariantExplanation: string;
  highlightedIndices?: number[];
  highlightedKeys?: (string | number)[];
}

export interface DSAPracticeStepDecision {
  stepIndex: number;
  prompt: string;
  userChoice: string | number | boolean;
  expectedChoice: string | number | boolean;
  isCorrect: boolean;
  misconception?: MisconceptionDiagnosis;
  timestamp: string;
}

export interface DSAPracticeSession<TState = any> {
  sessionId: string;
  topicId: string;
  difficulty: AdaptiveDifficultyLevel;
  target?: string | number;
  currentState: TState;
  stepIndex: number;
  maxSteps: number;
  decisionsMade: DSAPracticeStepDecision[];
  isComplete: boolean;
  isSuccess: boolean;
  mistakesCount: number;
}

export interface IDSALearningEngine<TState = any, TOperation = any> {
  readonly topicId: string;
  readonly topicTitle: string;
  readonly category: 'data-structure' | 'algorithm';
  readonly visualizationCapability: VisualizationCapability;

  /**
   * Generates or resets the initial deterministic state.
   */
  getInitialState(seed?: any): TState;

  /**
   * Enumerates valid operations permitted on the current state.
   */
  getAvailableOperations(state: TState): string[];

  /**
   * Applies an authoritative operation to transition state.
   */
  applyOperation(state: TState, operation: TOperation): DSAOperationResult<TState>;

  /**
   * Deterministically validates a learner's decision against invariant rules.
   */
  validateStep(state: TState, userChoice: any, expectedChoice?: any): StepValidationResult;

  /**
   * Returns presentation/rendering data for 2D/3D visualizers.
   */
  getVisualizationData(state: TState): any;

  /**
   * Precomputes step-by-step guided demonstration steps.
   */
  getGuidedSteps?(initialState?: TState): DSAGuidedStep<TState>[];

  /**
   * Initializes an interactive practice session adapted to difficulty.
   */
  startPracticeSession?(difficulty?: AdaptiveDifficultyLevel, seed?: any): DSAPracticeSession<TState>;

  /**
   * Authoritatively evaluates a practice step, returning updated session & feedback.
   */
  evaluatePracticeStep?(
    session: DSAPracticeSession<TState>,
    userDecision: any
  ): {
    updatedSession: DSAPracticeSession<TState>;
    validation: StepValidationResult;
  };
}
