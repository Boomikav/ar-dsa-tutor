/**
 * Authoritative Dijkstra Shortest Path Learning Engine
 * 
 * Implements greedy single-source shortest path calculation:
 * 1. Weighted undirected graph with strict non-negative edge weights
 * 2. Min-Heap Priority Queue for O(log V) minimum vertex extraction
 * 3. Tentative distance table: dist[v] = min(dist[v], dist[u] + weight(u, v))
 * 4. Visited / unvisited tracking and predecessor pointers
 * 5. Shortest path reconstruction from source to destination
 * 6. Handles unreachable destinations gracefully
 * 7. Rejects negative edge weights (violates greedy optimal substructure)
 * 8. Theoretical complexity: O((V + E) log V) with binary heap
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, VisualizationCapability } from '../core/IDSALearningEngine';
import { 
  IInteractiveAlgorithmEngine, 
  AlgorithmComplexityInfo, 
  AlgorithmMetricsSnapshot, 
  AlgorithmExecutionEvent, 
  StepExecutionResult 
} from '../core/IAlgorithmEngine';

export interface WeightedEdge {
  to: string;
  weight: number;
}

export interface DijkstraPQItem {
  vertex: string;
  distance: number;
}

/**
 * Deterministic Binary Min-Heap Priority Queue.
 */
export class MinHeapPriorityQueue {
  private heap: DijkstraPQItem[] = [];
  public operationCount = 0;

  public push(vertex: string, distance: number): void {
    this.operationCount++;
    this.heap.push({ vertex, distance });
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): DijkstraPQItem | null {
    if (this.heap.length === 0) return null;
    this.operationCount++;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  public getSnapshot(): DijkstraPQItem[] {
    return [...this.heap].sort((a, b) => a.distance - b.distance);
  }

  private bubbleUp(index: number): void {
    const item = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      if (item.distance >= parent.distance) break;
      this.heap[index] = parent;
      index = parentIdx;
    }
    this.heap[index] = item;
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    const item = this.heap[index];
    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swapIdx: number | null = null;

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].distance < item.distance) {
          swapIdx = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const compareDist = swapIdx === null ? item.distance : this.heap[leftChildIdx].distance;
        if (this.heap[rightChildIdx].distance < compareDist) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx === null) break;
      this.heap[index] = this.heap[swapIdx];
      index = swapIdx;
    }
    this.heap[index] = item;
  }
}

export interface DijkstraStepTrace {
  stepIndex: number;
  type: 'SELECT_MIN' | 'RELAX_EDGE' | 'COMPLETE';
  currentVertex: string;
  currentDistance: number;
  relaxedEdge?: { from: string; to: string; weight: number; oldDist: number; newDist: number };
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  unvisited: string[];
  pqItems: DijkstraPQItem[];
  description: string;
}

export interface DijkstraState {
  source: string;
  destination: string;
  vertices: string[];
  edges: Record<string, WeightedEdge[]>;
  distances: Record<string, number>;
  visited: string[];
  unvisited: string[];
  previous: Record<string, string | null>;
  currentVertex: string | null;
  activeRelaxedEdge: { from: string; to: string; weight: number } | null;
  shortestPath: string[];
  shortestPathCost: number;
  isComplete: boolean;
  isDestinationReachable: boolean;
  relaxationsCount: number;
  pqOperationsCount: number;
  currentStepIndex: number;
  totalSteps: number;
  lastAction: string;
}

export class DijkstraEngine implements IDSALearningEngine<DijkstraState, { type: 'STEP' | 'SET_DESTINATION'; destination?: string }>, IInteractiveAlgorithmEngine<DijkstraState> {
  readonly topicId = 'algo-dijkstras-algorithm';
  readonly algorithmId = 'algo-dijkstras-algorithm';
  readonly topicTitle = "Dijkstra's Shortest Path";
  readonly title = "Dijkstra's Algorithm";
  readonly category = 'algorithm' as const;
  readonly visualizationCapability: VisualizationCapability = '3D_READY';

  private state!: DijkstraState;
  private trace: DijkstraStepTrace[] = [];
  private startTime = 0;
  private eventHistory: AlgorithmExecutionEvent<DijkstraState>[] = [];

  constructor() {
    this.initialize({ source: 'A', destination: 'E' });
  }

  public getComplexity(): AlgorithmComplexityInfo {
    return {
      timeComplexity: {
        best: 'O((V + E) log V)',
        average: 'O((V + E) log V)',
        worst: 'O((V + E) log V)'
      },
      spaceComplexity: {
        auxiliary: 'O(V)',
        total: 'O(V + E)'
      },
      stability: undefined,
      paradigm: 'Greedy',
      invariants: [
        'Greedy Choice: At each iteration, the unvisited vertex with the minimum tentative distance is permanently settled.',
        'Optimal Substructure: Shortest paths contain sub-paths that are themselves shortest paths.',
        'Non-Negative Weights: Edge weights must be non-negative (w >= 0); negative edges violate greedy settlement validity.',
        'Triangle Inequality: dist[v] <= dist[u] + weight(u, v) for all settled edges.'
      ]
    };
  }

