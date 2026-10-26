"""
Generate high-resolution (300 DPI) publication-quality figures for the IEEE paper:
'AR-DSA Tutor: A Web-Based Spatial Algorithm Visualization System with Execution-Grounded Explainable Adaptation'
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('submission/review_release/figures', exist_ok=True)

# Set global publication styling matching IEEE transactions / conference standards
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['font.size'] = 8.0
plt.rcParams['axes.labelsize'] = 8.0
plt.rcParams['axes.titlesize'] = 8.8
plt.rcParams['xtick.labelsize'] = 7.2
plt.rcParams['ytick.labelsize'] = 7.2
plt.rcParams['legend.fontsize'] = 7.0
plt.rcParams['figure.titlesize'] = 9.5

def generate_figure_1_architecture():
    # Single-column IEEE figure: 3.4 inches wide by 4.85 inches high
    fig, ax = plt.subplots(figsize=(3.45, 4.85), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    def draw_box(x, y, w, h, title, subtitle, border_color, bg_color, title_color='#0f172a'):
        rect = patches.FancyBboxPatch(
            (x, y), w, h, boxstyle="round,pad=0.5",
            facecolor=bg_color, edgecolor=border_color, linewidth=1.1
        )
        ax.add_patch(rect)
        ax.text(x + w/2, y + h*0.70, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color=title_color)
        ax.text(x + w/2, y + h*0.30, subtitle, ha='center', va='center', fontsize=6.3, color='#334155', linespacing=1.2)

    def draw_down_arrow(x, y_start, y_end, label=""):
        ax.annotate(
            '', xy=(x, y_end), xytext=(x, y_start),
            arrowprops=dict(arrowstyle="-|>", color="#334155", lw=1.1, mutation_scale=8)
        )
        if label:
            ax.text(x + 1.5, (y_start + y_end)/2, label, ha='left', va='center', fontsize=5.8, color='#0f172a', fontweight='semibold',
                    bbox=dict(boxstyle='square,pad=0.1', facecolor='#ffffff', edgecolor='none', alpha=0.9))

    # Layer 1: Deterministic Algorithm Engines (y: 84 to 98)
    draw_box(4, 84, 92, 14, "1. Deterministic DSA Engines",
             "BST • Bubble Sort • Binary Search • BFS Graph • Stack\n[Invariant Reducers, State Machines & Mistake Classification]",
             '#0284c7', '#f0f9ff', '#0369a1')

    draw_down_arrow(50, 84, 80, "Algorithmic State & Invariants")

    # Layer 2: Spatial Presentation & WebXR Session (y: 65 to 80)
    draw_box(4, 65, 92, 15, "2. Spatial WebXR Layer (Three.js 0.186)",
             "Procedural 3D Visualizers • Gravity-Aligned Tabletop Anchors\nWebXRARService: Continuous XRSession • Algorithm Hot-Swapping\n[Automatic CANVAS_3D_FALLBACK for non-WebXR Desktop Devices]",
             '#0284c7', '#f0f9ff', '#0369a1')

    draw_down_arrow(50, 65, 61, "Learner Actions & Latency Δt_k")

    # Layer 3: Telemetry & EWMA Pacing Model (y: 46 to 61)
    draw_box(4, 46, 92, 15, "3. EGEA Telemetry Ingestion & EWMA Pacing",
             "Event Adapter: Monotonic Counter k • 250ms Touch Debounce\nEWMA Pacing Model: T_k = 0.5·Δt_k + 0.5·T_{k-1}\n[Disentangles Impulsive Guessing (T_k < 1.5s) from Reflection]",
             '#4f46e5', '#eef2ff', '#4338ca')

    draw_down_arrow(50, 46, 42, "Validated Event Stream & Pacing Metrics")

    # Layer 4: Deterministic Policy Engine (y: 27 to 42)
    draw_box(4, 27, 92, 15, "4. Deterministic EGEA Policy Engine",
             "6-Tier Pedagogical Scaffolding Rules\nStepwise Slowdown • Worked Example • Prereq Review\nHighlight Element • Contextual Hint • Reduce Guidance\n[Steady-State Latency: 7 μs (Mean: 10 μs, P95: 20 μs)]",
             '#059669', '#ecfdf5', '#047857')

    draw_down_arrow(50, 27, 23, "Pedagogical Decision & Rationale Code")

    # Layer 5: Explainable Spatial HUD (y: 8 to 23)
    draw_box(4, 8, 92, 15, "5. Explainable Spatial HUD (ARTutorHUD)",
             "Real-Time Grounded Badge • Rationale Code • Confidence %\nRemediation Highlighting • Scaffolding Fading on Mastery\n[Decoupled Asynchronous LLM Socratic Advisor (<10μs Decoupled)]",
             '#059669', '#ecfdf5', '#047857')

    # Feedback loop arrow from HUD up to Spatial WebXR Layer
    ax.annotate(
        '', xy=(2, 72.5), xytext=(2, 15.5),
        arrowprops=dict(arrowstyle="-|>", color="#dc2626", lw=1.1, linestyle='--', mutation_scale=8)
    )
    ax.text(2.8, 44, "Closed-Loop Feedback: Remediation Highlights & Pacing Pauses",
            ha='left', va='center', rotation=90, fontsize=5.8, color='#dc2626', fontweight='bold',
            bbox=dict(boxstyle='square,pad=0.15', facecolor='#ffffff', edgecolor='none', alpha=0.9))

    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig1_system_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated redesigned fig1_system_architecture.png")

def generate_figure_2_latency():
    # Single-column IEEE figure: 3.45 inches wide by 2.5 inches high
    fig, ax = plt.subplots(figsize=(3.45, 2.5), dpi=300)

    stages = [
        'Pure Policy\nMedian',
        'Pure Policy\nMean',
        'Pure Policy\nP95',
        'Pipeline\nMedian',
        'Pipeline\nMean',
        'Pipeline\nP95'
    ]
    latencies_us = [7, 10, 20, 14, 17, 24] # in microseconds
    colors = ['#0284c7', '#0369a1', '#075985', '#059669', '#047857', '#065f46']

    ax.set_xticks(range(len(stages)))
    bars = ax.bar(range(len(stages)), latencies_us, color=colors, width=0.6, edgecolor='#0f172a', linewidth=0.8)
    ax.set_ylabel('Execution Latency (μs)', fontweight='bold', fontsize=8.2)
    ax.set_title('Empirical Decision Latency (N = 1,000 Iterations)', fontweight='bold', fontsize=8.8, pad=6)
    ax.set_ylim(0, 32)

    # Frame budget callout
    ax.axhline(y=28, color='#dc2626', linestyle=':', linewidth=1.0)
    ax.text(2.5, 29.2, '60 FPS Frame Budget: 16,667 μs (16.67 ms)', ha='center', va='bottom', fontsize=6.5, color='#dc2626', fontweight='bold')
    ax.text(2.5, 26.3, 'Max Pipeline (24 μs) < 0.15% of Render Frame Budget', ha='center', va='top', fontsize=6.1, color='#475569', style='italic')

    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 0.6, f'{h} μs\n({h/1000:.3f}ms)',
                ha='center', va='bottom', fontsize=6.0, fontweight='bold', color='#0f172a')

    ax.set_xticklabels(stages, fontsize=6.4)
    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig2_latency_benchmark.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated redesigned fig2_latency_benchmark.png")

def generate_figure_3_accuracy_comparison():
    # Single-column IEEE figure: 3.45 inches wide by 2.5 inches high
    fig, ax = plt.subplots(figsize=(3.45, 2.5), dpi=300)

    categories = ['Fixed Hint\nBaseline', 'Simple Error\nRule Baseline', 'Matched-Hist.\nBaseline', 'EGEA Policy\n(Ours)']
    challenge_acc = [33.3, 50.0, 83.3, 100.0]
    boundary_acc = [58.3, 75.0, 75.0, 100.0]

    x = range(len(categories))
    width = 0.36

    rects1 = ax.bar([i - width/2 for i in x], challenge_acc, width, label='Authored Challenge Suite (N=18)', color='#38bdf8', edgecolor='#0369a1', lw=0.8)
    rects2 = ax.bar([i + width/2 for i in x], boundary_acc, width, label='Authored Boundary Stress Suite (N=12)', color='#10b981', edgecolor='#047857', lw=0.8)

    ax.set_ylabel('Intervention Accuracy (%)', fontweight='bold', fontsize=8.2)
    ax.set_title('Intervention Accuracy Across Benchmark Suites', fontweight='bold', fontsize=8.8, pad=6)
    ax.set_xticks(list(x))
    ax.set_xticklabels(categories, fontsize=7.0)
    ax.set_ylim(0, 120)
    ax.legend(loc='upper left', framealpha=0.92, fontsize=6.8)

    for r in rects1:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.2, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.2, color='#0369a1', fontweight='bold')

    for r in rects2:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.2, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.2, color='#047857', fontweight='bold')

    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig3_accuracy_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated redesigned fig3_accuracy_comparison.png")

if __name__ == '__main__':
    generate_figure_1_architecture()
    generate_figure_2_latency()
    generate_figure_3_accuracy_comparison()
