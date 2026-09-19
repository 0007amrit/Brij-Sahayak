import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Car,
  Bot,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Explore Temples', path: '/temples', icon: Compass },
    { name: 'Smart Parking', path: '/parking', icon: Car },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Multilingual' },
    { name: 'Yatra Planner', path: '/planner', icon: Calendar },
    { name: 'Crowd Safety', path: '/safety', icon: ShieldCheck },
    { name: 'Authority Portal', path: '/authority', icon: ShieldAlert, authority: true }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Civic Notice Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1 text-xs flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">Braj Development & Public Safety Decision Support System</span>
          <span className="hidden md:inline text-slate-400">| Mathura • Vrindavan • Govardhan • Barsana • Gokul</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="hidden sm:inline">Police: <strong className="text-white">100</strong></span>
          <span className="hidden sm:inline">Ambulance: <strong className="text-white">108</strong></span>
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">Reference Data Only</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">BrajSahayak</span>
                <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded">ब्रजसहायक</span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Smart Tourism & Crowd Safety</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? item.authority
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'bg-orange-50 text-orange-700 font-semibold'
                      : item.authority
                      ? 'text-red-600 hover:bg-red-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? (item.authority ? 'text-red-600' : 'text-orange-600') : (item.authority ? 'text-red-500' : 'text-slate-500')}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}
                  {item.authority && (
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  active
                    ? item.authority
                      ? 'bg-red-50 text-red-700'
                      : 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.authority ? 'text-red-600' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
