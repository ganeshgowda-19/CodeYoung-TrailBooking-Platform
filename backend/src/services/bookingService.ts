import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreateBookingInput } from '../schemas/bookingSchema.js';
import { DateTime } from 'luxon';
import { parseLocalToUtc, formatUtcToLocalDisplay, isValidIanaTimezone, getLocalDayBoundsInUtc } from '../utils/timezone.js';
import { mentorAllocationService } from './mentorAllocationService.js';
import { generateBookingReference } from '../utils/bookingRef.js';
import { notificationService } from './notificationService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export const BookingStatus = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export class DomainError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NoMentorAvailableError extends DomainError {
  constructor(message: string = "Slots are full for this mentor (Maximum 2 trial slots per mentor capacity reached). Please choose another available date or time slot.") {
    super(message, 'NO_MENTOR_AVAILABLE', 409);
  }
}

export class BookingNotFoundError extends DomainError {
  constructor(reference: string) {
    super(`Booking with reference ${reference} was not found.`, 'BOOKING_NOT_FOUND', 404);
  }
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

export class BookingService {
  /**
   * Creates a booking with concurrency-safe mentor allocation inside a database transaction.
   */
  async createBooking(input: CreateBookingInput): Promise<BookingResponse> {
    const { parentName, parentEmail, studentName, parentTimezone, date, startTime } = input;

    if (!isValidIanaTimezone(parentTimezone)) {
      throw new DomainError(`Invalid IANA timezone: ${parentTimezone}`, 'INVALID_TIMEZONE', 400);
    }

    // 1. Calculate requested UTC start and end times
    const startTimeUtcLuxon = parseLocalToUtc(date, startTime, parentTimezone);
    const endTimeUtcLuxon = startTimeUtcLuxon.plus({ minutes: config.sessionDurationMinutes });

    const startTimeUtc = startTimeUtcLuxon.toJSDate();
    const endTimeUtc = endTimeUtcLuxon.toJSDate();

    // Reject past date/time
    if (startTimeUtc < new Date()) {
      throw new DomainError('Cannot book a trial class in the past.', 'PAST_TIME_SLOT', 400);
    }

    logger.info('booking.requested', { parentEmail, parentTimezone, date, startTime, startTimeUtc: startTimeUtc.toISOString() });

    // 2. Concurrency-Safe Transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Prevent parent with same email from booking multiple classes at the exact same time slot
      const existingParentBooking = await tx.booking.findFirst({
        where: {
          parent: { email: parentEmail },
          startTimeUtc: startTimeUtc,
          status: BookingStatus.CONFIRMED,
        },
      });

      if (existingParentBooking) {
        logger.warn('booking.parent_double_booked', { parentEmail, date, startTime });
        const parentDisplay = formatUtcToLocalDisplay(startTimeUtc, parentTimezone);
        throw new DomainError(
          `You already have a trial class booked for this date and time slot (${parentDisplay.fullFormatted}) with email ${parentEmail}. Please choose a different time slot.`,
          'PARENT_ALREADY_BOOKED',
          409
        );
      }

      // Find eligible mentor inside transaction scope
      const selectedMentor = await mentorAllocationService.findBestMentorForSlot(startTimeUtc, endTimeUtc, tx);

      if (!selectedMentor) {
        logger.warn('booking.conflict', { parentEmail, date, startTime });
        throw new NoMentorAvailableError();
      }

      // Find or create parent
      let parent = await tx.parent.findFirst({
        where: { email: parentEmail },
      });

      if (!parent) {
        parent = await tx.parent.create({
          data: {
            name: parentName,
            email: parentEmail,
            timezone: parentTimezone,
          },
        });
      } else {
        // Update parent info if modified
        parent = await tx.parent.update({
          where: { id: parent.id },
          data: { name: parentName, timezone: parentTimezone },
        });
      }

      const bookingReference = generateBookingReference();
      const baseUrl = config.clientUrl || 'http://localhost:5173';
      const classLink = `${baseUrl}/class/${bookingReference}`;

      // Create Booking
      const newBooking = await tx.booking.create({
        data: {
          bookingReference,
          parentId: parent.id,
          mentorId: selectedMentor.id,
          studentName: studentName || parentName,
          startTimeUtc,
          endTimeUtc,
          parentTimezone,
          mentorTimezone: selectedMentor.timezone,
          status: BookingStatus.CONFIRMED,
          classLink,
        },
        include: {
          parent: true,
          mentor: true,
        },
      });

      return newBooking;
    });

