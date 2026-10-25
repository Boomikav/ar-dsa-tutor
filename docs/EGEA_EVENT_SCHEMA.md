# Execution-Grounded Explainable Adaptation (EGEA) — Event Schema Specification

**Version:** 1.0.0  
**Specification Reference:** EGEA-SPEC-2026-01  
**Module Source:** `src/services/research/egea/EGEAEventSchema.ts`  

---

## 1. Schema Definition

The EGEA event model defines the standard telemetry payload recorded for every learner interaction during a 3D/AR algorithm practice session.

```typescript
export interface EGEAInteractionEvent {
  eventId: string;                 // Globally unique identifier
  sequenceNumber: number;          // Strictly monotonic per session (1, 2, 3...)
  sessionId: string;               // Unique ID for the active learning session
  algorithmId: EGEAAlgorithmId;    // DSA topic identifier
  stepIdentifier: string;          // Specific sub-task or node key
  attemptedAction: string;         // Learner input action
  expectedAction: string;          // Ground-truth expected action
  isCorrect: boolean;              // Correctness flag
  errorCategory: EGEAErrorCategory;// Classified error type
  hintExposureCount: number;       // Cumulative hints accessed
  timeSinceLastActionMs: number;   // Intersite action latency
  stateContext: Record<string, unknown>; // Deterministic engine state
  timestamp: string;               // ISO 8601 UTC timestamp
}
```

---

## 2. Enumerated Domains

### 2.1 Algorithm Identifiers (`EGEAAlgorithmId`)
- `ds-binary-search-tree`: Binary Search Tree insertion, search, and traversal
- `algo-bubble-sort`: Bubble Sort comparison and adjacent element swapping
- `algo-binary-search`: Binary Search interval halving and pointer tracking
- `algo-breadth-first-search`: Breadth-First Search level traversal and queue operations
- `ds-stack`: Stack LIFO push/pop and capacity constraint verification

### 2.2 Error Categories (`EGEAErrorCategory`)
| Category | Description | Primary Manifestation |
|---|---|---|
| `VALUE_COMPARISON` | Incorrect relational decision ($<, \le, >, \ge$) | Choosing wrong child in BST; swapping elements out of order |
| `BOUNDARY_OVERFLOW` | Index out-of-bounds or inverted search pointer | Narrowing interval past low > high without verifying target |
| `TRAVERSAL_DIRECTION` | Divergence from valid graph edge or tree branch | Jumping to non-adjacent node or non-child |
| `CYCLE_OR_UNVISITED` | Revisiting an already visited vertex or skipping queue item | Re-enqueuing visited graph node |
| `CAPACITY_LIMIT` | Violating fixed structural capacity | Pushing to stack when size = 5, or popping from empty stack |
| `NONE` | No error occurred | `isCorrect === true` |

---

## 3. Strict Structural Invariants

1. **Monotonic Sequence Guarantee:** For any session sequence $\langle e_1, \dots, e_n \rangle$, $e_{k}.\text{sequenceNumber} = k$ for all $1 \le k \le n$.
2. **Temporal Consistency:** Timestamp of event $k$ must be greater than or equal to timestamp of event $k-1$: $\tau_k \ge \tau_{k-1}$.
3. **Correctness & Error Category Coherence:**
   - If `isCorrect === true`, then `errorCategory === 'NONE'`.
   - If `isCorrect === false`, then `errorCategory !== 'NONE'`.
4. **Session Boundary Isolation:** All events in an event sequence must share the same `sessionId` and `algorithmId`. Algorithm transitions require initiating a new session.
