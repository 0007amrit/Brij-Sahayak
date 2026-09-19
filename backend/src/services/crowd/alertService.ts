import { PrismaClient } from '@prisma/client';
import { CrowdRiskEngine, CrowdRiskAssessment } from './crowdRiskEngine.js';

const prisma = new PrismaClient();

export class AlertService {
  /**
   * Evaluates location metrics and updates telemetry and alerts.
   */
  public static async processMetricsUpdate(data: {
    locationId: string;
    currentCrowd: number;
    entryRate: number;
    exitRate: number;
  }) {
    const loc = await prisma.crowdLocation.findUnique({
      where: { id: data.locationId }
    });

    if (!loc) {
      throw new Error(`Crowd monitoring location ${data.locationId} not found.`);
    }

    // Evaluate risk
    const assessment: CrowdRiskAssessment = CrowdRiskEngine.evaluateRisk({
      locationId: loc.id,
      locationName: loc.name,
      locationType: loc.locationType,
      capacity: loc.capacity,
      currentCrowd: data.currentCrowd,
      entryRate: data.entryRate,
      exitRate: data.exitRate
    });

    // Update location
    await prisma.crowdLocation.update({
      where: { id: loc.id },
      data: {
        currentCrowd: data.currentCrowd,
        entryRate: data.entryRate,
        exitRate: data.exitRate
      }
    });

    // Record metric snapshot
    const metric = await prisma.crowdMetric.create({
      data: {
        locationId: loc.id,
        crowdCount: data.currentCrowd,
        capacity: loc.capacity,
        entryRate: data.entryRate,
        exitRate: data.exitRate,
        occupancyRatio: assessment.occupancyRatio,
        riskLevel: assessment.riskLevel,
        riskScore: assessment.riskScore
      }
    });

    // If CRITICAL or HIGH, manage alert
    let createdAlert = null;
    if (assessment.riskLevel === 'CRITICAL' || assessment.riskLevel === 'HIGH') {
      // Check if there is already an active alert for this location
      const existingAlert = await prisma.crowdAlert.findFirst({
        where: {
          locationId: loc.id,
          status: 'ACTIVE'
        }
      });

      if (!existingAlert) {
        createdAlert = await prisma.crowdAlert.create({
          data: {
            locationId: loc.id,
            riskLevel: assessment.riskLevel,
            riskScore: assessment.riskScore,
            title: `${assessment.riskLevel} CROWD ADVISORY: ${loc.name}`,
            reasons: JSON.stringify(assessment.reasons),
            recommendedActions: JSON.stringify(assessment.recommendedActions),
            status: 'ACTIVE'
          }
        });
      } else if (existingAlert.riskLevel !== assessment.riskLevel) {
        // Upgrade or update existing alert
        createdAlert = await prisma.crowdAlert.update({
          where: { id: existingAlert.id },
          data: {
            riskLevel: assessment.riskLevel,
            riskScore: assessment.riskScore,
            title: `${assessment.riskLevel} CROWD ADVISORY: ${loc.name}`,
            reasons: JSON.stringify(assessment.reasons),
            recommendedActions: JSON.stringify(assessment.recommendedActions)
          }
        });
      }
    }

    return {
      location: loc,
      assessment,
      metric,
      alert: createdAlert
    };
  }

  public static async getDashboardData() {
    const locations = await prisma.crowdLocation.findMany({
      include: {
        alerts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        },
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const activeAlerts = await prisma.crowdAlert.findMany({
      where: { status: 'ACTIVE' },
      include: { location: true },
      orderBy: { createdAt: 'desc' }
    });

    const recentAlerts = await prisma.crowdAlert.findMany({
      take: 15,
      include: { location: true },
      orderBy: { createdAt: 'desc' }
    });

    // Compute status stats
    let normalCount = 0;
    let highRiskCount = 0;
    let criticalCount = 0;

    const formattedLocations = locations.map(l => {
      const assessment = CrowdRiskEngine.evaluateRisk({
        locationId: l.id,
        locationName: l.name,
        locationType: l.locationType,
        capacity: l.capacity,
        currentCrowd: l.currentCrowd,
        entryRate: l.entryRate,
        exitRate: l.exitRate
      });

      if (assessment.riskLevel === 'CRITICAL') criticalCount++;
      else if (assessment.riskLevel === 'HIGH') highRiskCount++;
      else normalCount++;

      return {
        ...l,
        assessment
      };
    });

    return {
      stats: {
        totalMonitored: locations.length,
        normalCount,
        highRiskCount,
        criticalAlertsCount: criticalCount
      },
      locations: formattedLocations,
      activeAlerts: activeAlerts.map(a => ({
        ...a,
        reasons: JSON.parse(a.reasons || '[]'),
        recommendedActions: JSON.parse(a.recommendedActions || '[]')
      })),
      recentAlerts: recentAlerts.map(a => ({
        ...a,
        reasons: JSON.parse(a.reasons || '[]'),
        recommendedActions: JSON.parse(a.recommendedActions || '[]')
      }))
    };
  }

  public static async acknowledgeAlert(alertId: string, acknowledgedBy: string = 'Authorized Duty Officer') {
    return prisma.crowdAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });
  }
}
