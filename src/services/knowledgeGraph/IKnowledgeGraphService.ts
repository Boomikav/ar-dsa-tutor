import { ConceptGraph, ConceptNode, ConceptRelationship } from '../../models/knowledgeGraph';
import { LearnerState } from '../../models/learner';

export interface PrerequisiteCheckResult {
  satisfied: boolean;
  missingPrerequisiteTopicIds: string[];
  mandatoryCount: number;
  completedCount: number;
  supportingTopicIds: string[]; // Pedagogical recommendations that enhance learning
}

export interface TopicRelationshipSummary {
  topicId: string;
  prerequisites: { node: ConceptNode; relationship: ConceptRelationship }[];
  supportingConcepts: { node: ConceptNode; relationship: ConceptRelationship }[];
  dependentConcepts: { node: ConceptNode; relationship: ConceptRelationship }[];
  relatedConcepts: { node: ConceptNode; relationship: ConceptRelationship }[];
}

/**
 * Service boundary interface for the DSA Knowledge Graph.
 */
export interface IKnowledgeGraphService {
  readonly isMock: boolean;

  getGraph(): Promise<ConceptGraph>;

  getRelationshipsForTopic(topicId: string): Promise<TopicRelationshipSummary>;

  getPrerequisitesForTopic(topicId: string): Promise<{
    nodes: ConceptNode[];
    edges: ConceptRelationship[];
  }>;

  getDependentsForTopic(topicId: string): Promise<{
    nodes: ConceptNode[];
    edges: ConceptRelationship[];
  }>;

  checkPrerequisitesSatisfied(
    topicId: string,
    learnerState: LearnerState
  ): Promise<PrerequisiteCheckResult>;

  getTopologicalProgression(): Promise<string[]>; // Returns sorted topicIds
}
