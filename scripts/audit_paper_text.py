with open('scripts/build_ieee_paper.py', 'r', encoding='utf-8') as f:
    text = f.read()

terms_to_check = [
    'held-out test cohort',
    'student learning gains',
    'statistically significant improvement',
    'verified on Android devices',
    'physical device tracking verified',
    '60 FPS achieved on Galaxy',
    'measured 60 FPS',
    'real students',
    'classroom trial'
]

print("Checking for unsupported claims...")
found_any = False
for term in terms_to_check:
    if term.lower() in text.lower():
        print(f"WARNING: Found phrase '{term}' in paper script!")
        found_any = True

if not found_any:
    print("PASS: No unsupported empirical claims or unverified physical hardware claims found!")

# Check explicit boundary disclosures
required_terms = [
    'authored boundary stress suite',
    'simulation boundary',
    'physical devices',
    'pure policy',
    'pipeline'
]

print("\nChecking required honest boundary declarations...")
for r in required_terms:
    if r.lower() in text.lower():
        print(f"PASS: Found required disclosure '{r}'")
    else:
        print(f"MISSING: Required disclosure '{r}' not found!")
