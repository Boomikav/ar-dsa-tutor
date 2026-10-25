import { TutorRequest, TutorResponse } from '../../src/models/ai';
import { 
  LearnerAIContext, 
  MisconceptionAnalysisResult, 
  GeneratedAssessmentQuestion, 
  LearningRecommendationResult 
} from '../../src/models/multiAgent';

/**
 * Common abstraction for backend Generative AI providers.
 * Decouples Tutor Agent and specialized agents from specific model vendors.
 */
export interface ILLMProvider {
  readonly providerName: string;
  readonly defaultModel: string;

  /**
   * Health check to determine if the provider credentials and network are usable.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Tutor Agent: Explanations, hints, analogies, Socratic prompts, and misconception remediation.
   */
  generateTutorResponse(request: TutorRequest): Promise<TutorResponse>;

  /**
   * Misconception Agent: Analyzes pattern of recurring cognitive errors.
   */
  generateMisconceptionAnalysis(context: LearnerAIContext): Promise<MisconceptionAnalysisResult>;

  /**
   * Assessment Agent: Generates adaptive diagnostic questions tailored to mastery.
   */
  generateAssessmentQuestion(context: LearnerAIContext): Promise<GeneratedAssessmentQuestion>;

  /**
   * Recommendation Agent: Formulates next educational steps based on learning evidence.
   */
  generateRecommendation(context: LearnerAIContext): Promise<LearningRecommendationResult>;
}
