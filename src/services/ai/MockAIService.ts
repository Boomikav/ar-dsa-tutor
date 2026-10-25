import { 
  IAIService, 
  AIMessage, 
  AIHintRequest, 
  AIExplanationRequest, 
  DiagnosticQuestion 
} from './IAIService';
import { DSATopic } from '../../models/topic';
import { LearnerState } from '../../models/learner';
import { MisconceptionDiagnosis } from '../../models/misconception';

/**
 * Mock implementation of IAIService.
 * Clearly demarcated as simulated AI reasoning for Phase 2.
 * Provides structured pedagogical responses and 5 distinct assessment question types for BST.
 */
export class MockAIService implements IAIService {
  readonly isMock = true;

  async askQuestion(
    question: string,
    topicContext: DSATopic,
    _learnerState: LearnerState
  ): Promise<AIMessage> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerQ = question.toLowerCase();
    let responseText = '';
    let suggested: string[] = [];

    if (topicContext.id === 'ds-binary-search-tree') {
      if (lowerQ.includes('insert') || lowerQ.includes('add')) {
        responseText = `In a **Binary Search Tree**, insertion always starts at the **root**. At each node:\n1. If target < current, branch to the **left** subtree.\n2. If target > current, branch to the **right** subtree.\n3. When you reach a null pointer, attach the new node there!\n\nThis ensures the BST invariant (Left < Node < Right) is preserved in average **O(log N)** time.`;
        suggested = [
          'What happens if I insert a duplicate value?',
          'Why does degenerate insertion lead to O(N)?',
          'Show me how search works in a BST'
        ];
      } else if (lowerQ.includes('duplicate') || lowerQ.includes('same')) {
        responseText = `Standard BSTs require **unique keys**. If you attempt to insert a duplicate, standard implementations either ignore it, increment a frequency counter at the node, or arbitrarily place it in the right subtree. In our curriculum, we enforce unique keys!`;
        suggested = [
          'How does BST compare to an Array?',
          'Can we rebalance a BST automatically?'
        ];
      } else {
        responseText = `Regarding **Binary Search Trees**: Notice the fundamental invariant: for every node, all keys in its left subtree are strictly smaller, and all keys in its right subtree are strictly greater. In our visualization, watch how this ordering halves the remaining search space!`;
        suggested = [
          'Explain BST insertion step-by-step',
          'Why is In-Order traversal sorted?',
          'What is the difference between Binary Tree and BST?'
        ];
      }
    } else {
      responseText = `Regarding **${topicContext.title}**: ${topicContext.shortDescription}\n\nNotice how the structural layout reflects its asymptotic complexity (${topicContext.timeComplexity?.average || 'O(N)'}).`;
      suggested = [
        `Explain the core invariant of ${topicContext.title}`,
        `What are the edge cases?`
      ];
    }

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai-tutor',
      content: responseText,
      timestamp: new Date().toISOString(),
      suggestedQuestions: suggested
    };
  }

  async requestHint(request: AIHintRequest): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (request.topic.id === 'ds-binary-search-tree' && request.currentNodeValue !== undefined && request.targetValue !== undefined) {
      const isSmaller = request.targetValue < request.currentNodeValue;
      return `[AI Socratic Hint]: Compare target ${request.targetValue} with current node ${request.currentNodeValue}. Since ${request.targetValue} is ${isSmaller ? 'less than' : 'greater than'} ${request.currentNodeValue}, which subtree must hold values in this range?`;
    }

    return `[AI Socratic Hint for ${request.topic.title}]: Remember the fundamental invariant. Compare your target with the active node to decide whether to branch left or right.`;
  }

  async explainConcept(request: AIExplanationRequest): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `### Concept Deep Dive: ${request.topic.title}\n\n${request.topic.detailedConcept}\n\n**Key Invariant**: In a BST, Left Subtree < Root < Right Subtree at every level. This enables average O(log N) lookup and insertion.`;
  }

  async explainMistake(diagnosis: MisconceptionDiagnosis): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return `### Pedagogical Diagnosis: ${diagnosis.type}\n\nYou chose **${diagnosis.userChoice}** at node **${diagnosis.currentNodeValue}** for target value **${diagnosis.targetValue}**.\n\n${diagnosis.pedagogicalExplanation}\n\n**Corrective Guidance**: ${diagnosis.correctiveGuidance}`;
  }

  async generateDiagnosticQuestions(topic: DSATopic, count: number = 5): Promise<DiagnosticQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Full 5 Question Categories for Binary Search Tree
    if (topic.id === 'ds-binary-search-tree') {
      const bstQuestions: DiagnosticQuestion[] = [
        // 1. Conceptual
        {
          id: 'bst-q1-conceptual',
          topicId: 'ds-binary-search-tree',
          category: 'conceptual',
          question: 'Which ordering property must hold strictly for EVERY node in a valid Binary Search Tree?',
          options: [
            'All left descendants < node < all right descendants',
            'Parent node value must equal the sum of its children',
            'Left child must be greater than right child',
            'All leaf nodes must have identical values'
          ],
          correctOptionIndex: 0,
          explanation: 'The BST invariant requires that for any node X, all values in X\'s left subtree are strictly smaller than X.val, and all values in X\'s right subtree are strictly greater than X.val.'
        },
        // 2. Prediction
        {
          id: 'bst-q2-prediction',
          topicId: 'ds-binary-search-tree',
          category: 'prediction',
          question: 'In a BST containing root 50, left child 30, and right child 70: where will the new value 40 be inserted?',
          options: [
            'As the right child of node 30',
            'As the left child of node 30',
            'As the left child of node 70',
            'Replacing root 50'
          ],
          correctOptionIndex: 0,
          explanation: 'Starting at 50: 40 < 50, so move left to 30. At 30: 40 > 30, so move right. Since 30 has no right child, 40 is inserted as the right child of 30.'
        },
        // 3. Sequence
        {
          id: 'bst-q3-sequence',
          topicId: 'ds-binary-search-tree',
          category: 'sequence',
          question: 'What is the exact node comparison sequence when searching for value 20 in a BST with root 50, left child 30, and 30\'s left child 20?',
          options: [
            'Compare with 50 → Compare with 30 → Compare with 20 (Found)',
            'Compare with 20 directly',
            'Compare with 30 → Compare with 50',
            'Scan all nodes from smallest to largest'
          ],
          correctOptionIndex: 0,
          explanation: 'BST search must always start at the root (50). Since 20 < 50, it branches left to 30. Since 20 < 30, it branches left to 20, matching the target.'
        },
        // 4. Error Detection
        {
          id: 'bst-q4-error',
          topicId: 'ds-binary-search-tree',
          category: 'error_detection',
          question: 'A tree has root 50, right child 70, and 70 has a left child 45. Why is this INVALID for a BST?',
          options: [
            '45 is in the right subtree of 50, but 45 < 50 (violates root invariant)',
            '70 is not allowed to have a left child',
            '45 is too small to be a leaf node',
            'The tree depth exceeds logarithm of N'
          ],
          correctOptionIndex: 0,
          explanation: 'The BST invariant applies to ALL descendants. Every node in the right subtree of 50 MUST be greater than 50. Since 45 < 50, placing 45 in the right subtree violates the BST invariant.'
        },
        // 5. Operation Reasoning
        {
          id: 'bst-q5-reasoning',
          topicId: 'ds-binary-search-tree',
          category: 'operation_reasoning',
          question: 'Why does In-Order traversal (Left, Root, Right) of a Binary Search Tree always yield keys in non-decreasing sorted order?',
          options: [
            'Because all left descendants (< Root) are processed before Root, and Root is processed before right descendants (> Root)',
            'Because the CPU sorts the tree in memory during traversal',
            'Because nodes are physically swapped during the in-order walk',
            'Only complete binary trees yield sorted output'
          ],
          correctOptionIndex: 0,
          explanation: 'In-order traversal visits: (1) Entire left subtree containing values < Root, (2) Root itself, (3) Entire right subtree containing values > Root. By induction, this recursively emits all keys in sorted order.'
        }
      ];

      return bstQuestions.slice(0, count);
    }

    // Default question bank for other topics
    const defaultQuestions: DiagnosticQuestion[] = [
      {
        id: `q-gen-1-${topic.id}`,
        topicId: topic.id,
        category: 'conceptual',
        question: `What is the primary defining characteristic of ${topic.title}?`,
        options: [
          topic.shortDescription,
          'Unbounded memory consumption',
          'Automatic O(1) sorting',
          'Linear array access only'
        ],
        correctOptionIndex: 0,
        explanation: `${topic.title}: ${topic.shortDescription}`
      },
      {
        id: `q-gen-2-${topic.id}`,
        topicId: topic.id,
        category: 'operation_reasoning',
        question: `What is the typical average time complexity of ${topic.title}?`,
        options: [
          topic.timeComplexity?.average || 'O(N)',
          'O(N^3)',
          'O(1) always',
          'O(N!)'
        ],
        correctOptionIndex: 0,
        explanation: `For ${topic.title}, average time complexity is ${topic.timeComplexity?.average || 'O(N)'}.`
      }
    ];

    return defaultQuestions.slice(0, count);
  }
}
