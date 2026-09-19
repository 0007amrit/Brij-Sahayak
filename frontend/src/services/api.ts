import {
  Temple,
  CrowdLocation,
  AuthorityDashboardData,
  AIQueryResponse,
  YatraItinerary
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP Error ${res.status}`);
  }
  return data.data;
}

export const api = {
  // Temples
  async getTemples(params?: { city?: string; zone?: string; category?: string; search?: string }): Promise<Temple[]> {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.zone) query.append('zone', params.zone);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    return fetchJSON<Temple[]>(`/temples?${query.toString()}`);
  },

  async getTempleById(id: string): Promise<Temple> {
    return fetchJSON<Temple>(`/temples/${id}`);
  },

  async getParkingByTempleId(templeId: string) {
    return fetchJSON<any>(`/parking/${templeId}`);
  },

  // AI Assistant
  async askAssistant(query: string, preferredLanguage?: 'en' | 'hi' | 'hinglish'): Promise<AIQueryResponse> {
    return fetchJSON<AIQueryResponse>('/assistant', {
      method: 'POST',
      body: JSON.stringify({ query, preferredLanguage })
    });
  },

  // Planner
  async planYatra(payload: {
    startLocation: string;
    startTime: string;
    durationHours: number;
    selectedTempleIds: string[];
    pace?: 'relaxed' | 'standard' | 'fast';
  }): Promise<YatraItinerary> {
    return fetchJSON<YatraItinerary>('/planner', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Safety & Crowd
  async getSafetyLocations(): Promise<CrowdLocation[]> {
    return fetchJSON<CrowdLocation[]>('/safety/locations');
  },

  async updateSafetyMetrics(payload: {
    locationId: string;
    currentCrowd: number;
    entryRate: number;
    exitRate: number;
  }) {
    return fetchJSON<any>('/safety/metrics', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Authority
  async authorityLogin(accessKey: string) {
    return fetchJSON<any>('/authority/login', {
      method: 'POST',
      body: JSON.stringify({ accessKey })
    });
  },

  async getAuthorityDashboard(): Promise<AuthorityDashboardData> {
    return fetchJSON<AuthorityDashboardData>('/authority/dashboard');
  },

  async acknowledgeAlert(alertId: string, officerName: string) {
    return fetchJSON<any>(`/authority/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ officerName })
    });
  },

  async simulateAuthorityScenario(scenario: 'CRITICAL_BANKE_BIHARI' | 'RUSH_MATHURA_JUNCTION' | 'RESET_NORMAL'): Promise<AuthorityDashboardData> {
    return fetchJSON<AuthorityDashboardData>('/authority/simulate-scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    });
  }
};
