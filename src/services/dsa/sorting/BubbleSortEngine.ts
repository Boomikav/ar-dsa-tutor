/**
 * Deterministic Bubble Sort Learning Engine (Demonstration 2).
 * 
 * Implements adjacent comparison sorting:
 * Step-by-step element bubbling, swap decisions, sorted suffix boundaries,
 * early termination on zero swaps, and observable swap misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface BubbleSortState {
  array: number[];
  i: number; // pass index
  j: number; // current comparison index
  swappedInPass: boolean;
  isComplete: boolean;
  sortedSuffixCount: number;
  comparisonsCount: number;
  swapsCount: number;
  lastAction: string;
}

export type SortDecision = 'SWAP' | 'NO_SWAP';

export class BubbleSortEngine implements IDSALearningEngine<BubbleSortState, { type: 'STEP' | 'DECIDE'; decision?: SortDecision }> {
  readonly topicId = 'algo-bubble-sort';
  readonly topicTitle = 'Bubble Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: number[]): BubbleSortState {
    return {
      array: seed ?? [50, 20, 40, 10, 30],
      i: 0,
      j: 0,
      swappedInPass: false,
      isComplete: false,
      sortedSuffixCount: 0,
      comparisonsCount: 0,
      swapsCount: 0,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: BubbleSortState): string[] {
    return state.isComplete ? ['RESET'] : ['SWAP', 'NO_SWAP'];
  }

  getExpectedDecision(state: BubbleSortState): SortDecision {
    if (state.isComplete || state.j >= state.array.length - 1 - state.i) return 'NO_SWAP';
    return state.array[state.j] > state.array[state.j + 1] ? 'SWAP' : 'NO_SWAP';
  }

  applyOperation(state: BubbleSortState, operation: { type: 'STEP' | 'DECIDE'; decision?: SortDecision }): DSAOperationResult<BubbleSortState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Bubble Sort already complete.' };
    }

    const arr = [...state.array];
    const expected = this.getExpectedDecision(state);
    const chosen = operation.decision ?? expected;

    // Validate decision
    if (chosen !== expected) {
      const leftVal = arr[state.j];
      const rightVal = arr[state.j + 1];
      const misconception: MisconceptionDiagnosis = {
        id: `diag-sort-${Date.now()}`,
        type: 'SORT_WRONG_SWAP',
        topicId: this.topicId,
        targetValue: rightVal,
        currentNodeValue: leftVal,
        userChoice: chosen,
        expectedChoice: expected,
        pedagogicalExplanation: expected === 'SWAP'
          ? `In ascending sort, ${leftVal} > ${rightVal} violates ordering. A swap is mandatory to bubble larger items to the right.`
          : `Elements ${leftVal} <= ${rightVal} are already correctly ordered. Swapping them disrupts order and violates stability.`,
        correctiveGuidance: expected === 'SWAP' ? 'Choose SWAP when left > right.' : 'Choose NO_SWAP when left <= right.',
        timestamp: new Date().toISOString()
      };

      return {
        success: false,
        newState: state,
        stepDescription: `Incorrect: chose ${chosen}, but comparing arr[${state.j}]=${leftVal} with arr[${state.j + 1}]=${rightVal} requires ${expected}.`,
        misconception
      };
    }

    let swapped = state.swappedInPass;
    let swapsCount = state.swapsCount;
    if (expected === 'SWAP') {
      const tmp = arr[state.j];
      arr[state.j] = arr[state.j + 1];
      arr[state.j + 1] = tmp;
      swapped = true;
      swapsCount += 1;
    }

    // Advance inner pointer j or outer pass i
    let nextJ = state.j + 1;
    let nextI = state.i;
    let nextSuffix = state.sortedSuffixCount;
    let isComplete = false;

    if (nextJ >= arr.length - 1 - nextI) {
      nextSuffix += 1;
      nextI += 1;
      nextJ = 0;
      if (nextI >= arr.length - 1 || !swapped) {
        isComplete = true;
      }
      swapped = false;
    }

    const newState: BubbleSortState = {
      ...state,
      array: arr,
      i: nextI,
      j: nextJ,
      swappedInPass: swapped,
      isComplete,
      sortedSuffixCount: nextSuffix,
      comparisonsCount: state.comparisonsCount + 1,
      swapsCount,
      lastAction: expected === 'SWAP' ? `SWAPPED_${state.j}_${state.j + 1}` : `KEPT_${state.j}_${state.j + 1}`
    };

    return {
      success: true,
      newState,
      stepDescription: expected === 'SWAP'
        ? `Swapped ${arr[state.j + 1]} and ${arr[state.j]} at indices ${state.j} & ${state.j + 1}.`
        : `Retained order (${arr[state.j]} <= ${arr[state.j + 1]}). Advancing comparison window.`
    };
  }

  validateStep(state: BubbleSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const expected = expectedChoice ?? this.getExpectedDecision(state);
    const isCorrect = String(userChoice) === String(expected);

    return {
      isCorrect,
      expectedChoice: expected,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-sort-${Date.now()}`,
        type: 'SORT_WRONG_SWAP',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expected),
        pedagogicalExplanation: `At indices ${state.j} & ${state.j + 1} (${state.array[state.j]} vs ${state.array[state.j + 1]}), action should be ${expected}.`,
        correctiveGuidance: 'Ascending Bubble Sort swaps when left > right.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid comparison decision.' : 'Incorrect swap decision.'
    };
  }

  getVisualizationData(state: BubbleSortState): any {
    return {
      type: 'SORT_BUBBLE',
      array: state.array,
      currentIndex: state.j,
      comparingIndex: state.j + 1,
      sortedSuffixCount: state.sortedSuffixCount,
      isComplete: state.isComplete,
      swapsCount: state.swapsCount
    };
  }

  getGuidedSteps(initialState?: BubbleSortState): DSAGuidedStep<BubbleSortState>[] {
    const base = initialState ?? this.getInitialState();
    // [50, 20, 40, 10, 30] -> Compare 50 vs 20 -> Swap -> [20, 50, 40, 10, 30]
    const s0 = { ...base, j: 0 };
    const s1 = { ...base, array: [20, 50, 40, 10, 30], j: 1, swapsCount: 1, comparisonsCount: 1 };
    const s2 = { ...base, array: [20, 40, 50, 10, 30], j: 2, swapsCount: 2, comparisonsCount: 2 };

    return [
      {
        stepIndex: 0,
        title: 'Initial Array Comparison',
        description: 'Comparing index 0 (50) and index 1 (20). Since 50 > 20, they are out of order.',
        stateSnapshot: s0,
        invariantExplanation: 'Bubble sort repeatedly swaps adjacent out-of-order pairs: A[j] > A[j+1].',
        highlightedIndices: [0, 1]
      },
      {
        stepIndex: 1,
        title: 'First Swap Executed',
        description: 'Swapped 50 and 20. Now comparing index 1 (50) with index 2 (40). 50 > 40 -> Swap required.',
        stateSnapshot: s1,
        invariantExplanation: 'The maximum element of each pass bubbles up to its correct final position at the end.',
        highlightedIndices: [1, 2]
      },
      {
        stepIndex: 2,
        title: 'Bubbling Continues',
        description: '50 swapped with 40. Next comparison: 50 vs 10.',
        stateSnapshot: s2,
        invariantExplanation: 'Each complete pass guarantees at least one more element reaches its final sorted suffix position.',
        highlightedIndices: [2, 3]
      }
    ];
  }

  startPracticeSession(difficulty: AdaptiveDifficultyLevel = 'MEDIUM'): DSAPracticeSession<BubbleSortState> {
    const state = this.getInitialState();
    return {
      sessionId: `sort-practice-${Date.now()}`,
      topicId: this.topicId,
      difficulty,
      currentState: state,
      stepIndex: 0,
      maxSteps: 10,
      decisionsMade: [],
      isComplete: false,
      isSuccess: false,
      mistakesCount: 0
    };
  }

  evaluatePracticeStep(
    session: DSAPracticeSession<BubbleSortState>,
    userDecision: SortDecision
  ): {
    updatedSession: DSAPracticeSession<BubbleSortState>;
    validation: StepValidationResult;
  } {
    const validation = this.validateStep(session.currentState, userDecision);
    let updatedSession = { ...session };

    if (!validation.isCorrect) {
      updatedSession.mistakesCount += 1;
      updatedSession.decisionsMade.push({
        stepIndex: session.stepIndex,
        prompt: `Compare ${session.currentState.array[session.currentState.j]} and ${session.currentState.array[session.currentState.j + 1]}`,
        userChoice: userDecision,
        expectedChoice: validation.expectedChoice,
        isCorrect: false,
        misconception: validation.misconception,
        timestamp: new Date().toISOString()
      });
      return { updatedSession, validation };
    }

    const op = this.applyOperation(session.currentState, { type: 'DECIDE', decision: userDecision });
    updatedSession.currentState = op.newState;
    updatedSession.stepIndex += 1;
    updatedSession.isComplete = op.newState.isComplete;
    updatedSession.isSuccess = op.newState.isComplete && updatedSession.mistakesCount === 0;
    updatedSession.decisionsMade.push({
      stepIndex: session.stepIndex,
      prompt: `Decision at index ${session.currentState.j}`,
      userChoice: userDecision,
      expectedChoice: validation.expectedChoice,
      isCorrect: true,
      timestamp: new Date().toISOString()
    });

    return { updatedSession, validation };
  }
}
