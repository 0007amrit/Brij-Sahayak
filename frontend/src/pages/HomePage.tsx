import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Car,
  Bot,
  Calendar,
  ShieldAlert,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Building2,
  Users
} from 'lucide-react';
import { api } from '../services/api.js';
import { Temple, CrowdLocation } from '../types/index.js';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTemples, setFeaturedTemples] = useState<Temple[]>([]);
  const [crowdSummary, setCrowdSummary] = useState<CrowdLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [templesData, safetyData] = await Promise.all([
          api.getTemples(),
          api.getSafetyLocations()
        ]);
        // Pick prominent temples for home feature
        const topIds = ['M001', 'M010', 'M011', 'M012', 'M002', 'M029'];
        const featured = templesData.filter(t => topIds.includes(t.id));
        setFeaturedTemples(featured.length ? featured : templesData.slice(0, 6));
        setCrowdSummary(safetyData.slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/temples');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold tracking-wide border border-orange-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Official Braj Region Digital Pilgrim & Safety Companion
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Smarter Pilgrimage. <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Safer Gatherings in Braj.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Unified reference guidance for <strong className="text-slate-800">sacred temples and places</strong> across Mathura, Vrindavan, Govardhan, and Barsana — powered by grounded multilingual AI and our pioneering <strong className="text-orange-700">Stampede Saviour</strong> decision-support engine.
            </p>

            {/* Central Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-6">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-orange-500/5 border border-slate-300/80 p-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search temples, areas, or darshan (e.g. Banke Bihari, Janmabhoomi, Govardhan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-slate-800 text-sm focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-orange-600/20 shrink-0"
                >
                  Explore
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <span>Quick searches:</span>
                {['Banke Bihari Temple', 'Prem Mandir', 'Dwarkadhish Temple', 'Shri Radha Rani Temple'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const cleanName = tag;
                      navigate(`/temples?search=${encodeURIComponent(cleanName)}`);
                    }}
                    className="bg-white hover:bg-orange-50 hover:text-orange-700 px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
              <Link
                to="/temples"
                className="bg-white/90 hover:bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Sacred Places</div>
                <div className="text-[11px] text-slate-500">Timings, parking & routes</div>
              </Link>

              <Link
                to="/assistant"
                className="bg-white/90 hover:bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">AI Assistant</div>
                <div className="text-[11px] text-slate-500">English, Hindi & Hinglish</div>
              </Link>

              <Link
                to="/planner"
                className="bg-white/90 hover:bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Yatra Planner</div>
                <div className="text-[11px] text-slate-500">Time-budgeted sequence</div>
              </Link>

              <Link
                to="/safety"
                className="bg-white/90 hover:bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Crowd Safety</div>
                <div className="text-[11px] text-slate-500">Stampede Saviour metrics</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CROWD SAFETY TICKER / BANNER (Differentiating feature highlight) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Flagship Innovation: Stampede Saviour
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                AI-Assisted Crowd-Density & Stampede Prevention Early-Warning System
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Monitoring high-density pilgrim corridors across temples, railway junctions (Mathura Junction), and interstate bus stands using deterministic density-flow mathematical modeling.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/safety"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-semibold text-center transition-colors border border-white/10"
              >
                Public Density View
              </Link>
              <Link
                to="/authority"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
              >
                <Shield className="w-4 h-4" />
                Authority Decision Portal
              </Link>
            </div>
          </div>

          {/* Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
            {crowdSummary.map((item) => (
              <div key={item.id} className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white truncate max-w-[160px]">{item.name}</div>
                  <div className="text-[11px] text-slate-400">{item.area} • {item.currentCrowd} / {item.capacity} capacity</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.assessment?.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/30 text-red-300 border border-red-500/40 animate-pulse'
                      : item.assessment?.riskLevel === 'HIGH'
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-500/40'
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {item.assessment?.riskLevel || 'NORMAL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">Reference Directory</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Verified Sacred Destinations</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Verified timings, zone rules, and last-mile connectivity across the Braj region.</p>
          </div>
          <Link
            to="/temples"
            className="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center gap-1 group"
          >
            Explore Destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemples.map((temple) => (
              <div
                key={temple.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={temple.imageUrl}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-2 py-0.5 rounded shadow">
                    {temple.city}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                      {temple.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{temple.area} ({temple.zone})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{temple.timing}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Car className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-[11px]">{temple.parking}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <Link
                      to={`/temples/${temple.id}`}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      Full Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/parking?temple=${temple.id}`}
                      className="text-xs bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 px-2.5 py-1 rounded-md font-medium transition-colors"
                    >
                      Parking Guide
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI ASSISTANT PROMPT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl p-6 sm:p-10 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Bot className="w-3.5 h-3.5 text-amber-600" />
              Grounded AI Braj Assistant
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Ask in English, Hindi, or Hinglish
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trained exclusively on verified Braj data. Ask about parking in narrow Old Vrindavan lanes, routes between Banke Bihari and Prem Mandir, or temple darshan hours without hallucination.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                "Where can I park near Banke Bihari?"
              </span>
              <span className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                "Banke Bihari se Prem Mandir kaise jaaye?"
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 transition-all hover:scale-105"
            >
              <Bot className="w-5 h-5" />
              Chat With Braj Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* CIVIC & PUBLIC SAFETY ETHICS NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Transparency & Prototype Notice</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              BrajSahayak is a prototype technology demonstrator built for AWS Hackathons. All temple timings, route guidance, and parking spots are static reference entries.
              The crowd safety engine provides AI-assisted decision support and early warnings to assist authorized human officials. It does not replace on-ground police command or autonomously control physical infrastructure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
