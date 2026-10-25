import { ILLMProvider } from './ILLMProvider';
import { TutorRequest, TutorResponse, TutorResponseType } from '../../src/models/ai';
import { 
  LearnerAIContext, 
  MisconceptionAnalysisResult, 
  GeneratedAssessmentQuestion, 
  LearningRecommendationResult 
} from '../../src/models/multiAgent';

/**
 * Server-side Mock Provider used when:
 * 1. AI_PROVIDER=mock is configured
 * 2. GEMINI_API_KEY is not set or empty
 * 3. Fast offline development or automated tests
 */
export class MockProvider implements ILLMProvider {
  readonly providerName = 'mock-llm-provider';
  readonly defaultModel = 'mock-socratic-v1';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateTutorResponse(request: TutorRequest): Promise<TutorResponse> {
    const { studentContext, topicContext, currentOperation, misconception, requestedHelpLevel, userQuery } = request;
    const style = studentContext.preferredStyle;

    let responseType: TutorResponseType = 'EXPLANATION';
    let message = '';
    let reasoning = '';
    let nextAction: TutorResponse['nextAction'] = 'CONTINUE_EXPLORING';
    let concept = topicContext.coreInvariant || 'BST_ORDERING_INVARIANT';

    // Case A: Misconception Remediation
    if (misconception || requestedHelpLevel === 'mistake_remediation') {
      responseType = 'MISTAKE_EXPLANATION';
      const target = currentOperation.targetValue ?? 40;
      const node = currentOperation.currentNodeValue ?? 50;
      const userChoice = misconception?.userChoice || 'RIGHT';
      const expected = misconception?.expectedChoice || 'LEFT';

      if (style === 'socratic') {
        message = `Let's check the comparison carefully before moving. The target is ${target} and the current node is ${node}. Is ${target} strictly smaller or greater than ${node}? Which branch holds values in that direction?`;
        reasoning = `Socratic prompt leads the student to recall the BST invariant (${target} < ${node}) without spoonfeeding the answer.`;
        nextAction = 'RETRY_DECISION';
      } else if (style === 'analogical') {
        message = `For a BST, imagine each node as an AR spatial decision point. You are standing at node ${node} holding target ${target}. Since ${target} < ${node}, physically move toward the left branch, just like checking an earlier volume on a sorted bookshelf.`;
        reasoning = `Analogical spatial indexing connects BST branching with physical sorted shelf ordering and AR spatial movement.`;
        nextAction = expected === 'LEFT' ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      } else {
        // Direct
        message = `Because ${target} is less than ${node}, the BST ordering property strictly requires placing it in the ${expected} subtree. Your choice of ${userChoice} violates this invariant.`;
        reasoning = `Direct feedback reinforces the fundamental inequality: Left Subtree < Root < Right Subtree.`;
        nextAction = expected === 'LEFT' ? 'MOVE_LEFT' : 'MOVE_RIGHT';
      }
    } 
    // Case B: Hint Request
    else if (requestedHelpLevel === 'hint') {
      responseType = 'HINT';
      const target = currentOperation.targetValue;
      const node = currentOperation.currentNodeValue;

      if (target !== undefined && node !== undefined) {
        if (style === 'socratic') {
          message = `Compare target ${target} against active node ${node}. According to the BST property, where do values smaller than ${node} reside?`;
          reasoning = `Socratic guiding question focused on the comparison outcome.`;
          nextAction = target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
        } else if (style === 'analogical') {
          message = `Imagine a fork in a hiking trail where all lower elevations branch left and higher peaks branch right. At altitude ${node}, where does elevation ${target} lead?`;
          reasoning = `Elevation analogy for branching direction.`;
          nextAction = target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
        } else {
          message = `Compare ${target} with ${node}: since ${target} < ${node}, branch to the left child. If null, insert here.`;
          reasoning = `Direct operational instruction.`;
          nextAction = target < node ? 'MOVE_LEFT' : 'MOVE_RIGHT';
        }
      } else {
        message = `Recall the binary search invariant: every node partitions elements into smaller (left) and greater (right) subtrees.`;
        reasoning = `General invariant reminder.`;
      }
    } 
    // Case C: Conceptual / General Question
    else {
      responseType = 'EXPLANATION';
      const queryLower = (userQuery || '').toLowerCase();

      if (queryLower.includes('what is a bst') || queryLower.includes('explain bst')) {
        if (style === 'analogical') {
          message = `A Binary Search Tree is like a family tree where every ancestor enforces a rule: everyone on the left side of the room is younger/smaller, and everyone on the right is older/greater. This lets you find anyone in logarithmic time!`;
          reasoning = `Analogical framing of hierarchical ordering.`;
        } else if (style === 'socratic') {
          message = `What makes a Binary Search Tree faster than a regular Linked List? Consider: if every node guarantees that all smaller elements are to the left and all larger elements are to the right, how many elements can you eliminate at each step?`;
          reasoning = `Socratic inquiry driving toward O(log N) divide-and-conquer understanding.`;
        } else {
          message = `A Binary Search Tree (BST) is a hierarchical node-based data structure where each node has at most two children. For any node X: all left descendants < X.value < all right descendants. This property enables average O(log N) search and insertion.`;
          reasoning = `Formal mathematical and asymptotic definition of BST.`;
        }
        concept = 'BST_ORDERING_INVARIANT';
      } else {
        message = `In ${topicContext.title}, the active invariant is "${topicContext.coreInvariant}". Every operation preserves this property to maintain ${topicContext.averageTimeComplexity} runtime.`;
        reasoning = `Context-aware synthesis of topic invariant and time complexity.`;
        concept = 'BST_ORDERING_INVARIANT';
      }
    }

    return {
      responseType,
      message,
      reasoning,
      nextAction,
      concept,
      difficulty: topicContext.difficulty === 'Beginner' ? 'BEGINNER' : topicContext.difficulty === 'Advanced' ? 'ADVANCED' : 'INTERMEDIATE',
      suggestedPrompts: [
        'Explain this step',
        'Give me a hint',
        'Why was my answer wrong?',
        'Show me an analogy'
      ],
      isFallback: false,
      provider: this.providerName,
      model: this.defaultModel,
      timestamp: new Date().toISOString(),
      latencyMs: 45
    };
  }

