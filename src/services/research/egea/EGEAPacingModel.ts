/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Temporal Pacing & Exponentially Weighted Moving Average (EWMA) Model
 * 
 * Formal, deterministic mathematical model for evaluating learner interaction
 * pacing, distinguishing impulsive trial-and-error guessing from deliberate reflection
 * without brittle knife-edge threshold artifacts.
 */

import { EGEAInteractionEvent } from './EGEAEventSchema';

export interface PacingEvaluationConfig {
  /** Smoothing factor alpha for EWMA in range (0, 1]. Default 0.5. */
  alpha: number;
  /** Hard rapid-guessing threshold in ms. Default 1500ms. */
  fastThresholdMs: number;
  /** Boundary-expansion threshold in ms for sustained fast attempts. Default 1800ms. */
  boundaryThresholdMs: number;
  /** Minimum inter-action duration to qualify as deliberate reflection in ms. Default 3000ms. */
  deliberateThresholdMs: number;
  /** Maximum valid latency in ms before clamping. Default 60000ms (60s). */
  maxValidLatencyMs: number;
  /** Minimum latency threshold for mechanical touch-event jitter. Default 250ms. */
  touchJitterFloorMs: number;
}

export const DEFAULT_PACING_CONFIG: Readonly<PacingEvaluationConfig> = Object.freeze({
  alpha: 0.5,
  fastThresholdMs: 1500,
  boundaryThresholdMs: 1800,
  deliberateThresholdMs: 3000,
  maxValidLatencyMs: 60000,
  touchJitterFloorMs: 250,
});

export interface PacingAnalysisResult {
  isRapidGuessing: boolean;
  isTouchJitter: boolean;
  isDeliberatePondering: boolean;
  currentLatencyMs: number;
  smoothedLatencyMs: number;
  consecutiveErrorCount: number;
  rationale: string;
}

export class EGEAPacingModel {
  /**
   * Sanitizes raw latency into a bounded, finite float in [0, maxValidLatencyMs].
   * Replaces NaN, negative values, and non-finite floats with safe deliberate baseline.
   */
  public static sanitizeLatency(rawMs: unknown, maxMs: number = 60000): number {
    if (typeof rawMs !== 'number' || isNaN(rawMs) || !isFinite(rawMs)) {
      return 3000; // Safe default deliberate latency
    }
    return Math.min(Math.max(0, rawMs), maxMs);
  }

  /**
   * Computes the EWMA of a sequence of latencies using the specified smoothing factor alpha.
   * Update equation: S_k = alpha * L_k + (1 - alpha) * S_{k-1}
   * 
   * @param latencies Sequence of non-negative action durations in ms
   * @param alpha Smoothing factor (0 < alpha <= 1)
   * @returns Smoothed latency value in ms
   */
  public static computeEWMA(latencies: readonly number[], alpha: number = 0.5): number {
    if (!latencies || latencies.length === 0) {
      return 3000;
    }

    const clampedAlpha = Math.min(Math.max(0.01, alpha), 1.0);
    let smoothed = this.sanitizeLatency(latencies[0]);

    for (let i = 1; i < latencies.length; i++) {
      const current = this.sanitizeLatency(latencies[i]);
      smoothed = clampedAlpha * current + (1 - clampedAlpha) * smoothed;
    }

    return smoothed;
  }

