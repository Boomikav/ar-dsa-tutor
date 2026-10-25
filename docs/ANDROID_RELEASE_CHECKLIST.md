# AR-DSA Tutor — Android Mobile WebXR & PWA Release Checklist

**Release Channel:** Mobile WebXR (Google Chrome on Android 12+)  
**Target Hardware:** ARCore-Supported Android Devices (Pixel 6/7/8, Samsung S21/S22/S23/S24, etc.)  
**Document Status:** Release Verification Protocol  

---

## 1. Prerequisites on Physical Android Device

Before launching physical mobile AR sessions:
1. **Google Play Services for AR (ARCore):** Must be installed and updated to version 1.40+ via the Google Play Store.
2. **Mobile Browser:** Google Chrome for Android (v110 or newer).
3. **Hardware Requirements:** Device must have a functioning rear camera and IMU (gyroscope + accelerometer).
4. **HTTPS / Secure Context:** WebXR `immersive-ar` is strictly forbidden on non-secure origins. Must be hosted on HTTPS (e.g. Vercel deployment) or `localhost` over ADB reverse tethering (`adb reverse tcp:5173 tcp:5173`).

---

## 2. PWA Installation & Launch Checklist

- [x] **Web App Manifest (`public/manifest.json`):**
  - `start_url` points to `/`
  - `display: standalone` removes browser URL bar for full-screen immersive viewport
  - `orientation: portrait-primary` prevents unwanted landscape flipping during physical scanning
  - Valid vector icon (`/favicon.svg`) with `purpose: any maskable`
- [x] **Mobile Viewport Optimization (`index.html`):**
  - `viewport-fit=cover` ensures Three.js canvas renders behind system status and gesture bars
  - `user-scalable=no` prevents accidental double-tap browser zoom during 3D manipulation
- [x] **Safe-Area Insets (`src/theme/tokens.css`):**
  - HUD containers apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`
  - Controls never clip beneath the Android gesture navigation bar or front camera cutout

---

## 3. WebXR Camera & Surface Placement Verification Checklist

When tapping **"Launch AR"** on one of the 5 AR-Ready topics:

1. **Permission Prompt:**
   - Chrome requests `Use your camera to see your surroundings`.
   - Granting permission opens the hardware camera feed with zero black-screen lag.
2. **Surface Scanning Reticle:**
   - The user is instructed: *"Move your device slowly over a flat surface"*.
   - Three.js reticle ring (`XRHitTestSource`) aligns seamlessly with detected planar surfaces (desks, floors).
3. **Model Placement:**
   - Tapping the screen locks the algorithm model at the hit position.
   - Reticle and scanning banner disappear.
   - Algorithm scene is elevated $+0.02\text{m}$ to prevent texture z-fighting with the physical plane.
   - Algorithm faces the mobile camera orientation based on horizontal yaw.
4. **Learning HUD Persistence:**
   - Floating AR HUD appears at the bottom with high-contrast semi-transparent backdrop (`rgba(8, 12, 20, 0.85)`).
   - Touch targets are $\ge 44\text{px} \times 44\text{px}$ to satisfy mobile accessibility guidelines.
5. **Clean Termination:**
   - Tapping the "Exit AR" button calls `session.end()`.
   - Camera feed turns off immediately; Three.js renderer restores 2D app view without memory leaks.

---

## 4. Fallback Mode Checklist (Desktop or Non-ARCore Devices)

- [x] If `navigator.xr.isSessionSupported('immersive-ar')` resolves to `false`:
  - System logs diagnostic without crashing.
  - Automatically activates `CANVAS_3D_FALLBACK`.
  - Transparent notification banner informs learner: *"3D Fallback Mode (WebXR device not detected)"*.
  - Touch/mouse drag orbit controls, pinch-to-zoom, and algorithm controls remain fully operational.
