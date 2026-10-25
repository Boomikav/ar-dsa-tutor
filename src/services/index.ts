import { SecureAIService } from './ai/SecureAIService';
import { IARService } from './ar/IARService';
import { WebXRARService } from './ar/WebXRARService';
import { LocalLearnerService } from './learner/LocalLearnerService';
import { InMemoryKnowledgeGraphService } from './knowledgeGraph/InMemoryKnowledgeGraphService';
import { LocalAnalyticsService } from './analytics/LocalAnalyticsService';
import { RuleBasedRecommendationService } from './recommendation/RuleBasedRecommendationService';
import { AIOrchestrator } from './ai/orchestrator/AIOrchestrator';

export * from './ai/IAIService';
export * from './ai/SecureAIService';
export * from './ai/MockAIService';
export * from './ai/LearnerContextBuilder';
export * from './ai/LearnerAIContextBuilder';
export * from './ai/AIResponseValidator';
export * from './ai/orchestrator/AIOrchestrator';
export * from './ai/agents/TutorAgent';
export * from './ai/agents/MisconceptionAgent';
export * from './ai/agents/AssessmentAgent';
export * from './ai/agents/RecommendationAgent';

export * from './ar/IARService';
export * from './ar/WebXRARService';
export * from './ar/MockARService';
export * from './ar/ThreeBSTVisualizer';

export * from './learner/ILearnerService';
export * from './learner/LocalLearnerService';

export * from './knowledgeGraph/IKnowledgeGraphService';
export * from './knowledgeGraph/InMemoryKnowledgeGraphService';

export * from './analytics/IAnalyticsService';
export * from './analytics/LocalAnalyticsService';

export * from './recommendation/IRecommendationService';
export * from './recommendation/RuleBasedRecommendationService';

/**
 * Global Service Registry for Dependency Injection.
 * Enables zero-effort substitution of mock providers with production backends.
 */
export interface ServiceContainer {
  aiService: SecureAIService;
  orchestrator: AIOrchestrator;
  arService: IARService;
  learnerService: LocalLearnerService;
  knowledgeGraphService: InMemoryKnowledgeGraphService;
  analyticsService: LocalAnalyticsService;
  recommendationService: RuleBasedRecommendationService;
}

const localAnalytics = new LocalAnalyticsService();
const secureAI = new SecureAIService(localAnalytics);

export const services: ServiceContainer = {
  aiService: secureAI,
  orchestrator: new AIOrchestrator(secureAI, localAnalytics),
  arService: new WebXRARService(),
  learnerService: new LocalLearnerService(),
  knowledgeGraphService: new InMemoryKnowledgeGraphService(),
  analyticsService: localAnalytics,
  recommendationService: new RuleBasedRecommendationService()
};
