import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TempleService {
  public static async getAllTemples(filters: {
    city?: string;
    zone?: string;
    category?: string;
    search?: string;
  }) {
    const { city, zone, category, search } = filters;

    const where: any = {};

    if (city && city !== 'All') {
      where.city = city;
    }
    if (zone && zone !== 'All') {
      where.zone = zone;
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { area: { contains: q } },
        { id: { contains: q } },
        { zone: { contains: q } },
        { nearby: { contains: q } }
      ];
    }

    return prisma.temple.findMany({
      where,
      orderBy: { index: 'asc' },
      include: {
        parkingList: true
      }
    });
  }

  public static async getTempleById(id: string) {
    return prisma.temple.findUnique({
      where: { id: id.toUpperCase() },
      include: {
        parkingList: true
      }
    });
  }

  public static async getParkingForTemple(templeId: string) {
    const temple = await prisma.temple.findUnique({
      where: { id: templeId.toUpperCase() },
      include: {
        parkingList: true
      }
    });

    if (!temple) return null;

    return {
      templeId: temple.id,
      templeName: temple.name,
      area: temple.area,
      zone: temple.zone,
      zoneRule: temple.zoneRule,
      suggestedParkingSummary: temple.parking,
      lastMileGuidance: temple.lastMile,
      disclaimer: 'SUGGESTED PARKING NOTICE: Parking is reference information. Availability is not guaranteed and vehicle access depends on traffic police diversions during festival periods.',
      parkingOptions: temple.parkingList
    };
  }
}