  public getMetrics(): AlgorithmMetricsSnapshot {
    return {
      comparisonsCount: this.state.relaxationsCount,
      writesCount: this.state.pqOperationsCount,
      stepsCount: this.state.currentStepIndex,
      relaxationsCount: this.state.relaxationsCount,
      elapsedMs: this.startTime ? Math.max(1, Date.now() - this.startTime) : 0,
      inputSize: this.state.vertices.length,
      auxiliaryMemoryBytes: (this.state.vertices.length * 16) + (this.state.visited.length * 8)
    };
  }

  public initialize(config?: { source?: string; destination?: string }): DijkstraState {
    const source = config?.source ?? 'A';
    const destination = config?.destination ?? 'E';

    // Standard 6-node weighted graph for clear 3D presentation
    const vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
    const edges: Record<string, WeightedEdge[]> = {
      A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
      B: [{ to: 'A', weight: 4 }, { to: 'C', weight: 1 }, { to: 'D', weight: 5 }],
      C: [{ to: 'A', weight: 2 }, { to: 'B', weight: 1 }, { to: 'D', weight: 8 }, { to: 'E', weight: 10 }, { to: 'F', weight: 4 }],
      D: [{ to: 'B', weight: 5 }, { to: 'C', weight: 8 }, { to: 'E', weight: 2 }],
      E: [{ to: 'C', weight: 10 }, { to: 'D', weight: 2 }, { to: 'F', weight: 3 }],
      F: [{ to: 'C', weight: 4 }, { to: 'E', weight: 3 }]
    };

    // Validate non-negative edge weights
    for (const u of Object.keys(edges)) {
      for (const edge of edges[u]) {
        if (edge.weight < 0) {
          throw new Error(`Dijkstra invariant violation: Negative edge weight detected on (${u} -> ${edge.to}, weight: ${edge.weight}). Dijkstra requires non-negative edge weights.`);
        }
      }
    }

    this.trace = this.computeFullDijkstraTrace(vertices, edges, source);
    this.startTime = Date.now();
    this.eventHistory = [];

    const initialDistances: Record<string, number> = {};
    const initialPrevious: Record<string, string | null> = {};
    for (const v of vertices) {
      initialDistances[v] = v === source ? 0 : Infinity;
      initialPrevious[v] = null;
    }

    this.state = {
      source,
      destination,
      vertices,
      edges,
      distances: initialDistances,
      visited: [],
      unvisited: [...vertices],
      previous: initialPrevious,
      currentVertex: null,
      activeRelaxedEdge: null,
      shortestPath: [],
      shortestPathCost: Infinity,
      isComplete: false,
      isDestinationReachable: true,
      relaxationsCount: 0,
      pqOperationsCount: 0,
      currentStepIndex: 0,
      totalSteps: this.trace.length,
      lastAction: `INITIALIZED_SOURCE_${source}`
    };

    return this.getCurrentState();
  }

  public getInitialState(seed?: { source?: string }): DijkstraState {
    return this.initialize(seed);
  }

  public getCurrentState(): DijkstraState {
    return {
      ...this.state,
      distances: { ...this.state.distances },
      previous: { ...this.state.previous },
      visited: [...this.state.visited],
      unvisited: [...this.state.unvisited],
      shortestPath: [...this.state.shortestPath]
    };
  }

  public isCompleted(): boolean {
    return this.state.isComplete;
  }

  public getEventHistory(): readonly AlgorithmExecutionEvent<DijkstraState>[] {
    return this.eventHistory;
  }

  public reset(): DijkstraState {
    return this.initialize({ source: this.state.source, destination: this.state.destination });
  }

  public setDestination(destination: string): void {
    if (this.state.vertices.includes(destination)) {
      this.state.destination = destination;
      if (this.state.isComplete) {
        this.reconstructShortestPath();
      }
    }
  }

