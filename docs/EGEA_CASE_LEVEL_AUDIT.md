# EGEA 18-Case Engineering Challenge Suite: Traceable Case-Level Audit

**Audit Date:** October 25, 2026  
**Auditor:** Skeptical Senior Conference Reviewer & Systems Architect  
**Suite Source:** `src/services/research/egea/EGEAIndependentChallengeSet.ts`  
**Raw Results File:** `research-results/engineering_challenge_suite_report.json`  
**Execution Command:** `npx tsx scripts/evaluate_independent_challenge_set.ts`  

---

## 1. Executive Case-Level Summary

The 18-case Engineering Challenge Suite evaluates instructional intervention selection across 6 formal classes (3 scenarios per class). This audit establishes the exact traceability of every case, its input event history, triggered policy conditions, baseline outputs, and reliance on hard-coded threshold assumptions.

### Overall Recalculated Summary Table

| Case ID | Algorithm ID | Intended Target Class | Fixed Hint | Simple Error Rule | EGEA Prediction | EGEA Correct? | Policy Predicate Triggered | Threshold Sensitivity |
|---|---|---|---|---|---|:---:|---|---|
| **CHAL-01** | `ds-binary-search-tree` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | **YES** | Priority 5 (Isolated Comparison Error) | $\Delta t = 18000\text{ms} > 1500\text{ms}$ |
| **CHAL-02** | `ds-stack` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | **YES** | Priority 5 (Isolated Capacity Error) | History length $= 1 < 5$ (no prereq) |
| **CHAL-03** | `algo-binary-search` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | **YES** | Priority 5 (Isolated Comparison Error) | $\Delta t = 3500\text{ms} > 1500\text{ms}$, repeats $= 1$ |
| **CHAL-04** | `algo-bubble-sort` | `STEPWISE_SLOWDOWN` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `STEPWISE_SLOWDOWN` | **YES** | Priority 1 (`isRapidGuessing`) | $\Delta t = 600\text{ms} < 1500\text{ms}$, consecutive errors |
| **CHAL-05** | `ds-binary-search-tree` | `STEPWISE_SLOWDOWN` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `STEPWISE_SLOWDOWN` | **YES** | Priority 1 (`isRapidGuessing`) | $\Delta t = 900\text{ms} < 1500\text{ms}$, consecutive errors |
| **CHAL-06** | `algo-breadth-first-search` | `STEPWISE_SLOWDOWN` | `CONTEXTUAL_HINT` | `HIGHLIGHT_ELEMENT` | `STEPWISE_SLOWDOWN` | **YES** | Priority 1 (`isRapidGuessing`) | $\Delta t = 1050\text{ms} < 1500\text{ms}$, overrides traversal |
| **CHAL-07** | `algo-breadth-first-search` | `HIGHLIGHT_ELEMENT` | `CONTEXTUAL_HINT` | `HIGHLIGHT_ELEMENT` | `HIGHLIGHT_ELEMENT` | **YES** | Priority 4 (`ATTENTION_SALIENCE_LAPSE`) | Error is `TRAVERSAL_DIRECTION`, $\Delta t = 4500\text{ms}$ |
| **CHAL-08** | `algo-breadth-first-search` | `HIGHLIGHT_ELEMENT` | `CONTEXTUAL_HINT` | `HIGHLIGHT_ELEMENT` | `HIGHLIGHT_ELEMENT` | **YES** | Priority 4 (`ATTENTION_SALIENCE_LAPSE`) | Error is `CYCLE_OR_UNVISITED`, $\Delta t = 3800\text{ms}$ |
| **CHAL-09** | `ds-binary-search-tree` | `HIGHLIGHT_ELEMENT` | `CONTEXTUAL_HINT` | `HIGHLIGHT_ELEMENT` | `HIGHLIGHT_ELEMENT` | **YES** | Priority 4 (`ATTENTION_SALIENCE_LAPSE`) | Error is `TRAVERSAL_DIRECTION`, $\Delta t = 3200\text{ms}$ |
| **CHAL-10** | `algo-binary-search` | `WORKED_EXAMPLE` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `WORKED_EXAMPLE` | **YES** | Priority 2 (`isPersistentStepFailure`) | Identical step ID repeated $\ge 3$ times |
| **CHAL-11** | `algo-bubble-sort` | `WORKED_EXAMPLE` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `WORKED_EXAMPLE` | **YES** | Priority 2 (`isPersistentStepFailure`) | Identical step ID repeated $\ge 3$ times |
| **CHAL-12** | `ds-binary-search-tree` | `WORKED_EXAMPLE` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `WORKED_EXAMPLE` | **YES** | Priority 2 (`isPersistentStepFailure`) | Identical step ID repeated $\ge 3$ times |
| **CHAL-13** | `ds-binary-search-tree` | `PREREQUISITE_REVIEW` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `PREREQUISITE_REVIEW` | **YES** | Priority 3 (`isPrerequisiteDeficit`) | History $\ge 5$, errors $= 4 \ge 4$, rate $= 80\% \ge 60\%$ |
| **CHAL-14** | `algo-binary-search` | `PREREQUISITE_REVIEW` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `PREREQUISITE_REVIEW` | **YES** | Priority 3 (`isPrerequisiteDeficit`) | History $\ge 5$, errors $= 4 \ge 4$, rate $= 80\% \ge 60\%$ |
| **CHAL-15** | `ds-stack` | `PREREQUISITE_REVIEW` | `CONTEXTUAL_HINT` | `CONTEXTUAL_HINT` | `PREREQUISITE_REVIEW` | **YES** | Priority 3 (`isPrerequisiteDeficit`) | History $\ge 5$, errors $= 4 \ge 4$, rate $= 80\% \ge 60\%$ |
| **CHAL-16** | `ds-binary-search-tree` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | **YES** | Priority Case 1 (`isMasteryStreak`) | 4 consecutive correct moves, hints $= 0$ |
| **CHAL-17** | `algo-bubble-sort` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | **YES** | Priority Case 1 (`isMasteryStreak`) | 3 consecutive correct moves, hints $= 0$ |
| **CHAL-18** | `ds-stack` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | `REDUCE_GUIDANCE` | **YES** | Last action is Correct | Latest action correct, maintains progression |

