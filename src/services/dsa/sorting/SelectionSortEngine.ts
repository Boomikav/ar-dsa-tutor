/**
 * Deterministic Selection Sort Learning Engine.
 * 
 * Implements prefix-selection sort mechanics:
 * Scans unsorted suffix for minimum element, swaps into sorted prefix boundary,
 * and tracks comparison invariants.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';

export interface SelectionSortState {
  array: number[];
  i: number; // sorted prefix boundary
  j: number; // scan pointer in unsorted suffix
  minIdx: number; // index of minimum element found in current pass
  isComplete: boolean;
  swapsCount: number;
  comparisonsCount: number;
  lastAction: string;
}

export class SelectionSortEngine implements IDSALearningEngine<SelectionSortState, { type: 'STEP' }> {
  readonly topicId = 'algo-selection-sort';
  readonly topicTitle = 'Selection Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: number[]): SelectionSortState {
    const array = seed ?? [29, 10, 14, 37, 13];
    return {
      array,
      i: 0,
      j: 1,
      minIdx: 0,
      isComplete: false,
      swapsCount: 0,
      comparisonsCount: 0,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: SelectionSortState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  applyOperation(state: SelectionSortState, operation: { type: 'STEP' }): DSAOperationResult<SelectionSortState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Selection Sort already completed.' };
    }

    const arr = [...state.array];
    let minIdx = state.minIdx;
    let j = state.j;
    let i = state.i;
    let swapsCount = state.swapsCount;
    let isComplete = false;

    // Compare arr[j] with arr[minIdx]
    if (arr[j] < arr[minIdx]) {
      minIdx = j;
    }

    j += 1;
    let action = `SCANNED_INDEX_${j - 1}`;

    // Reached end of unsorted suffix: execute swap
    if (j >= arr.length) {
      if (minIdx !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        swapsCount += 1;
        action = `SWAPPED_${arr[i]}_INTO_POSITION_${i}`;
      }
      i += 1;
      minIdx = i;
      j = i + 1;
      if (i >= arr.length - 1) {
        isComplete = true;
      }
    }

    const newState: SelectionSortState = {
      ...state,
      array: arr,
      i,
      j,
      minIdx,
      isComplete,
      swapsCount,
      comparisonsCount: state.comparisonsCount + 1,
      lastAction: action
    };

    return {
      success: true,
      newState,
      stepDescription: `Sorted prefix length: ${i}. Minimum in remaining suffix at index ${minIdx} (value: ${arr[minIdx]}).`
    };
  }

  validateStep(state: SelectionSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Correct minimum element selection.' : 'Incorrect minimum selection.'
    };
  }

  getVisualizationData(state: SelectionSortState): any {
    return {
      type: 'SORT_SELECTION',
      array: state.array,
      sortedPrefixCount: state.i,
      currentScanIndex: state.j,
      minimumIndex: state.minIdx,
      isComplete: state.isComplete
    };
  }
}
