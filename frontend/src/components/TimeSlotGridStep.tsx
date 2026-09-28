import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { SlotInformation } from '../types';
import { Clock, ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface Props {
  date: string;
  timezone: string;
  selectedSlot: SlotInformation | null;
  onSelectSlot: (slot: SlotInformation) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TimeSlotGridStep: React.FC<Props> = ({
  date,
  timezone,
  selectedSlot,
  onSelectSlot,
  onNext,
  onBack,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['slots', date, timezone],
    queryFn: () => api.getSlots(date, timezone),
    enabled: Boolean(date && timezone),
  });

  const slots = data?.slots || [];
  const availableCount = data?.availableSlotsCount || 0;

  return (
    <div className="space-y-6 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-xl">
      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Step 5: Choose a Time Slot</h2>
          <span className="text-xs px-3 py-1 rounded-full bg-coral-50 border border-coral-200 text-coral-600 font-bold font-mono">
            {timezone}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Showing available 30-minute trial slots for <strong className="text-slate-900">{date}</strong> in your local time.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 animate-pulse font-medium">
            <Clock className="w-4 h-4 text-coral-500 animate-spin" /> Checking mentor availability across timezones...
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          Failed to load slots: {(error as Error).message}
        </div>
      ) : slots.length === 0 || availableCount === 0 ? (
        <div className="text-center py-10 px-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-900">No trial slots available for this date</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            All mentors have reached their daily demo capacity or are outside operational hours for this date.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-coral-500/20"
          >
            Try Another Date
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
            <span>
              Available Slots: <strong className="text-emerald-600 font-bold">{availableCount}</strong>
            </span>
            <span className="text-[11px] text-slate-500 italic">30 min duration</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTimeUtc === slot.startTimeUtc;
              const isDisabled = !slot.isAvailable;

              return (
                <button
                  key={slot.startTimeUtc}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectSlot(slot)}
                  title={isDisabled ? slot.reason || 'Unavailable' : `Book ${slot.displayTime}`}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-coral-500 to-amber-500 border-coral-400 text-white shadow-lg shadow-coral-500/25 ring-2 ring-coral-400 scale-[1.02]'
                      : isDisabled
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-coral-400 hover:bg-coral-50/40 shadow-sm'
                  }`}
                >
                  <span className="text-xs font-extrabold tracking-tight">{slot.parentTimeStr}</span>
                  <span
                    className={`text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-amber-100 font-bold' : isDisabled ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {slot.timezoneAbbr}
                  </span>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-coral-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {isDisabled && (
                    <span className="text-[9px] text-rose-500 font-extrabold mt-1 line-clamp-1 truncate max-w-[90%]">
                      {slot.reason?.includes('passed') ? 'Passed' : slot.reason?.includes('Outside') ? 'Closed' : 'Slots Full (2/2)'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          disabled={!selectedSlot}
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          Proceed to Summary <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
