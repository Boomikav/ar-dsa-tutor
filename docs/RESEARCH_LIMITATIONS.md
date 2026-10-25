# AR-DSA Tutor — Research Boundaries, Ethical Rigor & Limitations

**Author:** Academic Integrity & Technical Governance Committee  
**Status:** Authoritative Governance Specification  

---

## 1. Zero-Fabrication Mandate

In accordance with ACM/IEEE research ethics standards and good scientific practice:
1. **No Fabricated Participant Data:** AR-DSA Tutor does not generate, simulate, or fabricate fake human participant scores, pseudo-empirical p-values, or artificial student cohorts.
2. **Clear Demarcation of Evidence:**
   - **Software-Verified Properties:** Deterministic algorithm transitions, WebXR frame loops, sub-5ms policy latency, mathematical invariant guarantees, and confusion matrix evaluations across synthetic test scenarios.
   - **Empirical Human Study Properties:** Real human learning gains ($g$), cognitive load measurements (NASA-TLX), and subjective immersion ratings. These properties are classified as **NOT RUN (Future Human Study Required)** until conducted with an institutional IRB approval and verified human participants.

---

## 2. Experimental Boundaries

| Dimension | Automated System Scope | Human Participant Scope |
|---|---|---|
| **Execution Speed** | Latency $< 5\text{ms}$ per decision verified via automated timer suites | Learner perception of system responsiveness |
| **Intervention Appropriateness** | Scenario classification verified against pedagogical ground-truth rules | Student qualitative satisfaction and perceived helpfulness |
| **Spatial Invariant Integrity** | 100% mathematical invariant adherence verified by deterministic engines | Spatial comprehension improvement on pen-and-paper exams |
| **Hardware Compatibility** | Emulated WebXR frame loops and fallback canvas verified in headless/browser CI | Ergonomic comfort during physical handheld AR sessions |

---

## 3. Methodological Limitations

1. **Hardware Heterogeneity in Mobile WebXR:** While the W3C WebXR Device API is standardized, actual plane-detection precision, drift, and relocalization latency vary across Android devices depending on ARCore depth API support and camera hardware.
2. **Headless Testing Boundary:** Automated CI test suites (`run_all_tests.ts`) validate JavaScript execution, state machines, and mathematical logic. End-to-end optical camera passthrough validation requires physical deployment on target Android hardware (e.g., Pixel 7/8, Samsung S23/S24).
3. **Generative AI Demarcation:** In this architecture, all algorithm invariants and adaptation decisions originate from deterministic engines (`EGEAPolicyEngine`), never from generative LLM text completions. AI services provide optional conversational enrichment, preventing hallucination during algorithm execution.
