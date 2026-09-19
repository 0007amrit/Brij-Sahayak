import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AlertService } from '../services/crowd/alertService.js';
import { CrowdRiskEngine } from '../services/crowd/crowdRiskEngine.js';
import { z } from 'zod';

const prisma = new PrismaClient();

const MetricsUpdateSchema = z.object({
  locationId: z.string(),
  currentCrowd: z.number().nonnegative(),
  entryRate: z.number().nonnegative(),
  exitRate: z.number().nonnegative()
});

export class SafetyController {
  public static async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await prisma.crowdLocation.findMany({
        orderBy: { id: 'asc' }
      });

      const evaluated = locations.map(l => {
        const assessment = CrowdRiskEngine.evaluateRisk({
          locationId: l.id,
          locationName: l.name,
          locationType: l.locationType,
          capacity: l.capacity,
          currentCrowd: l.currentCrowd,
          entryRate: l.entryRate,
          exitRate: l.exitRate
        });

        return {
          ...l,
          assessment
        };
      });

      res.json({
        success: true,
        count: evaluated.length,
        disclaimer: 'PROTOTYPE TELEMETRY: Values shown are simulated/reference figures for early warning decision support.',
        data: evaluated
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const location = await prisma.crowdLocation.findUnique({
        where: { id },
        include: {
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 20
          },
          alerts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          error: `Location ${id} not found.`
        });
      }

      const assessment = CrowdRiskEngine.evaluateRisk({
        locationId: location.id,
        locationName: location.name,
        locationType: location.locationType,
        capacity: location.capacity,
        currentCrowd: location.currentCrowd,
        entryRate: location.entryRate,
        exitRate: location.exitRate
      });

      res.json({
        success: true,
        data: {
          ...location,
          assessment
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = MetricsUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors[0].message
        });
      }

      const result = await AlertService.processMetricsUpdate(parseResult.data);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}
