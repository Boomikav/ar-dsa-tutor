/**
 * Deterministic Depth-First Search (DFS) Learning Engine.
 * 
 * Implements depth-first graph traversal via LIFO Stack / Call-Stack:
 * Deep branch exploration, backtracking, visited tracking,
 * and observable branch / visited misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface DFSState {
  vertices: string[];
  adjacencyList: Record<string, string[]>;
  stack: string[];
  visited: string[];
  traversalOrder: string[];
  currentVertex: string | null;
  isComplete: boolean;
  lastAction: string;
}

export class DFSEngine implements IDSALearningEngine<DFSState, { type: 'STEP' | 'EXPAND'; vertex?: string }> {
  readonly topicId = 'algo-depth-first-search';
  readonly topicTitle = 'Depth-First Search';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { startVertex?: string }): DFSState {
    const start = seed?.startVertex ?? 'A';
    const vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
    const adjacencyList: Record<string, string[]> = {
      A: ['B', 'C'],
      B: ['A', 'D', 'E'],
      C: ['A', 'F'],
      D: ['B'],
      E: ['B', 'F'],
      F: ['C', 'E']
    };

    return {
      vertices,
      adjacencyList,
      stack: [start],
      visited: [start],
      traversalOrder: [],
      currentVertex: null,
      isComplete: false,
      lastAction: `INITIALIZED_AT_${start}`
    };
  }

  getAvailableOperations(state: DFSState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP', 'EXPAND'];
  }

  applyOperation(state: DFSState, operation: { type: 'STEP' | 'EXPAND'; vertex?: string }): DSAOperationResult<DFSState> {
    if (state.isComplete || state.stack.length === 0) {
      return { success: false, newState: { ...state, isComplete: true }, stepDescription: 'DFS traversal completed.' };
    }

    const stack = [...state.stack];
    const visited = [...state.visited];
    const traversalOrder = [...state.traversalOrder];

    const current = stack.pop()!;
    if (!traversalOrder.includes(current)) {
      traversalOrder.push(current);
    }

    // Push unvisited neighbors onto LIFO stack (in reverse order so first neighbor is popped first)
    const neighbors = state.adjacencyList[current] || [];
    const added: string[] = [];

    for (let i = neighbors.length - 1; i >= 0; i--) {
      const n = neighbors[i];
      if (!visited.includes(n)) {
        visited.push(n);
        stack.push(n);
        added.push(n);
      }
    }

    const isComplete = stack.length === 0;

    return {
      success: true,
      newState: {
        ...state,
        stack,
        visited,
        traversalOrder,
        currentVertex: current,
        isComplete,
        lastAction: `VISITED_${current}`
      },
      stepDescription: `Popped '${current}' from DFS stack. Pushed unvisited neighbors: [${added.join(', ')}]. Stack depth: ${stack.length}.`
    };
  }

  validateStep(state: DFSState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-dfs-${Date.now()}`,
        type: 'DFS_WRONG_BRANCH',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `DFS explores deep along the current branch before backtracking. Expected '${expectedChoice}', but user selected '${userChoice}'.`,
        correctiveGuidance: 'Follow the LIFO stack order to descend down child paths before exploring peer branches.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid DFS deep step.' : 'Incorrect DFS branch chosen.'
    };
  }

  getVisualizationData(state: DFSState): any {
    return {
      type: 'GRAPH_DFS',
      vertices: state.vertices,
      adjacencyList: state.adjacencyList,
      stack: state.stack,
      visited: state.visited,
      traversalOrder: state.traversalOrder,
      currentVertex: state.currentVertex,
      isComplete: state.isComplete
    };
  }
}