---

## 2. In-Depth Case Traceability (18 Cases)

### Category 1: Isolated Invariant Errors (`CONTEXTUAL_HINT`)
- **CHAL-01:** Learner studies BST for 18 seconds ($\Delta t = 18000\text{ms}$) before committing a comparison error.
  - *Triggered Predicate:* Because $\Delta t > 1500\text{ms}$, `isRapidGuessing` evaluates false. Because step identifiers differ (`node-root` vs `node-right-child`), `isPersistentStepFailure` evaluates false. Total errors $= 2 < 4$, so `isPrerequisiteDeficit` is false. Falls through to Priority 5.
  - *Baseline Behavior:* Fixed Hint and Simple Error Rule both output `CONTEXTUAL_HINT`. All three systems agree.
- **CHAL-02:** First interaction in Stack practice is an attempt to pop from an empty stack.
  - *Triggered Predicate:* History length is 1; no repeat failure, no rushing. Falls through to Priority 5.
  - *Baseline Behavior:* All three systems output `CONTEXTUAL_HINT`.
- **CHAL-03:** Learner halves correctly on Binary Search step 1, then makes a comparison error on step 2 with deliberate pacing ($\Delta t = 3500\text{ms}$).
  - *Triggered Predicate:* Isolated error following success. Falls through to Priority 5.
  - *Baseline Behavior:* All three systems output `CONTEXTUAL_HINT`.

### Category 2: Impulsive Pacing (`STEPWISE_SLOWDOWN`)
- **CHAL-04:** Learner clicks swap twice within $600\text{ms}$ in Bubble Sort without inspecting elements.
  - *Triggered Predicate:* `isRapidGuessing` evaluates true ($\Delta t = 600\text{ms} < 1500\text{ms}$, consecutive incorrect actions). Returns `STEPWISE_SLOWDOWN`.
  - *Baseline Failure:* Fixed Hint outputs generic hint; Simple Error Rule outputs comparison hint. Both fail because neither inspects `timeSinceLastActionMs`.
