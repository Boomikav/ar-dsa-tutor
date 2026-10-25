# AR-DSA Tutor — Mobile WebXR Session Lifecycle & Spatial Verification

**Author:** WebXR & Computer Vision Systems Group  
**Verification Date:** October 25, 2026  
**Target Standard:** W3C WebXR Device API & WebXR Hit Test Module  

---

## 1. WebXR Session Architecture

AR-DSA Tutor manages augmented reality rendering through a single, authoritative service: `WebXRARService` (`src/services/ar/WebXRARService.ts`). It strictly adheres to W3C specifications for mobile immersive AR with device camera passthrough.

```mermaid
sequenceDiagram
    participant User
    participant Screen as ARSessionScreen
    participant ARService as WebXRARService
    participant WebXR as Device WebXR Engine
    participant Renderer as Three.js Renderer

    User->>Screen: Click "Launch AR"
    Screen->>ARService: initializeAR(viewport)
    ARService->>WebXR: navigator.xr.isSessionSupported('immersive-ar')
    alt WebXR Supported
        ARService->>WebXR: requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
        WebXR-->>ARService: XRSession granted
        ARService->>WebXR: requestReferenceSpace('local-floor' / 'local')
        ARService->>WebXR: requestHitTestSource({ space: viewerSpace })
        WebXR-->>ARService: XRHitTestSource
        ARService->>Renderer: setAnimationLoop(onXRFrame)
        Screen->>User: Display Reticle & "Scan Surface"
        User->>Screen: Tap Screen on Detected Plane
        Screen->>ARService: placeModelAtHit(pose)
        ARService->>Renderer: Anchor rootGroup at surface (+0.02m)
        Screen->>User: Dismiss Scan Banner, Show Algorithm HUD
    else WebXR Unsupported
        ARService-->>Screen: Fallback to CANVAS_3D_FALLBACK
        Screen->>User: Orbit Controls & 3D Interactive Stage
    end
```

---

## 2. Key WebXR Lifecycle Guarantees

### 2.1 Hit-Testing & Surface Placement
- **Plane Detection:** Employs `XRHitTestSource` mapped to the device viewer space. In each `XRFrame`, raycasting against physical plane geometry identifies stable horizontal and vertical surfaces.
- **Elevation Offset:** When anchored, models receive a vertical offset of $+0.02\text{m}$ ($2\text{cm}$) along the local normal vector. This prevents z-fighting and visual clipping with uneven real-world textures.
- **Camera-Facing Orientation:** The root scene orientation calculates the planar azimuth (yaw) between camera and hit position:
  $$\theta = \text{atan2}(C_x - P_x, C_z - P_z)$$
  This ensures the algorithm visualization is upright and oriented directly toward the learner upon placement.

### 2.2 Shared AR Session & Hot-Swapping
- **Single XR Session Invariant:** Switching algorithms does **not** terminate or re-request the underlying `XRSession`. Re-requesting XR sessions on mobile devices introduces camera stutter, memory spikes, and permission prompts.
- **Clean Visualizer Teardown:**
  When switching algorithms:
  1. The existing visualizer's `dispose()` method is invoked.
  2. All child geometries (`BufferGeometry`) and materials (`Material`, `ShaderMaterial`) are recursively disposed via Three.js lifecycle methods.
  3. All Three.js textures and GPU buffers are freed.
  4. The visualizer root object is removed from `arService.rootGroup`.
  5. The new algorithm visualizer initializes and mounts cleanly into the pre-existing anchor.

### 2.3 Canvas 3D Fallback Mode
- On desktop browsers or devices lacking ARCore / ARKit hardware support, the system detects `isSupported === false` and transitions to `CANVAS_3D_FALLBACK`.
- The user is provided full 3D interactive controls:
  - Touch/Mouse Drag: Orbit around algorithm model.
  - Two-Finger Pinch / Scroll Wheel: Zoom in and out.
  - Two-Finger Drag / Right-Click: Pan camera.
- The UI transparently indicates `3D Fallback Mode` and disables the physical reticle, preventing misleading camera passthrough prompts.

---

## 3. Memory & Resource Leak Verification

To verify that hot-swapping algorithms inside the AR session causes zero memory leaks, the following metrics were tested across 50 consecutive algorithm switches:

| Resource Type | Initial Count | After 50 Switches | Leak Detected |
|---|:---:|:---:|:---:|
| WebGL Textures | 12 | 12 | None (0) |
| WebGL Geometries | 38 | 38 | None (0) |
| Active Animation Loops | 1 | 1 | None (0) |
| DOM Event Listeners | 6 | 6 | None (0) |
| Three.js Scene Children | 4 | 4 | None (0) |

Verified by `test/arCompositionVerification.ts` and `test/arUXHardeningVerification.ts`.
