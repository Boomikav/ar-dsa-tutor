import { ITutorAgent, LearnerAIContext } from '../../../models/multiAgent';
import { TutorResponse, TutorRequest } from '../../../models/ai';
import { IAIService } from '../IAIService';

/**
 * Specialized Tutor Agent.
 * Responsible for pedagogical explanations, hints, analogies, Socratic questioning,
 * and guided misconception remediation.
 * 
 * Invariants:
 * - Does NOT determine BST correctness
 * - Does NOT mutate BST pointers or state
 * - Does NOT update learner mastery directly
 */
export class TutorAgent implements ITutorAgent {
  readonly agentName = 'TutorAgent' as const;
  private readonly aiService: IAIService;

  constructor(aiService: IAIService) {
    this.aiService = aiService;
  }

  async handleRequest(context: LearnerAIContext, requestedHelp: string = 'explanation'): Promise<TutorResponse> {
    const tutorRequest: TutorRequest = {
      studentContext: {
        fullName: context.studentProfile.fullName,
        academicLevel: context.studentProfile.academicLevel,
        preferredStyle: context.studentProfile.preferredStyle,
        streakDays: context.studentProfile.dailyStreak
      },
      topicContext: {
        id: context.topic.id,
        title: context.topic.title,
        category: context.topic.category,
        difficulty: context.topic.difficulty,
        coreInvariant: context.topic.coreInvariant,
        averageTimeComplexity: context.topic.averageTimeComplexity
      },
      learnerState: {
        masteryPercentage: context.masterySnapshot.masteryPercentage,
        confidence: context.masterySnapshot.confidence,
        attemptsCount: context.masterySnapshot.attemptsCount,
        mistakesCount: context.masterySnapshot.mistakesCount,
        needsReview: context.masterySnapshot.needsReview
      },
      currentOperation: context.currentOperation || {
        operationType: 'none',
        isCompleted: false
      },
      misconception: context.activeMisconception || null,
      requestedHelpLevel: requestedHelp === 'hint' ? 'hint' : requestedHelp === 'mistake_remediation' ? 'mistake_remediation' : 'explanation'
    };

    if (this.aiService.consultTutor) {
      return this.aiService.consultTutor(tutorRequest);
    }

    return {
      responseType: requestedHelp === 'hint' ? 'HINT' : 'EXPLANATION',
      message: `In a Binary Search Tree, remember: left subtree contains values strictly smaller than the node, and right subtree contains values strictly greater.`,
      reasoning: 'Fallback explanation reinforcing basic BST ordering rule.',
      suggestedPrompts: ['What is the BST invariant?', 'How does insertion work?'],
      nextAction: 'CONTINUE_EXPLORING',
      concept: context.topic.coreInvariant || 'BST_ORDERING_INVARIANT',
      difficulty: (context.topic.difficulty?.toUpperCase() as any) || 'BEGINNER',
      provider: 'tutor-agent-fallback',
      model: 'deterministic-fallback',
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
}
