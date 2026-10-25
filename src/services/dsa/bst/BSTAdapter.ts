/**
 * BST Learning Engine Adapter.
 * 
 * Adapts the authoritative BSTEngine and BSTPracticeEngine (Phases 2-8)
 * to the generalized IDSALearningEngine interface.
 * Preserves 100% backward compatibility and reference behavior.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, DSAGuidedStep, DSAPracticeSession } from '../core/IDSALearningEngine';
import { BSTNode } from '../../../models/bst';
import { BSTEngine } from './BSTEngine';
import { BSTPracticeEngine } from './BSTPracticeEngine';
import { AdaptiveDifficultyLevel } from '../../../models/adaptiveLearner';

export interface BSTOperationPayload {
  type: 'INSERT' | 'SEARCH' | 'DELETE';
  value: number;
}

export class BSTAdapter implements IDSALearningEngine<BSTNode | null, BSTOperationPayload> {
  readonly topicId = 'ds-binary-search-tree';
  readonly topicTitle = 'Binary Search Tree';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = 'AR_READY' as const;

  getInitialState(_seed?: any): BSTNode {
    return BSTEngine.createSampleTree();
  }

  getAvailableOperations(state: BSTNode | null): string[] {
    if (!state) return ['INSERT'];
    return ['INSERT', 'SEARCH', 'TRAVERSAL'];
  }

  applyOperation(state: BSTNode | null, operation: BSTOperationPayload): DSAOperationResult<BSTNode | null> {
    const tree = state ? BSTEngine.cloneTree(state)! : null;
    if (operation.type === 'INSERT') {
      const res = BSTEngine.insert(tree, operation.value);
      return {
        success: res.success,
        newState: res.finalTreeSnapshot,
        stepDescription: `Inserted ${operation.value} into BST in ${res.steps.length} steps.`
      };
    } else if (operation.type === 'SEARCH') {
      const res = BSTEngine.search(tree, operation.value);
      return {
        success: res.success,
        newState: tree,
        stepDescription: res.success ? `Found ${operation.value} in BST.` : `Value ${operation.value} not present in BST.`
      };
    }
    return {
      success: true,
      newState: tree,
      stepDescription: 'Operation applied'
    };
  }

  validateStep(state: BSTNode | null, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = userChoice === expectedChoice;
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Correct BST directional choice.' : 'Incorrect directional choice.'
    };
  }

  getVisualizationData(state: BSTNode | null): any {
    if (!state) return null;
    const cloned = BSTEngine.cloneTree(state)!;
    BSTEngine.computeLayout(cloned, 360, 220);
    return cloned;
  }

  getGuidedSteps(initialState?: BSTNode | null): DSAGuidedStep<BSTNode | null>[] {
    const tree = initialState ? BSTEngine.cloneTree(initialState)! : BSTEngine.createSampleTree();
    const insertRes = BSTEngine.insert(tree, 40);
    return insertRes.steps.map((step, idx) => ({
      stepIndex: idx,
      title: step.decision,
      description: step.comparison,
      stateSnapshot: step.treeSnapshot ? BSTEngine.cloneTree(step.treeSnapshot)! : tree,
      invariantExplanation: step.message,
      highlightedKeys: step.currentNodeValue !== null ? [step.currentNodeValue] : []
    }));
  }

  startPracticeSession(difficulty: AdaptiveDifficultyLevel = 'MEDIUM', _seed?: any): DSAPracticeSession<BSTNode> {
    const session = BSTPracticeEngine.startSession(undefined, 40);
    return {
      sessionId: session.sessionId,
      topicId: this.topicId,
      difficulty,
      target: session.targetValue,
      currentState: session.currentTree,
      stepIndex: 0,
      maxSteps: 10,
      decisionsMade: [],
      isComplete: session.isComplete,
      isSuccess: session.isComplete && session.mistakesCount === 0,
      mistakesCount: session.mistakesCount
    };
  }
}
