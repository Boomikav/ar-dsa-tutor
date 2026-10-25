/**
 * Deterministic Queue Learning Engine.
 * 
 * Implements FIFO (First-In, First-Out) invariant mechanics:
 * Enqueue at rear, Dequeue at front, Peek, front/rear pointer tracking,
 * and observable FIFO violation misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';

export interface QueueState {
  items: number[];
  capacity: number;
  front: number;
  rear: number;
  isUnderflow: boolean;
  isOverflow: boolean;
  lastAction: string;
}

export interface QueueOperation {
  type: 'ENQUEUE' | 'DEQUEUE' | 'PEEK';
  value?: number;
}

export class QueueEngine implements IDSALearningEngine<QueueState, QueueOperation> {
  readonly topicId = 'ds-queue';
  readonly topicTitle = 'Queue';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(): QueueState {
    return {
      items: [100, 200, 300],
      capacity: 6,
      front: 0,
      rear: 2,
      isUnderflow: false,
      isOverflow: false,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: QueueState): string[] {
    const ops: string[] = [];
    if (state.items.length < state.capacity) ops.push('ENQUEUE');
    if (state.items.length > 0) ops.push('DEQUEUE', 'PEEK');
    return ops;
  }

  applyOperation(state: QueueState, operation: QueueOperation): DSAOperationResult<QueueState> {
    const items = [...state.items];

    switch (operation.type) {
      case 'ENQUEUE': {
        const val = operation.value ?? 400;
        if (items.length >= state.capacity) {
          return {
            success: false,
            newState: { ...state, isOverflow: true, lastAction: 'OVERFLOW_ERROR' },
            stepDescription: `Queue Overflow: cannot enqueue ${val} into full queue (capacity ${state.capacity}).`
          };
        }
        items.push(val);
        return {
          success: true,
          newState: { items, capacity: state.capacity, front: 0, rear: items.length - 1, isUnderflow: false, isOverflow: false, lastAction: `ENQUEUED_${val}` },
          stepDescription: `Enqueued ${val} at rear (index ${items.length - 1}). Front remains at index 0.`
        };
      }
      case 'DEQUEUE': {
        if (items.length === 0) {
          return {
            success: false,
            newState: { ...state, isUnderflow: true, lastAction: 'UNDERFLOW_ERROR' },
            stepDescription: 'Queue Underflow: cannot dequeue from an empty queue.',
            misconception: {
              id: `diag-queue-${Date.now()}`,
              type: 'QUEUE_EMPTY_DEQUEUE',
              topicId: this.topicId,
              userChoice: 'DEQUEUE',
              expectedChoice: 'ENQUEUE',
              pedagogicalExplanation: 'Cannot dequeue from an empty queue (Queue Underflow).',
              correctiveGuidance: 'Enqueue items to the rear before attempting to dequeue from the front.',
              timestamp: new Date().toISOString()
            }
          };
        }
        const dequeued = items.shift()!;
        const newRear = Math.max(0, items.length - 1);
        return {
          success: true,
          newState: { items, capacity: state.capacity, front: 0, rear: newRear, isUnderflow: false, isOverflow: false, lastAction: `DEQUEUED_${dequeued}` },
          stepDescription: `FIFO Dequeue: removed oldest element (${dequeued}) from front.`
        };
      }
      case 'PEEK': {
        if (items.length === 0) {
          return {
            success: false,
            newState: state,
            stepDescription: 'Cannot peek an empty queue.'
          };
        }
        return {
          success: true,
          newState: { ...state, lastAction: `PEEKED_${items[0]}` },
          stepDescription: `Peeked front element: ${items[0]}.`
        };
      }
    }
  }

  validateStep(state: QueueState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-queue-${Date.now()}`,
        type: 'QUEUE_FIFO_VIOLATION',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Attempted to remove ${userChoice}, but FIFO ordering mandates removing the front item (${expectedChoice}).`,
        correctiveGuidance: 'Remember: Enqueue at Rear, Dequeue at Front.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid FIFO choice.' : 'FIFO invariant violated.'
    };
  }

  getVisualizationData(state: QueueState): any {
    return {
      type: 'QUEUE',
      items: state.items,
      capacity: state.capacity,
      front: state.front,
      rear: state.rear
    };
  }

  getGuidedSteps(initialState?: QueueState): DSAGuidedStep<QueueState>[] {
    const base = initialState ?? this.getInitialState();
    return [
      {
        stepIndex: 0,
        title: 'Initial Queue (FIFO)',
        description: 'Queue with 3 elements. Front points to oldest element (100), Rear points to latest (300).',
        stateSnapshot: base,
        invariantExplanation: 'FIFO: First In, First Out. Elements join at rear and leave from front.'
      },
      {
        stepIndex: 1,
        title: 'Enqueue Operation',
        description: 'Enqueue adds 400 at the rear. Front remains 100.',
        stateSnapshot: { ...base, items: [...base.items, 400], rear: 3, lastAction: 'ENQUEUED_400' },
        invariantExplanation: 'Enqueue only alters the rear pointer.'
      },
      {
        stepIndex: 2,
        title: 'Dequeue Operation',
        description: 'Dequeue removes 100 from front. 200 is now the new front item.',
        stateSnapshot: { ...base, items: [200, 300, 400], rear: 2, lastAction: 'DEQUEUED_100' },
        invariantExplanation: 'Dequeue removes the element that has waited longest in line.'
      }
    ];
  }
}
