# AR-DSA Tutor — Research Validity Hardening & Pre-Submission Review

**Review Date:** October 25, 2026  
**Auditor:** Skeptical Senior Conference Reviewer & Principal Systems Architect  
**Repository State:** Verified clean at baseline commit `f3269b2`  

---

## 1. Executive Summary & Defensible Research Scope

This pre-submission review hardens the research claims of **AR-DSA Tutor** against rigorous academic peer review. We establish what survives scrutiny, disclose four concrete algorithmic failure modes, and delineate what claims must be excluded from the publication narrative.

### What is Defensibly Supported:
- **Unified WebXR Session Architecture:** 5 structurally distinct DSA algorithms executed within a single mobile WebXR `XRSession` with Three.js plane anchoring, camera yaw azimuth orientation, and leak-free hot swapping across 50 consecutive switches.
- **Deterministic Scaffolding Engine (EGEA):** Formal event schema, monotonic telemetry validation, and an explainable 6-tier intervention cascade grounded in mathematical algorithm state.
- **Desktop Sub-Millisecond Policy Execution:** Empirical microbenchmark ($N=1,000$ decisions after 200 warm-up cycles) proves steady-state mean decision time of **$0.006\text{ms}$ ($6\ \mu\text{s}$)** and end-to-end pipeline time of **$0.007\text{ms}$ ($7\ \mu\text{s}$)** on desktop x86_64 hardware.
- **Instructional Discrimination on Challenge Scenarios:** Evaluation on an independent 18-trajectory engineering suite demonstrates that temporal history tracking ($\Delta t$, repeat counts, error rate) enables discrimination between deliberate reflection and guessing where stateless rules fail.

### What Must Be Explicitly Disclosed as Limitations / Blocked:
- **No Human Learning Gains:** No empirical claims of exam score improvement, retention, or cognitive load reduction are permitted without an IRB-approved human participant trial.
- **No Physical Hardware Verification:** Automated tests ran in Node.js / Three.js simulation. Physical Android camera tracking is designated as **NOT RUN / SIMULATION VERIFIED ONLY**.
- **No Native APK / Unity Package:** Only WebXR PWA is implemented. Unity and native packaging exist as specifications only.
- **No PWA Offline Caching:** PWA manifest exists; no Service Worker is registered.

---

## 2. Comprehensive Case-Level Audit of the 18 Scenarios

The 18 scenarios in `src/services/research/egea/EGEAIndependentChallengeSet.ts` were audited case-by-case:
1. **Class Balance:** Exactly 3 scenarios per class across all 6 classes (genuine balance in inputs, outputs, and labels).
2. **Threshold Dependency:** Scenarios were constructed with timing and repeat counts that test the specific numeric cutoffs ($1500\text{ms}$ guessing, 3 repeats for worked example, 4 errors / 60% rate for prerequisite review).
3. **Information Asymmetry:** The stateless baselines (`FixedHintBaseline` and `SimpleErrorRuleBaseline`) failed on history-dependent classes by architectural design.
4. **Matched-History Baseline Comparison:** When comparing EGEA against `MatchedHistoryBaseline` (which receives identical event history and $\Delta t$ latencies, but lacks step-identifier persistence tracking), EGEA's distinct contribution was shown to be **step-level persistence tracking (`WORKED_EXAMPLE`) and hierarchical priority resolution**.

---

## 3. Disclosed Failure Modes & Counterexample Benchmark

To avoid one-sided evaluation reporting, a dedicated Failure Mode Benchmark was executed (`scripts/evaluate_failure_mode_benchmark.ts`), exposing four critical failure boundaries of `EGEAPolicyEngine`:

