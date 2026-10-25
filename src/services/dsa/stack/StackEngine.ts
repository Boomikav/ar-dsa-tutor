/**
 * Deterministic Stack Learning Engine.
 * 
 * Implements LIFO (Last-In, First-Out) invariant mechanics:
 * Push, Pop, Peek, top pointer management, underflow/overflow guards,
 * and observable LIFO violation misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';

export interface StackState {
  items: number[];
  capacity: number;
  topIndex: number;
  isUnderflow: boolean;
  isOverflow: boolean;
  lastAction: string;
}

export interface StackOperation {
  type: 'PUSH' | 'POP' | 'PEEK';
  value?: number;
}

export class StackEngine implements IDSALearningEngine<StackState, StackOperation> {
  readonly topicId = 'ds-stack';
  readonly topicTitle = 'Stack';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(): StackState {
    return {
      items: [15, 30, 45],
      capacity: 6,
      topIndex: 2,
      isUnderflow: false,
      isOverflow: false,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: StackState): string[] {
    const ops: string[] = [];
    if (state.items.length < state.capacity) ops.push('PUSH');
    if (state.items.length > 0) ops.push('POP', 'PEEK');
    return ops;
  }

  applyOperation(state: StackState, operation: StackOperation): DSAOperationResult<StackState> {
    const items = [...state.items];

    switch (operation.type) {
      case 'PUSH': {
        const val = operation.value ?? 60;
        if (items.length >= state.capacity) {
          return {
            success: false,
            newState: { ...state, isOverflow: true, lastAction: 'OVERFLOW_ERROR' },
            stepDescription: `Stack Overflow: cannot push ${val} onto full stack (capacity ${state.capacity}).`
          };
        }
        items.push(val);
        const newTop = items.length - 1;
        return {
          success: true,
          newState: { items, capacity: state.capacity, topIndex: newTop, isUnderflow: false, isOverflow: false, lastAction: `PUSHED_${val}` },
          stepDescription: `Pushed ${val} onto top of stack (Top = index ${newTop}).`
        };
      }
      case 'POP': {
        if (items.length === 0) {
          return {
            success: false,
            newState: { ...state, isUnderflow: true, lastAction: 'UNDERFLOW_ERROR' },
            stepDescription: 'Stack Underflow: cannot pop from an empty stack.',
            misconception: this.createMisconception('STACK_EMPTY_POP', 'POP', 'NONE', 'Cannot remove elements from a stack with length 0.')
          };
        }
        const popped = items.pop()!;
        const newTop = items.length - 1;
        return {
          success: true,
          newState: { items, capacity: state.capacity, topIndex: newTop, isUnderflow: false, isOverflow: false, lastAction: `POPPED_${popped}` },
          stepDescription: `LIFO Pop: removed top element (${popped}). Top pointer decremented to index ${newTop}.`
        };
      }
      case 'PEEK': {
        if (items.length === 0) {
          return {
            success: false,
            newState: state,
            stepDescription: 'Cannot peek an empty stack.'
          };
        }
        const topVal = items[items.length - 1];
        return {
          success: true,
          newState: { ...state, lastAction: `PEEKED_${topVal}` },
          stepDescription: `Peeked top element: ${topVal} (stack contents unchanged).`
        };
      }
    }
  }

  validateStep(state: StackState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? this.createMisconception(
        'STACK_LIFO_VIOLATION',
        userChoice,
        expectedChoice,
        `Attempted to pop ${userChoice}, but LIFO ordering requires popping the most recently inserted item (${expectedChoice}).`
      ) : undefined,
      feedbackMessage: isCorrect ? 'Valid LIFO decision.' : 'LIFO invariant violated.'
    };
  }

  getVisualizationData(state: StackState): any {
    return {
      type: 'STACK',
      items: state.items,
      capacity: state.capacity,
      topIndex: state.topIndex
    };
  }

  getGuidedSteps(initialState?: StackState): DSAGuidedStep<StackState>[] {
    const base = initialState ?? this.getInitialState();
    return [
      {
        stepIndex: 0,
        title: 'Initial Stack (LIFO)',
        description: 'Stack initialized with 3 elements. Top pointer points to topmost element at index 2.',
        stateSnapshot: base,
        invariantExplanation: 'LIFO: Last In, First Out. Elements are strictly pushed and popped at the top.'
      },
      {
        stepIndex: 1,
        title: 'Push Operation',
        description: 'Pushing 60 increments top pointer to index 3 and places 60 at the new top.',
        stateSnapshot: { ...base, items: [...base.items, 60], topIndex: 3, lastAction: 'PUSHED_60' },
        invariantExplanation: 'Push adds to the top without disturbing lower elements.'
      },
      {
        stepIndex: 2,
        title: 'Pop Operation',
        description: 'Popping removes 60. Top pointer returns to index 2 (value 45).',
        stateSnapshot: { ...base, items: [15, 30, 45], topIndex: 2, lastAction: 'POPPED_60' },
        invariantExplanation: 'Pop removes the topmost item in O(1) time.'
      }
    ];
  }

  private createMisconception(type: any, userChoice: any, expectedChoice: any, explanation: string): MisconceptionDiagnosis {
    return {
      id: `diag-stack-${Date.now()}`,
      type,
      topicId: this.topicId,
      userChoice: String(userChoice),
      expectedChoice: String(expectedChoice),
      pedagogicalExplanation: explanation,
      correctiveGuidance: 'Remember that Stacks operate exclusively through the top pointer.',
      timestamp: new Date().toISOString()
    };
  }
}
