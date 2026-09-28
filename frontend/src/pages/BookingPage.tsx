import React, { useState, useEffect, useRef } from 'react';
import { StepperProgress } from '../components/StepperProgress';
import { ParentDetailsStep, ParentDetailsFormData } from '../components/ParentDetailsStep';
import { DiagnosticQuizStep, QuizResult } from '../components/DiagnosticQuizStep';
import { TimezoneSelectorStep } from '../components/TimezoneSelectorStep';
import { DateSelectorStep } from '../components/DateSelectorStep';
import { TimeSlotGridStep } from '../components/TimeSlotGridStep';
import { BookingSummaryStep } from '../components/BookingSummaryStep';
import { ConfirmationStep } from '../components/ConfirmationStep';
import { NoMentorErrorState } from '../components/NoMentorErrorState';
import { SlotInformation, BookingResponse } from '../types';
import { api } from '../api/client';
import { RotateCcw, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'codeclass_booking_draft_v2';

export const BookingPage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);

  // Read saved draft from localStorage on initial render
  const getInitialDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return null;
  };

  const initialDraft = getInitialDraft();

  const [step, setStep] = useState<number>(() => {
    if (initialDraft && typeof initialDraft.step === 'number' && initialDraft.step >= 1 && initialDraft.step < 7) {
      return initialDraft.step;
    }
    return 1;
  });

  const [parentData, setParentData] = useState<ParentDetailsFormData>(() => {
    if (initialDraft && initialDraft.parentData) {
      return initialDraft.parentData;
    }
    return {
      parentName: '',
      parentEmail: '',
      studentName: '',
      gradeGroup: 'Engineering & Technology',
      subjectTrack: 'Coding & AI',
    };
  });

  const [quizResult, setQuizResult] = useState<QuizResult | null>(() => {
    return initialDraft?.quizResult || null;
  });

  const [timezone, setTimezone] = useState<string>(() => {
    return initialDraft?.timezone || '';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return initialDraft?.selectedDate || '';
  });

  const [selectedSlot, setSelectedSlot] = useState<SlotInformation | null>(() => {
    return initialDraft?.selectedSlot || null;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [noMentorError, setNoMentorError] = useState<boolean>(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(!!initialDraft);

  // Auto scroll to top on step transition
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [step]);

  // Continuously persist active booking form state to localStorage
  useEffect(() => {
    try {
      if (step < 7) {
        const draft = {
          step,
          parentData,
          quizResult,
          timezone,
          selectedDate,
          selectedSlot,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }, [step, parentData, quizResult, timezone, selectedDate, selectedSlot]);

  const handleParentSubmit = (data: ParentDetailsFormData) => {
    setParentData(data);
    setStep(2);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setParentData((prev) => ({
      ...prev,
      gradeGroup: result.domain,
      subjectTrack: `${result.profileTitle} (${result.recommendedPace})`,
    }));
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setNoMentorError(false);

    try {
      const response = await api.createBooking({
        parentName: parentData.parentName,
        parentEmail: parentData.parentEmail,
        studentName: parentData.studentName,
        parentTimezone: timezone,
        date: selectedSlot.parentDate,
        startTime: selectedSlot.parentTimeHHmm || selectedSlot.parentTimeStr,
      });

      setBookingResult(response);
      localStorage.removeItem(STORAGE_KEY);
      setStep(7);
    } catch (err: any) {
      if (err.code === 'NO_MENTOR_AVAILABLE' || err.status === 409) {
        setNoMentorError(true);
      } else {
        alert(err.message || 'Failed to complete booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    setStep(1);
    setParentData({
      parentName: '',
      parentEmail: '',
      studentName: '',
      gradeGroup: 'Engineering & Technology',
      subjectTrack: 'Coding & AI',
    });
    setSelectedSlot(null);
    setSelectedDate('');
    setTimezone('');
    setBookingResult(null);
    setQuizResult(null);
    setNoMentorError(false);
    setHasRestoredDraft(false);
  };

  return (
    <div ref={topRef} className="max-w-3xl mx-auto px-4 py-8">
      {/* Restored Session Draft Notification Banner */}
      {hasRestoredDraft && step < 7 && (parentData.parentName || parentData.parentEmail || timezone || selectedDate) && (
        <div className="mb-4 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Restored your saved registration form details from Step {step}!
            </span>
          </div>
          <button
            type="button"
            onClick={resetBooking}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-300 transition-all flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Clear & Start Fresh
          </button>
        </div>
      )}

      <StepperProgress currentStep={step} totalSteps={6} />

      <div className="relative">
        {noMentorError ? (
          <NoMentorErrorState
            onChooseAnotherTime={() => {
              setNoMentorError(false);
              setStep(5);
            }}
          />
        ) : (
          <>
            {step === 1 && (
              <ParentDetailsStep initialValues={parentData} onNext={handleParentSubmit} />
            )}

            {step === 2 && (
              <DiagnosticQuizStep
                initialResult={quizResult}
                onComplete={handleQuizComplete}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <TimezoneSelectorStep
                selectedTimezone={timezone}
                onSelect={setTimezone}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <DateSelectorStep
                selectedDate={selectedDate}
                timezone={timezone}
                onSelect={setSelectedDate}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <TimeSlotGridStep
                date={selectedDate}
                timezone={timezone}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                onNext={() => setStep(6)}
                onBack={() => setStep(4)}
              />
            )}

            {step === 6 && selectedSlot && (
              <BookingSummaryStep
                parentData={parentData}
                timezone={timezone}
                slot={selectedSlot}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmBooking}
                onBack={() => setStep(5)}
              />
            )}

            {step === 7 && bookingResult && (
              <ConfirmationStep
                booking={bookingResult}
                studentName={parentData.studentName}
                onBookAnother={resetBooking}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
