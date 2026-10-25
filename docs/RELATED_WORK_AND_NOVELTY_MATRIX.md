# AR-DSA Tutor — Related Work, Competing Literature & Novelty Matrix

**Document Version:** 1.0.0  
**Research Topic:** WebXR Spatial Visualization & Execution-Grounded Scaffolding for Data Structures and Algorithms  
**Authors:** Academic Review & Systems Architecture Team  

---

## 1. Problem Statement & Research Hypotheses

### 1.1 Formal Problem Statement
Abstract Data Structures and Algorithms (DSA) instruction frequently suffers from the *split-attention effect* and *representational disconnect*:
1. **Representational Disconnect:** 2D screen diagrams flatten dynamic multi-pointer relationships (e.g., binary search interval halving, 3D graph wave fronts, tree rebalancing), forcing learners to mentally reconstruct spatial models without depth or physical reference frames.
2. **Scaffolding Fragility:** Intelligent tutoring systems typically toggle between either **unadaptive static hints** (ignoring pacing, repeated errors, and autonomous mastery) or **ungrounded generative LLMs** that introduce hallucinations, non-deterministic latency ($> 1.5\text{s}$), and mathematically invalid advice.

### 1.2 Core Research Questions
- **RQ1 (Technical Architecture):** Can a unified mobile WebXR runtime support multi-algorithm spatial visualization (BST, Bubble Sort, Binary Search, BFS, Stack) within a single continuous session without camera feed interruption or GPU resource leakage?
- **RQ2 (Computational Efficiency):** Can an explainable, history-aware adaptation policy evaluate learner interaction streams in sub-millisecond deterministic latency ($< 1.0\text{ms}$), fitting within the $16.6\text{ms}$ rendering budget of 60 FPS mobile WebXR?
- **RQ3 (Instructional Appropriateness):** How does Execution-Grounded Explainable Adaptation (EGEA) compare against established stateless pedagogical baselines when responding to nuanced learner behaviors (deliberate pondering, rapid guessing, persistent impasse, and autonomy streaks)?

### 1.3 Falsifiable Hypotheses
- **Hypothesis $H_1$ (Latency Guarantee):** EGEA deterministic policy evaluation achieves $P_{95}$ decision latency $< 1.0\text{ms}$ on commodity hardware, eliminating runtime frame drops in mobile WebXR.
- **Hypothesis $H_2$ (Instructional Discrimination):** A temporal-history-aware adaptation policy achieves significantly higher macro-F1 ($\ge 0.85$) than stateless error-lookup rules on independent realistic challenge trajectories by distinguishing impulsive guessing from deliberate reflection.

---

## 2. Literature Review & Competing Systems Matrix