- **CHAL-05:** Learner toggles between Left and Right in $900\text{ms}$ panic response on BST.
  - *Triggered Predicate:* `isRapidGuessing` evaluates true ($\Delta t = 900\text{ms} < 1500\text{ms}$).
  - *Baseline Failure:* Both baselines fail; they cannot distinguish $900\text{ms}$ rushing from $18000\text{ms}$ reflection.
- **CHAL-06:** Learner rapidly clicks non-adjacent BFS vertices ($\Delta t = 1050\text{ms}$).
  - *Triggered Predicate:* `isRapidGuessing` evaluates true. In EGEA's priority cascade, Priority 1 (Rapid Guessing) **overrides** Priority 4 (Traversal Saliency Lapse).
  - *Baseline Failure:* Simple Error Rule inspects only error category (`TRAVERSAL_DIRECTION`), thus predicting `HIGHLIGHT_ELEMENT`. This is pedagogically sub-optimal because highlighting a node for an impulsive guesser reinforces trial-and-error clicking rather than reflection.

### Category 3: Spatial Orientation Lapses (`HIGHLIGHT_ELEMENT`)
- **CHAL-07:** Learner ponders 3D BFS graph for $4500\text{ms}$, then selects a non-adjacent vertex.
  - *Triggered Predicate:* Priority 1 is false ($\Delta t = 4500\text{ms}$). Priority 4 triggers on `TRAVERSAL_DIRECTION`. Returns `HIGHLIGHT_ELEMENT`.
  - *Baseline Behavior:* Simple Error Rule successfully predicts `HIGHLIGHT_ELEMENT` by category lookup. Fixed Hint fails.
- **CHAL-08:** Learner tries to re-visit an already completed BFS vertex after $3800\text{ms}$.
  - *Triggered Predicate:* Priority 4 triggers on `CYCLE_OR_UNVISITED`. Returns `HIGHLIGHT_ELEMENT`.
  - *Baseline Behavior:* Simple Error Rule predicts `HIGHLIGHT_ELEMENT`. Fixed Hint fails.
- **CHAL-09:** Learner misses the target sub-tree node during deep BST traversal ($\Delta t = 3200\text{ms}$).
  - *Triggered Predicate:* Priority 4 triggers on `TRAVERSAL_DIRECTION`. Returns `HIGHLIGHT_ELEMENT`.
  - *Baseline Behavior:* Simple Error Rule predicts `HIGHLIGHT_ELEMENT`. Fixed Hint fails.

### Category 4: Persistent Step Impasse (`WORKED_EXAMPLE`)
- **CHAL-10:** Learner fails 3 consecutive times on the identical Binary Search midpoint step (`midpoint-decision-step-1`) at $3500\text{ms}$ intervals.
  - *Triggered Predicate:* `isPersistentStepFailure` checks `lastThree.every(e => !e.isCorrect && e.stepIdentifier === stepId)`. Returns `WORKED_EXAMPLE`.
  - *Baseline Failure:* Both baselines fail. Because neither tracks `stepIdentifier` history, they repeatedly emit identical single hints.
- **CHAL-11:** Learner fails 3 consecutive times to determine Bubble Sort swap at index 3 and 4 at $4000\text{ms}$ intervals.
  - *Triggered Predicate:* `isPersistentStepFailure` triggers. Returns `WORKED_EXAMPLE`.
  - *Baseline Failure:* Both baselines fail.
- **CHAL-12:** Learner fails 3 consecutive times on BST leaf insertion position for key 35 at $3100\text{ms}$ intervals.
  - *Triggered Predicate:* `isPersistentStepFailure` triggers. Returns `WORKED_EXAMPLE`.
  - *Baseline Failure:* Both baselines fail.

