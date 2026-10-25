# IEEE AIxVR 2027 — Demonstration Video Script & Recording Storyboard

**Title:** AR-DSA Tutor: Zero-Install Mobile WebXR with Execution-Grounded Explainable Adaptation  
**Target Duration:** ~90 seconds (1 minute 30 seconds)  
**Aspect Ratio:** 16:9 (1920x1080) with 9:16 mobile inset  
**Audio:** Clear spoken English narration with subtle background instrumental music  
**Video Status:** **SCRIPT & RECORDING PLAN ONLY — FOOTAGE NOT YET RECORDED**  
*(Per anti-fabrication standards, no pre-recorded video file exists in the repository. This document provides the authoritative capture plan for authors to record genuine application footage).*

---

## 1. Storyboard & Shot List (90 Seconds)

```
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| Time  | Visual Layout      | Video Scene & Application Action          | Spoken Voiceover Narration                    |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 00:00 | Title Splash       | AR-DSA Tutor logo, paper title, IEEE      | "Teaching abstract Data Structures and        |
| -00:15| & Split Screen     | AIxVR 2027 banner. Left: textbook 2D BST; | Algorithms often leaves students struggling   |
|       |                    | Right: 3D spatial WebXR tree floating in  | between flat 2D diagrams and dynamic 3D       |
|       |                    | mobile browser.                           | memory models."                               |
|       |                    | Text: "Zero-Install Mobile WebXR"         | "AR-DSA Tutor brings five foundational        |
|       |                    |                                           | algorithms into interactive mobile WebXR."    |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 00:15 | Architecture       | System architecture flowchart showing:    | "Operating directly in mobile Google Chrome,  |
| -00:28| Diagram Callout    | WebXR Device API -> Three.js WebGL ->     | AR-DSA Tutor maintains a single continuous    |
|       |                    | Deterministic DSA Engines -> EGEA Policy. | WebXR camera session across topics, with an   |
|       |                    | Label: "No App Installation / Single      | automated 3D canvas fallback for desktop      |
|       |                    | Continuous Session"                       | and non-XR devices."                          |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 00:28 | Algorithm          | Rapid demonstration of 3 key visualizers: | "Learners manipulate 3D spatial structures:   |
| -00:48| Showcase           | 1. BST (0:28-0:34): traversing branches.   | branch traversals in Binary Search Trees,     |
|       | (Side-by-side)     | 2. Bubble Sort (0:34-0:41): comparison    | comparison brackets and animated swap arcs in |
|       |                    |    brackets and parabolic swap arcs.      | Bubble Sort, and interactive interval         |
|       |                    | 3. Stack (0:41-0:48): acrylic cylinder    | calipers in Binary Search—all governed by     |
|       |                    |    with LIFO drop animations & capacity.  | deterministic state engines."                 |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 00:48 | EGEA Adaptive      | HUD interaction sequence:                 | "To scaffold learning without generative AI   |
| -01:08| Guidance           | 1. Fast clicking: User taps 3 times under | hallucinations or cloud latency, our          |
|       | Interventions      |    1500ms -> HUD dims with 3s Slowdown.   | Execution-Grounded policy monitors telemetry  |
|       |                    | 2. Repeated failure on Node 42 -> 3D      | in real-time."                                |
|       |                    |    Worked Example playback starts.        | "Impulsive guessing triggers deliberate       |
|       |                    | 3. Autonomous 3x correct moves -> visual  | slowdowns; persistent impasses trigger 3D     |
|       |                    |    calipers smoothly fade out.            | worked examples; and mastery fades scaffolds."|
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 01:08 | Technical          | Summary metrics on screen:                | "EGEA evaluates decisions in six              |
| -01:20| Verification       | - Mean Decision Latency: 0.006ms          | microseconds on desktop x86_64—operating      |
|       |                    | - Frame Budget Margin: 2,000x faster      | 2,000 times faster than a 60 FPS frame        |
|       |                    | - 17 Test Suites / 1,403 Assertions Pass  | budget. Verified across 1,403 automated       |
|       |                    | - Synthetic Consistency: 100%             | test assertions and edge benchmarks."         |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
| 01:20 | Limitations &      | Open browser on mobile phone showing      | "While currently verified in simulation, our  |
| -01:30| Future Work        | fallback mode and GitHub repository.      | next phase deploys the system in university   |
|       | Outro              | Text overlay: "Hardware Validation &      | classrooms for formal learning-gain trials.   |
|       |                    | Classroom Study Pending | Open Source"    | Experience the live demonstration at IEEE     |
|       |                    | QR Code to live repository.               | AIxVR 2027."                                  |
+-------+--------------------+-------------------------------------------+-----------------------------------------------+
```

