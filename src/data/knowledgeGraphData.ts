import { ConceptGraph } from '../models/knowledgeGraph';
import { INITIAL_DSA_TOPICS } from './topicsData';

/**
 * Pedagogically Defensible DSA Knowledge Graph.
 * Distinguishes conceptual prerequisites from supporting concepts,
 * application dependencies, and related alternatives.
 * 
 * Prevents artificial linear blocking (e.g. Binary Tree is NOT blocked by Stack or Queue).
 */
export const INITIAL_KNOWLEDGE_GRAPH: ConceptGraph = {
  updatedAt: '2026-09-21T00:00:00.000Z',
  nodes: INITIAL_DSA_TOPICS.map((topic) => {
    let tier = 1;
    if (['ds-array', 'ds-linked-list', 'algo-linear-search', 'algo-recursion'].includes(topic.id)) {
      tier = 1;
    } else if (['ds-stack', 'ds-queue', 'algo-binary-search', 'algo-bubble-sort', 'algo-selection-sort', 'algo-insertion-sort', 'ds-hash-table'].includes(topic.id)) {
      tier = 2;
    } else if (['ds-binary-tree', 'ds-graph', 'algo-merge-sort', 'algo-quick-sort'].includes(topic.id)) {
      tier = 3;
    } else if (['ds-binary-search-tree', 'ds-heap', 'algo-breadth-first-search', 'algo-depth-first-search'].includes(topic.id)) {
      tier = 4;
    } else if (['algo-dijkstras-algorithm'].includes(topic.id)) {
      tier = 5;
    }

    return {
      id: `node-${topic.id}`,
      topicId: topic.id,
      title: topic.title,
      category: topic.category,
      tier,
      complexityWeight: Math.min(10, Math.max(2, tier * 2))
    };
  }),

  edges: [
    // ==========================================
    // 1. LINEAR STRUCTURES & COMPARISONS
    // ==========================================
    {
      id: 'rel-array-linked-list',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-linked-list',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Contrasts contiguous memory indexing with discrete dynamic pointer chaining.'
    },
    {
      id: 'rel-array-stack',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-stack',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Arrays provide an efficient fixed-size or dynamic backing store for stacks.'
    },
    {
      id: 'rel-ll-stack',
      sourceConceptId: 'node-ds-linked-list',
      targetConceptId: 'node-ds-stack',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Linked lists allow O(1) stack push/pop operations at the head node.'
    },
    {
      id: 'rel-stack-queue',
      sourceConceptId: 'node-ds-stack',
      targetConceptId: 'node-ds-queue',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Fundamental contrast between Last-In-First-Out (LIFO) and First-In-First-Out (FIFO) access disciplines.'
    },
    {
      id: 'rel-array-queue',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-queue',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Circular arrays with modulo index arithmetic provide efficient queue buffer implementations.'
    },

    // ==========================================
    // 2. SEARCHING & ELEMENTARY SORTING
    // ==========================================
    {
      id: 'rel-array-linear-search',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-linear-search',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Linear scan requires an indexable collection of elements.'
    },
    {
      id: 'rel-array-binary-search',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-binary-search',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Binary search mathematically requires O(1) random-access indexing over sorted elements.'
    },
    {
      id: 'rel-linear-binary-search',
      sourceConceptId: 'node-algo-linear-search',
      targetConceptId: 'node-algo-binary-search',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Appreciating the O(N) cost of linear search motivates logarithmic O(log N) space halving.'
    },
    {
      id: 'rel-array-bubble-sort',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-bubble-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Bubble sort swaps adjacent indices within contiguous memory.'
    },
    {
      id: 'rel-array-selection-sort',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-selection-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Selection sort operates over index partitions of an array.'
    },
    {
      id: 'rel-bubble-selection',
      sourceConceptId: 'node-algo-bubble-sort',
      targetConceptId: 'node-algo-selection-sort',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Contrasts continuous adjacent swapping with single minimum-selection passes.'
    },
    {
      id: 'rel-array-insertion-sort',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-insertion-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Insertion sort relies on shifting elements within contiguous array memory.'
    },
    {
      id: 'rel-selection-insertion',
      sourceConceptId: 'node-algo-selection-sort',
      targetConceptId: 'node-algo-insertion-sort',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Both maintain sorted/unsorted partitions, but insertion sort is adaptive to partially sorted inputs.'
    },

    // ==========================================
    // 3. RECURSION & ADVANCED DIVIDE-AND-CONQUER
    // ==========================================
    {
      id: 'rel-stack-recursion',
      sourceConceptId: 'node-ds-stack',
      targetConceptId: 'node-algo-recursion',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Call stack frames provide a tangible mental model for recursive call allocation and unwinding.'
    },
    {
      id: 'rel-recursion-merge-sort',
      sourceConceptId: 'node-algo-recursion',
      targetConceptId: 'node-algo-merge-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Merge sort is fundamentally structured as recursive divide-and-conquer sub-array splitting.'
    },
    {
      id: 'rel-array-merge-sort',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-merge-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Merge sort operates by partitioning arrays and merging auxiliary buffers.'
    },
    {
      id: 'rel-recursion-quick-sort',
      sourceConceptId: 'node-algo-recursion',
      targetConceptId: 'node-algo-quick-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Quick sort requires recursive execution across partitioned sub-arrays.'
    },
    {
      id: 'rel-array-quick-sort',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-algo-quick-sort',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Quick sort partitions array memory in-place around a pivot element.'
    },
    {
      id: 'rel-merge-quick-sort',
      sourceConceptId: 'node-algo-merge-sort',
      targetConceptId: 'node-algo-quick-sort',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Contrasts stable out-of-place merge sort with cache-friendly in-place quick sort.'
    },

    // ==========================================
    // 4. HIERARCHICAL TREES & SPECIALIZATIONS
    // ==========================================
    {
      id: 'rel-ll-binary-tree',
      sourceConceptId: 'node-ds-linked-list',
      targetConceptId: 'node-ds-binary-tree',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Linked list nodes provide direct intuition for dynamic pointer-linked nodes (left/right vs next).'
    },
    {
      id: 'rel-tree-bst',
      sourceConceptId: 'node-ds-binary-tree',
      targetConceptId: 'node-ds-binary-search-tree',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'A Binary Search Tree is a Binary Tree that strictly preserves the left < node < right ordering invariant.'
    },
    {
      id: 'rel-bs-bst',
      sourceConceptId: 'node-algo-binary-search',
      targetConceptId: 'node-ds-binary-search-tree',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Binary search decision splitting provides intuition for BST traversal paths.'
    },
    {
      id: 'rel-tree-heap',
      sourceConceptId: 'node-ds-binary-tree',
      targetConceptId: 'node-ds-heap',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Heaps are structurally complete binary trees maintaining parent-child order invariants.'
    },
    {
      id: 'rel-array-heap',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-heap',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Heaps are compactly embedded in flat arrays using implicit parent/child index calculations.'
    },

    // ==========================================
    // 5. HASHING
    // ==========================================
    {
      id: 'rel-array-hash-table',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-hash-table',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'Hash tables require contiguous bucket arrays to achieve O(1) memory addressing from hash codes.'
    },
    {
      id: 'rel-ll-hash-table',
      sourceConceptId: 'node-ds-linked-list',
      targetConceptId: 'node-ds-hash-table',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Separate chaining collision resolution employs singly linked lists at each hash bucket.'
    },

    // ==========================================
    // 6. GRAPHS & NETWORK ALGORITHMS
    // ==========================================
    {
      id: 'rel-array-graph',
      sourceConceptId: 'node-ds-array',
      targetConceptId: 'node-ds-graph',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: '2D arrays (matrices) are used to represent adjacency matrices for dense graphs.'
    },
    {
      id: 'rel-ll-graph',
      sourceConceptId: 'node-ds-linked-list',
      targetConceptId: 'node-ds-graph',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Adjacency lists use linked lists or dynamic arrays for vertex edge lists.'
    },
    {
      id: 'rel-graph-bfs',
      sourceConceptId: 'node-ds-graph',
      targetConceptId: 'node-algo-breadth-first-search',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'BFS operates over graph vertices and adjacency relationships.'
    },
    {
      id: 'rel-queue-bfs',
      sourceConceptId: 'node-ds-queue',
      targetConceptId: 'node-algo-breadth-first-search',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'MANDATORY',
      rationale: 'A FIFO queue is the required operational data structure driving level-order frontier expansion.'
    },
    {
      id: 'rel-graph-dfs',
      sourceConceptId: 'node-ds-graph',
      targetConceptId: 'node-algo-depth-first-search',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'DFS traverses arbitrary graph topologies along deep connected branches.'
    },
    {
      id: 'rel-recursion-dfs',
      sourceConceptId: 'node-algo-recursion',
      targetConceptId: 'node-algo-depth-first-search',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Recursive call frames provide the cleanest implementation for branch backtracking.'
    },
    {
      id: 'rel-stack-dfs',
      sourceConceptId: 'node-ds-stack',
      targetConceptId: 'node-algo-depth-first-search',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'HELPFUL',
      rationale: 'Iterative DFS uses an explicit stack in place of function call recursion.'
    },
    {
      id: 'rel-bfs-dfs',
      sourceConceptId: 'node-algo-breadth-first-search',
      targetConceptId: 'node-algo-depth-first-search',
      relationshipType: 'RELATED_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: 'Contrasts level-order breadth-first wavefronts against single-branch depth exploration.'
    },
    {
      id: 'rel-graph-dijkstra',
      sourceConceptId: 'node-ds-graph',
      targetConceptId: 'node-algo-dijkstras-algorithm',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: "Dijkstra's algorithm operates on weighted directed/undirected graphs."
    },
    {
      id: 'rel-heap-dijkstra',
      sourceConceptId: 'node-ds-heap',
      targetConceptId: 'node-algo-dijkstras-algorithm',
      relationshipType: 'PREREQUISITE',
      strength: 'MANDATORY',
      rationale: 'A Min-Heap (Priority Queue) is required to greedily extract minimum-distance vertices in O(log V).'
    },
    {
      id: 'rel-bfs-dijkstra',
      sourceConceptId: 'node-algo-breadth-first-search',
      targetConceptId: 'node-algo-dijkstras-algorithm',
      relationshipType: 'SUPPORTING_CONCEPT',
      strength: 'RECOMMENDED',
      rationale: "Dijkstra's algorithm is a weighted generalization of the unweighted BFS shortest-path exploration."
    }
  ]
};
