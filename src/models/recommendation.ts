/**
 * Recommendation domain models.
 * Used by the adaptive recommendation engine to guide the learner's next actions
 * with nuanced pedagogical distinction.
 */

export type RecommendationType = 
  | 'NEXT_LOGICAL_CONCEPT'               // Natural next step in curriculum
  | 'REVISIT_PREREQUISITE'               // Blocked by missing strict conceptual prerequisite
  | 'RELATED_CONCEPT_EXPLORATION'        // Parallel concept related to current topic
  | 'SUPPORTING_CONCEPT_REINFORCEMENT'   // Helpful supporting concept (not a hard blocker)
  | 'SPACED_REPETITION_DRILL'            // Revision due to retention decay or low mastery
  | 'AR_SPATIAL_PRACTICE'                // 3D Spatial tactile practice
  | 'CHALLENGE_ASSESSMENT';              // Validation check

export interface RecommendationReason {
  headline: string;
  detail: string;
  sourceFactor: 
    | 'prerequisite_gap' 
    | 'related_concept' 
    | 'supporting_concept' 
    | 'low_mastery' 
    | 'decaying_retention' 
    | 'unlocked_node';
}

export interface Recommendation {
  id: string;
  targetTopicId: string;
  type: RecommendationType;
  priorityScore: number; // 0 to 100 (higher = more urgent)
  title: string;
  description: string;
  reason: RecommendationReason;
  estimatedMinutes: number;
  actionText: string;
}
