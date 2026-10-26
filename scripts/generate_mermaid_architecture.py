import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

MERMAID_SRC = """
flowchart TD
    %% ------------------------------------------------------------------------
    %% GROUP A: LEARNER INTERACTION
    %% ------------------------------------------------------------------------
    subgraph GA ["<b>GROUP A: LEARNER INTERACTION &amp; CONTROLS</b>"]
        direction TB
        subgraph GA_ROW [" "]
            direction LR
            L_UI["<b>Learner / Browser Viewport</b><br/>• Mobile WebXR / Canvas Viewport<br/>• Touch Screen / Raycast Selection<br/>• Spatial HUD Overlay View"]
            L_SEL["<b>Algorithm Selector &amp; Controls</b><br/>• 1-Click Topic Hot-Swapping<br/>• Interactive Step / Traversal Input<br/>• Session Reset &amp; Target Refresh"]
        end
        L_EVT["<b>Interaction Event Generator</b><br/>Captures: attemptedAction, expectedAction, stepIdentifier, isCorrect, latencyMs, stateContext"]
        
        GA_ROW --> L_EVT
    end

    %% ------------------------------------------------------------------------
    %% GROUP B: DETERMINISTIC ALGORITHM EXECUTION ENGINES
    %% ------------------------------------------------------------------------
    subgraph GB ["<b>GROUP B: DETERMINISTIC ALGORITHM EXECUTION ENGINES</b><br/><i>(Authoritative State Machines &amp; Mathematical Invariant Validators)</i>"]
        direction TB
        subgraph GB_ENGINES [" "]
            direction TB
            subgraph GB_TOP [" "]
                direction LR
                E_BST["<b>BSTEngine</b><br/>Binary Search Tree<br/>• Invariant Reducer<br/>• Left &lt; Node &lt; Right<br/>• Insert &amp; Search State"]
                E_BUB["<b>BubbleSortEngine</b><br/>Bubble Sort<br/>• Adjacent Inversions<br/>• Stepwise Bar Swaps<br/>• Pass-by-Pass State"]
                E_BIN["<b>BinarySearchEngine</b><br/>Binary Search<br/>• [Low, Mid, High]<br/>• Space Contraction<br/>• Comparison Bounds"]
            end
            subgraph GB_BOT [" "]
                direction LR
                E_BFS["<b>BFSEngine</b><br/>Breadth-First Search<br/>• Circular Graph Topology<br/>• Frontier FIFO Queue<br/>• Level-Order Traversal"]
                E_STK["<b>StackEngine</b><br/>Stack (LIFO)<br/>• Push, Pop, &amp; Peek<br/>• Capacity Boundary (6)<br/>• Overflow/Underflow"]
            end
        end
    end

    %% ------------------------------------------------------------------------
    %% GROUP C: WEBXR & 3D SPATIAL RENDERING LAYER
    %% ------------------------------------------------------------------------
    subgraph GC ["<b>GROUP C: WEBXR &amp; 3D SPATIAL RENDERING LAYER</b>"]
        direction TB
        subgraph GC_SPLIT [" "]
            direction LR
            subgraph GC_VIS ["<b>Three.js Procedural Visualizers</b>"]
                direction TB
                V_BST["<b>ThreeBSTVisualizer:</b> 3D Spheres &amp; Directed Links"]
                V_BUB["<b>ThreeBubbleSortVisualizer:</b> Scaled Cylinder Bars"]
                V_BIN["<b>ThreeBinarySearchVisualizer:</b> Numbered Array Blocks"]
                V_BFS["<b>ThreeBFSVisualizer:</b> Graph Nodes &amp; FIFO Queue Dock"]
                V_STK["<b>ThreeStackVisualizer:</b> 3D Chamber &amp; Stacked Slabs"]
            end

            subgraph GC_MGR ["<b>Session &amp; Viewport Manager (WebXRARService)</b>"]
                direction TB
                XR_CORE["<b>Persistent WebXR Session Core</b><br/>• Continuous XRSession Lifecycle<br/>• Preserves WebGLRenderer &amp; Context<br/>• Instant Algorithm Hot-Swapping<br/><i>(Physical ARCore: Simulation Boundary)</i>"]
                XR_FALL["<b>CANVAS_3D_FALLBACK Engine</b><br/>• OrbitControls (Touch / Mouse)<br/>• Upright (+Y) Spatial Orientation<br/>• Non-WebXR Desktop / Tablet Fallback"]
                XR_CORE -.->|Auto-Fallback| XR_FALL
            end
        end
        GC_VIS ==>|Scene Graph Meshes| XR_CORE
    end

    %% ------------------------------------------------------------------------
    %% GROUP D: EGEA ADAPTATION PIPELINE
    %% ------------------------------------------------------------------------
    subgraph GD ["<b>GROUP D: EGEA ADAPTATION PIPELINE</b><br/><i>(Sub-Millisecond Deterministic Scaffolding: Pure Policy 7 μs, Pipeline 14 μs)</i>"]
        direction TB
        subgraph GD_PIPE ["Adaptation Data Pipeline"]
            direction LR
            D_ADP["<b>EGEA Event Adapter</b><br/><i>(EGEAEventAdapter)</i><br/>• Monotonic Counter (k)<br/>• 250ms Touch Debounce<br/>• Telemetry Validation"]
            D_CAN["<b>Step Canonicalizer</b><br/><i>(canonicalizeStep)</i><br/>• Canonical String Keys<br/>• Cross-Retry Mapping<br/>• Disambiguates Aliases"]
            D_PAC["<b>EWMA Pacing Model</b><br/><i>(EGEAPacingModel)</i><br/>• S_k = α·L_k + (1-α)·S_{k-1}<br/>• Rapid Guessing (&lt;1500ms)<br/>• Reflection (≥3000ms)"]
            
            D_ADP -->|Raw Event| D_CAN
            D_CAN -->|Canonical Trace| D_PAC
        end

        subgraph GD_TAX ["<b>EGEA Policy Engine (EGEAPolicyEngine) — 6-Tier Scaffolding Taxonomy</b>"]
            direction TB
            subgraph GD_TAX_1 [" "]
                direction LR
                T_HINT["<b>CONTEXTUAL_HINT</b><br/>Directional spatial cue on isolated conceptual error"]
                T_SLOW["<b>STEPWISE_SLOWDOWN</b><br/>Enforced reflection pause upon rapid guessing burst"]
                T_HIGH["<b>HIGHLIGHT_ELEMENT</b><br/>Target salience pulse on spatial attention lapse"]
            end
            subgraph GD_TAX_2 [" "]
                direction LR
                T_WORK["<b>WORKED_EXAMPLE</b><br/>Full step demonstration after 3+ persistent failures"]
                T_PRER["<b>PREREQUISITE_REVIEW</b><br/>Foundational topic recall on systemic error pattern"]
                T_REDU["<b>REDUCE_GUIDANCE</b><br/>Scaffold fading after 3+ unassisted mastery streak"]
            end
        end

        D_PAC ==>|Smoothed Pacing &amp; Invariants| GD_TAX
    end

    %% ------------------------------------------------------------------------
    %% GROUP E: SPATIAL HUD FEEDBACK & AUTOMATED VERIFICATION
    %% ------------------------------------------------------------------------
    subgraph GE ["<b>GROUP E: FEEDBACK &amp; INDEPENDENT VERIFICATION</b>"]
        direction TB
        subgraph GE_SPLIT [" "]
            direction LR
            subgraph GE_HUD ["<b>Spatial AR Tutor HUD (ARTutorHUD) — Live Runtime Feedback</b>"]
                direction TB
                HUD_BOX["<b>Real-Time Adaptive HUD Overlay</b><br/>• Dynamic Intervention Badges (Hint, Warning, Encouragement)<br/>• Machine-Readable Grounded Rationale Code<br/>• Confidence Metric (0.80–0.95) &amp; Pedagogical Explanation"]
            end

            subgraph GE_VERIF ["<b>Automated Verification &amp; Benchmarks (Non-Runtime Boundary)</b>"]
                direction TB
                V_CHAL["<b>18-Case Challenge Suite:</b> Canonical Trajectories (100% Acc)"]
                V_STRS["<b>12-Case Boundary Stress Suite:</b> Jitter &amp; Pacing Stress (100% Acc)"]
                V_UNIT["<b>18 Test Suites (1,437 Assertions):</b> tsc -b &amp; Oxlint Clean"]
            end
        end
    end

    %% ------------------------------------------------------------------------
    %% LABELED DIRECTIONAL DATAFLOW CONNECTIONS
    %% ------------------------------------------------------------------------
    L_EVT ==>|1. User Attempted Action| GB_ENGINES
    GB_ENGINES ==>|2. Invariant State &amp; Validation Result| GC_VIS
    GB_ENGINES -.->|3. Invariant Telemetry Stream| D_ADP
    GD_TAX ==>|4. Intervention Decision &amp; Rationale| HUD_BOX
    HUD_BOX -.->|5. Closed-Loop Spatial Guidance Feedback| L_UI
    L_SEL -.->|6. Zero-Tear Algorithm Hot-Swapping| XR_CORE
    GE_VERIF -.-|Offline Rigorous Validation| GD_TAX

    %% ------------------------------------------------------------------------
    %% VISUAL STYLING
    %% ------------------------------------------------------------------------
    classDef clientGroup fill:#f8fafc,stroke:#475569,stroke-width:1.5px;
    classDef engineGroup fill:#f0f9ff,stroke:#0284c7,stroke-width:1.5px;
    classDef renderGroup fill:#f5f3ff,stroke:#7c3aed,stroke-width:1.5px;
    classDef egeaGroup fill:#ecfdf5,stroke:#059669,stroke-width:1.5px;
    classDef hudGroup fill:#fffbeb,stroke:#d97706,stroke-width:1.5px;
    classDef verifGroup fill:#fef2f2,stroke:#dc2626,stroke-width:1.2px,stroke-dasharray: 4 4;

    class GA clientGroup;
    class GB engineGroup;
    class GC renderGroup;
    class GD egeaGroup;
    class GE_HUD hudGroup;
    class GE_VERIF verifGroup;
"""

