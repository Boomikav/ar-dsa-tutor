/**
 * Data Structures and Algorithms (DSA) Topic domain models.
 * Designed for extensible integration with AR visualization, Knowledge Graph,
 * and adaptive learning engines.
 */

export type TopicCategory = 'data-structure' | 'algorithm';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface VisualAssetSpec {
  hasArModel: boolean;
  modelFormat?: 'gltf' | 'glb' | 'usdz' | 'procedural-3d';
  proceduralGeneratorId?: string;
  defaultCameraDistance?: number;
  initialScale?: number;
  interactiveAnchors?: string[];
}

export interface DSATopic {
  id: string;
  slug: string;
  title: string;
  category: TopicCategory;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  shortDescription: string;
  detailedConcept: string;
  learningObjectives: string[];
  prerequisites: string[]; // Topic IDs that should be mastered first
  timeComplexity?: {
    best?: string;
    average?: string;
    worst?: string;
  };
  spaceComplexity?: string;
  visualSpec: VisualAssetSpec;
  tags: string[];
  orderIndex: number;
}
