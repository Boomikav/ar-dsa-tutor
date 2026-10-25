# AR-DSA Tutor — Threats to Validity & Technical Limitations

**Document Version:** 1.0.0  
**Authors:** Academic Review & Systems Architecture Team  
**Review Standard:** ACM / IEEE Peer Review Criteria  

---

## 1. Threats to Validity

### 1.1 Construct Validity
- **Intervention Appropriateness Metric:** In both the synthetic benchmark and the independent challenge suite, "appropriateness" is defined relative to pedagogical rules grounded in Cognitive Load Theory and Scaffolding Fading. However, whether a `STEPWISE_SLOWDOWN` or a `WORKED_EXAMPLE` actually optimizes learning in a real human brain depends on individual student affect, prior knowledge, and spatial ability, which cannot be captured solely by rule-based rubrics.
- **Microsecond Latency vs Total Render Pipeline:** EGEA's decision latency was measured at $0.006\text{ms}$–$0.007\text{ms}$. While this proves that adaptive logic does not cause dropped frames ($< 16.6\text{ms}$), it does not account for Three.js geometry re-computation, texture upload, or optical camera passthrough pipeline overhead on mobile hardware.

### 1.2 Internal Validity
- **Scenario Circularity (Original 30 Scenarios):** The original 30 scenarios were engineered specifically to trigger known internal predicates of `EGEAPolicyEngine`. This threat has been transparently classified as an **internal software consistency verification**, not an empirical demonstration of superiority.
- **Baseline Asymmetry:** The two baselines (`FixedHintBaseline` and `SimpleErrorRuleBaseline`) are stateless by definition. Because they have zero memory of past events or inter-action latency ($\Delta t$), their inability to produce `STEPWISE_SLOWDOWN`, `WORKED_EXAMPLE`, or `PREREQUISITE_REVIEW` was mathematically predetermined. The comparison demonstrates the necessity of stateful history tracking, but does not represent a comparison against an independently developed competing ITS.

### 1.3 External Validity & Generalizability
- **Synthetic Trajectories vs Human Learners:** The 18 scenarios in the Independent Engineering Challenge Suite reflect realistic learning patterns, but they remain synthetically constructed. Real students may exhibit idiosyncratic behaviors (e.g., leaving the app idle for 5 minutes, clicking accidentally, or navigating between topics erratically).
- **Hardware Architecture Discrepancy:** Latency benchmarks were executed on desktop x86_64 CPUs running Node.js v24 (V8). Execution on mobile ARM64 SoCs (e.g., Snapdragon 7/8 series or Tensor) will experience lower clock speeds and potential thermal throttling.
- **Platform Fragmentation:** True WebXR immersive AR with camera passthrough is currently supported primarily on Google Chrome for Android with Google Play Services for AR (ARCore). iOS Safari lacks native WebXR device API support, falling back to 3D Canvas mode.

### 1.4 Conclusion Validity
- **Sample Size ($N = 18$):** The Independent Engineering Challenge Suite contains 18 carefully balanced scenarios (3 per intervention class). While each scenario tests critical boundary conditions, $N=18$ is a discrete test set with inherent sample size limitations.
- **Zero Human Subject Claims:** No claims of normalized learning gain ($g$), retention, or test score improvement are made in this release.

---

## 2. Identified Technical Limitations & System Boundaries

1. **No Registered Service Worker:** While `manifest.json` provides PWA metadata, no service worker is installed. Offline caching is not available, and Android Chrome will not display the native mini-infobar install banner.
2. **Physical Device Deployment Unexecuted:** The WebXR camera passthrough and hit-test loops have been verified in automated headless simulation and mock environments. Physical testing on physical hardware is marked as **NOT RUN**.
3. **No Native Mobile APK or Unity Binary:** Mobile delivery is currently via mobile web browser (WebXR PWA). Native Android APK packaging and Unity AR Foundation ports are documented as specifications, not compiled binaries.
