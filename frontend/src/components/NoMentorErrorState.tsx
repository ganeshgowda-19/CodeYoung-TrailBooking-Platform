import React from 'react';
import { CalendarX, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  onChooseAnotherTime: () => void;
}

export const NoMentorErrorState: React.FC<Props> = ({ onChooseAnotherTime }) => {
  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-6 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-md">
        <CalendarX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 border border-coral-200 text-coral-700 text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" /> Mentor Capacity Full (2/2 Slots Booked)
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Slots are full for this mentor
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          All trial class slots for certified mentors are currently full (maximum 2 slots per mentor capacity reached). Please select another available date or time slot below.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2.5">
        <div className="flex items-center gap-2 font-black text-indigo-900 border-b border-slate-200/80 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Why this guarantees 100% teaching quality for your child:</span>
        </div>
        <ul className="space-y-1.5 text-slate-600 font-medium text-[11px] leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">•</span>
            <span><strong>Max 2 Sessions/Day Limit:</strong> Mentors are strictly capped at 2 trial classes per day so they remain fresh, energetic, and 100% focused on your student.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">•</span>
            <span><strong>Zero Crowded Groups:</strong> No overworked tutors or crowded 50-student group calls.</span>
          </li>
        </ul>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onChooseAnotherTime}
          className="w-full py-3.5 bg-gradient-to-r from-coral-600 via-coral-500 to-amber-500 hover:from-coral-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-coral-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" /> Pick Another Date & Time Slot
        </button>
      </div>
    </div>
  );
};
