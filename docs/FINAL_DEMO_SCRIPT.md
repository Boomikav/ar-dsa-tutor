# AR-DSA Tutor — Conference & Examiner Live Demonstration Script

**Audience:** Academic Conference Attendees, Thesis Examiners, and Peer Reviewers  
**Duration:** ~8–10 Minutes  
**Demonstrator:** Technical Lead / Research Presenter  

---

## 1. Introduction & Theoretical Motivation (1 Minute)

- **Opening Statement:**
  > "Welcome. AR-DSA Tutor addresses a central bottleneck in computer science education: the cognitive disconnect between abstract data structure invariants and concrete memory models. While 2D diagrams flatten multi-dimensional trees and graphs, AR-DSA Tutor projects real-time, deterministic 3D visualizations directly into the physical room using mobile WebXR camera passthrough, coupled with Execution-Grounded Explainable Adaptation (EGEA)."
- **Highlight:**
  > "Every algorithm operation is governed by a deterministic mathematical engine. AI never hallucinates algorithm states; all adaptive scaffolding is grounded in verified execution truth."

---

## 2. Topic Discovery & Curriculum Honesty (1.5 Minutes)

1. Open `http://localhost:5173` on desktop or mobile device.
2. Point out the **Home Screen**:
   - The prominent **AR-Ready Algorithms (5)** carousel showcasing the 5 spatial algorithms.
   - Contrast with other curriculum topics.
3. Navigate to **Explore Topics**:
   - Demonstrate the dedicated filter pill: **AR Ready (5)**.
   - Show that non-AR topics display `3D Model` or `2D Canvas` badges, transparently distinguishing them from true WebXR camera passthrough experiences.
4. Select **Binary Search Tree** and tap **"Launch AR Session"**.

---

## 3. WebXR Session & 5 Real AR Algorithms Demo (5 Minutes)

### Algorithm 1: Binary Search Tree (BST)
- **Visuals:** An upright, glowing 3D tree anchored into the physical space.
- **Interactions:**
  - Demonstrate search traversal: Tap "Traverse Left" and "Traverse Right". Notice the active node illuminates in vivid cyan (`#00f3ff`).
  - Demonstrate insertion: Insert node value `42`. Observe the step-by-step path trace down from root ($50 \to 30 \to 42$).
  - Switch operation to "Search Value 70" to show path branching.

### Algorithm 2: Bubble Sort
- In the top algorithm selector dropdown, switch directly to **Bubble Sort**.
- **Visuals:** Notice the previous BST scene cleanly unmounts and array block meshes appear immediately within the same session.
- **Interactions:**
  - Tap **"Compare Elements"**: The amber bracket calipers highlight adjacent elements.
  - Tap **"Swap"**: Elements follow an arc path swapping physical coordinates.
  - Tap **"Auto-Play"**: Watch the algorithm advance automatically through passes; sorted elements lock into glowing emerald green.

### Algorithm 3: Binary Search
- Switch to **Binary Search**.
- **Visuals:** Sorted array with three distinct colored pointer calipers: Low (amber), Mid (purple), High (cyan).
- **Interactions:**
  - Target value is indicated in the HUD.
  - Tap **"Go Right"**: The left half of the array dims to 25% opacity, visually eliminating the search space.
  - Show boundary condition when target is absent: pointers contract cleanly, terminating with "Target Not Found".

### Algorithm 4: Breadth-First Search (BFS)
- Switch to **Breadth-First Search**.
- **Visuals:** 3D connected graph constellation with a physical 3D queue shelf at the base.
- **Interactions:**
  - Select different root vertices using the vertex selector.
  - Tap **"Visit Neighbors"**: Discovered nodes slide onto the 3D queue shelf.
  - Tap **"Dequeue"**: Node transitions from the queue to the visited set, pulsing with wave expansion light.

### Algorithm 5: Stack Data Structure
- Switch to **Stack Data Structure**.
- **Visuals:** A transparent acrylic cylindrical container anchored on the plane.
- **Interactions:**
  - Tap **"Push"**: Numbered disc slides into the container from above.
  - Push 5 elements: The container visibly fills up.
  - Attempt a 6th push: System immediately displays `CAPACITY_LIMIT` alert without crashing or visual glitching.
  - Tap **"Pop"**: Top element ejects upwards in true LIFO sequence.

---

## 4. EGEA Adaptive Scaffolding Live Showcase (2 Minutes)

- **Demonstrate Impulsive Guessing Detection (`STEPWISE_SLOWDOWN`):**
  - Click incorrect actions twice in rapid succession (< 1.5 seconds).
  - The system detects rushing, dims inputs briefly, and prompts:
    > *"Impulsive pacing detected. Pausing interaction to prompt deliberate evaluation of invariant rules."*
- **Demonstrate Persistent Impasse Demonstration (`WORKED_EXAMPLE`):**
  - Fail the same step 3 times consecutively.
  - The system triggers an animated 3D worked-example walk-through demonstrating the exact mathematical step.
- **Demonstrate Autonomous Scaffolding Fading (`REDUCE_GUIDANCE`):**
  - Execute 3 correct decisions consecutively without opening hints.
  - Notice pointer calipers and assistive arrows fade out, allowing autonomous learner execution.

---

## 5. Technical Review & Q&A Summary (0.5 Minutes)

- Point examiners to `research-results/egea_evaluation_report.json` and `docs/RESEARCH_EVALUATION_RESULTS.md` for full benchmark metrics.
- Summarize: 16 test suites, 1,355 passing tests, 0 linter errors, and 0 security leaks.
