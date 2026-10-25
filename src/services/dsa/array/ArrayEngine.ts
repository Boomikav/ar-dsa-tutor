/**
 * Deterministic Array Learning Engine.
 * 
 * Implements authoritative array mechanics: contiguous memory, zero-indexed random access,
 * element shifting on insertion/deletion, boundary checks, and observable misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface ArrayState {
  elements: number[];
  capacity: number;
  activeIndex: number | null;
  highlightedIndices: number[];
  lastAction: string;
}

export interface ArrayOperation {
  type: 'ACCESS' | 'INSERT' | 'DELETE' | 'SEARCH';
  index?: number;
  value?: number;
}

export class ArrayEngine implements IDSALearningEngine<ArrayState, ArrayOperation> {
  readonly topicId = 'ds-array';
  readonly topicTitle = 'Array';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: number[]): ArrayState {
    return {
      elements: seed ? [...seed] : [12, 24, 36, 48, 60],
      capacity: 8,
      activeIndex: null,
      highlightedIndices: [],
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: ArrayState): string[] {
    const ops: string[] = ['ACCESS', 'SEARCH'];
    if (state.elements.length < state.capacity) ops.push('INSERT');
    if (state.elements.length > 0) ops.push('DELETE');
    return ops;
  }

  applyOperation(state: ArrayState, operation: ArrayOperation): DSAOperationResult<ArrayState> {
    const elements = [...state.elements];

    switch (operation.type) {
      case 'ACCESS': {
        const idx = operation.index ?? 0;
        if (idx < 0 || idx >= elements.length) {
          return {
            success: false,
            newState: { ...state, activeIndex: null, highlightedIndices: [], lastAction: 'ACCESS_FAILED_BOUNDS' },
            stepDescription: `Index ${idx} is out of bounds [0, ${elements.length - 1}].`,
            misconception: this.createMisconception('ARRAY_OUT_OF_BOUNDS', idx, `0..${elements.length - 1}`, 'Array indexing is bounded strictly by [0, length - 1].')
          };
        }
        return {
          success: true,
          newState: { ...state, activeIndex: idx, highlightedIndices: [idx], lastAction: `ACCESSED_INDEX_${idx}` },
          stepDescription: `O(1) direct access at index ${idx}: found value ${elements[idx]}.`
        };
      }
      case 'INSERT': {
        const idx = operation.index ?? elements.length;
        const val = operation.value ?? 99;
        if (idx < 0 || idx > elements.length) {
          return {
            success: false,
            newState: { ...state, lastAction: 'INSERT_FAILED_BOUNDS' },
            stepDescription: `Cannot insert at index ${idx}. Valid insertion range is [0, ${elements.length}].`,
            misconception: this.createMisconception('ARRAY_WRONG_INSERTION_POSITION', idx, `0..${elements.length}`, 'Elements must remain contiguous without empty gaps.')
          };
        }
        if (elements.length >= state.capacity) {
          return {
            success: false,
            newState: { ...state, lastAction: 'INSERT_FAILED_CAPACITY' },
            stepDescription: `Array capacity (${state.capacity}) exceeded. Requires dynamic array reallocation.`
          };
        }
        elements.splice(idx, 0, val);
        return {
          success: true,
          newState: { ...state, elements, activeIndex: idx, highlightedIndices: [idx], lastAction: `INSERTED_AT_${idx}` },
          stepDescription: `Inserted ${val} at index ${idx}. Shifted ${elements.length - 1 - idx} downstream elements.`
        };
      }
      case 'DELETE': {
        const idx = operation.index ?? 0;
        if (idx < 0 || idx >= elements.length) {
          return {
            success: false,
            newState: { ...state, lastAction: 'DELETE_FAILED_BOUNDS' },
            stepDescription: `Index ${idx} is out of bounds for deletion.`
          };
        }
        const removed = elements.splice(idx, 1)[0];
        return {
          success: true,
          newState: { ...state, elements, activeIndex: null, highlightedIndices: [], lastAction: `DELETED_AT_${idx}` },
          stepDescription: `Deleted element ${removed} at index ${idx}. Shifted remaining elements left to maintain contiguity.`
        };
      }
      case 'SEARCH': {
        const val = operation.value ?? 0;
        const idx = elements.indexOf(val);
        return {
          success: idx !== -1,
          newState: { ...state, activeIndex: idx !== -1 ? idx : null, highlightedIndices: idx !== -1 ? [idx] : [], lastAction: idx !== -1 ? `FOUND_${val}` : `NOT_FOUND_${val}` },
          stepDescription: idx !== -1 ? `Linear scan found ${val} at index ${idx}.` : `Value ${val} not found after checking all ${elements.length} cells.`
        };
      }
    }
  }

  validateStep(state: ArrayState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = Number(userChoice) === Number(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? this.createMisconception(
        'ARRAY_WRONG_INDEX',
        userChoice,
        expectedChoice,
        `Selected index ${userChoice}, but contiguous element shift placed target at index ${expectedChoice}.`
      ) : undefined,
      feedbackMessage: isCorrect
        ? `Correct index ${userChoice} identified.`
        : `Incorrect. Expected index ${expectedChoice}.`
    };
  }

  getVisualizationData(state: ArrayState): any {
    return {
      type: 'ARRAY',
      elements: state.elements,
      capacity: state.capacity,
      activeIndex: state.activeIndex,
      highlightedIndices: state.highlightedIndices
    };
  }

  getGuidedSteps(initialState?: ArrayState): DSAGuidedStep<ArrayState>[] {
    const base = initialState ?? this.getInitialState();
    const targetVal = 99;
    const insertIdx = 2;

    const s0 = { ...base, activeIndex: null, highlightedIndices: [], lastAction: 'START' };
    const s1 = { ...base, activeIndex: insertIdx, highlightedIndices: [2, 3, 4], lastAction: 'IDENTIFY_SHIFT' };
    const s2 = { ...base, elements: [12, 24, 99, 36, 48, 60], activeIndex: insertIdx, highlightedIndices: [insertIdx], lastAction: 'INSERT_COMPLETE' };

    return [
      {
        stepIndex: 0,
        title: 'Contiguous Memory Array',
        description: 'Array of size 5 located in sequential memory cells indexed 0 through 4.',
        stateSnapshot: s0,
        invariantExplanation: 'Direct addressing formula: Address = Base + (Index * ElementSize).'
      },
      {
        stepIndex: 1,
        title: 'Element Shifting Invariant',
        description: `Inserting ${targetVal} at index ${insertIdx} requires shifting elements at indices 2, 3, and 4 rightward.`,
        stateSnapshot: s1,
        invariantExplanation: 'Arrays have zero empty holes between elements. Shifting costs O(N) time.',
        highlightedIndices: [2, 3, 4]
      },
      {
        stepIndex: 2,
        title: 'Insertion Completed',
        description: `New element ${targetVal} placed at index ${insertIdx}. Total length increased to 6.`,
        stateSnapshot: s2,
        invariantExplanation: 'All subsequent indices have been incremented by 1.',
        highlightedIndices: [insertIdx]
      }
    ];
  }

  startPracticeSession(difficulty: AdaptiveDifficultyLevel = 'MEDIUM'): DSAPracticeSession<ArrayState> {
    const state = this.getInitialState();
    return {
      sessionId: `array-practice-${Date.now()}`,
      topicId: this.topicId,
      difficulty,
      target: 99,
      currentState: state,
      stepIndex: 0,
      maxSteps: 3,
      decisionsMade: [],
      isComplete: false,
      isSuccess: false,
      mistakesCount: 0
    };
  }

  private createMisconception(
    type: any,
    userChoice: any,
    expectedChoice: any,
    explanation: string
  ): MisconceptionDiagnosis {
    return {
      id: `diag-arr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      topicId: this.topicId,
      userChoice: String(userChoice),
      expectedChoice: String(expectedChoice),
      pedagogicalExplanation: explanation,
      correctiveGuidance: 'Review 0-indexed bounds and element shift mechanics.',
      timestamp: new Date().toISOString()
    };
  }
}
