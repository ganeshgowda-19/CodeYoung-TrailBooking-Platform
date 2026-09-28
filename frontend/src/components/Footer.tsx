import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Globe,
  Sparkles,
  ArrowUpRight,
  Lock,
  Server,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 text-sm shadow-2xl relative overflow-hidden">
      {/* Top Subtle Colorful Gradient Border Line */}
      <div className="h-1 bg-gradient-to-r from-coral-500 via-amber-500 via-emerald-500 to-indigo-600" />

      {/* Decorative Subtle Background Radial Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-coral-600/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Identity & Live Status (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral-500 via-amber-500 to-indigo-600 p-0.5 shadow-lg transition-transform group-hover:scale-105 overflow-hidden">
                <img src="/logo.jpeg" alt="CodeYoung Logo" className="w-full h-full object-cover rounded-[14px]" />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight">CodeYoung</span>
                <span className="text-[10px] font-extrabold text-slate-400 ml-2 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 uppercase tracking-widest">
                  Enterprise 1:1 SaaS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Production-grade 1:1 live trial booking engine for EdTech platforms. Engineered with dynamic timezone auto-conversion, DST matching, and strict fair mentor allocation.
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-tight">
                All Systems Operational <span className="text-slate-500">•</span> 20 Daily Booking Capacity
              </span>
            </div>
          </div>

          {/* Col 3: Key Features */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Key Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Multi-Timezone & DST Engine</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <Users className="w-3.5 h-3.5 text-coral-400 shrink-0" />
                <span>Fair Mentor Allocation</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Concurrency Safe Booking</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Real-Time Pacing Sync</span>
              </li>
            </ul>
          </div>

          {/* Col 4: System Portals */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-coral-400" /> System Portals
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/book" className="hover:text-coral-400 transition-colors flex items-center justify-between group">
                  <span>Parent Booking Flow</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-coral-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/mentor" className="hover:text-emerald-400 transition-colors flex items-center justify-between group">
                  <span>Mentor Dashboard</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors flex items-center justify-between group">
                  <span>Admin Stats Dashboard</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors flex items-center justify-between group">
                  <span>Log In / Sign Up</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Business Rules & Architecture */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Business Rules
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-[11px] text-slate-400 leading-relaxed font-medium">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>10 Active Global Mentors (US, UK, India, SG, EU, AU)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Max 2 demo classes / day per mentor</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Total system daily capacity: 20 bookings</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Canonical UTC storage with Luxon IANA formatting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Security Badges & Copyright */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Trial Appointment Booking System • ISO 27001 Compliant UTC Architecture</span>
          </div>

          <div className="flex items-center gap-6">
            <p>© {new Date().getFullYear()} CodeYoung Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
