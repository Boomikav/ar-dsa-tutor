# AR-DSA Tutor: Five-Layer System Architecture

This document describes the architectural framework of **AR-DSA Tutor**, designed to combine Generative AI, Augmented Reality, Learner Modeling, and Knowledge Graph reasoning into a cohesive mobile educational platform.

---

```
┌─────────────────────────────────────────────────────────────────────────┐
│               LAYER 1: MOBILE AR LEARNING INTERFACE                     │
│  Mobile App Shell • 12 Screen Modules • HUD Overlays • Spatial Reticles │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
┌────────▼─────────────────────────┐   ┌─────────────────────────▼────────┐
│   LAYER 4: CONTEXT-AWARE AR      │   │   LAYER 3: MULTI-AGENT GEN AI    │
│  IARService                      │   │  IAIService                      │
│  • WebXR Session Controller      │   │  • Socratic Reasoning Agent      │
│  • Surface Plane Hit-Testing     │   │  • Cognitive Diagnostic Agent    │
│  • 3D Procedural Mesh Shaders    │   │  • Spatial Hint Generation       │
│  • 6DoF Gesture Interaction      │   │  • Asymptotic Complexity Expl.   │
└────────────────┬─────────────────┘   └─────────────────────────┬────────┘
                 │                                               │
                 └───────────────────────────┬───────────────────┘
                                             │
┌────────────────────────────────────────────▼────────────────────────────┐
│                    LAYER 2: LEARNER INTELLIGENCE                        │
│  ILearnerService • IKnowledgeGraphService                               │
│  • Student Cognitive Profile & Academic Tier                            │
│  • Concept Mastery Map (20 DSA Topics)                                  │
│  • Topological DAG Traversal & Prerequisite Validation                  │
│  • Spaced Repetition Retention Decay Estimator                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│          LAYER 5: LEARNING ANALYTICS & ADAPTIVE FEEDBACK                │
│  IAnalyticsService • IRecommendationService                             │
│  • Cognitive Telemetry & Quiz Response Latency Capture                  │
│  • Misconception Classification & Weakness Mapping                      │
│  • Priority-Ranked Action Generator (Next Concept / Spaced Drill)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Mobile AR Learning Interface

### Responsibilities
- Deliver an ultra-responsive, distraction-free educational experience optimized for mobile screens.
- Provide a simulated mobile chassis for desktop testing, complete with native status bar, safe area padding, and responsive viewport sizing.
- Coordinate navigation between 12 distinct functional modules:
  1. `SplashScreen`
  2. `OnboardingScreen`
  3. `HomeScreen` (Home Dashboard)
  4. `TopicExplorerScreen`
  5. `LearningSessionScreen`
  6. `ARSessionScreen`
  7. `AITutorScreen`
  8. `AssessmentScreen`
  9. `ProgressScreen`
  10. `RecommendationsScreen`
  11. `ProfileScreen`
  12. `SettingsScreen`
- Render persistent bottom navigation docks and contextual top headers with back buttons and live streak indicators.

### Key Components
- `MobileFrame.tsx`: Viewport enclosure and device frame toggle.
- `BottomNavigation.tsx`: Floating navigation dock.
- `HeaderBar.tsx`: Sticky navigation header.
- `TopicCard.tsx`, `StatCard.tsx`, `ProgressBar.tsx`, `MasteryBadge.tsx`.

---

## Layer 2 — Learner Intelligence

### Responsibilities
- Model student cognitive state, mastery trajectories, and topic prerequisite relationships.
- Represent concepts as a Directed Acyclic Graph (DAG) distinguishing:
  - `PREREQUISITE`: Strict conceptual foundation required for comprehension.
  - `SUPPORTING_CONCEPT`: Implementation tool or intuition-builder that enriches understanding without blocking.
  - `APPLICATION_DEPENDENCY`: Algorithmic procedure operating directly on a data structure.
  - `RELATED_CONCEPT`: Parallel or contrasting alternative concepts at the same tier.
- Maintain mastery percentages, confidence (0.0 to 1.0), correct/incorrect attempt counts, recent/historical assessment trajectories, and retention decay scores across all curriculum topics.

### Contracts & Interfaces
```typescript
interface ConceptRelationship {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: 'PREREQUISITE' | 'SUPPORTING_CONCEPT' | 'APPLICATION_DEPENDENCY' | 'RELATED_CONCEPT';
  strength: 'MANDATORY' | 'RECOMMENDED' | 'HELPFUL';
  rationale: string;
}