  public step(): StepExecutionResult<DijkstraState> {
    if (this.state.isComplete || this.state.currentStepIndex >= this.trace.length) {
      this.reconstructShortestPath();
      const completeEvent: AlgorithmExecutionEvent<DijkstraState> = {
        type: 'COMPLETE',
        stepIndex: this.state.currentStepIndex,
        description: `Dijkstra complete! Shortest path to ${this.state.destination}: ${this.state.shortestPath.join(' -> ')} (Cost: ${this.state.shortestPathCost}).`,
        stateSnapshot: this.getCurrentState(),
        metrics: this.getMetrics(),
        timestamp: Date.now()
      };
      this.eventHistory.push(completeEvent);
      this.state.isComplete = true;
      return { success: false, state: this.getCurrentState(), event: completeEvent, isComplete: true };
    }

    const currentStep = this.trace[this.state.currentStepIndex];
    const nextIdx = this.state.currentStepIndex + 1;
    const isComplete = nextIdx >= this.trace.length;

    this.state.currentStepIndex = nextIdx;
    this.state.currentVertex = currentStep.currentVertex;
    this.state.distances = { ...currentStep.distances };
    this.state.previous = { ...currentStep.previous };
    this.state.visited = [...currentStep.visited];
    this.state.unvisited = [...currentStep.unvisited];
    this.state.isComplete = isComplete;
    this.state.lastAction = currentStep.type;

    if (currentStep.type === 'RELAX_EDGE' && currentStep.relaxedEdge) {
      this.state.relaxationsCount++;
      this.state.activeRelaxedEdge = {
        from: currentStep.relaxedEdge.from,
        to: currentStep.relaxedEdge.to,
        weight: currentStep.relaxedEdge.weight
      };
    } else {
      this.state.activeRelaxedEdge = null;
    }

    if (isComplete) {
      this.reconstructShortestPath();
    }

    const eventType = (currentStep.type === 'RELAX_EDGE' ? 'RELAX_EDGE' : 'STEP') as any;
    const event: AlgorithmExecutionEvent<DijkstraState> = {
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
  public getAvailableOperations(state: DijkstraState): string[] {
    return state.isComplete ? ['RESET', 'SET_DESTINATION'] : ['STEP', 'RESET', 'SET_DESTINATION'];
  }

  public applyOperation(state: DijkstraState, operation: { type: 'STEP' | 'SET_DESTINATION'; destination?: string }): DSAOperationResult<DijkstraState> {
    if (operation.type === 'SET_DESTINATION' && operation.destination) {
      this.setDestination(operation.destination);
      return { success: true, newState: this.getCurrentState(), stepDescription: `Destination set to ${operation.destination}.` };
    }

    const res = this.step();
    return {
      success: res.success,
      newState: res.state,
      stepDescription: res.event.description,
      isTerminal: res.isComplete
    };
  }

  public validateStep(state: DijkstraState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Valid greedy vertex selection.' : 'Greedy choice violated: must pick unvisited node with minimum tentative distance.'
    };
  }

  public getVisualizationData(state: DijkstraState): any {
    return {
      type: 'GRAPH_DIJKSTRA_3D',
      source: state.source,
      destination: state.destination,
      vertices: state.vertices,
      edges: state.edges,
      distances: state.distances,
      visited: state.visited,
      unvisited: state.unvisited,
      currentVertex: state.currentVertex,
      activeRelaxedEdge: state.activeRelaxedEdge,
      previous: state.previous,
      shortestPath: state.shortestPath,
      shortestPathCost: state.shortestPathCost,
      isComplete: state.isComplete,
      relaxationsCount: state.relaxationsCount,
      complexity: this.getComplexity()
    };
  }

  private reconstructShortestPath(): void {
    const path: string[] = [];
    let curr: string | null = this.state.destination;

    while (curr !== null) {
      path.unshift(curr);
      if (curr === this.state.source) break;
      curr = this.state.previous[curr];
    }

    if (path.length > 0 && path[0] === this.state.source) {
      this.state.shortestPath = path;
      this.state.shortestPathCost = this.state.distances[this.state.destination];
      this.state.isDestinationReachable = true;
    } else {
      this.state.shortestPath = [];
      this.state.shortestPathCost = Infinity;
      this.state.isDestinationReachable = false;
    }
  }

  private computeFullDijkstraTrace(
    vertices: string[],
    edges: Record<string, WeightedEdge[]>,
    source: string
  ): DijkstraStepTrace[] {
    const traces: DijkstraStepTrace[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited: string[] = [];
    let unvisited = [...vertices];
    const pq = new MinHeapPriorityQueue();

    for (const v of vertices) {
      distances[v] = v === source ? 0 : Infinity;
      previous[v] = null;
    }

    pq.push(source, 0);

    while (!pq.isEmpty()) {
      const top = pq.pop()!;
      const u = top.vertex;

      if (visited.includes(u)) continue;

      visited.push(u);
      unvisited = unvisited.filter(v => v !== u);

      traces.push({
        stepIndex: traces.length,
        type: 'SELECT_MIN',
        currentVertex: u,
        currentDistance: top.distance,
        distances: { ...distances },
        previous: { ...previous },
        visited: [...visited],
        unvisited: [...unvisited],
        pqItems: pq.getSnapshot(),
        description: `Settled vertex '${u}' with minimum tentative distance ${distances[u]}.`
      });

      const neighbors = edges[u] || [];
      for (const edge of neighbors) {
        const v = edge.to;
        if (!visited.includes(v)) {
          const oldDist = distances[v];
          const newDist = distances[u] + edge.weight;

          if (newDist < oldDist) {
            distances[v] = newDist;
            previous[v] = u;
            pq.push(v, newDist);

            traces.push({
              stepIndex: traces.length,
              type: 'RELAX_EDGE',
              currentVertex: u,
              currentDistance: distances[u],
              relaxedEdge: { from: u, to: v, weight: edge.weight, oldDist, newDist },
              distances: { ...distances },
              previous: { ...previous },
              visited: [...visited],
              unvisited: [...unvisited],
              pqItems: pq.getSnapshot(),
              description: `Relax edge (${u} -> ${v}, w=${edge.weight}): dist[${v}] updated from ${oldDist === Infinity ? '∞' : oldDist} to ${newDist}.`
            });
          }
        }
      }
    }

    return traces;
  }
}
