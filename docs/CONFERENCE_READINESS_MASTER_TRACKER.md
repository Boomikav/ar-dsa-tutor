# AR-DSA Tutor — Conference Readiness Master Tracker

**Document Version:** 2.0.0  
**Audit Baseline Commit:** `f3269b2`  
**Tracking Date:** October 25, 2026  
**Governance Standard:** Academic Conference Submission & Production Release Gate  

---

## 1. Master Tracker Matrix

| Req ID | Requirement | Evidence Currently Available | Verification Method | Result | Severity | Required Action | Final Acceptance Criterion |
|---|---|---|---|:---:|:---:|---|---|
| **REQ-ALG-01** | BST deterministic engine correctness | 362 tests in `dsaExpansionVerification.ts`, node ordering invariants | Automated unit/property tests | PASS | Critical | Preserve implementation | Invariants hold for all inputs; zero duplicate bugs |
| **REQ-ALG-02** | Bubble Sort deterministic engine correctness | Pass invariant tests, swap stability tests | Automated unit tests | PASS | Critical | Preserve implementation | Stable sorting, swap count matches inversions |
| **REQ-ALG-03** | Binary Search deterministic engine correctness | Caliper interval contraction, target absent tests | Automated unit tests | PASS | Critical | Preserve implementation | Monotonic convergence, correct terminating index |
| **REQ-ALG-04** | BFS deterministic engine correctness | Non-decreasing distance, cycle visited set | Automated unit tests | PASS | Critical | Preserve implementation | Visited set prevents infinite loops, FIFO queue |
| **REQ-ALG-05** | Stack deterministic engine correctness | LIFO pop ordering, 5-element overflow rejection | Automated unit tests | PASS | Critical | Preserve implementation | Rejects overflow when size=5, underflow on empty |
| **REQ-WXR-01** | Unified WebXR session without camera drop | Visibility toggle in `WebXRARService.ts`, 0 memory leaks across 50 switches | Three.js headless integration tests | PASS | High | Document device limitations | Single `XRSession`, zero duplicate sessions |
| **REQ-WXR-02** | Surface hit-test & elevation offset | $+0.02\text{m}$ offset to prevent z-fighting, camera yaw orientation | Headless WebXR mock | PASS (Sim) | High | Formulate real-device protocol | Prevents z-fighting; models face camera yaw |
| **REQ-WXR-03** | Unsupported device 3D fallback | `CANVAS_3D_FALLBACK` with touch orbit controls | Browser simulation tests | PASS | Medium | Verify notification UX | Transparent notification; controls work |
| **REQ-WXR-04** | Physical Android device verification | Protocol drafted in `REAL_DEVICE_WEBXR_VALIDATION.md` | Physical device test | **NOT RUN** | Critical | Mark explicitly as SIMULATION ONLY | Do not claim physical hardware verified |
| **REQ-EGEA-01** | Strongly-typed event schema | Monotonic sequence validation, error categories | Unit test in `egeaEvaluationVerification.ts` | PASS | High | Preserve invariants | Rejects malformed/out-of-order events |
| **REQ-EGEA-02** | Deterministic adaptation policy | 6 intervention classes, structured rationales | Unit test across classes | PASS | High | Freeze configuration | Sub-millisecond deterministic output |
| **REQ-EGEA-03** | EGEA evaluation validity (no circularity) | Synthetic 30-scenario benchmark + 18-case challenge suite | Independent Challenge Suite | **PASS** | Critical | Demarcate software consistency vs empirical validity | Reported unweighted Macro-$F_1$ honestly |
| **REQ-EGEA-04** | Methodologically balanced challenge suite | 18 scenarios in `EGEAIndependentChallengeSet.ts` (3 per class) | Standard cognitive scaffolding rubrics | PASS | High | Complete case audit in `EGEA_CASE_LEVEL_AUDIT.md` | Balanced 6-class representation ($3 \times 6 = 18$) |
| **REQ-EGEA-05** | Matched-history baseline comparison | `EGEAMatchedHistoryBaseline.ts` evaluated on 18 challenge cases | Execution benchmark | PASS | High | Isolates step-persistence contribution | EGEA (100%) vs Matched-History (83.3%) |
| **REQ-EGEA-06** | Adversarial boundary & failure modes | `EGEAFailureModeBenchmark.ts` evaluating 6 adversarial counterexamples | Heuristic boundary stress test | PASS | High | Disclose 4 failure modes in paper draft | Characterizes limits of static heuristic rules |
| **REQ-PERF-01** | Decision latency verification | Microbenchmark in `measure_empirical_latency.ts` (N=1000) | `performance.now()` | PASS | Medium | Disclose desktop vs mobile caveats | Steady-state mean $< 0.01\text{ms}$ documented |
| **REQ-SEC-01** | Zero secret / credential leaks | Distribution scan in `audit_dist.js` (0 occurrences) | AST / regex scan | PASS | Critical | Run in continuous CI | 0 API keys or private tokens in `dist/` |
| **REQ-PWA-01** | PWA manifest & mobile viewport | `public/manifest.json`, viewport meta tags | Inspection & build audit | PASS (No SW) | Medium | Document lack of Service Worker | Manifest present; no stale script risk |
| **REQ-LIT-01** | Related work & novelty matrix | Formal survey across AR DSA, tracing tutors, ITS | Literature synthesis with DOIs | PASS | High | Completed in `RELATED_WORK_AND_NOVELTY_MATRIX.md` | Closest competing papers cited with DOIs |
| **REQ-REP-01** | Complete reproducibility package | Clean commands, scripts, config, metrics | End-to-end execution | PASS | High | Documented in `RESEARCH_VALIDITY_REVIEW.md` | External reviewer can reproduce from scratch |
| **REQ-PUB-01** | Conference paper readiness | Academic framing, threat model, draft paper | Review criteria audit | PASS | High | Targets 2027 short paper / demo tracks | Honest claims; zero student gain fabrication |

---

## 2. Tracking Severity Definitions

- **Critical:** Affects scientific truth, security, or core algorithm invariants. Must be resolved before submission.
- **High:** Affects methodological defensibility, experimental fairness, or software architecture.
- **Medium:** Affects platform ergonomics, browser installation, or documentation clarity.
- **Low:** Minor warnings, stylistic conventions, or cosmetic improvements.
