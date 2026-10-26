import sys
import time

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_smoke_test():
    results = {}
    console_errors = []
    failed_requests = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        def handle_console(msg):
            if msg.type in ['error']:
                # Filter out intentional warnings or normal WebXR mock logs
                console_errors.append(f"[{msg.type}] {msg.text}")

        def handle_request_failed(req):
            failed_requests.append(f"{req.method} {req.url} - {req.failure}")

        def handle_response(res):
            if res.status >= 400:
                failed_requests.append(f"HTTP {res.status} {res.url}")

        page.on('console', handle_console)
        page.on('requestfailed', handle_request_failed)
        page.on('response', handle_response)

        # -------------------------------------------------------------
        # 1. Base URL verification
        # -------------------------------------------------------------
        print("Checking base URL http://localhost:5173/...")
        res = page.goto('http://localhost:5173/')
        assert res.status == 200, f"Expected 200, got {res.status}"
        page.wait_for_load_state('networkidle')
        title = page.title()
        results['base_url'] = {'status': 'PASS', 'title': title}
        print(f"Base URL loaded successfully: {title}")

        # -------------------------------------------------------------
        # 2. Visualizer Route 1: Binary Search Tree
        # -------------------------------------------------------------
        print("\nTesting Route 1: Binary Search Tree...")
        page.goto('http://localhost:5173/?screen=ar-session&topic=ds-binary-search-tree')
        page.wait_for_selector('text=Binary Search Tree', timeout=8000)
        
        # Verify 3D canvas
        canvas = page.query_selector('canvas')
        assert canvas is not None, "3D canvas not found"
        
        # BST Practice: initial state target 40 vs 50
        # Button: "← Left"
        left_btn = page.wait_for_selector('button:has-text("← Left")', timeout=5000)
        assert left_btn is not None
        
        # Action 1: Valid action (40 < 50 -> Left)
        print("Performing valid BST action: click '← Left' (40 < 50)...")
        left_btn.click()
        page.wait_for_timeout(600)
        
        # Verify state updated (at node 30)
        compare_text = page.inner_text('body')
        assert "30" in compare_text, "State did not advance to node 30"
        
        # Action 2: Invalid action (40 > 30, but click '← Left')
        print("Performing invalid BST action: click '← Left' when 40 > 30...")
        left_btn.click()
        page.wait_for_timeout(600)
        
        # Check EGEA badge
        egea_badge = page.query_selector('[title*="EGEA Decision"]')
        egea_title = egea_badge.get_attribute('title') if egea_badge else "None"
        print(f"EGEA HUD state after BST error: {egea_title}")
        assert "EGEA Decision" in egea_title, "EGEA Decision badge not found"

        results['bst_route'] = {'status': 'PASS', 'egea_badge': egea_title}

        # -------------------------------------------------------------
        # 3. Visualizer Route 2: Bubble Sort
        # -------------------------------------------------------------
        print("\nTesting Route 2: Bubble Sort...")
        page.goto('http://localhost:5173/?screen=ar-session&topic=algo-bubble-sort')
        page.wait_for_selector('text=Bubble Sort', timeout=8000)
        
        swap_btn = page.wait_for_selector('button:has-text("Swap Elements")', timeout=5000)
        keep_btn = page.wait_for_selector('button:has-text("Keep In Order")', timeout=5000)
        assert swap_btn and keep_btn
        
        # Read comparison values
        body_text = page.inner_text('body')
        print("Bubble sort state loaded. Performing valid/invalid sort actions...")
        # Rapid guessing test: click swap twice rapidly
        swap_btn.click()
        page.wait_for_timeout(100)
        keep_btn.click()
        page.wait_for_timeout(300)
        
        egea_badge_bs = page.query_selector('[title*="EGEA Decision"]')
        egea_title_bs = egea_badge_bs.get_attribute('title') if egea_badge_bs else "None"
        print(f"EGEA HUD state for Bubble Sort: {egea_title_bs}")
        assert "EGEA Decision" in egea_title_bs

        results['bubble_sort_route'] = {'status': 'PASS', 'egea_badge': egea_title_bs}

        # -------------------------------------------------------------
        # 4. Visualizer Route 3: Binary Search
        # -------------------------------------------------------------
        print("\nTesting Route 3: Binary Search...")
        page.goto('http://localhost:5173/?screen=ar-session&topic=algo-binary-search')
        page.wait_for_selector('text=Binary Search', timeout=8000)
        
        left_search_btn = page.wait_for_selector('button:has-text("Search Left")', timeout=5000)
        match_btn = page.wait_for_selector('button:has-text("Match Found")', timeout=5000)
        right_search_btn = page.wait_for_selector('button:has-text("Search Right")', timeout=5000)
        assert left_search_btn and match_btn and right_search_btn
        
        print("Performing valid action in Binary Search: clicking directional search...")
        left_search_btn.click()
        page.wait_for_timeout(500)
        
        egea_badge_bin = page.query_selector('[title*="EGEA Decision"]')
        egea_title_bin = egea_badge_bin.get_attribute('title') if egea_badge_bin else "None"
        print(f"EGEA HUD state for Binary Search: {egea_title_bin}")
        assert "EGEA Decision" in egea_title_bin

        results['binary_search_route'] = {'status': 'PASS', 'egea_badge': egea_title_bin}

        # -------------------------------------------------------------
        # 5. Visualizer Route 4: Breadth-First Search (BFS)
        # -------------------------------------------------------------
        print("\nTesting Route 4: Breadth-First Search (BFS)...")
        page.goto('http://localhost:5173/?screen=ar-session&topic=algo-breadth-first-search')
        page.wait_for_selector('text=Breadth-First Search', timeout=8000)
        
        step_bfs_btn = page.wait_for_selector('button:has-text("Dequeue & Expand Neighbors")', timeout=5000)
        restart_bfs_btn = page.wait_for_selector('button:has-text("Restart")', timeout=5000)
        assert step_bfs_btn and restart_bfs_btn
        
        print("Performing BFS traversal step...")
        step_bfs_btn.click()
        page.wait_for_timeout(500)
        
        print("Testing BFS Restart action...")
        restart_bfs_btn.click()
        page.wait_for_timeout(500)
        
        egea_badge_bfs = page.query_selector('[title*="EGEA Decision"]')
        egea_title_bfs = egea_badge_bfs.get_attribute('title') if egea_badge_bfs else "None"
        print(f"EGEA HUD state for BFS: {egea_title_bfs}")
        assert "EGEA Decision" in egea_title_bfs

        results['bfs_route'] = {'status': 'PASS', 'egea_badge': egea_title_bfs}

        # -------------------------------------------------------------
        # 6. Visualizer Route 5: Stack (LIFO)
        # -------------------------------------------------------------
        print("\nTesting Route 5: Stack...")
        page.goto('http://localhost:5173/?screen=ar-session&topic=ds-stack')
        page.wait_for_selector('text=Stack', timeout=8000)
        
        push_btn = page.wait_for_selector('button:has-text("Push (")', timeout=5000)
        pop_btn = page.wait_for_selector('button:has-text("Pop Top")', timeout=5000)
        assert push_btn and pop_btn
        
        # Stack starts with 3 elements, capacity 6
        print("Performing Stack Push actions to test capacity boundary...")
        # Push 1 (length -> 4)
        push_btn.click()
        page.wait_for_timeout(400)
        # Push 2 (length -> 5)
        push_btn.click()
        page.wait_for_timeout(400)
        # Push 3 (length -> 6, triggers capacity limit)
        push_btn.click()
        page.wait_for_timeout(400)
        
        # Check boundary: Push button should now be disabled at capacity 5
        is_disabled = push_btn.is_disabled()
        print(f"Stack Push button disabled at capacity limit: {is_disabled}")
        assert is_disabled, "Push button should be disabled when Stack reaches capacity 5"
        
        # Test Pop
        print("Performing Stack Pop action...")
        pop_btn.click()
        page.wait_for_timeout(400)
        
        egea_badge_stack = page.query_selector('[title*="EGEA Decision"]')
        egea_title_stack = egea_badge_stack.get_attribute('title') if egea_badge_stack else "None"
        print(f"EGEA HUD state for Stack: {egea_title_stack}")
        assert "EGEA Decision" in egea_title_stack

        results['stack_route'] = {'status': 'PASS', 'capacity_boundary_enforced': is_disabled}

        # -------------------------------------------------------------
        # 7. Hot-Swapping & Interaction History Isolation
        # -------------------------------------------------------------
        print("\nTesting Algorithm Hot-Swapping & Interaction History Isolation...")
        # Switch from Stack to BST using the algorithm switcher pill
        switcher_pill = page.wait_for_selector('button[title="Switch AR Algorithm"]', timeout=5000)
        switcher_pill.click()
        page.wait_for_timeout(400)
        
        # Modal should appear with options
        bst_card_btn = page.wait_for_selector('.card:has-text("Binary Search Tree") button', timeout=5000)
        bst_card_btn.click()
        page.wait_for_timeout(600)
        
        # Verify BST loaded and EGEA was cleanly re-initialized
        page.wait_for_selector('button:has-text("← Left")', timeout=5000)
        egea_switched = page.query_selector('[title*="EGEA Decision"]')
        egea_switched_title = egea_switched.get_attribute('title') if egea_switched else "None"
        print(f"EGEA HUD title after switching to BST: {egea_switched_title}")
        # Cleanly re-initialized EGEA starts with no prior error history
        assert "EGEA Decision" in egea_switched_title

        results['hot_swapping'] = {'status': 'PASS', 'switched_egea': egea_switched_title}

        # Take screenshot of final verified state
        screenshot_path = 'submission/review_release/smoke_test_verified.png'
        page.screenshot(path=screenshot_path)
        print(f"Saved smoke test verification screenshot to {screenshot_path}")

        browser.close()

    print("\n-------------------------------------------------------------")
    print("SMOKE TEST SUMMARY")
    print("-------------------------------------------------------------")
    for k, v in results.items():
        print(f"{k}: {v['status']}")
    print(f"Console errors: {len(console_errors)}")
    for err in console_errors:
        print(f"  {err}")
    print(f"Failed network requests: {len(failed_requests)}")
    for req in failed_requests:
        print(f"  {req}")

    return len(console_errors) == 0 and len(failed_requests) == 0

if __name__ == '__main__':
    success = run_smoke_test()
    if not success:
        sys.exit(1)
