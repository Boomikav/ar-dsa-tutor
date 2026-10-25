# Mobile AR Hardware Compatibility & Validation Matrix

**Protocol Reference:** `docs/physical-ar-validation-protocol.md`  
**Phase:** Phase 11  
**Status:** Verification Infrastructure Established — Physical Hardware Validation Pending  

---

## 1. Physical Device Matrix

| Device Model | Operating System | Browser Runtime | WebXR `immersive-ar` | Surface Hit-Test | World Placement | 6DoF Tracking | Physical Validation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop Development Container** | Windows 11 / x64 | Node / Headless / Chrome | `UNSUPPORTED` (Fallback) | N/A | N/A | N/A | **3D Mode Verified (Software)** |
| **Google Pixel 7 / 8** | Android 14+ | Google Chrome (Latest) | Pending | Pending | Pending | Pending | **NOT TESTED — PENDING PHYSICAL VALIDATION** |
| **Samsung Galaxy S23 / S24** | Android 14 (OneUI 6) | Google Chrome / Samsung Internet | Pending | Pending | Pending | Pending | **NOT TESTED — PENDING PHYSICAL VALIDATION** |
| **Apple iPhone 14 / 15** | iOS 17+ | Mozilla WebXR Viewer | Pending | Pending | Pending | Pending | **NOT TESTED — PENDING PHYSICAL VALIDATION** |
| **Meta Quest 3** | Horizon OS 60+ | Meta Quest Browser | Pending | Pending | Pending | Pending | **NOT TESTED — PENDING PHYSICAL VALIDATION** |

---

## 2. Invariant Rules for Updating This Matrix

1. **No Presumptive Entries:** No cell in the above table may be changed from `Pending` or `NOT TESTED` to `PASS` unless an actual human researcher executes the standardized protocol (`docs/physical-ar-validation-protocol.md`) on that physical hardware model.
2. **Mandatory Evidence:** Every `PASS` entry must link to timestamped evidence files (video recording or unedited device logs) in the corresponding `docs/evidence/ar/` subdirectory.
3. **Hardware-Software Separation:** Successful execution in desktop browser simulations, Three.js WebGL fallbacks, or headless unit tests does **not** grant authorization to populate physical device matrix cells.
