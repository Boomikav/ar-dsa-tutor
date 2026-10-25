# Test AR-08: Mobile AR Tutor HUD & Offline Fallback Resilience

**Test Code:** AR-08  
**Category:** Contextual AI Pedagogical Guidance & Offline Resilience  
**Objective:** Verify that triggering mistakes or requesting assistance brings up the ARTutorHUD with pedagogical explanations, and confirm that practice continues uninterrupted if the AI backend is offline.

---

## Preconditions
1. Test AR-07 passed.
2. ARTutorHUD visible overlay present on screen.

## Test Protocol
1. **AI Tutor Activation:**
   * Upon making an intentional mistake (RIGHT at node 50), verify the AI Tutor button indicates assistance available or automatically expands the HUD.
   * Verify the pedagogical explanation reinforces the BST invariant ($40 < 50 \implies \text{search left subtree}$).
   * Verify tutoring style conforms to learner preferences (Socratic, Direct, or Analogical).
2. **Offline Fallback Resilience:**
   * Disable network connectivity on the phone (or stop the server AI endpoint).
   * Tap "Ask Tutor" / "Request Hint".
   * Verify the system activates local mock fallback without crashing the AR session.
   * Verify 3D rendering and touch controls remain completely functional and responsive at 60fps.

## Verification Fields

```text
Test ID:            AR-08
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Tutor HUD Display:  Pending physical observation
AI Response Type:   MISTAKE_EXPLANATION / HINT
Offline Fallback:   Pending physical test (MockProvider / client fallback)
Render Loop Decoupled:VERIFIED (Zero async AI calls inside onAnimationFrame)
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
