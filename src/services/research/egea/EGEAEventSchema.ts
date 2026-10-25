/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Event Schema & Invariant Validators
 * 
 * Formal research specification for tracking learner interactions in 3D/AR DSA sessions.
 * Guarantees monotonic sequence ordering, session encapsulation, and strict type safety.
 */

export type EGEAAlgorithmId =
  | 'ds-binary-search-tree'
  | 'algo-bubble-sort'
  | 'algo-binary-search'
  | 'algo-breadth-first-search'
  | 'ds-stack';

export const VALID_EGEA_ALGORITHM_IDS: readonly EGEAAlgorithmId[] = [
  'ds-binary-search-tree',
  'algo-bubble-sort',
  'algo-binary-search',
  'algo-breadth-first-search',
  'ds-stack',
] as const;

export type EGEAErrorCategory =
  | 'VALUE_COMPARISON'       // BST search/insert direction or sort comparison inverted
  | 'BOUNDARY_OVERFLOW'      // Array index out of bounds or search interval inverted
  | 'TRAVERSAL_DIRECTION'    // Graph / tree path divergence or missed child
  | 'CYCLE_OR_UNVISITED'     // BFS revisited vertex or skipped queued neighbor
  | 'CAPACITY_LIMIT'         // Stack overflow (> 5 elements) or underflow (< 0)
  | 'NONE';                  // Correct action

export interface EGEAInteractionEvent {
  eventId: string;
  sequenceNumber: number;          // Strictly monotonic per session (1, 2, 3...)
  sessionId: string;
  algorithmId: EGEAAlgorithmId;
  stepIdentifier: string;          // Identifier of current step or sub-problem
  attemptedAction: string;         // E.g., 'TRAVERSE_LEFT', 'SWAP_ELEMENTS', 'POP'
  expectedAction: string;          // Ground-truth action computed by deterministic engine
  isCorrect: boolean;
  errorCategory: EGEAErrorCategory;
  hintExposureCount: number;       // Cumulative hints viewed before this action
  timeSinceLastActionMs: number;   // Action latency in ms (used for pacing / guessing detection)
  stateContext: Record<string, unknown>; // Deterministic engine state snapshot
  timestamp: string;               // ISO 8601
}

export interface EGEAValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the structure and field types of an individual EGEA interaction event.
 */
export function validateEGEAEvent(event: unknown): EGEAValidationResult {
  const errors: string[] = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event must be a non-null object'] };
  }

  const e = event as Partial<EGEAInteractionEvent>;

  if (typeof e.eventId !== 'string' || e.eventId.trim() === '') {
    errors.push('eventId must be a non-empty string');
  }

  if (typeof e.sequenceNumber !== 'number' || !Number.isInteger(e.sequenceNumber) || e.sequenceNumber < 1) {
    errors.push('sequenceNumber must be a positive integer >= 1');
  }

  if (typeof e.sessionId !== 'string' || e.sessionId.trim() === '') {
    errors.push('sessionId must be a non-empty string');
  }

  if (!e.algorithmId || !VALID_EGEA_ALGORITHM_IDS.includes(e.algorithmId as EGEAAlgorithmId)) {
    errors.push(`algorithmId must be one of: ${VALID_EGEA_ALGORITHM_IDS.join(', ')}`);
  }

  if (typeof e.stepIdentifier !== 'string' || e.stepIdentifier.trim() === '') {
    errors.push('stepIdentifier must be a non-empty string');
  }

  if (typeof e.attemptedAction !== 'string' || e.attemptedAction.trim() === '') {
    errors.push('attemptedAction must be a non-empty string');
  }

  if (typeof e.expectedAction !== 'string' || e.expectedAction.trim() === '') {
    errors.push('expectedAction must be a non-empty string');
  }

  if (typeof e.isCorrect !== 'boolean') {
    errors.push('isCorrect must be a boolean');
  }

  const validErrorCategories: EGEAErrorCategory[] = [
    'VALUE_COMPARISON',
    'BOUNDARY_OVERFLOW',
    'TRAVERSAL_DIRECTION',
    'CYCLE_OR_UNVISITED',
    'CAPACITY_LIMIT',
    'NONE',
  ];

  if (!e.errorCategory || !validErrorCategories.includes(e.errorCategory)) {
    errors.push(`errorCategory must be one of: ${validErrorCategories.join(', ')}`);
  }

  if (e.isCorrect === true && e.errorCategory !== 'NONE') {
    errors.push('isCorrect=true must have errorCategory=NONE');
  }

  if (e.isCorrect === false && e.errorCategory === 'NONE') {
    errors.push('isCorrect=false cannot have errorCategory=NONE');
  }

  if (typeof e.hintExposureCount !== 'number' || e.hintExposureCount < 0) {
    errors.push('hintExposureCount must be a non-negative number');
  }

  if (typeof e.timeSinceLastActionMs !== 'number' || e.timeSinceLastActionMs < 0) {
    errors.push('timeSinceLastActionMs must be a non-negative number');
  }

  if (!e.stateContext || typeof e.stateContext !== 'object') {
    errors.push('stateContext must be an object');
  }

  if (typeof e.timestamp !== 'string' || isNaN(Date.parse(e.timestamp))) {
    errors.push('timestamp must be a valid ISO 8601 date string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a sequence of events for a single session to ensure monotonic ordering
 * and algorithm consistency.
 */
export function validateEventSequence(events: EGEAInteractionEvent[]): EGEAValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(events)) {
    return { valid: false, errors: ['Events must be an array'] };
  }

  if (events.length === 0) {
    return { valid: true, errors: [] };
  }

  const sessionId = events[0].sessionId;
  const algorithmId = events[0].algorithmId;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const itemValidation = validateEGEAEvent(ev);
    if (!itemValidation.valid) {
      errors.push(`Event at index ${i} is invalid: ${itemValidation.errors.join('; ')}`);
    }

    if (ev.sessionId !== sessionId) {
      errors.push(`Session ID mismatch at index ${i}: expected ${sessionId}, got ${ev.sessionId}`);
    }

    if (ev.algorithmId !== algorithmId) {
      errors.push(`Algorithm ID mismatch at index ${i}: expected ${algorithmId}, got ${ev.algorithmId}`);
    }

    const expectedSeq = i + 1;
    if (ev.sequenceNumber !== expectedSeq) {
      errors.push(`Sequence number discontinuity at index ${i}: expected ${expectedSeq}, got ${ev.sequenceNumber}`);
    }

    if (i > 0) {
      const prevTime = Date.parse(events[i - 1].timestamp);
      const currTime = Date.parse(ev.timestamp);
      if (currTime < prevTime) {
        errors.push(`Chronological timestamp inversion at index ${i}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
