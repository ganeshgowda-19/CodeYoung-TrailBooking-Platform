import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Bell,
  Sparkles,
  BookOpen,
  Star,
  LogIn,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DevNotificationDrawer } from './DevNotificationDrawer';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-close menu when tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const navigateToSection = (sectionId: string) => {
    setIsMenuOpen(false);

    const performScroll = (): boolean => {
      if (sectionId === 'overview' || sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (document.documentElement) {
          document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const overviewEl = document.getElementById('overview');
        if (overviewEl) {
          overviewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return true;
      }

      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (location.pathname !== '/') {
      navigate('/');
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if (performScroll() || attempts >= 30) {
          clearInterval(timer);
        }
      }, 50);
    } else {
      performScroll();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 backdrop-blur-xl shadow-2xl">
        {/* Colorful Rainbow Top Accent Border */}
        <div className="h-1 bg-gradient-to-r from-coral-500 via-amber-500 via-emerald-500 to-indigo-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo (Left Side) */}
          <Link to="/" onClick={() => navigateToSection('overview')} className="flex items-center gap-2.5 group shrink-0 mr-2 sm:mr-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral-500 via-amber-500 to-indigo-500 p-0.5 shadow-lg transition-transform group-hover:scale-105 overflow-hidden ring-2 ring-white/10">
              <img src="/logo.jpeg" alt="CodeYoung Logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl text-white tracking-tight drop-shadow-md">CodeYoung</span>
              </div>
              <p className="text-[10px] text-slate-300 hidden sm:flex items-center gap-1 font-semibold">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9/5 Rated by 20k+ Parents
              </p>
            </div>
          </Link>

          {/* Center Inline Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-extrabold text-slate-200">
            <button
              type="button"
              onClick={() => navigateToSection('overview')}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('tracks')}
              className="px-3 py-1.5 rounded-xl hover:bg-coral-500/20 hover:text-coral-300 transition-all"
            >
              Curriculum Tracks
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('why-us')}
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
            >
              Why 1:1 Wins
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('mentors')}
              className="px-3 py-1.5 rounded-xl hover:bg-amber-500/20 hover:text-amber-300 transition-all"
            >
              Mentors
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('reviews')}
              className="px-3 py-1.5 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all"
            >
              Reviews
            </button>
          </nav>

          {/* Right Action Items Row & 3-Line Menu Bar Button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
            {/* Dev Simulated Notifications Bell */}
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-amber-300 transition-all shadow-md"
              title="View Simulated Email Logs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral-500 rounded-full" />
            </button>

            {/* Logged in User Profile + Logout OR Log In Button */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-500 rounded-xl shadow-xs transition-all duration-300 group active:scale-95 shrink-0"
                title={`Logged in as ${user.email} (${user.role}). Click to Log Out.`}
              >
                <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-lg bg-rose-200 group-hover:bg-white/20 text-rose-700 group-hover:text-white flex items-center justify-center transition-all group-hover:scale-110">
                  <LogOut className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                </div>
                <span className="tracking-tight">Log Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black text-indigo-950 hover:text-white bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 border border-indigo-200/90 hover:border-indigo-500 rounded-xl shadow-xs hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 group relative overflow-hidden active:scale-95 shrink-0"
                title="Access Parent, Mentor & Admin Portals"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-lg bg-indigo-200/80 group-hover:bg-white/20 text-indigo-700 group-hover:text-white flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <LogIn className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="tracking-tight">Log In</span>
                
                <span className="relative flex h-2 w-2 ml-0.5 hidden xs:flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </Link>
            )}

            {/* Logged in User Profile + Logout OR Log In Button */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-xs select-none ${
                  isMenuOpen
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                }`}
                title="Toggle Navigation Menu"
              >
                {isMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-5 h-5 text-slate-900" />}
                <span className="font-extrabold hidden xs:inline-block">Menu</span>
                {isMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* 3-Line Hamburger Dropdown Box */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[calc(100vw-32px)] sm:w-72 max-w-[290px] bg-white rounded-2xl border-2 border-slate-300 shadow-2xl p-3.5 z-50 space-y-2 text-xs font-extrabold animate-in fade-in slide-in-from-top-2 origin-top-right duration-150 ring-1 ring-slate-900/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block px-2 pt-1">
                    Navigate to Section:
                  </span>

                  <button
                    type="button"
                    onClick={() => navigateToSection('overview')}
                    className="w-full p-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 flex items-center gap-2 text-left transition-all"
                  >
                    <Home className="w-4 h-4 text-indigo-600" /> Home
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSection('tracks')}
                    className="w-full p-2.5 rounded-xl bg-coral-50 text-coral-700 hover:bg-coral-600 hover:text-white border border-coral-200/80 flex items-center gap-2 text-left transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-coral-600" /> Curriculum Tracks
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSection('why-us')}
                    className="w-full p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 flex items-center gap-2 text-left transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Why 1:1 Wins
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSection('mentors')}
                    className="w-full p-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200/80 flex items-center gap-2 text-left transition-all"
                  >
                    <Users className="w-4 h-4 text-amber-600" /> Mentor Network
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSection('reviews')}
                    className="w-full p-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200/80 flex items-center gap-2 text-left transition-all"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Parent Reviews
                  </button>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 flex items-center gap-2 font-extrabold transition-all"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" /> Log Out ({user.name || user.role})
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full p-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 flex items-center gap-2 font-extrabold transition-all"
                      >
                        <LogIn className="w-4 h-4 text-indigo-600" /> Log In
                      </Link>
                    )}

                    <Link
                      to="/mentor"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 transition-all"
                    >
                      <Users className="w-4 h-4 text-emerald-600" /> Mentor Portal
                    </Link>

                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Stats
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <DevNotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

