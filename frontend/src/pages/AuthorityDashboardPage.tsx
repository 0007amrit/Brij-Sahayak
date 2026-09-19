import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Radio,
  CheckCircle2,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Building2,
  Train,
  Activity,
  Sliders
} from 'lucide-react';
import { api } from '../services/api.js';
import { AuthorityDashboardData, CrowdAlert } from '../types/index.js';

export const AuthorityDashboardPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for frictionless hackathon demonstration
  const [accessKeyInput, setAccessKeyInput] = useState('braj-authority-secure-key');
  const [dashboardData, setDashboardData] = useState<AuthorityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const data = await api.getAuthorityDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load authority dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (scenario: 'CRITICAL_BANKE_BIHARI' | 'RUSH_MATHURA_JUNCTION' | 'RESET_NORMAL') => {
    setSimulating(true);
    setActionFeedback(null);
    try {
      const refreshed = await api.simulateAuthorityScenario(scenario);
      setDashboardData(refreshed);
      setActionFeedback(`Scenario "${scenario}" triggered successfully! Telemetry updated.`);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      setActionFeedback(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, 'Duty Magistrate (Mathura Control)');
      fetchDashboard();
      setActionFeedback(`Alert ${alertId} acknowledged.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(`Failed to acknowledge alert: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Authority Control & Stampede Decision Room
                </h1>
                <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                District Administration & Temple Trust Command Console • Mathura-Vrindavan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Secure Session Active
            </span>
          </div>
        </div>

        {/* Action feedback message */}
        {actionFeedback && (
          <div className="bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-orange-400 hover:text-white">✕</button>
          </div>
        )}

        {/* SIMULATION TRIGGER CONTROLS FOR HACKATHON DEMO */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Live Demonstration Scenarios (Hackathon Test Harness)
            </span>
            <span className="text-[11px] text-slate-400">Simulate surge conditions in real-time</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleSimulate('CRITICAL_BANKE_BIHARI')}
              disabled={simulating}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              Simulate Banke Bihari Surge (Critical)
            </button>

            <button
              onClick={() => handleSimulate('RUSH_MATHURA_JUNCTION')}
              disabled={simulating}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-orange-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Train className="w-3.5 h-3.5" />
              Simulate Mathura Junction Arrival (High)
            </button>

            <button
              onClick={() => handleSimulate('RESET_NORMAL')}
              disabled={simulating}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Telemetry to Normal
            </button>
          </div>
        </div>

        {/* Telemetry Summary Counters */}
        {dashboardData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Monitored</div>
              <div className="text-2xl font-black text-white">{dashboardData.stats.totalMonitored}</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">Normal Flow</div>
              <div className="text-2xl font-black text-emerald-400">{dashboardData.stats.normalCount}</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-orange-400 font-semibold uppercase">High Congestion</div>
              <div className="text-2xl font-black text-orange-400">{dashboardData.stats.highRiskCount}</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-red-400 font-semibold uppercase">Critical Early Warnings</div>
              <div className="text-2xl font-black text-red-400">{dashboardData.stats.criticalAlertsCount}</div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE EMERGENCY EARLY-WARNING ALERTS */}
      {dashboardData && dashboardData.activeAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Active Priority Early-Warning Directives ({dashboardData.activeAlerts.length})
          </div>

          <div className="space-y-4">
            {dashboardData.activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-3xl p-6 border-2 border-red-500 shadow-lg shadow-red-500/5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                        {alert.riskLevel} ALERT
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{alert.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{alert.title}</h3>
                  </div>

                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ACKNOWLEDGE ALERT
                  </button>
                </div>

                {/* Reasons */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">Identified Triggers:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 bg-red-50/50 p-3 rounded-xl border border-red-100">
                    {alert.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended SOP Actions */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">
                    Recommended Human-in-the-Loop Interventions (SOP):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {alert.recommendedActions.map((action, i) => (
                      <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 flex items-start gap-2">
                        <span className="w-4 h-4 rounded bg-orange-100 text-orange-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-tight">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED MONITORED VENUES (Temples + Railway Stations + Bus Terminals) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-600" />
          Monitored Public Hubs & Telemetry Breakdown
        </h3>

        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.locations.map((loc) => {
              const assessment = loc.assessment;
              return (
                <div
                  key={loc.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {loc.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {loc.locationType} • {loc.area}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{loc.name}</h4>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                        assessment?.riskLevel === 'CRITICAL'
                          ? 'bg-red-500 text-white'
                          : assessment?.riskLevel === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : assessment?.riskLevel === 'MEDIUM'
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {assessment?.riskLevel || 'LOW'}
                    </span>
                  </div>

                  {/* Telemetry Numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Headcount</div>
                      <div className="text-sm font-bold text-slate-800">{loc.currentCrowd} / {loc.capacity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Entry / Exit</div>
                      <div className="text-sm font-bold text-slate-800">{loc.entryRate} / {loc.exitRate} m⁻¹</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Index</div>
                      <div className="text-sm font-bold text-slate-800">{assessment?.riskScore || 20}/100</div>
                    </div>
                  </div>

                  {/* Notes & Guidance */}
                  {loc.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-lg">
                      {loc.notes}
                    </p>
                  )}

                  {/* Action recommendation */}
                  {assessment?.recommendedActions && assessment.recommendedActions.length > 0 && (
                    <div className="text-xs text-slate-700 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100">
                      <strong>Directive: </strong>{assessment.recommendedActions[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALERT HISTORY LOG TABLE */}
      {dashboardData && dashboardData.recentAlerts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Historical Alert Dispatch Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actioned By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.recentAlerts.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.location?.name || log.locationId}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${log.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                        {log.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${log.status === 'ACTIVE' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{log.acknowledgedBy || 'Pending Acknowledgment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
