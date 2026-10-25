# AR-DSA Tutor: A Zero-Install Mobile WebXR System with Execution-Grounded Explainable Adaptation for Spatial Algorithm Learning

**Authors:** AR-DSA Research & Systems Engineering Group  
**Target Venue:** IEEE AIxVR 2027 (9th IEEE International Conference on Artificial Intelligence and eXtended and Virtual Reality)  
**Track:** Demos & Videos Track (Max 4 pages excluding references)  
**Publication Format:** Standard IEEE Two-Column Format (US Letter)  

---

### Abstract

Abstract Data Structures and Algorithms (DSA) instruction often suffers from a split-attention effect between flattened 2D diagrammatic animations and dynamic multi-dimensional memory representations. While Augmented Reality (AR) provides immersive 3D spatial affordances, existing educational AR tools either require proprietary native applications ($> 100\text{MB}$ downloads), isolate individual topics into fragmented camera sessions, or rely on non-deterministic generative language models that introduce high network latency ($> 1.5\text{s}$) and mathematical hallucinations. We demonstrate **AR-DSA Tutor**, an open-source mobile WebXR framework that delivers five interactive spatial algorithm visualizers—Binary Search Tree, Bubble Sort, Binary Search, Breadth-First Search, and Stack—inside a single continuous mobile browser session on Android Chrome using the W3C WebXR Device API. To scaffold learner interactions without hallucinations, we implement **Execution-Grounded Explainable Adaptation (EGEA)**: a deterministic, history-aware policy engine that maps validated interaction telemetry and inter-action latency ($\Delta t$) to a 6-tier pedagogical intervention taxonomy. Benchmarking demonstrates that EGEA evaluates decisions in steady-state mean time of **$0.006\text{ms}$** ($6\ \mu\text{s}$) on desktop x86_64, operating over $2,000\times$ faster than the $16.6\text{ms}$ frame budget for 60 FPS rendering and guaranteeing zero JavaScript thread blocking. In an independent 18-case engineering challenge suite and a targeted 12-case boundary stress suite, EGEA achieves 100.0% specification consistency across temporal pacing, touch-jitter filtering, and step canonicalization, outperforming a matched-history baseline (75.0%). We demonstrate live interactive algorithm execution, real-time adaptation, and automated 3D canvas fallback for non-AR environments.

---

## 1. Motivation & Educational Problem

Understanding foundational Data Structures and Algorithms (DSA) requires internalizing abstract invariants that govern dynamic memory relationships: hierarchical branch balancing, sorted interval halving, graph wavefront propagation, and LIFO push/pop discipline. In conventional computing curricula, students interact with these structures through static textbook figures or 2D canvas animations (e.g., OpenDSA [5], ViLLE [13], VisuAlgo [15]). However, planar screens flatten multi-pointer relationships, forcing learners to mentally reconstruct spatial models—theoretically inducing extraneous cognitive load according to Cognitive Load Theory [3, 14].

Augmented Reality (AR) provides a compelling visual medium by anchoring three-dimensional, manipulable data structures directly into the learner's physical environment [2, 6, 18]. Despite this potential, practical classroom deployment of educational AR has been constrained by three systemic bottlenecks:
1. **Session Fragmentation:** Most educational AR systems launch separate native applications for individual topics, requiring frequent session teardowns, camera re-initialization, and surface re-scanning that disrupt learning flow.
2. **Installation Friction:** Native mobile AR applications (built with Unity or Unreal Engine) demand app-store distribution, large download sizes ($> 150\text{MB}$), and platform-specific permissions.
3. **Scaffolding Fragility:** When integrating intelligent feedback, existing systems often choose between **stateless error-lookup heuristics** that ignore learner pacing and repeated impasses, or **generative Large Language Models (LLMs)** that introduce high network latency ($1.5$–$3.0\text{s}$), subscription dependencies, and the risk of hallucinating mathematically false algorithm states [4].

