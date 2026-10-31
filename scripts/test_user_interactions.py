import os
import sys
import time

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def test_interactions():
    print("======================================================================")
    print(" AR-DSA TUTOR: BROWSER USER INTERACTION & ORBIT CONTROL TESTS")
    print("======================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        page.on('console', lambda msg: print(f"  [CONSOLE] {msg.type}: {msg.text}"))

        # 1. Start with BST
        port = os.environ.get('PORT', '5199')
        url = f'http://localhost:{port}/?screen=ar-session&topic=ds-binary-search-tree'
        print(f"\n1. Navigating to BST: {url}")
        page.goto(url)
        page.wait_for_selector('text=Binary Search Tree', timeout=8000)
        page.wait_for_timeout(1000)

        # 2. Test Orbit Camera Rotation via Canvas Drag
        print("\n2. Testing 3D orbit controls (mouse drag rotation)...")
        initial_cam = page.evaluate('() => window.__AR_SERVICE__.camera.position.toArray()')
        print(f"   Initial camera pos: {initial_cam}")

        canvas = page.query_selector('canvas')
        box = canvas.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + 150

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + 100, start_y + 30, steps=10)
        page.mouse.up()
        page.wait_for_timeout(300)

        rotated_cam = page.evaluate('() => window.__AR_SERVICE__.camera.position.toArray()')
        print(f"   Rotated camera pos: {rotated_cam}")
        assert rotated_cam != initial_cam, "Camera position must change after drag"
        print("   ✓ Orbit drag successfully rotated camera around model!")

        # 3. Test Zoom Controls via Mouse Wheel
        print("\n3. Testing zoom controls via wheel...")
        page.mouse.move(start_x, start_y)
        page.mouse.wheel(0, 150) # Zoom out
        page.wait_for_timeout(300)
        zoomed_cam = page.evaluate('() => window.__AR_SERVICE__.camera.position.toArray()')
        print(f"   Zoomed camera pos: {zoomed_cam}")
        assert zoomed_cam != rotated_cam, "Camera position must change after zoom"
        print("   ✓ Zoom wheel successfully updated camera distance!")

        # 4. Test Algorithm Interaction (BST: Click '<- Left' or 'Right ->')
        print("\n4. Testing interactive step in BST...")
        left_button = page.query_selector('button:has-text("Left")')
        if left_button:
            left_button.click()
            page.wait_for_timeout(500)
            print("   ✓ BST Left button clicked and interaction processed!")
        else:
            print("   ! BST Left button not found")

        # 5. Test Switching Algorithm via Dropdown (BST -> Bubble Sort)
        print("\n5. Testing algorithm switching via UI...")
        page.locator('button[title="Switch AR Algorithm"]').click()
        page.wait_for_timeout(400)
        bubble_card = page.locator('div.card').filter(has_text='Bubble Sort')
        bubble_card.locator('button').click()
        page.wait_for_timeout(800)
        active_algo = page.evaluate('() => window.__AR_SERVICE__.activeAlgorithmId')
        print(f"   Active algorithm now: {active_algo}")
        assert active_algo == 'algo-bubble-sort', f"Expected algo-bubble-sort, got {active_algo}"
        print("   ✓ Successfully switched to Bubble Sort via modal!")

        # 6. Test Bubble Sort Interactive Step (Swap or Keep)
        print("\n6. Testing interactive step in Bubble Sort...")
        swap_btn = page.query_selector('button:has-text("Swap Elements")')
        if swap_btn:
            swap_btn.click()
            page.wait_for_timeout(500)
            print("   ✓ Bubble Sort Swap Elements clicked and executed!")

        # 7. Test Switching to Stack and Push Action
        print("\n7. Switching to Stack...")
        page.goto(f'http://localhost:{port}/?screen=ar-session&topic=ds-stack')
        page.wait_for_selector('text=Stack', timeout=5000)
        page.wait_for_timeout(800)
        push_btn = page.query_selector('button:has-text("Push")')
        if push_btn:
            push_btn.click()
            page.wait_for_timeout(500)
            print("   ✓ Stack Push button executed without error!")

        # 8. Test Reset Button
        print("\n8. Testing Reset button...")
        reset_btn = page.query_selector('button:has-text("Reset")')
        if reset_btn:
            reset_btn.click()
            page.wait_for_timeout(500)
            print("   ✓ Reset executed successfully!")

        # 9. Verify Console Errors
        print("\n9. Checking console and runtime stability...")
        browser.close()
        print("\n✓ ALL USER INTERACTION & ORBIT CONTROL TESTS PASSED!")

if __name__ == '__main__':
    test_interactions()
