# IEEE AIxVR 2027 — Video Demonstration Recording Checklist & Execution Guide

**Target Video:** 90-Second Demonstration Video for IEEE AIxVR 2027 Demos & Videos Track  
**Associated Manuscript:** [`docs/AIxVR_DEMO_PAPER.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_DEMO_PAPER.md)  
**Associated Storyboard:** [`docs/AIxVR_DEMO_VIDEO_SCRIPT.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_DEMO_VIDEO_SCRIPT.md)  
**Execution Status:** **MANUAL ACTION REQUIRED — TO BE RECORDED BY AUTHORS**  
*(This document provides the authoritative, reproducible protocol to record genuine application footage without fabrication).*

---

## 1. Environment Setup & Startup Commands

### Option A: Local Development Server (Recommended for Fast Capture)
```bash
# Terminal 1: Navigate to repository root and start Vite dev server
cd C:\Users\ajaya\Desktop\AR
npm run dev
# Server launches at: http://localhost:5173/
```

### Option B: Production Build Server
```bash
# Terminal 1: Build client and server bundles, then launch SSR production server
cd C:\Users\ajaya\Desktop\AR
npm run build
node dist/server/server.js
# Production server launches at configured port (default http://localhost:3000/ or http://localhost:5173/)
```

---

## 2. Browser & Viewport Configuration

### Desktop Capture (Canvas 3D Mode & Fallback)
1. Launch **Google Chrome** and navigate to `http://localhost:5173/`.
2. Press `F12` to open Developer Tools.
3. Click the **Toggle Device Toolbar** icon (`Ctrl+Shift+M`).
4. Select **Pixel 7** ($412 \times 915$, DPR $2.625$) or **Samsung Galaxy S20 Ultra** ($412 \times 915$).
5. Zoom setting: `100%`.
6. For 16:9 landscape overview shots, undock developer tools and set browser window to `1920 x 1080`.

### Physical Mobile Android Capture (WebXR Camera Mode)
1. Ensure the Android smartphone has **Google Play Services for AR (ARCore)** installed.
2. Connect the phone to the same local Wi-Fi network as the development machine.
3. Access the Vite dev server via the machine's local IP address over HTTPS (e.g., `https://192.168.1.X:5173/`).
4. Accept the self-signed SSL certificate in Chrome on Android.
5. Grant camera permissions when prompted by WebXR.

---

## 3. Step-by-Step Recording Sequence

### Scene 1: Introduction & PWA Zero-Install Access (0:00 – 0:15)
- Open Chrome browser.
- Show instant page loading of AR-DSA Tutor with zero installation prompts.
- Emphasize the clean mobile HUD and curriculum topic list.

### Scene 2: System Architecture & Fallback Mode (0:15 – 0:28)
- Select **Binary Search Tree** -> Click **Explore in 3D**.
- Highlight the status indicator: `CANVAS_3D_FALLBACK (Interactive 3D WebGL Mode)`.
- Click and drag to smoothly orbit around the 3D tree; scroll/pinch to zoom.
- Explain: *"A continuous WebXR session anchors dynamic Three.js visualizers, with an automated 3D canvas fallback for desktop and non-XR devices."*

### Scene 3: Algorithm Showcase across Five Modules (0:28 – 0:48)
Record smooth, representative interaction clips for each of the five visualizers:
1. **Binary Search Tree (BST):**
   - Click **Start Practice** (Target: 40).
   - Tap **Left** at root (50) -> Tree highlights Left node (30).
   - Tap **Right** at node 30 -> Insert value 40.
   - Show dynamic depth rescaling of branches.
2. **Bubble Sort:**
   - Switch topic to Bubble Sort using the curriculum selector.
   - Observe that the session does **not** reload or tear down.
   - Show vertical cylinder array with active comparison brackets.
   - Click **Step** to trigger the animated parabolic swap arc.
3. **Binary Search:**
   - Switch to Binary Search.
   - Show sorted 3D array blocks with `Low`, `Mid`, and `High` physical calipers.
   - Adjust Mid index and observe the discarded search interval slicing in half.
4. **Breadth-First Search (BFS):**
   - Switch to BFS.
   - Pick start vertex.
   - Show visited emissive glow on active node and unvisited neighbors populating the 3D queue shelf.
5. **Stack:**
   - Switch to Stack.
   - Show upright transparent acrylic cylinder.
   - Click **Push** twice to drop colored cylinders into the column.
   - Click **Pop** to extract the top cylinder, visually demonstrating physical LIFO discipline and the 5-element capacity boundary.

