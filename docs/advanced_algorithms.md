# Advanced DSA Expansion: Merge Sort, AVL Tree, and Dijkstra's Shortest Path

## 1. Overview of the Expansion

The AR-DSA Tutor curriculum has been expanded from the initial five core topics to eight full data structures and algorithms by integrating three advanced algorithms:
1. **Algorithm 6: Merge Sort (`algo-merge-sort`)** — Classic divide-and-conquer comparison sort with recursive subarray trees and stable merging.
2. **Algorithm 7: AVL Tree (`ds-avl-tree`)** — Self-balancing Binary Search Tree maintaining strict height balancing with dynamic single and double rotations.
3. **Algorithm 8: Dijkstra's Algorithm (`algo-dijkstras-algorithm`)** — Greedy shortest path computation on non-negative weighted graphs using Min-Heap priority queues.

Crucially, all three algorithms have been integrated while preserving the **Protected AR Rendering Baseline Invariants**:
- Tabletop bounding envelope: Width $W \in [0.45\text{m}, 0.65\text{m}]$, Height $H \in [0.25\text{m}, 0.48\text{m}]$, Depth $D \le 0.30\text{m}$.
- Minimum base elevation: $Y_{\min} \ge 0.09\text{m} - 0.14\text{m}$ to ensure models remain unobscured by the bottom control HUD.
- Full compatibility with both immersive WebXR table plane tracking and desktop/mobile 3D fallback orbit controls.

---

## 2. Algorithm 6: Merge Sort (`algo-merge-sort`)

### 2.1 Theoretical Foundations & Invariants
- **Algorithmic Paradigm**: Divide and Conquer.
- **Recurrence Relation**: $T(n) = 2T(n/2) + \Theta(n) \implies \Theta(n \log n)$ via the Master Theorem.
- **Time Complexity**:
  - Best Case: $O(n \log n)$
  - Average Case: $O(n \log n)$
  - Worst Case: $O(n \log n)$
- **Space Complexity**:
  - Auxiliary Operational Space: $O(n)$ for buffer allocation.
  - Call Stack Space: $O(\log n)$.
- **Stability**: Strictly stable. Left-subarray elements precede equal right-subarray elements during comparison ($A[i] \le A[j]$).

### 2.2 3D Spatial Visualizer Design (`ThreeMergeSortVisualizer`)
- **Structure**: Recursive hierarchical bar/block layout in 3D space.
- **Original Array**: Rendered as elevated 3D bars along the top tier.
- **Subarray Partitions**: Dynamically separated left and right recursion clusters highlighted with color-coded comparison brackets.
- **Buffer / Merge Shelf**: Situated on a grounded secondary plane ($Y \ge 0.09\text{m}$) where merged elements are placed in sorted sequence.
- **Tabletop Envelope Compliance**:
  - Width: $0.550\text{ m}$ (within $[0.45\text{m}, 0.65\text{m}]$)
  - Height: $0.295\text{ m}$ (within $[0.25\text{m}, 0.48\text{m}]$)
  - Base Elevation: $Y_{\min} = 0.090\text{ m} \ge 0.09\text{m}$
  - Depth: $0.120\text{ m}$

### 2.3 Interactive Controls & Telemetry
- **Step Execution**: Subarray splitting, pairwise comparison, and write-back to main memory.
- **Auto-Play**: 1200ms timed animation progression through recursive levels.
- **State Telemetry**: `recursionDepth`, `comparisonsCount`, `writesCount`, `activeComparedIndices`, `activeWriteIndex`.

---

## 3. Algorithm 7: AVL Tree (`ds-avl-tree`)

### 3.1 Theoretical Foundations & Invariants
- **Definition**: Self-balancing BST where the heights of the two child subtrees of any node differ by at most one:
$$\text{BalanceFactor}(N) = \text{Height}(N.\text{left}) - \text{Height}(N.\text{right}) \in \{-1, 0, +1\}$$
- **Height Bound**: $h < 1.4404 \log_2(n + 2) - 0.328 \implies h = O(\log n)$.
- **Worst-Case Search/Insert/Delete**: Guaranteed $O(\log n)$.
- **The Four Rotation Cases**:
  1. **Left-Left (LL)**: Single Right Rotation ($\text{RotateRight}(Z)$)
  2. **Right-Right (RR)**: Single Left Rotation ($\text{RotateLeft}(Z)$)
  3. **Left-Right (LR)**: Double Rotation ($\text{RotateLeft}(Y) \to \text{RotateRight}(Z)$)
  4. **Right-Left (RL)**: Double Rotation ($\text{RotateRight}(Y) \to \text{RotateLeft}(Z)$)

