import { IAssessmentAgent, LearnerAIContext, GeneratedAssessmentQuestion } from '../../../models/multiAgent';

/**
 * Specialized Assessment Agent.
 * Generates adaptive diagnostic checks and formative questions based on learner mastery,
 * performance history, and active misconceptions.
 * 
 * Invariants:
 * - Generates questions strictly within the DSA domain.
 * - Does NOT mutate learner state directly.
 */
export class AssessmentAgent implements IAssessmentAgent {
  readonly agentName = 'AssessmentAgent' as const;
  private readonly endpoint = '/api/ai/orchestrator';

  async generateDiagnosticQuestion(context: LearnerAIContext): Promise<GeneratedAssessmentQuestion> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'ASSESSMENT_REQUIRED',
          context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.assessmentQuestion) {
          return data.assessmentQuestion;
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }

    return this.fallbackAssessment(context);
  }

  public fallbackAssessment(context: LearnerAIContext): GeneratedAssessmentQuestion {
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
        isFallback: true
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
        isFallback: true
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
      isFallback: true
    };
  }
}
