import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { X, Mail, CheckCircle2, User, UserCheck, ExternalLink, RefreshCw, Crown, Search, GraduationCap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DevNotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PARENT' | 'STUDENT' | 'MENTOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: notifications = [], refetch, isFetching } = useQuery({
    queryKey: ['dev-notifications'],
    queryFn: api.getDevNotifications,
    enabled: isOpen,
    refetchInterval: isOpen ? 4000 : false,
  });

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (roleFilter !== 'ALL' && notif.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = notif.recipientName?.toLowerCase().includes(q);
      const matchEmail = notif.recipientEmail?.toLowerCase().includes(q);
      const matchSubject = notif.subject?.toLowerCase().includes(q);
      const matchRef = notif.meta?.bookingReference?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSubject && !matchRef) return false;
    }
    return true;
  });

  const parentCount = notifications.filter((n) => n.role === 'PARENT').length;
  const studentCount = notifications.filter((n) => n.role === 'STUDENT').length;
  const mentorCount = notifications.filter((n) => n.role === 'MENTOR').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-coral-50 text-coral-600 border border-coral-200 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Dev Email Logs</h3>
                  <p className="text-xs text-slate-500 font-medium">Simulated System Email Dispatch</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                  title="Refresh logs"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by registered name, email, or token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
              />
            </div>

            {/* Registered Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all border whitespace-nowrap ${
                  roleFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Logs ({notifications.length})
              </button>

              <button
                onClick={() => setRoleFilter('PARENT')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all border whitespace-nowrap flex items-center gap-1 ${
                  roleFilter === 'PARENT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <User className="w-3 h-3" /> Registered Parents ({parentCount})
              </button>

              <button
                onClick={() => setRoleFilter('STUDENT')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all border whitespace-nowrap flex items-center gap-1 ${
                  roleFilter === 'STUDENT'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <GraduationCap className="w-3 h-3" /> Registered Students ({studentCount})
              </button>

              <button
                onClick={() => setRoleFilter('MENTOR')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all border whitespace-nowrap flex items-center gap-1 ${
                  roleFilter === 'MENTOR'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <UserCheck className="w-3 h-3" /> Registered Mentors ({mentorCount})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
                <p className="text-sm font-bold text-slate-700">No email notifications match filter</p>
                <p className="text-xs text-slate-500 mt-1">Book a trial class to generate live dispatches for parents, students, and mentors.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-coral-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-lg border ${
                        notif.role === 'PARENT'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : notif.role === 'STUDENT'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {notif.role === 'PARENT' ? (
                        <User className="w-3 h-3 text-indigo-600" />
                      ) : notif.role === 'STUDENT' ? (
                        <GraduationCap className="w-3 h-3 text-amber-600" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                      )}
                      To: {notif.recipientName} ({notif.role})
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono font-bold">
                      {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-600">
                    📧 Recipient: <strong className="text-slate-900 font-bold">{notif.recipientEmail}</strong>
                  </div>

                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {notif.subject}
                  </div>

                  <p className="text-xs text-slate-800 font-mono bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {notif.body}
                  </p>

                  {notif.meta?.classLink && (
                    <div className="pt-1">
                      <Link
                        to={notif.role === 'MENTOR' ? `/class/${notif.meta.bookingReference}?role=mentor` : `/class/${notif.meta.bookingReference}`}
                        onClick={onClose}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all shadow-xs ${
                          notif.role === 'MENTOR'
                            ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                            : 'bg-coral-50 hover:bg-coral-100 border-coral-200 text-coral-700'
                        }`}
                      >
                        {notif.role === 'MENTOR' ? (
                          <>
                            <Crown className="w-3.5 h-3.5 text-amber-500" /> Open Mentor Host Classroom <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            📹 Open Demo Classroom (No Login) <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-600 font-medium">
            Simulated System Email Dispatch • Dedicated Registered Details for Parents, Students & Mentors
          </div>
        </div>
      </div>
    </div>
  );
};
