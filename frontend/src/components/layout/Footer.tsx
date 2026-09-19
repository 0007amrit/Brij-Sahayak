import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Info, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                ॐ
              </span>
              <span>BrajSahayak</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated Smart Tourism and Public Safety Decision-Support platform for Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul, and Baldeo.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] bg-slate-800 text-amber-300 px-2.5 py-1 rounded border border-slate-700 font-medium">
                AWS Hackathon Showcase Edition
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/temples" className="hover:text-amber-400 transition-colors">Explore Sacred Places</Link></li>
              <li><Link to="/parking" className="hover:text-amber-400 transition-colors">Smart Parking Guidance</Link></li>
              <li><Link to="/assistant" className="hover:text-amber-400 transition-colors">Multilingual AI Assistant</Link></li>
              <li><Link to="/planner" className="hover:text-amber-400 transition-colors">Braj Yatra Itinerary Planner</Link></li>
              <li><Link to="/safety" className="hover:text-amber-400 transition-colors">Stampede Saviour Safety Engine</Link></li>
              <li><Link to="/authority" className="text-red-400 hover:text-red-300 font-medium transition-colors">Authority Control Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Helplines */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Emergency Helplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Police Helpline:</span>
                <strong className="text-white">100 / 112</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Medical Ambulance:</span>
                <strong className="text-white">102 / 108</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Nagar Nigam Mathura:</span>
                <strong className="text-white">1533</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Railway Inquiries:</span>
                <strong className="text-white">139</strong>
              </li>
            </ul>
          </div>

          {/* Column 4: Disclaimers & Ethics */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Reference Data Notice
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/60 p-2.5 rounded border border-slate-800">
              Timings, parking locations, routes, and capacities in this application are strictly reference data. They are not guaranteed real-time sensor streams.
              The crowd safety engine is an AI-assisted early warning advisory system and does not autonomously operate gates or physical infrastructure.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 BrajSahayak. Designed with cloud-readiness for AWS Bedrock & RDS.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with dedication for pilgrims & public safety in Braj.
          </p>
        </div>
      </div>
    </footer>
  );
};
