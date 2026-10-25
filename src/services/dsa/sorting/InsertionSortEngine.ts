/**
 * Deterministic Insertion Sort Learning Engine.
 * 
 * Implements online sorted sub-array expansion:
 * Key extraction, backward shifting of elements greater than key,
 * insertion into vacant position, and shift invariant verification.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface InsertionSortState {
  array: number[];
  i: number; // outer index (element being inserted)
  j: number; // inner pointer moving left
  key: number | null; // active element being inserted
  isComplete: boolean;
  shiftsCount: number;
  lastAction: string;
}

export class InsertionSortEngine implements IDSALearningEngine<InsertionSortState, { type: 'STEP' }> {
  readonly topicId = 'algo-insertion-sort';
  readonly topicTitle = 'Insertion Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: number[]): InsertionSortState {
    const array = seed ?? [12, 11, 13, 5, 6];
    return {
      array,
      i: 1,
      j: 0,
      key: 11,
      isComplete: false,
      shiftsCount: 0,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: InsertionSortState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  applyOperation(state: InsertionSortState, operation: { type: 'STEP' }): DSAOperationResult<InsertionSortState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Insertion Sort already complete.' };
    }

    const arr = [...state.array];
    const key = state.key ?? arr[state.i];
    let j = state.j;
    let i = state.i;
    let shifts = state.shiftsCount;
    let isComplete = false;
    let nextKey: number | null = key;

    if (j >= 0 && arr[j] > key) {
      // Shift right
      arr[j + 1] = arr[j];
      j -= 1;
      shifts += 1;
      return {
        success: true,
        newState: { ...state, array: arr, j, shiftsCount: shifts, lastAction: `SHIFTED_${arr[j + 1]}_RIGHT` },
        stepDescription: `Shifted ${arr[j + 1]} right because ${arr[j + 1]} > key (${key}).`
      };
    } else {
      // Insert key into vacant position
      arr[j + 1] = key;
      i += 1;
      if (i >= arr.length) {
        isComplete = true;
        nextKey = null;
      } else {
        nextKey = arr[i];
      }
      j = i - 1;

      return {
        success: true,
        newState: { ...state, array: arr, i, j, key: nextKey, isComplete, lastAction: `PLACED_KEY_${key}` },
        stepDescription: `Inserted key (${key}) at position ${j + 1}. Sorted prefix extended to index ${i - 1}.`
      };
    }
  }

  validateStep(state: InsertionSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Valid insertion shift.' : 'Incorrect insertion position.'
    };
  }

  getVisualizationData(state: InsertionSortState): any {
    return {
      type: 'SORT_INSERTION',
      array: state.array,
      sortedPrefixLength: state.i,
      activeKey: state.key,
      shiftIndex: state.j,
      isComplete: state.isComplete
    };
  }
}
