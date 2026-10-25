# Test AR-03: Real-World Optical Camera Passthrough

**Test Code:** AR-03  
**Category:** Optical Passthrough & Render Pipeline  
**Objective:** Verify that the phone's physical camera feed renders smoothly behind the transparent Three.js WebGL canvas without visual artifacts, distortion, or orientation inversion.

---

## Preconditions
1. Test AR-02 passed (Camera permission granted).
2. Well-lit physical room ($\ge 300$ lux).

## Test Protocol
1. Observe the physical environment through the mobile device screen.
2. Verify optical passthrough renders at camera sensor frame rate (30fps / 60fps).
3. Pan and tilt the phone; verify no inverted axes or camera orientation flip.
4. Verify strict privacy: Confirm zero camera frames are recorded, captured, or uploaded to any remote server or AI API.

## Verification Fields

```text
Test ID:            AR-03
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Camera Frame Rate:  Pending physical measurement
Passthrough Quality:Pending physical evaluation
Privacy Guard:      VERIFIED (Zero client-side upload routines in codebase)
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
