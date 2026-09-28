import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { mentorAllocationService } from '../services/mentorAllocationService.js';
import { DateTime } from 'luxon';

describe('Mentor Allocation Capacity Rules (Strict Max 2 Parents Per Mentor)', () => {
  const tomorrowStr = DateTime.now().plus({ days: 1 }).setZone('Asia/Kolkata').toISODate()!;
  const startUtc = DateTime.fromISO(`${tomorrowStr}T10:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
  const endUtc = DateTime.fromISO(`${tomorrowStr}T10:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();

  beforeEach(async () => {
    await prisma.booking.deleteMany();
  });

  it('should enforce strict maximum of 2 parents per mentor', async () => {
    const mentors = await prisma.mentor.findMany({ where: { isActive: true } });
    expect(mentors.length).toBeGreaterThan(0);

    const testMentor = mentors[0];
    const parent = await prisma.parent.create({
      data: { name: 'Capacity Test Parent', email: 'capacity.parent@example.com', timezone: 'Asia/Kolkata' },
    });

    // Assign 2 bookings to testMentor
    await prisma.booking.create({
      data: {
        bookingReference: 'TF-CAP01',
        parentId: parent.id,
        mentorId: testMentor.id,
        startTimeUtc: startUtc,
        endTimeUtc: endUtc,
        parentTimezone: 'Asia/Kolkata',
        mentorTimezone: testMentor.timezone,
        status: 'CONFIRMED',
        classLink: 'https://demo.trialflow.local/class/TF-CAP01',
      },
    });

    await prisma.booking.create({
      data: {
        bookingReference: 'TF-CAP02',
        parentId: parent.id,
        mentorId: testMentor.id,
        startTimeUtc: DateTime.fromISO(`${tomorrowStr}T11:00:00`, { zone: 'Asia/Kolkata' }).toJSDate(),
        endTimeUtc: DateTime.fromISO(`${tomorrowStr}T11:30:00`, { zone: 'Asia/Kolkata' }).toJSDate(),
        parentTimezone: 'Asia/Kolkata',
        mentorTimezone: testMentor.timezone,
        status: 'CONFIRMED',
        classLink: 'https://demo.trialflow.local/class/TF-CAP02',
      },
    });

    // Find next available mentor for a new slot
    const slot3Start = DateTime.fromISO(`${tomorrowStr}T12:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
    const slot3End = DateTime.fromISO(`${tomorrowStr}T12:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();

    const allocatedMentor = await mentorAllocationService.findBestMentorForSlot(slot3Start, slot3End);

    expect(allocatedMentor).toBeDefined();
    // Must NOT allocate testMentor because testMentor already has 2 parents/bookings!
    expect(allocatedMentor?.id).not.toBe(testMentor.id);
  });
});
