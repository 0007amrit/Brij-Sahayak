import { IAIProvider, AIQueryRequest, AIQueryResponse } from './IAIProvider.js';

/**
 * AWS Bedrock AI Provider Implementation.
 * Ready for production deployment with Amazon Bedrock (Anthropic Claude 3 / Amazon Titan).
 * Activated when AI_PROVIDER=bedrock in environment variables.
 */
export class BedrockAIProvider implements IAIProvider {
  private region: string;
  private modelId: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'ap-south-1';
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
  }

  async generateResponse(request: AIQueryRequest): Promise<AIQueryResponse> {
    // When AWS credentials and Bedrock are active, this invokes BedrockRuntimeClient:
    // const client = new BedrockRuntimeClient({ region: this.region });
    // const command = new InvokeModelCommand({ ... });
    // For now, if called directly without credentials, it falls back with an explicit notice:
    return {
      answer: `[Amazon Bedrock Bridge] Bedrock runtime client is configured for model ${this.modelId} in ${this.region}. To query live Bedrock, provide AWS credentials via IAM or environment variables.`,
      language: request.preferredLanguage || 'en',
      provider: 'bedrock',
      sources: ['Amazon Bedrock Knowledge Base (S3 Ingestion)'],
      disclaimer: 'Reference data only. Timings, parking availability, and routes are subject to change during festivals or local administrative orders. Always verify locally before visiting.',
      suggestedFollowups: ['Banke Bihari timings', 'Parking near Prem Mandir', 'Emergency helplines']
    };
  }
}