To address these challenges, we present **AR-DSA Tutor**, an open-source zero-install mobile WebXR learning application coupled with **Execution-Grounded Explainable Adaptation (EGEA)**. We emphasize that this demonstration presents a systems and architectural contribution; empirical evaluation of human student learning gains ($g$) and cognitive load reduction is reserved for future IRB-approved classroom trials.

---

## 2. System Architecture & Continuous WebXR Session

AR-DSA Tutor is architected as a lightweight Progressive Web Application (PWA) operating directly in mobile Google Chrome via the W3C WebXR Device API [1].

```
+---------------------------------------------------------------------------------+
|                              Client Web Application                             |
+---------------------------------------------------------------------------------+
|  React 18 UI Shell  |  Interactive Touch HUD  |  Real-Time Diagnostic Overlay   |
+---------------------+-------------------------+---------------------------------+
|                                 Services Layer                                  |
|  - WebXRARService: Manages XRSession, plane hit-testing, reference transforms   |
|  - Canvas3DFallbackService: OrbitControls touch manipulation for non-XR devices |
|  - EGEAEventAdapter: Monotonic telemetry ingestion, latency, and debouncing     |
|  - EGEAPolicyEngine: Deterministic pedagogical rule cascade and EWMA pacing     |
+---------------------------------------------------------------------------------+
|                             3D Scene & Visualization                            |
|  Three.js WebGLRenderer | Upright Anchor Group | Shared Coordinate Space         |
+---------------------------------------------------------------------------------+
|                        Deterministic DSA State Engines                          |
|  BSTEngine | BubbleSortEngine | BinarySearchEngine | BFSEngine | StackEngine    |
+---------------------------------------------------------------------------------+
```

### 2.1 Persistent Session Lifecycle & Transform Stability
In conventional WebXR applications, switching topics often forces a complete teardown of the `XRSession`, destroying the underlying AR tracking space. AR-DSA Tutor resolves this by maintaining a **single persistent `XRSession`**:
- When the user switches between algorithms in the curriculum, the underlying camera feed, detected horizontal plane, and `XRReferenceSpace` are preserved.
- The active algorithm visualization is swapped within a shared `THREE.Group` anchored at the user's selected placement coordinates.
- Spatial orientation invariants are strictly maintained: visualizers enforce an upright orientation ($+Y$ aligned with real-world gravity) with an initial offset of $-1.2\text{m}$ along the camera's line of sight ($+Z$).

### 2.2 Graceful Canvas 3D Fallback
For environments where WebXR `immersive-ar` is unsupported (e.g., desktop browsers, iOS devices without WebXR flags, or devices lacking Google Play Services for AR), the system automatically degrades to `CANVAS_3D_FALLBACK`. The identical Three.js visualization is rendered within an interactive WebGL canvas equipped with touch orbit controls, ensuring universal accessibility without code duplication.

---

## 3. Five Interactive Spatial Algorithm Visualizers

All five algorithm modules execute on top of deterministic TypeScript state engines that enforce mathematical correctness independently of rendering:

```
+-----------------------------------------------------------------------------------+
| Visualizer          Spatial Representation           Key Interactive Operations    |
+-----------------------------------------------------------------------------------+
| Binary Search Tree  3D branched cylinder hierarchy  Insert, search, traverse left/ |
|                     with directional arrows         right, inspect node values    |
| Bubble Sort         Array cylinders with comparison  Compare pairs, swap arcs,     |
|                     brackets and swap arcs          step forward, auto-play       |
| Binary Search       Sorted array blocks with Low,   Adjust calipers, halve search |
|                     Mid, High spatial calipers      range, test target hit/miss   |
| Breadth-First       3D graph network with visited   Select start, expand wavefront|
| Search (BFS)        glow and external 3D queue shelf queue neighbors, check cycle  |
| Stack               Clear acrylic 3D cylinder       Push element, pop element,     |
|                     enforcing physical LIFO bounds  peek top, capacity boundary 5 |
+-----------------------------------------------------------------------------------+
```

