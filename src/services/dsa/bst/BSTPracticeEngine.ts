import { BSTNode, BSTOperationStep } from '../../../models/bst';
import { 
  MisconceptionDiagnosis, 
  PracticeDecisionEvent 
} from '../../../models/misconception';
import { BSTEngine } from './BSTEngine';
import { IAnalyticsService } from '../../analytics/IAnalyticsService';

export interface PracticeSessionState {
  sessionId: string;
  topicId: string;
  initialTree: BSTNode;
  currentTree: BSTNode;
  targetValue: number;
  currentNode: BSTNode;
  canonicalSteps: BSTOperationStep[];
  canonicalStepIndex: number;
  decisionsMade: PracticeDecisionEvent[];
  mistakesCount: number;
  lastDiagnosis: MisconceptionDiagnosis | null;
  isComplete: boolean;
  scorePercentage: number;
}

/**
 * Interactive Decision-Driven BST Practice Engine.
 * 
 * Tests active algorithmic decision-making:
 * Learners must choose [LEFT], [RIGHT], or [INSERT HERE] at every traversal junction.
 * Errors are diagnosed into structured pedagogical misconceptions rather than generic UI text.
 */
export class BSTPracticeEngine {
  public static readonly CANDIDATE_TARGETS: number[] = [
    65, 35, 85, 25, 75, 15, 45, 55, 95, 10, 38, 68
  ];

  /**
   * Deterministically selects the next target insertion value that:
   * 1. Advances through candidate pool (40 -> 65 -> 35 -> 85 -> 25 -> 75 -> 15...)
   * 2. Does not already exist in the BST.
   * 3. Has not appeared in the last 3 tasks.
   * 4. Requires meaningful traversal from the root.
   */
  public static getNextTarget(
    tree: BSTNode,
    previousTargets: number[] = [40]
  ): number {
    const existingValues = new Set(BSTEngine.getInorder(tree));
    const recentHistory = previousTargets.slice(-3);
    const lastTarget = previousTargets[previousTargets.length - 1];

    // Find the starting index in candidate pool after the last target
    let startIndex = 0;
    const lastIndex = this.CANDIDATE_TARGETS.indexOf(lastTarget);
    if (lastIndex !== -1) {
      startIndex = (lastIndex + 1) % this.CANDIDATE_TARGETS.length;
    }

    // Scan through all candidates in sequence
    for (let i = 0; i < this.CANDIDATE_TARGETS.length; i++) {
      const idx = (startIndex + i) % this.CANDIDATE_TARGETS.length;
      const candidate = this.CANDIDATE_TARGETS[idx];
      if (!existingValues.has(candidate) && !recentHistory.includes(candidate)) {
        return candidate;
      }
    }

    // Mathematical deterministic fallback if candidate pool exhausted
    let fallback = 23;
    while (existingValues.has(fallback) || recentHistory.includes(fallback)) {
      fallback += 7;
    }
    return fallback;
  }

  /**
   * Generates a completely new practice task with guaranteed state reset:
   * - Different target value (does not repeat recent 3).
   * - Clean state: resets active node to root, clears decisions, resets mistakes/score/completion.
   * - Preserves base tree structure without stale task state.
   */
  public static generateNextTask(
    initialTree?: BSTNode,
    previousTargets: number[] = [40]
  ): PracticeSessionState {
    const tree = initialTree ? BSTEngine.cloneTree(initialTree)! : BSTEngine.createSampleTree();
    const nextTarget = this.getNextTarget(tree, previousTargets);
    return this.startSession(tree, nextTarget);
  }

