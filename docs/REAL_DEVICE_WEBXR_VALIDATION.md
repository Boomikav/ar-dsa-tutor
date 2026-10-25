# AR-DSA Tutor — Real-Device Physical WebXR Validation Protocol

**Document Version:** 1.0.0  
**Status:** Protocol Formulated — Physical Execution **NOT RUN (Simulation Verified Only)**  
**Target Hardware:** Google ARCore Compatible Handheld Android Devices (Pixel 6/7/8/9, Galaxy S22/S23/S24)  
**Target Software:** Google Chrome for Android v110+ on Android 12+  

---

## 1. Execution Boundary & Anti-Fabrication Notice

> [!IMPORTANT]
> In accordance with academic research integrity and the non-negotiable rules of this project:
> **No physical Android device was attached to the current automated workstation.**
> All 16 automated test suites were executed in Node.js / headless Three.js simulation environments. 
> Therefore, all physical-device test steps below are documented with their exact execution procedure, expected behavior, and pass/fail criteria, while their physical status is transparently marked as **NOT RUN / PENDING PHYSICAL HARDWARE DEPLOYMENT**.
> **Simulated headless tests must NEVER be reported as physical device verification.**

---

## 2. Test Environment Setup & Prerequisites

| Requirement | Specification | Verification Method |
|---|---|---|
| **Secure Origin (HTTPS)** | Required by W3C WebXR Device API | HTTPS on production host (`https://ar-three-mu.vercel.app/`) or ADB reverse tunnel (`adb reverse tcp:5173 tcp:5173`) |
| **ARCore Services** | Google Play Services for AR v1.40+ | Check Android Settings -> Apps -> Google Play Services for AR |
| **Browser Flags** | Chrome flags: `#webxr`, `#webxr-hit-test` | `chrome://flags` default enabled on Chrome 110+ |
| **Lighting & Texture** | Even indoor lighting (> 300 lux), textured floor/desk | Avoid reflective glass, monochrome white tables |

---

## 3. Physical Test Protocol Matrix

| Step ID | Test Procedure | Expected Physical Behavior | Evidence to Capture | Physical Status |
|---|---|---|---|:---:|
| **DEV-01: Compatibility** | Navigate to app URL on mobile Chrome | System queries `navigator.xr.isSessionSupported('immersive-ar')` -> returns true; "Launch AR" buttons visible | Console log screenshot | NOT RUN |
| **DEV-02: Permission & Startup** | Tap "Launch AR Session" on BST | Browser displays system modal: *"Allow Chrome to use your camera?"*. Granting permission immediately starts camera passthrough without black frames | Screen recording of permission prompt | NOT RUN |
| **DEV-03: Surface Detection** | Move device slowly over textured desk / floor | Reticle ring (`XRHitTestSource`) appears within 2–5 seconds, orienting coplanar with physical desk | Photo of reticle tracking surface | NOT RUN |
| **DEV-04: Anchoring & Elevation** | Tap reticle on desk surface | BST 3D model anchors $+0.02\text{m}$ ($2\text{cm}$) above desk. No z-fighting with table texture. Tree faces viewer's azimuth | Photograph showing upright orientation | NOT RUN |
| **DEV-05: Tracking Stability** | Walk around placed 3D model (180° orbit, $\pm 0.5\text{m}$ elevation change) | 3D algorithm elements remain stationary relative to physical room features; drift $< 2\text{cm}$ over 60 seconds | Video of camera orbit around tree | NOT RUN |
| **DEV-06: Five Algorithms** | Switch between BST, Bubble Sort, Binary Search, BFS, and Stack via HUD | Each visualizer appears upright in identical anchor pose. Mesh scales fit within $0.5\text{m} \times 0.5\text{m}$ footprint | 5 distinct photos of algorithms on table | NOT RUN |
| **DEV-07: Hot-Switching** | Change algorithm while session is active | Previous visualizer unmounts, new visualizer mounts without camera stutter, without dropping session, without re-prompting permission | Video showing smooth in-session switch | NOT RUN |
| **DEV-08: Touch & HUD** | Tap interactive buttons (Traverse, Swap, etc.) on HUD | Touch targets respond promptly ($\ge 44\text{px}$). Bottom HUD does not overlap gesture navigation bar | Screenshot of active HUD in AR | NOT RUN |
| **DEV-09: Tracking Loss** | Cover camera lens with hand for 3 seconds, then uncover | Tracking state transitions to `EXCESSIVE_MOTION` or `PAUSED`; restores gracefully to `TRACKING` upon uncover | Video of occlusion recovery | NOT RUN |
| **DEV-10: Clean Exit** | Tap "Exit AR" button in HUD | `XRSession.end()` terminates camera feed immediately; Three.js renderer restores 2D catalog view; zero memory leaks | Console log confirming session end | NOT RUN |
| **DEV-11: Fallback Mode** | Open URL on unsupported desktop or iOS Safari | App enters `CANVAS_3D_FALLBACK` with touch/mouse orbit controls; displays transparent fallback notification | Browser screenshot on desktop | VERIFIED (Sim) |
| **DEV-12: Repeated Sessions** | Launch and exit AR session 5 consecutive times | Memory consumption stable; no WebGL context loss errors; camera starts promptly on 5th launch | Chrome DevTools memory graph | NOT RUN |

---

## 4. Hardware Limitations & Known Failure Modes

1. **Featureless Surface Failure:** Point-cloud SLAM tracking fails on monochrome white melamine desks, glossy glass tables, and deep shadows. Expected behavior: Reticle remains scanning until textured surface is found.
2. **Thermal Throttling on Mobile:** Continuous 60 FPS WebXR camera passthrough generates significant heat on mobile SoCs (Snapdragon / Tensor). After 15–20 minutes, thermal throttling may drop frame rates from 60 FPS to 30 FPS.
3. **Scale Drift on Rapid Head Motion:** Rapid shaking or sudden jerky motion breaks visual-inertial odometry, leading to model drift.
