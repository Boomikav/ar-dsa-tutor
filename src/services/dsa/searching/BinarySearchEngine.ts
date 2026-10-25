/**
 * Deterministic Binary Search Learning Engine (Demonstration 1).
 * 
 * Implements logarithmic search on sorted arrays:
 * Midpoint computation, comparison against target, boundary adjustment,
 * interval reduction, and observable directional misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface BinarySearchState {
  array: number[];
  target: number;
  low: number;
  high: number;
  mid: number | null;
  stepCount: number;
  isComplete: boolean;
  isFound: boolean;
  searchHistory: Array<{ low: number; high: number; mid: number; val: number }>;
  lastAction: string;
}

export type BinarySearchDecision = 'GO_LEFT' | 'MATCH' | 'GO_RIGHT';

export class BinarySearchEngine implements IDSALearningEngine<BinarySearchState, { type: 'STEP' | 'DECIDE'; decision?: BinarySearchDecision }> {
  readonly topicId = 'algo-binary-search';
  readonly topicTitle = 'Binary Search';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { array?: number[]; target?: number }): BinarySearchState {
    const array = seed?.array ?? [10, 20, 30, 40, 50, 60, 70];
    const target = seed?.target ?? 60;
    const low = 0;
    const high = array.length - 1;
    const mid = Math.floor((low + high) / 2);

    return {
      array,
      target,
      low,
      high,
      mid,
      stepCount: 0,
      isComplete: false,
      isFound: false,
      searchHistory: [{ low, high, mid, val: array[mid] }],
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: BinarySearchState): string[] {
    return state.isComplete ? ['RESET'] : ['GO_LEFT', 'MATCH', 'GO_RIGHT'];
  }

  getExpectedDecision(state: BinarySearchState): BinarySearchDecision {
    if (state.mid === null) return 'MATCH';
    const midVal = state.array[state.mid];
    if (state.target === midVal) return 'MATCH';
    if (state.target < midVal) return 'GO_LEFT';
    return 'GO_RIGHT';
  }

  applyOperation(
    state: BinarySearchState,
    operation: { type: 'STEP' | 'DECIDE'; decision?: BinarySearchDecision }
  ): DSAOperationResult<BinarySearchState> {
    if (state.isComplete || state.mid === null) {
      return { success: false, newState: state, stepDescription: 'Search already concluded.' };
    }

    const midVal = state.array[state.mid];
    const expected = this.getExpectedDecision(state);
    const chosen = operation.decision ?? expected;

    // Validate correctness
    if (chosen !== expected) {
      const isWrongHalf = (expected === 'GO_RIGHT' && chosen === 'GO_LEFT') || (expected === 'GO_LEFT' && chosen === 'GO_RIGHT');
      const misconception: MisconceptionDiagnosis = {
        id: `diag-bs-${Date.now()}`,
        type: isWrongHalf ? 'BINARY_SEARCH_WRONG_HALF' : 'BINARY_SEARCH_OFF_BY_ONE',
        topicId: this.topicId,
        targetValue: state.target,
        currentNodeValue: midVal,
        userChoice: chosen,
        expectedChoice: expected,
        pedagogicalExplanation: isWrongHalf
          ? `Target (${state.target}) is ${state.target > midVal ? 'greater than' : 'less than'} mid value (${midVal}). In a sorted array, it can only reside in the ${state.target > midVal ? 'right' : 'left'} half.`
          : `At index ${state.mid}, mid element is ${midVal}.`,
        correctiveGuidance: `Adjust ${expected === 'GO_RIGHT' ? 'low = mid + 1' : 'high = mid - 1'} to search the valid sub-interval.`,
        timestamp: new Date().toISOString()
      };

      return {
        success: false,
        newState: state,
        stepDescription: `Incorrect decision: chose ${chosen}, but target ${state.target} vs mid ${midVal} requires ${expected}.`,
        misconception
      };
    }

    // Apply valid step
    let newLow = state.low;
    let newHigh = state.high;
    let isFound = false;
    let isComplete = false;

    if (expected === 'MATCH') {
      isFound = true;
      isComplete = true;
    } else if (expected === 'GO_LEFT') {
      newHigh = state.mid - 1;
    } else if (expected === 'GO_RIGHT') {
      newLow = state.mid + 1;
    }

    if (newLow > newHigh && !isFound) {
      isComplete = true;
    }

    const nextMid = newLow <= newHigh ? Math.floor((newLow + newHigh) / 2) : null;
    const history = [...state.searchHistory];
    if (nextMid !== null) {
      history.push({ low: newLow, high: newHigh, mid: nextMid, val: state.array[nextMid] });
    }

    const newState: BinarySearchState = {
      ...state,
      low: newLow,
      high: newHigh,
      mid: nextMid,
      stepCount: state.stepCount + 1,
      isComplete,
      isFound,
      searchHistory: history,
      lastAction: isFound ? `FOUND_${state.target}` : `INTERVAL_[${newLow}..${newHigh}]`
    };

    return {
      success: true,
      newState,
      stepDescription: isFound
        ? `Target ${state.target} found at mid index ${state.mid}!`
        : `Eliminated half of search interval. Active bounds: [${newLow}..${newHigh}] (size: ${Math.max(0, newHigh - newLow + 1)}).`
    };
  }

  validateStep(state: BinarySearchState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const expected = expectedChoice ?? this.getExpectedDecision(state);
    const isCorrect = String(userChoice) === String(expected);

    return {
      isCorrect,
      expectedChoice: expected,
      userChoice,
      misconception: !isCorrect && state.mid !== null ? {
        id: `diag-bs-${Date.now()}`,
        type: 'BINARY_SEARCH_WRONG_HALF',
        topicId: this.topicId,
        targetValue: state.target,
        currentNodeValue: state.array[state.mid],
        userChoice: String(userChoice),
        expectedChoice: String(expected),
        pedagogicalExplanation: `Target (${state.target}) is ${state.target > state.array[state.mid] ? '>' : '<'} mid element (${state.array[state.mid]}). Must search ${expected}.`,
        correctiveGuidance: `Eliminate the ${expected === 'GO_RIGHT' ? 'left' : 'right'} half and adjust bounds.`,
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Correct interval selection.' : 'Incorrect sub-interval decision.'
    };
  }

  getVisualizationData(state: BinarySearchState): any {
    return {
      type: 'SEARCH_BINARY',
      array: state.array,
      target: state.target,
      low: state.low,
      high: state.high,
      mid: state.mid,
      isComplete: state.isComplete,
      isFound: state.isFound
    };
  }

  getGuidedSteps(initialState?: BinarySearchState): DSAGuidedStep<BinarySearchState>[] {
    const base = initialState ?? this.getInitialState();
    // Trace target 60 in [10, 20, 30, 40, 50, 60, 70]
    const s0 = { ...base }; // mid=3 (40)
    const s1 = { ...base, low: 4, high: 6, mid: 5, stepCount: 1, searchHistory: [...base.searchHistory, { low: 4, high: 6, mid: 5, val: 60 }] }; // mid=5 (60)
    const s2 = { ...s1, isComplete: true, isFound: true, stepCount: 2 };

    return [
      {
        stepIndex: 0,
        title: 'Initial Search Interval',
        description: 'Array [10, 20, 30, 40, 50, 60, 70]. Target = 60. Low = 0, High = 6. Mid = floor((0+6)/2) = 3 (Value: 40).',
        stateSnapshot: s0,
        invariantExplanation: 'Binary search requires sorted array: A[i] <= A[i+1]. Compare target with middle.',
        highlightedIndices: [0, 3, 6]
      },
      {
        stepIndex: 1,
        title: 'Interval Halving Step',
        description: '60 > 40: Target must be in right half. Eliminate indices 0..3. Low becomes mid + 1 = 4. New Mid = 5 (Value: 60).',
        stateSnapshot: s1,
        invariantExplanation: 'Eliminates N/2 elements per step: O(log N) worst-case time complexity.',
        highlightedIndices: [4, 5, 6]
      },
      {
        stepIndex: 2,
        title: 'Target Located',
        description: 'Mid element at index 5 is 60 == Target! Search completed in 2 comparisons.',
        stateSnapshot: s2,
        invariantExplanation: 'Search succeeds in logarithmic time.',
        highlightedIndices: [5]
      }
    ];
  }

  startPracticeSession(difficulty: AdaptiveDifficultyLevel = 'MEDIUM'): DSAPracticeSession<BinarySearchState> {
    const state = this.getInitialState();
    return {
      sessionId: `bsearch-practice-${Date.now()}`,
      topicId: this.topicId,
      difficulty,
      target: state.target,
      currentState: state,
      stepIndex: 0,
      maxSteps: 5,
      decisionsMade: [],
      isComplete: false,
      isSuccess: false,
      mistakesCount: 0
    };
  }

  evaluatePracticeStep(
    session: DSAPracticeSession<BinarySearchState>,
    userDecision: BinarySearchDecision
  ): {
    updatedSession: DSAPracticeSession<BinarySearchState>;
    validation: StepValidationResult;
  } {
    const validation = this.validateStep(session.currentState, userDecision);
    let updatedSession = { ...session };

    if (!validation.isCorrect) {
      updatedSession.mistakesCount += 1;
      updatedSession.decisionsMade.push({
        stepIndex: session.stepIndex,
        prompt: `Compare target ${session.target} with mid ${session.currentState.mid !== null ? session.currentState.array[session.currentState.mid] : '?'}`,
        userChoice: userDecision,
        expectedChoice: validation.expectedChoice,
        isCorrect: false,
        misconception: validation.misconception,
        timestamp: new Date().toISOString()
      });
      return { updatedSession, validation };
    }

    // Correct decision: advance state
    const opResult = this.applyOperation(session.currentState, { type: 'DECIDE', decision: userDecision });
    updatedSession.currentState = opResult.newState;
    updatedSession.stepIndex += 1;
    updatedSession.isComplete = opResult.newState.isComplete;
    updatedSession.isSuccess = opResult.newState.isFound;
    updatedSession.decisionsMade.push({
      stepIndex: session.stepIndex,
      prompt: `Decision at index ${session.currentState.mid}`,
      userChoice: userDecision,
      expectedChoice: validation.expectedChoice,
      isCorrect: true,
      timestamp: new Date().toISOString()
    });

    return { updatedSession, validation };
  }
}
