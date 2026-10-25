/**
 * Deterministic Binary Min-Heap Learning Engine.
 * 
 * Implements authoritative Min-Heap array representation:
 * Parent/Child indices, Heapify-Up (Insertion), Heapify-Down (Extract-Min),
 * and observable heap property violation misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';

export interface HeapState {
  heap: number[];
  isMinHeap: boolean;
  activeIndex: number | null;
  highlightedIndices: number[];
  lastAction: string;
}

export interface HeapOperation {
  type: 'INSERT' | 'EXTRACT_MIN' | 'PEEK';
  value?: number;
}

export class HeapEngine implements IDSALearningEngine<HeapState, HeapOperation> {
  readonly topicId = 'ds-heap';
  readonly topicTitle = 'Binary Heap';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(): HeapState {
    return {
      heap: [10, 25, 15, 30, 40, 50, 20],
      isMinHeap: true,
      activeIndex: null,
      highlightedIndices: [],
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: HeapState): string[] {
    const ops = ['INSERT'];
    if (state.heap.length > 0) ops.push('EXTRACT_MIN', 'PEEK');
    return ops;
  }

  applyOperation(state: HeapState, operation: HeapOperation): DSAOperationResult<HeapState> {
    const h = [...state.heap];

    if (operation.type === 'INSERT') {
      const val = operation.value ?? 8;
      h.push(val);
      let curr = h.length - 1;

      // Heapify Up
      while (curr > 0) {
        const parent = Math.floor((curr - 1) / 2);
        if (h[curr] < h[parent]) {
          const tmp = h[curr];
          h[curr] = h[parent];
          h[parent] = tmp;
          curr = parent;
        } else {
          break;
        }
      }

      return {
        success: true,
        newState: { ...state, heap: h, activeIndex: curr, highlightedIndices: [curr], lastAction: `INSERTED_${val}` },
        stepDescription: `Inserted ${val} into heap. Bubble-up restored min-heap invariant at index ${curr}.`
      };
    }

    if (operation.type === 'EXTRACT_MIN') {
      if (h.length === 0) {
        return { success: false, newState: state, stepDescription: 'Cannot extract min from empty heap.' };
      }
      const minVal = h[0];
      const last = h.pop()!;

      if (h.length > 0) {
        h[0] = last;
        let curr = 0;

        // Heapify Down
        while (true) {
          const left = 2 * curr + 1;
          const right = 2 * curr + 2;
          let smallest = curr;

          if (left < h.length && h[left] < h[smallest]) smallest = left;
          if (right < h.length && h[right] < h[smallest]) smallest = right;

          if (smallest !== curr) {
            const tmp = h[curr];
            h[curr] = h[smallest];
            h[smallest] = tmp;
            curr = smallest;
          } else {
            break;
          }
        }
      }

      return {
        success: true,
        newState: { ...state, heap: h, activeIndex: 0, highlightedIndices: [0], lastAction: `EXTRACTED_${minVal}` },
        stepDescription: `Extracted min root (${minVal}). Sift-down restored min-heap property.`
      };
    }

    if (operation.type === 'PEEK') {
      return {
        success: h.length > 0,
        newState: state,
        stepDescription: h.length > 0 ? `Min-Heap root is ${h[0]}.` : 'Heap is empty.'
      };
    }

    return { success: true, newState: state, stepDescription: 'Heap operation applied.' };
  }

  validateStep(state: HeapState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-heap-${Date.now()}`,
        type: 'HEAP_PROPERTY_VIOLATION',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `In a Min-Heap, every parent node must be <= its children. Child ${userChoice} violates parent order.`,
        correctiveGuidance: 'Swap smaller child upward until Min-Heap property is preserved.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid heap invariant step.' : 'Heap property violated.'
    };
  }

  getVisualizationData(state: HeapState): any {
    return {
      type: 'HEAP',
      heap: state.heap,
      isMinHeap: state.isMinHeap,
      activeIndex: state.activeIndex,
      highlightedIndices: state.highlightedIndices
    };
  }
}
