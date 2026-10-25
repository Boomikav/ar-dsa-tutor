import { Recommendation } from '../../models/recommendation';
import { LearnerState } from '../../models/learner';
import { IKnowledgeGraphService } from '../knowledgeGraph/IKnowledgeGraphService';

/**
 * Service boundary interface for Adaptive Recommendations.
 */
export interface IRecommendationService {
  readonly isMock: boolean;

  getRecommendations(
    learnerState: LearnerState,
    knowledgeGraphService: IKnowledgeGraphService
  ): Promise<Recommendation[]>;
}
