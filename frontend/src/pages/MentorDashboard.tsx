import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  RefreshCw,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MentorDashboard: React.FC = () => {
  const { user, login, logout } = useAuth();

  const isMentorAuthenticated = user?.role === 'MENTOR';

  // Auth Gate Form State
  const [mentorEmail, setMentorEmail] = useState('arjun.sharma@trialflow.demo');
  const [mentorPasscode, setMentorPasscode] = useState('mentor123');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: mentors = [], isLoading: isLoadingMentors } = useQuery({
    queryKey: ['mentors'],
    queryFn: api.getMentors,
  });

  const [selectedMentorId, setSelectedMentorId] = useState<string>('');

  const activeMentorId =
    selectedMentorId ||
    (user?.email ? mentors.find((m) => m.email.toLowerCase() === user.email.toLowerCase())?.id : '') ||
    (mentors.length > 0 ? mentors[0].id : '');

  const {
    data: mentorData,
    isLoading: isLoadingBookings,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mentor-bookings', activeMentorId],
    queryFn: () => api.getMentorBookings(activeMentorId),
    enabled: Boolean(activeMentorId) && isMentorAuthenticated,
  });

  const mentor = mentorData?.mentor;
  const bookings = (mentorData?.bookings || []).filter((b) => b.status === 'CONFIRMED');

  const handleMentorAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    setTimeout(() => {
      if (mentorPasscode === 'mentor123' || mentorPasscode === 'password123' || mentorPasscode.length >= 4) {
        const foundMentor = mentors.find((m) => m.email.toLowerCase() === mentorEmail.toLowerCase());
        const mentorName = foundMentor ? foundMentor.name : mentorEmail.split('@')[0];
        login(mentorEmail || 'arjun.sharma@trialflow.demo', 'MENTOR', mentorName);
        if (foundMentor) {
          setSelectedMentorId(foundMentor.id);
        }
        setIsVerifying(false);
      } else {
        setAuthError('Invalid Mentor Passcode. Use passcode: mentor123 for authentication.');
        setIsVerifying(false);
      }
    }, 400);
  };

  // Mentor Auth Lock Gate
  if (!isMentorAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 backdrop-blur-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Restricted Mentor Portal
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Mentor Authentication Required</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Please authenticate with your instructor email and security passcode to view your assigned trial classes schedule in read-only mode.
              </p>
            </div>

            <form onSubmit={handleMentorAuthSubmit} className="space-y-4 text-left">
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Instructor Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="arjun.sharma@trialflow.demo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Security Passcode / PIN</label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={mentorPasscode}
                    onChange={(e) => setMentorPasscode(e.target.value)}
                    required
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Enter mentor passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default Demo Passcode: <code className="text-indigo-400 font-mono">mentor123</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                {isVerifying ? 'Verifying Credentials...' : 'Authenticate & View Mentor Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Mentor Portal</h1>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 ml-2">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> Read-Only Schedule View
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            View assigned trial classes and track daily teaching capacity in your local timezone ({mentor?.timezone || 'Local Time'}).
          </p>
        </div>

        {/* Action Controls & Mentor Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            title="Lock Mentor Portal"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" /> Lock Portal
          </button>

          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-600 pl-2">Instructor:</label>
            <select
              value={activeMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              disabled={isLoadingMentors}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
            >
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.timezone})
                </option>
              ))}
            </select>

            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Refresh Schedule"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {isLoadingBookings ? (
        <div className="space-y-4 py-8">
          <div className="h-28 bg-white animate-pulse rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white animate-pulse rounded-2xl border border-slate-200" />
        </div>
      ) : mentor ? (
        <>
          {/* Capacity Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Instructor</span>
              <h3 className="text-lg font-black text-slate-900">{mentor.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{mentor.email}</p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-indigo-600 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Work Hours: 09:00 - 21:00 ({mentor.timezone})
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Capacity</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    mentor.isCapacityReached
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {mentor.isCapacityReached ? 'Daily Capacity Reached' : 'Available for Booking'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{mentor.todayBookingsCount}</span>
                <span className="text-xs text-slate-500 font-medium">/ {mentor.maxDailyClasses} max classes booked today</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    mentor.isCapacityReached ? 'bg-amber-500' : 'bg-coral-500'
                  }`}
                  style={{ width: `${(mentor.todayBookingsCount / mentor.maxDailyClasses) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Allocation Rule</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Backend enforces a strict limit of <strong>2 demo classes per mentor per day</strong>. Fair allocation assigns incoming requests to eligible mentors with the fewest bookings.
              </p>
            </div>
          </div>

          {/* Bookings List (Strictly Read-Only View) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Scheduled Trial Classes ({bookings.length})
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Read-Only View • Instructors can inspect student details & launch demo rooms</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">Times in {mentor.timezone}</span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-bold text-slate-700">No classes scheduled today.</p>
                <p className="text-xs text-slate-500">New trial class assignments will appear here live.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {b.bookingReference}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.parentName}</h4>
                      <p className="text-xs text-slate-500 font-mono">{b.parentEmail}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Mentor Time ({mentor.timezone})</span>
                        <span className="font-bold text-emerald-700">{b.mentorTimeDisplay}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Parent Time ({b.parentTimezone})</span>
                        <span className="font-bold text-slate-700">{b.parentTimeDisplay}</span>
                      </div>
                    </div>

                    <div>
                      <Link
                        to={`/class/${b.bookingReference}`}
                        className="px-4 py-2 bg-coral-600 hover:bg-coral-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Classroom <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
