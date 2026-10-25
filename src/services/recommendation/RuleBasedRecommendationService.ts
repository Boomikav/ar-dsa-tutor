import { IRecommendationService } from './IRecommendationService';
import { Recommendation } from '../../models/recommendation';
import { LearnerState } from '../../models/learner';
import { IKnowledgeGraphService } from '../knowledgeGraph/IKnowledgeGraphService';
import { INITIAL_DSA_TOPICS } from '../../data/topicsData';

/**
 * Rule-based recommendation engine for Phase 1.
 * Distinguishes between:
 * - Blocked by missing strict prerequisite
 * - Next logical curriculum step
 * - Supporting concept reinforcement
 * - Related concept exploration
 * - Spaced revision for low mastery / decaying retention
 * - AR spatial manipulation drill
 */
export class RuleBasedRecommendationService implements IRecommendationService {
  readonly isMock = true;

  async getRecommendations(
    learnerState: LearnerState,
    knowledgeGraphService: IKnowledgeGraphService
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 1. Revision / Low Mastery / Decaying Retention
    for (const [topicId, mastery] of Object.entries(learnerState.masteryMap)) {
      if (mastery.needsReview || mastery.retentionScore < 0.6 || (mastery.attemptsCount > 0 && mastery.masteryPercentage < 50)) {
        const topic = INITIAL_DSA_TOPICS.find(t => t.id === topicId);
        if (topic) {
          const isLowScore = mastery.masteryPercentage < 50;
          recommendations.push({
            id: `rec-revision-${topicId}`,
            targetTopicId: topicId,
            type: 'SPACED_REPETITION_DRILL',
            priorityScore: isLowScore ? 95 : 88,
            title: isLowScore ? `Reinforce ${topic.title} Fundamentals` : `Review ${topic.title}`,
            description: isLowScore 
              ? `Current mastery is ${mastery.masteryPercentage}%. Reviewing core invariants will establish solid footing for dependent concepts.`
              : `Your estimated retention for ${topic.title} has dipped to ${Math.round(mastery.retentionScore * 100)}%. A 5-minute refresher will restore long-term recall.`,
            reason: {
              headline: isLowScore ? 'Concept Mastery Needs Strengthening' : 'Decaying Retention Alert',
              detail: isLowScore ? 'Diagnostic assessments flagged fundamental misconceptions.' : 'Spaced repetition schedule recommends a quick review.',
              sourceFactor: isLowScore ? 'low_mastery' : 'decaying_retention'
            },
            estimatedMinutes: 5,
            actionText: 'Review Now'
          });
        }
      }
    }

    // 2. Next Logical Learning Step (Prerequisites fully satisfied)
    const progression = await knowledgeGraphService.getTopologicalProgression();
    for (const topicId of progression) {
      const isCompleted = learnerState.history.completedTopicIds.includes(topicId);
      if (!isCompleted) {
        const check = await knowledgeGraphService.checkPrerequisitesSatisfied(topicId, learnerState);
        const topic = INITIAL_DSA_TOPICS.find(t => t.id === topicId);

        if (check.satisfied && topic) {
          recommendations.push({
            id: `rec-next-${topicId}`,
            targetTopicId: topicId,
            type: 'NEXT_LOGICAL_CONCEPT',
            priorityScore: 85,
            title: `Advance to ${topic.title}`,
            description: `All mandatory conceptual foundations satisfied. Optimal time to explore ${topic.title} in the curriculum trajectory.`,
            reason: {
              headline: 'Prerequisites Satisfied',
              detail: 'Natural conceptual next step in your computer science curriculum.',
              sourceFactor: 'unlocked_node'
            },
            estimatedMinutes: topic.estimatedMinutes,
            actionText: 'Start Learning'
          });
          break; // Primary next step
        } else if (!check.satisfied && topic && check.missingPrerequisiteTopicIds.length > 0) {
          // 3. Blocked by missing strict prerequisite
          const missingId = check.missingPrerequisiteTopicIds[0];
          const missingTopic = INITIAL_DSA_TOPICS.find(t => t.id === missingId);
          if (missingTopic) {
            recommendations.push({
              id: `rec-prereq-${missingId}`,
              targetTopicId: missingId,
              type: 'REVISIT_PREREQUISITE',
              priorityScore: 78,
              title: `Prerequisite: Complete ${missingTopic.title}`,
              description: `Before tackling ${topic.title}, ensure solid understanding of ${missingTopic.title}.`,
              reason: {
                headline: 'Prerequisite Gap',
                detail: `Mandatory conceptual foundation required before unlocking ${topic.title}.`,
                sourceFactor: 'prerequisite_gap'
              },
              estimatedMinutes: missingTopic.estimatedMinutes,
              actionText: 'Study Prerequisite'
            });
          }
        }
      }
    }

    // 4. Supporting Concept Reinforcement (e.g. for in-progress topic)
    const activeTopicId = learnerState.history.recentTopicId || 'ds-linked-list';
    const relSummary = await knowledgeGraphService.getRelationshipsForTopic(activeTopicId);
    for (const sup of relSummary.supportingConcepts) {
      const supMastery = learnerState.masteryMap[sup.node.topicId]?.masteryPercentage || 0;
      if (supMastery < 70) {
        const supTopic = INITIAL_DSA_TOPICS.find(t => t.id === sup.node.topicId);
        if (supTopic) {
          recommendations.push({
            id: `rec-sup-${sup.node.topicId}`,
            targetTopicId: sup.node.topicId,
            type: 'SUPPORTING_CONCEPT_REINFORCEMENT',
            priorityScore: 72,
            title: `Supporting Tool: ${supTopic.title}`,
            description: `${supTopic.title} provides implementation backing for ${relSummary.topicId}: "${sup.relationship.rationale}"`,
            reason: {
              headline: 'Supporting Concept Recommendation',
              detail: sup.relationship.rationale,
              sourceFactor: 'supporting_concept'
            },
            estimatedMinutes: supTopic.estimatedMinutes,
            actionText: 'Explore Supporting Concept'
          });
          break;
        }
      }
    }

    // 5. Related Concept Exploration
    for (const rel of relSummary.relatedConcepts) {
      const isRelCompleted = learnerState.history.completedTopicIds.includes(rel.node.topicId);
      if (!isRelCompleted) {
        const relTopic = INITIAL_DSA_TOPICS.find(t => t.id === rel.node.topicId);
        if (relTopic) {
          recommendations.push({
            id: `rec-rel-${rel.node.topicId}`,
            targetTopicId: rel.node.topicId,
            type: 'RELATED_CONCEPT_EXPLORATION',
            priorityScore: 65,
            title: `Compare With ${relTopic.title}`,
            description: `Now that you understand ${activeTopicId}, compare trade-offs with ${relTopic.title}: "${rel.relationship.rationale}"`,
            reason: {
              headline: 'Related Concept Exploration',
              detail: rel.relationship.rationale,
              sourceFactor: 'related_concept'
            },
            estimatedMinutes: relTopic.estimatedMinutes,
            actionText: 'Compare Concepts'
          });
          break;
        }
      }
    }

    // 6. AR Spatial Practice for tactile reinforcement
    const inProgressTopic = INITIAL_DSA_TOPICS.find(t => t.id === activeTopicId);
    if (inProgressTopic && inProgressTopic.visualSpec.hasArModel) {
      recommendations.push({
        id: `rec-ar-${activeTopicId}`,
        targetTopicId: activeTopicId,
        type: 'AR_SPATIAL_PRACTICE',
        priorityScore: 60,
        title: `Spatial AR Lab: ${inProgressTopic.title}`,
        description: `Anchor the 3D ${inProgressTopic.title} on your desk and physically trace node pointer transformations.`,
        reason: {
          headline: 'Tactile Spatial Practice',
          detail: 'Manipulating 3D pointer structures reinforces mental models significantly better than 2D diagrams.',
          sourceFactor: 'unlocked_node'
        },
        estimatedMinutes: 8,
        actionText: 'Launch AR'
      });
    }

    return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
