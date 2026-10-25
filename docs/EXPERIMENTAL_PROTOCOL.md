# AR-DSA Tutor — Experimental Protocol & Evaluation Methodology

**Protocol Version:** 1.0.0  
**Authors:** Academic Review & Systems Architecture Team  
**Standards Compliance:** ACM / IEEE Experimental Replication Standards  

---

## 1. Experimental Objectives

This protocol provides the authoritative specification for replicating all technical benchmarks and establishes the methodological blueprint for future empirical human participant studies.

---

## 2. Technical Evaluation Protocols (Fully Reproducible Now)

### Protocol A: Software Verification & Deterministic Invariant Suite
- **Objective:** Verify mathematical correctness of all 20 algorithm engines and Three.js visualizers.
- **Execution Command:**
  ```bash
  npx tsx scripts/run_all_tests.ts
  ```
- **Acceptance Criterion:** 16 suites pass, 1,355 assertions pass, 0 failures.

### Protocol B: Software Consistency Benchmark (30 Scenarios)
- **Objective:** Verify internal decision consistency of `EGEAPolicyEngine` across 6 scenario families against Fixed Hint and Simple Error Rule baselines.
- **Execution Command:**
  ```bash
  npx tsx scripts/run_egea_benchmark.ts
  ```
- **Output Artifact:** `research-results/egea_evaluation_report.json`.
- **Classification:** White-box software consistency verification.

### Protocol C: Independent Engineering Challenge Suite (18 Scenarios)
- **Objective:** Evaluate instructional discrimination on complex, realistic learner trajectories with balanced class distribution (3 scenarios per class) against human expert pedagogical rubrics.
- **Execution Command:**
  ```bash
  npx tsx scripts/evaluate_independent_challenge_set.ts
  ```
- **Output Artifact:** `research-results/engineering_challenge_suite_report.json`.
- **Metrics Calculated:** Per-class Precision, Recall, F1, Unweighted Macro-F1, Harmonic Macro-F1, and Confusion Matrices.

### Protocol D: Empirical Latency & JIT Microbenchmark
- **Objective:** Measure sub-millisecond execution timing under controlled microbenchmarking conditions.
- **Execution Command:**
  ```bash
  npx tsx scripts/measure_empirical_latency.ts
  ```
- **Parameters:** 200 warm-up cycles, $N = 1,000$ decisions, high-resolution `performance.now()`.
- **Acceptance Threshold:** Steady-state mean $< 1.0\text{ms}$ ($P_{95} < 1.0\text{ms}$).

---

## 3. Human Participant Study Protocol (Future Study Blueprint)

> [!NOTE]
> This protocol specifies the design for the future human empirical evaluation. It is **NOT RUN** in the present software prototype release.

### 3.1 Study Design & Cohort Allocation
- **Target Population:** Undergraduate computer science students enrolled in Data Structures (CS2). Target sample size $N = 60$ ($30$ per condition, randomized between-subjects).
- **Condition 1 (Control / Baseline):** 2D Desktop Interactive Visualizer with static textual feedback.
- **Condition 2 (Experimental / AR-DSA):** Mobile WebXR Immersive AR with EGEA adaptive scaffolding.

### 3.2 Instruments & Measures
1. **Pre-Assessment (15 Items):** Baseline DSA knowledge (BST operations, sorting stability, binary search bounds, BFS queueing, stack LIFO).
2. **Learning Phase (30 Minutes):** Practice 5 core algorithms with real-time feedback.
3. **Post-Assessment (15 Items):** Isomorphic test measuring identical learning outcomes.
4. **Normalized Learning Gain ($g$):**
   $$g = \frac{\text{Post} - \text{Pre}}{100 - \text{Pre}}$$
5. **Cognitive Load:** NASA-TLX 6-dimensional workload scale.
6. **Interaction Telemetry:** Error rates, time-to-completion, and independent success rate ($ISR$).
