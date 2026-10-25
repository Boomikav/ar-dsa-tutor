import { IMisconceptionAgent, LearnerAIContext, MisconceptionAnalysisResult } from '../../../models/multiAgent';

/**
 * Specialized Misconception Agent.
 * Analyzes structured learning evidence, error frequencies, and direction patterns
 * to identify recurring conceptual misconceptions and root causes.
 * 
 * Invariants:
 * - Does NOT calculate BST algorithmic correctness (BSTPracticeEngine is ground truth).
 * - Interprets evidence; does not invent correctness.
 */
export class MisconceptionAgent implements IMisconceptionAgent {
  readonly agentName = 'MisconceptionAgent' as const;
  private readonly endpoint = '/api/ai/orchestrator';

  async analyzeMisconception(context: LearnerAIContext): Promise<MisconceptionAnalysisResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'REPEATED_MISCONCEPTION',
          context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.misconceptionAnalysis) {
          return data.misconceptionAnalysis;
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }

    return this.fallbackAnalysis(context);
  }

  public fallbackAnalysis(context: LearnerAIContext): MisconceptionAnalysisResult {
    const history = context.misconceptionHistory || [];
    const active = context.activeMisconception;
    const count = history.length;

    if (count >= 2) {
      return {
        misconceptionDetected: true,
        misconceptionType: active?.type || history[0]?.type || 'BST_WRONG_DIRECTION',
        recurrence: count >= 3 ? 'CHRONIC' : 'REPEATED',
        confidence: count >= 3 ? 0.94 : 0.85,
        evidence: [
          `Observed ${count} directional mistakes in recent practice`,
          `Consistently selected incorrect subtree branch for key magnitude comparison`,
          `Current operation comparison: ${context.currentOperation?.comparisonText || '40 < 50'}`
        ],
        recommendedIntervention: 'Provide Socratic reflection on numerical comparison (< vs >) followed by invariant diagnostic verification.',
        rootCauseAnalysis: 'The learner consistently inverts the BST comparison rule, routing smaller target keys to the right child instead of the left child.',
        timestamp: new Date().toISOString(),
        isFallback: true
      };
    } else if (count === 1 || active) {
      return {
        misconceptionDetected: true,
        misconceptionType: active?.type || 'BST_WRONG_DIRECTION',
        recurrence: 'FIRST_OCCURRENCE',
        confidence: 0.65,
        evidence: [
          `Single directional mistake recorded at node ${context.currentOperation?.currentNodeValue ?? 50}`
        ],
        recommendedIntervention: 'Gentle reminder of BST ordering property before re-attempting decision.',
        rootCauseAnalysis: 'Likely an isolated miscalculation or misclick during tree traversal.',
        timestamp: new Date().toISOString(),
        isFallback: true
      };
    }

    return {
      misconceptionDetected: false,
      recurrence: 'NONE',
      confidence: 0.95,
      evidence: ['No cognitive misconceptions detected in session history'],
      recommendedIntervention: 'Continue standard guided traversal practice.',
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
}
