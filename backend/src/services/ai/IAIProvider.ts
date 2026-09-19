export interface AIQueryRequest {
  query: string;
  context?: string;
  preferredLanguage?: 'en' | 'hi' | 'hinglish';
}

export interface AIQueryResponse {
  answer: string;
  language: string;
  provider: 'mock' | 'bedrock';
  sources: string[];
  disclaimer: string;
  suggestedFollowups: string[];
}

export interface IAIProvider {
  generateResponse(request: AIQueryRequest): Promise<AIQueryResponse>;
}
