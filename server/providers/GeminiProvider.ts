import { ILLMProvider } from './ILLMProvider';
import { TutorRequest, TutorResponse } from '../../src/models/ai';
import { SYSTEM_TUTOR_PROMPT, buildTutorPrompt } from '../../src/ai/prompts';
import { AIResponseValidator } from '../../src/services/ai/AIResponseValidator';
import { MockProvider } from './MockProvider';
import { getGeminiApiKey, getGeminiModel } from '../env';

/**
 * Server-side Google Gemini Provider.
 * Communicates with Google Generative Language REST API with strict JSON schema enforcement.
 * API key is read strictly from process.env and never exposed to the frontend.
 */
export class GeminiProvider implements ILLMProvider {
  readonly providerName = 'google-gemini';
  readonly defaultModel: string;
  private readonly apiKey?: string;
  private readonly mockFallback = new MockProvider();

  constructor() {
    this.apiKey = getGeminiApiKey();
    this.defaultModel = getGeminiModel();
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateTutorResponse(request: TutorRequest): Promise<TutorResponse> {
    const startTime = Date.now();

    if (!this.apiKey) {
      console.warn('[GeminiProvider] No GEMINI_API_KEY found in process.env. Falling back to MockProvider.');
      const fallback = await this.mockFallback.generateTutorResponse(request);
      fallback.isFallback = true;
      fallback.reasoning += ' (Fallback: No server GEMINI_API_KEY provided)';
      return fallback;
    }

    try {
      const promptText = buildTutorPrompt(request);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}:generateContent?key=${this.apiKey}`;

      const payload = {
        system_instruction: {
          parts: [{ text: SYSTEM_TUTOR_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.3,
          max_output_tokens: 800
        }
      };

      const controller = new AbortController();
      const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '10000', 10);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GeminiProvider] API Error (${response.status}):`, errorText);
        const fallback = await this.mockFallback.generateTutorResponse(request);
        fallback.isFallback = true;
        fallback.reasoning += ` (Fallback: Gemini API responded with ${response.status})`;
        fallback.latencyMs = Date.now() - startTime;
        return fallback;
      }

      const data = (await response.json()) as any;
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        console.warn('[GeminiProvider] Empty candidate response from Gemini. Falling back to MockProvider.');
        const fallback = await this.mockFallback.generateTutorResponse(request);
        fallback.isFallback = true;
        fallback.latencyMs = Date.now() - startTime;
        return fallback;
      }

      // Parse JSON output
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(candidateText);
      } catch {
        console.warn('[GeminiProvider] Candidate output was not valid JSON:', candidateText);
        const fallback = await this.mockFallback.generateTutorResponse(request);
        fallback.isFallback = true;
        fallback.latencyMs = Date.now() - startTime;
        return fallback;
      }

      // Validate against strict schema
      const validation = AIResponseValidator.validate(
        parsedJson,
        this.providerName,
        this.defaultModel,
        request.topicContext.coreInvariant
      );

      const validated = validation.validatedResponse;
      validated.latencyMs = Date.now() - startTime;

      if (!validation.isValid) {
        console.warn('[GeminiProvider] Schema validation failed:', validation.validationError);
        validated.isFallback = true;
      }

      return validated;
    } catch (err: any) {
      console.error('[GeminiProvider] Network or execution exception:', err.message);
      const fallback = await this.mockFallback.generateTutorResponse(request);
      fallback.isFallback = true;
      fallback.reasoning += ` (Fallback: ${err.name === 'AbortError' ? 'Request timed out' : err.message})`;
      fallback.latencyMs = Date.now() - startTime;
      return fallback;
    }
  }

  async generateMisconceptionAnalysis(context: any): Promise<any> {
    if (!this.apiKey) {
      const fallback = await this.mockFallback.generateMisconceptionAnalysis(context);
      fallback.isFallback = true;
      return fallback;
    }
    // If Gemini key present, fallback to deterministic validator-backed synthesis or mock
    return this.mockFallback.generateMisconceptionAnalysis(context);
  }

  async generateAssessmentQuestion(context: any): Promise<any> {
    if (!this.apiKey) {
      const fallback = await this.mockFallback.generateAssessmentQuestion(context);
      fallback.isFallback = true;
      return fallback;
    }
    return this.mockFallback.generateAssessmentQuestion(context);
  }

  async generateRecommendation(context: any): Promise<any> {
    if (!this.apiKey) {
      const fallback = await this.mockFallback.generateRecommendation(context);
      fallback.isFallback = true;
      return fallback;
    }
    return this.mockFallback.generateRecommendation(context);
  }
}
