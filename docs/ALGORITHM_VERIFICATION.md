# AR-DSA Tutor — Five AR Algorithms Mathematical & Spatial Verification

**Author:** Technical Architecture & Verification Team  
**Scope:** The 5 WebXR-Ready Spatial Algorithms  
**Verification Date:** October 25, 2026  

---

## 1. Executive Verification Summary

Each of the five algorithms in AR-DSA Tutor is backed by an independent, deterministic state engine and a dedicated Three.js spatial visualizer. All algorithm states are mathematically verified against rigorous invariants before any visual transform or learner HUD event is dispatched.

| Algorithm | State Model | Spatial Scene Elements | Invariants Verified | User Interactions |
|---|---|---|---|---|
| **Binary Search Tree** | Hierarchical Node Graph (`value, left, right, parent`) | Cylindrical branches, spherical nodes, upright text sprites | $v_{left} < v_{node} < v_{right}$, height-balanced branching | Traverse Left/Right, Insert Node, Search Value, Reset |
| **Bubble Sort** | Ordered Array Tuple $(A, i, j, \text{swapped})$ | Linear sequence of 3D rounded blocks, comparison bracket, swap arc | Monotonic sorting, $\forall k > n - 1 - i, A[k] \le A[k+1]$ | Compare, Swap, Advance, Auto-Play/Pause, Reset |
| **Binary Search** | Interval Tuple $(A, \text{low}, \text{high}, \text{mid}, \text{target})$ | Ordered array row, color-coded low/mid/high calipers, eliminated dimming | Search space halving $\lfloor \frac{\text{low} + \text{high}}{2} \rfloor$, sorted precondition | Go Left, Go Right, Target Found, Absent Verification, Auto-Play, Reset |
| **Breadth-First Search** | Graph $G=(V, E)$, FIFO Queue $Q$, Visited Set $S$ | 3D vertex spheres, edge tubes, physical queue shelf, wave traversal glow | FIFO traversal order, distance monotonicity from root | Visit Neighbors, Dequeue, Select Start Vertex, Auto-Play, Reset |
| **Stack** | LIFO Vector $S \in \mathbb{R}^k, k \le 5$ | Clear acrylic container base, stackable cylindrical tokens, top pointer | LIFO pop order, capacity limit $k \le 5$, underflow protection | Push Value, Pop Element, Peek Top, Auto Clear, Capacity Alert |

---

## 2. Detailed Algorithm Specifications

### 2.1 Binary Search Tree (BST)
- **Engine File:** `src/services/dsa/bst/BSTEngine.ts`, `BSTPracticeEngine.ts`
- **Visualizer File:** `src/services/ar/ThreeBSTVisualizer.ts`
- **Invariants:**
  - For every node $N$, every key in $N.\text{left} < N.\text{key}$ and every key in $N.\text{right} > N.\text{key}$.
  - No duplicate values allowed during practice insertion.
- **Visual Correspondence:**
  - Active node is highlighted in high-contrast cyan (`#00f3ff`) with pulsing point light.
  - Candidate insertion sites are rendered as dashed wireframe spheres.
  - Left child placed at $(x - \Delta x, y - \Delta y, 0)$; right child at $(x + \Delta x, y - \Delta y, 0)$ where $\Delta x$ decreases by factor $0.5$ per depth level.
- **Edge Cases Tested:**
  - Insertion into empty tree (root creation).
  - Insertion of duplicate value (rejected with educational explanation).
  - Deep path traversal (branch spacing maintains readability without mesh overlap).
  - Reset restoration to initial balanced seed.

### 2.2 Bubble Sort
- **Engine File:** `src/services/dsa/sorting/BubbleSortEngine.ts`
- **Visualizer File:** `src/services/ar/ThreeBubbleSortVisualizer.ts`
- **Invariants:**
  - At the completion of pass $p$, the largest $p$ elements reside in their final sorted positions $A[n-p \dots n-1]$.
  - Stability: Equal values preserve their initial relative order.
- **Visual Correspondence:**
  - Active comparison pair $(j, j+1)$ highlighted in warning amber (`#ffb703`).
  - Swapping elements follow an arc trajectory in spatial $(x, y)$ plane.
  - Sorted elements turn glowing emerald green (`#00f59b`).
- **Learner Controls:**
  - "Compare Elements": Evaluates $A[j] > A[j+1]$.
  - "Swap": Permutes elements when $A[j] > A[j+1]$; displays error feedback if swapped erroneously.
  - "Next Step / Auto-Play": Executes deterministic step or continuous execution with pause.

### 2.3 Binary Search
- **Engine File:** `src/services/dsa/searching/BinarySearchEngine.ts`
- **Visualizer File:** `src/services/ar/ThreeBinarySearchVisualizer.ts`
- **Invariants:**
  - Precondition: Array $A$ is strictly monotonically sorted: $A[0] < A[1] < \dots < A[n-1]$.
  - Search range $[\text{low}, \text{high}]$ always contains target $T$ if $T \in A$.
- **Visual Correspondence:**
  - Eliminated array segments are dimmed with opacity reduced to $0.25$.
  - Low and High bounds indicated with vertical baseline markers.
  - Midpoint calculated as $\lfloor (\text{low} + \text{high}) / 2 \rfloor$, highlighted in vibrant purple (`#9d4edd`).
- **Edge Cases Tested:**
  - Target present at exact midpoint on first step.
  - Target present at boundary indices ($0$ or $n-1$).
  - Target absent: interval contracts until $\text{low} > \text{high}$, correctly terminating with "Element Not Found".

### 2.4 Breadth-First Search (BFS)
- **Engine File:** `src/services/dsa/graphAlgorithms/BFSEngine.ts`
- **Visualizer File:** `src/services/ar/ThreeBFSVisualizer.ts`
- **Invariants:**
  - Vertices are visited in non-decreasing order of their shortest-path distance from the root.
  - Queue invariant: All elements in $Q$ have distances differing by at most 1.
- **Visual Correspondence:**
  - Graph vertices positioned in a 3D constellation.
  - Physical 3D queue shelf at the base displays current queue items in FIFO order.
  - Visiting edge pulses with travelling particle packet.
- **Edge Cases Tested:**
  - Starting vertex switching (allows re-rooting from any graph vertex).
  - Cyclic graphs (visited set $S$ prevents infinite traversal loops).
  - Disconnected graph components handled gracefully.

### 2.5 Stack Data Structure
- **Engine File:** `src/services/dsa/stack/StackEngine.ts`
- **Visualizer File:** `src/services/ar/ThreeStackVisualizer.ts`
- **Invariants:**
  - LIFO Order: The most recently pushed element is the first element popped.
  - Capacity: Maximum 5 elements enforced; attempts to push when $k=5$ trigger `CAPACITY_LIMIT` error.
  - Underflow: Attempts to pop when $k=0$ trigger underflow protection.
- **Visual Correspondence:**
  - Transparent physical cylinder container placed on detected plane.
  - Elements slide down vertically into stack container.
  - Top pointer marker tracks highest element with elevation indicator.
- **Edge Cases Tested:**
  - Push on empty stack.
  - Push up to capacity limit ($k=5$) with visual container fill.
  - Push attempt on full stack (blocked with explanation).
  - Pop down to empty stack with underflow safety.

---

## 3. Test Suite Alignment

All mathematical transitions and visual invariants are verified in:
- `test/arFiveAlgorithmsVerification.ts` (95 passed)
- `test/dsaExpansionVerification.ts` (362 passed)
- `test/arCompositionVerification.ts` (121 passed)
- `test/arUXHardeningVerification.ts` (140 passed)
