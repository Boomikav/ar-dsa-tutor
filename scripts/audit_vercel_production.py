import os
import sys
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def audit_vercel():
    prod_url = 'https://ar-three-mu.vercel.app'
    print(f"======================================================================")
    print(f" AUDITING LIVE VERCEL PRODUCTION DEPLOYMENT: {prod_url}")
    print(f"======================================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        console_logs = []
        network_errors = []

        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('requestfailed', lambda req: network_errors.append(f"{req.url}: {req.failure}"))

        print(f"1. Loading base URL {prod_url}...")
        resp = page.goto(prod_url, timeout=15000)
        status = resp.status if resp else None
        print(f"   HTTP Status: {status}")
        title = page.title()
        print(f"   Page Title: {title}")

        content_snippet = page.content()[:300]
        print(f"   Content Snippet: {content_snippet}")

        # Check if protected by Vercel SSO or if public
        is_auth_wall = 'Vercel' in title and ('Log In' in content_snippet or 'Authentication' in content_snippet)
        print(f"   Vercel Authentication Protection: {'ACTIVE (SSO Wall)' if is_auth_wall else 'PUBLIC ACCESS'}")

        # Test direct visualizer route
        bst_url = f"{prod_url}/?screen=ar-session&topic=ds-binary-search-tree"
        print(f"\n2. Loading Direct Visualizer Route: {bst_url}...")
        resp_bst = page.goto(bst_url, timeout=15000)
        print(f"   HTTP Status: {resp_bst.status if resp_bst else None}")
        page.wait_for_timeout(2000)

        # Check diagnostics on production if loaded
        prod_diag = page.evaluate('''() => {
            const ar = window.__AR_SERVICE__;
            if (!ar) return { hasAR: false };
            return {
                hasAR: true,
                state: ar.sessionState,
                placed: ar.isObjectPlaced,
                active: ar.activeAlgorithmId,
                framing: typeof ar.getFramingDiagnostics === 'function' ? ar.getFramingDiagnostics() : null
            };
        }''')
        print(f"   Production AR Service Diagnostic: {prod_diag}")

        page.screenshot(path='submission/review_release/vercel_production_audit.png')
        print("   Saved audit screenshot to submission/review_release/vercel_production_audit.png")

        print(f"\n3. Console Logs Count: {len(console_logs)}")
        for log in console_logs[:10]:
            print(f"   {log}")

        print(f"\n4. Network Errors Count: {len(network_errors)}")
        for err in network_errors[:10]:
            print(f"   {err}")

        browser.close()

if __name__ == '__main__':
    audit_vercel()
