import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { bookingService, NoMentorAvailableError, DomainError } from '../services/bookingService.js';
import { DateTime } from 'luxon';

describe('Booking Domain Service & Business Logic', () => {
  const tomorrowStr = DateTime.now().plus({ days: 1 }).setZone('America/New_York').toISODate()!;

  beforeEach(async () => {
    // Reset bookings for clean test run
    await prisma.booking.deleteMany();
  });

  it('should successfully create a trial booking and assign an available mentor', async () => {
    const booking = await bookingService.createBooking({
      parentName: 'Alice Johnson',
      parentEmail: 'alice.johnson@example.com',
      parentTimezone: 'America/New_York',
      date: tomorrowStr,
      startTime: '10:00', // 10:00 AM EDT
    });

    expect(booking).toBeDefined();
    expect(booking.bookingReference).toMatch(/^TF-[A-Z0-9]{6}$/);
    expect(booking.parent.name).toBe('Alice Johnson');
    expect(booking.mentor.name).toBeDefined();
    expect(booking.classLink).toContain(booking.bookingReference);
    expect(booking.status).toBe('CONFIRMED');
  });

  it('should prevent mentor from exceeding 2 demo classes per day', async () => {
    const testDate = tomorrowStr;
    const mentors = await prisma.mentor.findMany();
    const targetMentor = mentors[0];

    const start1 = DateTime.fromISO(`${testDate}T09:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
    const end1 = DateTime.fromISO(`${testDate}T09:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();
    const start2 = DateTime.fromISO(`${testDate}T10:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
    const end2 = DateTime.fromISO(`${testDate}T10:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();

    const parent = await prisma.parent.create({
      data: { name: 'Parent Test', email: 'parent.test@example.com', timezone: 'Asia/Kolkata' },
    });

    await prisma.booking.create({
      data: {
        bookingReference: 'TF-TEST01',
        parentId: parent.id,
        mentorId: targetMentor.id,
        startTimeUtc: start1,
        endTimeUtc: end1,
        parentTimezone: 'Asia/Kolkata',
        mentorTimezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
        classLink: 'https://demo.trialflow.local/class/TF-TEST01',
      },
    });

    await prisma.booking.create({
      data: {
        bookingReference: 'TF-TEST02',
        parentId: parent.id,
        mentorId: targetMentor.id,
        startTimeUtc: start2,
        endTimeUtc: end2,
        parentTimezone: 'Asia/Kolkata',
        mentorTimezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
        classLink: 'https://demo.trialflow.local/class/TF-TEST02',
      },
    });

    const stats = await bookingService.getMentorBookings(targetMentor.id);
    expect(stats.mentor.todayBookingsCount).toBe(2);
    expect(stats.mentor.isCapacityReached).toBe(true);
  });

  it('should return NO_MENTOR_AVAILABLE when all mentors reach daily capacity or are busy', async () => {
    const mentors = await prisma.mentor.findMany();
    const testDate = tomorrowStr;

    const parent = await prisma.parent.create({
      data: { name: 'Bulk Parent', email: 'bulk.parent@example.com', timezone: 'Asia/Kolkata' },
    });

    let counter = 100;
    for (const mentor of mentors) {
      for (let i = 0; i < 2; i++) {
        const startHour = 9 + i;
        const startStr = `${String(startHour).padStart(2, '0')}:00:00`;
        const endStr = `${String(startHour).padStart(2, '0')}:30:00`;

        const start = DateTime.fromISO(`${testDate}T${startStr}`, { zone: 'Asia/Kolkata' }).toJSDate();
        const end = DateTime.fromISO(`${testDate}T${endStr}`, { zone: 'Asia/Kolkata' }).toJSDate();
        await prisma.booking.create({
          data: {
            bookingReference: `TF-FILL${counter++}`,
            parentId: parent.id,
            mentorId: mentor.id,
            startTimeUtc: start,
            endTimeUtc: end,
            parentTimezone: 'Asia/Kolkata',
            mentorTimezone: 'Asia/Kolkata',
            status: 'CONFIRMED',
            classLink: 'https://demo.trialflow.local/class/TF-FILL',
          },
        });
      }
    }

    await expect(
      bookingService.createBooking({
        parentName: 'Overflow Parent',
        parentEmail: 'overflow@example.com',
        parentTimezone: 'Asia/Kolkata',
        date: testDate,
        startTime: '14:00',
      })
    ).rejects.toThrow(NoMentorAvailableError);
  });

  it('should reject invalid timezone identifiers', async () => {
    await expect(
      bookingService.createBooking({
        parentName: 'Bad Zone',
        parentEmail: 'badzone@example.com',
        parentTimezone: 'Invalid/Zone',
        date: tomorrowStr,
        startTime: '10:00',
      })
    ).rejects.toThrow(DomainError);
  });

  it('should allow cancelling a booking', async () => {
    const booking = await bookingService.createBooking({
      parentName: 'Bob Vance',
      parentEmail: 'bob.vance@example.com',
      parentTimezone: 'America/New_York',
      date: tomorrowStr,
      startTime: '11:00',
    });

    const cancelled = await bookingService.cancelBooking(booking.bookingReference);
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('should prevent the same parent email from double booking at the same time slot', async () => {
    await bookingService.createBooking({
      parentName: 'Sarah Jenkins',
      parentEmail: 'sarah.jenkins@example.com',
      parentTimezone: 'America/New_York',
      date: tomorrowStr,
      startTime: '10:00',
    });

    await expect(
      bookingService.createBooking({
        parentName: 'Sarah Jenkins',
        parentEmail: 'sarah.jenkins@example.com',
        parentTimezone: 'America/New_York',
        date: tomorrowStr,
        startTime: '10:00',
      })
    ).rejects.toThrow(DomainError);
  });
});
