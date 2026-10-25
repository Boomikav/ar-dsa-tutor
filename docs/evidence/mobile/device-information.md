# Mobile Physical Device Information

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Application:** AR-DSA Tutor  
**Phase:** 13 — Real Mobile AR Deployment & Physical Device Validation  
**Status:** `PENDING PHYSICAL TEST`

---

## Target Physical Device Profile

| Field | Target Specification / Actual Hardware | Status |
| :--- | :--- | :---: |
| **Device Model** | e.g., Google Pixel 7 / Samsung Galaxy S23 / iPhone 14 Pro | *Pending Physical Device Input* |
| **Operating System** | Android 13+ / iOS 16+ | *Pending Physical Device Input* |
| **AR Runtime** | Google Play Services for AR (ARCore v1.40+) / WebXR Viewer | *Pending Physical Device Input* |
| **Browser & Version** | Google Chrome 120+ / WebXR Viewer | *Pending Physical Device Input* |
| **Secure Context** | HTTPS via Trusted Domain / Tunnel (`window.isSecureContext === true`) | **REQUIRED** |
| **WebXR Support** | `navigator.xr` present, `immersive-ar` supported | **REQUIRED** |
| **Hit-Test API** | `XRHitTestSource` (Surface Hit-Test Placement) | **REQUIRED** |
| **Display Refresh Rate** | 60Hz - 120Hz | *Pending Physical Device Measurement* |

---

## Deployment Configuration & Mobile Access Methods

### Primary Access Method: Trusted HTTPS Deployment (Recommended)
1. Deploy the standalone production server (`server/server.ts`) behind a trusted HTTPS reverse proxy or cloud tunnel (e.g. Cloudflare Tunnel, Nginx with Let's Encrypt SSL, or cloud container).
2. Ensure the certificate is issued by a globally trusted Certificate Authority (CA) so mobile Chrome/Safari accepts it with zero security warnings.
3. Navigate to `https://<your-domain>/` on the physical smartphone browser.
4. Verify `window.isSecureContext === true` on the **Student Profile** screen under **Device AR Diagnostics**.

### Alternative / Local Development Option: Chrome Remote USB Port Forwarding
1. Connect the Android phone to the development workstation via USB cable.
2. Enable **USB Debugging** in Android Developer Options.
3. Open `chrome://inspect/#devices` in desktop Google Chrome.
4. Under **Port forwarding**, map port `3001` (or `5173`) to `localhost:3001`.
5. On the phone's Chrome browser, navigate to `http://localhost:3001/`.
6. Chromium natively treats `http://localhost` as a Secure Context (`isSecureContext === true`), permitting full WebXR Device API and camera access without requiring external SSL certificates.

---

## Physical Validation Log

```text
Validation Execution State: PENDING PHYSICAL TEST
Physical Device Connected: NO (Running in development environment)
Camera Passthrough Tested: NO
6DoF Tracking Tested: NO
Real-World Hit-Testing Tested: NO
```
