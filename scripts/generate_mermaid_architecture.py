"""
Synchronized architecture generation script for AR-DSA Tutor Figure 1.
Exports:
- submission/review_release/figures/fig1_system_architecture.mmd (Mermaid source)
- submission/review_release/figures/fig1_system_architecture.svg (Vector SVG)
- submission/review_release/figures/fig1_system_architecture.png (308 DPI high-res PNG)

Follows the layout and visual presentation of Figure 1 in paper (14).pdf:
- Compact rectangular modules arranged in 3 horizontal processing rows
- Direct orthogonal dataflow connectors with short clear labels
- Separate offline verification block with dashed connectors
- Restrained academic color palette matching Reference A
- NO three vertical pillar containers
- NO decorative numbered circles
- NO oversized title banner
"""

import os
from playwright.sync_api import sync_playwright

MERMAID_SRC = """flowchart LR
    %% ========================================================================
    %% ROW 1: CLIENT SESSION & DETERMINISTIC ALGORITHM ENGINES
    %% ========================================================================
    subgraph ROW1 ["STAGE I: CLIENT SESSION & DETERMINISTIC ALGORITHM ENGINES"]
        direction LR
        M1["<b>Module 1: Learner Viewport & UI</b><br/>• Mobile WebXR Canvas & AR Frustum Overlay<br/>• Touch Screen & 3D Raycast Hit-Testing<br/>• 1-Click Zero-Tear Algorithm Hot-Swapping<br/>• Telemetry: Dispatches action, step, latency"]
        
        M2["<b>Module 2: WebXR Session Core</b><br/>• Single Persistent XRSession (Retains WebGL)<br/>• Non-XR 3D Fallback with OrbitControls<br/>• Enforces Upright (+Y) Spatial Gravitational Axis<br/>• <i>(Simulation Boundary: ARCore Unverified)</i>"]
        
        M3["<b>Module 3: Deterministic Engines</b><br/>• <b>BST:</b> Left &lt; Node &lt; Right Invariant Reducer<br/>• <b>Bubble Sort:</b> Adjacent Inversion Step Swaps<br/>• <b>Binary Search:</b> Logarithmic Range Halving<br/>• <b>BFS:</b> Topological FIFO Queue Expansion<br/>• <b>Stack:</b> LIFO Push / Pop (Depth Limit ≤ 6)"]

        M1 -->|Session Config| M2
        M2 -->|User Attempt| M3
    end

    %% ========================================================================
    %% ROW 2: PROCEDURAL 3D ENGINE & TELEMETRY INGESTION
    %% ========================================================================
    subgraph ROW2 ["STAGE II: PROCEDURAL 3D ENGINE & TELEMETRY INGESTION"]
        direction LR
        M6["<b>Module 6: EGEA Event Adapter</b><br/>• Monotonic Sequence Counter (k) & Timestamp<br/>• 250ms Touch Debounce & Event Filtering<br/>• <b>canonicalizeStep:</b> Key Alias Normalization<br/>• Extracts Raw Action Latency (L_k)"]

        M5["<b>Module 5: Scene Assembler & Sync</b><br/>• Pure-Render Scene Graph State Mapping<br/>• Parametric Animation & Step Interpolation<br/>• Synchronous 60 FPS WebGL Frame Presentation<br/>• Zero-Tear Mesh Disposal on Algorithm Swap"]

        M4["<b>Module 4: Procedural Visualizers</b><br/>• <b>ThreeBST:</b> Dynamic Spheres & Link Cylinders<br/>• <b>ThreeBubbleSort:</b> Scaled Bars & Swap Arcs<br/>• <b>ThreeBinarySearch:</b> Indexed Block Array<br/>• <b>ThreeBFS / Stack:</b> Graph Dock & Glass Chamber"]

        M4 -->|Mesh Hierarchies| M5
    end

    %% ========================================================================
    %% ROW 3: PACING MODEL, ADAPTATION POLICY & SPATIAL HUD
    %% ========================================================================
    subgraph ROW3 ["STAGE III: PACING MODEL, ADAPTATION POLICY & SPATIAL HUD"]
        direction LR
        M7["<b>Module 7: EWMA Pacing Model</b><br/>• S_k = α·L_k + (1-α)S_{k-1} (Smoothing α = 0.3)<br/>• Rapid Guessing (&lt; 1.5s) vs Deliberate (≥ 3.0s)<br/>• Consecutive Mistake & Error Pattern History<br/>• Autonomous Mastery Streaks (≥ 3 Steps)"]

        M8["<b>Module 8: EGEA Policy Engine</b><br/>• <b>6-Tier Grounded Scaffolding Hierarchy:</b><br/>  [1] HINT • [2] SLOWDOWN • [3] HIGHLIGHT<br/>  [4] WORKED • [5] PREREQ • [6] REDUCE<br/>• Latency: Pure Policy 7 μs | Pipeline 14 μs"]

        M9["<b>Module 9: Spatial AR Tutor HUD</b><br/>• Viewport AR Frustum Overlay (ARTutorHUD)<br/>• Grounded Rationale Code & Confidence (0.80–0.95)<br/>• Dynamic Visual Badges & Reflection Pauses<br/>• Closed-Loop Pedagogical Feedback to Learner"]

        M7 -->|Pacing & History| M8
        M8 -->|Decision & Rationale| M9
    end

    %% ========================================================================
    %% OFFLINE BENCHMARK BLOCK
    %% ========================================================================
    subgraph OFFLINE ["OFFLINE VERIFICATION & BENCHMARK HARNESS (NOT IN LIVE LOOP)"]
        direction LR
        M10["<b>Module 10: Automated Verification & Metric Harness</b><br/>• 18 Automated Test Suites (1,437 Assertions Passed)<br/>• 18-Case Challenge Suite & 12-Case Boundary Suite (100% Spec Conformance)<br/>• Independent Scikit-Learn Metric Validation (Macro-F1 = 1.000)"]
    end

    %% Inter-row Dataflow Connections
    M3 -->|Invariant State Delta| M4
    M5 -.->|Synchronized WebGL Frame Presentation| M1
    M1 -.->|Interaction Telemetry (k, Δt)| M6
    M6 -->|Canonical Trace & Latency| M7
    M9 -.->|Closed-Loop HUD Guidance Feedback| M1
    M10 -.->|Validates State Transitions| M3
    M10 -.->|Validates Policy Decision Rules| M8

    classDef stageStyle fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#475569;
    classDef offlineStyle fill:#fafafa,stroke:#94a3b8,stroke-width:1.2px,stroke-dasharray:4 4,color:#475569;
    classDef card1 fill:#f8fafc,stroke:#64748b,stroke-width:1.3px,color:#0f172a;
    classDef card2 fill:#f0f9ff,stroke:#0284c7,stroke-width:1.3px,color:#0f172a;
    classDef card3 fill:#ecfdf5,stroke:#059669,stroke-width:1.3px,color:#0f172a;
    classDef card4 fill:#fffbeb,stroke:#d97706,stroke-width:1.3px,color:#0f172a;

    class ROW1,ROW2,ROW3 stageStyle;
    class OFFLINE offlineStyle;
    class M1,M2 card1;
    class M3,M4,M5 card2;
    class M6,M7,M8 card3;
    class M9 card4;
"""

