# Research Limitations & Threat Analysis

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Version:** 1.0.0 (Phase 12 Hardening)  

---

## 1. Empirical Scope Limitations

1. **No Human Participant Data Collected Yet:**
   - The current project has completed automated software verification, algorithmic correctness testing (798 tests across 10 suites), and integration testing.
   - It has **not** conducted clinical, educational, or human-subject trials. No empirical educational gain, learning acceleration, or statistical superiority is claimed.
2. **Institutional Ethics & IRB Review Pending:**
   - Formal IRB/ethics application and participant recruitment protocols are designed, but pending submission and institutional approval.
3. **Physical Mobile AR Validation Pending:**
   - Handheld WebXR camera passthrough, physical lighting tracking, and real-world surface anchoring have been verified via software contracts, desktop WebXR simulations, and Three.js 3D fallbacks.
   - Empirical validation on physical smartphone hardware remains pending.

---

## 2. Methodological & Design Limitations

4. **Confounded Multi-Intervention Evaluation:**
   - The primary two-arm experimental comparison (Condition A vs Condition B) tests the **complete integrated framework** (adaptive learner model $+$ generative AI $+$ interactive 3D/AR).
   - Any observed variance cannot be attributed uniquely to generative AI, spatial AR, or adaptive difficulty in isolation without conducting the pre-specified 4-arm ablation study.
5. **Learner Model Heuristic Nature:**
   - The learner model's mastery and confidence formulas are deterministic, rule-based mathematical models calibrated through educational domain expertise.
   - They represent an operational computational model, not a psychometrically validated item-response theory (IRT) or Bayesian Knowledge Tracing (BKT) parameterization.
6. **Curriculum Breadth vs AR Demonstration Depth:**
   - While the framework provides a unified deterministic architecture across 20 topics, genuine WebXR AR camera passthrough is demonstrated on the canonical Binary Search Tree (1 topic: `AR_READY`).
   - 17 topics feature interactive 3D visualization (`3D_READY`), and 2 topics (`ds-hash-table` and `algo-merge-sort`) feature 2D structural visualization (`2D_READY`).

---

## 3. Technical & Environmental Limitations

7. **Hardware & WebXR Device Constraints:**
   - WebXR Augmented Reality (`immersive-ar`) requires an ARCore-compatible Android device running Google Chrome or an iOS device with a specialized WebXR viewer.
   - In non-WebXR environments, the application falls back to Interactive 3D Mode, which does not provide real-world camera blending.
8. **Ambient Lighting & Surface Texture Dependence:**
   - Physical surface hit-testing requires adequate ambient lighting ($\ge 300$ lux) and textured, non-reflective horizontal surfaces.
9. **Generative LLM Latency & Availability:**
   - When configured with live Gemini cloud endpoints, pedagogical response times depend on network latency.
   - The application provides local mock fallbacks to guarantee uninterrupted interactive practice, but offline hints do not exhibit dynamic LLM variation.
