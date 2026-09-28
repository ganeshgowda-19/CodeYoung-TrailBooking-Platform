export interface TimezoneOption {
  identifier: string;
  name: string;
  region: string;
  abbr: string;
  formattedOffset: string;
  currentTimeDisplay: string;
  isInDst?: boolean;
  dstStatus?: string;
}

export interface SlotInformation {
  startTimeUtc: string;
  endTimeUtc: string;
  parentDate: string;
  parentTimeStr: string;
  parentTimeHHmm: string;
  timezoneAbbr: string;
  displayTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface BookingResponse {
  bookingReference: string;
  id: string;
  status: string;
  classLink: string;
  studentName?: string;
  parent: {
    name: string;
    email: string;
    timezone: string;
    localTimeDisplay: string;
  };
  mentor: {
    id: string;
    name: string;
    timezone: string;
    localTimeDisplay: string;
  };
  startTimeUtc: string;
  endTimeUtc: string;
  durationMinutes: number;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  timezone: string;
  maxDailyClasses: number;
  todayBookingsCount?: number;
  remainingCapacity?: number;
  isAvailable?: boolean;
  availabilityStatus?: 'AVAILABLE_ZERO_SESSIONS' | 'AVAILABLE_ONE_SESSION' | 'FULLY_BOOKED';
  milestone?: string;
  title?: string;
  rating?: number;
  totalSessionsCompleted?: number;
  badges?: string[];
}

export interface MentorDashboardData {
  mentor: {
    id: string;
    name: string;
    email: string;
    timezone: string;
    maxDailyClasses: number;
    todayBookingsCount: number;
    remainingCapacity: number;
    isCapacityReached: boolean;
  };
  bookings: Array<{
    id: string;
    bookingReference: string;
    parentName: string;
    parentEmail: string;
    parentTimezone: string;
    parentTimeDisplay: string;
    mentorTimeDisplay: string;
    mentorDateStr: string;
    startTimeUtc: string;
    status: string;
    classLink: string;
  }>;
}

export interface AdminDashboardData {
  overview: {
    totalMentors: number;
    todayBookings: number;
    totalDailyCapacity: number;
    availableCapacity: number;
    confirmedBookings: number;
    cancelledBookings: number;
  };
  mentors: Array<{
    id: string;
    name: string;
    email: string;
    timezone: string;
    maxDailyClasses: number;
    todayClassesCount: number;
    remainingCapacity: number;
    status: 'AVAILABLE' | 'CAPACITY_REACHED';
  }>;
}

export interface DevNotification {
  id: string;
  type: string;
  recipientEmail: string;
  recipientName: string;
  role: 'PARENT' | 'STUDENT' | 'MENTOR';
  subject: string;
  body: string;
  sentAt: string;
  meta: any;
}
