/**
 * Deterministic Dijkstra Shortest Path Learning Engine.
 * 
 * Implements greedy single-source shortest path calculation:
 * Tentative distance table, unvisited set minimum selection,
 * edge relaxation: dist[v] = min(dist[v], dist[u] + weight(u, v)),
 * and observable greedy selection & relaxation misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface DijkstraState {
  vertices: string[];
  edges: Record<string, Array<{ to: string; weight: number }>>;
  distances: Record<string, number>;
  visited: string[];
  unvisited: string[];
  previous: Record<string, string | null>;
  currentVertex: string | null;
  isComplete: boolean;
  lastAction: string;
}

export class DijkstraEngine implements IDSALearningEngine<DijkstraState, { type: 'STEP' }> {
  readonly topicId = 'algo-dijkstras-algorithm';
  readonly topicTitle = "Dijkstra's Algorithm";
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { source?: string }): DijkstraState {
    const source = seed?.source ?? 'A';
    const vertices = ['A', 'B', 'C', 'D', 'E'];
    const edges: Record<string, Array<{ to: string; weight: number }>> = {
      A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
      B: [{ to: 'A', weight: 4 }, { to: 'C', weight: 1 }, { to: 'D', weight: 5 }],
      C: [{ to: 'A', weight: 2 }, { to: 'B', weight: 1 }, { to: 'D', weight: 8 }, { to: 'E', weight: 10 }],
      D: [{ to: 'B', weight: 5 }, { to: 'C', weight: 8 }, { to: 'E', weight: 2 }],
      E: [{ to: 'C', weight: 10 }, { to: 'D', weight: 2 }]
    };

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    for (const v of vertices) {
      distances[v] = v === source ? 0 : Infinity;
      previous[v] = null;
    }

    return {
      vertices,
      edges,
      distances,
      visited: [],
      unvisited: [...vertices],
      previous,
      currentVertex: null,
      isComplete: false,
      lastAction: `INITIALIZED_SOURCE_${source}`
    };
  }

  getAvailableOperations(state: DijkstraState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  getMinDistanceUnvisited(state: DijkstraState): string | null {
    let minVertex: string | null = null;
    let minDistance = Infinity;

    for (const v of state.unvisited) {
      if (state.distances[v] < minDistance) {
        minDistance = state.distances[v];
        minVertex = v;
      }
    }
    return minVertex;
  }

  applyOperation(state: DijkstraState, operation: { type: 'STEP' | 'SELECT_MIN'; vertex?: string }): DSAOperationResult<DijkstraState> {
    if (state.isComplete || state.unvisited.length === 0) {
      return { success: false, newState: { ...state, isComplete: true }, stepDescription: "Dijkstra's shortest paths complete." };
    }

    const expectedMin = this.getMinDistanceUnvisited(state);
    if (!expectedMin || state.distances[expectedMin] === Infinity) {
      return { success: true, newState: { ...state, isComplete: true }, stepDescription: 'All reachable vertices have been processed.' };
    }

    const chosen = operation.vertex ?? expectedMin;

    if (chosen !== expectedMin) {
      return {
        success: false,
        newState: state,
        stepDescription: `Greedy error: chosen vertex '${chosen}' does not have minimum distance. Expected '${expectedMin}' (dist: ${state.distances[expectedMin]}).`,
        misconception: {
          id: `diag-dijk-${Date.now()}`,
          type: 'DIJKSTRA_WRONG_MIN_DISTANCE_SELECTION',
          topicId: this.topicId,
          userChoice: chosen,
          expectedChoice: expectedMin,
          pedagogicalExplanation: `Dijkstra's greedy invariant requires selecting the unvisited vertex with smallest tentative distance. '${expectedMin}' has dist ${state.distances[expectedMin]}, whereas '${chosen}' has dist ${state.distances[chosen]}.`,
          correctiveGuidance: 'Pick the unvisited node with minimum tentative distance.',
          timestamp: new Date().toISOString()
        }
      };
    }

    const current = chosen;
    const distances = { ...state.distances };
    const previous = { ...state.previous };
    const unvisited = state.unvisited.filter(v => v !== current);
    const visited = [...state.visited, current];

    // Relax neighbors
    const neighbors = state.edges[current] || [];
    const relaxed: string[] = [];

    for (const edge of neighbors) {
      if (unvisited.includes(edge.to)) {
        const alt = distances[current] + edge.weight;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = current;
          relaxed.push(`${edge.to}=${alt}`);
        }
      }
    }

    const isComplete = unvisited.length === 0;

    return {
      success: true,
      newState: {
        ...state,
        distances,
        previous,
        visited,
        unvisited,
        currentVertex: current,
        isComplete,
        lastAction: `RELAXED_FROM_${current}`
      },
      stepDescription: `Selected '${current}' (dist: ${state.distances[current]}). Relaxed neighbors: [${relaxed.join(', ')}]. Remaining unvisited: ${unvisited.length}.`
    };
  }

  validateStep(state: DijkstraState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const expected = expectedChoice ?? this.getMinDistanceUnvisited(state);
    const isCorrect = String(userChoice) === String(expected);

    return {
      isCorrect,
      expectedChoice: expected,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-dijk-${Date.now()}`,
        type: 'DIJKSTRA_WRONG_MIN_DISTANCE_SELECTION',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expected),
        pedagogicalExplanation: `Greedy choice requires picking vertex with minimum distance. Pick '${expected}'.`,
        correctiveGuidance: 'Examine tentative distance table and pick minimum among unvisited.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid greedy choice.' : 'Greedy selection invariant violated.'
    };
  }

  getVisualizationData(state: DijkstraState): any {
    return {
      type: 'GRAPH_DIJKSTRA',
      vertices: state.vertices,
      edges: state.edges,
      distances: state.distances,
      visited: state.visited,
      unvisited: state.unvisited,
      currentVertex: state.currentVertex,
      previous: state.previous,
      isComplete: state.isComplete
    };
  }
}