1. **Binary Search Tree (BST):** Renders dynamic 3D tree nodes with branch lines that dynamically rescale based on tree depth ($S = \max(0.4, 1.0 - 0.12 \cdot d)$). Directional arrows guide branch traversal during search and insertion.
2. **Bubble Sort:** Represents array elements as proportional vertical cylinders. Dynamic 3D brackets highlight the active comparison pair, with parabolic arc animations executing spatial swaps.
3. **Binary Search:** Displays a sorted sequence of 3D blocks. Interactive physical calipers mark `Low`, `Mid`, and `High` indices, visually slicing the discarded search interval in half at each iteration.
4. **Breadth-First Search (BFS):** Visualizes a connected 3D graph alongside an external physical "queue shelf" in the augmented scene. As nodes are traversed, emissive glow highlights visited states while unexplored neighbors are placed onto the queue shelf.
5. **Stack:** Renders a transparent acrylic cylinder anchored to the surface. Elements enter from the top with physical drop animations, visually enforcing strict LIFO discipline and tactile overflow/underflow warnings at a capacity limit of 5.

---

## 4. Execution-Grounded Explainable Adaptation (EGEA)

To provide intelligent scaffolding without the latency ($> 1.5\text{s}$) or hallucination risks of generative LLMs [4], we introduce **Execution-Grounded Explainable Adaptation (EGEA)**:

```
                  +-----------------------------------+
                  |   Learner Mobile XR Interaction   |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |         EGEAEventAdapter          |
                  |  - Sequence numbering (monotonic) |
                  |  - Inter-action latency (Δt)      |
                  |  - 250ms touch jitter debounce    |
                  |  - Step canonicalization          |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |        EGEAPolicyEngine           |
                  |    Priority Decision Cascade      |
                  +-----------------------------------+
                    /        |          |         \
                   /         |          |          \
                  v          v          v           v
            [Slowdown]  [Worked Ex]  [Prereq]   [Highlight]
              (EWMA)     (3x Step)   (>= 60%)    (Spatial)
```

### 4.1 Telemetry Schema & Mathematical Pacing Model
Interaction telemetry is structured as validated `EGEAInteractionEvent` records capturing event sequence $k$, timestamp $\tau_k$, inter-action latency $\Delta t_k$, correctness indicator $c_k \in \{0, 1\}$, and error category $\kappa_k$.

To mitigate impulsive trial-and-error guessing without brittle threshold artifacts, EGEA computes an **Exponentially Weighted Moving Average (EWMA)** of error latencies with smoothing factor $\alpha = 0.5$:
$$\bar{L}_t = \alpha \cdot \Delta t_k + (1 - \alpha) \cdot \bar{L}_{t-1}$$
- **Fast Guessing Zone ($\le 1800\text{ms}$):** If the learner commits consecutive errors with smoothed latency within the boundary zone ($\le 1800\text{ms}$), EGEA triggers `STEPWISE_SLOWDOWN`, temporarily dimming controls with a 3-second reflection prompt.
- **Deliberate Reflection Protection ($\ge 2500\text{ms}$):** If the learner pauses deliberately before an error, slowdown is strictly suppressed, preserving instructional flow.
- **Touch Jitter Floor ($< 250\text{ms}$):** Consecutive identical taps on the same control occurring in $< 250\text{ms}$ are classified as capacitive screen bounce rather than cognitive errors, preventing false slowdowns.

### 4.2 Centralized Step Canonicalization
To prevent dynamic retry strings (e.g., `node-42-try-1` vs `node-42-try-2`) or directional abbreviations (`_L` vs `_LEFT`) from fragmenting failure histories, a centralized canonicalizer maps variant step strings to stable anchors while strictly preserving distinct subproblems (`step-1` vs `step-2`).