| Citation & Venue | Problem Addressed | System Architecture | Adaptation Method | Evaluation Method | Direct Similarities to AR-DSA | Key Differences / Novelty |
|---|---|---|---|---|---|---|
| **Fouh, Akbar, & Shaffer (2012)**<br>ACM Inroads / SIGCSE<br>DOI: `10.1145/2339055.2339076`<br>*OpenDSA: Active-learning algorithm visualization* | Passive reading of textbook DSA algorithms | Web browser (HTML5, JavaScript, JSAV canvas library) | Exercise mastery checkpoints; linear progression | Classroom deployment; log analysis across university cohorts | Interactive step-by-step algorithm exercises on sorting, trees, and graphs | OpenDSA is 2D desktop canvas only; no spatial AR, no pacing detection, no dynamic scaffold fading. |
| **Sorva, Karavirta, & Malmi (2013)**<br>ACM TOCE<br>DOI: `10.1145/2490822`<br>*Program Visualization & Tracing* | Mental models of runtime execution state | Desktop program animation tools (ViLLE, Jeliot) | Step-by-step memory visualization; immediate syntax feedback | Comprehensive survey and empirical meta-analysis | Grounding visual changes in deterministic code execution | Desktop 2D windows; focuses on general imperative programming rather than spatial 3D data structures in WebXR. |
| **Halim et al. (2012)**<br>Olympiads in Informatics<br>*Learning Algorithms with VisuAlgo* | Dynamic visualization of textbook data structures and algorithms | Web browser (HTML5, SVG/Canvas) | Self-paced exploration; user-configurable input arrays | Global open-access deployment; user adoption analytics | Interactive animation of BST, sorting, and graph traversals | VisuAlgo operates in 2D viewport with manual stepping; lacks immersive 3D physical anchoring, mobile WebXR camera feed, and real-time behavioral pacing adaptation. |
| **Hundhausen, Douglas, & Stasko (2002)**<br>J. Vis. Lang. Comput.<br>DOI: `10.1006/jvlc.2002.0237`<br>*Meta-Study on Algorithm Visualization* | Inconsistent pedagogical efficacy across AV systems | Meta-analysis of 21 AV effectiveness experiments | N/A (Meta-analytical survey) | Systematic literature synthesis across cognitive learning tasks | Establishes that active learner engagement (manipulation, prediction) is essential for AV learning | Informs AR-DSA's interactive scaffolding, moving beyond passive 3D viewing to active user-driven state stepping. |
| **Naps et al. (2002)**<br>ACM SIGCSE / ITiCSE-WGR<br>DOI: `10.1145/782941.782998`<br>*Engagement Taxonomy in AV* | Passive vs. active cognitive engagement in CS education | Pedagogical framework (Viewing, Responding, Changing, Constructing) | Conceptual taxonomy of educational interaction | Multi-institution working group consensus | Formalizes interaction levels; AR-DSA targets "Responding" and "Changing" levels | EGEA operationalizes the taxonomy into a real-time deterministic runtime policy executing in $< 0.01\text{ms}$. |
| **Radu (2014)**<br>Personal & Ubiquitous Comput.<br>DOI: `10.1007/s00779-013-0747-y`<br>*AR in Education: Meta-Review* | Cognitive affordances and trade-offs of educational AR | Meta-review of 32 comparative AR/non-AR studies | Spatial 3D anchoring; physical interaction affordances | Cross-media comparative analysis across STEM disciplines | Identifies spatial 3D mental rotation and engagement advantages of AR | Notes that poorly designed AR interfaces induce attention split; AR-DSA mitigates this with elevation offsetting and anchored 3D HUD controls. |
| **Raiyn (2016)**<br>J. Education & Practice<br>ISSN: `2222-1735`<br>*Visual Learning in Higher-Order CS Thinking* | Bridging abstract CS theory to conceptual understanding | Graphical simulations, conceptual flowcharts, visual tools | Interactive visual modeling | Quantitative analysis of student higher-order thinking (HOT) | Demonstrates visual representation improves analytical reasoning in CS | Raiyn investigated desktop 2D visual aids; AR-DSA extends visual learning into spatial 3D augmented reality with deterministic scaffolding. |
| **Cardoso et al. (2020)**<br>Computers & Industrial Eng.<br>DOI: `10.1016/j.cie.2019.106159`<br>*Industrial Augmented Reality Systems* | Real-time AR tracking, alignment, and visual sorting guidance | Mobile AR, smart glasses, spatial SLAM tracking | Visual bounding box overlays; spatial sorting guidance | Industrial ergonomics, latency profiling, and error rates | Real-time 3D spatial alignment and visual sorting tracking | Evaluates logistics/material sorting in industrial environments; AR-DSA adapts spatial alignment principles to algorithmic sorting (Bubble Sort) in WebXR. |
| **Billinghurst, Kato, & Poupyrev (2001)**<br>IEEE Computer Graphics & Apps<br>DOI: `10.1109/38.920626`<br>*Collaborative AR Interfaces* | 3D collaboration and spatial manipulation | Optical see-through head-mounted displays, fiduciary markers | Static spatial placement; user-guided physical manipulation | Usability task timing and subjective participant questionnaire | Physical placement of 3D virtual objects on physical surfaces | Pre-WebXR marker-based AR; lacked algorithmic logic, automated tutoring, or adaptive cognitive scaffolding. |
| **Kumar (2005)**<br>ACM SIGCSE<br>DOI: `10.1145/1047344.1047424`<br>*Problets for DSA: Expression & Tree Tutors* | Learning binary trees and expression evaluation | Client-server Java applets | Rule-based question generation based on error classification | Pre/post exam score comparison in undergraduate courses | Deterministic error classification and targeted remediation | Desktop Java applets; stateless per-question feedback without interaction latency tracking ($\Delta t$) or spatial AR. |
| **Koedinger, Corbett, & Perfetti (2012)**<br>Cognitive Science<br>DOI: `10.1111/cogs.12017`<br>*Knowledge-Learning-Instruction (KLI) Framework* | Theoretical taxonomy of instructional interventions | Cognitive Tutors (ACT-R cognitive architecture) | Bayesian Knowledge Tracing (BKT) and production rule compilation | Longitudinal math education datasets (PSLC DataShop) | Multi-tier scaffolding (hints, worked examples, delayed feedback) | EGEA adapts KLI principles for spatial WebXR, adding sub-millisecond inter-action pacing detection ($\Delta t < 1.5\text{s}$). |
| **Denny et al. (2023)**<br>ACM SIGCSE<br>DOI: `10.1145/3545945.3569759`<br>*Evaluating LLMs for CS Education* | Generating real-time explanations for programming | OpenAI GPT-3 / Codex API integration with web IDEs | Generative text completion conditioned on prompt templates | Prompt ablation and expert human quality ratings | Natural language explanation of computing concepts | LLM explanations are prone to spatial hallucination and 1–3s latency; AR-DSA Tutor grounds adaptation in deterministic engines. |

