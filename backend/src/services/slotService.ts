import { DateTime } from 'luxon';
import { isValidIanaTimezone, formatUtcToLocalDisplay, isWithinMentorWorkHours } from '../utils/timezone.js';
import { mentorAllocationService } from './mentorAllocationService.js';
import { config } from '../config/index.js';

export interface SlotInformation {
  startTimeUtc: string; // ISO UTC
  endTimeUtc: string; // ISO UTC
  parentDate: string; // YYYY-MM-DD
  parentTimeStr: string; // e.g. "7:00 PM"
  parentTimeHHmm: string; // e.g. "19:00"
  timezoneAbbr: string; // e.g. "EDT"
  displayTime: string; // e.g. "7:00 PM EDT"
  isAvailable: boolean;
  reason?: string;
}

export class SlotService {
  /**
   * Generates time slots for a given date in the parent's timezone and computes mentor availability.
   */
  async getAvailableSlots(parentDateStr: string, parentTimezone: string): Promise<SlotInformation[]> {
    if (!isValidIanaTimezone(parentTimezone)) {
      throw new Error(`Invalid IANA timezone: ${parentTimezone}`);
    }

    const durationMin = config.sessionDurationMinutes; // 30 mins

    const startOfParentDay = DateTime.fromISO(`${parentDateStr}T00:00:00`, { zone: parentTimezone });

    if (!startOfParentDay.isValid) {
      throw new Error(`Invalid date format: ${parentDateStr}`);
    }

    const slots: SlotInformation[] = [];

    // Generate 30-minute intervals across 24 hours of the parent's date (48 candidate slots)
    for (let minuteOffset = 0; minuteOffset < 24 * 60; minuteOffset += durationMin) {
      const slotStartLocal = startOfParentDay.plus({ minutes: minuteOffset });
      const slotEndLocal = slotStartLocal.plus({ minutes: durationMin });

      const slotStartUtc = slotStartLocal.toUTC().toJSDate();
      const slotEndUtc = slotEndLocal.toUTC().toJSDate();

      const isWorkHours = isWithinMentorWorkHours(
        slotStartUtc,
        'Asia/Kolkata',
        config.mentorWorkStart,
        config.mentorWorkEnd
      );

      const formatted = formatUtcToLocalDisplay(slotStartUtc, parentTimezone);

      const nowUtc = new Date();
      const isPast = slotStartUtc < nowUtc;

      let isAvailable = false;
      let reason: string | undefined = undefined;

      if (isPast) {
        isAvailable = false;
        reason = 'Time slot has passed';
      } else if (!isWorkHours) {
        isAvailable = false;
        reason = 'Outside mentor operational hours';
      } else {
        const availableMentor = await mentorAllocationService.findBestMentorForSlot(slotStartUtc, slotEndUtc);
        if (availableMentor) {
          isAvailable = true;
        } else {
          isAvailable = false;
          reason = 'Slots are full for this mentor (Max 2 slots allocated)';
        }
      }

      slots.push({
        startTimeUtc: slotStartUtc.toISOString(),
        endTimeUtc: slotEndUtc.toISOString(),
        parentDate: formatted.localDate,
        parentTimeStr: formatted.localTimeStr,
        parentTimeHHmm: formatted.localTimeHHmm,
        timezoneAbbr: formatted.timezoneAbbr,
        displayTime: formatted.fullFormatted,
        isAvailable,
        reason,
      });
    }

    return slots;
  }
}

export const slotService = new SlotService();
