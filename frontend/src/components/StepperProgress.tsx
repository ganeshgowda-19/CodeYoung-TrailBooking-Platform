import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
}

const STEPS = [
  { step: 1, title: 'Details' },
  { step: 2, title: 'Quiz' },
  { step: 3, title: 'Timezone' },
  { step: 4, title: 'Date' },
  { step: 5, title: 'Slots' },
  { step: 6, title: 'Summary' },
];

export const StepperProgress: React.FC<Props> = ({ currentStep }) => {
  if (currentStep > 6) return null; // Confirmation step handles its own UI

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto px-1 gap-1 sm:gap-2">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <React.Fragment key={s.step}>
              <div
                className={`flex flex-col items-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'border-coral-500 bg-coral-50/90 shadow-md ring-2 ring-coral-500/20 scale-105 z-10'
                    : isCompleted
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`px-2 py-1 rounded-xl flex items-center justify-center font-black text-[11px] sm:text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-2 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-gradient-to-r from-coral-500 to-amber-500 border-2 border-amber-300 text-white shadow-lg shadow-coral-500/25'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `Step ${s.step}`}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] mt-1 hidden sm:block transition-colors ${
                    isCurrent ? 'text-coral-700 font-black' : isCompleted ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
                  }`}
                >
                  {s.title}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 sm:mx-1 transition-all duration-500 ${
                    currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
