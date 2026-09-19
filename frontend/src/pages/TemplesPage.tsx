import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Car,
  ChevronRight,
  Info,
  Building2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { Temple } from '../types/index.js';

export const TemplesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const cities = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Radha Kund', 'Barsana', 'Nandgaon', 'Gokul', 'Baldeo'];
  const categories = ['All', 'Temple', 'Sacred Water Body / Ghat', 'Ashram & Spiritual Retreat'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getTemples({
          city: selectedCity !== 'All' ? selectedCity : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchTerm ? searchTerm : undefined
        });
        setTemples(data);
      } catch (err) {
        console.error('Failed to load temples:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCity, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-800 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-orange-600" />
          Verified Braj Heritage Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Sacred Places & Temple Directory
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive database of verified sacred places in the Braj region. Includes reference darshan timings, designated outer parking nodes, and zone-specific last-mile guidelines.
        </p>
      </div>

      {/* Disclaimers Bar */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Reference Dataset Notice:</strong> Timings, parking availability, charges, and vehicle access diversions are indicative reference points. During festivals (e.g. Janmashtami, Radhashtami, Holi, Govardhan Puja), local administration institutes dynamic traffic diversions. Always verify on-ground.
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by temple name or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter by Braj Sub-Region:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Temples */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : temples.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No temples found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or city filters.</p>
          <button
            onClick={() => { setSelectedCity('All'); setSelectedCategory('All'); setSearchTerm(''); }}
            className="mt-4 text-xs font-semibold text-orange-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs text-slate-500 mb-4 font-medium">
            Showing <strong>{temples.length}</strong> sacred destinations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple) => (
              <div
                key={temple.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo & Badge */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={temple.imageUrl}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-slate-800 text-xs font-semibold px-2 py-0.5 rounded shadow">
                    {temple.city}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                      {temple.category}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5 group-hover:text-orange-600 transition-colors">
                      {temple.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{temple.area} • {temple.zone}</span>
                    </div>
                  </div>

                  {/* Highlights */}
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

                  {/* Action Buttons */}
                  <div className="pt-2 flex justify-between items-center">
                    <Link
                      to={`/temples/${temple.id}`}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      )}
    </div>
  );
};
