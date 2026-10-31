/**
 * Authoritative Merge Sort Learning Engine
 * 
 * Implements deterministic Divide-and-Conquer sorting:
 * 1. Recursive decomposition into left and right subarrays
 * 2. Step-by-step comparison and write operations
 * 3. Intermediate merged array state tracking
 * 4. Metrics: comparisons, writes, recursion depth, elapsed time
 * 5. Theoretical complexity: O(n log n) time, O(n) auxiliary space
 * 
 * Implements both IDSALearningEngine and IInteractiveAlgorithmEngine.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, VisualizationCapability } from '../core/IDSALearningEngine';
import { 
  IInteractiveAlgorithmEngine, 
  AlgorithmComplexityInfo, 
  AlgorithmMetricsSnapshot, 
  AlgorithmExecutionEvent, 
  StepExecutionResult 
} from '../core/IAlgorithmEngine';

export interface MergeSubarraySpan {
  left: number;
  right: number;
  mid: number;
  depth: number;
  elements: number[];
}

export interface MergeSortStep {
  stepIndex: number;
  type: 'SPLIT' | 'COMPARE' | 'WRITE' | 'COPY_BACK' | 'COMPLETE';
  description: string;
  leftSpan?: MergeSubarraySpan;
  rightSpan?: MergeSubarraySpan;
  activeLeftIdx?: number;
  activeRightIdx?: number;
  writeIdx?: number;
  comparedValues?: [number, number];
  comparisonResult?: 'LEFT_SMALLER' | 'RIGHT_SMALLER' | 'EQUAL';
  workingArray: number[];
  auxiliaryArray: (number | null)[];
  currentDepth: number;
  comparisonsCount: number;
  writesCount: number;
}

export interface MergeSortState {
  originalArray: number[];
  array: number[];
  auxiliaryArray: (number | null)[];
  steps: MergeSortStep[];
  currentStepIndex: number;
  activeLeftSubarray: number[];
  activeRightSubarray: number[];
  activeComparedIndices: [number, number] | null;
  activeWriteIndex: number | null;
  recursionDepth: number;
  maxRecursionDepth: number;
  comparisonsCount: number;
  writesCount: number;
  isComplete: boolean;
  lastAction: string;
}

export class MergeSortEngine implements IDSALearningEngine<MergeSortState, { type: 'STEP' }>, IInteractiveAlgorithmEngine<MergeSortState> {
  readonly topicId = 'algo-merge-sort';
  readonly algorithmId = 'algo-merge-sort';
  readonly topicTitle = 'Merge Sort';
  readonly title = 'Merge Sort';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability: VisualizationCapability = '2D_READY';

  private state!: MergeSortState;
  private startTime = 0;
  private eventHistory: AlgorithmExecutionEvent<MergeSortState>[] = [];

  constructor() {
    this.initialize([38, 27, 43, 3, 9, 82, 10]);
  }

  public getComplexity(): AlgorithmComplexityInfo {
    return {
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)'
      },
      spaceComplexity: {
        auxiliary: 'O(n)',
        total: 'O(n)'
      },
      stability: true,
      paradigm: 'Divide and Conquer',
      invariants: [
        'Array is divided into two halves until sub-arrays of size 1 are reached (base case).',
        'Adjacent sorted sub-arrays are merged using a two-pointer comparison technique into a temporary buffer.',
        'Merged sub-arrays maintain relative order of equal keys (stable sort).',
        'Auxiliary memory of size O(n) is required to hold temporary merged elements before copying back.'
      ]
    };
  }

  public getMetrics(): AlgorithmMetricsSnapshot {
    return {
      comparisonsCount: this.state.comparisonsCount,
      writesCount: this.state.writesCount,
      stepsCount: this.state.currentStepIndex,
      recursionDepth: this.state.recursionDepth,
      elapsedMs: this.startTime ? Math.max(1, Date.now() - this.startTime) : 0,
      inputSize: this.state.originalArray.length,
      auxiliaryMemoryBytes: this.state.originalArray.length * 4
    };
  }

  public initialize(initialData?: number[]): MergeSortState {
    const rawArray = initialData && initialData.length > 0 ? [...initialData] : [38, 27, 43, 3, 9, 82, 10];
    const steps = this.generatePrecomputedExecutionTrace([...rawArray]);
    this.startTime = Date.now();
    this.eventHistory = [];

    let maxDepth = 0;
    for (const s of steps) {
      if (s.currentDepth > maxDepth) maxDepth = s.currentDepth;
    }

    const isSingleOrEmpty = rawArray.length <= 1;

    this.state = {
      originalArray: [...rawArray],
      array: [...rawArray],
      auxiliaryArray: new Array(rawArray.length).fill(null),
      steps,
      currentStepIndex: isSingleOrEmpty ? steps.length : 0,
      activeLeftSubarray: [],
      activeRightSubarray: [],
      activeComparedIndices: null,
      activeWriteIndex: null,
      recursionDepth: 0,
      maxRecursionDepth: maxDepth,
      comparisonsCount: 0,
      writesCount: 0,
      isComplete: isSingleOrEmpty,
      lastAction: 'INITIALIZED'
    };

    return this.getCurrentState();
  }

  public getInitialState(seed?: number[]): MergeSortState {
    return this.initialize(seed);
  }

  public getCurrentState(): MergeSortState {
    return { ...this.state };
  }

  public isCompleted(): boolean {
    return this.state.isComplete;
  }

  public getEventHistory(): readonly AlgorithmExecutionEvent<MergeSortState>[] {
    return this.eventHistory;
  }

  public reset(): MergeSortState {
    return this.initialize(this.state.originalArray);
  }

  public step(): StepExecutionResult<MergeSortState> {
    if (this.state.isComplete || this.state.currentStepIndex >= this.state.steps.length) {
      const completeEvent: AlgorithmExecutionEvent<MergeSortState> = {
        type: 'COMPLETE',
        stepIndex: this.state.currentStepIndex,
        description: 'Merge Sort execution complete. Array is fully sorted.',
        stateSnapshot: this.getCurrentState(),
        metrics: this.getMetrics(),
        timestamp: Date.now()
      };
      this.eventHistory.push(completeEvent);
      this.state.isComplete = true;
      return { success: false, state: this.getCurrentState(), event: completeEvent, isComplete: true };
    }

    const currentStep = this.state.steps[this.state.currentStepIndex];
    const nextIdx = this.state.currentStepIndex + 1;
    const isComplete = nextIdx >= this.state.steps.length;

    // Apply step to state
    this.state.array = [...currentStep.workingArray];
    this.state.auxiliaryArray = [...currentStep.auxiliaryArray];
    this.state.currentStepIndex = nextIdx;
    this.state.recursionDepth = currentStep.currentDepth;
    this.state.comparisonsCount = currentStep.comparisonsCount;
    this.state.writesCount = currentStep.writesCount;
    this.state.isComplete = isComplete;
    this.state.lastAction = currentStep.type;

    if (currentStep.leftSpan && currentStep.rightSpan) {
      this.state.activeLeftSubarray = [...currentStep.leftSpan.elements];
      this.state.activeRightSubarray = [...currentStep.rightSpan.elements];
    }

    if (currentStep.activeLeftIdx !== undefined && currentStep.activeRightIdx !== undefined) {
      this.state.activeComparedIndices = [currentStep.activeLeftIdx, currentStep.activeRightIdx];
    } else {
      this.state.activeComparedIndices = null;
    }

    this.state.activeWriteIndex = currentStep.writeIdx ?? null;

    const eventType = currentStep.type as any;
    const event: AlgorithmExecutionEvent<MergeSortState> = {
      type: eventType,
      stepIndex: nextIdx,
      description: currentStep.description,
      stateSnapshot: this.getCurrentState(),
      metrics: this.getMetrics(),
      timestamp: Date.now()
    };
    this.eventHistory.push(event);

    return {
      success: true,
      state: this.getCurrentState(),
      event,
      isComplete
    };
  }

  // IDSALearningEngine compatibility methods
  public getAvailableOperations(_state: MergeSortState): string[] {
    return this.state.isComplete ? ['RESET'] : ['STEP', 'RESET'];
  }

  public applyOperation(_state: MergeSortState, _operation: { type: 'STEP' }): DSAOperationResult<MergeSortState> {
    const res = this.step();
    return {
      success: res.success,
      newState: res.state,
      stepDescription: res.event.description,
      isTerminal: res.isComplete
    };
  }

  public validateStep(_state: MergeSortState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Correct merge step execution.' : 'Invariant violation in merge sort.'
    };
  }

  public getVisualizationData(state: MergeSortState): any {
    return {
      type: 'SORT_MERGE_3D',
      array: state.array,
      auxiliaryArray: state.auxiliaryArray,
      currentStepIndex: state.currentStepIndex,
      totalSteps: state.steps.length,
      leftSubarray: state.activeLeftSubarray,
      rightSubarray: state.activeRightSubarray,
      comparedIndices: state.activeComparedIndices,
      writeIndex: state.activeWriteIndex,
      recursionDepth: state.recursionDepth,
      comparisonsCount: state.comparisonsCount,
      writesCount: state.writesCount,
      isComplete: state.isComplete,
      complexity: this.getComplexity()
    };
  }

  /**
   * Deterministic recursive trace generator.
   */
  private generatePrecomputedExecutionTrace(arr: number[]): MergeSortStep[] {
    const steps: MergeSortStep[] = [];
    const working = [...arr];
    const aux: (number | null)[] = new Array(arr.length).fill(null);
    let comparisons = 0;
    let writes = 0;

    const mergeSortRecursive = (left: number, right: number, depth: number) => {
      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);

      steps.push({
        stepIndex: steps.length,
        type: 'SPLIT',
        description: `Split subarray [${left}..${right}] at index ${mid} (depth ${depth}): [${working.slice(left, mid + 1).join(', ')}] and [${working.slice(mid + 1, right + 1).join(', ')}].`,
        leftSpan: { left, right: mid, mid: Math.floor((left + mid) / 2), depth: depth + 1, elements: working.slice(left, mid + 1) },
        rightSpan: { left: mid + 1, right, mid: Math.floor((mid + 1 + right) / 2), depth: depth + 1, elements: working.slice(mid + 1, right + 1) },
        workingArray: [...working],
        auxiliaryArray: [...aux],
        currentDepth: depth,
        comparisonsCount: comparisons,
        writesCount: writes
      });

      mergeSortRecursive(left, mid, depth + 1);
      mergeSortRecursive(mid + 1, right, depth + 1);

      // Merge phase
      const leftElements = working.slice(left, mid + 1);
      const rightElements = working.slice(mid + 1, right + 1);

      let i = left;
      let j = mid + 1;
      let k = left;

      while (i <= mid && j <= right) {
        comparisons++;
        const valI = working[i];
        const valJ = working[j];
        const compResult = valI <= valJ ? 'LEFT_SMALLER' : 'RIGHT_SMALLER';

        steps.push({
          stepIndex: steps.length,
          type: 'COMPARE',
          description: `Compare left element ${valI} (index ${i}) with right element ${valJ} (index ${j}). Result: ${valI <= valJ ? `${valI} <= ${valJ}` : `${valJ} < ${valI}`}.`,
          activeLeftIdx: i,
          activeRightIdx: j,
          comparedValues: [valI, valJ],
          comparisonResult: compResult,
          leftSpan: { left, right: mid, mid: Math.floor((left + mid) / 2), depth, elements: leftElements },
          rightSpan: { left: mid + 1, right, mid: Math.floor((mid + 1 + right) / 2), depth, elements: rightElements },
          workingArray: [...working],
          auxiliaryArray: [...aux],
          currentDepth: depth,
          comparisonsCount: comparisons,
          writesCount: writes
        });

        if (valI <= valJ) {
          writes++;
          aux[k] = valI;
          steps.push({
            stepIndex: steps.length,
            type: 'WRITE',
            description: `Place smaller element ${valI} into auxiliary merged buffer at index ${k}.`,
            writeIdx: k,
            workingArray: [...working],
            auxiliaryArray: [...aux],
            currentDepth: depth,
            comparisonsCount: comparisons,
            writesCount: writes
          });
          i++;
        } else {
          writes++;
          aux[k] = valJ;
          steps.push({
            stepIndex: steps.length,
            type: 'WRITE',
            description: `Place smaller element ${valJ} into auxiliary merged buffer at index ${k}.`,
            writeIdx: k,
            workingArray: [...working],
            auxiliaryArray: [...aux],
            currentDepth: depth,
            comparisonsCount: comparisons,
            writesCount: writes
          });
          j++;
        }
        k++;
      }

      while (i <= mid) {
        writes++;
        aux[k] = working[i];
        steps.push({
          stepIndex: steps.length,
          type: 'WRITE',
          description: `Copy remaining left element ${working[i]} to auxiliary buffer at index ${k}.`,
          writeIdx: k,
          workingArray: [...working],
          auxiliaryArray: [...aux],
          currentDepth: depth,
          comparisonsCount: comparisons,
          writesCount: writes
        });
        i++;
        k++;
      }

      while (j <= right) {
        writes++;
        aux[k] = working[j];
        steps.push({
          stepIndex: steps.length,
          type: 'WRITE',
          description: `Copy remaining right element ${working[j]} to auxiliary buffer at index ${k}.`,
          writeIdx: k,
          workingArray: [...working],
          auxiliaryArray: [...aux],
          currentDepth: depth,
          comparisonsCount: comparisons,
          writesCount: writes
        });
        j++;
        k++;
      }

      // Copy auxiliary buffer back to working array
      for (let idx = left; idx <= right; idx++) {
        if (aux[idx] !== null) {
          working[idx] = aux[idx] as number;
        }
      }

      steps.push({
        stepIndex: steps.length,
        type: 'COPY_BACK',
        description: `Copy sorted sub-segment [${left}..${right}] back to main array: [${working.slice(left, right + 1).join(', ')}].`,
        leftSpan: { left, right: mid, mid: Math.floor((left + mid) / 2), depth, elements: leftElements },
        rightSpan: { left: mid + 1, right, mid: Math.floor((mid + 1 + right) / 2), depth, elements: rightElements },
        workingArray: [...working],
        auxiliaryArray: [...aux],
        currentDepth: depth,
        comparisonsCount: comparisons,
        writesCount: writes
      });
    };

    mergeSortRecursive(0, arr.length - 1, 1);

    steps.push({
      stepIndex: steps.length,
      type: 'COMPLETE',
      description: `Merge Sort Complete! Final sorted array: [${working.join(', ')}]. Total comparisons: ${comparisons}, writes: ${writes}.`,
      workingArray: [...working],
      auxiliaryArray: [...aux],
      currentDepth: 0,
      comparisonsCount: comparisons,
      writesCount: writes
    });

    return steps;
  }
}
