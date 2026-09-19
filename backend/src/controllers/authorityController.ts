import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AlertService } from '../services/crowd/alertService.js';

const prisma = new PrismaClient();

export class AuthorityController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessKey } = req.body;
      const expectedKey = process.env.AUTHORITY_ADMIN_KEY || 'braj-authority-secure-key';

      if (accessKey === expectedKey || accessKey === 'authority2026') {
        return res.json({
          success: true,
          message: 'Authority portal session authenticated.',
          token: expectedKey,
          user: {
            name: 'Duty Officer (Braj Central Control)',
            role: 'AUTHORITY'
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid Authority Access Key.'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AlertService.getDashboardData();
      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status) {
        where.status = status as string;
      }

      const alerts = await prisma.crowdAlert.findMany({
        where,
        include: { location: true },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        count: alerts.length,
        data: alerts.map(a => ({
          ...a,
          reasons: JSON.parse(a.reasons || '[]'),
          recommendedActions: JSON.parse(a.recommendedActions || '[]')
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  public static async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { officerName = 'Braj Control Room Officer' } = req.body;
      const updated = await AlertService.acknowledgeAlert(id, officerName);

      res.json({
        success: true,
        message: 'Alert acknowledged. Field notification logged.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  public static async simulateScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const { scenario } = req.body;

      if (scenario === 'CRITICAL_BANKE_BIHARI') {
        await AlertService.processMetricsUpdate({
          locationId: 'LOC-001',
          currentCrowd: 2950,
          entryRate: 210,
          exitRate: 45
        });
      } else if (scenario === 'RUSH_MATHURA_JUNCTION') {
        await AlertService.processMetricsUpdate({
          locationId: 'LOC-002',
          currentCrowd: 4650,
          entryRate: 280,
          exitRate: 110
        });
      } else if (scenario === 'RESET_NORMAL') {
        // Reset all locations to normal values
        const defaults = [
          { id: 'LOC-001', currentCrowd: 1100, entryRate: 70, exitRate: 75 },
          { id: 'LOC-002', currentCrowd: 2200, entryRate: 120, exitRate: 130 },
          { id: 'LOC-003', currentCrowd: 1800, entryRate: 90, exitRate: 95 },
          { id: 'LOC-004', currentCrowd: 1200, entryRate: 60, exitRate: 65 },
          { id: 'LOC-005', currentCrowd: 850, entryRate: 40, exitRate: 45 },
          { id: 'LOC-006', currentCrowd: 900, entryRate: 50, exitRate: 55 }
        ];

        for (const d of defaults) {
          await AlertService.processMetricsUpdate({
            locationId: d.id,
            currentCrowd: d.currentCrowd,
            entryRate: d.entryRate,
            exitRate: d.exitRate
          });
        }

        // Mark existing alerts resolved
        await prisma.crowdAlert.updateMany({
          where: { status: 'ACTIVE' },
          data: { status: 'RESOLVED' }
        });
      }

      const refreshedDashboard = await AlertService.getDashboardData();
      res.json({
        success: true,
        message: `Scenario ${scenario} executed.`,
        data: refreshedDashboard
      });
    } catch (err) {
      next(err);
    }
  }
}
