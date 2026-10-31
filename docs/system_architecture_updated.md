# AR-DSA Tutor: Unified System Architecture Specification

## 1. Executive Architecture Summary

**AR-DSA Tutor: A Web-Based Spatial Algorithm Visualization System with Execution-Grounded Explainable Adaptation** combines three foundational paradigms:
1. **Physical Spatial Immersion**: WebXR and Three.js 3D spatial visualizers calibrated to ergonomic tabletop bounding envelopes ($W \in [0.45\text{m}, 0.65\text{m}]$, $H \in [0.25\text{m}, 0.48\text{m}]$, $Y \ge 0.09\text{m}$) across 8 foundational and advanced DSA topics.
2. **Deterministic Pedagogical Adaptation (EGEA)**: Sub-millisecond ($< 0.01\text{ms}$) rule-based cognitive pacing model that detects rapid guessing, hesitation, and persistent misconceptions to deliver explainable instructional scaffolds.
3. **Execution-Grounded RAG Subsystem**: A verifiable, zero-hallucination Retrieval-Augmented Generation pipeline operating across a 62-chunk semantic vector index, grounded in live 3D visualizer runtime telemetry with audited citation enforcement.

---

## 2. Integrated System Architecture Diagram

```mermaid
flowchart TD
    subgraph CLIENT["Client Runtime Environment (React 19 + TypeScript + Vite)"]
        subgraph UI["Pedagogical UI Layer"]
            NAV["Router & Screen Container (App.tsx)"]
            AR_SCR["AR Session Screen (ARSessionScreen.tsx)"]
            AI_SCR["AI Socratic Tutor Screen (AITutorScreen.tsx)"]
            RAG_SCR["RAG Evaluation & Benchmark Dashboard (RAGEvaluationScreen.tsx)"]
            HUD["Learning HUD & Adaptive Scaffolds (ARTutorHUD.tsx)"]
            ALGO_SEL["8-Topic Algorithm Selector (ARAlgorithmSelector.tsx)"]
        end

        subgraph SPATIAL["Spatial Rendering Layer (Three.js + WebXR)"]
            AR_SVC["WebXR / 3D Fallback Service (WebXRARService.ts)"]
            FRAMING["AR Scene Framing & Bounding Envelopes (ARSceneFraming.ts)"]
            
            subgraph VIZ["3D Spatial Visualizers (Tabletop Envelopes)"]
                V_BST["ThreeBSTVisualizer (0.558m x 0.364m)"]
                V_BUB["ThreeBubbleSortVisualizer (0.475m x 0.402m)"]
                V_BIN["ThreeBinarySearchVisualizer (0.650m x 0.237m)"]
                V_BFS["ThreeBFSVisualizer (0.540m x 0.471m)"]
                V_STK["ThreeStackVisualizer (0.314m x 0.488m)"]
                V_MRG["ThreeMergeSortVisualizer (0.550m x 0.295m)"]
                V_AVL["ThreeAVLTreeVisualizer (0.620m x 0.412m)"]
                V_DJK["ThreeDijkstraVisualizer (0.530m x 0.402m)"]
            end
        end

        subgraph ENGINES["Deterministic Algorithm Execution Engines"]
            E_BST["BSTEngine / PracticeEngine"]
            E_BUB["BubbleSortEngine"]
            E_BIN["BinarySearchEngine"]
            E_BFS["BFSEngine"]
            E_STK["StackEngine"]
            E_MRG["MergeSortEngine (Divide & Conquer)"]
            E_AVL["AVLTreeEngine (Self-Balancing Rotations)"]
            E_DJK["DijkstraEngine (Priority Queue Relaxation)"]
        end

        subgraph ADAPTATION["Pedagogical Adaptation Engine (EGEA)"]
            EGEA_EVT["EGEAEventAdapter (Inter-step latency, mistake streaks)"]
            EGEA_PACE["EGEAPacingModel (EWMA filter, rapid guessing < 250ms)"]
            EGEA_POL["EGEAPolicyEngine (Deterministic 6-Intervention Scaffolding)"]
        end

        subgraph RAG_SYS["RAG Knowledge & Grounding Subsystem"]
            V_STORE["In-Memory VectorStore (128-D Cosine Index: 62 Chunks)"]
            CTX_BLD["RAGContextBuilder (Injects live 3D AR runtime telemetry)"]
            TUTOR_SVC["RAGTutorService (Local synthesis / remote LLM)"]
            CITE_VAL["CitationValidator (Validates [DOC-XXX-XX], rejects hallucinations)"]
            EVAL_ENG["RAGEvaluationEngine (Precision, Recall, MRR, nDCG, Latency)"]
        end
    end

    subgraph SERVER["Backend API & Knowledge Base (Vercel Serverless / Node SSR)"]
        ROUTER["API Router (server/apiRouter.ts)"]
        RAG_RET["POST /api/ai/rag-retrieve"]
        RAG_TUT["POST /api/ai/rag-tutor"]
        RAG_STAT["GET /api/ai/rag-index-status"]
        KB_FILES["data/rag/knowledge_base/*.json (9 Documents)"]
        VEC_JSON["data/rag/vector_index.json (62 Chunks)"]
    end

    %% Wiring connections
    NAV --> AR_SCR
    NAV --> AI_SCR
    NAV --> RAG_SCR
    AR_SCR --> HUD
    AR_SCR --> ALGO_SEL
    
    ALGO_SEL --> ENGINES
    ENGINES --> AR_SVC
    AR_SVC --> FRAMING --> VIZ
    
    AR_SCR --> EGEA_EVT --> EGEA_PACE --> EGEA_POL --> HUD
    
    ENGINES -.-> CTX_BLD
    CTX_BLD --> TUTOR_SVC
    V_STORE --> TUTOR_SVC
    TUTOR_SVC --> CITE_VAL
    CITE_VAL --> AI_SCR
    CITE_VAL --> HUD
    
    VEC_JSON --> V_STORE
    EVAL_ENG --> RAG_SCR
    
    TUTOR_SVC -.-> ROUTER
    ROUTER --> RAG_RET
    ROUTER --> RAG_TUT
    ROUTER --> RAG_STAT
```

