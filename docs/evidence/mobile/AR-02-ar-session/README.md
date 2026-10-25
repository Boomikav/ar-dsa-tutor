# Test AR-02: WebXR AR Session Request & Permission Prompt

**Test Code:** AR-02  
**Category:** WebXR Runtime Initialization  
**Objective:** Verify that requesting an AR session for Binary Search Tree triggers the browser's native camera permission dialog and successfully initializes the WebXR `immersive-ar` session.

---

## Preconditions
1. Test AR-01 passed.
2. Device supports ARCore / WebXR `immersive-ar`.

## Test Protocol
1. Navigate to **Binary Search Tree** topic in Topic Explorer.
2. Open **Topic Details** and tap **3D AR Practice** (or launch from Topic Card).
3. Tap **Launch AR Session** button.
4. Verify browser prompts for camera access (e.g., "Allow AR-DSA Tutor to use your camera?").
5. Grant permission and verify transition from `INITIALIZING` to `SCANNING`.

## Verification Fields

```text
Test ID:            AR-02
Status:             PENDING PHYSICAL TEST
Execution Date:     Pending
Device Model:       Pending
Operating System:   Pending
Browser & Version:  Pending
Camera Permission:  Pending
WebXR Session Type: immersive-ar
Observed Behavior:  Pending physical execution on real mobile device
Evidence:           Pending physical capture
```
