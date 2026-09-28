import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Calendar, Users, ShieldCheck } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleNavSection = (sectionId: string) => {
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      {/* Home / Overview */}
      <button
        type="button"
        onClick={() => handleNavSection('overview')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
          isActive('/') ? 'text-indigo-600 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* Curriculum Tracks */}
      <button
        type="button"
        onClick={() => handleNavSection('tracks')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all text-slate-500 font-medium hover:text-coral-600"
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Tracks</span>
      </button>

      {/* Center Featured CTA: Book Free Trial */}
      <Link
        to="/book"
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-coral-500 to-amber-500 text-white font-extrabold shadow-md active:scale-95 transition-transform -mt-3 border-2 border-white"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Book Trial</span>
      </Link>



      {/* Mentor Portal */}
      <Link
        to="/mentor"
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
          isActive('/mentor') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Mentors</span>
      </Link>

      {/* Admin Stats */}
      <Link
        to="/admin"
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
          isActive('/admin') ? 'text-amber-600 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Admin</span>
      </Link>
    </nav>
  );
};