  /**
   * Initializes an interactive practice session for BST insertion.
   */
  public static startSession(
    initialTree?: BSTNode,
    targetValue: number = 40
  ): PracticeSessionState {
    const tree = initialTree ? BSTEngine.cloneTree(initialTree)! : BSTEngine.createSampleTree();
    BSTEngine.computeLayout(tree, 360, 220);

    // Single source of truth: Get the canonical steps from BSTEngine
    const canonicalResult = BSTEngine.insert(tree, targetValue);

    return {
      sessionId: `bst-practice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'ds-binary-search-tree',
      initialTree: BSTEngine.cloneTree(tree)!,
      currentTree: tree,
      targetValue,
      currentNode: tree,
      canonicalSteps: canonicalResult.steps,
      canonicalStepIndex: 1, // Step 0 was ROOT_CHECK
      decisionsMade: [],
      mistakesCount: 0,
      lastDiagnosis: null,
      isComplete: false,
      scorePercentage: 100
    };
  }

  /**
   * Evaluates learner's directional choice at the current node.
   */
  public static async evaluateDecision(
    session: PracticeSessionState,
    choice: 'LEFT' | 'RIGHT' | 'INSERT_HERE',
    analyticsService?: IAnalyticsService
  ): Promise<{
    session: PracticeSessionState;
    isCorrect: boolean;
    feedbackMessage: string;
    diagnosis: MisconceptionDiagnosis | null;
  }> {
    const currentNode = session.currentNode;
    const target = session.targetValue;
    const expectedDirection = target < currentNode.value ? 'LEFT' : 'RIGHT';
    const hasChildInDirection = expectedDirection === 'LEFT' ? !!currentNode.left : !!currentNode.right;

    let isCorrect = false;
    let feedbackMessage = '';
    let diagnosis: MisconceptionDiagnosis | null = null;

    // Case 1: Student clicked INSERT_HERE when they should have branched
    if (choice === 'INSERT_HERE') {
      if (hasChildInDirection) {
        // Child exists, cannot insert here!
        diagnosis = {
          id: `misc-${Date.now()}`,
          type: 'BST_WRONG_INSERTION_POSITION',
          topicId: session.topicId,
          targetValue: target,
          currentNodeValue: currentNode.value,
          userChoice: 'INSERT_HERE',
          expectedChoice: expectedDirection,
          pedagogicalExplanation: `Node ${currentNode.value} already has a ${expectedDirection.toLowerCase()} child. In a BST, you must traverse all the way to a null pointer before inserting.`,
          correctiveGuidance: `Compare ${target} with ${currentNode.value} and proceed ${expectedDirection}.`,
          timestamp: new Date().toISOString()
        };
        feedbackMessage = diagnosis.pedagogicalExplanation;
      } else {
        // Target should indeed be inserted here!
        isCorrect = true;
        feedbackMessage = `Spot on! Node ${currentNode.value} has no ${expectedDirection.toLowerCase()} child. Insert ${target} here.`;
      }
    } else {
      // Case 2: Student chose LEFT or RIGHT
      if (choice === expectedDirection) {
        isCorrect = true;
        const nextNode = choice === 'LEFT' ? currentNode.left : currentNode.right;

        if (nextNode) {
          session.currentNode = nextNode;
          feedbackMessage = `Correct! ${target} ${choice === 'LEFT' ? '<' : '>'} ${currentNode.value}. Advancing to node ${nextNode.value}.`;
        } else {
          // Reached null child!
          feedbackMessage = `Correct comparison! ${target} ${choice === 'LEFT' ? '<' : '>'} ${currentNode.value}, and node ${currentNode.value} has no ${choice.toLowerCase()} child. Ready to insert!`;
        }
      } else {
        // Misconception: Wrong Direction!
        diagnosis = {
          id: `misc-${Date.now()}`,
          type: 'BST_WRONG_DIRECTION',
          topicId: session.topicId,
          targetValue: target,
          currentNodeValue: currentNode.value,
          userChoice: choice,
          expectedChoice: expectedDirection,
          pedagogicalExplanation: `${target} is ${expectedDirection === 'LEFT' ? 'smaller' : 'greater'} than ${currentNode.value}. The fundamental BST property requires values ${expectedDirection === 'LEFT' ? 'less' : 'greater'} than the current node to be placed in the ${expectedDirection} subtree.`,
          correctiveGuidance: `Choose ${expectedDirection} to preserve the ordering invariant.`,
          timestamp: new Date().toISOString()
        };
        feedbackMessage = diagnosis.pedagogicalExplanation;
      }
    }

    // Record decision telemetry
    const decisionEvent: PracticeDecisionEvent = {
      stepIndex: session.decisionsMade.length + 1,
      currentNodeValue: currentNode.value,
      targetValue: target,
      decision: choice,
      isCorrect,
      misconception: diagnosis || undefined,
      timeSpentMs: 3400
    };

    session.decisionsMade.push(decisionEvent);

    if (!isCorrect) {
      session.mistakesCount += 1;
      session.scorePercentage = Math.max(0, session.scorePercentage - 20);
      session.lastDiagnosis = diagnosis;
    } else {
      session.lastDiagnosis = null;
      // Check if insertion is now completed
      const nextInDir = expectedDirection === 'LEFT' ? currentNode.left : currentNode.right;
      if (!nextInDir && (choice === 'INSERT_HERE' || choice === expectedDirection)) {
        // Complete! Insert the node via BSTEngine
        const insertResult = BSTEngine.insert(session.currentTree, target);
        session.currentTree = insertResult.finalTreeSnapshot!;
        session.isComplete = true;
      }
    }

    // Telemetry dispatch to AnalyticsService
    if (analyticsService) {
      await analyticsService.trackEvent({
        userId: 'student-usr-4092',
        topicId: session.topicId,
        eventType: 'ar_interaction_step',
        payload: {
          sessionType: 'bst_practice',
          targetValue: target,
          currentNodeValue: currentNode.value,
          userChoice: choice,
          isCorrect,
          misconceptionType: diagnosis?.type
        }
      });
    }

    return {
      session: { ...session },
      isCorrect,
      feedbackMessage,
      diagnosis
    };
  }
}
