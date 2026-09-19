import { Request, Response, NextFunction } from 'express';
import { YatraPlannerService } from '../services/planner/yatraPlannerService.js';
import { z } from 'zod';

const PlannerInputSchema = z.object({
  startLocation: z.string().default('Mathura Junction'),
  startTime: z.string().default('09:00'),
  durationHours: z.number().min(1).max(24).default(5),
  selectedTempleIds: z.array(z.string()).min(1, 'Please select at least one temple'),
  pace: z.enum(['relaxed', 'standard', 'fast']).default('standard')
});

export class PlannerController {
  public static async plan(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = PlannerInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors[0].message
        });
      }

      const itinerary = await YatraPlannerService.planYatra(parseResult.data);
      res.json({
        success: true,
        data: itinerary
      });
    } catch (err) {
      next(err);
    }
  }
}
