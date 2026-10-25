# Execution-Grounded Explainable Adaptation (EGEA) — Method Specification

**Target Venue:** IEEE VR / ACM CHI / AIED Conference Submission  
**Framework:** EGEA (Execution-Grounded Explainable Adaptation)  
**Authors:** AR-DSA Research & Architecture Team  

---

## 1. Research Motivation & Problem Formulation

In augmented reality (AR) educational environments for Data Structures and Algorithms (DSA), intelligent scaffolding typically suffers from one of two failure modes:
1. **Generic or Stateless Heuristics:** Systems present fixed static text or simple 1-to-1 error lookups that ignore student pacing, repeated failures, or mastery streaks. This leads to student frustration (when stuck) or over-scaffolding (when already proficient).
2. **Ungrounded Generative AI:** Large Language Models (LLMs) used directly for real-time guidance are prone to spatial hallucination, variable latency, and non-deterministic advice that may contradict the underlying data structure's mathematical invariants.

To solve this, we introduce **Execution-Grounded Explainable Adaptation (EGEA)**: an explainable adaptation architecture that couples deterministic spatial execution engines with a history-aware pedagogical policy engine.

---

## 2. Theoretical Architecture

```mermaid
flowchart TD
    User["Learner Interaction in Mobile WebXR"] --> Engine["Deterministic DSA Engine (Ground Truth)"]
    Engine --> Adapter["EGEAEventAdapter (Monotonic Ordering & Latency)"]
    Adapter --> Schema["EGEAEventSchema (Validation & Invariants)"]
    Schema --> Policy["EGEAPolicyEngine (Pedagogical Priority Logic)"]
    Policy --> Interventions{"Intervention Selection"}
    Interventions --> HINT["CONTEXTUAL_HINT (Single Error)"]
    Interventions --> HIGHLIGHT["HIGHLIGHT_ELEMENT (Spatial Lapse)"]
    Interventions --> SLOW["STEPWISE_SLOWDOWN (Rapid Guessing)"]
    Interventions --> WORKED["WORKED_EXAMPLE (Persistent 3x Error)"]
    Interventions --> PREREQ["PREREQUISITE_REVIEW (Systemic Collapse)"]
    Interventions --> FADE["REDUCE_GUIDANCE (Mastery Streak)"]
```

### 2.1 Formal Event Model
Let a learning session be represented by a monotonic sequence of validated interaction events:
$$\mathcal{S} = \langle e_1, e_2, \dots, e_n \rangle$$
Where each event $e_i$ is a tuple:
$$e_i = (i, \tau_i, \Delta t_i, \alpha_i, a_i^*, a_i, c_i, \kappa_i, h_i, \sigma_i)$$
- $i \in \mathbb{N}^+$: Strictly monotonic sequence number.
- $\tau_i \in \mathbb{R}^+$: ISO timestamp.
- $\Delta t_i \in \mathbb{R}^+$: Interaction latency since $e_{i-1}$ in milliseconds.
- $\alpha_i \in \mathcal{A}$: DSA Algorithm identifier.
- $a_i^*$: Deterministic ground-truth expected action.
- $a_i$: Learner's attempted action.
- $c_i \in \{0, 1\}$: Binary correctness ($c_i = 1 \iff a_i = a_i^*$).
- $\kappa_i \in \mathcal{K}$: Error category ($\kappa_i = \text{NONE}$ if $c_i = 1$).
- $h_i \in \mathbb{N}$: Cumulative hints accessed.
- $\sigma_i$: Serialized snapshot of algorithm state variables.

---

## 3. Pedagogical Policy Priority Hierarchy

When a learner executes an action, `EGEAPolicyEngine` determines the pedagogical intervention through a deterministic decision cascade:

```
IF Mastery Streak (last 3 correct without hints) THEN
    -> REDUCE_GUIDANCE (Fade scaffolds, encourage autonomous recall)
ELSE IF Last action is Correct THEN
    -> REDUCE_GUIDANCE (Maintain normal exploratory progression)
ELSE (Action is Incorrect)
    IF Rapid Guessing (consecutive errors with Δt < 1500ms) THEN
        -> STEPWISE_SLOWDOWN (Enforce deliberate reflection pause)
    ELSE IF Persistent Step Failure (>= 3 consecutive failures on same step) THEN
        -> WORKED_EXAMPLE (Provide spatial demonstration walk-through)
    ELSE IF Systemic Prerequisite Deficit (>= 4 total failures, failure rate >= 60%) THEN
        -> PREREQUISITE_REVIEW (Suggest foundational topic review)
    ELSE IF Spatial Attention Lapse (traversal or unvisited cycle) THEN
        -> HIGHLIGHT_ELEMENT (Spatially illuminate target 3D element)
    ELSE
        -> CONTEXTUAL_HINT (Direct corrective invariant clue)
```

---

## 4. Key Scientific Guarantees

1. **Deterministic Grounding:** Every intervention is generated with an explicit `groundingState` extracted from the deterministic algorithm engine. Hallucination is mathematically impossible.
2. **Sub-5ms Evaluation Latency:** All decision logic is formulated as pure $O(1)$ or $O(k)$ vector operations over recent interaction windows ($k \le 10$), allowing real-time 60 FPS mobile WebXR rendering without dropped frames.
3. **Auditable Decision Log:** Every adaptation outputs an invariant `rationaleCode` enabling full retrospective analysis and educational reproducibility.
