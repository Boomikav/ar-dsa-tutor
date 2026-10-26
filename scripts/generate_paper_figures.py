"""
Generate high-resolution (300 DPI) publication-quality figures for the IEEE paper:
'AR-DSA Tutor: A Web-Based Spatial Algorithm Visualization System with Execution-Grounded Explainable Adaptation'
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('submission/review_release/figures', exist_ok=True)

# Set global publication styling
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.size'] = 9
plt.rcParams['axes.labelsize'] = 9
plt.rcParams['axes.titlesize'] = 10
plt.rcParams['xtick.labelsize'] = 8
plt.rcParams['ytick.labelsize'] = 8
plt.rcParams['legend.fontsize'] = 8
plt.rcParams['figure.titlesize'] = 11

def generate_figure_1_architecture():
    fig, ax = plt.subplots(figsize=(7.16, 3.4), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 50)
    ax.axis('off')

    # Background subtle styling
    def draw_box(x, y, w, h, title, subtitle, color_border, color_bg):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5",
                                      facecolor=color_bg, edgecolor=color_border, linewidth=1.2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h*0.62, title, ha='center', va='center', fontsize=8, fontweight='bold', color='#0f172a')
        ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center', fontsize=6.8, color='#334155', style='italic')

    # Column 1: Client Application & Engines
    draw_box(2, 33, 28, 14, "Module 1: 5 Deterministic DSA Engines", "BST, Bubble Sort, Binary Search, BFS, Stack\n[Invariant Reducers & Mistake Detection]", "#0284c7", "#f0f9ff")
    draw_box(2, 17, 28, 13, "Module 2: Procedural Spatial Visualizers", "Three.js 0.186 • Procedural Meshes\n[Upright +Y Orientation, -1.2m Offset]", "#0284c7", "#f0f9ff")
    draw_box(2, 2, 28, 12, "Module 3: Persistent WebXR Session", "Continuous XRSession Lifecycle\n[Zero-Tear Algorithm Hot-Swapping]", "#0284c7", "#f0f9ff")

    # Column 2: Telemetry Ingestion & Pacing
    draw_box(36, 33, 28, 14, "Module 4: Event Telemetry & Debounce", "Monotonic Sequence Counter\n[250ms Touch Debounce & Canonicalization]", "#4f46e5", "#eef2ff")
    draw_box(36, 17, 28, 13, "Module 5: EWMA Temporal Pacing", "Alpha=0.5 Exponential Window\n[Impulsive Guessing vs Deliberate Reflection]", "#4f46e5", "#eef2ff")
    draw_box(36, 2, 28, 12, "Module 6: Cross-Platform Fallback", "CANVAS_3D_FALLBACK Engine\n[Touch OrbitControls on Non-WebXR]", "#4f46e5", "#eef2ff")

    # Column 3: Adaptation & HUD Presentation
    draw_box(70, 33, 28, 14, "Module 7: Deterministic EGEA Policy", "6-Tier Pedagogical Scaffolding\n[Sub-10 microsecond Machine Rationales]", "#059669", "#ecfdf5")
    draw_box(70, 17, 28, 13, "Module 8: Explainable Spatial HUD", "ARTutorHUD Real-Time Overlays\n[Grounded Badge, Rationale, Confidence]", "#059669", "#ecfdf5")
    draw_box(70, 2, 28, 12, "Module 9: Asynchronous LLM Advisor", "Decoupled Conversational Guidance\n[Non-Blocking Socratic Follow-Up]", "#059669", "#ecfdf5")

    # Connecting Arrows
    def draw_arrow(x1, y1, x2, y2, label=""):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#475569", lw=1.2, shrinkA=2, shrinkB=2))
        if label:
            ax.text((x1+x2)/2, (y1+y2)/2 + 1.2, label, ha='center', va='center', fontsize=6.5, color='#0f172a', fontweight='semibold')

    # Flow 1: Engine -> Telemetry -> Policy -> HUD
    draw_arrow(30, 40, 36, 40, "Raw Step")
    draw_arrow(64, 40, 70, 40, "Normalized Event")
    draw_arrow(84, 33, 84, 30, "Intervention")

    # Flow 2: Spatial Visualizer -> Persistent Session
    draw_arrow(16, 17, 16, 14, "Scene Group")
    draw_arrow(30, 8, 36, 8, "XR Fallback")

    # Flow 3: Pacing -> Policy
    draw_arrow(50, 33, 50, 30)
    draw_arrow(50, 30, 50, 24)
    draw_arrow(64, 23.5, 78, 33, "Pacing Metrics")

    # Flow 4: HUD -> LLM async
    draw_arrow(84, 17, 84, 14, "Async Query")

    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig1_system_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated fig1_system_architecture.png")

def generate_figure_2_latency():
    fig, ax = plt.subplots(figsize=(3.45, 2.5), dpi=300)

    stages = ['Pure Policy\n(Steady State)', 'Pure Policy\n(P95 Latency)', 'End-to-End\n(Ingest + Decision)', 'End-to-End\n(P95 Latency)']
    latencies = [0.007, 0.020, 0.014, 0.024] # in milliseconds
    colors = ['#0284c7', '#0369a1', '#059669', '#047857']

    bars = ax.bar(stages, latencies, color=colors, width=0.55, edgecolor='#1e293b', linewidth=0.8)
    ax.set_ylabel('Execution Latency (ms)', fontweight='bold')
    ax.set_title('Empirical EGEA Decision Latency (N = 1000)', fontweight='bold', pad=8)
    ax.set_ylim(0, 0.035)

    # Add 60 FPS frame budget annotation line (16.67ms is way above, so show relative scale)
    ax.axhline(y=0.030, color='#dc2626', linestyle='--', linewidth=0.8, alpha=0.7)
    ax.text(1.5, 0.0315, '0.18% of 16.6ms Render Frame Budget', ha='center', va='bottom', fontsize=7, color='#dc2626', fontweight='bold')

    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 0.001, f'{h*1000:.0f} μs', ha='center', va='bottom', fontsize=7.5, fontweight='bold', color='#0f172a')

    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig2_latency_benchmark.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated fig2_latency_benchmark.png")

def generate_figure_3_accuracy_comparison():
    fig, ax = plt.subplots(figsize=(3.45, 2.5), dpi=300)

    categories = ['Fixed Hint\nBaseline', 'Simple Error\nRule Baseline', 'Matched-Hist.\nBaseline', 'EGEA Adaptive\nPolicy (Ours)']
    # Data from Table: Challenge Set (18) and Held-Out (12)
    challenge_acc = [33.3, 50.0, 83.3, 100.0]
    held_out_acc = [58.3, 75.0, 75.0, 100.0]

    x = range(len(categories))
    width = 0.35

    rects1 = ax.bar([i - width/2 for i in x], challenge_acc, width, label='Challenge Suite (N=18)', color='#38bdf8', edgecolor='#0369a1', lw=0.8)
    rects2 = ax.bar([i + width/2 for i in x], held_out_acc, width, label='Held-Out Suite (N=12)', color='#10b981', edgecolor='#047857', lw=0.8)

    ax.set_ylabel('Prediction Accuracy (%)', fontweight='bold')
    ax.set_title('Pedagogical Intervention Accuracy', fontweight='bold', pad=8)
    ax.set_xticks(list(x))
    ax.set_xticklabels(categories, fontsize=7.5)
    ax.set_ylim(0, 115)
    ax.legend(loc='upper left', framealpha=0.9)

    for r in rects1:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.5, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.8, color='#0369a1', fontweight='bold')

    for r in rects2:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.5, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.8, color='#047857', fontweight='bold')

    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig3_accuracy_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated fig3_accuracy_comparison.png")

if __name__ == '__main__':
    generate_figure_1_architecture()
    generate_figure_2_latency()
    generate_figure_3_accuracy_comparison()
