/**
 * Phase 10: Standardized Assessment Item Banks
 * 
 * Parallel-form pre-test, post-test, and delayed post-test questions
 * covering the 5 core evaluation topics:
 * 1. Array (ds-array)
 * 2. Binary Search (algo-binary-search)
 * 3. Bubble Sort (algo-bubble-sort)
 * 4. Binary Search Tree (ds-binary-search-tree)
 * 5. Breadth-First Search (algo-breadth-first-search)
 * 
 * Design Principles:
 * - Parallel forms with equivalent concept, skill, difficulty, and cognitive demand.
 * - Measures: Conceptual, Algorithmic Tracing, State Prediction, Misconception-Sensitivity, and Complexity.
 * - Deterministic validation without relying on generative AI for assessment grading.
 */

export interface ResearchQuestion {
  questionId: string;
  topicId: string;
  stage: 'PRETEST' | 'POSTTEST' | 'DELAYED_POSTTEST';
  parallelFormGroup: string; // Links isomorphic questions across stages
  cognitiveDimension: 'CONCEPTUAL' | 'TRACING' | 'STATE_PREDICTION' | 'MISCONCEPTION_REASONING' | 'COMPLEXITY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  targetedMisconception?: string;
}

export const RESEARCH_ASSESSMENT_BANK: ResearchQuestion[] = [
  // ==================== 1. ARRAY (ds-array) ====================
  // Item 1A: Pre-test
  {
    questionId: 'pre-arr-01',
    topicId: 'ds-array',
    stage: 'PRETEST',
    parallelFormGroup: 'arr-insert-shift',
    cognitiveDimension: 'STATE_PREDICTION',
    difficulty: 'MEDIUM',
    prompt: 'Given array [10, 20, 30, 40] with capacity 6, how many element shift operations occur when inserting 25 at index 2?',
    options: ['1 shift', '2 shifts', '3 shifts', '0 shifts (direct overwrite)'],
    correctOptionIndex: 1, // 30 and 40 must shift right
    explanation: 'Inserting at index 2 in an array of size 4 requires shifting elements at index 2 and index 3 (two elements: 30 and 40) one position to the right.',
    targetedMisconception: 'ARRAY_INSERTION_OVERWRITE_CONFUSION'
  },
  // Item 1B: Post-test (Parallel Form)
  {
    questionId: 'post-arr-01',
    topicId: 'ds-array',
    stage: 'POSTTEST',
    parallelFormGroup: 'arr-insert-shift',
    cognitiveDimension: 'STATE_PREDICTION',
    difficulty: 'MEDIUM',
    prompt: 'Given array [5, 15, 25, 35, 45] with capacity 8, how many element shift operations occur when inserting 18 at index 2?',
    options: ['2 shifts', '3 shifts', '4 shifts', '0 shifts'],
    correctOptionIndex: 1, // 25, 35, and 45 shift right -> 3 shifts
    explanation: 'Inserting at index 2 in an array of size 5 requires shifting elements at indices 2, 3, and 4 (three elements: 25, 35, 45) one position to the right.',
    targetedMisconception: 'ARRAY_INSERTION_OVERWRITE_CONFUSION'
  },
  // Item 1C: Delayed Post-test (Parallel Form)
  {
    questionId: 'delayed-arr-01',
    topicId: 'ds-array',
    stage: 'DELAYED_POSTTEST',
    parallelFormGroup: 'arr-insert-shift',
    cognitiveDimension: 'STATE_PREDICTION',
    difficulty: 'MEDIUM',
    prompt: 'Given array [4, 8, 12, 16, 20, 24] with capacity 10, how many element shift operations occur when inserting 14 at index 3?',
    options: ['1 shift', '2 shifts', '3 shifts', '4 shifts'],
    correctOptionIndex: 2, // 16, 20, 24 shift right -> 3 shifts
    explanation: 'Inserting at index 3 in an array of size 6 requires shifting elements at indices 3, 4, and 5 (three elements: 16, 20, 24) to the right.',
    targetedMisconception: 'ARRAY_INSERTION_OVERWRITE_CONFUSION'
  },

  // ==================== 2. BINARY SEARCH (algo-binary-search) ====================
  // Item 2A: Pre-test
  {
    questionId: 'pre-bs-01',
    topicId: 'algo-binary-search',
    stage: 'PRETEST',
    parallelFormGroup: 'bs-boundary-update',
    cognitiveDimension: 'MISCONCEPTION_REASONING',
    difficulty: 'MEDIUM',
    prompt: 'In binary search for target T in sorted array arr, if arr[mid] < T, what is the mathematically sound pointer update?',
    options: ['low = mid + 1', 'low = mid', 'high = mid - 1', 'high = mid'],
    correctOptionIndex: 0,
    explanation: 'Since arr[mid] is strictly less than T, target T cannot be at mid or any index left of mid. Therefore low must advance to mid + 1.',
    targetedMisconception: 'OFF_BY_ONE_ERROR'
  },
  // Item 2B: Post-test (Parallel Form)
  {
    questionId: 'post-bs-01',
    topicId: 'algo-binary-search',
    stage: 'POSTTEST',
    parallelFormGroup: 'bs-boundary-update',
    cognitiveDimension: 'MISCONCEPTION_REASONING',
    difficulty: 'MEDIUM',
    prompt: 'In binary search for target T in sorted array arr, if arr[mid] > T, what is the mathematically sound pointer update?',
    options: ['high = mid - 1', 'high = mid', 'low = mid + 1', 'low = mid'],
    correctOptionIndex: 0,
    explanation: 'Since arr[mid] is strictly greater than T, target T cannot be at mid or any index right of mid. Therefore high must decrement to mid - 1.',
    targetedMisconception: 'OFF_BY_ONE_ERROR'
  },
  // Item 2C: Delayed Post-test (Parallel Form)
  {
    questionId: 'delayed-bs-01',
    topicId: 'algo-binary-search',
    stage: 'DELAYED_POSTTEST',
    parallelFormGroup: 'bs-boundary-update',
    cognitiveDimension: 'MISCONCEPTION_REASONING',
    difficulty: 'MEDIUM',
    prompt: 'If binary search improperly updates low = mid instead of low = mid + 1 when arr[mid] < T, what failure mode can occur when high - low == 1?',
    options: ['Infinite loop / termination failure', 'Array index out of bounds exception', 'Always returns index 0', 'Wrong sort order'],
    correctOptionIndex: 0,
    explanation: 'When high - low == 1, integer division gives mid = low. Setting low = mid leaves low unchanged, causing an infinite loop.',
    targetedMisconception: 'OFF_BY_ONE_ERROR'
  },

  // ==================== 3. BUBBLE SORT (algo-bubble-sort) ====================
  // Item 3A: Pre-test
  {
    questionId: 'pre-sort-01',
    topicId: 'algo-bubble-sort',
    stage: 'PRETEST',
    parallelFormGroup: 'bubble-pass-invariant',
    cognitiveDimension: 'TRACING',
    difficulty: 'MEDIUM',
    prompt: 'What is the state of array [5, 1, 4, 2, 8] after completing the first full pass of standard Bubble Sort (ascending)?',
    options: ['[1, 4, 2, 5, 8]', '[1, 2, 4, 5, 8]', '[5, 1, 2, 4, 8]', '[1, 5, 4, 2, 8]'],
    correctOptionIndex: 0,
    explanation: 'Step 1: (5,1)->[1,5,4,2,8]; Step 2: (5,4)->[1,4,5,2,8]; Step 3: (5,2)->[1,4,2,5,8]; Step 4: (5,8)->no swap. Final: [1,4,2,5,8].',
    targetedMisconception: 'SORT_BOUNDARY_INVARIANT_CONFUSION'
  },
  // Item 3B: Post-test (Parallel Form)
  {
    questionId: 'post-sort-01',
    topicId: 'algo-bubble-sort',
    stage: 'POSTTEST',
    parallelFormGroup: 'bubble-pass-invariant',
    cognitiveDimension: 'TRACING',
    difficulty: 'MEDIUM',
    prompt: 'What is the state of array [6, 2, 7, 3, 9] after completing the first full pass of standard Bubble Sort (ascending)?',
    options: ['[2, 6, 3, 7, 9]', '[2, 3, 6, 7, 9]', '[2, 6, 7, 3, 9]', '[6, 2, 3, 7, 9]'],
    correctOptionIndex: 0,
    explanation: 'Pass 1 compares and bubbles the largest non-suffix element: (6,2)->[2,6,7,3,9]; (6,7)->no swap; (7,3)->[2,6,3,7,9]; (7,9)->no swap. Result: [2,6,3,7,9].',
    targetedMisconception: 'SORT_BOUNDARY_INVARIANT_CONFUSION'
  },
  // Item 3C: Delayed Post-test (Parallel Form)
  {
    questionId: 'delayed-sort-01',
    topicId: 'algo-bubble-sort',
    stage: 'DELAYED_POSTTEST',
    parallelFormGroup: 'bubble-pass-invariant',
    cognitiveDimension: 'TRACING',
    difficulty: 'MEDIUM',
    prompt: 'What is the state of array [7, 3, 5, 1, 10] after completing the first full pass of standard Bubble Sort (ascending)?',
    options: ['[3, 5, 1, 7, 10]', '[1, 3, 5, 7, 10]', '[3, 7, 1, 5, 10]', '[7, 1, 3, 5, 10]'],
    correctOptionIndex: 0,
    explanation: '(7,3)->[3,7,5,1,10]; (7,5)->[3,5,7,1,10]; (7,1)->[3,5,1,7,10]; (7,10)->no swap. Result: [3,5,1,7,10].',
    targetedMisconception: 'SORT_BOUNDARY_INVARIANT_CONFUSION'
  },

  // ==================== 4. BINARY SEARCH TREE (ds-binary-search-tree) ====================
  // Item 4A: Pre-test
  {
    questionId: 'pre-bst-01',
    topicId: 'ds-binary-search-tree',
    stage: 'PRETEST',
    parallelFormGroup: 'bst-inorder-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'EASY',
    prompt: 'Which tree traversal order on a valid Binary Search Tree always outputs node keys in strictly non-decreasing sorted order?',
    options: ['In-order (Left, Root, Right)', 'Pre-order (Root, Left, Right)', 'Post-order (Left, Right, Root)', 'Level-order (Breadth-First)'],
    correctOptionIndex: 0,
    explanation: 'In-order traversal visits all nodes in the left subtree (< root), then the root, then all nodes in the right subtree (> root), yielding sorted order.',
    targetedMisconception: 'BST_INVARIANT_CONFUSION'
  },
  // Item 4B: Post-test (Parallel Form)
  {
    questionId: 'post-bst-01',
    topicId: 'ds-binary-search-tree',
    stage: 'POSTTEST',
    parallelFormGroup: 'bst-inorder-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'EASY',
    prompt: 'To verify whether a binary tree preserves the BST invariant across all nodes in linear time, what property must hold for its in-order traversal?',
    options: ['Every traversed key must be strictly greater than the preceding key', 'The root key must appear first in traversal', 'Left children must always equal right children', 'All leaves must reside at identical depth'],
    correctOptionIndex: 0,
    explanation: 'A binary tree is a valid BST if and only if its in-order traversal sequence produces a strictly monotonically increasing sequence (assuming unique keys).',
    targetedMisconception: 'BST_INVARIANT_CONFUSION'
  },
  // Item 4C: Delayed Post-test (Parallel Form)
  {
    questionId: 'delayed-bst-01',
    topicId: 'ds-binary-search-tree',
    stage: 'DELAYED_POSTTEST',
    parallelFormGroup: 'bst-inorder-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'EASY',
    prompt: 'If an in-order traversal of a binary tree produces [10, 20, 15, 30], which conclusion is mathematically sound?',
    options: ['The tree violates the BST invariant because 15 appears after 20', 'The tree is a valid AVL tree', 'The tree has height 4', 'In-order traversal cannot detect BST violations'],
    correctOptionIndex: 0,
    explanation: 'Because 15 is smaller than 20 but appears after it in the in-order traversal, the tree is not a valid BST.',
    targetedMisconception: 'BST_INVARIANT_CONFUSION'
  },

  // ==================== 5. BREADTH-FIRST SEARCH (algo-breadth-first-search) ====================
  // Item 5A: Pre-test
  {
    questionId: 'pre-bfs-01',
    topicId: 'algo-breadth-first-search',
    stage: 'PRETEST',
    parallelFormGroup: 'bfs-queue-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'MEDIUM',
    prompt: 'Which data structure is fundamental to maintaining the level-by-level frontier exploration of Breadth-First Search on an unweighted graph?',
    options: ['First-In-First-Out Queue', 'Last-In-First-Out Stack', 'Priority Queue (Min-Heap)', 'Hash Map with sorted keys'],
    correctOptionIndex: 0,
    explanation: 'BFS uses a FIFO queue so that all vertices at distance d are visited and processed before any vertices at distance d + 1.',
    targetedMisconception: 'BFS_DFS_DATA_STRUCTURE_CONFUSION'
  },
  // Item 5B: Post-test (Parallel Form)
  {
    questionId: 'post-bfs-01',
    topicId: 'algo-breadth-first-search',
    stage: 'POSTTEST',
    parallelFormGroup: 'bfs-queue-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'MEDIUM',
    prompt: 'If a student replaces the FIFO Queue in a standard BFS algorithm with a LIFO Stack, how does the resulting traversal behavior change?',
    options: ['It degenerates into Depth-First Search (DFS)', 'It still traverses level by level in reverse', 'It finds shortest paths in fewer steps', 'It throws a runtime exception'],
    correctOptionIndex: 0,
    explanation: 'Using a LIFO stack causes the search to explore as deep as possible along each branch before backtracking, which is the definition of Depth-First Search.',
    targetedMisconception: 'BFS_DFS_DATA_STRUCTURE_CONFUSION'
  },
  // Item 5C: Delayed Post-test (Parallel Form)
  {
    questionId: 'delayed-bfs-01',
    topicId: 'algo-breadth-first-search',
    stage: 'DELAYED_POSTTEST',
    parallelFormGroup: 'bfs-queue-invariant',
    cognitiveDimension: 'CONCEPTUAL',
    difficulty: 'MEDIUM',
    prompt: 'Why does standard BFS guarantee finding the shortest path (minimum edge count) between two vertices in an unweighted graph?',
    options: ['The FIFO queue guarantees all paths of length k are explored before any path of length k+1', 'It sorts edges by ascending weight', 'It explores nodes in descending degree order', 'It revisits nodes multiple times to relax edges'],
    correctOptionIndex: 0,
    explanation: 'Due to the FIFO property of the queue, BFS discovers vertices in order of their exact distance (number of edges) from the source vertex.',
    targetedMisconception: 'BFS_DFS_DATA_STRUCTURE_CONFUSION'
  }
];

/**
 * Helper to fetch questions for a specific stage
 */
export function getResearchQuestionsByStage(stage: 'PRETEST' | 'POSTTEST' | 'DELAYED_POSTTEST'): ResearchQuestion[] {
  return RESEARCH_ASSESSMENT_BANK.filter(q => q.stage === stage);
}

/**
 * Helper to get question by ID
 */
export function getResearchQuestionById(id: string): ResearchQuestion | undefined {
  return RESEARCH_ASSESSMENT_BANK.find(q => q.questionId === id);
}
