# System Architecture Specification

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Version:** 1.0.0 (Conference-Ready Engineering Build)  

---

## 1. Architectural Overview & Data Flow

The AR-DSA Tutor implements a strict multi-tier pipeline where the **deterministic algorithmic engine is the single authoritative source of truth**:

```text
                           [ Learner / Mobile Client ]
                                        │
                                        ▼ (Interaction: Tap, Step, Voice, Traversal)
                          [ Deterministic DSA Engine ]
                          (20 Registered Data Structures)
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
            [ Operation State & Step Log ]      [ Performance Evidence ]
                        │                               │
                        ▼                               ▼
             [ Visualization Layer ]            [ Learner Model Engine ]
             ├── WebXR AR (BST)                 ├── Mastery (Hist 35%, Rec 40%, Assmt 25%)
             ├── Interactive 3D (18 Topics)     ├── Confidence (Independence, Streak, Vol)
             └── 2D Visualizer (Merge Sort)     ├── Directional Trend (Improving/Declining)
                        │                       └── Misconception Diagnostic
                        │                               │
                        │                               ▼
                        │                   [ Adaptive Difficulty Policy ]
                        │                   (Foundational -> Easy -> Med -> Hard -> Chal)
                        │                               │
                        └───────────────┬───────────────┘
                                        ▼
                             [ AI Context Builder ]
                                        │
                                        ▼ (Structured Context Payload)
                             [ AI Orchestrator ]
                  ┌─────────────┬───────┴───────┬─────────────┐
                  ▼             ▼               ▼             ▼
             Tutor Agent   Misconception   Assessment   Recommendation
               (Modes:         Agent          Agent          Agent
              Socratic,      (Pattern       (Targeted      (Curriculum
               Direct,       Analysis)     Diagnostic)      Sequencing)
              Metaphor)
                  │             │               │             │
                  └─────────────┴───────┬───────┴─────────────┘
                                        ▼
                           [ AI Response Validator ]
                        (Schema, Topic Grounding, State)
                                        │
                                        ▼
                           [ AR Tutor HUD / Client UI ]
```

---

## 2. Core Subsystems

### 2.1 Deterministic DSA Engines (`src/services/dsa/`)
* **Authoritative Source of Truth:** 20 Tier-1 data structures and algorithms implemented in pure TypeScript.
* **Zero AI State Mutation:** Algorithmic state, pointers, comparisons, array shifts, and recursion trees are computed strictly by deterministic engines. Generative LLMs are **strictly prohibited** from computing or mutating algorithmic state.

### 2.2 Learner Modeling Subsystem (`src/services/learner/`)
* **Decoupled Mastery vs Confidence:**
  * **Mastery ($0–100$):** $35\%$ Historical Accuracy $+ 40\%$ Recent Window Accuracy $+ 25\%$ Assessment Score $-$ Assistance Penalty ($0–15$) $-$ Misconception Penalty ($0–20$).
  * **Confidence ($0–100$):** Independence Factor ($0–40$) $+$ Sample Volume Factor ($0–30$) $+$ Streak Factor ($0–30$) $-$ Instability Penalty ($15$).
* **Trend Classification:** Evaluates recent vs historical performance window: `INSUFFICIENT_DATA`, `IMPROVING`, `STABLE`, `DECLINING`.
* **Adaptive Difficulty Policy:** 5 levels (`FOUNDATIONAL`, `EASY`, `MEDIUM`, `HARD`, `CHALLENGE`) altering scaffolded invariant hints and prediction requirements.

### 2.3 Multi-Agent AI Orchestration (`src/services/ai/`)
* **Event-Driven Orchestrator:** Activates specialized agents based on educational events (`STUDENT_REQUESTED_HINT`, `STUDENT_MADE_MISTAKE`, `REPEATED_MISCONCEPTION`, `TOPIC_COMPLETED`).
* **Specialized Agent Roles:**
  1. **Tutor Agent:** Socratic guiding questions, concise direct rules, or physical spatial metaphors.
  2. **Misconception Agent:** Pattern recurrence tracking and cognitive failure classification.
  3. **Assessment Agent:** Adaptive diagnostic questions matched to weak concepts.
  4. **Recommendation Agent:** Curriculum sequencing and prerequisite remediation.
* **Strict Validation Boundary:** Every AI output passes through `AIResponseValidator` to enforce schema typing, domain grounding, and prevention of unauthorized state mutation.
* **Decoupled Render Loop:** Zero AI network requests occur inside the Three.js 60fps render loop (`onAnimationFrame`).

### 2.4 Visualization Layer (`src/components/dsa/` & `src/services/ar/`)
* **Unified Registry Classifications:**
  * **WebXR AR (`AR_READY`):** Binary Search Tree with real-world surface hit-testing (`XRHitTestSource`) and 6DoF spatial tracking (1 topic).
  * **Interactive 3D (`3D_READY`):** 17 topics with Three.js WebGL canvas rendering, OrbitControls, and interactive step controls.
  * **2D Visualizer (`2D_READY`):** 2 topics (`ds-hash-table` bucket array and `algo-merge-sort` split/merge recursion tree).
* **Zero-Fake Guarantee:** Real WebXR runtime with transparent canvas passthrough; when WebXR is unsupported, cleanly and explicitly falls back to **Interactive 3D Mode**.

### 2.5 Security & Privacy Boundaries
* **Zero Client-Side Secrets:** `GEMINI_API_KEY` is isolated in server environment variables. Client bundles contain zero API keys.
* **Zero Camera Telemetry:** Camera passthrough is processed strictly by the local browser WebXR runtime. No camera frames or video streams are ever stored or transmitted to AI services.
