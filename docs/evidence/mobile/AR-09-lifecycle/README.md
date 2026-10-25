# Test AR-09: Mobile AR Lifecycle Management & Clean Teardown

**Test Code:** AR-09  
**Category:** Session Lifecycle, Backgrounding & Resource Teardown  
**Objective:** Verify that backgrounding the app, switching browser tabs, and exiting AR cleans up the `XRSession`, cancels hit-test sources, and prevents duplicate animation render loops.

---

## Preconditions
1. Active WebXR AR session running on mobile device.

## Test Protocol
1. **Backgrounding & Resuming:**
   * Press mobile Home button or switch to another application for 5 seconds.
   * Return to Google Chrome / WebXR Viewer.
   * Verify session handles suspension gracefully without memory leaks or crashes.
2. **Explicit Exit:**
   * Tap the **Exit AR** (X) button in top-left corner.
   * Verify camera stream terminates immediately.
   * Verify state machine transitions to `ENDED`.
   * Verify screen returns cleanly to Topic Details / Learning Session.
3. **Interactive 3D Fallback Mode:**
   * Open a topic with `3D_READY` capability (or run on a non-WebXR device).
   * Verify the visualizer displays the Interactive 3D Mode with OrbitControls.
   * Verify transparent camera passthrough is NEVER simulated and the interface never labels 3D fallback as "AR".

## Verification Fields

```text
Test ID:            AR-09
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Background Handling:Pending physical test
Exit Cleanup:       Pending physical test (XRHitTestSource & session cancelled)
Render Loop Leaks:  VERIFIED (Single RAF handle managed, purged on unmount)
3D Fallback Mode:   VERIFIED (Canvas 3D with OrbitControls for non-AR contexts)
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
