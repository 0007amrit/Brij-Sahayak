import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Footprints,
  Compass,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { Temple } from '../types/index.js';

export const ParkingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTempleId, setSelectedTempleId] = useState<string>(searchParams.get('temple') || 'M010');
  const [parkingData, setParkingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemples() {
      try {
        const list = await api.getTemples();
        setTemples(list);
      } catch (err) {
        console.error('Failed to load temples:', err);
      }
    }
    loadTemples();
  }, []);

  useEffect(() => {
    async function loadParking() {
      if (!selectedTempleId) return;
      setLoading(true);
      try {
        const data = await api.getParkingByTempleId(selectedTempleId);
        setParkingData(data);
      } catch (err) {
        console.error('Failed to load parking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadParking();
  }, [selectedTempleId]);

  const handleTempleSelect = (id: string) => {
    setSelectedTempleId(id);
    setSearchParams({ temple: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
          <Car className="w-3.5 h-3.5 text-amber-600" />
          Reference Parking Directory
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart Parking Guidance
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Locate designated outer parking clusters and last-mile transit options across Braj heritage zones.
        </p>
      </div>

      {/* Prominent Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <strong className="font-bold uppercase tracking-wider text-amber-900">
            Suggested / Reference Parking Notice:
          </strong>
          <p className="leading-relaxed">
            This system displays <strong>suggested/reference parking guidance</strong>. Parking availability is <strong>not guaranteed live</strong>.
            During peak festival hours, entry to inner lanes may be barricaded by traffic police. Private four-wheelers must utilize outer bypass lots (e.g. Mandi, ITI, or Rukmini Vihar).
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Temple Selector */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Destination
          </h3>
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {temples.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTempleSelect(t.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                  selectedTempleId === t.id
                    ? 'bg-orange-50 border border-orange-200 text-orange-950 font-bold shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[200px] font-medium">{t.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.city}</div>
                </div>
                {selectedTempleId === t.id && (
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Parking Guidance & Options */}
        <div className="lg:col-span-2 space-y-6">
          {loading || !parkingData ? (
            <div className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
          ) : (
            <div className="space-y-6">
              {/* Selected Destination Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>

                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {parkingData.templeName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {parkingData.area} • Zone: {parkingData.zone}
                    </p>
                  </div>
                  <Link
                    to={`/temples/${parkingData.templeId}`}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    View Temple Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Primary Suggested Parking */}
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/80 space-y-2">
                  <div className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-orange-600" />
                    Recommended Parking Facility
                  </div>
                  <p className="text-xs text-orange-950 font-medium leading-relaxed">
                    {parkingData.suggestedParkingSummary}
                  </p>
                </div>

                {/* Last Mile Guidance */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-emerald-600" />
                    Last-Mile Connectivity Option
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {parkingData.lastMileGuidance}
                  </p>
                </div>

                {/* Zone Navigation Policy */}
                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  <strong className="text-slate-800">Zone Rule: </strong>
                  {parkingData.zoneRule}
                </div>
              </div>

              {/* Parking Spots Breakup */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-slate-600" />
                  Designated Parking Lots for this Destination
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {parkingData.parkingOptions.map((opt: any) => (
                    <div
                      key={opt.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{opt.name}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded shrink-0">
                          ~{opt.walkingMinutes} min
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {opt.locationDesc}
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                        <span>{opt.vehicleTypes}</span>
                        <span className="text-emerald-700 font-medium">Reference Facility</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