### 4.3 Pedagogical Priority Cascade
EGEA evaluates interaction histories through a deterministic priority cascade grounded in Cognitive Load Theory [3] and Scaffolding Fading [8]:
1. **Mastery Streak ($\ge 3$ correct without hints):** Emits `REDUCE_GUIDANCE`, fading visual scaffolding to support autonomous recall.
2. **Hint-Assisted Progression:** If a correct move was achieved with active hint guidance, emits `CONTEXTUAL_HINT` (`HINT_ASSISTED_PROGRESSION`) and suspends mastery streak progression until independent recall is shown.
3. **Rapid Guessing:** Emits `STEPWISE_SLOWDOWN` via EWMA pacing analysis.
4. **Persistent Step Impasse ($\ge 3$ failures on identical canonical step):** Emits `WORKED_EXAMPLE`, triggering an interactive 3D demonstration of the step.
5. **Systemic Breakdown ($\ge 4$ failures and $\ge 60\%$ failure rate):** Emits `PREREQUISITE_REVIEW`.
6. **Spatial Traversal Lapse:** Emits `HIGHLIGHT_ELEMENT`, pulsing target 3D nodes.
7. **Isolated Conceptual Slip:** Emits `CONTEXTUAL_HINT`.

---

## 5. Technical Verification & Benchmark Results

The system was verified through automated test suites and synthetic behavioral benchmarks:

```
+-----------------------------------------------------------------------------------+
| Metric / Verification Suite              Result Summary                           |
+-----------------------------------------------------------------------------------+
| TypeScript & Linter Compliance           0 errors, 0 strict type violations       |
| Total Automated Test Suites              17 suites, 1,403 assertions passing      |
| Engineering Challenge Suite (N = 18)     EGEA: 100.0% | Matched-History: 83.3%     |
| Targeted Boundary Stress Suite (N = 12)  EGEA: 100.0% | Matched-History: 75.0%     |
| Steady-State Decision Latency (x86_64)   Mean: 0.006ms | P95: 0.009ms | Max: 0.073ms|
| Production Client Bundle Size            1,217 kB (Vite production build)         |
| Security & Credential Audit              0 leaked tokens, 0 forbidden terms       |
| Physical Mobile Hardware Testing         STATUS: NOT RUN (Simulated harness only) |
+-----------------------------------------------------------------------------------+
```

### 5.1 Latency Benchmarking
Microbenchmarking across $N = 1,000$ decisions on desktop x86_64 demonstrates a steady-state mean decision time of **$0.006\text{ms}$** ($6\ \mu\text{s}$) with $P_{95}$ of $0.009\text{ms}$. This confirms that EGEA operates over $2,000\times$ faster than the $16.6\text{ms}$ frame budget for 60 FPS rendering, guaranteeing that pedagogical evaluation does not block the JavaScript animation thread. We note that end-to-end mobile frame rates are governed by mobile GPU fill rates and Three.js draw calls rather than decision latency alone.

### 5.2 Synthetic Benchmark Comparison
Two synthetic benchmark suites were evaluated against baseline systems:
- **Fixed Hint Baseline:** Emits static hint text on errors; lacks pacing and persistence awareness.
- **Simple Error Rule Baseline:** Stateless category-lookup mapping immediate errors to hints.
- **Matched-History Baseline:** Tracks historical events and instantaneous latencies but lacks EWMA smoothing, jitter filtering, and step canonicalization.

```
+-----------------------------------------------------------------------------------+
| System Evaluated              Engineering Suite (N=18)    Boundary Suite (N=12)   |
|                               Accuracy    Macro-F1 (Harm) Accuracy    Macro-F1    |
+-----------------------------------------------------------------------------------+
| Fixed Hint Baseline           33.3%       0.250           58.3%       0.280       |
| Simple Error Rule Baseline    50.0%       0.403           75.0%       0.462       |
| Matched-History Baseline      83.3%       0.810           75.0%       0.597       |
| EGEA Policy Engine            100.0%      1.000           100.0%      1.000       |
+-----------------------------------------------------------------------------------+
```

