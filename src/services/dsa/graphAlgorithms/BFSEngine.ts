/**
 * Deterministic Breadth-First Search (BFS) Learning Engine (Demonstration 3).
 * 
 * Implements level-order graph traversal via FIFO Queue:
 * Frontier maintenance, visited set checking, level-by-level exploration,
 * and observable frontier / visited misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface BFSState {
  vertices: string[];
  adjacencyList: Record<string, string[]>;
  queue: string[];
  visited: string[];
  traversalOrder: string[];
  currentVertex: string | null;
  isComplete: boolean;
  lastAction: string;
}

export class BFSEngine implements IDSALearningEngine<BFSState, { type: 'STEP' | 'EXPAND'; vertex?: string }> {
  readonly topicId = 'algo-breadth-first-search';
  readonly topicTitle = 'Breadth-First Search';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { startVertex?: string }): BFSState {
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
      queue: [start],
      visited: [start],
      traversalOrder: [],
      currentVertex: null,
      isComplete: false,
      lastAction: `INITIALIZED_AT_${start}`
    };
  }

  getAvailableOperations(state: BFSState): string[] {
    return state.isComplete ? ['RESET'] : ['EXPAND', 'STEP'];
  }

  getExpectedNextVertex(state: BFSState): string | null {
    if (state.queue.length === 0) return null;
    return state.queue[0];
  }

  applyOperation(state: BFSState, operation: { type: 'STEP' | 'EXPAND'; vertex?: string }): DSAOperationResult<BFSState> {
    if (state.isComplete || state.queue.length === 0) {
      return { success: false, newState: { ...state, isComplete: true }, stepDescription: 'BFS traversal complete.' };
    }

    const queue = [...state.queue];
    const visited = [...state.visited];
    const traversalOrder = [...state.traversalOrder];

    const expected = queue[0];
    const chosen = operation.vertex ?? expected;

    // Validate decision
    if (chosen !== expected) {
      const isAlreadyVisited = traversalOrder.includes(chosen);
      const isNotInQueue = !queue.includes(chosen);

      const misconception: MisconceptionDiagnosis = {
        id: `diag-bfs-${Date.now()}`,
        type: isAlreadyVisited ? 'BFS_VISITED_ERROR' : 'BFS_WRONG_FRONTIER',
        topicId: this.topicId,
        userChoice: chosen,
        expectedChoice: expected,
        pedagogicalExplanation: isAlreadyVisited
          ? `Vertex '${chosen}' has already been processed and placed in traversal order. Re-visiting it causes cycles.`
          : `BFS processes the frontier in strict FIFO queue order. Front vertex is '${expected}', but user chose '${chosen}'.`,
        correctiveGuidance: `Dequeue from the front of the queue ('${expected}').`,
        timestamp: new Date().toISOString()
      };

      return {
        success: false,
        newState: state,
        stepDescription: `Incorrect BFS expansion: expected '${expected}', got '${chosen}'.`,
        misconception
      };
    }

    // Dequeue current
    const current = queue.shift()!;
    traversalOrder.push(current);

    // Enqueue unvisited neighbors
    const neighbors = state.adjacencyList[current] || [];
    const newlyAdded: string[] = [];

    for (const n of neighbors) {
      if (!visited.includes(n)) {
        visited.push(n);
        queue.push(n);
        newlyAdded.push(n);
      }
    }

    const isComplete = queue.length === 0;

    const newState: BFSState = {
      ...state,
      queue,
      visited,
      traversalOrder,
      currentVertex: current,
      isComplete,
      lastAction: `EXPANDED_${current}`
    };

    return {
      success: true,
      newState,
      stepDescription: `Dequeued '${current}'. Enqueued unvisited neighbors: [${newlyAdded.join(', ')}]. Frontier size: ${queue.length}.`
    };
  }

  validateStep(state: BFSState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const expected = expectedChoice ?? this.getExpectedNextVertex(state);
    const isCorrect = String(userChoice) === String(expected);

    return {
      isCorrect,
      expectedChoice: expected,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-bfs-${Date.now()}`,
        type: state.traversalOrder.includes(userChoice) ? 'BFS_VISITED_ERROR' : 'BFS_WRONG_FRONTIER',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expected),
        pedagogicalExplanation: `BFS queue front requires dequeuing '${expected}'. Selected '${userChoice}'.`,
        correctiveGuidance: 'Follow FIFO queue order for breadth-first level expansion.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Correct BFS frontier expansion.' : 'Invalid frontier vertex.'
    };
  }

  getVisualizationData(state: BFSState): any {
    return {
      type: 'GRAPH_BFS',
      vertices: state.vertices,
      adjacencyList: state.adjacencyList,
      currentVertex: state.currentVertex,
      queue: state.queue,
      visited: state.visited,
      traversalOrder: state.traversalOrder,
      isComplete: state.isComplete
    };
  }

  getGuidedSteps(initialState?: BFSState): DSAGuidedStep<BFSState>[] {
    const base = initialState ?? this.getInitialState();
    // Trace: A -> B, C -> D, E -> F
    const s0 = { ...base };
    const s1 = { ...base, queue: ['B', 'C'], visited: ['A', 'B', 'C'], traversalOrder: ['A'], currentVertex: 'A', lastAction: 'EXPANDED_A' };
    const s2 = { ...base, queue: ['C', 'D', 'E'], visited: ['A', 'B', 'C', 'D', 'E'], traversalOrder: ['A', 'B'], currentVertex: 'B', lastAction: 'EXPANDED_B' };

    return [
      {
        stepIndex: 0,
        title: 'BFS Initialization',
        description: 'Start vertex A added to Queue and marked Visited. Queue: [A].',
        stateSnapshot: s0,
        invariantExplanation: 'BFS explores nodes level-by-level using a FIFO Queue.'
      },
      {
        stepIndex: 1,
        title: 'Level 1 Expansion (A)',
        description: 'Dequeued A. Discovered neighbors B and C. Queue: [B, C]. Traversal: [A].',
        stateSnapshot: s1,
        invariantExplanation: 'All immediate neighbors of the source are enqueued before moving to level 2.'
      },
      {
        stepIndex: 2,
        title: 'Level 1 Continuation (B)',
        description: 'Dequeued B from front. Discovered neighbors D and E. Queue: [C, D, E]. Traversal: [A, B].',
        stateSnapshot: s2,
        invariantExplanation: 'FIFO ordering ensures C is processed before B\'s children (D and E).'
      }
    ];
  }

  startPracticeSession(difficulty: AdaptiveDifficultyLevel = 'MEDIUM'): DSAPracticeSession<BFSState> {
    const state = this.getInitialState();
    return {
      sessionId: `bfs-practice-${Date.now()}`,
      topicId: this.topicId,
      difficulty,
      currentState: state,
      stepIndex: 0,
      maxSteps: 6,
      decisionsMade: [],
      isComplete: false,
      isSuccess: false,
      mistakesCount: 0
    };
  }

  evaluatePracticeStep(
    session: DSAPracticeSession<BFSState>,
    userDecision: string
  ): {
    updatedSession: DSAPracticeSession<BFSState>;
    validation: StepValidationResult;
  } {
    const validation = this.validateStep(session.currentState, userDecision);
    let updatedSession = { ...session };

    if (!validation.isCorrect) {
      updatedSession.mistakesCount += 1;
      updatedSession.decisionsMade.push({
        stepIndex: session.stepIndex,
        prompt: `Select next vertex to dequeue from frontier queue: [${session.currentState.queue.join(', ')}]`,
        userChoice: userDecision,
        expectedChoice: validation.expectedChoice,
        isCorrect: false,
        misconception: validation.misconception,
        timestamp: new Date().toISOString()
      });
      return { updatedSession, validation };
    }

    const op = this.applyOperation(session.currentState, { type: 'EXPAND', vertex: userDecision });
    updatedSession.currentState = op.newState;
    updatedSession.stepIndex += 1;
    updatedSession.isComplete = op.newState.isComplete;
    updatedSession.isSuccess = op.newState.isComplete && updatedSession.mistakesCount === 0;
    updatedSession.decisionsMade.push({
      stepIndex: session.stepIndex,
      prompt: `Dequeued ${userDecision}`,
      userChoice: userDecision,
      expectedChoice: validation.expectedChoice,
      isCorrect: true,
      timestamp: new Date().toISOString()
    });

    return { updatedSession, validation };
  }
}