def generate():
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      margin: 0;
      padding: 12px;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }}
    #container {{
      display: inline-block;
      background: white;
      padding: 6px;
    }}
    .mermaid {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }}
    .node rect, .node circle, .node polygon {{
      stroke-width: 1.2px !important;
      rx: 5px !important;
      ry: 5px !important;
    }}
    .cluster rect {{
      rx: 8px !important;
      ry: 8px !important;
    }}
    .edgeLabel {{
      background-color: #ffffff !important;
      padding: 2px 5px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      border-radius: 4px !important;
      border: 1px solid #94a3b8 !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }}
    .legend-box {{
      margin-top: 10px;
      padding: 8px 14px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 11.5px;
      color: #1e293b;
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }}
    .legend-item {{
      display: flex;
      align-items: center;
      gap: 7px;
    }}
    .legend-line-solid {{
      width: 26px;
      height: 3px;
      background: #0f172a;
    }}
    .legend-line-telemetry {{
      width: 26px;
      height: 0;
      border-top: 2.5px dashed #0284c7;
    }}
    .legend-line-feedback {{
      width: 26px;
      height: 0;
      border-top: 2.5px dashed #d97706;
    }}
    .legend-line-verif {{
      width: 26px;
      height: 0;
      border-top: 2.5px dotted #dc2626;
    }}
  </style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({{
      startOnLoad: true,
      theme: 'default',
      flowchart: {{
        curve: 'basis',
        nodeSpacing: 16,
        rankSpacing: 22,
        padding: 10,
        useMaxWidth: false
      }},
      themeVariables: {{
        primaryColor: '#f0f9ff',
        primaryBorderColor: '#0284c7',
        primaryTextColor: '#0f172a',
        lineColor: '#334155',
        fontSize: '12px'
      }}
    }});
  </script>
</head>
<body>
  <div id="container">
    <div class="mermaid">
{MERMAID_SRC}
    </div>
    <div class="legend-box">
      <div class="legend-item">
        <div class="legend-line-solid"></div>
        <span><b>Solid Double Line:</b> Authoritative Runtime Execution &amp; State Flow</span>
      </div>
      <div class="legend-item">
        <div class="legend-line-telemetry"></div>
        <span><b>Blue Dashed:</b> Invariant Telemetry Stream &amp; Hot-Swap Control</span>
      </div>
      <div class="legend-item">
        <div class="legend-line-feedback"></div>
        <span><b>Amber Dashed:</b> Closed-Loop HUD Guidance Feedback</span>
      </div>
      <div class="legend-item">
        <div class="legend-line-verif"></div>
        <span><b>Red Dotted:</b> Offline Benchmark Validation Harness</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

    preview_path = 'scripts/mermaid_preview.html'
    with open(preview_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    out_svg = 'submission/review_release/figures/fig1_system_architecture.svg'
    out_png = 'submission/review_release/figures/fig1_system_architecture.png'
    out_mmd = 'submission/review_release/figures/fig1_system_architecture.mmd'

    with open(out_mmd, 'w', encoding='utf-8') as f:
        f.write(MERMAID_SRC.strip())

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        # Use device_scale_factor=3 for razor-sharp 300+ DPI rasterization
        page = browser.new_page(device_scale_factor=3)
        page.goto('file:///' + os.path.abspath(preview_path).replace('\\', '/'))
        page.wait_for_selector('svg .node', timeout=15000)
        
        # Save SVG
        svg_content = page.eval_on_selector('div.mermaid', 'el => el.innerHTML')
        with open(out_svg, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"Exported vector SVG to: {out_svg}")

        # Screenshot the container
        container = page.wait_for_selector('#container')
        container.screenshot(path=out_png)
        print(f"Exported high-res 300+ DPI PNG to: {out_png}")

        browser.close()

if __name__ == '__main__':
    generate()
