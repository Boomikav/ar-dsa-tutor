import { DSATopic } from '../models/topic';

export const AR_SUPPORTED_TOPIC_IDS = [
  'ds-binary-search-tree',
  'algo-bubble-sort',
  'algo-binary-search',
  'algo-breadth-first-search',
  'ds-stack',
  'algo-merge-sort',
  'ds-avl-tree',
  'algo-dijkstras-algorithm'
] as const;

export type ARSupportedTopicId = typeof AR_SUPPORTED_TOPIC_IDS[number];

export function isARSupportedTopic(topicId: string): boolean {
  return (AR_SUPPORTED_TOPIC_IDS as readonly string[]).includes(topicId);
}

/**
 * Foundational 20 DSA Concepts Catalog.
 * Fully modeled for Data Structures and Algorithms with explicit prerequisite mappings,
 * complexity annotations, and AR asset specifications.
 */
export const INITIAL_DSA_TOPICS: DSATopic[] = [
  // ================= DATA STRUCTURES (9) =================
  {
    id: 'ds-array',
    slug: 'array',
    title: 'Array',
    category: 'data-structure',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    shortDescription: 'Contiguous memory collection accessed via index with constant-time lookup.',
    detailedConcept: 'An Array stores elements in contiguous memory locations. Because memory addresses are sequential, indexing provides O(1) random access: Address = BaseAddress + (Index * ElementSize). Insertions and deletions require shifting elements, leading to O(N) operations.',
    learningObjectives: [
      'Understand contiguous memory allocation and zero-indexing arithmetic.',
      'Analyze O(1) lookup vs O(N) insertion/deletion trade-offs.',
      'Visualize 1D index pointers and boundary checks in spatial 3D view.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) access', average: 'O(N) search', worst: 'O(N) insert/delete' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'array-linear-grid',
      defaultCameraDistance: 1.2,
      initialScale: 1.0,
      interactiveAnchors: ['index-pointer', 'element-block', 'memory-boundary']
    },
    tags: ['linear', 'fundamentals', 'memory', 'primitive'],
    orderIndex: 1
  },
  {
    id: 'ds-linked-list',
    slug: 'linked-list',
    title: 'Linked List',
    category: 'data-structure',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    shortDescription: 'Linear sequence of discrete nodes linked by directional pointers.',
    detailedConcept: 'Unlike contiguous arrays, a Linked List uses a node-based dynamic representation with references. Each node encapsulates a data payload and a pointer/reference to the subsequent node (and previous node in Doubly Linked Lists). Dynamic size comes at the cost of O(N) traversal and reference overhead.',
    learningObjectives: [
      'Contrast reference linkages with contiguous array memory.',
      'Master pointer manipulation for node insertion and deletion.',
      'Inspect head, tail, and null pointer terminations in interactive 3D space.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) prepend', average: 'O(N) search/access', worst: 'O(N) traversal' },
    spaceComplexity: 'O(N) + O(N) pointer overhead',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'linked-list-chain',
      defaultCameraDistance: 1.5,
      initialScale: 1.0,
      interactiveAnchors: ['head-node', 'next-pointer-vector', 'null-terminator']
    },
    tags: ['linear', 'pointers', 'dynamic-memory'],
    orderIndex: 2
  },
  {
    id: 'ds-stack',
    slug: 'stack',
    title: 'Stack',
    category: 'data-structure',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    shortDescription: 'LIFO (Last-In, First-Out) structure enabling push, pop, and peek.',
    detailedConcept: 'A Stack restricts modifications to a single end termed the Top. Adhering strictly to Last-In First-Out (LIFO), elements are pushed onto the top and popped from the top in O(1) time. Stacks are the bedrock of function call execution, syntax parsing, and DFS traversal.',
    learningObjectives: [
      'Analyze LIFO mechanics and call-stack frame emulation.',
      'Implement push, pop, and peek operations.',
      'Observe vertical 3D accumulation and stack-overflow boundaries in AR.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) push/pop', average: 'O(1) push/pop', worst: 'O(1) push/pop' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'stack-vertical-chute',
      defaultCameraDistance: 1.3,
      initialScale: 1.0,
      interactiveAnchors: ['top-pointer', 'frame-block']
    },
    tags: ['lifo', 'linear', 'call-stack'],
    orderIndex: 3
  },
  {
    id: 'ds-queue',
    slug: 'queue',
    title: 'Queue',
    category: 'data-structure',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    shortDescription: 'FIFO (First-In, First-Out) sequence with enqueue at rear and dequeue at front.',
    detailedConcept: 'A Queue enforces First-In First-Out (FIFO) ordering. Items enter at the rear (enqueue) and exit at the front (dequeue). Circular queues utilize modulo arithmetic over arrays to eliminate memory leakage. Essential for buffering, task scheduling, and BFS search.',
    learningObjectives: [
      'Compare FIFO mechanics against LIFO stacks.',
      'Trace front and rear pointers during continuous enqueue/dequeue cycles.',
      'Observe circular buffer wraparounds in 3D carousel space.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) enqueue/dequeue', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'queue-conveyor',
      defaultCameraDistance: 1.4,
      initialScale: 1.0,
      interactiveAnchors: ['front-pointer', 'rear-pointer', 'conveyor-slot']
    },
    tags: ['fifo', 'linear', 'buffering', 'scheduling'],
    orderIndex: 4
  },
  {
    id: 'ds-binary-tree',
    slug: 'binary-tree',
    title: 'Binary Tree',
    category: 'data-structure',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    shortDescription: 'Hierarchical structure where each node has at most two children.',
    detailedConcept: 'A Binary Tree is a nonlinear hierarchical structure consisting of a root node and two disjoint left and right subtrees. Traversal protocols include Depth-First (Pre-order, In-order, Post-order) and Breadth-First (Level-order).',
    learningObjectives: [
      'Understand parent, child, ancestor, and leaf relationships.',
      'Differentiate full, complete, and degenerate binary trees.',
      'Examine 3D branching hierarchies and spatial depth layers.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) root access', average: 'O(N) traversal', worst: 'O(N) traversal' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'binary-tree-radial',
      defaultCameraDistance: 1.8,
      initialScale: 0.9,
      interactiveAnchors: ['root-node', 'left-branch', 'right-branch', 'depth-ring']
    },
    tags: ['hierarchical', 'tree', 'nonlinear'],
    orderIndex: 5
  },
  {
    id: 'ds-binary-search-tree',
    slug: 'binary-search-tree',
    title: 'Binary Search Tree',
    category: 'data-structure',
    difficulty: 'Intermediate',
    estimatedMinutes: 40,
    shortDescription: 'Sorted binary tree invariant: left subtree < root < right subtree.',
    detailedConcept: 'BST maintains an ordering property across all subtrees: every left descendant holds a key less than the parent node, and every right descendant holds a key greater. This invariant enables average O(log N) lookup, insertion, and deletion. Degenerate trees collapse into O(N) linked lists.',
    learningObjectives: [
      'Validate and preserve the BST ordering invariant across inserts.',
      'Formulate in-order traversal to produce sorted element sequences.',
      'Interact with 3D decision branch splits during lookup in AR.'
    ],
    prerequisites: ['ds-binary-tree'],
    timeComplexity: { best: 'O(1) root match', average: 'O(log N) search/insert', worst: 'O(N) skewed' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'bst-decision-tree',
      defaultCameraDistance: 2.0,
      initialScale: 0.85,
      interactiveAnchors: ['decision-node', 'comparator-branch', 'inorder-path']
    },
    tags: ['search-tree', 'bst', 'logarithmic'],
    orderIndex: 6
  },
  {
    id: 'ds-avl-tree',
    slug: 'avl-tree',
    title: 'AVL Tree',
    category: 'data-structure',
    difficulty: 'Advanced',
    estimatedMinutes: 40,
    shortDescription: 'Self-balancing binary search tree maintaining height invariant |hL - hR| <= 1.',
    detailedConcept: 'An AVL Tree is a self-balancing Binary Search Tree where the heights of the two child subtrees of any node differ by at most one. Whenever an insertion or deletion violates this balance factor invariant (BF not in {-1, 0, +1}), rebalancing is performed via one of four tree rotations: Left-Left (Single Right), Right-Right (Single Left), Left-Right (Double Left-Right), or Right-Left (Double Right-Left). Guarantees strict O(log N) lookup, insertion, and deletion.',
    learningObjectives: [
      'Understand height balance factors and strict tree height bounds.',
      'Master the 4 rotation cases: Single (LL, RR) and Double (LR, RL).',
      'Observe real-time balance factor recomputation and rotation pivots in interactive 3D AR space.'
    ],
    prerequisites: ['ds-binary-search-tree'],
    timeComplexity: { best: 'O(log N)', average: 'O(log N)', worst: 'O(log N)' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'avl-balanced-tree',
      defaultCameraDistance: 2.0,
      initialScale: 0.85,
      interactiveAnchors: ['balance-factor-badge', 'rotation-pivot']
    },
    tags: ['balanced-tree', 'avl', 'self-balancing', 'rotation'],
    orderIndex: 7
  },
  {
    id: 'ds-heap',
    slug: 'heap',
    title: 'Heap',
    category: 'data-structure',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    shortDescription: 'Complete binary tree satisfying the max-heap or min-heap order invariant.',
    detailedConcept: 'A Heap is a complete binary tree satisfying the heap property: in a Min-Heap, parent <= children; in a Max-Heap, parent >= children. Heaps are efficiently packed into flat arrays without explicit pointers: Parent(i) = floor((i-1)/2), LeftChild(i) = 2i+1, RightChild(i) = 2i+2. Underpins Priority Queues and Heap Sort.',
    learningObjectives: [
      'Bridge the mathematical relationship between flat arrays and complete binary trees.',
      'Trace heapify-up and heapify-down balancing routines.',
      'Inspect parent-child index leap vectors in interactive 3D space.'
    ],
    prerequisites: ['ds-binary-tree'],
    timeComplexity: { best: 'O(1) peek min/max', average: 'O(log N) push/pop', worst: 'O(log N) push/pop' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'heap-pyramid',
      defaultCameraDistance: 1.7,
      initialScale: 0.9,
      interactiveAnchors: ['root-peak', 'heapify-vector', 'array-mirror']
    },
    tags: ['priority-queue', 'tree', 'array-backed'],
    orderIndex: 7
  },
  {
    id: 'ds-hash-table',
    slug: 'hash-table',
    title: 'Hash Table',
    category: 'data-structure',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    shortDescription: 'Associative array mapping keys to buckets using deterministic hash functions.',
    detailedConcept: 'Hash Tables achieve average O(1) key-value retrieval by passing keys into a hash function that generates bucket indices: Index = Hash(Key) % BucketCount. Collisions are handled via separate chaining (linked lists) or open addressing (linear probing, double hashing).',
    learningObjectives: [
      'Analyze hash distribution quality and collision probability.',
      'Trace separate chaining and open addressing resolution.',
      'Visualize hash buckets and collision chains in interactive 3D space.'
    ],
    prerequisites: ['ds-array'],
    timeComplexity: { best: 'O(1) search/insert', average: 'O(1)', worst: 'O(N) high collisions' },
    spaceComplexity: 'O(N)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'hash-table-rack',
      defaultCameraDistance: 1.6,
      initialScale: 0.95,
      interactiveAnchors: ['hash-hasher', 'bucket-slot', 'overflow-chain']
    },
    tags: ['key-value', 'constant-time', 'hashing'],
    orderIndex: 8
  },
  {
    id: 'ds-graph',
    slug: 'graph',
    title: 'Graph',
    category: 'data-structure',
    difficulty: 'Advanced',
    estimatedMinutes: 45,
    shortDescription: 'Nonlinear network of vertices (nodes) interconnected by directed or undirected edges.',
    detailedConcept: 'A Graph G = (V, E) models arbitrary relationships between entities. Graphs may be directed (digraph) or undirected, weighted or unweighted, cyclic or acyclic (DAG). Representations include Adjacency Matrix (dense, O(V^2) memory) and Adjacency List (sparse, O(V + E) memory).',
    learningObjectives: [
      'Compare Adjacency Matrix vs Adjacency List space and time trade-offs.',
      'Recognize cycles, degrees, and connectivity topologies.',
      'Walk around an interactive 3D spatial network of vertices and illuminated edges.'
    ],
    prerequisites: [],
    timeComplexity: { best: 'O(1) edge check (Matrix)', average: 'O(V+E) traversal', worst: 'O(V^2)' },
    spaceComplexity: 'O(V + E) List / O(V^2) Matrix',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'graph-network-constellation',
      defaultCameraDistance: 2.2,
      initialScale: 0.8,
      interactiveAnchors: ['vertex-sphere', 'weighted-edge', 'adjacency-toggle']
    },
    tags: ['network', 'vertices', 'edges', 'dag'],
    orderIndex: 9
  },

  // ================= ALGORITHMS (11) =================
  {
    id: 'algo-recursion',
    slug: 'recursion',
    title: 'Recursion',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    shortDescription: 'Algorithmic strategy where a function solves sub-problems by invoking itself.',
    detailedConcept: 'Recursion breaks complex problems into self-similar sub-problems until reaching a terminating base condition. Each call allocates a stack frame storing local variables and return pointers. Crucial foundation for tree traversals, divide-and-conquer, and DFS.',
    learningObjectives: [
      'Identify base cases vs recursive progression steps.',
      'Trace call-stack frame growth, return value unwinding, and stack overflow risks.',
      'Watch stacked recursive execution frames expand and contract vertically in 3D.'
    ],
    prerequisites: ['ds-stack'],
    timeComplexity: { best: 'O(1) base case', average: 'O(N) linear / O(2^N) branching', worst: 'O(2^N)' },
    spaceComplexity: 'O(Depth) call-stack frames',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'recursion-tree-growth',
      defaultCameraDistance: 1.5,
      initialScale: 0.9,
      interactiveAnchors: ['base-case-barrier', 'call-stack-tower', 'unwind-arrow']
    },
    tags: ['fundamentals', 'divide-conquer', 'call-stack'],
    orderIndex: 10
  },
  {
    id: 'algo-linear-search',
    slug: 'linear-search',
    title: 'Linear Search',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    shortDescription: 'Sequential scan checking each element one-by-one until target is matched.',
    detailedConcept: 'Linear Search inspects every element in sequence from index 0 to N-1. Requires no sorted ordering pre-conditions. Terminates immediately upon target discovery or exhausts all N items.',
    learningObjectives: [
      'Understand worst-case exhaustive search behaviour.',
      'Quantify performance over unsorted datasets.',
      'Follow an illuminated scan spotlight sweeping through array cells in 3D view.'
    ],
    prerequisites: ['ds-array'],
    timeComplexity: { best: 'O(1) first item match', average: 'O(N)', worst: 'O(N) absent/last' },
    spaceComplexity: 'O(1)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'search-spotlight-sweep',
      defaultCameraDistance: 1.2,
      initialScale: 1.0,
      interactiveAnchors: ['scanner-beam', 'matched-cell', 'mismatched-cell']
    },
    tags: ['search', 'linear', 'elementary'],
    orderIndex: 11
  },
  {
    id: 'algo-binary-search',
    slug: 'binary-search',
    title: 'Binary Search',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    shortDescription: 'Logarithmic search over sorted arrays halving search space each iteration.',
    detailedConcept: 'Binary Search operates exclusively on sorted collections. By comparing the target with the midpoint value, it eliminates half the remaining search space every step: Low = Mid + 1 or High = Mid - 1. Reduces search time exponentially to O(log N).',
    learningObjectives: [
      'Calculate midpoints safely to prevent integer overflow.',
      'Observe logarithmic space elimination per decision step.',
      'Manipulate low, mid, and high spatial calipers over an anchored 3D array in AR.'
    ],
    prerequisites: ['ds-array', 'algo-linear-search'],
    timeComplexity: { best: 'O(1) mid match', average: 'O(log N)', worst: 'O(log N)' },
    spaceComplexity: 'O(1) iterative / O(log N) recursive',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'binary-search-calipers',
      defaultCameraDistance: 1.4,
      initialScale: 1.0,
      interactiveAnchors: ['low-caliper', 'mid-pointer', 'high-caliper', 'eliminated-zone']
    },
    tags: ['search', 'logarithmic', 'divide-conquer'],
    orderIndex: 12
  },
  {
    id: 'algo-bubble-sort',
    slug: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    shortDescription: 'Repeatedly compares adjacent items and swaps them if out of order.',
    detailedConcept: 'Bubble Sort iterates through an array, comparing adjacent pairs (A[j], A[j+1]) and swapping them if A[j] > A[j+1]. After pass k, the k-th largest element is guaranteed to have "bubbled" to its correct position at the end. Stable sorting algorithm.',
    learningObjectives: [
      'Trace adjacent comparison and swap cascades.',
      'Optimize early termination using a swapped flag.',
      'Watch glowing 3D bar pillars exchange positions with animated arcs in AR.'
    ],
    prerequisites: ['ds-array'],
    timeComplexity: { best: 'O(N) already sorted', average: 'O(N^2)', worst: 'O(N^2)' },
    spaceComplexity: 'O(1)',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'sorting-bars-bubble',
      defaultCameraDistance: 1.3,
      initialScale: 1.0,
      interactiveAnchors: ['swap-arc', 'sorted-partition-barrier']
    },
    tags: ['sorting', 'comparison', 'quadratic'],
    orderIndex: 13
  },
  {
    id: 'algo-selection-sort',
    slug: 'selection-sort',
    title: 'Selection Sort',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    shortDescription: 'In-place comparison sort dividing array into sorted and unsorted partitions.',
    detailedConcept: 'Selection Sort continuously finds the minimum element from the unsorted partition and places it at the beginning of the unsorted segment via a single swap. Performs exactly O(N) total swaps, but consistently requires O(N^2) comparisons regardless of input distribution.',
    learningObjectives: [
      'Distinguish the unsorted scan boundary from the sorted partition.',
      'Compare swap count efficiency against bubble sort.',
      'Track the minimum tracker cursor moving through 3D element blocks.'
    ],
    prerequisites: ['ds-array', 'algo-bubble-sort'],
    timeComplexity: { best: 'O(N^2)', average: 'O(N^2)', worst: 'O(N^2)' },
    spaceComplexity: 'O(1)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'sorting-bars-selection',
      defaultCameraDistance: 1.3,
      initialScale: 1.0,
      interactiveAnchors: ['min-tracker', 'partition-wall']
    },
    tags: ['sorting', 'in-place', 'quadratic'],
    orderIndex: 14
  },
  {
    id: 'algo-insertion-sort',
    slug: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'algorithm',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    shortDescription: 'Builds sorted array one element at a time by shifting elements into place.',
    detailedConcept: 'Insertion Sort mimics how people sort playing cards in hand. It takes the next element and shifts preceding greater elements rightward until finding the correct insertion slot. Highly efficient (O(N)) for small or nearly sorted datasets.',
    learningObjectives: [
      'Observe dynamic right-shifting of elements in memory.',
      'Analyze adaptive performance over partially sorted inputs.',
      'Slide 3D cards out, shift neighbors, and drop back into position in 3D view.'
    ],
    prerequisites: ['ds-array'],
    timeComplexity: { best: 'O(N) nearly sorted', average: 'O(N^2)', worst: 'O(N^2)' },
    spaceComplexity: 'O(1)',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'sorting-bars-insertion',
      defaultCameraDistance: 1.3,
      initialScale: 1.0,
      interactiveAnchors: ['key-card', 'shift-cascade']
    },
    tags: ['sorting', 'adaptive', 'stable'],
    orderIndex: 15
  },
  {
    id: 'algo-merge-sort',
    slug: 'merge-sort',
    title: 'Merge Sort',
    category: 'algorithm',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    shortDescription: 'Divide-and-conquer algorithm recursively splitting array in halves and merging.',
    detailedConcept: 'Merge Sort divides the array into two halves, recursively sorts them, and then merges the two sorted subarrays back together using two pointers. Guarantees O(N log N) worst-case time complexity, but requires O(N) auxiliary space for merging arrays.',
    learningObjectives: [
      'Master the divide, conquer, and combine paradigm.',
      'Trace two-pointer merge subroutine mechanics.',
      'Watch 3D arrays fork downwards into split leaves and coalesce upwards in 3D view.'
    ],
    prerequisites: ['ds-array', 'algo-recursion'],
    timeComplexity: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)' },
    spaceComplexity: 'O(N) auxiliary array',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'merge-sort-tree',
      defaultCameraDistance: 1.8,
      initialScale: 0.85,
      interactiveAnchors: ['split-fork', 'merge-converger']
    },
    tags: ['sorting', 'divide-conquer', 'stable', 'log-linear'],
    orderIndex: 16
  },
  {
    id: 'algo-quick-sort',
    slug: 'quick-sort',
    title: 'Quick Sort',
    category: 'algorithm',
    difficulty: 'Intermediate',
    estimatedMinutes: 40,
    shortDescription: 'Efficient in-place sorting algorithm partitioning arrays around a chosen pivot.',
    detailedConcept: 'Quick Sort chooses a pivot element and partitions the array such that all items smaller than pivot are placed to its left, and larger items to its right. It then recurses on the sub-partitions. Extremely fast in practice with cache-friendly locality.',
    learningObjectives: [
      'Master Lomuto vs Hoare partitioning schemes.',
      'Understand pivot selection impact on O(N^2) degenerate worst cases.',
      'Pivot highlight and dual-pointer cross in interactive 3D space.'
    ],
    prerequisites: ['ds-array', 'algo-recursion'],
    timeComplexity: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N^2) poor pivot' },
    spaceComplexity: 'O(log N) stack recursion',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'quick-sort-pivot-split',
      defaultCameraDistance: 1.6,
      initialScale: 0.9,
      interactiveAnchors: ['pivot-pillar', 'left-pointer', 'right-pointer']
    },
    tags: ['sorting', 'in-place', 'divide-conquer', 'pivot'],
    orderIndex: 17
  },
  {
    id: 'algo-breadth-first-search',
    slug: 'breadth-first-search',
    title: 'BFS (Breadth-First Search)',
    category: 'algorithm',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    shortDescription: 'Explores graph or tree level-by-level using a FIFO queue to find shortest paths.',
    detailedConcept: 'BFS begins at a start vertex and visits all immediate neighbors (distance 1) before exploring vertices at distance 2. Employs a Queue to maintain frontier exploration and a Visited Set to avoid infinite cycle loops. Guarantees the shortest path in unweighted graphs.',
    learningObjectives: [
      'Implement FIFO queue-driven graph frontiers.',
      'Prevent cycles using visited state maps.',
      'Watch concentric concentric wavefront rings ripple outward across 3D nodes in AR.'
    ],
    prerequisites: ['ds-queue', 'ds-graph'],
    timeComplexity: { best: 'O(1) start is target', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V) queue and visited set',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'bfs-wavefront-expansion',
      defaultCameraDistance: 2.0,
      initialScale: 0.85,
      interactiveAnchors: ['wavefront-pulse', 'queue-preview', 'visited-glow']
    },
    tags: ['graph-traversal', 'shortest-path', 'queue-driven'],
    orderIndex: 18
  },
  {
    id: 'algo-depth-first-search',
    slug: 'depth-first-search',
    title: 'DFS (Depth-First Search)',
    category: 'algorithm',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    shortDescription: 'Explores as deep as possible along each branch before backtracking via stack.',
    detailedConcept: 'DFS traverses down a single branch until reaching a leaf or vertex with no unvisited neighbors, then backtracks to previous decision junctions. Can be implemented recursively using the call-stack or iteratively using an explicit Stack. Underpins topological sorting and cycle detection.',
    learningObjectives: [
      'Compare recursive call-stack backtracking with explicit stack traversal.',
      'Detect back-edges and cycles in directed graphs.',
      'Trace deep glowing exploration threads plunging through 3D graph layers in 3D space.'
    ],
    prerequisites: ['ds-graph'],
    timeComplexity: { best: 'O(1) immediate match', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V) stack depth and visited set',
    visualSpec: {
      hasArModel: false,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'dfs-plunge-backtrack',
      defaultCameraDistance: 2.0,
      initialScale: 0.85,
      interactiveAnchors: ['backtrack-marker', 'exploration-beam']
    },
    tags: ['graph-traversal', 'backtracking', 'stack-driven'],
    orderIndex: 19
  },
  {
    id: 'algo-dijkstras-algorithm',
    slug: 'dijkstras-algorithm',
    title: "Dijkstra's Algorithm",
    category: 'algorithm',
    difficulty: 'Advanced',
    estimatedMinutes: 50,
    shortDescription: 'Finds shortest paths from source to all vertices in positive-weighted graphs.',
    detailedConcept: "Dijkstra's algorithm greedily extracts the vertex with minimum tentative distance from a Min-Heap (Priority Queue), relaxes all outgoing edges: if dist[u] + weight(u,v) < dist[v], update dist[v]. Requires all edge weights to be non-negative. Fundamental for routing protocols and spatial navigation.",
    learningObjectives: [
      'Understand edge relaxation arithmetic.',
      'Leverage Min-Heaps for optimal O((V + E) log V) running time.',
      'Watch dynamic shortest-path highway beams illuminate in interactive 3D view.'
    ],
    prerequisites: ['ds-graph', 'ds-heap'],
    timeComplexity: { best: 'O(E log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    spaceComplexity: 'O(V) distance map & priority queue',
    visualSpec: {
      hasArModel: true,
      modelFormat: 'procedural-3d',
      proceduralGeneratorId: 'dijkstra-shortest-pathway',
      defaultCameraDistance: 2.4,
      initialScale: 0.75,
      interactiveAnchors: ['source-beacon', 'relaxation-spark', 'optimal-path-beam']
    },
    tags: ['shortest-path', 'greedy', 'weighted-graph', 'priority-queue'],
    orderIndex: 20
  }
];
