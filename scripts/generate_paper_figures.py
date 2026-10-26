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
    """
    Generate Figure 1 using Mermaid:
    'Architecture of AR-DSA Tutor showing the five deterministic algorithm engines,
     interactive Three.js visualizers, WebXR session layer, EGEA telemetry and adaptation pipeline,
     and closed-loop HUD feedback.'
    Exports vector SVG, high-res 300+ DPI PNG, and editable MMD.
    """
    import sys
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)
    from generate_mermaid_architecture import generate as generate_mermaid
    generate_mermaid()
    print("Generated Mermaid architecture figure (SVG, PNG, MMD)")

def generate_figure_2_latency():
    # Single-column IEEE figure: 3.45 inches wide by 2.25 inches high
    fig, ax = plt.subplots(figsize=(3.45, 2.25), dpi=300)

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
    ax.set_ylabel('Execution Latency (μs)', fontweight='bold', fontsize=8.0)
    ax.set_title('Empirical Decision Latency (N = 1,000 Iterations)', fontweight='bold', fontsize=8.5, pad=5)
    ax.set_ylim(0, 32)

    # Frame budget callout
    ax.axhline(y=28, color='#dc2626', linestyle=':', linewidth=1.0)
    ax.text(2.5, 29.2, '60 FPS Frame Budget: 16,667 μs (16.67 ms)', ha='center', va='bottom', fontsize=6.3, color='#dc2626', fontweight='bold')
    ax.text(2.5, 26.3, 'Max Pipeline (24 μs) < 0.15% of Render Frame Budget', ha='center', va='top', fontsize=5.9, color='#475569', style='italic')

    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 0.6, f'{h} μs\n({h/1000:.3f}ms)',
                ha='center', va='bottom', fontsize=5.8, fontweight='bold', color='#0f172a')

    ax.set_xticklabels(stages, fontsize=6.3)
    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig2_latency_benchmark.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated redesigned fig2_latency_benchmark.png")

def generate_figure_3_accuracy_comparison():
    # Single-column IEEE figure: 3.45 inches wide by 2.25 inches high
    fig, ax = plt.subplots(figsize=(3.45, 2.25), dpi=300)

    categories = ['Fixed Hint\nBaseline', 'Simple Error\nRule Baseline', 'Matched-Hist.\nBaseline', 'EGEA Policy\n(Ours)']
    challenge_acc = [33.3, 50.0, 83.3, 100.0]
    boundary_acc = [58.3, 75.0, 75.0, 100.0]

    x = range(len(categories))
    width = 0.36

    rects1 = ax.bar([i - width/2 for i in x], challenge_acc, width, label='Authored Challenge Suite (N=18)', color='#38bdf8', edgecolor='#0369a1', lw=0.8)
    rects2 = ax.bar([i + width/2 for i in x], boundary_acc, width, label='Authored Boundary Stress Suite (N=12)', color='#10b981', edgecolor='#047857', lw=0.8)

    ax.set_ylabel('Intervention Accuracy (%)', fontweight='bold', fontsize=8.0)
    ax.set_title('Intervention Accuracy Across Benchmark Suites', fontweight='bold', fontsize=8.5, pad=5)
    ax.set_xticks(list(x))
    ax.set_xticklabels(categories, fontsize=6.8)
    ax.set_ylim(0, 120)
    ax.legend(loc='upper left', framealpha=0.92, fontsize=6.5)

    for r in rects1:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.2, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.0, color='#0369a1', fontweight='bold')

    for r in rects2:
        h = r.get_height()
        ax.text(r.get_x() + r.get_width()/2., h + 1.2, f'{h:.1f}%', ha='center', va='bottom', fontsize=6.0, color='#047857', fontweight='bold')

    ax.grid(axis='y', linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('submission/review_release/figures/fig3_accuracy_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated redesigned fig3_accuracy_comparison.png")

if __name__ == '__main__':
    generate_figure_1_architecture()
    generate_figure_2_latency()
    generate_figure_3_accuracy_comparison()
