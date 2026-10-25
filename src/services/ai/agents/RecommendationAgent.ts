import { IRecommendationAgent, LearnerAIContext, LearningRecommendationResult } from '../../../models/multiAgent';

/**
 * Specialized Recommendation Agent.
 * Formulates the next optimal educational activity (review prerequisite, repeat concept,
 * easier/harder exercise, AR spatial practice, or next concept) based on learner evidence.
 * 
 * Invariants:
 * - Produces recommendations; does NOT mutate the learner model directly.
 * - Respects the Knowledge Graph prerequisite DAG.
 */
export class RecommendationAgent implements IRecommendationAgent {
  readonly agentName = 'RecommendationAgent' as const;
  private readonly endpoint = '/api/ai/orchestrator';

  async recommendNextStep(context: LearnerAIContext): Promise<LearningRecommendationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'LEARNING_PATH_DECISION_REQUIRED',
          context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.recommendation) {
          return data.recommendation;
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }

    return this.fallbackRecommendation(context);
  }

  public fallbackRecommendation(context: LearnerAIContext): LearningRecommendationResult {
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
          isFallback: true
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
        isFallback: true
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
        isFallback: true
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
      isFallback: true
    };
  }
}
