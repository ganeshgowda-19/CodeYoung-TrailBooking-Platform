import React from 'react';
import { DateTime } from 'luxon';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  selectedDate: string;
  timezone: string;
  onSelect: (date: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateSelectorStep: React.FC<Props> = ({
  selectedDate,
  timezone,
  onSelect,
  onNext,
  onBack,
}) => {
  const nowZoned = DateTime.now().setZone(timezone || 'UTC');
  const todayStr = nowZoned.toISODate() || '';
  const tomorrowStr = nowZoned.plus({ days: 1 }).toISODate() || '';
  const inTwoDaysStr = nowZoned.plus({ days: 2 }).toISODate() || '';
  const inThreeDaysStr = nowZoned.plus({ days: 3 }).toISODate() || '';

  const quickDates = [
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: tomorrowStr },
    { label: nowZoned.plus({ days: 2 }).toFormat('EEE, MMM d'), date: inTwoDaysStr },
    { label: nowZoned.plus({ days: 3 }).toFormat('EEE, MMM d'), date: inThreeDaysStr },
  ];

  return (
    <div className="space-y-6 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-xl">
      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Step 4: Select Date</h2>
        <p className="text-xs text-slate-500 font-medium">
          Choose a date for your 30-minute trial class in local timezone ({timezone}).
        </p>
      </div>

      {/* Quick Select Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">Quick Select:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickDates.map((q) => {
            const isSelected = selectedDate === q.date;
            return (
              <button
                key={q.date}
                type="button"
                onClick={() => onSelect(q.date)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-coral-50 border-coral-500 text-slate-900 font-bold ring-1 ring-coral-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs block font-bold">{q.label}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{q.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Or Choose Date:</label>
        <div className="relative">
          <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {selectedDate && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs text-slate-700 font-medium">
            Selected Date:{' '}
            <strong className="text-indigo-900 font-bold">
              {DateTime.fromISO(selectedDate).toFormat('EEEE, MMMM d, yyyy')}
            </strong>
          </span>
        </div>
      )}

      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          disabled={!selectedDate}
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          View Available Slots <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
