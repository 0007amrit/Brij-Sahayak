import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai/AIService.js';
import { z } from 'zod';

const AssistantQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  preferredLanguage: z.enum(['en', 'hi', 'hinglish']).optional()
});

export class AssistantController {
  public static async ask(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = AssistantQuerySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors[0].message
        });
      }

      const response = await aiService.ask(parseResult.data);
      res.json({
        success: true,
        data: response
      });
    } catch (err) {
      next(err);
    }
  }
}