  /**
   * Evaluates the temporal pacing of the recent interaction sequence.
   * 
   * Invariants:
   * 1. Requires at least 2 consecutive errors to trigger rapid guessing.
   * 2. Mechanical double-tap jitter (< 250ms on same action) is flagged as jitter, NOT guessing.
   * 3. Pacing near the threshold (e.g., 1600ms) is captured via smoothed EWMA (< 1800ms).
   * 4. Deliberate pauses (>= 3000ms) are strictly protected against guessing classification.
   * 
   * @param events Validated sequence of interaction events
   * @param config Optional configuration overrides
   * @returns Detailed pacing analysis result
   */
  public static evaluatePacing(
    events: readonly EGEAInteractionEvent[],
    config: PacingEvaluationConfig = DEFAULT_PACING_CONFIG
  ): PacingAnalysisResult {
    if (!events || events.length === 0) {
      return {
        isRapidGuessing: false,
        isTouchJitter: false,
        isDeliberatePondering: false,
        currentLatencyMs: 0,
        smoothedLatencyMs: 0,
        consecutiveErrorCount: 0,
        rationale: 'No interaction events available.',
      };
    }

    // 1. Count trailing consecutive errors
    let consecutiveErrors = 0;
    for (let i = events.length - 1; i >= 0; i--) {
      if (!events[i].isCorrect) {
        consecutiveErrors++;
      } else {
        break;
      }
    }

    const lastEvent = events[events.length - 1];
    const currentLatency = this.sanitizeLatency(lastEvent.timeSinceLastActionMs, config.maxValidLatencyMs);

    // If the latest event is correct, learner is not guessing
    if (lastEvent.isCorrect || consecutiveErrors < 2) {
      return {
        isRapidGuessing: false,
        isTouchJitter: false,
        isDeliberatePondering: currentLatency >= config.deliberateThresholdMs,
        currentLatencyMs: currentLatency,
        smoothedLatencyMs: currentLatency,
        consecutiveErrorCount: consecutiveErrors,
        rationale: consecutiveErrors === 0 
          ? 'Latest action was correct; standard progression pacing.'
          : 'Isolated single error; deliberate practice preserved.',
      };
    }

    // 2. Check for mechanical touch-event jitter (< 250ms on identical control/action)
    const prevEvent = events[events.length - 2];
    const isIdenticalAction = (
      lastEvent.stepIdentifier === prevEvent.stepIdentifier &&
      lastEvent.attemptedAction === prevEvent.attemptedAction
    );
    const isTouchJitter = currentLatency < config.touchJitterFloorMs && isIdenticalAction;

    if (isTouchJitter) {
      return {
        isRapidGuessing: false,
        isTouchJitter: true,
        isDeliberatePondering: false,
        currentLatencyMs: currentLatency,
        smoothedLatencyMs: currentLatency,
        consecutiveErrorCount: consecutiveErrors,
        rationale: `Sub-${config.touchJitterFloorMs}ms repeated action detected (${currentLatency}ms). Classified as mechanical touch jitter rather than cognitive guessing.`,
      };
    }

    // 3. Extract recent error latencies for EWMA calculation
    const recentErrorEvents = events.slice(-consecutiveErrors);
    const errorLatencies = recentErrorEvents.map(e => this.sanitizeLatency(e.timeSinceLastActionMs, config.maxValidLatencyMs));
    const smoothedLatency = this.computeEWMA(errorLatencies, config.alpha);

    // 4. Deliberate pondering protection
    if (currentLatency >= config.deliberateThresholdMs) {
      return {
        isRapidGuessing: false,
        isTouchJitter: false,
        isDeliberatePondering: true,
        currentLatencyMs: currentLatency,
        smoothedLatencyMs: smoothedLatency,
        consecutiveErrorCount: consecutiveErrors,
        rationale: `Deliberate reflection interval (${currentLatency}ms >= ${config.deliberateThresholdMs}ms). Prompting contextual hint.`,
      };
    }

    // 5. Evaluate impulsive guessing via EWMA and multi-condition rules:
    // Condition A: Fast burst (current error < fastThresholdMs, e.g. 1500ms)
    const isFastBurst = currentLatency < config.fastThresholdMs;

    // Condition B: Sustained near-threshold evasion (current error <= boundaryThresholdMs AND smoothed <= boundaryThresholdMs)
    // E.g., 1600ms guessing with smoothed latency <= 1800ms
    const isSustainedFast = (
      currentLatency <= config.boundaryThresholdMs &&
      smoothedLatency <= config.boundaryThresholdMs
    );

    // Condition C: Accelerating error burst (current error is faster than previous and both under boundary)
    const prevLatency = this.sanitizeLatency(prevEvent.timeSinceLastActionMs, config.maxValidLatencyMs);
    const isAccelerating = (
      currentLatency < prevLatency &&
      currentLatency < config.boundaryThresholdMs
    );

    const isRapidGuessing = (isFastBurst || isSustainedFast || isAccelerating) && !isTouchJitter;

    let rationale = '';
    if (isRapidGuessing) {
      if (isFastBurst) {
        rationale = `Impulsive trial-and-error detected: inter-action latency (${currentLatency}ms) is below ${config.fastThresholdMs}ms threshold across ${consecutiveErrors} consecutive errors.`;
      } else if (isSustainedFast) {
        rationale = `Sustained rapid guessing detected: latency (${currentLatency}ms) and smoothed EWMA (${Math.round(smoothedLatency)}ms) both fall within the bounded guessing zone (<= ${config.boundaryThresholdMs}ms).`;
      } else {
        rationale = `Accelerating error cadence detected: latency dropped from ${prevLatency}ms to ${currentLatency}ms.`;
      }
    } else {
      rationale = `Error committed at moderate pacing (${currentLatency}ms, smoothed ${Math.round(smoothedLatency)}ms). Contextual hint indicated.`;
    }

    return {
      isRapidGuessing,
      isTouchJitter: false,
      isDeliberatePondering: false,
      currentLatencyMs: currentLatency,
      smoothedLatencyMs: smoothedLatency,
      consecutiveErrorCount: consecutiveErrors,
      rationale,
    };
  }
}
