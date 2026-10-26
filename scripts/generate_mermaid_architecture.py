"""
Generate the publication-grade IEEE system architecture diagram (Figure 1).
Exports:
- submission/review_release/figures/fig1_system_architecture.svg (Vector SVG)
- submission/review_release/figures/fig1_system_architecture.png (300+ DPI high-res PNG, 2160x930)
- submission/review_release/figures/fig1_system_architecture.mmd (Mermaid source)
"""

import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

scripts_dir = os.path.dirname(os.path.abspath(__file__))
if scripts_dir not in sys.path:
    sys.path.insert(0, scripts_dir)

from generate_ieee_architecture import render_figure

def generate():
    render_figure()

if __name__ == '__main__':
    generate()
