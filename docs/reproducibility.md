# AR-DSA Tutor — Complete Reproducibility Guide

**Target Standard:** ACM / IEEE Artifact Review & Badging (Artifacts Evaluated & Reusable)  
**Repository Path:** `C:\Users\ajaya\Desktop\AR`  

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS (12+), or Linux (Ubuntu 20.04+)
- **Runtime:** Node.js v20.x or higher
- **Package Manager:** npm (v10+)
- **Hardware (Optional for Physical Mobile AR):** ARCore-supported Android device with Google Chrome v110+

---

## 2. Quick-Start Reproduction Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Static Analysis & Linting
Verify TypeScript compiler strictness and code quality:
```bash
npx tsc -b
npx oxlint
```
Expected output: 0 errors across all 140+ source files.

### Step 3: Run All 16 Automated Verification Test Suites
Execute the comprehensive test harness:
```bash
npx tsx scripts/run_all_tests.ts
```
Expected output:
```
====================================================
TOTAL SUITES: 16
PASSED TESTS: 1355
FAILED TESTS: 0
SUITE FAILURES: None (ALL 16 SUITES PASSED)
====================================================
```

### Step 4: Run the EGEA Research Benchmark
Execute the comparative benchmark across the 30 pedagogical scenarios:
```bash
npx tsx scripts/run_egea_benchmark.ts
```
Expected output:
- Evaluates 30 multi-algorithm scenarios.
- Prints comparative table showing EGEA achieving 100.0% appropriateness, Macro-F1 = 1.000, and sub-millisecond latency.
- Produces `research-results/egea_evaluation_report.json`.

### Step 5: Execute Production Build & Security Audit
```bash
npm run build
node scripts/audit_dist.js
```
Expected output:
- Client bundle (`dist/assets/index-*.js`) and SSR server (`dist/server/server.js`) built successfully.
- Security audit reports: `Scan finished. Total forbidden term occurrences: 0`.

### Step 6: Launch Development Server for Interactive Demo
```bash
npm run dev
```
Open `http://localhost:5173` in any desktop browser (launches in interactive 3D Canvas Fallback mode) or on an ARCore-enabled Android device over HTTPS/tethering (launches in full WebXR camera passthrough mode).
