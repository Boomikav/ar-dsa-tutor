# IEEE AIxVR 2027 — Figure Planning & Visual Layout Specification

**Document Version:** 1.0.0  
**Target Paper:** [`docs/AIxVR_DEMO_PAPER.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_DEMO_PAPER.md) (4 pages, IEEE Double-Column Format)  
**Font Standard:** Helvetica or Times Roman (minimum 8pt for sub-labels in final column width)  
**Column Width:** Single column: $3.5\text{ in}$ ($88.9\text{mm}$); Double column: $7.16\text{ in}$ ($181.8\text{mm}$)  

---

## 1. Figure Inventory & Placement Plan

```
+------------+-------------+------------------------------------+---------------------------------------+
| Figure ID  | Column Span | Figure Title                       | Primary Purpose / Visual Elements     |
+------------+-------------+------------------------------------+---------------------------------------+
| Figure 1   | 1 column    | Unified WebXR Architecture         | Client UI, services layer, WebXR      |
|            | (3.5 in)    | & Session Lifecycle                | session persistence, fallback bridge. |
+------------+-------------+------------------------------------+---------------------------------------+
| Figure 2   | 2 columns   | Five Interactive Spatial           | Visual screenshots/renders of BST,    |
|            | (7.16 in)   | Algorithm Visualizers              | Bubble Sort, Binary Search, BFS, and  |
|            |             |                                    | Stack in augmented 3D environments.   |
+------------+-------------+------------------------------------+---------------------------------------+
| Figure 3   | 1 column    | EGEA Deterministic Adaptation      | Ingestion pipeline, EWMA pacing, step |
|            | (3.5 in)    | Pipeline & Priority Cascade        | canonicalization, 6 intervention tiers|
+------------+-------------+------------------------------------+---------------------------------------+
| Figure 4   | 1 column    | Live Interactive Demonstration     | Flowchart: QR code -> surface detect  |
|            | (3.5 in)    | Procedure & Graceful Fallback      | -> interactive HUD -> fallback path.  |
+------------+-------------+------------------------------------+---------------------------------------+
```

---

## 2. Detailed Specifications

### Figure 1: Unified WebXR Architecture & Session Lifecycle
- **Location:** Section 2 (Top of Page 2, Single Column).
- **Format:** Vector diagram (SVG / PDF export).
- **Components:**
  1. Top Layer: React 18 UI Shell, Touch HUD, and Real-Time Diagnostic HUD.
  2. Middle Layer: `WebXRARService` (managing single `XRSession`, plane hit-testing, and camera pose) and `Canvas3DFallbackService` (`OrbitControls`).
  3. Graphics Layer: Three.js `WebGLRenderer` rendering into persistent `THREE.Group` anchored at surface coordinates.
  4. Engine Layer: Five decoupled deterministic DSA state engines (`BSTEngine`, `BubbleSortEngine`, etc.) executing pure TypeScript algorithms.
- **Key Caption Text:** *"Figure 1: Modular architecture of AR-DSA Tutor. A single continuous WebXR session anchors dynamic Three.js visualizers to horizontal surface coordinates while deterministic DSA engines enforce mathematical invariants independently of rendering."*

---

### Figure 2: Five Interactive Spatial Algorithm Visualizers
- **Location:** Section 3 (Top of Page 3, Full Two-Column Span).
- **Format:** High-resolution composite bitmap ($300\text{ DPI}$) with 5 labeled sub-panels (A through E):
  - **(A) Binary Search Tree:** 3D branched cylinder hierarchy with directional navigation arrows, node values, and dynamic scale adjustments based on depth.
  - **(B) Bubble Sort:** Array cylinders with dynamic 3D comparison brackets and animated parabolic swap arcs.
  - **(C) Binary Search:** Proportional sorted 3D blocks with interactive Low, Mid, and High calipers halving the active interval.
  - **(D) Breadth-First Search:** 3D graph network with visited emissive glows and an external 3D queue shelf holding frontier vertices.
  - **(E) Stack:** Transparent acrylic 3D cylinder anchored upright, showing LIFO push/pop animations and physical capacity limit indicator ($5$).
- **Key Caption Text:** *"Figure 2: The five spatial algorithm visualizers implemented in AR-DSA Tutor: (A) Binary Search Tree with branch depth scaling; (B) Bubble Sort with comparison brackets and swap arcs; (C) Binary Search with interval calipers; (D) BFS graph with external queue shelf; and (E) Stack with acrylic boundary constraints."*

---

### Figure 3: EGEA Deterministic Adaptation Pipeline & Priority Cascade
- **Location:** Section 4 (Page 3 or Page 4, Single Column).
- **Format:** Vector flowchart (SVG / PDF export).
- **Components:**
  1. Interaction Input: Raw learner tap event on touch HUD.
  2. Telemetry Processing: `EGEAEventAdapter` attaches monotonic sequence number, computes inter-action latency $\Delta t$, runs $250\text{ms}$ debounce filter, and canonicalizes step identifiers.
  3. Mathematical Pacing: `EGEAPacingModel` computes smoothed EWMA ($\alpha = 0.5$) with $1800\text{ms}$ boundary threshold.
  4. Priority Decision Cascade: Deterministic evaluation branching:
     - Streak $\ge 3$ (autonomous) $\to$ `REDUCE_GUIDANCE`
     - Correct with active hint $\to$ `CONTEXTUAL_HINT` (`HINT_ASSISTED_PROGRESSION`)
     - Consecutive fast errors $\le 1800\text{ms}$ $\to$ `STEPWISE_SLOWDOWN`
     - Persistent 3x error on canonical step $\to$ `WORKED_EXAMPLE`
     - Failure rate $\ge 60\%$ $\to$ `PREREQUISITE_REVIEW`
     - Spatial traversal error $\to$ `HIGHLIGHT_ELEMENT`
     - Isolated slip $\to$ `CONTEXTUAL_HINT`
- **Key Caption Text:** *"Figure 3: Execution-Grounded Explainable Adaptation (EGEA) decision pipeline. Telemetry is canonicalized and smoothed via EWMA before entering a deterministic priority cascade that emits explainable pedagogical interventions in under $10\mu\text{s}$."*

---

### Figure 4: Live Demonstration Procedure & Graceful Fallback
- **Location:** Section 6 (Page 4, Single Column).
- **Format:** Two-track decision flowchart.
- **Components:**
  - Start: Attendee scans QR code on mobile handset.
  - Detection Node: WebXR `immersive-ar` capability check.
  - Track A (WebXR Supported): Camera feed opens $\to$ Surface reticle detects floor plane $\to$ Tap anchors 3D data structure in room $\to$ Touch HUD controls spatial algorithm steps.
  - Track B (Fallback / Non-XR): Interactive 3D WebGL Canvas opens with touch `OrbitControls` $\to$ Identical DSA state transitions and EGEA adaptive guidance.
  - Intervention Triggers: Rapid double-taps illustrate jitter filtering; rapid guessing triggers slowdown; 3x failure triggers 3D worked example.
- **Key Caption Text:** *"Figure 4: Attendee interaction workflow during live conference demonstration, illustrating automatic device capability routing and graceful degradation to interactive Canvas 3D mode if optical SLAM tracking is disrupted."*

---

## 3. Production Guidelines & Compliance Notes

1. **Resolution & Scaling:** All composite screenshots must be captured at $2\times$ device pixel ratio (minimum $1920\text{px}$ width) and exported at $300\text{ DPI}$.
2. **Color Blindness Accessibility:** Highlights must use high-contrast color palettes (e.g., cyan/yellow for selection, magenta/amber for comparison brackets) distinguishable under deuteranopia and protanopia.
3. **No Fabricated Real-Device Imagery:** If physical Android camera passthrough screenshots are unavailable, illustrations must be captured directly from Chrome DevTools WebXR simulation or Canvas 3D Fallback, with transparent labeling.
4. **Copyright & Asset Licensing:** All 3D meshes (cylinders, blocks, spheres, calipers) are generated procedurally via Three.js primitives (`THREE.CylinderGeometry`, `THREE.BoxGeometry`). No third-party copyrighted 3D models or textures are utilized.
