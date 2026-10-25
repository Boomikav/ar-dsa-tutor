# Test AR-07: Interactive Practice & Deterministic DSA Authority

**Test Code:** AR-07  
**Category:** Deterministic Algorithmic Interaction in Mobile AR  
**Objective:** Verify that mobile touch decisions interact authoritatively with `BSTPracticeEngine`, updating the active node highlighting and strictly rejecting algorithmically incorrect moves.

---

## Canonical Scenario
* **Tree Structure:**
  ```text
          50
         /  \
       30    70
      /  \
     20   40
  ```
* **Target Insertion Value:** `40`
* **Starting Active Node:** `50`

## Test Protocol
1. Observe the target banner showing **Target: 40** and active node **50** illuminated in cyan.
2. **Intentional Mistake:** Tap the **RIGHT** direction button (or node 70).
3. **Deterministic Authority Check:**
   * Verify move is immediately rejected as incorrect.
   * Verify active node pointer remains firmly locked at **50** (does NOT advance to 70).
   * Verify misconception is classified as `BST_WRONG_DIRECTION`.
   * Verify toast/feedback reads: "Incorrect direction: 40 < 50, so move LEFT."
4. **Authoritative Correct Step:**
   * Tap the **LEFT** direction button.
   * Verify move is accepted.
   * Verify active pointer transitions to **node 30** with green highlight.
5. **Final Step:**
   * At node 30, compare target 40 with 30 (40 > 30). Tap **RIGHT**.
   * Verify insertion completes successfully.

## Verification Fields

```text
Test ID:            AR-07
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Intentional Error:  RIGHT at node 50 for target 40
Engine Response:    REJECTED (BST_WRONG_DIRECTION)
Pointer Protected:  Locked at node 50
Correct Move:       LEFT accepted, pointer advanced to node 30
Final Move:         RIGHT accepted, insertion complete
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
