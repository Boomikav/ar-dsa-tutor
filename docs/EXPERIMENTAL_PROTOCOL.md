# AR-DSA Tutor — Frozen Experimental Protocol & Evaluation Methodology

**Protocol Version:** 2.0.0 (Frozen Pre-Submission Specification)  
**Authors:** Academic Review & Systems Architecture Team  
**Standards Compliance:** ACM / IEEE Experimental Replication Standards  

---

## 1. Frozen Evaluation Framework

To eliminate evaluation leakage and post-hoc tuning, this protocol establishes the formal, frozen experimental conditions for evaluating AR-DSA Tutor and its pedagogical adaptation components.

---

## 2. Predeclared Intervention Taxonomy

The pedagogical policy engine operates over a frozen 6-tier intervention taxonomy grounded in Cognitive Load Theory and Scaffolding Fading:

| Intervention Class | Pedagogical Trigger | Spatial / Visual Manifestation |
|---|---|---|
| `CONTEXTUAL_HINT` | Isolated invariant error following progress or deliberate pause ($\Delta t \ge 1500\text{ms}$) | Direct corrective mathematical comparison anchored near active 3D element |
| `STEPWISE_SLOWDOWN` | Impulsive trial-and-error guessing (consecutive errors with $\Delta t < 1500\text{ms}$) | Interaction controls temporarily dimmed with a 3-second reflection prompt |
| `HIGHLIGHT_ELEMENT` | Spatial disorientation, invalid graph traversal, or cyclic revisit | Emissive pulsing glow applied directly to target 3D node/vertex |
| `WORKED_EXAMPLE` | Persistent impasse ($\ge 3$ consecutive errors on identical `stepIdentifier`) | Step-by-step 3D animated playback demonstrating correct spatial move |
| `PREREQUISITE_REVIEW` | Systemic collapse ($\ge 4$ errors with failure rate $\ge 60\%$ across $\ge 5$ events) | Modal recommending foundational curriculum topic review |
| `REDUCE_GUIDANCE` | Mastery streak ($\ge 3$ correct without hints) or correct exploratory move | Scaffolding calipers, comparison labels, and guidance arrows fade out |

---

## 3. Input Event Schema & Invariant Rules

Interaction telemetry ingested by adaptation policies must strictly adhere to `EGEAInteractionEvent`:
- $k \in \mathbb{N}^+$: Strictly monotonic sequence number per session.
- $\tau_k \in \mathbb{R}^+$: ISO 8601 timestamp.
- $\Delta t_k \ge 0$: Milliseconds elapsed since event $k-1$.
- $\alpha_k \in \{\text{BST}, \text{BubbleSort}, \text{BinarySearch}, \text{BFS}, \text{Stack}\}$: Algorithm identifier.
- $a_k^*$: Deterministic ground-truth expected action.
- $a_k$: Learner's attempted action.
- $c_k \in \{0, 1\}$: Binary correctness indicator ($c_k = 1 \iff a_k = a_k^*$).
- $\kappa_k \in \mathcal{K}$: Error category ($\text{NONE}$ if $c_k=1$).
- $h_k \in \mathbb{N}$: Cumulative hints accessed.
- $\sigma_k$: Serialized algorithm state context snapshot.

---

## 4. Evaluated Systems & Baselines

All systems receive identical event histories and are evaluated against identical frozen scenario trajectories:

1. **Fixed Hint Baseline:** Represents traditional static educational feedback. Emits a generic message on errors ("Check rules") and allows exploration on correct moves. Incapable of pacing detection, highlighting, or multi-step scaffolding.
2. **Simple Error Rule Baseline:** Represents stateless category-lookup heuristics. Maps the immediate error category $\kappa_k$ to a localized hint text (e.g., traversal $\to$ highlight). Has zero memory of past steps and cannot track pacing.
3. **Matched-History Baseline (`MatchedHistoryBaseline`):** Receives full event history and inter-action latencies $\Delta t$. Emits slowdown on rapid pacing and prerequisite review on high cumulative error counts, but lacks step-identifier persistence tracking (`WORKED_EXAMPLE`) and hierarchical priority resolution.
4. **EGEA Adaptive Policy (`EGEAPolicyEngine`):** Pure deterministic priority cascade combining millisecond pacing detection, step-level persistence tracking, systemic collapse detection, and scaffolding fading.

---

## 5. Frozen Metric Calculations

For a set of classes $C$ and confusion matrix $M$ where $M_{i,j}$ denotes actual class $i$ predicted as class $j$:

1. **Class-Level Metrics:**
   $$\text{Precision}_c = \frac{M_{c,c}}{\sum_{i \in C} M_{i,c}}, \quad \text{Recall}_c = \frac{M_{c,c}}{\sum_{j \in C} M_{c,j}}, \quad F_1(c) = \frac{2 \cdot \text{Precision}_c \cdot \text{Recall}_c}{\text{Precision}_c + \text{Recall}_c}$$
2. **Standard Unweighted Macro-$F_1$:**
   $$\text{Macro-}F_1^{\text{unweighted}} = \frac{1}{|C|} \sum_{c \in C} F_1(c)$$
3. **Harmonic Macro-$F_1$ (for comparative reference):**
   $$\text{Macro-}F_1^{\text{harmonic}} = \frac{2 \cdot P_{\text{macro}} \cdot R_{\text{macro}}}{P_{\text{macro}} + R_{\text{macro}}}$$
4. **Overall Accuracy:**
   $$\text{Accuracy} = \frac{\sum_{c \in C} M_{c,c}}{N_{\text{total}}} \times 100\%$$

---

## 6. Inclusion, Exclusion & Ambiguity Resolution Rules

1. **Independent Challenge Definition:** A challenge scenario must represent an authentic learning behavioral pattern (e.g. deliberate pause before error, fluent expert pace, touch jitter, repeated failure on midpoint) rather than a direct copy of an internal policy boolean predicate.
2. **Ambiguity Resolution:**
   - If an error is both rapid ($\Delta t < 1500\text{ms}$) and a traversal error, pedagogical priority dictates that pacing reflection (`STEPWISE_SLOWDOWN`) takes precedence over spatial highlighting (`HIGHLIGHT_ELEMENT`). Highlighting a target element for an impulsive clicker reinforces trial-and-error guessing.
   - If a learner achieves 3 correct moves but accessed hints during the streak, scaffolding fading (`REDUCE_GUIDANCE`) is suspended because the learner has not demonstrated independent retrieval.
3. **Label Provenance Disclose:** Target labels in the challenge suite represent an **Engineering Challenge Suite** authored using published cognitive scaffolding rubrics. They must NOT be represented as external third-party human annotator consensus.

---

## 7. Execution Commands

- **Run 16 Test Suites:** `npx tsx scripts/run_all_tests.ts`
- **Run Software Consistency Benchmark:** `npx tsx scripts/run_egea_benchmark.ts`
- **Run Independent Challenge Suite:** `npx tsx scripts/evaluate_independent_challenge_set.ts`
- **Run Failure Mode Counterexamples:** `npx tsx scripts/evaluate_failure_mode_benchmark.ts`
- **Run Empirical Latency Microbenchmark:** `npx tsx scripts/measure_empirical_latency.ts`
