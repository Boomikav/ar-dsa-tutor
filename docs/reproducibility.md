# Software Verification & Reproducibility Guide

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Build Target:** Version 1.0.0 (Phase 12 Hardening)  

---

## 1. System Requirements & Environment

* **Node.js:** v18.18.0 or later (LTS recommended)
* **npm:** v9.0.0 or later
* **Operating System:** Cross-platform (Linux, macOS, Windows 10/11)
* **Browser Runtime:**
  * For WebXR AR: Google Chrome (Android with ARCore) or Mozilla WebXR Viewer (iOS)
  * For 3D Learning Mode: Any modern browser with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)

---

## 2. Installation & Build

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd AR
npm install
```

### Step 2: Static Type Check
```bash
npx tsc --noEmit
# Expected Result: Exit code 0 (0 type errors)
```

### Step 3: Production Build
```bash
npm run build
# Expected Result:
#   - dist/ (Vite client SPA bundle)
#   - dist/server/server.js (Standalone production server)
```

### Step 4: Linter Audit
```bash
npx oxlint
# Expected Result: Exit code 0 (0 errors)
```

---

## 3. Automated Test Suite Execution

All 10 verification suites can be executed independently or sequentially:

```bash
# 1. Phase 12 Final Product + Research Hardening Suite
npx tsx test/phase12FinalHardeningVerification.ts

# 2. Phase 11 Real Mobile AR Validation Suite
npx tsx test/mobileARValidationVerification.ts

# 3. Phase 10 Research Evaluation & Experimental Framework Suite
npx tsx test/researchEvaluationVerification.ts

# 4. Phase 9 DSA Expansion Suite (20 Engines & State Isolation)
npx tsx test/dsaExpansionVerification.ts

# 5. Phase 7 Learner Model & Adaptive Difficulty Suite
npx tsx test/learnerModelVerification.ts

# 6. Phase 6 Multi-Agent Architecture Suite
npx tsx test/multiAgentVerification.ts

# 7. Phase 5 AR + AI Learning Loop Integration Suite
npx tsx test/arAiIntegrationVerification.ts

# 8. Phase 8 Application Experience Suite
npx tsx test/appExperienceVerification.ts

# 9. Phase 4 AR Baseline Architecture Suite
npx tsx test/arVerification.ts

# 10. Phase 3 AI Verification Suite
npx tsx test/aiVerification.ts
```

### Expected Pass Rate
* **Total Automated Tests:** $> 800$ tests
* **Pass Rate:** **100% (0 Failures)**

---

## 4. Deterministic Task Generation & Seed Replication

The framework uses an invariant `Mulberry32PRNG` pseudo-random generator:
* Given seed `S` and topic `T`, the algorithm produces 100% bitwise-identical array values, graph adjacency lists, and target search keys across operating systems and execution runs.
* Replicated in `ResearchDataManager.generateReproducibleTask(seed, topicId, taskId)`.

---

## 5. Security & Zero-Secret Audit

Verify the client bundle contains zero exposed keys:
```bash
# Search dist/assets for raw Google API keys or credentials
grep -rn "AIzaSy" dist/assets/
# Expected: Zero matches
```
Server-side secrets are isolated strictly in `server/env.ts` and loaded via process environment variables (`process.env.GEMINI_API_KEY`).