### Scene 4: Transparent EGEA Adaptation Triggers (0:48 – 1:08)
Demonstrate the four key pedagogical adaptation regimes live in the HUD:
1. **Touch Jitter Filtering:**
   - Rapidly double-tap the same button in $< 250\text{ms}$.
   - Show that the system executes the action without triggering a false guessing penalty.
2. **Stepwise Slowdown (Impulsive Guessing):**
   - Deliberately click incorrect direction choices 3 times in rapid succession ($< 1500\text{ms}$ each).
   - Capture the HUD alert modal: *"Stepwise Slowdown: Impulsive trial-and-error detected"*.
   - Controls dim for 3 seconds with a reflection prompt before practice resumes.
3. **Worked Example (Persistent Step Impasse):**
   - At deliberate pacing ($> 2.5\text{s}$), fail on the exact same node 3 consecutive times.
   - Capture the prompt: *"Worked Example: Persistent failure detected"*.
   - Show the 3D animated walkthrough demonstrating the correct traversal step.
4. **Guidance Fading (Mastery Streak):**
   - Execute 3 consecutive correct moves without accessing hints.
   - Show the visual calipers and highlight arrows smoothly fading (`REDUCE_GUIDANCE`).

### Scene 5: Technical Verification Summary (1:08 – 1:20)
- Display an animated graphic or text card highlighting verified metrics:
  - Steady-State Decision Latency: $0.006\text{ms}$ ($6\ \mu\text{s}$).
  - Frame Budget Margin: $> 2,000\times$ faster than $16.6\text{ms}$ (60 FPS).
  - Test Matrix: 17 suites, 1,403 passing assertions.
  - Synthetic Consistency: 100.0%.

### Scene 6: Limitations & Call to Action (1:20 – 1:30)
- Show mobile phone running the application.
- Overlay text: *"Hardware Validation & Classroom Study Pending | Open Source"*.
- Display IEEE AIxVR 2027 demonstration invite and GitHub repository QR code.

---

## 4. Truthfulness & Anti-Fabrication Constraints

1. **No Fake Camera Feeds:** If physical mobile AR footage is not recorded, capture the browser application in `CANVAS_3D_FALLBACK` mode and clearly label it: *"Interactive 3D WebGL Mode (Fallback)"*.
2. **No Fabricated Phone Renders:** Do not composite browser canvas screenshots onto stock photography of hands holding phones to simulate real AR tracking.
3. **Transparent Latency Narration:** Always state that $0.006\text{ms}$ measures the pure JavaScript adaptation decision time on desktop CPU, not mobile GPU frame composition.
4. **No Claim of Completed Human Trials:** Never state or imply in voiceover that students were evaluated or that exam scores improved.

---

## 5. Technical Video Export & Inspection Checklist

| Specification | Target Value | Verification Check |
|---|---|---|
| **Container / Codec** | `MP4` / H.264 (`libx264`) | `ffmpeg -i video.mp4` |
| **Audio Codec** | AAC, stereo, $48\text{ kHz}$, $\ge 192\text{ kbps}$ | `ffmpeg -i video.mp4` |
| **Resolution** | $1920 \times 1080$ ($1080\text{p}$, 16:9) | Clean high-DPI scaling |
| **Frame Rate** | $30\text{ FPS}$ or $60\text{ FPS}$ constant | Zero stutter or dropped frames |
| **Total Duration** | $85\text{s}$ – $95\text{s}$ (Nominal $90\text{s}$) | Fits conference demo guidelines |
| **File Size** | $< 100\text{ MB}$ (Nominal $\sim 40\text{ MB}$) | Smooth playback on YouTube / EasyChair |
| **Audio Loudness** | Normalized to $-14\text{ LUFS}$ ($\pm 1\text{ LUFS}$) | Consistent spoken narration volume |

---

## 6. Video Hosting & Submission Instructions

1. Export the final video as `AR_DSA_Tutor_AIxVR2027_Demo.mp4`.
2. Upload the video as an **Unlisted video** on **YouTube** or **Vimeo** (with embedding and high-definition $1080\text{p}$ playback enabled).
3. Copy the public link.
4. Paste the video URL into the designated **"Video URL"** field in the EasyChair IEEE AIxVR 2027 submission portal before **October 29, 2026 (AoE)**.