*Methodological Scope:* The 18-case engineering suite evaluates balanced canonical interaction patterns. The 12-case boundary stress suite was authored alongside Phase 2 hardening to verify the behavioral boundaries of the EWMA model ($1750\text{ms}$), touch jitter filter ($140\text{ms}$), and step canonicalizer (`STACK_PUSH_OP`). While EGEA achieves 100.0% consistency on these synthetic scenarios by design, this confirms internal algorithmic correctness rather than empirical pedagogical superiority over human populations.

---

## 6. Demonstration Procedure & Fallback Plan

During the live conference demonstration, attendees interact with AR-DSA Tutor using mobile devices:

```
                      +-----------------------------------+
                      |   Attendee Scans QR Code on Phone |
                      +-----------------------------------+
                                        |
                         [WebXR Supported by Device?]
                               /                 \
                             YES                  NO
                             /                      \
                            v                        v
            +-------------------------------+  +-------------------------------+
            |  Immersive Mobile WebXR Mode  |  |   Interactive Canvas 3D Mode  |
            |  - Camera passthrough active  |  |  - Full touch OrbitControls   |
            |  - Floor plane surface detect |  |  - Pinch-to-zoom & rotation   |
            |  - Spatial structure anchored |  |  - Identical DSA engines      |
            +-------------------------------+  +-------------------------------+
                            \                        /
                             \                      /
                              v                    v
                      +-----------------------------------+
                      |    Execute Algorithm Operations   |
                      |    via Touch HUD Controls         |
                      +-----------------------------------+
                                        |
                      +-----------------------------------+
                      |     Trigger Adaptation Regimes    |
                      |  - Rapid clicking -> Slowdown     |
                      |  - 3x Error on node -> Worked Ex  |
                      |  - 3x Correct -> Scaffolds Fade   |
                      +-----------------------------------+
```

1. **Attendee Walk-Up:** The attendee opens Chrome on an Android smartphone and navigates to the web application.
2. **Surface Placement:** The attendee points the camera at the floor, observes the reticle tracking plane, and taps to anchor the 3D data structure.
3. **Interactive Manipulation:** The attendee traverses a BST, steps through Bubble Sort swaps, adjusts Binary Search calipers, or pushes elements into the 3D acrylic Stack.
4. **Live Adaptation Triggering:** Demonstrators illustrate EGEA regimes:
   - Rapidly double-tapping buttons triggers the touch debounce without false slowdown.
   - Rapidly guessing wrong choices triggers the `STEPWISE_SLOWDOWN` reflection modal.
   - Repeatedly failing on the same node triggers a 3D animated `WORKED_EXAMPLE`.
   - Executing 3 unassisted correct moves triggers `REDUCE_GUIDANCE`, fading visual calipers.
5. **Conference Connectivity Fallback:** If conference indoor lighting degrades optical SLAM, attendees seamlessly switch to `CANVAS_3D_FALLBACK` with touch orbit controls, experiencing identical algorithm logic.

---

## 7. Limitations & Future Roadmap

1. **Physical Device Validation Boundary:** Automated testing relies on Three.js and WebXR mock harnesses. Optical SLAM drift, thermal throttling, and camera exposure variances across commercial Android handsets remain to be quantified on physical hardware.
2. **Empirical Learning Evaluation:** The system establishes architectural and algorithmic feasibility. Evaluating whether spatial WebXR visualization and EGEA produce statistically significant learning gains ($g$) or reduced cognitive load requires future IRB-approved human classroom trials.
3. **Offline Service Worker Caching:** While the web manifest is configured, offline caching requires final service worker registration.

---

