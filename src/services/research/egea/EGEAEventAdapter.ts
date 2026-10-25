/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Event Adapter
 * 
 * Ingests raw interaction steps from the 5 deterministic DSA engines and normalizes
 * them into validated, monotonic EGEAInteractionEvents for adaptation analysis.
 */

import {
  EGEAAlgorithmId,
  EGEAErrorCategory,
  EGEAInteractionEvent,
  validateEGEAEvent,
  VALID_EGEA_ALGORITHM_IDS,
} from './EGEAEventSchema';

export interface RawInteractionInput {
  stepIdentifier: string;
  attemptedAction: string;
  expectedAction: string;
  isCorrect: boolean;
  errorCategory?: EGEAErrorCategory;
  stateContext: Record<string, unknown>;
  hintUsed?: boolean;
}

export class EGEAEventAdapter {
  private sessionId: string;
  private algorithmId: EGEAAlgorithmId;
  private sequenceCounter: number = 0;
  private cumulativeHints: number = 0;
  private lastActionTimestamp: number;
  private events: EGEAInteractionEvent[] = [];

  constructor(sessionId: string, algorithmId: EGEAAlgorithmId) {
    if (!VALID_EGEA_ALGORITHM_IDS.includes(algorithmId)) {
      throw new Error(`Unsupported algorithm ID for EGEA session: ${algorithmId}`);
    }
    this.sessionId = sessionId;
    this.algorithmId = algorithmId;
    this.lastActionTimestamp = Date.now();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getAlgorithmId(): EGEAAlgorithmId {
    return this.algorithmId;
  }

  public getEvents(): readonly EGEAInteractionEvent[] {
    return [...this.events];
  }

  public getSequenceCount(): number {
    return this.sequenceCounter;
  }

  /**
   * Resets the adapter for a new algorithm or renewed session.
   */
  public reset(newSessionId?: string, newAlgorithmId?: EGEAAlgorithmId): void {
    if (newSessionId) this.sessionId = newSessionId;
    if (newAlgorithmId) {
      if (!VALID_EGEA_ALGORITHM_IDS.includes(newAlgorithmId)) {
        throw new Error(`Unsupported algorithm ID: ${newAlgorithmId}`);
      }
      this.algorithmId = newAlgorithmId;
    }
    this.sequenceCounter = 0;
    this.cumulativeHints = 0;
    this.lastActionTimestamp = Date.now();
    this.events = [];
  }

  /**
   * Records a hint request event in the session telemetry.
   */
  public recordHintUsage(): void {
    this.cumulativeHints += 1;
  }

  /**
   * Translates and ingests a raw interaction attempt into a validated EGEA event.
   */
  public recordInteraction(input: RawInteractionInput): EGEAInteractionEvent {
    const now = Date.now();
    const latency = Math.max(0, now - this.lastActionTimestamp);
    this.lastActionTimestamp = now;

    if (input.hintUsed) {
      this.cumulativeHints += 1;
    }

    this.sequenceCounter += 1;

    let errorCategory: EGEAErrorCategory = 'NONE';
    if (!input.isCorrect) {
      errorCategory = input.errorCategory || this.inferErrorCategory(input.attemptedAction, input.expectedAction);
    }

    const event: EGEAInteractionEvent = {
      eventId: `${this.sessionId}-seq-${this.sequenceCounter}-${Math.random().toString(36).slice(2, 7)}`,
      sequenceNumber: this.sequenceCounter,
      sessionId: this.sessionId,
      algorithmId: this.algorithmId,
      stepIdentifier: input.stepIdentifier,
      attemptedAction: input.attemptedAction,
      expectedAction: input.expectedAction,
      isCorrect: input.isCorrect,
      errorCategory,
      hintExposureCount: this.cumulativeHints,
      timeSinceLastActionMs: latency,
      stateContext: { ...input.stateContext },
      timestamp: new Date(now).toISOString(),
    };

    const validation = validateEGEAEvent(event);
    if (!validation.valid) {
      throw new Error(`EGEA Event Validation Failed: ${validation.errors.join(', ')}`);
    }

    this.events.push(event);
    return event;
  }

  /**
   * Deterministic fallback heuristic for inferring category when not explicitly supplied.
   */
  private inferErrorCategory(attempted: string, expected: string): EGEAErrorCategory {
    switch (this.algorithmId) {
      case 'ds-binary-search-tree':
        if (attempted.includes('LEFT') || attempted.includes('RIGHT')) {
          return 'VALUE_COMPARISON';
        }
        return 'TRAVERSAL_DIRECTION';

      case 'algo-bubble-sort':
        if (attempted === 'SWAP' && expected !== 'SWAP') {
          return 'VALUE_COMPARISON';
        }
        return 'VALUE_COMPARISON';

      case 'algo-binary-search':
        if (attempted === 'LEFT' || attempted === 'RIGHT') {
          return 'VALUE_COMPARISON';
        }
        return 'BOUNDARY_OVERFLOW';

      case 'algo-breadth-first-search':
        if (attempted.includes('VISIT')) {
          return 'CYCLE_OR_UNVISITED';
        }
        return 'TRAVERSAL_DIRECTION';

      case 'ds-stack':
        if (attempted === 'PUSH' || attempted === 'POP') {
          return 'CAPACITY_LIMIT';
        }
        return 'TRAVERSAL_DIRECTION';

      default:
        return 'VALUE_COMPARISON';
    }
  }
}