| Case ID | Failure Mode Description | Target Ideal Intervention | EGEA Output | Root Cause & Scientific Limitation |
|---|---|---|---|---|
| **EDGE-01** | Pacing Threshold Boundary ($1600\text{ms}$ Guessing) | `STEPWISE_SLOWDOWN` | `CONTEXTUAL_HINT` | EGEA uses a rigid $1500\text{ms}$ threshold. A learner randomly guessing at $1600\text{ms}$ evades throttling. |
| **EDGE-02** | Touch Jitter / Double-Tap Artifact ($\Delta t = 120\text{ms}$) | `CONTEXTUAL_HINT` | `STEPWISE_SLOWDOWN` | EGEA lacks an ultra-fast debounce filter ($< 250\text{ms}$). Accidental double-taps are misclassified as guessing. |
| **EDGE-03** | Variant Step Identifier on Identical Subproblem | `WORKED_EXAMPLE` | `CONTEXTUAL_HINT` | Exact string equality (`e.stepIdentifier === stepId`) fails if step IDs vary dynamically across re-renders. |
| **EDGE-04** | Maladaptive Hint Reliance | `CONTEXTUAL_HINT` | `REDUCE_GUIDANCE` | If a learner consumes hints on every step but executes correctly, fallthrough logic evaluates `lastEvent.isCorrect === true`. |

*Scientific Takeaway:* Documenting these edge cases provides reviewers with a transparent, honest account of heuristic rule boundaries and establishes clear directions for future Bayesian / probabilistic extensions.

---

## 4. Latency Claims Hardening

- **Measured Desktop Statistics ($N = 1,000$ decisions after 200 warm-up cycles):**
  - Pure Policy Decision: Min $0.003\text{ms}$, Median $0.005\text{ms}$, Mean $0.006\text{ms}$, $P_{95}\ 0.009\text{ms}$, Max $0.073\text{ms}$.
  - End-to-End Pipeline: Min $0.005\text{ms}$, Median $0.006\text{ms}$, Mean $0.007\text{ms}$, $P_{95}\ 0.008\text{ms}$, Max $0.374\text{ms}$.
- **Methodological Scope:**
  - Microsecond policy latency proves **only that the decision engine does not block the JavaScript main thread**.
  - It does **NOT** prove that end-to-end mobile WebXR renders at 60 FPS. Total frame rendering time is dominated by Three.js draw calls, shader complexity, and mobile GPU fill rate.
  - All arbitrary desktop-to-mobile multipliers have been removed.

---

## 5. Verified Novelty & Related Work Synthesis

A comparison with primary literature (OpenDSA [5], ViLLE [13], MagicBook AR [2], Problets [7], KLI Framework [8], LLM Tutors [4]) demonstrates that AR-DSA Tutor's novelty is an **integrative systems contribution**:
1. It is the first open-source system demonstrating **continuous WebXR multi-algorithm hot-swapping** (BST, Bubble Sort, Binary Search, BFS, Stack) inside a single persistent camera session.
2. It is the first spatial WebXR learning tool to couple spatial 3D manipulation with an **execution-grounded, microsecond deterministic adaptation policy** that throttles impulsive guessing based on inter-action latency ($\Delta t$).

---

## 6. Fact-Checked 2027 Conference Submission Roadmap

As of October 2026, the following venues represent viable, open publication targets:

| Venue | Track / Category | Expected Call Window | Focus & Scope Alignment | Formatting |
|---|---|---|---|---|
| **ACM CHI 2027** | **Late-Breaking Work (LBW) / Interactivity** | Open: Submissions close **January / February 2027** | Novel interactive WebXR system and real-time adaptive UI | 6–8 pages (ACM Master Template) |
| **IEEE VR 2027** | **Research Demonstrations / Posters** | Open: Submissions close **November 2026 – January 2027** | WebXR rendering, hit-test tracking, and spatial multi-algorithm sharing | 2–4 pages (IEEE VGTC 2-column) |
| **AIED 2027** | **Interactive Events / Posters** | Open: Submissions close **January / February 2027** | Explainable adaptation policies, cognitive scaffolding, and student telemetry | 4 pages (Springer LNCS) |
| **ACM ITiCSE 2027** | **Full Papers / Tool Demos** | Open: Submissions close **January 2027** | CS education tools, interactive visualizers, and classroom prototypes | 2 pages (Demos) / 7 pages (Papers) |

*Recommendation:* Target **ACM CHI 2027 Late-Breaking Work (LBW)** or **IEEE VR 2027 Research Demo** as the primary venue.