### Category 5: Systemic Prerequisite Collapse (`PREREQUISITE_REVIEW`)
- **CHAL-13:** Learner fails 4 consecutive steps across 4 distinct BST tree levels (failure rate $= 80\%$).
  - *Triggered Predicate:* `isPrerequisiteDeficit` checks `history.length >= 5`, `incorrectCount >= 4`, and `(incorrectCount / length) >= 0.6`. Returns `PREREQUISITE_REVIEW`.
  - *Baseline Failure:* Both baselines fail. Simple Error Rule emits isolated comparison hints; Fixed Hint emits generic rules.
- **CHAL-14:** Learner fails across 4 distinct pointer update subproblems in Binary Search (failure rate $= 80\%$).
  - *Triggered Predicate:* `isPrerequisiteDeficit` triggers. Returns `PREREQUISITE_REVIEW`.
  - *Baseline Failure:* Both baselines fail.
- **CHAL-15:** Learner violates capacity and LIFO order across 4 distinct Stack operations (failure rate $= 80\%$).
  - *Triggered Predicate:* `isPrerequisiteDeficit` triggers. Returns `PREREQUISITE_REVIEW`.
  - *Baseline Failure:* Both baselines fail.

### Category 6: Scaffolding Fading & Autonomy (`REDUCE_GUIDANCE`)
- **CHAL-16:** Learner executes 4 correct BST moves in rapid succession ($\Delta t = 750\text{ms}$).
  - *Triggered Predicate:* `isMasteryStreak` evaluates true (4 correct, 0 hints). Returns `REDUCE_GUIDANCE`.
  - *Baseline Behavior:* Both baselines output `REDUCE_GUIDANCE` on correct moves.
- **CHAL-17:** Learner executes 3 consecutive Bubble Sort swap decisions correctly without hints.
  - *Triggered Predicate:* `isMasteryStreak` evaluates true. Returns `REDUCE_GUIDANCE`.
  - *Baseline Behavior:* Both baselines output `REDUCE_GUIDANCE`.
- **CHAL-18:** Learner slips on step 1 (Stack underflow), immediately self-corrects on step 2, and succeeds on step 3.
  - *Triggered Predicate:* Latest event is correct. Returns `REDUCE_GUIDANCE`.
  - *Baseline Behavior:* Both baselines output `REDUCE_GUIDANCE`.

---

## 3. Critical Methodological Findings & Assumptions

1. **Balance Verification:**
   - Input distribution: Exactly 3 scenarios per class ($3 \times 6 = 18$).
   - Output distribution: EGEA outputs exactly 3 predictions per class.
   - Reference labels: Exactly 3 labels per class.
   - Genuine balance is maintained across inputs, outputs, and reference classes.

2. **Hard-Coded Cutoff Dependencies:**
   - **Pacing Cutoff:** The distinction between guessing and reflection is hard-coded at $1500\text{ms}$. If a student guesses at $1550\text{ms}$, EGEA fails to trigger slowdown. Conversely, if a student rapidly taps due to high interface familiarity, but makes a typo at $1450\text{ms}$, EGEA throttles them.
   - **Persistent Impasse Cutoff:** Hard-coded at exactly 3 attempts on the exact same `stepIdentifier`. If the application changes `stepIdentifier` naming dynamically across re-renders, persistence detection breaks.
   - **Prerequisite Cutoff:** Hard-coded at $\ge 4$ failures and $\ge 60\%$ failure rate with minimum history length $\ge 5$. A student who fails 3 times on the first 3 steps will NOT receive prerequisite review until event 5.

3. **Baseline Information Asymmetry:**
   - `FixedHintBaseline` and `SimpleErrorRuleBaseline` were given access only to the final event, because they were defined as stateless.
   - While this highlights the necessity of state tracking, it does not demonstrate that EGEA is superior to *other history-aware* policies (e.g., exponential moving average, Bayesian knowledge tracing, or sliding window frequency counters).
   - In Task 2, we introduce a **Matched-Information History Baseline** to resolve this scientific limitation.
