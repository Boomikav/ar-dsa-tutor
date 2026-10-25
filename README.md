# AR-DSA Tutor
> **A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning**

AR-DSA Tutor is a production-quality mobile learning application combining Augmented Reality (AR) spatial mental modeling, Socratic Generative AI tutoring, and Knowledge Graph-driven adaptive mastery for Computer Science education.

---

## Phase 1 Implementation Status

This repository contains the completed **Phase 1 Foundational Architecture**. Phase 1 establishes the production mobile shell, navigation architecture, futuristic academic design system, 12 major screen modules, domain models, 6 service abstraction contracts, and initial 20-concept DSA catalog with topological prerequisite graphs.

In accordance with strict architectural rules:
- **No fake AR or fake AI** is implemented.
- Pure service abstraction boundaries (`IARService`, `IAIService`, `ILearnerService`, `IKnowledgeGraphService`, `IAnalyticsService`, `IRecommendationService`) decouple the mobile UI from underlying native AR engines and multi-agent LLM systems.
- Concrete Phase 1 mock providers are clearly marked with `isMock: true` and structured diagnostics.

---

## Technology Stack & Architectural Decision

| Component | Technology | Version | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React + TypeScript | 19.2.x / 6.0.x | Strict type contracts for complex data structures, ASTs, and service boundaries. |
| **Bundler & Dev Server** | Vite | 8.3.x | Sub-200ms builds, ESM tree-shaking, and zero-overhead mobile HMR. |
| **Styling** | Vanilla CSS Tokens | CSS Variables | Framework-independent design system (`tokens.css`, `base.css`, `components.css`) ensuring zero styling lock-in and high performance. |
| **Iconography** | Lucide React | ^1.47.0 | Tree-shakeable, clean technical visual semantics. |
| **3D & AR Foundation** | WebXR + Three.js | ^0.186.0 | Web-standard 6DoF spatial rendering; cross-compilable to iOS (ARKit) and Android (ARCore) via Capacitor/WebXR. |

### Why This Stack Supports Real Mobile AR
Rather than creating a web-only toy or relying on inflexible web mockups:
1. **WebXR Device API**: Supported natively on modern mobile browsers (Chrome Android ARCore, WebXR viewers on iOS).
2. **Capacitor Mobile Bridge**: The application directory is structured so that adding `@capacitor/core`, `@capacitor/ios`, and `@capacitor/android` compiles this codebase directly into native iOS and Android packages without rewriting UI components or service interfaces.
3. **Hardware Camera Access**: The `IARService` contract provides standardized lifecycle hooks for camera passthrough, spatial plane estimation, 3D anchor positioning, and gestures.

---

## Project Structure

