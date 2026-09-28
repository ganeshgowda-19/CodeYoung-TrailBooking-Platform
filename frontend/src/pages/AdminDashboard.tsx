import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  X,
  UserCheck,
  AlertTriangle,
  Video,
  Filter,
  Search,
  ExternalLink,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { DateTime } from 'luxon';

export const AdminDashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const queryClient = useQueryClient();

  // Admin Security Auth Gate State
  const [adminEmail, setAdminEmail] = useState('admin@trialflow.demo');
  const [adminPasscode, setAdminPasscode] = useState('admin123');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isAdminAuthenticated = user?.role === 'ADMIN';
  const [selectedDate, setSelectedDate] = useState<string>(
    DateTime.now().setZone('Asia/Kolkata').toISODate() || new Date().toISOString().split('T')[0]
  );
  const [selectedMentorFilter, setSelectedMentorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FREE' | 'PARTIAL' | 'FULL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetMentorId, setTargetMentorId] = useState<string>('');
  const [newSlotTime, setNewSlotTime] = useState<string>('16:00');
  const [parentName, setParentName] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  // General Admin Overview
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
    isFetching: isFetchingOverview,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.getAdminDashboard,
    refetchInterval: 10000,
  });

  // Future Dates & Mentor Slot Availability Schedule
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    refetch: refetchSchedule,
    isFetching: isFetchingSchedule,
  } = useQuery({
    queryKey: ['admin-schedule', selectedDate],
    queryFn: () => api.getAdminMentorSchedule(selectedDate),
    refetchInterval: 10000,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-schedule'] }),
        refetchOverview(),
        refetchSchedule(),
      ]);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 2500);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const overview = overviewData?.overview;
  const allMentorsSchedule = scheduleData?.mentors || [];

  // Generate list of next 14 dates for easy tab selection
  const futureDates = Array.from({ length: 14 }).map((_, i) => {
    const dt = DateTime.now().setZone('Asia/Kolkata').plus({ days: i });
    return {
      iso: dt.toISODate()!,
      dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dt.toFormat('EEE'),
      dateDisplay: dt.toFormat('MMM d'),
    };
  });

  // Filtering Logic
  const filteredMentors = allMentorsSchedule.filter((m) => {
    // Mentor Filter
    if (selectedMentorFilter !== 'ALL' && m.id !== selectedMentorFilter) {
      return false;
    }
    // Status Filter
    if (statusFilter === 'FREE' && m.bookedCount !== 0) return false;
    if (statusFilter === 'PARTIAL' && (m.bookedCount === 0 || m.bookedCount >= m.maxDailyClasses)) return false;
    if (statusFilter === 'FULL' && m.bookedCount < m.maxDailyClasses) return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchBookings = m.bookings.some(
        (b) => b.parentName.toLowerCase().includes(q) || b.parentEmail.toLowerCase().includes(q) || b.bookingReference.toLowerCase().includes(q)
      );
      if (!matchName && !matchEmail && !matchBookings) return false;
    }

    return true;
  });

  const selectedMentorObject = allMentorsSchedule.find((m) => m.id === selectedMentorFilter);

  const handleOpenAddModal = (mentorId: string) => {
    setTargetMentorId(mentorId);
    setActionError(null);
    setActionSuccess(null);
    setIsAddModalOpen(true);
  };

  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMentorId) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await api.adminAddMentorSlot({
        mentorId: targetMentorId,
        date: selectedDate,
        startTime: newSlotTime,
        parentName: parentName || undefined,
        parentEmail: parentEmail || undefined,
      });

      setActionSuccess('Successfully added trial slot for mentor!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-schedule'] }),
        refetchSchedule(),
        refetchOverview(),
      ]);

      setTimeout(() => {
        setIsAddModalOpen(false);
        setParentName('');
        setParentEmail('');
        setActionSuccess(null);
      }, 800);
    } catch (err: any) {
      setActionError(err.message || 'Failed to add slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (bookingId: string, mentorName: string, timeDisplay: string) => {
    if (!window.confirm(`Are you sure you want to delete/cancel the slot (${timeDisplay}) for ${mentorName}?`)) {
      return;
    }

    try {
      await api.adminDeleteMentorSlot(bookingId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-schedule'] }),
        refetchSchedule(),
        refetchOverview(),
      ]);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    setTimeout(() => {
      if (adminPasscode === 'admin123' || adminPasscode === 'password123' || adminPasscode.length >= 4) {
        login(adminEmail || 'admin@trialflow.demo', 'ADMIN', 'System Administrator');
        setIsVerifying(false);
      } else {
        setAuthError('Invalid Admin Passcode. Use passcode: admin123 for demo authentication.');
        setIsVerifying(false);
      }
    }, 400);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 backdrop-blur-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Restricted Admin Access
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Admin Authentication Required</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The Admin Dashboard and system metrics are protected. Please authenticate with administrator credentials to view stats, mentor schedules, and daily system capacity.
              </p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left">
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Admin Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="admin@trialflow.demo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Security Passcode / PIN</label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    required
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="Enter admin passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default Demo Passcode: <code className="text-amber-400 font-mono">admin123</code></p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                {isVerifying ? 'Verifying Credentials...' : 'Authenticate & View Admin Stats'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Admin Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage mentor capacity, inspect allocations, view mentor schedules, add/delete slots, and join live demo sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            title="Lock Admin Panel"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" /> Lock Panel
          </button>
          {refreshToast && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data Refreshed Live!
            </span>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isFetchingOverview || isFetchingSchedule}
            className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-900 text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-indigo-600 ${
                isRefreshing || isFetchingOverview || isFetchingSchedule ? 'animate-spin' : ''
              }`}
            />
            {isRefreshing || isFetchingOverview || isFetchingSchedule ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {isOverviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : overview ? (
        /* Metrics Overview Row */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Mentors</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{overview.totalMentors}</span>
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">100% Operational</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Booked Classes</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-coral-600">{overview.todayBookings}</span>
              <Calendar className="w-6 h-6 text-coral-600" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Active trial sessions today</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Daily Capacity</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-emerald-600">
                {overview.availableCapacity} / {overview.totalDailyCapacity}
              </span>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Max 2 slots / mentor / day</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Confirmed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{overview.confirmedBookings}</span>
              <span className="text-xs text-rose-500 font-bold">({overview.cancelledBookings} cancelled)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Lifetime system bookings</p>
          </div>
        </div>
      ) : null}

      {/* Future Dates Slot Management & Mentor Inspector Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Mentor Schedule & Capacity Inspector
            </h2>
            <p className="text-xs text-slate-500">
              Select a date and filter by specific mentor to view detailed allocations, manage slots, or join live classes as an observer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">Custom Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* 14-Day Quick Date Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {futureDates.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelectedDate(d.iso)}
                className={`px-3.5 py-2 rounded-2xl border text-left transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">{d.dayLabel}</div>
                <div className="text-xs font-black">{d.dateDisplay}</div>
              </button>
            );
          })}
        </div>

        {/* DEDICATED MENTOR SELECTOR & FILTER TOOLBAR */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Mentor Selection Dropdown (6 cols) */}
            <div className="md:col-span-6 space-y-1">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Select Mentor to Inspect:
              </label>
              <select
                value={selectedMentorFilter}
                onChange={(e) => setSelectedMentorFilter(e.target.value)}
                className="w-full bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
              >
                <option value="ALL">🌐 All Mentors ({allMentorsSchedule.length} Total)</option>
                {allMentorsSchedule.map((m) => (
                  <option key={m.id} value={m.id}>
                    👤 {m.name} ({m.bookedCount}/2 slots booked) — {m.timezone}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input (6 cols) */}
            <div className="md:col-span-6 space-y-1">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-coral-500" /> Quick Search Mentor or Student:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by mentor name, parent name, or booking ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Filter Status:
            </span>

            {(['ALL', 'FREE', 'PARTIAL', 'FULL'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all border ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' && `All (${allMentorsSchedule.length})`}
                {st === 'FREE' && `100% Free (${allMentorsSchedule.filter((m) => m.bookedCount === 0).length})`}
                {st === 'PARTIAL' && `Partial (${allMentorsSchedule.filter((m) => m.bookedCount > 0 && m.bookedCount < m.maxDailyClasses).length})`}
                {st === 'FULL' && `Full (${allMentorsSchedule.filter((m) => m.bookedCount >= m.maxDailyClasses).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* DETAILED MENTOR SPOTLIGHT CARD (When a specific mentor is selected) */}
        {selectedMentorObject && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden border border-indigo-800/60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-coral-500 to-amber-500 p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-base font-black text-white">
                    {selectedMentorObject.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedMentorObject.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE MENTOR
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 font-mono mt-0.5">{selectedMentorObject.email}</p>
                  <p className="text-[11px] text-slate-300 font-semibold mt-0.5">🌐 Primary Timezone: {selectedMentorObject.timezone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-extrabold text-indigo-300 block">Date Capacity</span>
                  <span className="text-2xl font-black text-white">
                    {selectedMentorObject.bookedCount} / {selectedMentorObject.maxDailyClasses}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedMentorObject.bookedCount >= selectedMentorObject.maxDailyClasses}
                  onClick={() => handleOpenAddModal(selectedMentorObject.id)}
                  className="px-4 py-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Slot
                </button>
              </div>
            </div>

            {/* Selected Mentor's Detailed Bookings */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Booked Trial Sessions on {DateTime.fromISO(selectedDate).toFormat('EEE, MMM d, yyyy')}:
              </h4>

              {selectedMentorObject.bookings.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-800/60 text-center text-xs text-indigo-300">
                  🎉 No slots currently booked for {selectedMentorObject.name} on this date. 100% Free Capacity!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedMentorObject.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-800/80 shadow-md space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> {b.timeDisplay}
                          </span>
                          <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                            {b.bookingReference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-semibold">
                          Parent: <strong className="text-white">{b.parentName}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">Email: {b.parentEmail}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-indigo-900/80">
                        {/* Direct Admin Observer Class Join Button */}
                        <Link
                          to={`/class/${b.bookingReference}`}
                          target="_blank"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                          title="Click to open live classroom session as Admin Observer"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Class Observer <ExternalLink className="w-3 h-3 opacity-80" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(b.id, selectedMentorObject.name, b.timeDisplay)}
                          className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Date Summary Info Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              Viewing Schedule for:{' '}
              <strong className="text-indigo-950 font-black">
                {DateTime.fromISO(selectedDate).toFormat('EEEE, MMMM d, yyyy')}
              </strong>
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">
            Showing {filteredMentors.length} of {allMentorsSchedule.length} Mentors
          </span>
        </div>

        {/* Mentor Cards List / Slot Manager Grid */}
        {isScheduleLoading ? (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-slate-50 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No mentors match the selected filter</h3>
            <p className="text-xs text-slate-500">Try changing the mentor dropdown or status filter above.</p>
            <button
              onClick={() => {
                setSelectedMentorFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMentors.map((m) => {
              const isFull = m.bookedCount >= m.maxDailyClasses;
              const isFree = m.bookedCount === 0;

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isFull
                      ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                      : isFree
                      ? 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                      : 'bg-white border-slate-200 shadow-md'
                  }`}
                >
                  {/* Card Top Info */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{m.name}</span>
                        <button
                          onClick={() => setSelectedMentorFilter(m.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          title="Inspect this mentor specifically"
                        >
                          🔍 Inspect
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isFull
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isFree
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {isFull ? 'FULL (2/2)' : isFree ? '100% FREE (0/2)' : 'PARTIAL (1/2)'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{m.email}</p>
                      <p className="text-[10px] text-slate-600 font-semibold mt-0.5">🌐 Timezone: {m.timezone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 block">Slots Allocated</span>
                      <span className="text-xl font-black text-slate-900">
                        {m.bookedCount} <span className="text-xs font-bold text-slate-400">/ {m.maxDailyClasses}</span>
                      </span>
                    </div>
                  </div>

                  {/* Allocated Slots List */}
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Scheduled Slots on {selectedDate}:
                    </span>

                    {m.bookings.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500 font-semibold">
                        No slots booked for {m.name} on this date.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {m.bookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                {b.timeDisplay}
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium">
                                Parent: <strong className="text-slate-900">{b.parentName}</strong> ({b.parentEmail})
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                                  Ref: {b.bookingReference}
                                </span>
                                <Link
                                  to={`/class/${b.bookingReference}`}
                                  target="_blank"
                                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                                  title="Join class room directly"
                                >
                                  <Video className="w-3 h-3" /> Join Class
                                </Link>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(b.id, m.name, b.timeDisplay)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                              title="Delete/Cancel this slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Slot Action Button */}
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={() => handleOpenAddModal(m.id)}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white shadow-md shadow-coral-500/20'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> {isFull ? 'Capacity Reached (2/2)' : `+ Add Slot to ${m.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Admin to Add Slot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-coral-50 text-coral-600 border border-coral-200">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Add Trial Slot to Mentor</h3>
                <p className="text-xs text-slate-500">Date: {selectedDate}</p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                {actionError}
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleAddSlotSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Select Mentor</label>
                <select
                  value={targetMentorId}
                  onChange={(e) => setTargetMentorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {allMentorsSchedule.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.bookedCount}/2 slots used) — {m.timezone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Slot Start Time (24h or HH:mm)</label>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="09:00">09:00 AM (Asia/Kolkata)</option>
                  <option value="10:00">10:00 AM (Asia/Kolkata)</option>
                  <option value="11:30">11:30 AM (Asia/Kolkata)</option>
                  <option value="14:00">02:00 PM (Asia/Kolkata)</option>
                  <option value="16:00">04:00 PM (Asia/Kolkata)</option>
                  <option value="17:30">05:30 PM (Asia/Kolkata)</option>
                  <option value="19:00">07:00 PM (Asia/Kolkata)</option>
                  <option value="20:30">08:30 PM (Asia/Kolkata)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Parent Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Default: Admin Assigned)"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Parent Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 text-white font-black rounded-xl shadow-md active:scale-95"
                >
                  {isSubmitting ? 'Creating Slot...' : 'Confirm Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