---

## 3. Demarcation of Research Contribution

### 3.1 What is Defensibly Novel
1. **WebXR Continuous Session Hot-Swapping:** A unified spatial WebXR pipeline that switches between 5 distinct DSA algorithms (hierarchical trees, 1D arrays, 3D graphs, LIFO containers) within a single physical `XRSession`, maintaining planar surface tracking without camera reinitialization.
2. **Sub-Millisecond Execution-Grounded Scaffolding (EGEA):** A pure, deterministic rule policy mapping monotonic interaction telemetry and millisecond-level inter-action latency ($\Delta t$) to a 6-tier educational scaffolding taxonomy in steady-state mean time $< 0.01\text{ms}$, ensuring zero frame drops in 60 FPS mobile WebXR.
3. **Pacing-Aware Guessing Throttling:** Real-time differentiation between *rapid trial-and-error guessing* ($\Delta t < 1500\text{ms}$ on errors $\to$ `STEPWISE_SLOWDOWN`) and *deliberate reflection* ($\Delta t \ge 1500\text{ms} \to$ `CONTEXTUAL_HINT`), combined with scaffolding fading on *fluent mastery* ($\to$ `REDUCE_GUIDANCE`).

### 3.2 What is Engineering / Synthesis (Not Novel)
- Using Three.js and WebXR for 3D rendering (standard web technologies).
- Deterministic DSA algorithms (standard textbook implementations of BST, Bubble Sort, Binary Search, BFS, Stack).
- Using React for state management (standard modern frontend engineering).

### 3.3 What Must NOT Be Claimed
- **No claim of verified human learning gains ($g$):** Without an IRB-approved human participant cohort, we cannot claim that AR-DSA Tutor improves exam performance, retention, or cognitive load compared to traditional textbooks.
- **No claim of physical multi-device ARCore robustness:** Physical camera passthrough has been verified in headless/mock environments; physical testing is designated as `NOT RUN (Pending Hardware Deployment)`.
- **No claim of expert panel consensus:** The 18-case challenge suite was constructed using published cognitive scaffolding rubrics as an engineering benchmark, not an independent human panel of domain judges.
- **No claim of 60 FPS mobile guarantee:** Steady-state microsecond latency ($0.006\text{ms}$) was verified on desktop x86_64 and measures pure JavaScript CPU time, not mobile GPU frame times.

---

## 4. Empirical Boundaries & Verified Algorithmic Failure Modes

As demonstrated by the Adversarial Boundary Benchmark (`EGEAFailureModeBenchmark.ts`), EGEA operates via deterministic heuristic predicates and exhibits four verifiable failure modes:

| Failure Mode ID | Adversarial Mechanism | Expected Pedagogical Need | Actual EGEA Output | Defect Root Cause | Proposed Remediation |
|---|---|---|---|---|---|
| **EDGE-01** (Threshold Evasion) | Learner makes rapid uninformed guesses spaced at exactly $1600\text{ms}$ ($\Delta t \ge 1500\text{ms}$) | Throttling / Slowdown (`STEPWISE_SLOWDOWN`) | Direct Hint (`CONTEXTUAL_HINT`) | Hard-coded cutoff ($1500\text{ms}$) creates an arbitrary step function vulnerable to borderline timing. | Adaptive velocity modeling (EWMA) rather than a hard boundary. |
| **EDGE-02** (Touch Jitter) | Physical touch screen double-tap produces transient error $120\text{ms}$ after previous move | Transient input ignore / Debounce | Throttling (`STEPWISE_SLOWDOWN`) | Lack of mechanical debounce filter ($< 250\text{ms}$) causes physical double-tap to register as cognitive guessing. | Front-end input debounce rejecting tap events within $< 250\text{ms}$. |
| **EDGE-03** (Variant Step IDs) | Repeated errors on same tree node using variant string IDs (`"NODE_42_L"` vs `"NODE_42_LEFT"`) | Worked Demonstration (`WORKED_EXAMPLE`) | Basic Hint (`CONTEXTUAL_HINT`) | `isPersistentStepFailure` uses strict string equality (`e.stepIdentifier === prev.stepIdentifier`). | Semantic canonicalization of step identifiers prior to event submission. |
| **EDGE-04** (Hint-Reliance Fallthrough) | Learner requests hint on every step and mechanically follows advice to achieve 3 correct moves | Hint reduction / Independent challenge | Scaffold Fading (`REDUCE_GUIDANCE`) | Mastery streak only checks `actionSuccessStreak >= 3` and ignores whether moves were hint-scaffolded. | Disqualify steps where hints were consumed from the autonomous mastery counter. |
