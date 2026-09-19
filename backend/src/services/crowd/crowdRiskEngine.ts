export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CrowdInputMetrics {
  locationId: string;
  locationName: string;
  locationType: string;
  capacity: number;
  currentCrowd: number;
  entryRate: number; // persons/min
  exitRate: number;  // persons/min
}

export interface CrowdRiskAssessment {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  occupancyRatio: number;
  netFlowRate: number; // entryRate - exitRate
  reasons: string[];
  recommendedActions: string[];
  modelNotice: string;
  isCriticalAlert: boolean;
}

export class CrowdRiskEngine {
  /**
   * Evaluates crowd telemetry using deterministic rule-based thresholds.
   * Explicitly designated as an AI-assisted early-warning & decision-support system.
   */
  public static evaluateRisk(input: CrowdInputMetrics): CrowdRiskAssessment {
    const { capacity, currentCrowd, entryRate, exitRate, locationName, locationType } = input;
    
    // 1. Basic Derived Metrics
    const occupancyRatio = capacity > 0 ? currentCrowd / capacity : 1.0;
    const netFlowRate = entryRate - exitRate; // Positive means crowd is growing
    const reasons: string[] = [];
    const recommendedActions: string[] = [];

    let rawScore = 0;

    // Density Contribution (up to 55 points)
    if (occupancyRatio >= 1.4) {
      rawScore += 55;
      reasons.push(`Extreme crowd surge: Current occupancy is ${(occupancyRatio * 100).toFixed(0)}% of safe baseline capacity (${currentCrowd}/${capacity}).`);
    } else if (occupancyRatio >= 1.1) {
      rawScore += 45;
      reasons.push(`Over-capacity condition: Density is ${(occupancyRatio * 100).toFixed(0)}% exceeding threshold design limits.`);
    } else if (occupancyRatio >= 0.85) {
      rawScore += 35;
      reasons.push(`High occupancy: Headcount at ${(occupancyRatio * 100).toFixed(0)}% of capacity, approaching safe operating limit.`);
    } else if (occupancyRatio >= 0.6) {
      rawScore += 20;
      reasons.push(`Moderate crowd volume: Steady pilgrim presence at ${(occupancyRatio * 100).toFixed(0)}% occupancy.`);
    } else {
      rawScore += 10;
      reasons.push(`Normal operating levels: Occupancy is within standard baseline (${(occupancyRatio * 100).toFixed(0)}%).`);
    }

    // Influx vs Outflow Net Accumulation (up to 35 points)
    if (netFlowRate > 100) {
      rawScore += 35;
      reasons.push(`Dangerous net inflow: Influx exceeds dispersal by +${netFlowRate} persons/min (${entryRate} in vs ${exitRate} out). Rapid accumulation underway.`);
    } else if (netFlowRate > 50) {
      rawScore += 25;
      reasons.push(`High net inflow: Persons entering at +${netFlowRate}/min faster than egress routes can clear.`);
    } else if (netFlowRate > 15) {
      rawScore += 15;
      reasons.push(`Positive net flow: Slight inward pressure (+${netFlowRate}/min).`);
    } else if (netFlowRate < -20) {
      rawScore -= 5;
      reasons.push(`Net dispersal: Crowd is actively clearing faster than entry rate (${exitRate} out vs ${entryRate} in).`);
    }

    // Narrow Bottleneck / Location-Specific Vulnerability (up to 10 points)
    if (locationType === 'TEMPLE' && occupancyRatio > 0.85) {
      rawScore += 10;
      reasons.push('Heritage corridor constraint: Kunj galiyan (narrow heritage approach lanes) create heightened friction.');
    } else if (locationType === 'RAILWAY_STATION' && occupancyRatio > 0.8) {
      rawScore += 10;
      reasons.push('Transit bottleneck constraint: Platform staircases and concourse overbridges are susceptible to sudden surge.');
    }

    const riskScore = Math.min(100, Math.max(5, rawScore));

    // Determine Risk Tier
    let riskLevel: RiskLevel = 'LOW';
    let isCriticalAlert = false;

    if (riskScore >= 75 || occupancyRatio >= 1.25 || (occupancyRatio >= 1.0 && netFlowRate > 40)) {
      riskLevel = 'CRITICAL';
      isCriticalAlert = true;
    } else if (riskScore >= 55 || occupancyRatio >= 0.85 || (occupancyRatio >= 0.7 && netFlowRate > 30)) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 35 || occupancyRatio >= 0.55) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Generate Actionable Human-in-the-Loop SOP Recommendations
    if (riskLevel === 'CRITICAL') {
      recommendedActions.push(
        'DECISION SUPPORT: Advise field officers to temporarily hold entry at outer holding perimeters.',
        'TRAFFIC ADVISORY: Signal outer checkpoints (e.g. e-rickshaw stands) to divert inbound tourist vehicles.',
        'EGRESS EXPANSION: Recommend deploying personnel to verify auxiliary emergency exit corridors are clear and unlocked.',
        'PUBLIC ADDRESS: Broadcast calm queue-management advisories requesting pilgrims to avoid rushing.',
        'HUMAN VERIFICATION: On-duty magistrates/officers must conduct visual confirmation prior to operational adjustments.'
      );
    } else if (riskLevel === 'HIGH') {
      recommendedActions.push(
        'EARLY WARNING: Alert perimeter marshals to prepare secondary queue zig-zag barricades.',
        'FLOW MONITORING: Increase frequency of entry/exit counter assessments on main thoroughfares.',
        'CLEARANCE: Ensure no temporary street vendors are obstructing pedestrian egress lanes.'
      );
    } else if (riskLevel === 'MEDIUM') {
      recommendedActions.push(
        'ROUTINE VIGILANCE: Maintain normal queue cadence and monitoring stations.',
        'HYDRATION & SIGNAGE: Ensure directional signs towards outer parking remain visible.'
      );
    } else {
      recommendedActions.push(
        'BASELINE: Conditions optimal. Standard security and crowd flow protocols apply.'
      );
    }

    return {
      riskLevel,
      riskScore,
      occupancyRatio: parseFloat(occupancyRatio.toFixed(2)),
      netFlowRate,
      reasons,
      recommendedActions,
      modelNotice: 'PROTOTYPE DECISION-SUPPORT MODEL: This system provides early-warning guidance for authorized officers. It does NOT autonomously trigger physical barriers, police deployment, or mechanical closures.',
      isCriticalAlert
    };
  }
}
