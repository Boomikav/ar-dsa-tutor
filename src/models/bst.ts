/**
 * Binary Search Tree (BST) Domain Models & Operation Step Contracts.
 * 
 * Strict Single Source of Truth:
 * The data structures defined here are completely framework-agnostic, serializable,
 * and renderer-independent. They drive:
 * - 2D SVG visualizer
 * - Future AR 3D spatial renderer
 * - Socratic AI reasoning engine
 * - Practice mode decision evaluator
 * - Assessment question generator
 * - Analytics telemetry
 */

export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  parent?: string | null;
  depth: number;
  x?: number; // Normalized horizontal layout coordinate (0 to 100 or pixels)
  y?: number; // Normalized vertical layout coordinate
}

export type BSTDecisionType =
  | 'ROOT_CHECK'          // Examining if tree is empty or starting from root
  | 'COMPARE'             // Comparing target value with current node value
  | 'MOVE_LEFT'           // Target is smaller than node value -> branch left
  | 'MOVE_RIGHT'          // Target is greater than node value -> branch right
  | 'INSERT_FOUND'        // Reached null pointer -> valid insertion location found
  | 'VALUE_EXISTS'        // Duplicate key detected
  | 'SEARCH_FOUND'        // Target matches current node
  | 'SEARCH_NOT_FOUND';   // Traversed to leaf without matching target

export type BSTTraversalDirection = 'left' | 'right';

export interface BSTOperationStep {
  stepNumber: number;
  currentNodeId: string | null;
  currentNodeValue: number | null;
  targetValue: number;
  comparison: string;       // e.g. "40 < 50" or "Root is null"
  decision: BSTDecisionType;
  direction?: BSTTraversalDirection;
  message: string;          // Human-readable pedagogical explanation
  highlightNodeId?: string; // ID of node to emphasize in visualizer or AR
  highlightEdge?: { fromId: string; toId: string };
  isCompleted: boolean;     // Whether this step finishes the algorithm
  treeSnapshot: BSTNode | null; // Serializable tree state at this exact step
}

export interface BSTOperationResult {
  operationType: 'insert' | 'search' | 'delete';
  targetValue: number;
  initialTreeSnapshot: BSTNode | null;
  finalTreeSnapshot: BSTNode | null;
  steps: BSTOperationStep[];
  success: boolean;
  message: string;
}

export type BSTSubSkillId = 
  | 'concept_understanding'
  | 'insertion'
  | 'search'
  | 'traversal';

export type SubSkillStatus = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'MASTERED';

export interface BSTSubSkillProgress {
  conceptUnderstanding: number; // 0-100%
  insertion: number;            // 0-100%
  search: number;               // 0-100%
  traversal: number;            // 0-100%
}
