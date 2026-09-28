import { PrismaClient, Mentor } from '@prisma/client';
import { prisma as defaultPrisma } from '../lib/prisma.js';
import { getLocalDayBoundsInUtc } from '../utils/timezone.js';
import { DateTime } from 'luxon';
import { config } from '../config/index.js';

export interface MentorWithCount {
  mentor: Mentor;
  bookingsTodayCount: number;
  totalBookingsCount: number;
}

export class MentorAllocationService {
  /**
   * Finds the best available mentor for a requested UTC time window [startTimeUtc, endTimeUtc].
   * Enforces strict limit of MAX 2 PARENTS/BOOKINGS per mentor.
   * Uses fair round-robin allocation strategy to distribute bookings evenly across all mentors.
   */
  async findBestMentorForSlot(
    startTimeUtc: Date,
    endTimeUtc: Date,
    tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ): Promise<Mentor | null> {
    const db = tx || defaultPrisma;

    // 1. Fetch all active mentors
    const activeMentors = await db.mentor.findMany({
      where: { isActive: true },
    });

    if (activeMentors.length === 0) {
      return null;
    }

    const eligibleMentorsWithCounts: MentorWithCount[] = [];

    for (const mentor of activeMentors) {
      // 2. Enforce STRICT MAX 2 PARENTS/BOOKINGS per mentor across all time
      const totalBookingsCount = await db.booking.count({
        where: {
          mentorId: mentor.id,
          status: 'CONFIRMED',
        },
      });

      const maxAllowed = Math.min(mentor.maxDailyClasses || 2, 2); // Strict Cap of 2 parents per mentor

      if (totalBookingsCount >= maxAllowed) {
        continue; // Mentor already has 2 parents/bookings allocated!
      }

      // 3. Check for time overlap conflict
      const conflictingBooking = await db.booking.findFirst({
        where: {
          mentorId: mentor.id,
          status: 'CONFIRMED',
          startTimeUtc: { lt: endTimeUtc },
          endTimeUtc: { gt: startTimeUtc },
        },
      });

      if (conflictingBooking) {
        continue; // Mentor is busy during this slot
      }

      // 4. Determine mentor's local calendar day for the requested slot
      const dtMentorLocal = DateTime.fromJSDate(startTimeUtc, { zone: 'utc' }).setZone(mentor.timezone);
      const mentorLocalDateStr = dtMentorLocal.toISODate(); // YYYY-MM-DD

      if (!mentorLocalDateStr) continue;

      const { startUtc, endUtc } = getLocalDayBoundsInUtc(mentorLocalDateStr, mentor.timezone);

      // 5. Count existing confirmed bookings for this mentor on their local calendar day
      const bookingsTodayCount = await db.booking.count({
        where: {
          mentorId: mentor.id,
          status: 'CONFIRMED',
          startTimeUtc: {
            gte: startUtc,
            lte: endUtc,
          },
        },
      });

      if (bookingsTodayCount >= maxAllowed) {
        continue; // Capacity limit reached for this mentor on this day
      }

      eligibleMentorsWithCounts.push({
        mentor,
        bookingsTodayCount,
        totalBookingsCount,
      });
    }

    if (eligibleMentorsWithCounts.length === 0) {
      return null;
    }

    // 6. Fair Allocation Strategy:
    // Sort by:
    // 1. Fewest total confirmed bookings (ASC)
    // 2. Fewest today bookings (ASC)
    // 3. Tie-breaker: Shuffle / pseudo-random to prevent all bookings piling onto 1 mentor
    eligibleMentorsWithCounts.sort((a, b) => {
      if (a.totalBookingsCount !== b.totalBookingsCount) {
        return a.totalBookingsCount - b.totalBookingsCount;
      }
      if (a.bookingsTodayCount !== b.bookingsTodayCount) {
        return a.bookingsTodayCount - b.bookingsTodayCount;
      }
      return Math.random() - 0.5;
    });

    return eligibleMentorsWithCounts[0].mentor;
  }
}

export const mentorAllocationService = new MentorAllocationService();
