# Test AR-06: 6DoF Physical Tracking & Spatial Stability

**Test Code:** AR-06  
**Category:** 6DoF Spatial Stability & Positional Persistence  
**Objective:** Verify that moving the phone through physical 3D space preserves the world-space pose of the placed Binary Search Tree without jitter, sliding, or positional drift.

---

## Preconditions
1. Test AR-05 passed (BST placed on desk surface).

## Test Protocol (8-Direction Physical Movement)
Execute the following camera movements relative to the placed tree:
1. **Move Left:** Translate phone 0.5m left; verify tree appears from its right perspective.
2. **Move Right:** Translate phone 0.5m right; verify tree appears from its left perspective.
3. **Move Forward:** Walk forward toward tree; verify tree scales up naturally with perspective.
4. **Move Backward:** Walk backward away from tree; verify tree scales down smoothly.
5. **Rotate Phone (Pitch/Yaw):** Tilt up/down and pan around; verify tree orientation remains fixed to physical desk.
6. **Move Closer:** Approach within 0.25m to inspect node label text (e.g. node 50, 30).
7. **Move Farther Away:** Step back to 1.5m; verify all 5 nodes remain visible.
8. **Occlusion & Re-entry:** Briefly pan away from desk and pan back; verify tree remains anchored at the original placement pose.

## Verification Fields

```text
Test ID:            AR-06
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Translation Drift:  Pending physical measurement (cm)
Rotational Jitter:  Pending physical observation
Tracking Recovery:  Pending physical re-entry test
Estimated FPS:      Pending physical measurement
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
