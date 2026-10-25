/**
 * Structured Misconception Taxonomy for Data Structures & Algorithms.
 * Categorizes learner errors during interactive practice so pedagogical agents
 * can generate targeted remediation rather than generic "Wrong" messages.
 */

export type BSTMisconceptionType =
  | 'BST_WRONG_DIRECTION'           // Target < Node, but learner chose RIGHT (or vice-versa)
  | 'BST_SKIPPED_COMPARISON'        // Attempted to jump directly to a leaf without traversing
  | 'BST_WRONG_INSERTION_POSITION'  // Attempted to insert where a child already exists
  | 'BST_CONFUSED_LEFT_RIGHT'       // Inversion of the fundamental BST ordering property
  | 'BST_ROOT_CONFUSION'            // Failure to begin search/insertion from the root node
  | 'BST_DUPLICATE_INSERTION';      // Failure to handle duplicate key invariant

export type DSAMisconceptionType =
  // Array & Linked List
  | 'ARRAY_WRONG_INDEX'
  | 'ARRAY_WRONG_INSERTION_POSITION'
  | 'ARRAY_OUT_OF_BOUNDS'
  | 'LINKED_LIST_NULL_DEREFERENCE'
  | 'LINKED_LIST_LOST_HEAD_POINTER'
  | 'LINKED_LIST_WRONG_LINK'
  // Stack & Queue
  | 'STACK_LIFO_VIOLATION'
  | 'STACK_EMPTY_POP'
  | 'QUEUE_FIFO_VIOLATION'
  | 'QUEUE_WRONG_FRONT'
  | 'QUEUE_EMPTY_DEQUEUE'
  // Trees & Heaps
  | 'TREE_WRONG_TRAVERSAL_ORDER'
  | 'TREE_STRUCTURAL_VIOLATION'
  | 'HEAP_PROPERTY_VIOLATION'
  | 'HEAP_WRONG_PARENT_CHILD'
  | 'HASH_WRONG_BUCKET'
  | 'HASH_COLLISION_HANDLING_ERROR'
  // Graphs & Paths
  | 'GRAPH_INVALID_EDGE'
  | 'GRAPH_CYCLE_CONFUSION'
  | 'BFS_WRONG_FRONTIER'
  | 'BFS_VISITED_ERROR'
  | 'DFS_WRONG_BRANCH'
  | 'DFS_VISITED_ERROR'
  | 'DIJKSTRA_WRONG_RELAXATION'
  | 'DIJKSTRA_WRONG_MIN_DISTANCE_SELECTION'
  // Searching & Sorting
  | 'LINEAR_SEARCH_SKIP_ELEMENT'
  | 'LINEAR_SEARCH_WRONG_CONDITION'
  | 'BINARY_SEARCH_WRONG_HALF'
  | 'BINARY_SEARCH_UNSORTED_INPUT'
  | 'BINARY_SEARCH_OFF_BY_ONE'
  | 'SORT_WRONG_COMPARISON'
  | 'SORT_WRONG_SWAP'
  | 'SORT_WRONG_PARTITION'
  // Recursion
  | 'RECURSION_MISSING_BASE_CASE'
  | 'RECURSION_WRONG_SUBPROBLEM';

export type MisconceptionType = BSTMisconceptionType | DSAMisconceptionType;

export interface MisconceptionDiagnosis {
  id: string;
  type: MisconceptionType;
  topicId: string;
  targetValue?: number | string;
  currentNodeValue?: number | string;
  userChoice: string;          // e.g. "RIGHT", "LEFT_HALF", "SWAP"
  expectedChoice: string;      // e.g. "LEFT", "RIGHT_HALF", "NO_SWAP"
  pedagogicalExplanation: string; // Tailored explanation
  correctiveGuidance: string;  // Next recommended action
  timestamp: string;
}

export interface PracticeDecisionEvent {
  stepIndex: number;
  currentNodeValue: number;
  targetValue: number;
  decision: 'LEFT' | 'RIGHT' | 'INSERT_HERE' | 'CONFIRM_INSERT';
  isCorrect: boolean;
  misconception?: MisconceptionDiagnosis;
  timeSpentMs: number;
}
