import os
import sys
import json
import time

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_verification():
    out_dir = 'submission/review_release/diag_after'
    os.makedirs(out_dir, exist_ok=True)

    algorithms = [
        ('bst', 'ds-binary-search-tree', 'Binary Search Tree'),
        ('bubble_sort', 'algo-bubble-sort', 'Bubble Sort'),
        ('binary_search', 'algo-binary-search', 'Binary Search'),
        ('bfs', 'algo-breadth-first-search', 'Breadth-First Search'),
        ('stack', 'ds-stack', 'Stack')
    ]

    viewports = [
        ('desktop_1280x800', {'width': 1280, 'height': 800}),
        ('mobile_390x844', {'width': 390, 'height': 844}),
        ('mobile_360x800', {'width': 360, 'height': 800})
    ]

    results = []

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

                # Fetch framing diagnostics and canvas info
                diag = page.evaluate('''() => {
                    const ar = window.__AR_SERVICE__;
                    const canvas = document.querySelector('canvas');
                    const framing = ar && typeof ar.getFramingDiagnostics === 'function' ? ar.getFramingDiagnostics() : null;
                    return {
                        state: ar ? ar.sessionState : null,
                        isObjectPlaced: ar ? ar.isObjectPlaced : null,
                        framing: framing,
                        canvas: {
                            w: canvas ? canvas.width : 0,
                            h: canvas ? canvas.height : 0,
                            cw: canvas ? canvas.clientWidth : 0,
                            ch: canvas ? canvas.clientHeight : 0,
                        }
                    };
                }''')
                
                print(f"  Diagnostics for {algo_key} ({vp_name}):")
                print(f"    State: {diag.get('state')}, Placed: {diag.get('isObjectPlaced')}")
                f = diag.get('framing') or {}
                size = f.get('modelBounds', {}).get('size', {})
                center = f.get('modelBounds', {}).get('center', {})
                cam = f.get('camera', {})
                frust = f.get('frustum', {})
                def get_xyz(val):
                    if isinstance(val, (list, tuple)) and len(val) >= 3:
                        return val[0], val[1], val[2]
                    if isinstance(val, dict):
                        return val.get('x', 0), val.get('y', 0), val.get('z', 0)
                    return 0, 0, 0

                sx, sy, sz = get_xyz(size)
                cx, cy, cz = get_xyz(center)
                print(f"    Bounds Size: x={sx:.3f}, y={sy:.3f}, z={sz:.3f}")
                print(f"    Bounds Center: x={cx:.3f}, y={cy:.3f}, z={cz:.3f}")
                print(f"    Distance: {cam.get('distance', 0):.3f} m, Span Occupancy: {frust.get('spanOccupancyRatio', 0):.2f}")
                print(f"    Clamped: {f.get('clamped')}, Status: {f.get('status')}")

                # Save screenshot
                img_path = f"{out_dir}/{algo_key}_{vp_name}.png"
                page.screenshot(path=img_path)
                print(f"  Saved screenshot to {img_path}")

                results.append({
                    'algorithm': title,
                    'key': algo_key,
                    'viewport': vp_name,
                    'width': vp_size['width'],
                    'height': vp_size['height'],
                    'diag': diag,
                    'screenshot': img_path
                })

            context.close()
        browser.close()

    summary_file = f"{out_dir}/framing_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as sf:
        json.dump(results, sf, indent=2)
    print(f"\nAll verification screenshots and summary written to {out_dir}")

if __name__ == '__main__':
    run_verification()
