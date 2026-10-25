/**
 * Deterministic Linear Search Learning Engine.
 * 
 * Implements step-by-step sequential inspection, pointer advancement,
 * best-case O(1) vs worst-case O(N) evaluation, and search misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';

export interface LinearSearchState {
  array: number[];
  target: number;
  currentIndex: number;
  foundIndex: number | null;
  isComplete: boolean;
  comparisonsCount: number;
  lastAction: string;
}

export class LinearSearchEngine implements IDSALearningEngine<LinearSearchState, { type: 'STEP' | 'RESET'; target?: number }> {
  readonly topicId = 'algo-linear-search';
  readonly topicTitle = 'Linear Search';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { array?: number[]; target?: number }): LinearSearchState {
    return {
      array: seed?.array ?? [23, 8, 42, 16, 4, 15],
      target: seed?.target ?? 16,
      currentIndex: 0,
      foundIndex: null,
      isComplete: false,
      comparisonsCount: 0,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: LinearSearchState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP', 'RESET'];
  }

  applyOperation(state: LinearSearchState, operation: { type: 'STEP' | 'RESET'; target?: number }): DSAOperationResult<LinearSearchState> {
    if (operation.type === 'RESET') {
      return {
        success: true,
        newState: this.getInitialState({ target: operation.target ?? state.target }),
        stepDescription: 'Reset search pointer to index 0.'
      };
    }

    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Search already completed.' };
    }

    const currVal = state.array[state.currentIndex];
    const isMatch = currVal === state.target;
    const nextIdx = state.currentIndex + 1;
    const isEnd = isMatch || nextIdx >= state.array.length;

    const newState: LinearSearchState = {
      ...state,
      foundIndex: isMatch ? state.currentIndex : null,
      isComplete: isEnd,
      comparisonsCount: state.comparisonsCount + 1,
      currentIndex: isMatch ? state.currentIndex : (isEnd ? state.currentIndex : nextIdx),
      lastAction: isMatch ? `FOUND_AT_${state.currentIndex}` : `CHECKED_${state.currentIndex}`
    };

    return {
      success: true,
      newState,
      stepDescription: isMatch
        ? `Target ${state.target} matches element at index ${state.currentIndex}! Search successful in ${newState.comparisonsCount} comparisons.`
        : `Element ${currVal} at index ${state.currentIndex} != target ${state.target}. Advancing to index ${nextIdx}.`
    };
  }

  validateStep(state: LinearSearchState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-ls-${Date.now()}`,
        type: 'LINEAR_SEARCH_SKIP_ELEMENT',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `In Linear Search without prior sorting, elements must be examined sequentially without skipping.`,
        correctiveGuidance: 'Check array[i] against target before advancing index by 1.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid sequential comparison.' : 'Sequential search order violated.'
    };
  }

  getVisualizationData(state: LinearSearchState): any {
    return {
      type: 'SEARCH_LINEAR',
      array: state.array,
      target: state.target,
      currentIndex: state.currentIndex,
      foundIndex: state.foundIndex,
      isComplete: state.isComplete
    };
  }
}
