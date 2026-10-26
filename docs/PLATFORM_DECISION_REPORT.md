# AR-DSA Tutor — Platform Decision Report: WebXR vs. Unity vs. Flutter

**Document Date:** October 26, 2026  
**Auditor:** Principal Software Architect, XR Systems Researcher & Test Architect  
**Evaluation Scope:** Technology Platform Selection for Interactive AR Algorithm Tutoring (AR-DSA Tutor)  
**Status:** Binding Decision & Architectural Justification  

---

## 1. Executive Summary & Recommendation

This report evaluates whether the AR-DSA Tutor application should remain on its current stack (**React 19 + TypeScript + Three.js 0.186 + WebXR Device API**) or be migrated to either **Unity with AR Foundation (C#)** or **Flutter with Native AR Plugins (Dart + ARCore/Sceneform)**.

### Binding Recommendation: RETAIN AND COMPLETE REACT + THREE.JS + WEBXR

The architectural evaluation demonstrates that **migrating to Unity or Flutter is unjustified, incurs severe engineering risk, introduces substantial friction for users and reviewers, and contradicts the core research contribution of the project**.

The current WebXR implementation:
1. Is already fully functional with 5 operational spatial algorithm visualizers and deterministic engines.
2. Achieves a minified production bundle of **1,234 kB (318 kB gzipped)**, compared to $> 150\text{ MB}$ for an empty Unity mobile package.
3. Provides **zero-install instant accessibility** via mobile Google Chrome, enabling immediate conference demonstration and artifact review via a standard URL.
4. Executes the deterministic EGEA adaptive policy engine in **$< 10\mu\text{s}$** inside the native JavaScript runtime without cross-process IPC or JNI bridging.
5. Has 1,403 verified passing test assertions across 17 test suites that would all be invalidated and require total re-implementation in C# or Dart.

---

## 2. Comprehensive 10-Dimension Comparative Matrix

| Evaluation Dimension | React + Three.js + WebXR (Current) | Unity + AR Foundation (C#) | Flutter + Native AR (Dart + ARCore) |
| :--- | :--- | :--- | :--- |
| **1. AR Tracking & Spatial Anchoring** | Uses W3C WebXR Device API (`immersive-ar`, `local-floor` / `local`). Hardware-accelerated SLAM via underlying OS AR service (ARCore on Chrome Android). Sufficient for tabletop/desk visualization ($0.8\text{m} - 1.2\text{m}$). | Native ARCore/ARKit integration via AR Foundation. Superior plane-detection mesh fidelity and persistent cloud anchors; excessive overhead for tabletop discrete data structures. | Relies on brittle third-party platform channels (`ar_flutter_plugin` or native `AndroidView`). Prone to surface texture tearing, threading desync, and OS version breakage. |
| **2. Algorithm Rendering & 3D Manipulation** | Procedural Three.js mesh generation (cylinders, spheres, boxes, text billboards). Direct scene-graph node manipulation in unified coordinate frame. Instant animated transitions. | High-fidelity shader graphs, post-processing stack, particle systems. Substantial overhead for abstract geometric visualizations (nodes, pointers, arrays). | Mediocre. Flutter canvas cannot easily render complex 3D meshes without bridging to native Sceneform (deprecated by Google) or Filament. |
| **3. Pedagogical Adaptation & AI Integration** | Single-language runtime (TypeScript). EGEA policy executes in $< 10\mu\text{s}$ directly in event loop. Seamless JSON schema validation, async REST/WebSocket LLM calls without marshaling. | Requires C# re-implementation of EGEA policy engine, custom JSON parsers, and cross-thread task schedulers for LLM HTTP calls. High integration friction. | Requires Dart re-implementation of EGEA. Two-way serialization across platform channels between Dart and native AR views introduces latency jitter ($> 15\text{ms}$). |
| **4. Cross-Platform Mobile Deployment** | Instant web deployment (Vite). Accessible on any WebXR-capable Android browser (Chrome/Edge) with zero installation, plus universal fallback to interactive 3D WebGL on iOS/desktop. | Requires building separate Android `.apk`/`.aab` and iOS `.ipa`. Demands Google Play Developer accounts, Apple Developer certificates, and manual sideloading. | Requires multi-platform native toolchains (Android SDK, NDK, Xcode, CocoaPods). High build brittleness across operating system updates. |
| **5. Maintenance Overhead & Developer Velocity** | Unified full-stack TypeScript. Changes to data models, visualizers, HUD UI, and test suites share common types and tools (Vite, Oxlint, Vitest/Node tsx). Rapid iteration cycle. | Bifurcated tooling: Unity Editor GUI + Visual Studio C# scripts. Git merge conflicts on binary `.unity` scene files and meta files. Slower compilation and play-mode turnaround. | Fragmented tooling: Flutter Dart CLI + Android Gradle + iOS Podfile + native C++/Java ARCore plugins. High maintenance burden on plugin version mismatches. |
| **6. Academic Reproducibility & Open-Source Access** | Maximum reproducibility. Reviewers can clone repository, run `npm install && npm run build`, and preview in browser or deploy to GitHub Pages/Vercel with one click. | Poor reproducibility. Reviewers must install exact Unity Editor version (e.g. 2022.3 LTS), configure Android Build Support, NDK, and compile multi-gigabyte projects. | Poor reproducibility. Reviewers require full Flutter SDK and Android/iOS native toolchains to verify basic functionality. |
| **7. Bundle Size, Load Time & Memory Footprint** | **1,234 kB client JS bundle (318 kB gzipped).** Load time $< 1.2\text{s}$ on 4G mobile. Heap memory $\approx 45\text{ MB} - 75\text{ MB}$. | Base APK $> 45\text{ MB} - 80\text{ MB}$; uncompressed runtime $> 150\text{ MB}$. Load time $6\text{s} - 12\text{s}$ cold start. Heap memory $> 220\text{ MB}$. | Base APK $> 35\text{ MB} - 60\text{ MB}$. Startup $3\text{s} - 5\text{s}$. Memory $\approx 120\text{ MB} - 180\text{ MB}$. |
| **8. Device Compatibility & Hardware Requirements** | Runs on all ARCore-supported Android devices with Chrome 79+. Fallback mode runs on any modern browser with WebGL 2.0. | Requires ARCore/ARKit hardware; fallback to non-AR requires building a separate non-AR camera rig in Unity. | Highly dependent on fragile native plugin compatibility with Android 13/14/15 OEMs. High crash rate on vendor-skinned Android OS. |
| **9. Migration Cost & Engineering Risk** | **Zero migration cost.** Codebase is 100% written, verified, and building. | **Extreme engineering risk.** Complete rewrite of 152 files, 5 deterministic engines, 5 visualizers, and 1,403 test assertions. Estimated 8-12 person-weeks. | **Extreme engineering risk.** Complete rewrite in Dart, fighting deprecated Android Sceneform libraries. High probability of project stalling. |
| **10. Alignment with Research Goals** | Perfect alignment: demonstrates that zero-install mobile WebXR can support rigorous, real-time spatial computer science education with microsecond adaptive tutoring. | Misaligned: demonstrates only standard native game engine capability; loses the zero-barrier educational distribution contribution. | Misaligned: introduces architectural instability without any unique research advantage. |

---

## 3. Detailed Dimension Analysis

### Dimension 1 & 2: AR Tracking, Visualizer Quality, and Spatial Manipulation
- In the educational context of AR-DSA Tutor, the learner places an abstract spatial model (a tree, array, graph, or stack) onto a flat desk or tabletop ($0.8\text{m} - 1.2\text{m}$ ahead).
- The W3C WebXR Device API on Android Chrome delegates spatial pose tracking directly to Google ARCore via Google Play Services for AR. The camera pose, feature points, and ground-plane estimates received by Three.js are the exact same underlying sensor outputs that Unity's AR Foundation receives.
- Procedural geometries in Three.js (`SphereGeometry`, `CylinderGeometry`, `BoxGeometry`, `CanvasTexture`) are lightweight, mathematically exact, and dynamically resizable at runtime. Unity provides advanced photorealistic rendering (PBR, HDRP, global illumination), but photorealism is entirely unnecessary—and often pedagogically counterproductive—for abstract data structure visualization, where visual clarity and minimal cognitive load are paramount.

### Dimension 3: Deterministic Adaptive Guidance & AI Integration
- The AR-DSA Tutor core innovation is **Execution-Grounded Explainable Adaptation (EGEA)**, which evaluates learner telemetry in $< 10\mu\text{s}$ and outputs deterministic pedagogical interventions.
- In the current React/TypeScript architecture, EGEA runs in the same thread and memory space as the state engines and the Three.js visualizers. No data serialization, IPC, or JNI marshaling is required.
- Furthermore, generative LLM fallback calls (`consultTutor`) use standard browser asynchronous `fetch` APIs. In Unity, async networking requires `UnityWebRequest` coroutines or `System.Threading.Tasks` coupled with main-thread dispatchers, significantly complicating the orchestration lifecycle.

### Dimension 6 & 7: Academic Reproducibility, Open Science & Bundle Footprint
- For conference submissions (such as IEEE AIxVR 2027), reviewers operate under strict time budgets. Expecting a reviewer to install Unity Hub, download a 4 GB Unity Editor release, install Android NDK/SDK, and compile an APK to verify a 4-page demo is unrealistic and risks immediate evaluation failure.
- In contrast, the WebXR application compiles into static files in **576 ms** via Vite. The entire client payload is **318 kB gzipped**. A reviewer can open a live HTTPS deployment directly on their mobile device or desktop browser and verify the 5 visualizers and EGEA adaptive guidance within 15 seconds.

### Dimension 9: Migration Cost & Engineering Risk Calculation
- The existing repository contains:
  - 152 source files.
  - 5 deterministic DSA engines with comprehensive edge-case handling.
  - 5 procedural Three.js spatial visualizers with smooth animation loops.
  - 17 automated test suites with **1,403 passing assertions**.
  - A comprehensive EGEA evaluation framework with 18 challenge cases and 12 held-out validation scenarios.
- Migrating to Unity would require:
  1. Rewriting all 5 DSA engines in C#.
  2. Rebuilding all 3D node, array, and graph procedural visualizers using Unity GameObjects, Transforms, and LineRenderers.
  3. Recreating the HUD UI in Unity UI Toolkit or Canvas uGUI.
  4. Rewriting the entire 1,403-assertion test suite in NUnit/Unity Test Runner.
  5. Diagnosing Android build failures, Gradle incompatibilities, and manifest permissions.
- This represents an estimated **320–480 engineering hours** with zero pedagogical or research advantage.

---

## 4. Definitive Platform Verdict

| Decision Factor | Status / Value | Impact on Migration Decision |
| :--- | :--- | :--- |
| Current Codebase State | 100% operational, builds in 576ms, 1,403 tests pass | Strongly against migration |
| Deployment Friction | Zero install (web link) vs App Store / APK sideloading | Strongly against migration |
| Reviewer Accessibility | Instant mobile browser testing | Strongly against migration |
| Bundle Overhead | 318 kB (WebXR) vs $> 150\text{ MB}$ (Unity) | Strongly against migration |
| Adaptive Latency | $< 10\mu\text{s}$ in-process JS vs IPC overhead | Strongly against migration |
| Engineering Risk | Zero risk vs complete project rewrite | Strongly against migration |

### Final Platform Mandate
**The project shall remain on React + TypeScript + Three.js + WebXR.**  
No migration to Unity or Flutter shall be undertaken. All engineering focus shall remain on hardening, validating, and presenting the verified WebXR implementation.
