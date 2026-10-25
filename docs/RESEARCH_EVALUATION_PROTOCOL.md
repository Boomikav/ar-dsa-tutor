# EGEA Technical Evaluation Protocol

**Document Version:** 1.0.0  
**Authors:** AR-DSA Research & Architecture Group  
**Target Venue:** ACM CHI / IEEE VR / AIED  

---

## 1. Evaluation Objectives

The objective of this technical evaluation is to test whether the **Execution-Grounded Explainable Adaptation (EGEA)** model provides statistically defensible advantages over standard pedagogical baselines:
1. **Fixed Hint Baseline:** Traditional static educational reminder ("Check algorithm rules").
2. **Simple Error Rule Baseline:** Stateless 1-to-1 mapping from error category to localized hint.
3. **EGEA Adaptive Policy:** History-aware, multi-step priority policy grounded in deterministic engine state.

---

## 2. Benchmark Corpus & Scenario Families

The evaluation suite tests 30 distinct scenarios across 6 algorithm and failure families encompassing all five supported algorithms:
- `ds-binary-search-tree`
- `algo-bubble-sort`
- `algo-binary-search`
- `algo-breadth-first-search`
- `ds-stack`

### 2.1 Scenario Families
1. **Family A: One-Off Minor Mistake:** Learner makes an isolated conceptual error after steady progress ($n=5$). Expected: `CONTEXTUAL_HINT`.
2. **Family B: Rapid Impulsive Guessing:** Learner commits consecutive errors with inter-action latency $\Delta t < 1500\text{ms}$ ($n=5$). Expected: `STEPWISE_SLOWDOWN`.
3. **Family C: Attention Saliency Lapse:** Learner deviates from active graph queue or chooses disconnected traversal ($n=5$). Expected: `HIGHLIGHT_ELEMENT`.
4. **Family D: Persistent Repeated Failure:** Learner fails $\ge 3$ consecutive times on the identical step ($n=5$). Expected: `WORKED_EXAMPLE`.
5. **Family E: Prerequisite Deficit:** Learner suffers systemic collapse across multiple steps (failure rate $\ge 60\%$, total errors $\ge 4$) ($n=5$). Expected: `PREREQUISITE_REVIEW`.
6. **Family F: Independent Mastery Streak:** Learner completes $\ge 3$ consecutive correct decisions without hints ($n=5$). Expected: `REDUCE_GUIDANCE`.

---

## 3. Evaluation Metrics

For each system $S \in \{\text{Fixed Hint}, \text{Simple Rule}, \text{EGEA}\}$:
- **Intervention Appropriateness Rate ($AR$):**
  $$AR = \frac{\text{Correct Interventions}}{\text{Total Scenarios}} \times 100\%$$
- **Macro-Averaged Precision ($P$), Recall ($R$), and F1-Score ($F_1$):**
  $$F_1 = \frac{2 \cdot P \cdot R}{P + R}$$
- **Computational Latency:** Microsecond-resolution timing across decisions measuring mean, maximum, and 95th percentile ($P_{95}$) runtime. Target threshold is $< 5.0\text{ms}$ to ensure zero stutter in 60 FPS mobile WebXR rendering.

---

## 4. Execution Command

To execute the benchmark reproducibly:
```bash
npx tsx scripts/run_egea_benchmark.ts
```
Output results are written to `research-results/egea_evaluation_report.json`.
