import os
import sys
import time

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_diagnostics():
    out_dir = 'submission/review_release/diag_before'
    os.makedirs(out_dir, exist_ok=True)

    algorithms = [
        ('bst', 'ds-binary-search-tree', 'Binary Search Tree'),
        ('bubble_sort', 'algo-bubble-sort', 'Bubble Sort'),
        ('binary_search', 'algo-binary-search', 'Binary Search'),
        ('bfs', 'algo-breadth-first-search', 'Breadth-First Search'),
        ('stack', 'ds-stack', 'Stack')
    ]

    viewports = [
        ('desktop', {'width': 1280, 'height': 800}),
        ('mobile', {'width': 390, 'height': 844})
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)

        for vp_name, vp_size in viewports:
            print(f"\n=================== VIEWPORT: {vp_name} ({vp_size['width']}x{vp_size['height']}) ===================")
            context = browser.new_context(viewport=vp_size)
            page = context.new_page()

            for algo_key, topic_id, title in algorithms:
                url = f"http://localhost:5173/?screen=ar-session&topic={topic_id}"
                print(f"Loading {title} ({url})...")
                page.goto(url)
                page.wait_for_selector(f'text={title}', timeout=8000)
                page.wait_for_timeout(1000)

                # Capture canvas metrics
                metrics = page.evaluate('''() => {
                    const canvas = document.querySelector('canvas');
                    const header = document.querySelector('header');
                    const hud = document.querySelector('[role="region"]') || document.querySelector('.card');
                    return {
                        windowWidth: window.innerWidth,
                        windowHeight: window.innerHeight,
                        canvasWidth: canvas ? canvas.width : 0,
                        canvasHeight: canvas ? canvas.height : 0,
                        canvasClientWidth: canvas ? canvas.clientWidth : 0,
                        canvasClientHeight: canvas ? canvas.clientHeight : 0,
                        pixelRatio: window.devicePixelRatio
                    };
                }''')
                print(f"  Canvas Metrics: {metrics}")

                # Save screenshot
                img_path = f"{out_dir}/{algo_key}_{vp_name}.png"
                page.screenshot(path=img_path)
                print(f"  Saved screenshot to {img_path}")

            context.close()
        browser.close()

if __name__ == '__main__':
    run_diagnostics()