def build_svg():
    # Width: 710px, Height: 300px -> Aspect Ratio: 2.37:1
    # Optimized for IEEE 6.95-7.0 inch full-width display
    # Print-equivalent font sizes: 8.2pt - 10.5pt (matches IEEE publication body text exactly)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 710 300" width="710" height="300" style="background:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arr-dark" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1e293b" />
    </marker>
    <marker id="arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
    </marker>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
    </marker>
    <marker id="arr-dash" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
    </marker>

    <!-- Card shadow for subtle depth -->
    <filter id="shadow" x="-3%" y="-4%" width="106%" height="110%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1" flood-color="#0f172a" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- ====================================================================== -->
  <!-- ROW 1: CLIENT SESSION & DETERMINISTIC ALGORITHM ENGINES (y = 20, h = 64) -->
  <!-- ====================================================================== -->

  <!-- Module 1: Learner Viewport & Input (x = 10 to 226, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="10" y="20" width="216" height="64" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.3" />
    <path d="M 10 25 A 5 5 0 0 1 15 20 L 221 20 A 5 5 0 0 1 226 25 L 226 34 L 10 34 Z" fill="#e2e8f0" />
    <text x="17" y="31" font-size="9.5" font-weight="700" fill="#0f172a">Module 1: Learner Viewport &amp; Input</text>
    <rect x="182" y="21.5" width="40" height="11" rx="2" fill="#cbd5e1" />
    <text x="202" y="30" text-anchor="middle" font-size="7.5" font-weight="700" fill="#1e293b">CLIENT</text>
    <text x="17" y="46" font-size="8.3" fill="#334155">• <tspan font-weight="600" fill="#0f172a">Viewport:</tspan> Mobile WebXR canvas &amp; AR frustum</text>
    <text x="17" y="58" font-size="8.3" fill="#334155">• <tspan font-weight="600" fill="#0f172a">Interaction:</tspan> Touch screen &amp; 3D raycast hit-testing</text>
    <text x="17" y="70" font-size="8.3" fill="#334155">• <tspan font-weight="600" fill="#0f172a">Control:</tspan> 1-click zero-tear algorithm hot-swapping</text>
  </g>

  <!-- Module 2: WebXR Session Core & 3D Fallback (x = 247 to 463, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="247" y="20" width="216" height="64" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.3" />
    <path d="M 247 25 A 5 5 0 0 1 252 20 L 458 20 A 5 5 0 0 1 463 25 L 463 34 L 247 34 Z" fill="#e2e8f0" />
    <text x="254" y="31" font-size="9.5" font-weight="700" fill="#0f172a">Module 2: WebXR Session Core</text>
    <rect x="415" y="21.5" width="44" height="11" rx="2" fill="#cbd5e1" />
    <text x="437" y="30" text-anchor="middle" font-size="7.5" font-weight="700" fill="#1e293b">SESSION</text>
    <text x="254" y="46" font-size="8.3" fill="#334155">• <tspan font-weight="600" fill="#0f172a">Session:</tspan> Single persistent XRSession (retains WebGL)</text>
    <text x="254" y="58" font-size="8.3" fill="#334155">• <tspan font-weight="600" fill="#0f172a">Fallback:</tspan> CANVAS_3D_FALLBACK with OrbitControls</text>
    <text x="254" y="70" font-size="8.0" fill="#64748b" font-style="italic">• (Boundary: physical Android ARCore unverified)</text>
  </g>

  <!-- Module 3: Deterministic Engines (x = 484 to 700, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="484" y="20" width="216" height="64" rx="5" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.3" />
    <path d="M 484 25 A 5 5 0 0 1 489 20 L 695 20 A 5 5 0 0 1 700 25 L 700 34 L 484 34 Z" fill="#bae6fd" />
    <text x="491" y="31" font-size="9.5" font-weight="700" fill="#0369a1">Module 3: Deterministic Engines</text>
    <rect x="653" y="21.5" width="43" height="11" rx="2" fill="#7dd3fc" />
    <text x="674" y="30" text-anchor="middle" font-size="7.5" font-weight="700" fill="#0c4a6e">ENGINES</text>
    <text x="491" y="46" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">BST:</tspan> L &lt; Node &lt; R • <tspan font-weight="600">Bubble Sort:</tspan> Inversion swaps</text>
    <text x="491" y="58" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">Binary Search:</tspan> [Low, Mid, High] interval halving</text>
    <text x="491" y="70" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">BFS:</tspan> FIFO queue dock • <tspan font-weight="600">Stack:</tspan> LIFO (depth ≤ 6)</text>
  </g>

  <!-- ====================================================================== -->
  <!-- ROW 2: PROCEDURAL 3D ENGINE & TELEMETRY INGESTION (y = 104, h = 64) -->
  <!-- ====================================================================== -->

  <!-- Module 6: EGEA Event Adapter (x = 10 to 226, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="10" y="104" width="216" height="64" rx="5" fill="#ecfdf5" stroke="#059669" stroke-width="1.3" />
    <path d="M 10 109 A 5 5 0 0 1 15 104 L 221 104 A 5 5 0 0 1 226 109 L 226 118 L 10 118 Z" fill="#a7f3d0" />
    <text x="17" y="115" font-size="9.5" font-weight="700" fill="#065f46">Module 6: EGEA Event Adapter</text>
    <rect x="180" y="105.5" width="42" height="11" rx="2" fill="#6ee7b7" />
    <text x="201" y="114" text-anchor="middle" font-size="7.5" font-weight="700" fill="#064e3b">ADAPTER</text>
    <text x="17" y="130" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">Sequencing:</tspan> Monotonic counter (k) &amp; timestamp</text>
    <text x="17" y="142" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">Debounce:</tspan> 250ms touch debounce &amp; event filter</text>
    <text x="17" y="154" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">canonicalizeStep:</tspan> Normalizes retry step keys</text>
  </g>

  <!-- Module 5: Scene Assembler & GPU Sync (x = 247 to 463, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="247" y="104" width="216" height="64" rx="5" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.3" />
    <path d="M 247 109 A 5 5 0 0 1 252 104 L 458 104 A 5 5 0 0 1 463 109 L 463 118 L 247 118 Z" fill="#bae6fd" />
    <text x="254" y="115" font-size="9.5" font-weight="700" fill="#0369a1">Module 5: Scene Assembler &amp; Sync</text>
    <rect x="414" y="105.5" width="45" height="11" rx="2" fill="#7dd3fc" />
    <text x="436" y="114" text-anchor="middle" font-size="7.5" font-weight="700" fill="#0c4a6e">RENDER</text>
    <text x="254" y="130" font-size="8.3" fill="#0c4a6e">• <tspan font-weight="600">Mapping:</tspan> Pure-render Three.js scene graph binding</text>
    <text x="254" y="142" font-size="8.3" fill="#0c4a6e">• <tspan font-weight="600">Motion:</tspan> Parametric step interpolation &amp; tweens</text>
    <text x="254" y="154" font-size="8.3" fill="#0c4a6e">• <tspan font-weight="600">Buffer:</tspan> Synchronous WebGL 60 FPS presentation</text>
  </g>

  <!-- Module 4: Procedural Three.js Visualizers (x = 484 to 700, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="484" y="104" width="216" height="64" rx="5" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.3" />
    <path d="M 484 109 A 5 5 0 0 1 489 104 L 695 104 A 5 5 0 0 1 700 109 L 700 118 L 484 118 Z" fill="#bae6fd" />
    <text x="491" y="115" font-size="9.5" font-weight="700" fill="#0369a1">Module 4: Procedural Visualizers</text>
    <rect x="648" y="105.5" width="48" height="11" rx="2" fill="#7dd3fc" />
    <text x="672" y="114" text-anchor="middle" font-size="7.5" font-weight="700" fill="#0c4a6e">THREE.JS</text>
    <text x="491" y="130" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">ThreeBST:</tspan> Dynamic node spheres &amp; link cylinders</text>
    <text x="491" y="142" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">ThreeBubbleSort:</tspan> Scaled bars &amp; swap height arcs</text>
    <text x="491" y="154" font-size="8.1" fill="#0c4a6e">• <tspan font-weight="600">ThreeBFS / Stack:</tspan> 3D graph dock &amp; glass chamber</text>
  </g>

  <!-- ====================================================================== -->
  <!-- ROW 3: PACING MODEL, POLICY & AR HUD (y = 188, h = 64) -->
  <!-- ====================================================================== -->

  <!-- Module 7: EWMA Temporal Pacing Model (x = 10 to 226, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="10" y="188" width="216" height="64" rx="5" fill="#ecfdf5" stroke="#059669" stroke-width="1.3" />
    <path d="M 10 193 A 5 5 0 0 1 15 188 L 221 188 A 5 5 0 0 1 226 193 L 226 202 L 10 202 Z" fill="#a7f3d0" />
    <text x="17" y="199" font-size="9.5" font-weight="700" fill="#065f46">Module 7: EWMA Pacing Model</text>
    <rect x="183" y="189.5" width="39" height="11" rx="2" fill="#6ee7b7" />
    <text x="202" y="198" text-anchor="middle" font-size="7.5" font-weight="700" fill="#064e3b">PACING</text>
    <text x="17" y="214" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">EWMA Formula:</tspan> S_k = α·L_k + (1-α)S_{k-1} (α = 0.3)</text>
    <text x="17" y="226" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">Timing Bands:</tspan> Rapid (&lt;1.5s) vs Deliberate (≥3.0s)</text>
    <text x="17" y="238" font-size="8.3" fill="#064e3b">• <tspan font-weight="600">Mastery Streaks:</tspan> Fades scaffold on ≥ 3 successes</text>
  </g>

  <!-- Module 8: Deterministic EGEA Policy Engine (x = 247 to 463, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="247" y="188" width="216" height="64" rx="5" fill="#ecfdf5" stroke="#059669" stroke-width="1.3" />
    <path d="M 247 193 A 5 5 0 0 1 252 188 L 458 188 A 5 5 0 0 1 463 193 L 463 202 L 247 202 Z" fill="#a7f3d0" />
    <text x="254" y="199" font-size="9.5" font-weight="700" fill="#065f46">Module 8: EGEA Policy Engine</text>
    <rect x="420" y="189.5" width="39" height="11" rx="2" fill="#6ee7b7" />
    <text x="439" y="198" text-anchor="middle" font-size="7.5" font-weight="700" fill="#064e3b">POLICY</text>
    <text x="254" y="214" font-size="8.1" fill="#064e3b">• <tspan font-weight="600">6 Scaffolds:</tspan> HINT, SLOWDOWN, HIGHLIGHT,</text>
    <text x="254" y="226" font-size="8.1" fill="#064e3b">  WORKED_EXAMPLE, PREREQ, REDUCE_GUIDANCE</text>
    <text x="254" y="238" font-size="8.1" fill="#064e3b">• <tspan font-weight="600">Latency:</tspan> Pure Policy 7 μs | Full Pipeline 14 μs</text>
  </g>

  <!-- Module 9: Spatial AR Tutor HUD (x = 484 to 700, w = 216) -->
  <g filter="url(#shadow)">
    <rect x="484" y="188" width="216" height="64" rx="5" fill="#fffbeb" stroke="#d97706" stroke-width="1.3" />
    <path d="M 484 193 A 5 5 0 0 1 489 188 L 695 188 A 5 5 0 0 1 700 193 L 700 202 L 484 202 Z" fill="#fde68a" />
    <text x="491" y="199" font-size="9.5" font-weight="700" fill="#92400e">Module 9: Spatial AR Tutor HUD</text>
    <rect x="650" y="189.5" width="46" height="11" rx="2" fill="#fcd34d" />
    <text x="673" y="198" text-anchor="middle" font-size="7.5" font-weight="700" fill="#78350f">AR HUD</text>
    <text x="491" y="214" font-size="8.3" fill="#78350f">• <tspan font-weight="600">Overlay:</tspan> ARTutorHUD frustum AR projection</text>
    <text x="491" y="226" font-size="8.3" fill="#78350f">• <tspan font-weight="600">Explainability:</tspan> Grounded code &amp; conf (0.80–0.95)</text>
    <text x="491" y="238" font-size="8.3" fill="#78350f">• <tspan font-weight="600">Scaffolds:</tspan> Directional cues &amp; reflection pauses</text>
  </g>

  <!-- ====================================================================== -->
  <!-- OFFLINE VERIFICATION BLOCK (Bottom Bar: y = 265 to 295) -->
  <!-- ====================================================================== -->
  <g filter="url(#shadow)">
    <rect x="10" y="265" width="690" height="28" rx="4" fill="#fafafa" stroke="#94a3b8" stroke-width="1.1" stroke-dasharray="4 3" />
    <text x="18" y="277" font-size="8.2" font-weight="700" fill="#475569">OFFLINE HARNESS (OUT-OF-LOOP VALIDATION):</text>
    <text x="240" y="277" font-size="8.0" fill="#334155">18 Automated Test Suites (1,437 Assertions Passed) • Full Algorithmic Parity Verification</text>
    <text x="18" y="289" font-size="8.0" fill="#334155">18-Case Challenge Suite &amp; 12-Case Boundary Suite (100% Policy Spec Conformance) • Scikit-Learn Recomputation (Macro-F1 = 1.000)</text>
  </g>

  <!-- ====================================================================== -->
  <!-- DATAFLOW CONNECTORS & LABELS -->
  <!-- ====================================================================== -->

  <!-- Perimeter Loop Path (Drawn FIRST so labels mask it cleanly) -->
  <path d="M 700 220 L 706 220 L 706 8 L 4 8 L 4 52 L 10 52" stroke="#d97706" stroke-width="1.4" marker-end="url(#arr-amber)" fill="none" />
  <rect x="210" y="2.5" width="290" height="11.5" rx="2.5" fill="#ffffff" stroke="#fcd34d" stroke-width="0.8" />
  <text x="355" y="10.5" text-anchor="middle" font-size="6.8" font-weight="700" fill="#92400e">Closed-Loop Spatial AR HUD Guidance Feedback</text>

  <!-- Row 1: M1 -> M2 -->
  <path d="M 226 52 L 247 52" stroke="#1e293b" stroke-width="1.3" marker-end="url(#arr-dark)" />
  <rect x="229" y="44.5" width="15" height="7.5" fill="#ffffff" />
  <text x="236.5" y="50.5" text-anchor="middle" font-size="6.5" font-weight="600" fill="#475569">Config</text>

  <!-- Row 1: M2 -> M3 -->
  <path d="M 463 52 L 484 52" stroke="#1e293b" stroke-width="1.3" marker-end="url(#arr-dark)" />
  <rect x="466" y="44.5" width="15" height="7.5" fill="#ffffff" />
  <text x="473.5" y="50.5" text-anchor="middle" font-size="6.5" font-weight="600" fill="#475569">Action</text>

  <!-- Vertical: M3 -> M4 -->
  <path d="M 592 84 L 592 104" stroke="#0284c7" stroke-width="1.4" marker-end="url(#arr-blue)" />
  <rect x="555" y="89.5" width="74" height="9" rx="2" fill="#ffffff" stroke="#bae6fd" stroke-width="0.8" />
  <text x="592" y="96" text-anchor="middle" font-size="6.8" font-weight="700" fill="#0369a1">Invariant State Delta</text>

  <!-- Row 2: M4 -> M5 (Leftwards in Row 2) -->
  <path d="M 484 136 L 463 136" stroke="#0284c7" stroke-width="1.3" marker-end="url(#arr-blue)" />
  <rect x="466" y="128.5" width="15" height="7.5" fill="#ffffff" />
  <text x="473.5" y="134.5" text-anchor="middle" font-size="6.5" font-weight="600" fill="#0369a1">Meshes</text>

  <!-- Row 2: M5 -> M1 (Frame presentation back to learner viewport) -->
  <path d="M 247 124 L 235 124 L 235 68 L 226 68" stroke="#0284c7" stroke-width="1.3" stroke-dasharray="3 2" marker-end="url(#arr-blue)" fill="none" />
  <rect x="228" y="91" width="14" height="15" fill="#ffffff" />
  <text x="235" y="98" text-anchor="middle" font-size="6.2" font-weight="600" fill="#0369a1">WebGL</text>
  <text x="235" y="105" text-anchor="middle" font-size="6.2" font-weight="600" fill="#0369a1">Frame</text>

  <!-- Vertical: M1 -> M6 (Telemetry Stream) -->
  <path d="M 118 84 L 118 104" stroke="#059669" stroke-width="1.3" marker-end="url(#arr-green)" />
  <rect x="76" y="89.5" width="84" height="9" rx="2" fill="#ffffff" stroke="#a7f3d0" stroke-width="0.8" />
  <text x="118" y="96" text-anchor="middle" font-size="6.8" font-weight="700" fill="#065f46">Interaction Telemetry (k, Δt)</text>

  <!-- Vertical: M6 -> M7 (Canonical Trace) -->
  <path d="M 118 168 L 118 188" stroke="#059669" stroke-width="1.3" marker-end="url(#arr-green)" />
  <rect x="74" y="173.5" width="88" height="9" rx="2" fill="#ffffff" stroke="#a7f3d0" stroke-width="0.8" />
  <text x="118" y="180" text-anchor="middle" font-size="6.8" font-weight="700" fill="#065f46">Canonical Trace &amp; Latency</text>

  <!-- Row 3: M7 -> M8 -->
  <path d="M 226 220 L 247 220" stroke="#059669" stroke-width="1.3" marker-end="url(#arr-green)" />
  <rect x="229" y="212.5" width="15" height="7.5" fill="#ffffff" />
  <text x="236.5" y="218.5" text-anchor="middle" font-size="6.5" font-weight="600" fill="#065f46">Pacing</text>

  <!-- Row 3: M8 -> M9 -->
  <path d="M 463 220 L 484 220" stroke="#059669" stroke-width="1.3" marker-end="url(#arr-green)" />
  <rect x="466" y="212.5" width="15" height="7.5" fill="#ffffff" />
  <text x="473.5" y="218.5" text-anchor="middle" font-size="6.5" font-weight="600" fill="#065f46">Decision</text>

  <!-- Dashed Validation Lines from Module 10 to Module 3 and Module 8 -->
  <path d="M 640 265 L 640 84" stroke="#64748b" stroke-width="1.1" stroke-dasharray="3 3" marker-end="url(#arr-dash)" fill="none" />
  <path d="M 355 265 L 355 252" stroke="#64748b" stroke-width="1.1" stroke-dasharray="3 3" marker-end="url(#arr-dash)" fill="none" />
</svg>"""
    return svg

def render_figure():
    out_mmd = 'submission/review_release/figures/fig1_system_architecture.mmd'
    out_svg = 'submission/review_release/figures/fig1_system_architecture.svg'
    out_png = 'submission/review_release/figures/fig1_system_architecture.png'

    # Save synchronized Mermaid source
    with open(out_mmd, 'w', encoding='utf-8') as f:
        f.write(MERMAID_SRC.strip() + '\n')
    print(f"Saved synchronized Mermaid source to {out_mmd}")

    # Save publication-grade vector SVG
    svg_content = build_svg()
    with open(out_svg, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Saved publication SVG to {out_svg}")

    # Generate preview html for high-res rasterization via Playwright Edge
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 0; background: #ffffff; }}
  svg {{ display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""
    
    preview_path = 'scripts/svg_preview.html'
    with open(preview_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        # 710 * 3 = 2130px wide (exact 308 DPI at 6.95 inches)
        page = browser.new_page(device_scale_factor=3, viewport={'width': 710, 'height': 300})
        page.goto('file:///' + os.path.abspath(preview_path).replace('\\', '/'))
        page.wait_for_selector('svg')
        
        svg_el = page.locator('svg')
        svg_el.screenshot(path=out_png)
        print(f"Saved high-res 300+ DPI PNG to {out_png}")
        browser.close()

if __name__ == '__main__':
    render_figure()
