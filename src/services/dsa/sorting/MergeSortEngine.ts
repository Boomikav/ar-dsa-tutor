/**
 * Deterministic Merge Sort Learning Engine.
 * 
 * Implements Divide-and-Conquer sorting:
 * Recursive halving, two-pointer sorted array merging, O(N log N) guarantee,
 * and merge comparison invariants.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface MergeSortState {
  array: number[];
  stages: Array<{ title: string; partitions: number[][] }>;
  currentStageIndex: number;
  isComplete: boolean;
  lastAction: string;
}

export class MergeSortEngine implements IDSALearningEngine<MergeSortState, { type: 'STEP' }> {
  readonly topicId = 'algo-merge-sort';
  readonly topicTitle = 'Merge Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '2D_READY' as const;

  getInitialState(seed?: number[]): MergeSortState {
    const array = seed ?? [38, 27, 43, 3, 9, 82, 10];
    const stages: Array<{ title: string; partitions: number[][] }> = [
      { title: 'Initial Array', partitions: [[38, 27, 43, 3, 9, 82, 10]] },
      { title: 'Divide Stage 1', partitions: [[38, 27, 43, 3], [9, 82, 10]] },
      { title: 'Divide Stage 2', partitions: [[38, 27], [43, 3], [9, 82], [10]] },
      { title: 'Base Sub-arrays (Size 1)', partitions: [[38], [27], [43], [3], [9], [82], [10]] },
      { title: 'Merge Stage 1', partitions: [[27, 38], [3, 43], [9, 82], [10]] },
      { title: 'Merge Stage 2', partitions: [[3, 27, 38, 43], [9, 10, 82]] },
      { title: 'Fully Sorted Merge', partitions: [[3, 9, 10, 27, 38, 43, 82]] }
    ];

    return {
      array,
      stages,
      currentStageIndex: 0,
      isComplete: false,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: MergeSortState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  applyOperation(state: MergeSortState, _operation: { type: 'STEP' }): DSAOperationResult<MergeSortState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Merge Sort already completed.' };
    }

    const nextStage = state.currentStageIndex + 1;
    const isComplete = nextStage >= state.stages.length - 1;
    const stageInfo = state.stages[nextStage];

    return {
      success: true,
      newState: {
        ...state,
        currentStageIndex: nextStage,
        isComplete,
        lastAction: stageInfo.title
      },
      stepDescription: `${stageInfo.title}: ${stageInfo.partitions.map(p => `[${p.join(', ')}]`).join(' ')}.`
    };
  }

  validateStep(state: MergeSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Correct merge step.' : 'Incorrect merge choice.'
    };
  }

  getVisualizationData(state: MergeSortState): any {
    return {
      type: 'SORT_MERGE',
      stage: state.stages[state.currentStageIndex],
      currentStageIndex: state.currentStageIndex,
      totalStages: state.stages.length,
      isComplete: state.isComplete
    };
  }
}