interface ConceptMastery {
  topicId: string;
  masteryPercentage: number;
  confidence: number;
  attemptsCount: number;
  correctAttempts: number;
  incorrectAttempts: number;
  recentPerformanceScore: number;
  historicalPerformanceScores: number[];
  lastReviewedAt: string;
  lastStudiedTimestamp: string;
  prerequisiteStatus: 'locked' | 'unlocked' | 'in_progress' | 'mastered';
  learningProgress: number;
  retentionScore: number;
  needsReview: boolean;
}
```

---

## Layer 3 — Multi-Agent Generative AI

### Responsibilities
- Decouple AI dialogue from concrete LLM APIs via `IAIService`.
- Formulate topic-grounded explanations, Socratic diagnostic questions, and spatial hints without spoonfeeding solutions.
- Support multimodal contextual injection (active topic, student cognitive tier, current AR step).

### Contracts & Interfaces
```typescript
interface IAIService {
  askQuestion(question: string, topicContext: DSATopic, learnerState: LearnerState): Promise<AIMessage>;
  requestHint(request: AIHintRequest): Promise<string>;
  explainConcept(request: AIExplanationRequest): Promise<string>;
  generateDiagnosticQuestions(topic: DSATopic, count?: number): Promise<DiagnosticQuestion[]>;
}
```

---

## Layer 4 — Context-Aware Adaptive AR

### Responsibilities
- Abstract hardware-dependent AR capabilities (WebXR Device API, ARCore, ARKit) via `IARService`.
- Manage spatial tracking lifecycles: `initializing` → `detecting_plane` → `plane_anchored` → `tracking_lost`.
- Handle spatial anchor transformations: rotation, scaling, and step-by-step traversal through algorithm animations.
- Provide clear diagnostic notices during Phase 1 simulation before 3D WebXR shaders are attached in Phase 4.

### Contracts & Interfaces
```typescript
interface IARService {
  readonly isMock: boolean;
  readonly trackingState: ARTrackingState;
  checkCapabilities(): Promise<ARCapabilities>;
  initializeSession(canvas: HTMLCanvasElement | null, config?: ARSessionConfig): Promise<boolean>;
  anchorDataStructure(topic: DSATopic, spec: VisualAssetSpec): Promise<ARSpatialAnchor>;
  updateTransform(scaleDelta?: number, rotationDelta?: { x: number; y: number; z: number }): void;
  stepVisualization(forward: boolean): number;
  resetAnchor(): void;
  disposeSession(): Promise<void>;
  onTrackingStateChange(callback: (state: ARTrackingState) => void): () => void;
}
```

---

## Layer 5 — Learning Analytics & Adaptive Feedback

### Responsibilities
- Ingest real-time interaction telemetry: quiz answer attempts, response times, AR manipulation durations, and hint frequency.
- Generate prioritized next-step recommendations combining knowledge graph topology with learner mastery gaps.
- Predict spaced repetition review schedules to prevent concept decay.

### Contracts & Interfaces
```typescript
interface IAnalyticsService {
  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void>;
  recordQuizAttempt(attempt: Omit<QuizAttempt, 'attemptId'>): Promise<void>;
  getTopicAnalytics(topicId: string): Promise<TopicAnalytics>;
  getRecentEvents(limit?: number): Promise<AnalyticsEvent[]>;
}

interface IRecommendationService {
  getRecommendations(learnerState: LearnerState, graphService: IKnowledgeGraphService): Promise<Recommendation[]>;
}
```

---

## Future Phase Integration Roadmap

- **Phase 2**: Real-time State & Knowledge Graph Reasoning (Graph visualization canvas, dynamic prerequisite calculation).
- **Phase 3**: Multi-Agent Generative AI Integration (Gemini 2.5 / Flash agents, streaming responses, pedagogical evaluators).
- **Phase 4**: Native Mobile AR & Procedural 3D Shaders (Three.js WebGL / WebXR pipeline, camera feed hit-testing, procedural node meshes).
- **Phase 5**: Cloud Analytics, Persistence & Adaptive Learning Engine (Distributed learner profiles, telemetry ingestion pipeline).