    logger.info('booking.created', {
      bookingReference: booking.bookingReference,
      mentorId: booking.mentorId,
      mentorName: booking.mentor.name,
    });

    // Format display strings
    const parentDisplay = formatUtcToLocalDisplay(booking.startTimeUtc, booking.parentTimezone);
    const mentorDisplay = formatUtcToLocalDisplay(booking.startTimeUtc, booking.mentorTimezone);

    // Trigger Notification Service
    notificationService.sendBookingConfirmation({
      parentName: booking.parent.name,
      parentEmail: booking.parent.email,
      studentName: booking.studentName || booking.parent.name,
      mentorName: booking.mentor.name,
      mentorEmail: booking.mentor.email,
      bookingReference: booking.bookingReference,
      parentTimeFormatted: parentDisplay.fullFormatted,
      mentorTimeFormatted: mentorDisplay.fullFormatted,
      classLink: booking.classLink,
    });

    return {
      bookingReference: booking.bookingReference,
      id: booking.id,
      status: booking.status,
      classLink: booking.classLink,
      studentName: booking.studentName || booking.parent.name,
      parent: {
        name: booking.parent.name,
        email: booking.parent.email,
        timezone: booking.parentTimezone,
        localTimeDisplay: parentDisplay.fullFormatted,
      },
      mentor: {
        id: booking.mentor.id,
        name: booking.mentor.name,
        timezone: booking.mentorTimezone,
        localTimeDisplay: mentorDisplay.fullFormatted,
      },
      startTimeUtc: booking.startTimeUtc.toISOString(),
      endTimeUtc: booking.endTimeUtc.toISOString(),
      durationMinutes: config.sessionDurationMinutes,
    };
  }

  /**
   * Retrieves booking details by reference code.
   */
  async getBookingByReference(bookingReference: string): Promise<BookingResponse> {
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
      include: { parent: true, mentor: true },
    });

    if (!booking) {
      throw new BookingNotFoundError(bookingReference);
    }

    const parentDisplay = formatUtcToLocalDisplay(booking.startTimeUtc, booking.parentTimezone);
    const mentorDisplay = formatUtcToLocalDisplay(booking.startTimeUtc, booking.mentorTimezone);

    return {
      bookingReference: booking.bookingReference,
      id: booking.id,
      status: booking.status,
      classLink: booking.classLink,
      studentName: booking.studentName || booking.parent.name,
      parent: {
        name: booking.parent.name,
        email: booking.parent.email,
        timezone: booking.parentTimezone,
        localTimeDisplay: parentDisplay.fullFormatted,
      },
      mentor: {
        id: booking.mentor.id,
        name: booking.mentor.name,
        timezone: booking.mentorTimezone,
        localTimeDisplay: mentorDisplay.fullFormatted,
      },
      startTimeUtc: booking.startTimeUtc.toISOString(),
      endTimeUtc: booking.endTimeUtc.toISOString(),
      durationMinutes: config.sessionDurationMinutes,
    };
  }

  /**
   * Cancels an existing booking.
   */
  async cancelBooking(bookingReference: string): Promise<BookingResponse> {
    const existing = await prisma.booking.findUnique({
      where: { bookingReference },
    });

    if (!existing) {
      throw new BookingNotFoundError(bookingReference);
    }

    const updated = await prisma.booking.update({
      where: { bookingReference },
      data: { status: BookingStatus.CANCELLED },
      include: { parent: true, mentor: true },
    });

    logger.info('booking.cancelled', { bookingReference });

    return this.getBookingByReference(updated.bookingReference);
  }

  /**
   * Reschedules an existing booking to a new date/time slot.
   */
  async rescheduleBooking(
    bookingReference: string,
    input: { date: string; startTime: string; timezone?: string }
  ): Promise<BookingResponse> {
    const existing = await prisma.booking.findUnique({
      where: { bookingReference },
      include: { parent: true, mentor: true },
    });

    if (!existing) {
      throw new BookingNotFoundError(bookingReference);
    }

    const parentTimezone = input.timezone || existing.parentTimezone;

    if (!isValidIanaTimezone(parentTimezone)) {
      throw new DomainError(`Invalid IANA timezone: ${parentTimezone}`, 'INVALID_TIMEZONE', 400);
    }

    const startTimeUtcLuxon = parseLocalToUtc(input.date, input.startTime, parentTimezone);
    const endTimeUtcLuxon = startTimeUtcLuxon.plus({ minutes: config.sessionDurationMinutes });

    const startTimeUtc = startTimeUtcLuxon.toJSDate();
    const endTimeUtc = endTimeUtcLuxon.toJSDate();

    if (startTimeUtc < new Date()) {
      throw new DomainError('Cannot reschedule a trial class to a past date/time.', 'PAST_TIME_SLOT', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const selectedMentor = await mentorAllocationService.findBestMentorForSlot(startTimeUtc, endTimeUtc, tx);

      if (!selectedMentor) {
        throw new NoMentorAvailableError('No available mentors for the requested rescheduled time slot. Please choose another time.');
      }

      return await tx.booking.update({
        where: { bookingReference },
        data: {
          startTimeUtc,
          endTimeUtc,
          parentTimezone,
          mentorId: selectedMentor.id,
          mentorTimezone: selectedMentor.timezone,
          status: BookingStatus.CONFIRMED,
        },
        include: { parent: true, mentor: true },
      });
    });

    const rescheduled = await this.getBookingByReference(updated.bookingReference);

    notificationService.sendBookingConfirmation({
      parentName: rescheduled.parent.name,
      parentEmail: rescheduled.parent.email,
      studentName: rescheduled.studentName || rescheduled.parent.name,
      mentorName: rescheduled.mentor.name,
      mentorEmail: updated.mentor.email,
      bookingReference: rescheduled.bookingReference,
      parentTimeFormatted: rescheduled.parent.localTimeDisplay,
      mentorTimeFormatted: rescheduled.mentor.localTimeDisplay,
      classLink: rescheduled.classLink,
    });

    return rescheduled;
  }

  /**
   * Fetches bookings for a specific mentor dashboard.
   */
  async getMentorBookings(mentorId: string) {
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new DomainError('Mentor not found', 'MENTOR_NOT_FOUND', 404);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        mentorId,
        status: BookingStatus.CONFIRMED,
      },
      include: { parent: true },
      orderBy: { startTimeUtc: 'asc' },
    });

    // Format output
    const formattedBookings = bookings.map((b) => {
      const mentorDisplay = formatUtcToLocalDisplay(b.startTimeUtc, b.mentorTimezone);
      const parentDisplay = formatUtcToLocalDisplay(b.startTimeUtc, b.parentTimezone);

      return {
        id: b.id,
        bookingReference: b.bookingReference,
        parentName: b.parent.name,
        parentEmail: b.parent.email,
        parentTimezone: b.parentTimezone,
        parentTimeDisplay: parentDisplay.fullFormatted,
        mentorTimeDisplay: mentorDisplay.fullFormatted,
        mentorDateStr: mentorDisplay.localDate,
        startTimeUtc: b.startTimeUtc.toISOString(),
        status: b.status,
        classLink: b.classLink,
      };
    });

    const mentorTodayStr = formatUtcToLocalDisplay(new Date(), mentor.timezone).localDate;
    const todayBookingsCount = formattedBookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED
    ).length;

    return {
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        timezone: mentor.timezone,
        maxDailyClasses: mentor.maxDailyClasses,
        todayBookingsCount,
        remainingCapacity: Math.max(0, mentor.maxDailyClasses - todayBookingsCount),
        isCapacityReached: todayBookingsCount >= mentor.maxDailyClasses,
      },
      bookings: formattedBookings,
    };
  }

  /**
   * Provides data for the Admin Dashboard.
   */
  async getAdminDashboardStats() {
    const totalMentors = await prisma.mentor.count({ where: { isActive: true } });
    const mentors = await prisma.mentor.findMany({
      where: { isActive: true },
      include: { bookings: { where: { status: BookingStatus.CONFIRMED } } },
    });

    const totalConfirmedBookings = await prisma.booking.count({
      where: { status: BookingStatus.CONFIRMED },
    });

    const totalCancelledBookings = await prisma.booking.count({
      where: { status: BookingStatus.CANCELLED },
    });

    let todayBookingsTotal = 0;
    const mentorStats = mentors.map((m) => {
      const todayCount = m.bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length;
      todayBookingsTotal += todayCount;

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        timezone: m.timezone,
        maxDailyClasses: m.maxDailyClasses,
        todayClassesCount: todayCount,
        remainingCapacity: Math.max(0, m.maxDailyClasses - todayCount),
        status: todayCount >= m.maxDailyClasses ? 'CAPACITY_REACHED' : 'AVAILABLE',
      };
    });

    const totalDailyCapacity = mentors.reduce((acc, m) => acc + m.maxDailyClasses, 0);
    const availableCapacity = Math.max(0, totalDailyCapacity - todayBookingsTotal);

    return {
      overview: {
        totalMentors,
        todayBookings: todayBookingsTotal,
        totalDailyCapacity,
        availableCapacity,
        confirmedBookings: totalConfirmedBookings,
        cancelledBookings: totalCancelledBookings,
      },
      mentors: mentorStats,
    };
  }

  /**
   * Admin view for future dates showing mentor slot counts, free status, and active bookings.
   */
  async getAdminMentorSchedule(dateStr?: string) {
    const targetDate = dateStr || DateTime.now().setZone('Asia/Kolkata').toISODate();
    
    const activeMentors = await prisma.mentor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const mentorSchedule = await Promise.all(
      activeMentors.map(async (mentor) => {
        const { startUtc, endUtc } = getLocalDayBoundsInUtc(targetDate!, mentor.timezone);

        const bookingsOnDate = await prisma.booking.findMany({
          where: {
            mentorId: mentor.id,
            status: BookingStatus.CONFIRMED,
            startTimeUtc: {
              gte: startUtc,
              lte: endUtc,
            },
          },
          include: { parent: true },
          orderBy: { startTimeUtc: 'asc' },
        });

        const bookedCount = bookingsOnDate.length;
        const remainingCapacity = Math.max(0, mentor.maxDailyClasses - bookedCount);

        let status = 'FREE';
        if (bookedCount >= mentor.maxDailyClasses) {
          status = 'FULL';
        } else if (bookedCount > 0) {
          status = 'PARTIALLY_BOOKED';
        }

        const formattedBookings = bookingsOnDate.map((b) => {
          const parentDisplay = formatUtcToLocalDisplay(b.startTimeUtc, b.parentTimezone);
          const mentorDisplay = formatUtcToLocalDisplay(b.startTimeUtc, b.mentorTimezone);

          return {
            id: b.id,
            bookingReference: b.bookingReference,
            parentName: b.parent.name,
            parentEmail: b.parent.email,
            startTimeUtc: b.startTimeUtc.toISOString(),
            timeDisplay: parentDisplay.fullFormatted,
            mentorTimeDisplay: mentorDisplay.fullFormatted,
            status: b.status,
          };
        });

        return {
          id: mentor.id,
          name: mentor.name,
          email: mentor.email,
          timezone: mentor.timezone,
          maxDailyClasses: mentor.maxDailyClasses,
          bookedCount,
          remainingCapacity,
          status,
          bookings: formattedBookings,
        };
      })
    );

    return {
      date: targetDate,
      mentors: mentorSchedule,
    };
  }

  /**
   * Admin adds a slot for a specific mentor on a date & time.
   */
  async adminAddMentorSlot(payload: {
    mentorId: string;
    date: string;
    startTime: string;
    parentName?: string;
    parentEmail?: string;
    timezone?: string;
  }) {
    const mentor = await prisma.mentor.findUnique({
      where: { id: payload.mentorId },
    });

    if (!mentor) {
      throw new DomainError('Mentor not found', 'MENTOR_NOT_FOUND', 404);
    }

    const timezone = payload.timezone || mentor.timezone;
    const startTimeUtcLuxon = parseLocalToUtc(payload.date, payload.startTime, timezone);
    const endTimeUtcLuxon = startTimeUtcLuxon.plus({ minutes: config.sessionDurationMinutes });

    const startTimeUtc = startTimeUtcLuxon.toJSDate();
    const endTimeUtc = endTimeUtcLuxon.toJSDate();

    // Check mentor existing booking count on that date
    const dtMentorLocal = DateTime.fromJSDate(startTimeUtc, { zone: 'utc' }).setZone(mentor.timezone);
    const mentorDateStr = dtMentorLocal.toISODate()!;
    const { startUtc, endUtc } = getLocalDayBoundsInUtc(mentorDateStr, mentor.timezone);

    const existingCount = await prisma.booking.count({
      where: {
        mentorId: mentor.id,
        status: BookingStatus.CONFIRMED,
        startTimeUtc: { gte: startUtc, lte: endUtc },
      },
    });

    if (existingCount >= mentor.maxDailyClasses) {
      throw new DomainError(`Mentor ${mentor.name} has reached max capacity (${mentor.maxDailyClasses} classes) for ${mentorDateStr}`, 'MAX_CAPACITY', 400);
    }

    // Check time conflict
    const conflict = await prisma.booking.findFirst({
      where: {
        mentorId: mentor.id,
        status: BookingStatus.CONFIRMED,
        startTimeUtc: { lt: endTimeUtc },
        endTimeUtc: { gt: startTimeUtc },
      },
    });

    if (conflict) {
      throw new DomainError(`Mentor ${mentor.name} is already busy during this time slot.`, 'SLOT_CONFLICT', 400);
    }

    const pName = payload.parentName?.trim() || `Parent of ${mentor.name}`;
    const pEmail = payload.parentEmail?.trim() || `admin.assigned.${Date.now()}@trialflow.demo`;

    let parent = await prisma.parent.findFirst({ where: { email: pEmail } });
    if (!parent) {
      parent = await prisma.parent.create({
        data: {
          name: pName,
          email: pEmail,
          timezone,
        },
      });
    }

    const bookingReference = `TF-ADM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const classLink = `https://meet.jit.si/TrialFlow-Demo-${bookingReference}`;

    const newBooking = await prisma.booking.create({
      data: {
        bookingReference,
        parentId: parent.id,
        mentorId: mentor.id,
        startTimeUtc,
        endTimeUtc,
        parentTimezone: timezone,
        mentorTimezone: mentor.timezone,
        status: BookingStatus.CONFIRMED,
        classLink,
      },
      include: { parent: true, mentor: true },
    });

    return this.getBookingByReference(newBooking.bookingReference);
  }

  /**
   * Admin deletes/cancels a slot for a mentor.
   */
  async adminDeleteMentorSlot(bookingId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingReference: bookingId }],
      },
    });

    if (!booking) {
      throw new DomainError('Booking / Slot not found', 'NOT_FOUND', 404);
    }

    await prisma.booking.delete({
      where: { id: booking.id },
    });

    return { message: 'Slot deleted successfully', bookingId: booking.id };
  }
}

export const bookingService = new BookingService();