### Acknowledgments & Generative AI Disclosure
In compliance with IEEE publication policies on generative artificial intelligence (IEEE PSPB Operations Manual Section 8.2.1.B.10), the authors disclose that an AI programming assistant (Google Antigravity / Gemini) was utilized during system development and manuscript drafting for code optimization, LaTeX formatting, and editorial language refinement. All architectural designs, deterministic state engines, benchmark scripts, recomputed metrics, and technical conclusions were conceived, executed, verified, and audited under the direct responsibility of the human authors.

---

## References

- [1] W3C. (2022). *WebXR Device API*. W3C Recommendation. Available: `https://www.w3.org/TR/webxr/`
- [2] Billinghurst, M., Kato, H., & Poupyrev, I. (2001). The MagicBook: Moving seamlessly between reality and virtuality. *IEEE Computer Graphics and Applications*, 21(3), 6–8. DOI: `10.1109/38.920626`
- [3] Sweller, J. (2011). Cognitive load theory. *Psychology of Learning and Motivation*, 55, 37–76. DOI: `10.1016/B978-0-12-387690-4.00002-8`
- [4] Denny, P., Kumar, V., & Giacaman, N. (2023). Conversing with Copilot: Exploring prompt engineering for solving CS1 problems. In *Proc. 54th ACM Technical Symposium on Computer Science Education (SIGCSE)* (pp. 592–598). DOI: `10.1145/3545945.3569759`
- [5] Fouh, E., Akbar, M., & Shaffer, C. A. (2012). The OpenDSA system for algorithm visualization. *ACM Inroads*, 3(3), 61–66. DOI: `10.1145/2339055.2339076`
- [6] Fleck, S., & Simon, G. (2013). An augmented reality environment for elementary astronomy education. In *Proc. 25th Conf. l'Interaction Homme-Machine (IHM)* (pp. 14–22). DOI: `10.1145/2534903.2534907`
- [7] Kumar, A. N. (2005). Generation of problems, answers, grade, and tutoring in Problets. *ACM SIGCSE Bulletin*, 37(1), 406–410. DOI: `10.1145/1047344.1047424`
- [8] Koedinger, K. R., Corbett, A. T., & Perfetti, C. (2012). The Knowledge-Learning-Instruction (KLI) framework: Bridging the gap between learning theory and cognitive tutoring. *Cognitive Science*, 36(5), 757–798. DOI: `10.1111/cogs.12017`
- [9] Milgram, P., & Kishino, F. (1994). A taxonomy of mixed reality visual displays. *IEICE Transactions on Information and Systems*, 77(12), 1321–1329.
- [10] Sorva, J., Karavirta, V., & Malmi, L. (2013). A review of generic program visualization systems for introductory programming education. *ACM Transactions on Computing Education (TOCE)*, 13(4), 1–64. DOI: `10.1145/2490822`
- [11] Mayer, R. E. (2002). Multimedia learning. *Psychology of Learning and Motivation*, 41, 85–139. DOI: `10.1016/S0079-7421(02)80005-6`
- [12] Halim, S., Koh, Z. Q., Loh, V. B. H., & Halim, F. (2012). Learning algorithms with VisuAlgo - A mobile-first approach. *Olympiads in Informatics*, 6, 35–45.
- [13] Hundhausen, C. D., Douglas, S. A., & Stasko, J. T. (2002). A meta-study of algorithm visualization effectiveness. *Journal of Visual Languages & Computing*, 13(3), 259–290. DOI: `10.1006/jvlc.2002.0237`
- [14] Naps, T. L., Rößling, G., Almstrum, V., et al. (2002). Exploring the role of visualization and engagement in computer science education. *ACM SIGCSE Bulletin*, 35(2), 131–152. DOI: `10.1145/782941.782998`
- [15] Radu, I. (2014). Augmented reality in education: A meta-review and cross-media analysis. *Personal and Ubiquitous Computing*, 18(6), 1533–1543. DOI: `10.1007/s00779-013-0747-y`
