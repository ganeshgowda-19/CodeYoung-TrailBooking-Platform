import {
  TimezoneOption,
  SlotInformation,
  BookingResponse,
  Mentor,
  MentorDashboardData,
  AdminDashboardData,
  DevNotification,
} from '../types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
  } | null;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    const errorObj = new Error(body.error?.message || 'An unexpected error occurred.') as Error & {
      code?: string;
      status?: number;
    };
    errorObj.code = body.error?.code || 'UNKNOWN_ERROR';
    errorObj.status = response.status;
    throw errorObj;
  }

  return body.data;
}

export const api = {
  getTimezones: () => request<TimezoneOption[]>('/timezones'),

  getMentors: () => request<Mentor[]>('/mentors'),

  getSlots: (date: string, timezone: string) =>
    request<{
      date: string;
      timezone: string;
      totalSlots: number;
      availableSlotsCount: number;
      slots: SlotInformation[];
    }>(`/slots?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(timezone)}`),

  createBooking: (payload: {
    parentName: string;
    parentEmail: string;
    studentName?: string;
    parentTimezone: string;
    date: string;
    startTime: string;
  }) =>
    request<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBookingByReference: (reference: string) => request<BookingResponse>(`/bookings/${encodeURIComponent(reference)}`),

  cancelBooking: (reference: string) =>
    request<BookingResponse>(`/bookings/${encodeURIComponent(reference)}/cancel`, {
      method: 'POST',
    }),

  rescheduleBooking: (reference: string, payload: { date: string; startTime: string; timezone?: string }) =>
    request<BookingResponse>(`/bookings/${encodeURIComponent(reference)}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  sendParentExitAlert: (reference: string) =>
    request<{ message: string; parentEmail: string }>(`/bookings/${encodeURIComponent(reference)}/parent-alert`, {
      method: 'POST',
    }),

  getMentorBookings: (mentorId: string) => request<MentorDashboardData>(`/mentor/${encodeURIComponent(mentorId)}/bookings`),

  getAdminDashboard: () => request<AdminDashboardData>('/admin/dashboard'),

  getAdminMentorSchedule: (date?: string) =>
    request<{
      date: string;
      mentors: {
        id: string;
        name: string;
        email: string;
        timezone: string;
        maxDailyClasses: number;
        bookedCount: number;
        remainingCapacity: number;
        status: string;
        bookings: {
          id: string;
          bookingReference: string;
          parentName: string;
          parentEmail: string;
          startTimeUtc: string;
          timeDisplay: string;
          mentorTimeDisplay: string;
          status: string;
        }[];
      }[];
    }>(`/admin/schedule${date ? `?date=${encodeURIComponent(date)}` : ''}`),

  adminAddMentorSlot: (payload: {
    mentorId: string;
    date: string;
    startTime: string;
    parentName?: string;
    parentEmail?: string;
    timezone?: string;
  }) =>
    request<BookingResponse>('/admin/slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminDeleteMentorSlot: (bookingId: string) =>
    request<{ message: string; bookingId: string }>(`/admin/slots/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    }),

  getDevNotifications: () => request<DevNotification[]>('/dev/notifications'),
};
