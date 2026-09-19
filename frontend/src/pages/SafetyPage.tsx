import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Building2,
  Train,
  Bus,
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api.js';
import { CrowdLocation } from '../types/index.js';

export const SafetyPage: React.FC = () => {
  const [locations, setLocations] = useState<CrowdLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'TEMPLE' | 'RAILWAY_STATION' | 'BUS_TERMINAL'>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSafetyLocations();
        setLocations(data);
      } catch (err) {
        console.error('Failed to load safety telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const timer = setInterval(load, 5000); // 5s poll for live telemetry
    return () => clearInterval(timer);
  }, []);

  const filteredLocations = selectedFilter === 'ALL'
    ? locations
    : locations.filter(l => l.locationType === selectedFilter);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500 text-white border-red-600 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500 text-white border-orange-600';
      case 'MEDIUM':
        return 'bg-amber-400 text-slate-900 border-amber-500';
      default:
        return 'bg-emerald-500 text-white border-emerald-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Stampede Saviour™ Public Density Telemetry
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Crowd Safety & Density Monitor
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Real-time public safety telemetry tracking density ratios and influx velocity across temples, railway terminals, and festival nodes.
          </p>
        </div>

        <Link
          to="/authority"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          Authority Control Portal
        </Link>
      </div>

      {/* Model Transparency Disclaimer */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Info className="w-4 h-4" />
          PUBLIC SAFETY DECISION-SUPPORT TRANSPARENCY NOTICE
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The values displayed on this dashboard reflect prototype decision-support simulation models.
          This system provides early-warning guidance for authorized field officers. It does <strong>NOT</strong> autonomously close gates, deploy emergency units, or claim scientific certification.
        </p>
      </div>

      {/* Location Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All Monitored Locations', value: 'ALL' },
          { label: 'Temples', value: 'TEMPLE', icon: Building2 },
          { label: 'Railway Stations', value: 'RAILWAY_STATION', icon: Train },
          { label: 'Bus Terminals', value: 'BUS_TERMINAL', icon: Bus }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedFilter(tab.value as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === tab.value
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Monitored Locations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => {
            const ratio = loc.assessment?.occupancyRatio || (loc.currentCrowd / loc.capacity);
            const percent = Math.min(100, Math.round(ratio * 100));
            const netFlow = loc.entryRate - loc.exitRate;

            return (
              <div
                key={loc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      {loc.id} • {loc.locationType}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getRiskBadge(loc.assessment?.riskLevel || 'LOW')}`}>
                      {loc.assessment?.riskLevel || 'LOW'} RISK
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2">{loc.name}</h3>
                  <div className="text-xs text-slate-500">{loc.area}</div>
                </div>

                {/* Progress Bar & Occupancy */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Headcount vs Threshold:</span>
                    <strong className="text-slate-900">{loc.currentCrowd} / {loc.capacity}</strong>
                  </div>

                  {/* Meter */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ratio >= 1.1
                          ? 'bg-red-600'
                          : ratio >= 0.85
                          ? 'bg-orange-500'
                          : ratio >= 0.6
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Density Ratio: <strong>{percent}%</strong></span>
                    <span className="italic text-[10px]">Safe Limit: {loc.capacity}</span>
                  </div>
                </div>

                {/* Dynamic Flow Rates */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Entry Velocity</div>
                      <div className="font-bold text-slate-800">{loc.entryRate} /min</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Dispersal Velocity</div>
                      <div className="font-bold text-slate-800">{loc.exitRate} /min</div>
                    </div>
                  </div>
                </div>

                {/* Net accumulation indicator */}
                <div className="text-[11px] flex justify-between items-center px-1">
                  <span className="text-slate-500">Net Accumulation:</span>
                  <span className={`font-semibold ${netFlow > 30 ? 'text-red-600' : 'text-slate-700'}`}>
                    {netFlow > 0 ? `+${netFlow} persons/min` : `${netFlow} persons/min`}
                  </span>
                </div>

                {/* Reasons Preview */}
                {loc.assessment?.reasons && loc.assessment.reasons.length > 0 && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {loc.assessment.reasons[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
