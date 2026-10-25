# Mobile AR Physical Device Validation Checklist (Phase 13)

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Version:** Phase 13 Hardened Deployment  
**Status:** `PENDING PHYSICAL TEST` (Awaiting physical mobile device execution)

---

## 1. Physical Device Verification Ledger

Use this ledger to record actual execution on a physical smartphone (e.g., Google Pixel, Samsung Galaxy, or iPhone with WebXR Viewer):

| Test ID | Checklist Item | Status | Result | Date | Evidence Ref |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **AR-01** | Open application on physical device over HTTPS | `PENDING PHYSICAL TEST` | — | — | `AR-01-app-launch/` |
| **AR-02** | Enter BST AR session & verify camera permission | `PENDING PHYSICAL TEST` | — | — | `AR-02-ar-session/` |
| **AR-03** | Verify optical camera passthrough feed | `PENDING PHYSICAL TEST` | — | — | `AR-03-camera/` |
| **AR-04** | Scan real-world horizontal surface | `PENDING PHYSICAL TEST` | — | — | `AR-04-surface-detection/` |
| **AR-05** | Verify surface hit-test reticle alignment | `PENDING PHYSICAL TEST` | — | — | `AR-04-surface-detection/` |
| **AR-06** | Place BST via surface hit-test placement | `PENDING PHYSICAL TEST` | — | — | `AR-05-placement/` |
| **AR-07** | Move phone in 8 directions; verify 6DoF stability | `PENDING PHYSICAL TEST` | — | — | `AR-06-tracking/` |
| **AR-08** | Interact with BST via touch controls | `PENDING PHYSICAL TEST` | — | — | `AR-07-interaction/` |
| **AR-09** | Trigger intentional incorrect decision (RIGHT at node 50) | `PENDING PHYSICAL TEST` | — | — | `AR-07-interaction/` |
| **AR-10** | Verify AI Tutor HUD response & guidance | `PENDING PHYSICAL TEST` | — | — | `AR-08-ai-tutor/` |
| **AR-11** | Complete correct operations (LEFT to 30, RIGHT to 40) | `PENDING PHYSICAL TEST` | — | — | `AR-07-interaction/` |
| **AR-12** | Exit and resume AR session cleanly | `PENDING PHYSICAL TEST` | — | — | `AR-09-lifecycle/` |
| **AR-13** | Verify Interactive 3D fallback on non-AR devices/topics | `PENDING PHYSICAL TEST` | — | — | `AR-09-lifecycle/` |

---

## 2. Detailed Test Item Specifications

### AR-01: Open Application on Physical Device
* **Precondition:** Device connected via trusted HTTPS URL or Chrome USB port forwarding (`http://localhost:3001/`).
* **Pass Criteria:** App shell renders responsively without horizontal scrolling; Profile screen indicates `Secure Context: Active (Secure)`.
* **Logging Format:**
  ```text
  Device: <Model>
  OS: <Android/iOS Version>
  Browser: <Chrome/Safari Version>
  Date: <YYYY-MM-DD>
  Result: PASS / FAIL
  Observed Behavior: <Notes>
  Evidence: <Log or screenshot filename>
  ```

### AR-02: Enter BST AR Session
* **Precondition:** AR-01 passed.
* **Pass Criteria:** Tapping "3D AR Practice" launches session; browser native camera prompt appears; granting permission transitions state machine to `SCANNING`.
* **Logging Format:** Same as AR-01.

### AR-03: Verify Camera Passthrough
* **Precondition:** AR-02 passed.
* **Pass Criteria:** Live physical room view renders smoothly behind the transparent WebGL canvas; zero video frame uploads or telemetry leaks.
* **Logging Format:** Same as AR-01.

### AR-04: Scan Real-World Surface
* **Precondition:** AR-03 passed; flat horizontal desk/table present.
* **Pass Criteria:** Panning phone over surface triggers `XRHitTestSource`; session state advances to `SURFACE_DETECTED`.
* **Logging Format:** Same as AR-01.

### AR-05: Verify Hit-Test Reticle
* **Precondition:** AR-04 passed.
* **Pass Criteria:** Circular targeting ring aligns coplanar with the physical desk surface and tracks camera position in real time.
* **Logging Format:** Same as AR-01.

### AR-06: Place BST via Surface Hit-Test Placement
* **Precondition:** AR-05 passed.
* **Pass Criteria:** Tapping screen anchors canonical BST (nodes 50, 30, 70, 20, 40) at the hit-test pose in reference space; state transitions to `PLACED` -> `TRACKING`.
* **Logging Format:** Same as AR-01.

### AR-07: 6DoF Spatial Stability (8 Directions)
* **Precondition:** AR-06 passed.
* **Pass Criteria:** Physical movement across 8 directions (left, right, forward, backward, pitch/yaw tilt, close, far, pan-re-entry) maintains spatial stability with minimal drift (< 5cm).
* **Logging Format:** Same as AR-01.

### AR-08: Interact with BST via Touch Controls
* **Precondition:** AR-07 passed.
* **Pass Criteria:** Active node (50) glows with cyan target highlight; on-screen decision buttons respond promptly to touch.
* **Logging Format:** Same as AR-01.

### AR-09: Intentional Incorrect BST Decision
* **Precondition:** Target = 40, active node = 50.
* **Pass Criteria:** Choosing **RIGHT** is authoritatively rejected by `BSTPracticeEngine`; active node remains locked at 50; misconception is diagnosed as `BST_WRONG_DIRECTION`.
* **Logging Format:** Same as AR-01.

### AR-10: Verify AI Tutor Response
* **Precondition:** AR-09 triggered.
* **Pass Criteria:** ARTutorHUD displays contextual pedagogical explanation reinforcing the BST ordering invariant without mutating engine state.
* **Logging Format:** Same as AR-01.

### AR-11: Complete Correct Operation
* **Precondition:** Active node = 50, target = 40.
* **Pass Criteria:** Choosing **LEFT** advances active pointer to node 30; choosing **RIGHT** at node 30 completes insertion with success feedback.
* **Logging Format:** Same as AR-01.

### AR-12: Exit and Resume AR
* **Precondition:** AR-11 completed.
* **Pass Criteria:** Tapping Exit (X) cancels `XRHitTestSource`, terminates `XRSession`, and returns cleanly to standard UI without duplicate animation loops.
* **Logging Format:** Same as AR-01.

### AR-13: Interactive 3D Fallback
* **Precondition:** Non-WebXR device or 3D topic (e.g. Array, Graph).
* **Pass Criteria:** Displays WebGL 3D scene with OrbitControls; does NOT simulate camera feed; does NOT mislabel mode as AR.
* **Logging Format:** Same as AR-01.
