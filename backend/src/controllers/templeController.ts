import { Request, Response, NextFunction } from 'express';
import { TempleService } from '../services/templeService.js';

export class TempleController {
  public static async getTemples(req: Request, res: Response, next: NextFunction) {
    try {
      const { city, zone, category, search } = req.query;
      const temples = await TempleService.getAllTemples({
        city: city as string,
        zone: zone as string,
        category: category as string,
        search: search as string
      });

      res.json({
        success: true,
        count: temples.length,
        disclaimer: 'REFERENCE DATA ONLY: Opening hours, parking options, and routes are indicative and subject to festival diversions.',
        data: temples
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getTempleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const temple = await TempleService.getTempleById(id);
      if (!temple) {
        return res.status(404).json({
          success: false,
          error: `Temple with ID ${id} not found.`
        });
      }

      res.json({
        success: true,
        data: temple
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getParkingByTempleId(req: Request, res: Response, next: NextFunction) {
    try {
      const { templeId } = req.params;
      const parking = await TempleService.getParkingForTemple(templeId);
      if (!parking) {
        return res.status(404).json({
          success: false,
          error: `No parking data found for temple ${templeId}.`
        });
      }

      res.json({
        success: true,
        data: parking
      });
    } catch (err) {
      next(err);
    }
  }
}