  async generateMisconceptionAnalysis(context: LearnerAIContext): Promise<MisconceptionAnalysisResult> {
    const history = context.misconceptionHistory || [];
    const active = context.activeMisconception;
    const count = history.length;

    if (count >= 2) {
      return {
        misconceptionDetected: true,
        misconceptionType: active?.type || history[0]?.type || 'BST_WRONG_DIRECTION',
        recurrence: count >= 3 ? 'CHRONIC' : 'REPEATED',
        confidence: count >= 3 ? 0.94 : 0.85,
        evidence: [
          `Observed ${count} directional mistakes in recent practice`,
          `Consistently selected incorrect subtree branch for key magnitude comparison`,
          `Current operation comparison: ${context.currentOperation?.comparisonText || '40 < 50'}`
        ],
        recommendedIntervention: 'Provide Socratic reflection on numerical comparison (< vs >) followed by invariant diagnostic verification.',
        rootCauseAnalysis: 'The learner consistently inverts the BST comparison rule, routing smaller target keys to the right child instead of the left child.',
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    } else if (count === 1 || active) {
      return {
        misconceptionDetected: true,
        misconceptionType: active?.type || 'BST_WRONG_DIRECTION',
        recurrence: 'FIRST_OCCURRENCE',
        confidence: 0.65,
        evidence: [
          `Single directional mistake recorded at node ${context.currentOperation?.currentNodeValue ?? 50}`
        ],
        recommendedIntervention: 'Gentle reminder of BST ordering property before re-attempting decision.',
        rootCauseAnalysis: 'Likely an isolated miscalculation or misclick during tree traversal.',
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    }

    return {
      misconceptionDetected: false,
      recurrence: 'NONE',
      confidence: 0.95,
      evidence: ['No cognitive misconceptions detected in session history'],
      recommendedIntervention: 'Continue standard guided traversal practice.',
      timestamp: new Date().toISOString(),
      isFallback: false
    };
  }

  async generateAssessmentQuestion(context: LearnerAIContext): Promise<GeneratedAssessmentQuestion> {
    const mastery = context.masterySnapshot.masteryPercentage;

    if (mastery < 50) {
      return {
        questionType: 'directional_prediction',
        question: `In a Binary Search Tree, where should a new node with value ${context.currentOperation?.targetValue ?? 40} be placed relative to a parent node with value ${context.currentOperation?.currentNodeValue ?? 50}?`,
        options: [
          { text: `In the left subtree, because ${context.currentOperation?.targetValue ?? 40} < ${context.currentOperation?.currentNodeValue ?? 50}`, isCorrect: true, explanation: 'Values smaller than the node belong in the left subtree.' },
          { text: `In the right subtree, because ${context.currentOperation?.targetValue ?? 40} is smaller`, isCorrect: false, explanation: 'Right subtree is strictly for values greater than the node.' },
          { text: 'At the root, overwriting the existing node', isCorrect: false, explanation: 'BST insertion does not overwrite existing nodes unless key matches.' },
          { text: 'In whichever subtree has fewer nodes', isCorrect: false, explanation: 'Placement is governed by key ordering, not tree weight.' }
        ],
        expectedSkill: 'BST Directional Invariant',
        difficulty: 'BEGINNER',
        explanationRequired: true,
        topicId: context.topic.id,
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    } else if (mastery < 80) {
      return {
        questionType: 'multiple_choice',
        question: 'Given a BST with root 50 and left child 30, what is the valid insertion path for target value 40?',
        options: [
          { text: 'Left from 50 to 30, then Right as right child of 30', isCorrect: true, explanation: '40 < 50 (left), then 40 > 30 (right child).' },
          { text: 'Right from 50 to 70, then Left', isCorrect: false, explanation: '40 is less than 50, so it cannot enter the right subtree.' },
          { text: 'Directly replace node 30', isCorrect: false, explanation: 'Existing valid nodes are preserved.' },
          { text: 'Left from 50, then Left of 30', isCorrect: false, explanation: '40 is greater than 30, so it must branch right.' }
        ],
        expectedSkill: 'Multi-Level BST Traversal',
        difficulty: 'INTERMEDIATE',
        explanationRequired: true,
        topicId: context.topic.id,
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    }

    return {
      questionType: 'invariant_verification',
      question: 'After inserting key 40 into a BST containing {30, 50, 70}, what is the strict in-order traversal of the tree?',
      options: [
        { text: '30, 40, 50, 70', isCorrect: true, explanation: 'In-order traversal of any valid BST yields strictly ascending sorted order.' },
        { text: '40, 30, 50, 70', isCorrect: false, explanation: 'This violates sorted order.' },
        { text: '50, 30, 40, 70', isCorrect: false, explanation: 'This is a pre-order traversal sequence, not in-order.' },
        { text: '30, 50, 40, 70', isCorrect: false, explanation: '40 must appear before 50 in sorted sequence.' }
      ],
      expectedSkill: 'BST In-Order Sorted Sequence',
      difficulty: 'ADVANCED',
      explanationRequired: true,
      topicId: context.topic.id,
      timestamp: new Date().toISOString(),
      isFallback: false
    };
  }

  async generateRecommendation(context: LearnerAIContext): Promise<LearningRecommendationResult> {
    const historyCount = context.misconceptionHistory.length;
    const mastery = context.masterySnapshot.masteryPercentage;

    if (historyCount >= 2 || context.masterySnapshot.needsReview) {
      if (mastery < 50) {
        return {
          recommendationType: 'REVIEW_PREREQUISITE',
          targetTopicId: 'ds-binary-tree',
          targetTopicTitle: 'Binary Tree Fundamentals',
          rationale: 'Reviewing fundamental tree hierarchy and left/right branching will clarify BST ordering rules before proceeding.',
          difficulty: 'BEGINNER',
          priority: 'HIGH',
          timestamp: new Date().toISOString(),
          isFallback: false
        };
      }
      return {
        recommendationType: 'REPEAT_CURRENT_CONCEPT',
        targetTopicId: context.topic.id,
        targetTopicTitle: context.topic.title,
        rationale: 'Engage in targeted interactive AR practice with explicit comparison callouts to eliminate directional confusion.',
        difficulty: 'INTERMEDIATE',
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    }

    if (mastery >= 80) {
      return {
        recommendationType: 'MOVE_TO_NEXT_CONCEPT',
        targetTopicId: 'algo-binary-search',
        targetTopicTitle: 'Binary Search',
        rationale: 'BST insertion is mastered. Advance to Binary Search algorithms to apply logarithmic search principles to sequential arrays.',
        difficulty: 'INTERMEDIATE',
        priority: 'MEDIUM',
        timestamp: new Date().toISOString(),
        isFallback: false
      };
    }

    return {
      recommendationType: 'AR_SPATIAL_PRACTICE',
      targetTopicId: context.topic.id,
      targetTopicTitle: context.topic.title,
      rationale: 'Reinforce spatial intuition of subtree boundaries using 3D AR manipulation.',
      difficulty: 'INTERMEDIATE',
      priority: 'MEDIUM',
      timestamp: new Date().toISOString(),
      isFallback: false
    };
  }
}
