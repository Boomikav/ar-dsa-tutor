/**
 * Deterministic Singly Linked List Learning Engine.
 * 
 * Implements authoritative linked list pointer manipulation, node-based dynamic representation with references,
 * traversal, insertion at head/tail, deletion by key, and pointer misconception detection.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { MisconceptionDiagnosis } from '../../../models/misconception';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface LinkedListNode {
  id: string;
  value: number;
  nextId: string | null;
}

export interface LinkedListState {
  nodes: Record<string, LinkedListNode>;
  headId: string | null;
  activeNodeId: string | null;
  highlightedNodeIds: string[];
  lastAction: string;
}

export interface LinkedListOperation {
  type: 'PREPEND' | 'APPEND' | 'DELETE' | 'TRAVERSE';
  value?: number;
}

export class LinkedListEngine implements IDSALearningEngine<LinkedListState, LinkedListOperation> {
  readonly topicId = 'ds-linked-list';
  readonly topicTitle = 'Linked List';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(): LinkedListState {
    const n1: LinkedListNode = { id: 'node-1', value: 10, nextId: 'node-2' };
    const n2: LinkedListNode = { id: 'node-2', value: 20, nextId: 'node-3' };
    const n3: LinkedListNode = { id: 'node-3', value: 30, nextId: null };

    return {
      nodes: { 'node-1': n1, 'node-2': n2, 'node-3': n3 },
      headId: 'node-1',
      activeNodeId: 'node-1',
      highlightedNodeIds: ['node-1'],
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: LinkedListState): string[] {
    const ops = ['PREPEND', 'APPEND'];
    if (state.headId !== null) {
      ops.push('DELETE', 'TRAVERSE');
    }
    return ops;
  }

  applyOperation(state: LinkedListState, operation: LinkedListOperation): DSAOperationResult<LinkedListState> {
    const nodes = JSON.parse(JSON.stringify(state.nodes)) as Record<string, LinkedListNode>;

    switch (operation.type) {
      case 'PREPEND': {
        const val = operation.value ?? 5;
        const newId = `node-${Date.now()}`;
        const newNode: LinkedListNode = { id: newId, value: val, nextId: state.headId };
        nodes[newId] = newNode;
        return {
          success: true,
          newState: { ...state, nodes, headId: newId, activeNodeId: newId, highlightedNodeIds: [newId], lastAction: `PREPENDED_${val}` },
          stepDescription: `O(1) prepend: created node (${val}), linked its next to old head, updated head pointer.`
        };
      }
      case 'APPEND': {
        const val = operation.value ?? 40;
        const newId = `node-${Date.now()}`;
        const newNode: LinkedListNode = { id: newId, value: val, nextId: null };
        nodes[newId] = newNode;

        if (!state.headId) {
          return {
            success: true,
            newState: { ...state, nodes, headId: newId, activeNodeId: newId, highlightedNodeIds: [newId], lastAction: `APPENDED_${val}` },
            stepDescription: `Appended ${val} as head of previously empty list.`
          };
        }

        // Traverse to find tail
        let currId: string | null = state.headId;
        while (currId && nodes[currId].nextId) {
          currId = nodes[currId].nextId;
        }
        if (currId) {
          nodes[currId].nextId = newId;
        }

        return {
          success: true,
          newState: { ...state, nodes, activeNodeId: newId, highlightedNodeIds: [newId], lastAction: `APPENDED_${val}` },
          stepDescription: `Appended node (${val}) to list tail after O(N) traversal.`
        };
      }
      case 'DELETE': {
        const targetVal = operation.value ?? 20;
        if (!state.headId) {
          return {
            success: false,
            newState: state,
            stepDescription: 'Cannot delete from empty linked list.'
          };
        }

        if (nodes[state.headId].value === targetVal) {
          const newHead = nodes[state.headId].nextId;
          delete nodes[state.headId];
          return {
            success: true,
            newState: { ...state, nodes, headId: newHead, activeNodeId: newHead, highlightedNodeIds: newHead ? [newHead] : [], lastAction: `DELETED_${targetVal}` },
            stepDescription: `Deleted head node containing ${targetVal}. Head pointer advanced to next node.`
          };
        }

        let prevId = state.headId;
        let currId = nodes[prevId].nextId;
        while (currId && nodes[currId].value !== targetVal) {
          prevId = currId;
          currId = nodes[currId].nextId;
        }

        if (!currId) {
          return {
            success: false,
            newState: state,
            stepDescription: `Node with value ${targetVal} not found in linked list.`
          };
        }

        nodes[prevId].nextId = nodes[currId].nextId;
        delete nodes[currId];

        return {
          success: true,
          newState: { ...state, nodes, activeNodeId: prevId, highlightedNodeIds: [prevId], lastAction: `DELETED_${targetVal}` },
          stepDescription: `Deleted node (${targetVal}). Bypassed pointer: node (${nodes[prevId].value}) now points to successor.`
        };
      }
      case 'TRAVERSE': {
        return {
          success: true,
          newState: state,
          stepDescription: 'Traversing linked list from head to tail null pointer.'
        };
      }
    }
  }

  validateStep(state: LinkedListState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-ll-${Date.now()}`,
        type: 'LINKED_LIST_WRONG_LINK',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Assigned pointer to ${userChoice}, but invariant requires linking to ${expectedChoice} to avoid breaking chain.`,
        correctiveGuidance: 'Ensure preceding node points directly to the succeeding node before releasing references.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid pointer update.' : 'Incorrect pointer assignment.'
    };
  }

  getVisualizationData(state: LinkedListState): any {
    const orderedNodes: LinkedListNode[] = [];
    let curr = state.headId;
    const visited = new Set<string>();

    while (curr && state.nodes[curr] && !visited.has(curr)) {
      visited.add(curr);
      orderedNodes.push(state.nodes[curr]);
      curr = state.nodes[curr].nextId;
    }

    return {
      type: 'LINKED_LIST',
      headId: state.headId,
      nodes: orderedNodes,
      activeNodeId: state.activeNodeId,
      highlightedNodeIds: state.highlightedNodeIds
    };
  }
}
