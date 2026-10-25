# Test AR-04: Real-World Surface Hit-Testing & Reticle Alignment

**Test Code:** AR-04  
**Category:** Surface Detection via XRHitTestSource  
**Objective:** Verify that moving the phone over a real-world horizontal surface (desk, table, floor) initiates hit-testing and projects the spatial targeting reticle onto the detected surface.

---

## Preconditions
1. Test AR-03 passed.
2. Flat, textured horizontal surface (avoid featureless glass or high-glare surfaces).

## Test Protocol
1. Slowly move the phone in a gentle circular scanning motion over the desk surface.
2. Verify session state advances from `SCANNING` to `SURFACE_DETECTED`.
3. Verify the circular targeting reticle appears and aligns coplanar with the physical desk.
4. Verify surface detection latency is measured and reported if telemetry is enabled.

## Verification Fields

```text
Test ID:            AR-04
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Surface Type:       Pending physical surface (e.g. wood desk, tiled floor)
Reticle Visualized: Pending physical observation
Hit-Test Mechanism: XRHitTestSource (Surface hit-test placement)
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
