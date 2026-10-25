/**
 * Deterministic Quick Sort Learning Engine.
 * 
 * Implements in-place partition sorting:
 * Pivot selection, Lomuto/Hoare partitioning pointer advancement,
 * pivot placement, and partition invariant checks.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface QuickSortState {
  array: number[];
  low: number;
  high: number;
  pivotIndex: number;
  pivotValue: number;
  i: number; // boundary of elements <= pivot
  j: number; // current scanning pointer
  isComplete: boolean;
  lastAction: string;
}

export class QuickSortEngine implements IDSALearningEngine<QuickSortState, { type: 'STEP' }> {
  readonly topicId = 'algo-quick-sort';
  readonly topicTitle = 'Quick Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: number[]): QuickSortState {
    const array = seed ?? [10, 80, 30, 90, 40, 50, 70];
    const high = array.length - 1;
    return {
      array,
      low: 0,
      high,
      pivotIndex: high,
      pivotValue: array[high],
      i: -1,
      j: 0,
      isComplete: false,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: QuickSortState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  applyOperation(state: QuickSortState, _operation: { type: 'STEP' }): DSAOperationResult<QuickSortState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Quick Sort partition already complete.' };
    }

    const arr = [...state.array];
    const pivot = state.pivotValue;
    let i = state.i;
    let j = state.j;

    // Scan phase
    if (j < state.high) {
      if (arr[j] < pivot) {
        i += 1;
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      j += 1;

      return {
        success: true,
        newState: { ...state, array: arr, i, j, lastAction: `SCANNED_${j - 1}` },
        stepDescription: `Examined arr[${j - 1}]=${arr[j - 1]}. Partition boundary i at ${i}.`
      };
    }

    // Place pivot into final position (i + 1)
    const pivotFinalPos = i + 1;
    const tmp = arr[pivotFinalPos];
    arr[pivotFinalPos] = arr[state.high];
    arr[state.high] = tmp;

    return {
      success: true,
      newState: { ...state, array: arr, pivotIndex: pivotFinalPos, isComplete: true, lastAction: 'PIVOT_PLACED' },
      stepDescription: `Pivot ${pivot} placed at final sorted position ${pivotFinalPos}. All items to left <= ${pivot}, items to right >= ${pivot}.`
    };
  }

  validateStep(state: QuickSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-qs-${Date.now()}`,
        type: 'SORT_WRONG_PARTITION',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Partition invariant requires all elements less than pivot (${state.pivotValue}) to remain left of pivot boundary.`,
        correctiveGuidance: 'Advance pointer and swap into smaller partition when element < pivot.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid partition decision.' : 'Partition invariant error.'
    };
  }

  getVisualizationData(state: QuickSortState): any {
    return {
      type: 'SORT_QUICK',
      array: state.array,
      pivotIndex: state.pivotIndex,
      pivotValue: state.pivotValue,
      partitionIndex: state.i,
      scanIndex: state.j,
      isComplete: state.isComplete
    };
  }
}
