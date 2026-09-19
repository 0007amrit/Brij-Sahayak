export interface ParkingOption {
  id: string;
  templeId: string;
  name: string;
  locationDesc: string;
  vehicleTypes: string;
  isSuggested: boolean;
  capacityHint?: string;
  walkingMinutes: number;
}

export interface Temple {
  id: string; // M001 to M032
  index: number;
  name: string;
  hindiName?: string;
  area: string;
  zone: string;
  city: string;
  category: string;
  timing: string;
  route: string;
  parking: string;
  lastMile: string;
  zoneRule: string;
  nearby: string;
  helpline: string;
  disclaimer: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  parkingList?: ParkingOption[];
}

export interface CrowdRiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  occupancyRatio: number;
  netFlowRate: number;
  reasons: string[];
  recommendedActions: string[];
  modelNotice: string;
  isCriticalAlert: boolean;
}

export interface CrowdLocation {
  id: string;
  name: string;
  locationType: 'TEMPLE' | 'RAILWAY_STATION' | 'BUS_TERMINAL' | 'FESTIVAL_EVENT';
  area: string;
  capacity: number;
  currentCrowd: number;
  entryRate: number;
  exitRate: number;
  notes?: string;
  latitude: number;
  longitude: number;
  assessment: CrowdRiskAssessment;
}

export interface CrowdAlert {
  id: string;
  locationId: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  riskScore: number;
  title: string;
  reasons: string[];
  recommendedActions: string[];
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  location: CrowdLocation;
}

export interface AuthorityDashboardData {
  stats: {
    totalMonitored: number;
    normalCount: number;
    highRiskCount: number;
    criticalAlertsCount: number;
  };
  locations: CrowdLocation[];
  activeAlerts: CrowdAlert[];
  recentAlerts: CrowdAlert[];
}

export interface AIQueryResponse {
  answer: string;
  language: string;
  provider: 'mock' | 'bedrock';
  sources: string[];
  disclaimer: string;
  suggestedFollowups: string[];
}

export interface ScheduledStop {
  stopNumber: number;
  templeId: string;
  name: string;
  area: string;
  arrivalTime: string;
  departureTime: string;
  allocatedMinutes: number;
  darshanTiming: string;
  suggestedParking: string;
  lastMileGuidance: string;
  travelLegFromPrevious: {
    estimatedMinutes: number;
    distanceGuidance: string;
    notice: string;
  };
  nearbyRecommended: string;
}

export interface YatraItinerary {
  summary: {
    startLocation: string;
    startTime: string;
    endTime: string;
    totalDurationHours: number;
    stopsPlanned: number;
    feasibilityNotice: string;
  };
  stops: ScheduledStop[];
  returnGuidance: {
    suggestedDepartureTime: string;
    returnTransitTip: string;
  };
  planningDisclaimer: string;
}
