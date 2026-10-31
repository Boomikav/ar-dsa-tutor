/**
 * Common Algorithm Engine Architecture & Contracts
 * 
 * Formal separation of concerns:
 * 1. Algorithm Engine (Authoritative pure state machine, independent of Three.js)
 * 2. Execution-State Model (Immutable snapshots of data structures)
 * 3. Event Generation (Discriminated execution events consumed by visualizers)
 * 4. Metrics Collector (Comparisons, writes, memory, depth, latency)
 * 5. Complexity Specification (Asymptotic time & space invariants)
 * 6. Explanation Provider (Step-grounded educational reasoning)
 */

export interface AlgorithmComplexityInfo {
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: {
    auxiliary: string;
    total: string;
  };
  stability?: boolean;
  paradigm: 'Divide and Conquer' | 'Greedy' | 'Self-Balancing Tree' | 'Comparison Sort' | 'Search' | 'Graph Traversal' | 'LIFO Data Structure';
  invariants: string[];
}

export interface AlgorithmMetricsSnapshot {
  comparisonsCount: number;
  writesCount: number;
  stepsCount: number;
  recursionDepth?: number;
  treeHeight?: number;
  rotationsCount?: number;
  relaxationsCount?: number;
  elapsedMs: number;
  inputSize: number;
  auxiliaryMemoryBytes?: number;
}

export type AlgorithmExecutionEventType =
  | 'INITIALIZE'
  | 'STEP'
  | 'COMPARE'
  | 'SWAP'
  | 'WRITE'
  | 'SPLIT'
  | 'MERGE'
  | 'ROTATE_LL'
  | 'ROTATE_RR'
  | 'ROTATE_LR'
  | 'ROTATE_RL'
  | 'ENQUEUE'
  | 'DEQUEUE'
  | 'PUSH'
  | 'POP'
  | 'RELAX_EDGE'
  | 'MIN_SELECTED'
  | 'COMPLETE'
  | 'RESET';

export interface AlgorithmExecutionEvent<TState = any> {
  type: AlgorithmExecutionEventType;
  stepIndex: number;
  description: string;
  stateSnapshot: TState;
  affectedIndices?: number[];
  affectedKeys?: (string | number)[];
  metrics: AlgorithmMetricsSnapshot;
  timestamp: number;
}

export interface StepExecutionResult<TState = any> {
  success: boolean;
  state: TState;
  event: AlgorithmExecutionEvent<TState>;
  isComplete: boolean;
}

export interface IInteractiveAlgorithmEngine<TState = any, TOperation = any> {
  readonly algorithmId: string;
  readonly title: string;
  readonly category: string;
  
  initialize(initialData?: any): TState;
  getCurrentState(): TState;
  step(operation?: TOperation): StepExecutionResult<TState>;
  reset(): TState;
  getMetrics(): AlgorithmMetricsSnapshot;
  getComplexity(): AlgorithmComplexityInfo;
  isCompleted(): boolean;
  getEventHistory(): readonly AlgorithmExecutionEvent<TState>[];
}
