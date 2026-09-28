import React from 'react';
import { DateTime } from 'luxon';
import { SlotInformation } from '../types';
import { ParentDetailsFormData } from './ParentDetailsStep';
import { User, Calendar, Clock, Globe, ArrowLeft, Sparkles, Loader2, ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

interface Props {
  parentData: ParentDetailsFormData;
  timezone: string;
  slot: SlotInformation;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingSummaryStep: React.FC<Props> = ({
  parentData,
  timezone,
  slot,
  isSubmitting,
  onConfirm,
  onBack,
}) => {
  const dtUtc = DateTime.fromISO(slot.startTimeUtc, { zone: 'utc' });
  const dtMentor = dtUtc.setZone('Asia/Kolkata');
  const mentorDisplay = `${dtMentor.toFormat('h:mm a')} ${dtMentor.offsetNameShort || 'IST'}`;

  const parentDateFormatted = DateTime.fromISO(slot.parentDate).toFormat('MMMM d, yyyy');

  return (
    <div className="space-y-6 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-xl">
      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300">
        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Step 6: Review & Confirm</h2>
        <p className="text-xs text-slate-600">
          Please verify your booking details before confirming your 1-on-1 trial class.
        </p>
      </div>

      {/* Summary Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-xl shadow-slate-200/60">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Breakdown</span>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            Free 1-on-1 Trial
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Parent & Student Details */}
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] flex items-center gap-1 font-semibold">
              <User className="w-3.5 h-3.5 text-coral-500" /> Parent & Student Details
            </span>
            <p className="font-bold text-slate-900 text-sm">Parent: {parentData.parentName}</p>
            {parentData.studentName && (
              <p className="font-extrabold text-indigo-700 text-xs">Student: {parentData.studentName}</p>
            )}
            <p className="text-slate-600 font-mono text-[11px]">{parentData.parentEmail}</p>
          </div>

          {/* Student Subject & Grade */}
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] flex items-center gap-1 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Subject & Grade Track
            </span>
            <p className="font-bold text-coral-600 text-sm">{parentData.subjectTrack}</p>
            <p className="text-slate-700 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {parentData.gradeGroup}
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] flex items-center gap-1 font-semibold">
              <Globe className="w-3.5 h-3.5 text-amber-500" /> Selected Timezone
            </span>
            <p className="font-bold text-slate-900 text-sm">{timezone}</p>
            <p className="text-slate-500">IANA Standard Timezone</p>
          </div>

          {/* Duration */}
          <div className="space-y-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> Session Format
            </span>
            <p className="font-bold text-slate-900 text-sm">30-Minute Live 1-on-1 Session</p>
            <p className="text-slate-500">Includes Hands-on Project & Assessment</p>
          </div>

          {/* Parent Local Time */}
          <div className="space-y-1 p-4 rounded-2xl bg-coral-50/60 border border-coral-200">
            <span className="text-coral-700 text-[11px] flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5 text-coral-600" /> Your Local Date & Time
            </span>
            <p className="font-extrabold text-coral-600 text-base">{slot.displayTime}</p>
            <p className="text-slate-600 font-medium">{parentDateFormatted}</p>
          </div>

          {/* Mentor Local Time Preview */}
          <div className="space-y-1 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-indigo-700 text-[11px] flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Mentor Local Time (Asia/Kolkata)
            </span>
            <p className="font-extrabold text-indigo-600 text-base">{mentorDisplay}</p>
            <p className="text-slate-600 font-medium">{dtMentor.toFormat('MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Backend automatically matches eligible active mentor upon confirmation.</span>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="px-8 py-3 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming Booking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Confirm Trial Class
            </>
          )}
        </button>
      </div>
    </div>
  );
};