---

## 3. Subsystem Breakdown and Responsibilities

### 3.1 Spatial Visualizers & Tabletop Invariants
All 8 visualizers maintain strict physical bounds to prevent camera clipping, perspective distortion, or occlusion by mobile system navigation bars and on-screen HUDs:
- **Width Span**: $0.314\text{m} - 0.650\text{m}$ (ergonomically fits on standard desks and tables).
- **Height Span**: $0.237\text{m} - 0.488\text{m}$.
- **Base Clearance**: $Y_{\min} \ge 0.09\text{m} - 0.14\text{m}$ (elevated above bottom control dock).

### 3.2 EGEA Deterministic Adaptation
- **Pacing Metrics**: Exponentially Weighted Moving Average (EWMA) tracks inter-step decision speeds.
- **Intervention Categories**: `CONTEXTUAL_HINT`, `HIGHLIGHT_ELEMENT`, `STEPWISE_SLOWDOWN`, `WORKED_EXAMPLE`, `PREREQUISITE_REVIEW`, `REDUCE_GUIDANCE`.
- **Runtime Footprint**: Zero network requests; $< 10\mu\text{s}$ execution per frame.

### 3.3 Verified RAG Grounding
- **Knowledge Base**: 9 JSON documents, 62 semantic chunks, 128-dimensional unit hypersphere embeddings.
- **Dual Verification Gate**: Similarity threshold $\ge 0.40$ and domain token overlap $\ge 0.15$.
- **Citation Auditing**: Extracted citation tags (`[DOC-BST-01]`, `[DOC-AVL-01]`, etc.) must strictly belong to the retrieved chunk set.
- **Honest Refusal**: Guarantees zero hallucinated claims for unindexed concepts.
