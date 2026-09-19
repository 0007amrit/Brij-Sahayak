import { configure } from '@vendia/serverless-express';
import app from './app.js';

// AWS Lambda Handler for Amazon API Gateway integration
export const handler = configure({ app });
