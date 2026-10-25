import { 
  IKnowledgeGraphService, 
  PrerequisiteCheckResult, 
  TopicRelationshipSummary 
} from './IKnowledgeGraphService';
import { ConceptGraph, ConceptNode, ConceptRelationship } from '../../models/knowledgeGraph';
import { LearnerState } from '../../models/learner';
import { INITIAL_KNOWLEDGE_GRAPH } from '../../data/knowledgeGraphData';

/**
 * In-memory implementation of IKnowledgeGraphService for Phase 1.
 * Evaluates genuine conceptual prerequisites without false blocking.
 */
export class InMemoryKnowledgeGraphService implements IKnowledgeGraphService {
  readonly isMock = true;
  private graph: ConceptGraph;

  constructor() {
    this.graph = INITIAL_KNOWLEDGE_GRAPH;
  }

  async getGraph(): Promise<ConceptGraph> {
    return JSON.parse(JSON.stringify(this.graph));
  }

  async getRelationshipsForTopic(topicId: string): Promise<TopicRelationshipSummary> {
    const targetNodeId = `node-${topicId}`;
    const incoming = this.graph.edges.filter(e => e.targetConceptId === targetNodeId);
    const outgoing = this.graph.edges.filter(e => e.sourceConceptId === targetNodeId);

    const nodeMap = new Map(this.graph.nodes.map(n => [n.id, n]));

    const prerequisites: { node: ConceptNode; relationship: ConceptRelationship }[] = [];
    const supportingConcepts: { node: ConceptNode; relationship: ConceptRelationship }[] = [];
    const relatedConcepts: { node: ConceptNode; relationship: ConceptRelationship }[] = [];
    const dependentConcepts: { node: ConceptNode; relationship: ConceptRelationship }[] = [];

    for (const edge of incoming) {
      const sourceNode = nodeMap.get(edge.sourceConceptId);
      if (!sourceNode) continue;
      if (edge.relationshipType === 'PREREQUISITE') {
        prerequisites.push({ node: sourceNode, relationship: edge });
      } else if (edge.relationshipType === 'SUPPORTING_CONCEPT') {
        supportingConcepts.push({ node: sourceNode, relationship: edge });
      } else if (edge.relationshipType === 'RELATED_CONCEPT') {
        relatedConcepts.push({ node: sourceNode, relationship: edge });
      }
    }

    for (const edge of outgoing) {
      const targetNode = nodeMap.get(edge.targetConceptId);
      if (!targetNode) continue;
      dependentConcepts.push({ node: targetNode, relationship: edge });
    }

    return {
      topicId,
      prerequisites,
      supportingConcepts,
      dependentConcepts,
      relatedConcepts
    };
  }

  async getPrerequisitesForTopic(topicId: string): Promise<{
    nodes: ConceptNode[];
    edges: ConceptRelationship[];
  }> {
    const targetNodeId = `node-${topicId}`;
    const incomingEdges = this.graph.edges.filter(e => e.targetConceptId === targetNodeId);
    const sourceNodeIds = new Set(incomingEdges.map(e => e.sourceConceptId));
    const prereqNodes = this.graph.nodes.filter(n => sourceNodeIds.has(n.id));

    return {
      nodes: prereqNodes,
      edges: incomingEdges
    };
  }

  async getDependentsForTopic(topicId: string): Promise<{
    nodes: ConceptNode[];
    edges: ConceptRelationship[];
  }> {
    const sourceNodeId = `node-${topicId}`;
    const outgoingEdges = this.graph.edges.filter(e => e.sourceConceptId === sourceNodeId);
    const targetNodeIds = new Set(outgoingEdges.map(e => e.targetConceptId));
    const dependentNodes = this.graph.nodes.filter(n => targetNodeIds.has(n.id));

    return {
      nodes: dependentNodes,
      edges: outgoingEdges
    };
  }

  async checkPrerequisitesSatisfied(
    topicId: string,
    learnerState: LearnerState
  ): Promise<PrerequisiteCheckResult> {
    const targetNodeId = `node-${topicId}`;
    // Only genuine conceptual prerequisites that are MANDATORY block learning
    const mandatoryPrereqEdges = this.graph.edges.filter(
      e => e.targetConceptId === targetNodeId &&
           e.relationshipType === 'PREREQUISITE' &&
           e.strength === 'MANDATORY'
    );

    // Supporting concepts that are recommended/helpful (does NOT block)
    const supportingEdges = this.graph.edges.filter(
      e => e.targetConceptId === targetNodeId &&
           e.relationshipType === 'SUPPORTING_CONCEPT'
    );
    const supportingTopicIds = supportingEdges.map(e => e.sourceConceptId.replace('node-', ''));

    const missingTopicIds: string[] = [];
    let completedCount = 0;

    for (const edge of mandatoryPrereqEdges) {
      const sourceTopicId = edge.sourceConceptId.replace('node-', '');
      const mastery = learnerState.masteryMap[sourceTopicId];
      const isCompleted = learnerState.history.completedTopicIds.includes(sourceTopicId) || 
                          (mastery && mastery.masteryPercentage >= 70);

      if (isCompleted) {
        completedCount++;
      } else {
        missingTopicIds.push(sourceTopicId);
      }
    }

    return {
      satisfied: missingTopicIds.length === 0,
      missingPrerequisiteTopicIds: missingTopicIds,
      mandatoryCount: mandatoryPrereqEdges.length,
      completedCount,
      supportingTopicIds
    };
  }

  async getTopologicalProgression(): Promise<string[]> {
    return this.graph.nodes
      .slice()
      .sort((a, b) => a.tier - b.tier)
      .map(n => n.topicId);
  }
}
