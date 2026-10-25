# AR-DSA Tutor — Research Claims to Evidence Traceability Map

**Document Version:** 2.1.0  
**Audit Baseline Commit:** `1ca6a12`  
**Purpose:** Maps every technical and scientific claim directly to reproducible code, tests, and raw outputs.  

---

## 1. Traceability Mapping Matrix

| Claim ID | Formal Claim | Source Implementation | Verifying Test Suite / Benchmark | Raw Output File | Exact Execution Command | Verification Status |
|---|---|---|---|---|---|:---:|
| **CLAIM-01** | 5 DSA algorithms execute in spatial 3D WebXR AR with upright orientation and plane hit-testing | `src/services/ar/WebXRARService.ts`, `ThreeBSTVisualizer.ts`, `ThreeBubbleSortVisualizer.ts`, `ThreeBinarySearchVisualizer.ts`, `ThreeBFSVisualizer.ts`, `ThreeStackVisualizer.ts` | `test/arFiveAlgorithmsVerification.ts`, `test/arCompositionVerification.ts` | Terminal test summary | `npx tsx scripts/run_all_tests.ts` | **SUPPORTED (Simulation Verified)** |
| **CLAIM-02** | Switching between the 5 algorithms reuses a single WebXR session without camera drop or GPU memory leaks | `src/services/ar/WebXRARService.ts` (`setActiveAlgorithm`, `disposeSession`) | `test/arCompositionVerification.ts` (50 switch leak test) | Terminal test summary | `npx tsx test/arCompositionVerification.ts` | **SUPPORTED (Simulation Verified)** |
| **CLAIM-03** | 20 DSA topics possess deterministic state engines enforcing mathematical invariants | `src/services/dsa/*` (`DSARegistry.ts`) | `test/dsaExpansionVerification.ts` (362 tests) | Terminal test summary | `npx tsx test/dsaExpansionVerification.ts` | **SUPPORTED (Fully Verified)** |
| **CLAIM-04** | Unsupported devices automatically transition to `CANVAS_3D_FALLBACK` with touch orbit controls | `src/services/ar/WebXRARService.ts` | `test/phase13MobileDeploymentVerification.ts`, `test/arVerification.ts` | Terminal test summary | `npx tsx test/phase13MobileDeploymentVerification.ts` | **SUPPORTED (Fully Verified)** |
| **CLAIM-05** | EGEA enforces strongly typed interaction events with monotonic ordering and error classification | `src/services/research/egea/EGEAEventSchema.ts`, `EGEAEventAdapter.ts` | `test/egeaEvaluationVerification.ts` | Terminal test summary | `npx tsx test/egeaEvaluationVerification.ts` | **SUPPORTED (Fully Verified)** |
| **CLAIM-06** | EGEA evaluates interaction trajectories in steady-state mean time $< 0.01\text{ms}$ ($< 10\mu\text{s}$) | `src/services/research/egea/EGEAPolicyEngine.ts` | `scripts/measure_empirical_latency.ts` (N=1000 after 200 warm-up) | Terminal benchmark table | `npx tsx scripts/measure_empirical_latency.ts` | **SUPPORTED (Desktop x64 Verified)** |
| **CLAIM-07** | EGEA differentiates impulsive guessing from deliberate reflection and persistent impasse | `src/services/research/egea/EGEAPolicyEngine.ts` | `scripts/evaluate_independent_challenge_set.ts` (18 scenarios) | `research-results/engineering_challenge_suite_report.json` | `npx tsx scripts/evaluate_independent_challenge_set.ts` | **SUPPORTED (18 Challenge Cases)** |
| **CLAIM-08** | EGEA achieves superior instructional appropriateness over Fixed Hint and Simple Error Rule baselines | `src/services/research/egea/EGEABaselines.ts` | `scripts/evaluate_independent_challenge_set.ts` | `research-results/engineering_challenge_suite_report.json` | `npx tsx scripts/evaluate_independent_challenge_set.ts` | **SUPPORTED WITH LIMITATIONS** (Baselines are stateless by design) |
| **CLAIM-09** | Production client distribution contains zero API keys, private tokens, or credential leaks | `scripts/audit_dist.js` | `node scripts/audit_dist.js` | Terminal scan output | `node scripts/audit_dist.js` | **SUPPORTED (0 Leaks Verified)** |
| **CLAIM-10** | Physical Android phone camera passthrough and plane SLAM verified on real device | N/A (requires hardware) | `docs/REAL_DEVICE_WEBXR_VALIDATION.md` | N/A (no hardware attached) | N/A | **NOT RUN / UNVERIFIED (Hardware Unavailable)** |
| **CLAIM-11** | AR-DSA Tutor improves student exam scores or normalized learning gain ($g$) | N/A (requires human study) | `docs/EXPERIMENTAL_PROTOCOL.md` (Protocol design) | N/A (no human study executed) | N/A | **NOT SUPPORTED (Future IRB Study Required)** |
| **CLAIM-12** | Native Android APK or Unity binary built and published | `docs/UNITY_MIGRATION_SPEC.md`, `docs/ANDROID_RELEASE_CHECKLIST.md` | Inspection audit | N/A (only specs exist) | N/A | **NOT SUPPORTED (Specification Only)** |
| **CLAIM-13** | EGEA outperforms a history-aware matched baseline that lacks step-level persistence tracking | `src/services/research/egea/EGEAMatchedHistoryBaseline.ts` | `scripts/evaluate_failure_mode_benchmark.ts` | `research-results/failure_mode_benchmark_report.json` | `npx tsx scripts/evaluate_failure_mode_benchmark.ts` | **SUPPORTED (100% vs 83.3% Accuracy on 18 Challenge Cases)** |
| **CLAIM-14** | EGEA's 4 documented failure modes (EDGE-01 to EDGE-04) are resolved via EWMA, jitter filtering, canonicalization, and hint telemetry | `EGEAPacingModel.ts`, `EGEAStepCanonicalizer.ts`, `EGEAEventAdapter.ts`, `EGEAPolicyEngine.ts` | `test/egeaHardeningPhase2Verification.ts`, `scripts/evaluate_failure_mode_benchmark.ts` | `research-results/failure_mode_benchmark_report.json` | `npx tsx scripts/evaluate_failure_mode_benchmark.ts` | **SUPPORTED (100% Agreement on Counterexamples)** |
| **CLAIM-15** | EGEA maintains algorithmic consistency across targeted boundary stress trajectories | `src/services/research/egea/EGEAHeldOutEvaluationSuite.ts` | `scripts/evaluate_held_out_suite.ts` (12 scenarios) | `research-results/held_out_evaluation_report.json` | `npx tsx scripts/evaluate_held_out_suite.ts` | **SUPPORTED ON SYNTHETIC BENCHMARK (100% vs 75% for Matched History; real-world human telemetry pending trial)** |
| **CLAIM-16** | All 17 verification test suites execute cleanly with 1,403 assertions passing | `test/*.ts` | `scripts/run_all_tests.ts` | Terminal test summary | `npx tsx scripts/run_all_tests.ts` | **SUPPORTED (1,403 / 1,403 Assertions Passed)** |

---

## 2. Claims That Must NOT Be Made in Conference Submissions

1. **"The system is proven to increase student learning gains."** (No empirical human participant study was run).
2. **"The system has been verified on physical Android hardware across multiple manufacturers."** (All automated tests ran in Node.js / Three.js simulation; physical hardware was not connected).
3. **"EGEA was evaluated by an independent panel of human educational experts."** (The challenge suite was authored as an engineering challenge suite using published pedagogical rubrics; no external human panel was recruited).
4. **"A native mobile app or Unity package is available for download."** (Only the WebXR PWA web application is implemented; Unity/APK are migration blueprints).
5. **"EGEA guarantees 60 FPS mobile WebXR rendering."** (Microsecond latency profiles pure JavaScript CPU execution; mobile GPU fill rates and draw calls govern final frame rates).
6. **"EGEA is an optimal or error-free pedagogical oracle."** (EGEA is a deterministic rule-based heuristic policy whose boundaries are characterized by empirical benchmarking).
