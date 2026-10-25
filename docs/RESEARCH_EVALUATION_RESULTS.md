# EGEA Technical Evaluation Results & Scientific Findings

**Report Date:** October 25, 2026  
**Artifact File:** `research-results/egea_evaluation_report.json`  
**Total Evaluated Scenarios:** 30 (5 per family across all 5 DSA algorithms)  

---

## 1. System Comparison Summary

| System | Appropriateness Rate | Macro-Precision | Macro-Recall | Macro-F1 | Mean Latency | $P_{95}$ Latency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Fixed Hint Baseline** | 33.3% | 0.200 | 0.333 | 0.250 | 0.010 ms | 0.025 ms |
| **Simple Error Rule Baseline** | 50.0% | 0.450 | 0.500 | 0.429 | 0.015 ms | 0.035 ms |
| **EGEA Adaptive Policy** | **100.0%** | **1.000** | **1.000** | **1.000** | **0.075 ms** | **0.181 ms** |

---

## 2. Breakdown by Pedagogical Scenario Family

| Scenario Family | Expected Class | Fixed Hint | Simple Error Rule | EGEA Adaptive Policy |
|---|---|:---:|:---:|:---:|
| **Family A: One-Off Minor Mistake** | `CONTEXTUAL_HINT` | 5/5 (100%) | 5/5 (100%) | **5/5 (100%)** |
| **Family B: Rapid Impulsive Guessing** | `STEPWISE_SLOWDOWN` | 0/5 (0%) | 0/5 (0%) | **5/5 (100%)** |
| **Family C: Attention Saliency Lapse** | `HIGHLIGHT_ELEMENT` | 0/5 (0%) | 5/5 (100%) | **5/5 (100%)** |
| **Family D: Persistent Step Failure** | `WORKED_EXAMPLE` | 0/5 (0%) | 0/5 (0%) | **5/5 (100%)** |
| **Family E: Prerequisite Deficit** | `PREREQUISITE_REVIEW` | 0/5 (0%) | 0/5 (0%) | **5/5 (100%)** |
| **Family F: Independent Mastery Streak** | `REDUCE_GUIDANCE` | 5/5 (100%) | 5/5 (100%) | **5/5 (100%)** |

---

## 3. Analysis & Key Insights

1. **Why Fixed Hint Fails (33.3% Appropriateness):**
   - The generic fixed hint baseline treats every error identically. It cannot distinguish between rapid impulsive guessing (< 1.5s), persistent failure on a step, or prerequisite collapse.
   - Learners who are stuck receive repetitive, unhelpful advice ("Check the rules"), triggering cognitive frustration.

2. **Why Simple Error Rule Fails (50.0% Appropriateness):**
   - The stateless rule successfully identifies spatial attention lapses (`HIGHLIGHT_ELEMENT`) when error categories match traversal, and handles single errors (`CONTEXTUAL_HINT`).
   - However, because it lacks temporal history and inter-step tracking, it is **completely blind** to:
     - Rapid trial-and-error guessing (`STEPWISE_SLOWDOWN`)
     - Persistent 3x impasse on the same step (`WORKED_EXAMPLE`)
     - Systemic multi-step collapse (`PREREQUISITE_REVIEW`)

3. **EGEA's Complete Coverage (100.0% Appropriateness, Macro-F1 = 1.000):**
   - By tracking monotonic event sequences with inter-action latency ($\Delta t$) and step identifiers, EGEA dynamically adjusts its scaffolding tier.
   - It respects the learner's cognitive state: slowing down guessers, providing worked examples to stuck learners, and stepping back (`REDUCE_GUIDANCE`) when learners demonstrate mastery streaks.

4. **Real-Time Performance:**
   - EGEA evaluates in an average of **0.075 ms** ($75\ \mu\text{s}$) with a 95th percentile of **0.181 ms** ($181\ \mu\text{s}$).
   - This is **over 25x faster** than the 5.0 ms ceiling, ensuring that adaptive reasoning can execute in real-time inside the 60 FPS / 16.6 ms WebXR animation loop without causing frame drops or camera stutter.
