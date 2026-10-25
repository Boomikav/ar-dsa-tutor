# AR-DSA Tutor — Requirements Traceability Matrix

**Project:** AR-DSA Tutor  
**Standard:** IEEE 830 / ISO/IEC/IEEE 29148 Traceability Standard  
**Status:** 100% Traceable & Verified  

---

## 1. Traceability Matrix

| Req ID | Requirement Description | Implementation Files | Verification Test Suites | Status |
|---|---|---|---|:---:|
| **REQ-AR-01** | Unified WebXR AR session lifecycle (`immersive-ar`, hit-test, camera orientation) | `src/services/ar/WebXRARService.ts`, `src/services/ar/IARService.ts` | `test/arVerification.ts`, `test/mobileARValidationVerification.ts` | VERIFIED |
| **REQ-AR-02** | Graceful 3D canvas fallback when WebXR is unsupported | `src/services/ar/WebXRARService.ts`, `src/components/AROverlay.tsx` | `test/arVerification.ts`, `test/phase13MobileDeploymentVerification.ts` | VERIFIED |
| **REQ-AR-03** | Shared algorithm visualizer lifecycle (mount, update, reset, dispose) | `src/services/ar/IARAlgorithmVisualizer.ts`, `src/screens/ARSessionScreen.tsx` | `test/arCompositionVerification.ts`, `test/arFiveAlgorithmsVerification.ts` | VERIFIED |
| **REQ-AR-04** | Binary Search Tree spatial visualization (upright, 3D nodes, branches, search/insert) | `src/services/ar/ThreeBSTVisualizer.ts`, `src/services/dsa/bst/` | `test/arFiveAlgorithmsVerification.ts`, `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-AR-05** | Bubble Sort spatial visualization (array bars, comparisons, swap arcs, auto-play) | `src/services/ar/ThreeBubbleSortVisualizer.ts`, `src/services/dsa/sorting/BubbleSortEngine.ts` | `test/arFiveAlgorithmsVerification.ts`, `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-AR-06** | Binary Search spatial visualization (array blocks, pointers L/M/R, eliminate half, auto-play) | `src/services/ar/ThreeBinarySearchVisualizer.ts`, `src/services/dsa/searching/BinarySearchEngine.ts` | `test/arFiveAlgorithmsVerification.ts`, `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-AR-07** | Breadth-First Search spatial visualization (3D graph, visited glow, queue shelf, auto-play) | `src/services/ar/ThreeBFSVisualizer.ts`, `src/services/dsa/graphAlgorithms/BFSEngine.ts` | `test/arFiveAlgorithmsVerification.ts`, `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-AR-08** | Stack Data Structure spatial visualization (cylindrical base, stack blocks, LIFO push/pop, capacity limit 5) | `src/services/ar/ThreeStackVisualizer.ts`, `src/services/dsa/stack/StackEngine.ts` | `test/arFiveAlgorithmsVerification.ts`, `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-AR-09** | Interactive mobile AR HUD controls without camera obstruction | `src/screens/ARSessionScreen.tsx`, `src/theme/tokens.css` | `test/arUXHardeningVerification.ts`, `test/phase12FinalHardeningVerification.ts` | VERIFIED |
| **REQ-AR-10** | Resource cleanup on algorithm switch (geometries, materials, textures disposed) | `src/services/ar/IARAlgorithmVisualizer.ts`, `src/screens/ARSessionScreen.tsx` | `test/arFiveAlgorithmsVerification.ts`, `test/arCompositionVerification.ts` | VERIFIED |
| **REQ-CURR-01** | Strict curriculum honesty (5 AR topics marked `hasArModel: true`, 15 others marked `false`) | `src/data/topicsData.ts`, `src/components/TopicCard.tsx` | `test/arNavigationRegression.ts`, `test/arFiveAlgorithmsVerification.ts` | VERIFIED |
| **REQ-CURR-02** | Dedicated AR-Ready filter and discovery carousel | `src/screens/TopicExplorerScreen.tsx`, `src/screens/HomeScreen.tsx` | `test/arNavigationRegression.ts`, `test/appExperienceVerification.ts` | VERIFIED |
| **REQ-DSA-01** | Deterministic DSA engine registry with invariant validation across all 20 topics | `src/services/dsa/core/DSARegistry.ts`, `src/services/dsa/*` | `test/dsaExpansionVerification.ts` | VERIFIED |
| **REQ-EGEA-01** | Strongly-typed EGEA event schema with monotonic ordering and schema validation | `src/services/research/egea/EGEAEventSchema.ts` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EGEA-02** | Deterministic event adapter mapping interactive steps to validated events | `src/services/research/egea/EGEAEventAdapter.ts` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EGEA-03** | Pure deterministic adaptation policy engine with 6 intervention classes & structured rationales | `src/services/research/egea/EGEAPolicyEngine.ts` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EGEA-04** | Pedagogical baselines (Generic Fixed Hint & Simple Current-Error Rule) | `src/services/research/egea/EGEABaselines.ts` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EVAL-01** | Multi-scenario evaluation benchmark across 7 scenario families | `src/services/research/egea/EGEAEvaluationHarness.ts`, `scripts/run_egea_benchmark.ts` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EVAL-02** | Machine-readable benchmark report generation (`egea_evaluation_report.json`) | `scripts/run_egea_benchmark.ts`, `research-results/` | `test/egeaEvaluationVerification.ts` | VERIFIED |
| **REQ-EVAL-03** | Strict zero-fabrication research reporting (simulation vs physical tests separated) | `docs/FINAL_REVIEW_BASELINE.md`, `docs/RESEARCH_LIMITATIONS.md` | `test/researchEvaluationVerification.ts` | VERIFIED |
| **REQ-MOBILE-01** | PWA manifest and mobile viewport compliance (safe area insets, touch target >= 44px) | `public/manifest.json`, `index.html`, `src/theme/tokens.css` | `test/phase13MobileDeploymentVerification.ts` | VERIFIED |
| **REQ-MOBILE-02** | Cross-platform migration specification to Unity / ARCore | `docs/UNITY_MIGRATION_SPEC.md` | Inspection audit | VERIFIED |
| **REQ-SEC-01** | Client-side security and zero secret exposure in production distribution | `scripts/audit_dist.js`, `.env.example` | `test/phase12FinalHardeningVerification.ts` | VERIFIED |
| **REQ-DOC-01** | Conference-grade research documentation (Method, Event Schema, Taxonomy, Limitations) | `docs/EGEA_METHOD.md`, `docs/EGEA_EVENT_SCHEMA.md`, `docs/INTERVENTION_TAXONOMY.md` | Inspection audit | VERIFIED |
| **REQ-DOC-02** | Reproducibility specification and scripted demo walkthrough | `docs/REPRODUCIBILITY.md`, `docs/FINAL_DEMO_SCRIPT.md` | Inspection audit | VERIFIED |