### 3.2 3D Spatial Visualizer Design (`ThreeAVLTreeVisualizer`)
- **Node Geometry**: Spherical 3D nodes with floating text billboards displaying key values and active balance factors (e.g., `BF: +1`).
- **Connecting Edges**: Cylinder links dynamically updated during rotations.
- **Imbalance Highlighting**: Imbalanced nodes ($\text{BF} \notin \{-1, 0, +1\}$) glow in vivid amber/rose (`#ef4444`), while pivot nodes glow in cyan (`#00f2fe`).
- **Horizontal Spread**: Calibrated root spread of $0.16\text{m}$ preventing screen-edge clipping.
- **Tabletop Envelope Compliance**:
  - Width: $0.620\text{ m}$ (within $[0.45\text{m}, 0.65\text{m}]$)
  - Height: $0.412\text{ m}$ (within $[0.25\text{m}, 0.48\text{m}]$)
  - Base Elevation: $Y_{\min} = 0.095\text{ m} \ge 0.09\text{m}$
  - Depth: $0.110\text{ m}$

### 3.3 Interactive Controls
- **Interactive Insert**: Add new keys (e.g., $+15, +35, +60, +5, +28$) and observe dynamic rotation transitions.
- **Rebalance Step**: Step-by-step invariant restoration showing before-and-after tree states.
- **Reset**: Restores canonical balanced 7-node tree state.

---

## 4. Algorithm 8: Dijkstra's Shortest Path (`algo-dijkstras-algorithm`)

### 4.1 Theoretical Foundations & Invariants
- **Problem Formulation**: Single-source shortest path on directed/undirected weighted graph $G = (V, E)$ with non-negative edge weights ($w(u, v) \ge 0$).
- **Data Structure**: Priority Queue (Min-Heap) keyed on tentative distance $\text{dist}[v]$.
- **Greedy Invariant**: When vertex $u$ is extracted from the priority queue, $\text{dist}[u]$ is guaranteed to be the optimal shortest path distance from source $S$.
- **Edge Relaxation**: For each edge $(u, v) \in E$:
$$\text{if } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \text{dist}[v] = \text{dist}[u] + w(u, v), \quad \text{prev}[v] = u$$
- **Time Complexity**: $O((|V| + |E|) \log |V|)$ using binary min-heap.
- **Space Complexity**: $O(|V|)$ for distances and predecessor map.

### 4.2 3D Spatial Visualizer Design (`ThreeDijkstraVisualizer`)
- **Graph Layout**: 3D spatial network layout of vertices (A through F) with elevated topological positions.
- **Weighted Edges**: Directed 3D tubes with floating weight billboards (e.g., `wt: 4`).
- **State Shading**:
  - Unvisited vertices: Translucent slate `#64748b`
  - Current vertex: Amber glow `#f59e0b`
  - Relaxed edges: Emerald pulse `#10b981`
  - Finalized Shortest Path: Cyan illuminated ribbon `#00f2fe`
- **Tabletop Envelope Compliance**:
  - Width: $0.530\text{ m}$ (within $[0.45\text{m}, 0.65\text{m}]$)
  - Height: $0.402\text{ m}$ (within $[0.25\text{m}, 0.48\text{m}]$)
  - Base Elevation: $Y_{\min} = 0.115\text{ m} \ge 0.09\text{m}$
  - Depth: $0.220\text{ m}$

### 4.3 Interactive Controls
- **Relax Next Vertex**: Progresses to the next minimum-distance vertex extraction and relaxes all outgoing edges.
- **Auto-Play**: Continuous relaxation loop until destination vertex is reached.
- **Path Reconstruction**: Animates backtracing from target to source along predecessor pointers.