---

## 2. Audio & Narration Script (Full Read-Through: ~88s)

> [00:00 - 00:15]  
> "Teaching abstract Data Structures and Algorithms often leaves students struggling between flat 2D textbook diagrams and dynamic 3D memory models. AR-DSA Tutor brings five foundational algorithms into interactive mobile WebXR—completely zero-install."
> 
> [00:15 - 00:28]  
> "Operating directly in mobile Google Chrome via the W3C WebXR Device API, the system maintains a single continuous augmented reality session across topics, with an automated 3D canvas fallback for desktop and non-XR devices."
> 
> [00:28 - 00:48]  
> "Learners directly manipulate three-dimensional spatial structures: directional branch traversals in Binary Search Trees, comparison brackets and parabolic swap arcs in Bubble Sort, and interactive interval calipers in Binary Search—all governed by deterministic mathematical state engines."
> 
> [00:48 - 01:08]  
> "To scaffold learning without the network latency or hallucination risks of generative language models, our Execution-Grounded Explainable Adaptation engine monitors interaction velocity in real-time. Impulsive rapid guessing triggers deliberate reflection slowdowns; persistent step impasses trigger animated 3D worked examples; and autonomous mastery smoothly fades visual guidance."
> 
> [01:08 - 01:20]  
> "Microbenchmarks confirm that adaptation decisions execute in just six microseconds on desktop x86_64, operating two thousand times faster than the sixty-frames-per-second frame budget. The architecture is verified across seventeen test suites and 1,403 passing assertions."
> 
> [01:20 - 01:30]  
> "While current evaluation is based on simulated WebXR harnesses, our upcoming roadmap deploys the system to university classrooms for formal student learning-gain evaluations. Experience the live interactive demonstration at IEEE AIxVR 2027."

---

## 3. Practical Recording Instructions for Authors

To capture genuine footage from the repository:

1. **Local Server Launch:**
   ```bash
   npm run build
   node dist/server/server.js
   # Or for local development:
   npm run dev
   ```
2. **Desktop Screen Capture (OBS Studio / QuickTime):**
   - Resolution: `1920x1080` @ 60 FPS.
   - Navigate to `http://localhost:5173/` in Google Chrome.
   - Open Developer Tools -> Device Mode -> Select **Pixel 7** or **Samsung Galaxy S22**.
3. **Capture Scene 1: Fallback & OrbitControls (15s):**
   - Click **Binary Search Tree** -> Click **Explore in 3D**.
   - Note the top banner: `CANVAS_3D_FALLBACK (Interactive 3D WebGL Mode)`.
   - Click and drag to orbit around the 3D BST tree; scroll to zoom.
4. **Capture Scene 2: Algorithm Execution (25s):**
   - Click **Start Practice** on BST, insert values 40, 25, 60.
   - Navigate to **Bubble Sort** -> Show comparison brackets and click **Step** to trigger swap arc.
   - Navigate to **Stack** -> Show pushing 3 cylinders into the transparent acrylic column.
5. **Capture Scene 3: EGEA Adaptation Triggers (25s):**
   - On BST practice, deliberately tap the incorrect direction 3 times in rapid succession (< 1.5s).
   - Capture the HUD alert: *"Stepwise Slowdown: Impulsive trial-and-error detected"*.
   - Pause for 3 seconds; click again to show resumption.
   - Fail on the exact same node 3 times at slow pacing to capture the *"Worked Example"* prompt.
6. **Mobile AR Hardware Recording (Optional / Recommended if Android Device Available):**
   - Connect an Android smartphone with ARCore and Chrome on the same Wi-Fi.
   - Navigate to the local HTTPS IP (e.g., `https://192.168.1.X:5173`).
   - Launch AR session, point phone at floor, tap to anchor, and record the camera passthrough session.
   - *Labeling rule:* If recorded via Chrome DevTools mock WebXR, label on-screen: *"Simulated WebXR Session"*. If recorded on a physical phone, label: *"Physical Android Device Capture"*.
7. **Video Packaging:**
   - Combine captured clips in an editor (e.g., DaVinci Resolve, Premiere, CapCut) following the timecodes above.
   - Export as `MP4` (H.264 video, AAC audio, bitrate ~10 Mbps, file size ~40MB).
   - Upload unlisted to YouTube or Vimeo and paste the URL into the EasyChair submission form.
