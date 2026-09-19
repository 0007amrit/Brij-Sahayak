import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Footprints,
  Info,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api.js';
import { Temple, YatraItinerary } from '../types/index.js';

export const PlannerPage: React.FC = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [startLocation, setStartLocation] = useState('Mathura Junction');
  const [startTime, setStartTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState(5);
  const [selectedTempleIds, setSelectedTempleIds] = useState<string[]>(['M010', 'M011']); // Default Banke Bihari & Prem Mandir
  const [pace, setPace] = useState<'relaxed' | 'standard' | 'fast'>('standard');
  const [itinerary, setItinerary] = useState<YatraItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getTemples();
        setTemples(list);
      } catch (err) {
        console.error('Failed to load temples list:', err);
      }
    }
    load();
  }, []);

  const toggleTemple = (id: string) => {
    setSelectedTempleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGeneratePlan = async () => {
    if (selectedTempleIds.length === 0) {
      setError('Please select at least one temple to build your itinerary.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const plan = await api.planYatra({
        startLocation,
        startTime,
        durationHours: Number(durationHours),
        selectedTempleIds,
        pace
      });
      setItinerary(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate initial plan
  useEffect(() => {
    if (selectedTempleIds.length > 0) {
      handleGeneratePlan();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          Time-Budgeted Itinerary Generator
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Braj Yatra Itinerary Planner
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Plan a practical, sequence-optimized pilgrimage timeline based on temple opening hours and geographic clustering.
        </p>
      </div>

      {/* Planning Notice Banner */}
      <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 space-y-1">
          <strong className="font-bold">Heuristic Model Notice:</strong>
          <p className="leading-relaxed">
            This planner uses <strong>reference opening hours</strong> and estimated dwell/transfer times. It does not claim real-time GPS traffic telemetry. Always maintain buffer time for unexpected festival aarti crowds.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Generated Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Yatra Parameters
          </h3>

          {/* Start Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Starting Location</label>
            <select
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500"
            >
              <option value="Mathura Junction">Mathura Junction Railway Station</option>
              <option value="Vrindavan">Vrindavan Town Entry</option>
              <option value="ISBT Bus Stand Mathura">ISBT Bus Stand Mathura</option>
              <option value="Govardhan">Govardhan Town</option>
              <option value="Chhatikara Road">Chhatikara Road Bypass</option>
            </select>
          </div>

          {/* Start Time & Available Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Available Time</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-orange-500"
              >
                <option value={3}>3 Hours (Express)</option>
                <option value={5}>5 Hours (Standard)</option>
                <option value={8}>8 Hours (Full Day)</option>
                <option value={12}>12 Hours (Comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Pace */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Pilgrimage Pace</label>
            <div className="grid grid-cols-3 gap-2">
              {(['fast', 'standard', 'relaxed'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-medium capitalize transition-all ${
                    pace === p
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Select Temples Multi-check */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">
                Select Temples ({selectedTempleIds.length} chosen)
              </label>
              <button
                type="button"
                onClick={() => setSelectedTempleIds(['M001', 'M010', 'M011', 'M012'])}
                className="text-[11px] text-orange-600 hover:underline"
              >
                Sample 4
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {temples.map((t) => {
                const isChecked = selectedTempleIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTemple(t.id)}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-orange-50 text-orange-900 font-semibold border border-orange-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
          >
            {loading ? 'Sequencing Itinerary...' : 'Generate Itinerary'}
          </button>
        </div>

        {/* Right Column: Generated Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {!itinerary ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Configure your parameters and click "Generate Itinerary".</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Planned Yatra Timeline ({itinerary.summary.startTime} – {itinerary.summary.endTime})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Departing from <strong>{itinerary.summary.startLocation}</strong> • Total Budget: <strong>{itinerary.summary.totalDurationHours} Hours</strong>
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                    {itinerary.summary.stopsPlanned} Stops Accommodated
                  </span>
                </div>

                {itinerary.summary.feasibilityNotice && (
                  <div className="text-xs bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-100">
                    {itinerary.summary.feasibilityNotice}
                  </div>
                )}
              </div>

              {/* Vertical Chronological Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
                {itinerary.stops.map((stop, index) => (
                  <div key={stop.templeId} className="relative pl-14 space-y-3">
                    {/* Circle Stop Number Icon */}
                    <div className="absolute left-2.5 top-2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-orange-500/20 z-10">
                      {stop.stopNumber}
                    </div>

                    {/* Transit Leg Box */}
                    <div className="text-[11px] text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-slate-400" />
                      <span>{stop.travelLegFromPrevious.distanceGuidance} (~{stop.travelLegFromPrevious.estimatedMinutes} min transit)</span>
                    </div>

                    {/* Stop Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>

                          <h3 className="font-bold text-base text-slate-900 mt-1">
                            {stop.name}
                          </h3>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {stop.area}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-orange-600">
                            {stop.arrivalTime} – {stop.departureTime}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {stop.allocatedMinutes} min allocated
                          </div>
                        </div>
                      </div>

                      {/* Timings and Parking */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" /> Reference Darshan Hours:
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5">{stop.darshanTiming}</div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <Car className="w-3 h-3 text-amber-500" /> Suggested Parking:
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5 truncate">{stop.suggestedParking}</div>
                        </div>
                      </div>

                      {/* Last Mile Guidance */}
                      <div className="text-[11px] text-slate-600 flex items-start gap-1.5 bg-orange-50/40 p-2 rounded-lg">
                        <Footprints className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span><strong>Last-Mile:</strong> {stop.lastMileGuidance}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Return Guidance Node */}
                <div className="relative pl-14 pt-2">
                  <div className="absolute left-2.5 top-4 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center z-10">
                    ✓
                  </div>
                  <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-amber-400">
                      Return & Departure Advisory ({itinerary.returnGuidance.suggestedDepartureTime})
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {itinerary.returnGuidance.returnTransitTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
