"""
Generate publication-grade IEEE system architecture diagram (Figure 1).
Maintains synchronized Mermaid source (.mmd), vector SVG (.svg), and 300+ DPI high-res PNG (.png).
"""

import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

scripts_dir = os.path.dirname(os.path.abspath(__file__))
if scripts_dir not in sys.path:
    sys.path.insert(0, scripts_dir)

from generate_ieee_architecture import render_figure

MERMAID_SRC = """flowchart LR
    %% ========================================================================
    %% PILLAR I: CLIENT & SESSION LAYER
    %% ========================================================================
    subgraph P1 ["<b>PILLAR I: CLIENT &amp; SESSION LAYER</b>"]
        direction TB
        M1["<b>Module 1: Learner Viewport &amp; UI</b><br/>• Mobile WebXR Canvas &amp; Frustum Overlay<br/>• Touch &amp; Raycast Hit-Testing Ingestion<br/>• 1-Click Zero-Tear Algorithm Hot-Swapping<br/>• Dispatches Action, Step ID, and Latency"]
        
        M2["<b>Module 2: WebXR Session Core</b><br/>• Persistent Single XRSession Lifecycle<br/>• Preserves WebGLRenderer &amp; GPU Resources<br/>• Seamless Multi-Algorithm Scene Binding<br/><i>(Boundary: Physical ARCore Simulation Only)</i>"]

        M3["<b>Module 3: Non-XR 3D Fallback Engine</b><br/>• CANVAS_3D_FALLBACK with OrbitControls<br/>• Multi-Touch &amp; Mouse Drag / Rotate / Pan<br/>• Enforces Upright (+Y) Spatial Gravitational Axis<br/>• Full Algorithmic &amp; EGEA Scaffolding Parity"]

        M1 -->|Session Config| M2
        M2 -.->|Fallback on Non-XR| M3
    end

    %% ========================================================================
    %% PILLAR II: ALGORITHM CORE & 3D RENDERING
    %% ========================================================================
    subgraph P2 ["<b>PILLAR II: ALGORITHM CORE &amp; 3D ENGINE</b>"]
        direction TB
        M4["<b>Module 4: 5 Deterministic DSA Engines</b><br/>• <b>BST:</b> Left &lt; Node &lt; Right Invariant Reducer<br/>• <b>Bubble Sort:</b> Adjacent Inversion Step Swaps<br/>• <b>Binary Search:</b> [Low, Mid, High] Range Halving<br/>• <b>BFS:</b> Topological FIFO Queue Expansion<br/>• <b>Stack:</b> LIFO Push / Pop (Max Depth 6)"]

        M5["<b>Module 5: Procedural Three.js Visualizers</b><br/>• <b>ThreeBST:</b> Spherical Nodes &amp; Link Cylinders<br/>• <b>ThreeBubbleSort:</b> Scaled Bar Cylinders &amp; Swaps<br/>• <b>ThreeBinarySearch:</b> Indexed Block Array<br/>• <b>ThreeBFS:</b> Graph Network &amp; Floating Queue Dock<br/>• <b>ThreeStack:</b> 3D Glass Chamber &amp; Stacked Slabs"]

        M6["<b>Module 6: Scene Assembler &amp; Sync</b><br/>• Pure-Render Scene Graph State Mapping<br/>• Parametric Animation &amp; Step Interpolation<br/>• Direct WebGL Frame Buffer Synchronization<br/>• Instant Mesh Disposal on Topic Hot-Swap"]

        M4 ==>|Invariant State| M5
        M5 -->|Mesh Geometry| M6
    end

    %% ========================================================================
    %% PILLAR III: EGEA ADAPTATION & HUD FEEDBACK
    %% ========================================================================
    subgraph P3 ["<b>PILLAR III: EGEA ADAPTATION &amp; HUD</b>"]
        direction TB
        M7["<b>Module 7: Event Adapter &amp; Pacing Model</b><br/>• Monotonic Sequence Counter (k)<br/>• 250ms Touch Debounce Filtering<br/>• <b>canonicalizeStep:</b> Alias &amp; Suffix Mapping<br/>• <b>EWMA Pacing:</b> S_k = α·L_k + (1-α)S_{k-1} (α=0.3)<br/>• Rapid Guessing (&lt;1.5s) vs Deliberate (≥3.0s)"]

        M8["<b>Module 8: EGEA Deterministic Policy Engine</b><br/>• <b>6-Tier Grounded Scaffolding Taxonomy:</b><br/>  [1] CONTEXTUAL_HINT (Directional Cue)<br/>  [2] STEPWISE_SLOWDOWN (Reflection Pause)<br/>  [3] HIGHLIGHT_ELEMENT (Salience Pulse)<br/>  [4] WORKED_EXAMPLE (Full Step Demo)<br/>  [5] PREREQUISITE_REVIEW (Concept Recall)<br/>  [6] REDUCE_GUIDANCE (Scaffold Fading)<br/>• Latency: Pure Policy 7 μs | Full Pipeline 14 μs"]

        M9["<b>Module 9: Spatial AR Tutor HUD Feedback</b><br/>• Real-Time Viewport AR Frustum Overlay<br/>• Grounded Rationale Code &amp; Confidence (0.80–0.95)<br/>• Dynamic Scaffolding Badges &amp; Cues<br/>• Closed-Loop Pedagogical Feedback to Learner"]

        M7 ==>|Canonical Trace &amp; Pacing| M8
        M8 ==>|Scaffolding Decision| M9
    end

    %% ========================================================================
    %% INTER-MODULE CROSS-COLUMN DATAFLOWS
    %% ========================================================================
    M1 ==>|1. User Attempted Action| M4
    M6 ==>|2. WebGL Frame Presentation| M1
    M4 -.->|3. Invariant Telemetry Stream| M7
    M9 -.->|4. Closed-Loop HUD Guidance| M1

    %% ========================================================================
    %% RESTRAINED SCIENTIFIC STYLING (MATCHING REFERENCE A)
    %% ========================================================================
    classDef clientCol fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    classDef engineCol fill:#f0f9ff,stroke:#0284c7,stroke-width:1.5px;
    classDef egeaCol fill:#ecfdf5,stroke:#059669,stroke-width:1.5px;

    classDef card1 fill:#ffffff,stroke:#94a3b8,stroke-width:1.2px;
    classDef card2 fill:#ffffff,stroke:#38bdf8,stroke-width:1.2px;
    classDef card3 fill:#ffffff,stroke:#34d399,stroke-width:1.2px;

    class P1 clientCol;
    class P2 engineCol;
    class P3 egeaCol;

    class M1,M2,M3 card1;
    class M4,M5,M6 card2;
    class M7,M8,M9 card3;
"""

def generate():
    out_mmd = 'submission/review_release/figures/fig1_system_architecture.mmd'
    with open(out_mmd, 'w', encoding='utf-8') as f:
        f.write(MERMAID_SRC.strip())
    print(f"Saved synchronized Mermaid source to: {out_mmd}")

    # Generate publication vector SVG and high-res 300+ DPI PNG
    render_figure()

if __name__ == '__main__':
    generate()