```
AR/
├── index.html                   # Mobile-first viewport, safe-area cover, Google Fonts
├── package.json                 # Dependencies (React 19, Three.js, Lucide, Vite)
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite configuration
├── docs/
│   └── ARCHITECTURE.md          # Comprehensive Five-Layer System Specification
└── src/
    ├── main.tsx                 # Entrypoint
    ├── App.tsx                  # App shell, 12-screen router & device container
    ├── index.css                # Central theme import
    ├── theme/
    │   ├── tokens.css           # Color palette, spacing, typography, elevation
    │   ├── base.css             # CSS reset and mobile shell layout
    │   └── components.css       # Buttons, cards, badges, HUDs, navigation dock
    ├── models/                  # Domain Models
    │   ├── topic.ts             # DSATopic, Difficulty, VisualAssetSpec
    │   ├── learner.ts           # StudentProfile, LearnerState, ConceptMastery
    │   ├── knowledgeGraph.ts    # ConceptNode, PrerequisiteEdge, ConceptGraph
    │   ├── recommendation.ts    # Recommendation, RecommendationReason
    │   └── analytics.ts         # AnalyticsEvent, QuizAttempt, TopicAnalytics
    ├── data/                    # Datasets & Mocks
    │   ├── topicsData.ts        # 20 full DSA topics (9 Data Structures + 11 Algorithms)
    │   ├── knowledgeGraphData.ts# 20-node DAG with prerequisite edges
    │   └── mockLearnerData.ts   # Realistic initial learner state
    ├── services/                # Service Abstractions & Implementations
    │   ├── ai/                  # IAIService.ts, MockAIService.ts
    │   ├── ar/                  # IARService.ts, MockARService.ts
    │   ├── learner/             # ILearnerService.ts, LocalLearnerService.ts
    │   ├── knowledgeGraph/      # IKnowledgeGraphService.ts, InMemoryKnowledgeGraphService.ts
    │   ├── analytics/           # IAnalyticsService.ts, LocalAnalyticsService.ts
    │   ├── recommendation/      # IRecommendationService.ts, RuleBasedRecommendationService.ts
    │   └── index.ts             # Dependency injection container & service registry
    ├── state/                   # Reactive State
    │   └── AppContext.tsx       # Global reactive context, screen navigation, state sync
    ├── components/              # Reusable UI Primitives
    │   ├── MobileFrame.tsx      # Mobile chassis simulator & preview toolbar
    │   ├── BottomNavigation.tsx # Floating bottom dock (Home, Topics, AI, Progress, Profile)
    │   ├── HeaderBar.tsx        # Top app bar with back action & contextual status
    │   ├── StatCard.tsx         # Metric KPI card
    │   ├── TopicCard.tsx        # Curriculum card with mastery rings & prereq lock
    │   ├── MasteryBadge.tsx     # Colored progress badge
    │   └── ProgressBar.tsx      # Animated glow progress bar
    └── screens/                 # 12 Major Screen Modules
        ├── SplashScreen.tsx     # 1. Launch screen with animated cyber brand
        ├── OnboardingScreen.tsx # 2. 3-step feature tour (AR, AI, Graph)
        ├── HomeScreen.tsx       # 3. Comprehensive home dashboard
        ├── TopicExplorerScreen.tsx # 4. DSA topic explorer (DS & Algo tabs)
        ├── LearningSessionScreen.tsx # 5. Theory, objectives & visualizer shell
        ├── ARSessionScreen.tsx  # 6. Spatial camera HUD, anchor reticle & controls
        ├── AITutorScreen.tsx    # 7. Socratic conversational tutoring interface
        ├── AssessmentScreen.tsx # 8. Diagnostic quizzes with instant rationales
        ├── ProgressScreen.tsx   # 9. 20-topic mastery breakdown & analytics
        ├── RecommendationsScreen.tsx # 10. Adaptive next steps & spaced repetition
        ├── ProfileScreen.tsx    # 11. Student profile & AR hardware diagnostics
        └── SettingsScreen.tsx   # 12. AR quality, AI tutoring style & data reset
```

---

## 12 Implemented Application Areas

1. **Splash / Launch Screen**: Cybernetic brand identity, spatial visualizer icon, initialization routing.
2. **Onboarding**: 3-step interactive tour explaining spatial memory anchors, Socratic AI dialogue, and adaptive knowledge graphs.
3. **Home Dashboard**: Welcome area, streak tracker, mastery KPI, "Continue Learning" active topic card, "Start AR Learning" CTA, "AI Tutor" CTA, category selector, recent activity feed.
4. **DSA Topic Explorer**: Dual tabs (Data Structures vs Algorithms), difficulty filtering, search query matching, prerequisite lock indicators, mastery progress.
5. **Learning Session**: Concept breakdown, asymptotic analysis, learning objectives, procedural 3D visualizer shell, action dock.
6. **AR Learning Session**: Spatial viewport HUD, tracking state pill, scale/zoom controls, step navigation, spatial hint drawer trigger, developer phase notices.
7. **AI Tutor**: Socratic dialog with topic context pill, suggested questions, streaming simulation, hint request, concept explanation.
8. **Assessment**: Diagnostic check shell with randomized questions, instant rationale analysis, score calculation, and mastery persistence.
9. **Learning Progress**: Mastery breakdown across all 20 DSA concepts, time-spent telemetry, domain competency split, retention alerts.
10. **Recommendations**: Prioritized next best topics, prerequisite remediation, spaced repetition drills.
11. **Student Profile**: Academic level, learning pace, device AR diagnostics (WebXR detection), achievement badges.
12. **Settings**: AR graphic quality (low/medium/high), AI tutoring style (Socratic/Direct/Analogical), data reset.

