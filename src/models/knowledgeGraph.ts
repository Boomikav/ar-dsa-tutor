/**
 * Knowledge Graph domain models.
 * Models topological relationships, prerequisite structures, and conceptual
 * dependencies across Data Structures and Algorithms with pedagogical nuance.
 */

export type RelationshipType = 
  | 'PREREQUISITE'           // Strict conceptual foundation required for comprehension
  | 'SUPPORTING_CONCEPT'     // Provides implementation backing or helpful intuition
  | 'APPLICATION_DEPENDENCY' // Algorithmic procedure operating directly on a data structure
  | 'RELATED_CONCEPT';       // Parallel, alternative, or contrasting concept

export type RelationshipStrength = 'MANDATORY' | 'RECOMMENDED' | 'HELPFUL';

export interface ConceptNode {
  id: string;
  topicId: string;
  title: string;
  category: 'data-structure' | 'algorithm';
  tier: number; // Tier 1: Fundamentals -> Tier 5: Advanced
  complexityWeight: number; // 1 to 10
}

export interface ConceptRelationship {
  id: string;
  sourceConceptId: string; // The antecedent concept
  targetConceptId: string; // The consequent concept
  relationshipType: RelationshipType;
  strength: RelationshipStrength;
  rationale: string;
}

// Alias PrerequisiteEdge to ConceptRelationship for backward-compatibility
export type PrerequisiteEdge = ConceptRelationship;

export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptRelationship[];
  updatedAt: string;
}
