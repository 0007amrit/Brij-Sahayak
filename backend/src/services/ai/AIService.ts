import { IAIProvider, AIQueryRequest, AIQueryResponse } from './IAIProvider.js';
import { GroundedKnowledgeAIProvider } from './GroundedKnowledgeAIProvider.js';

export class AIService {
  private provider: IAIProvider;

  constructor() {
    console.log('[AIService] Initializing Self-Contained Grounded Knowledge AI Engine (AWS Bedrock Independent)');
    this.provider = new GroundedKnowledgeAIProvider();
  }

  async ask(request: AIQueryRequest): Promise<AIQueryResponse> {
    return this.provider.generateResponse(request);
  }
}

export const aiService = new AIService();
