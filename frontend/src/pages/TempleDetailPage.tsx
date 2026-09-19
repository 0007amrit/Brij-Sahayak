import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Car,
  Navigation,
  Utensils,
  ShoppingBag,
  Hotel,
  PhoneCall,
  Info,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Share2
} from 'lucide-react';
import { api } from '../services/api.js';
import { Temple } from '../types/index.js';

export const TempleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getTempleById(id);
        setTemple(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load temple details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-80 bg-slate-200 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  if (error || !temple) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Temple Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || `Could not find record for ID ${id}`}</p>
        <Link
          to="/temples"
          className="mt-6 inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={temple.imageUrl}
            alt={temple.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Badges on hero */}
          <div className="absolute top-4 left-4 flex gap-2">

            <span className="bg-orange-600/90 text-white text-xs font-semibold px-3 py-1 rounded-md">
              {temple.city}
            </span>
            <span className="bg-white/20 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-md">
              {temple.category}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {temple.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-400" />
                {temple.area} • Zone: {temple.zone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" />
                {temple.timing}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/parking?temple=${temple.id}`}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-700 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              <Car className="w-3.5 h-3.5 text-orange-600" />
              View Suggested Parking
            </Link>
            <Link
              to={`/planner`}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Add to Yatra Plan
            </Link>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            Verified Reference Record
          </div>
        </div>
      </div>

      {/* Warning / Verification Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <strong className="font-bold">Official Verification Disclaimer:</strong>
          <p className="leading-relaxed">{temple.disclaimer}</p>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route & Access */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Navigation className="w-4 h-4 text-orange-600" />
            Route & Travel Access
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {temple.route}
          </p>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-700 mb-1">Last-Mile Option:</div>
            <div className="text-xs text-slate-600 bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/60">
              {temple.lastMile}
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-700 mb-1">Zone Navigation Rule:</div>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {temple.zoneRule}
            </div>
          </div>
        </div>

        {/* Parking Guidance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Car className="w-4 h-4 text-amber-600" />
            Suggested Reference Parking
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {temple.parking}
          </p>

          {temple.parkingList && temple.parkingList.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-700">Designated Reference Nodes:</div>
              {temple.parkingList.map((p) => (
                <div key={p.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.vehicleTypes}</div>
                  </div>
                  <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                    ~{p.walkingMinutes} min walk
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Amenities (Food, Shopping, Stays) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Utensils className="w-4 h-4 text-orange-600" />
            Nearby Food, Shopping & Stays
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {temple.nearby}
          </p>
          <div className="text-[11px] text-slate-400 italic">
            Note: Store hours and prasad distribution vary with temple aartis.
          </div>
        </div>

        {/* Helplines & Safety */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <PhoneCall className="w-4 h-4 text-red-600" />
            Emergency Contacts & Helplines
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-red-900 font-medium">
              {temple.helpline}
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-[11px]">
              Mathura Police Control Room: <strong>112 / 100</strong> <br />
              Medical Emergency: <strong>108</strong> <br />
              Municipal Corporation (Nagar Nigam): <strong>1533</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
