# Test AR-05: Binary Search Tree Surface Hit-Test Placement

**Test Code:** AR-05  
**Category:** Spatial Placement & Reference Space Transformation  
**Objective:** Verify that tapping the screen when the reticle is positioned on a physical surface anchors the 3D Binary Search Tree at the hit-test pose in reference space.

---

## Preconditions
1. Test AR-04 passed (Surface detected and targeting reticle visible).

## Test Protocol
1. Tap the screen when the reticle is resting steadily on the physical desk surface.
2. Verify session state transitions through `PLACEMENT_READY` -> `PLACED` -> `TRACKING`.
3. Verify the canonical BST appears at the hit-test location with nodes (Root 50, Left 30, Right 70, Left-Left 20, Left-Right 40).
4. Verify initial scale and height offset (+0.02m) prevent the tree base from clipping beneath the surface.

## Verification Fields

```text
Test ID:            AR-05
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Placement Method:   Surface hit-test placement (XRHitTestSource & reference space pose)
Tree Scaled & Placed:Pending physical observation
State Transition:   PLACED -> TRACKING
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
