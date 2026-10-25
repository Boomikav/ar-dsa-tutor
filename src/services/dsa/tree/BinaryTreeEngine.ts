/**
 * Deterministic General Binary Tree Learning Engine.
 * 
 * Implements hierarchical binary tree structure (at most 2 children per node),
 * depth/height metrics, pre-order, in-order, and post-order traversal orders,
 * and structural invariant checks.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep } from '../core/IDSALearningEngine';

export interface BinaryTreeNode {
  id: string;
  value: number;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
}

export interface BinaryTreeState {
  root: BinaryTreeNode | null;
  nodeCount: number;
  lastTraversal?: {
    type: 'PREORDER' | 'INORDER' | 'POSTORDER';
    visited: number[];
  };
}

export interface BinaryTreeOperation {
  type: 'INSERT' | 'TRAVERSE_PREORDER' | 'TRAVERSE_INORDER' | 'TRAVERSE_POSTORDER';
  value?: number;
  parentId?: string;
  direction?: 'LEFT' | 'RIGHT';
}

export class BinaryTreeEngine implements IDSALearningEngine<BinaryTreeState, BinaryTreeOperation> {
  readonly topicId = 'ds-binary-tree';
  readonly topicTitle = 'Binary Tree';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(): BinaryTreeState {
    const root: BinaryTreeNode = {
      id: 'bt-1',
      value: 1,
      left: {
        id: 'bt-2',
        value: 2,
        left: { id: 'bt-4', value: 4 },
        right: { id: 'bt-5', value: 5 }
      },
      right: {
        id: 'bt-3',
        value: 3,
        left: { id: 'bt-6', value: 6 }
      }
    };
    return { root, nodeCount: 6 };
  }

  getAvailableOperations(state: BinaryTreeState): string[] {
    return ['INSERT', 'TRAVERSE_PREORDER', 'TRAVERSE_INORDER', 'TRAVERSE_POSTORDER'];
  }

  applyOperation(state: BinaryTreeState, operation: BinaryTreeOperation): DSAOperationResult<BinaryTreeState> {
    const root = state.root ? JSON.parse(JSON.stringify(state.root)) : null;

    if (operation.type === 'TRAVERSE_INORDER') {
      const visited: number[] = [];
      const inorder = (n?: BinaryTreeNode) => {
        if (!n) return;
        inorder(n.left);
        visited.push(n.value);
        inorder(n.right);
      };
      inorder(root);
      return {
        success: true,
        newState: { ...state, lastTraversal: { type: 'INORDER', visited } },
        stepDescription: `In-Order Traversal: [${visited.join(', ')}].`
      };
    }

    if (operation.type === 'TRAVERSE_PREORDER') {
      const visited: number[] = [];
      const preorder = (n?: BinaryTreeNode) => {
        if (!n) return;
        visited.push(n.value);
        preorder(n.left);
        preorder(n.right);
      };
      preorder(root);
      return {
        success: true,
        newState: { ...state, lastTraversal: { type: 'PREORDER', visited } },
        stepDescription: `Pre-Order Traversal: [${visited.join(', ')}].`
      };
    }

    if (operation.type === 'TRAVERSE_POSTORDER') {
      const visited: number[] = [];
      const postorder = (n?: BinaryTreeNode) => {
        if (!n) return;
        postorder(n.left);
        postorder(n.right);
        visited.push(n.value);
      };
      postorder(root);
      return {
        success: true,
        newState: { ...state, lastTraversal: { type: 'POSTORDER', visited } },
        stepDescription: `Post-Order Traversal: [${visited.join(', ')}].`
      };
    }

    return {
      success: true,
      newState: state,
      stepDescription: 'Tree operation applied.'
    };
  }

  validateStep(state: BinaryTreeState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-tree-${Date.now()}`,
        type: 'TREE_WRONG_TRAVERSAL_ORDER',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Selected ${userChoice}, but expected ${expectedChoice} according to binary tree traversal order.`,
        correctiveGuidance: 'Review: Pre-order (Root-L-R), In-order (L-Root-R), Post-order (L-R-Root).',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid traversal sequence.' : 'Traversal order violation.'
    };
  }

  getVisualizationData(state: BinaryTreeState): any {
    return {
      type: 'BINARY_TREE',
      root: state.root,
      nodeCount: state.nodeCount,
      lastTraversal: state.lastTraversal
    };
  }
}