---

## 20 DSA Topics & Knowledge Graph Hierarchy

### Data Structures (9 Concepts)
1. **Array** (Beginner) — Contiguous memory allocation, O(1) random indexing.
2. **Linked List** (Beginner) — Discrete heap nodes, pointer manipulation.
3. **Stack** (Beginner) — LIFO structure, call-stack frame emulation.
4. **Queue** (Beginner) — FIFO sequence, circular buffer arithmetic.
5. **Binary Tree** (Intermediate) — Hierarchical branching, depth levels.
6. **Binary Search Tree** (Intermediate) — Left < Root < Right order invariant.
7. **Heap** (Intermediate) — Array-backed complete binary tree, priority queue.
8. **Hash Table** (Intermediate) — Deterministic hash bucket mapping, collision handling.
9. **Graph** (Advanced) — Arbitrary network of vertices and weighted/directed edges.

### Algorithms (11 Concepts)
10. **Recursion** (Beginner) — Base condition termination, stack frame unwinding.
11. **Linear Search** (Beginner) — Sequential scan over unsorted collections.
12. **Binary Search** (Beginner) — Logarithmic halving of sorted search spaces.
13. **Bubble Sort** (Beginner) — Adjacent comparison and bubbling swaps.
14. **Selection Sort** (Beginner) — Unsorted partition scan with minimum extraction.
15. **Insertion Sort** (Beginner) — Dynamic right-shifting of sorted sub-arrays.
16. **Merge Sort** (Intermediate) — Recursive divide-and-conquer splitting and merging.
17. **Quick Sort** (Intermediate) — In-place partitioning around a chosen pivot.
18. **BFS** (Intermediate) — Level-order queue-driven frontier exploration.
19. **DFS** (Intermediate) — Deep branch traversal with stack backtracking.
20. **Dijkstra's Algorithm** (Advanced) — Greedy shortest path relaxation with Min-Heaps.

---

## How Future Services Will Connect

```
┌─────────────────────────────────────────────────────────────┐
│               Layer 1: Mobile AR Learning UI                │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
┌───────────────▼─────────────┐ ┌─────────────▼───────────────┐
│     IARService Interface    │ │     IAIService Interface    │
│                             │ │                             │
│ Phase 1: MockARService      │ │ Phase 1: MockAIService      │
│ Phase 4: WebXR + Three.js   │ │ Phase 3: Gemini Multi-Agent │
└─────────────────────────────┘ └─────────────────────────────┘
                │                             │
┌───────────────▼─────────────────────────────▼───────────────┐
│           Layer 2 & 5: Learner & Analytics Core             │
│    ILearnerService • IKnowledgeGraph • IAnalyticsService    │
│ Phase 1: Local / In-Memory                                  │
│ Phase 5: Cloud Persistence & Adaptive Learning Engine       │
└─────────────────────────────────────────────────────────────┘
```

When integrating Phase 2, 3, 4, or 5:
- **For AI (Phase 3)**: Replace `MockAIService` in `src/services/index.ts` with `GeminiAgentAIService` implementing `IAIService`. No screen UI changes required.
- **For AR (Phase 4)**: Replace `MockARService` in `src/services/index.ts` with `ThreeWebXRService` implementing `IARService`. The AR viewport canvas will render 3D procedural geometries directly.
- **For Backend (Phase 5)**: Replace `LocalLearnerService` and `LocalAnalyticsService` with `RESTLearnerService` communicating with backend databases.

---

## Commands to Run & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Build Production Bundle
```bash
npm run build
```
Generates optimized static assets in `dist/`.

### 4. Code Quality & Linting
```bash
npx oxlint
npx tsc --noEmit
```
