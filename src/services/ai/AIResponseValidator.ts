import { TutorResponse, TutorResponseType, TutorNextAction } from '../../models/ai';

const VALID_RESPONSE_TYPES: Set<TutorResponseType> = new Set([
  'EXPLANATION',
  'HINT',
  'MISTAKE_EXPLANATION',
  'ENCOURAGEMENT',
  'CONCEPT_CHECK',
  'NEXT_STEP'
]);

const VALID_NEXT_ACTIONS: Set<TutorNextAction> = new Set([
  'MOVE_LEFT',
  'MOVE_RIGHT',
  'CONFIRM_INSERT',
  'RETRY_DECISION',
  'REVIEW_INVARIANT',
  'CONTINUE_EXPLORING'
]);

export interface ValidationResult {
  isValid: boolean;
  validatedResponse: TutorResponse;
  validationError?: string;
}

/**
 * Validates, normalizes, and sanitizes untrusted model output.
 */
export class AIResponseValidator {
  static validate(
    rawJson: unknown,
    providerName: string,
    modelName: string,
    fallbackConcept: string = 'DATA_STRUCTURE_INVARIANT'
  ): ValidationResult {
    try {
      if (!rawJson || typeof rawJson !== 'object') {
        return this.createFallback(
          'Malformed AI response: expected a JSON object.',
          providerName,
          modelName,
          fallbackConcept
        );
      }

      const obj = rawJson as Record<string, any>;

      // 1. Validate responseType
      const rawType = String(obj.responseType || '').toUpperCase() as TutorResponseType;
      const responseType: TutorResponseType = VALID_RESPONSE_TYPES.has(rawType)
        ? rawType
        : 'EXPLANATION';

      // 2. Validate and sanitize message
      let message = typeof obj.message === 'string' ? obj.message.trim() : '';
      if (!message) {
        return this.createFallback(
          'Missing required "message" string in AI response.',
          providerName,
          modelName,
          fallbackConcept
        );
      }

      // 3. Validate reasoning
      let reasoning = typeof obj.reasoning === 'string' ? obj.reasoning.trim() : '';
      if (!reasoning) {
        reasoning = 'Structured educational reasoning based on fundamental invariants.';
      }

      // 4. Validate nextAction
      let nextAction: TutorNextAction | undefined;
      if (obj.nextAction && typeof obj.nextAction === 'string') {
        const candidate = obj.nextAction.toUpperCase() as TutorNextAction;
        if (VALID_NEXT_ACTIONS.has(candidate)) {
          nextAction = candidate;
        }
      }

      // 5. Validate concept
      const concept = typeof obj.concept === 'string' && obj.concept.trim()
        ? obj.concept.trim()
        : fallbackConcept;

      // 6. Validate difficulty
      let difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'INTERMEDIATE';
      if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(String(obj.difficulty || '').toUpperCase())) {
        difficulty = String(obj.difficulty).toUpperCase() as any;
      }

      // 7. Validate suggestedPrompts
      let suggestedPrompts: string[] = [];
      if (Array.isArray(obj.suggestedPrompts)) {
        suggestedPrompts = obj.suggestedPrompts
          .filter(p => typeof p === 'string' && p.trim())
          .map(p => p.trim())
          .slice(0, 4);
      }
      if (suggestedPrompts.length === 0) {
        suggestedPrompts = [
          'Explain this more simply',
          'Give me an analogy',
          'What happens in the next step?'
        ];
      }

      const validated: TutorResponse = {
        responseType,
        message,
        reasoning,
        nextAction,
        concept,
        difficulty,
        suggestedPrompts,
        isFallback: false,
        provider: providerName,
        model: modelName,
        timestamp: new Date().toISOString()
      };

      return {
        isValid: true,
        validatedResponse: validated
      };
    } catch (err: any) {
      return this.createFallback(
        `Exception during AI response schema validation: ${err.message}`,
        providerName,
        modelName,
        fallbackConcept
      );
    }
  }

  private static createFallback(
    errorReason: string,
    provider: string,
    model: string,
    concept: string
  ): ValidationResult {
    return {
      isValid: false,
      validationError: errorReason,
      validatedResponse: {
        responseType: 'EXPLANATION',
        message: 'The AI tutor encountered an unexpected response format. Falling back to verified rule-based guidance.',
        reasoning: 'Automatic safety fallback triggered due to output schema mismatch.',
        nextAction: 'RETRY_DECISION',
        concept,
        difficulty: 'BEGINNER',
        suggestedPrompts: ['Try asking again', 'Explain the basic invariant'],
        isFallback: true,
        provider: `${provider}-fallback`,
        model,
        timestamp: new Date().toISOString()
      }
    };
  }
}
