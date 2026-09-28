import { DateTime, IANAZone } from 'luxon';

export interface FormattedTimeDisplay {
  utcIso: string;
  localDate: string; // YYYY-MM-DD
  localTimeStr: string; // e.g., "7:00 PM"
  localTimeHHmm: string; // e.g., "19:00"
  timezoneAbbr: string; // e.g., "EDT" or "EST" or "IST"
  fullFormatted: string; // e.g., "7:00 PM EDT"
  timezone: string; // e.g., "America/New_York"
  isInDst: boolean;
  dstStatus: string;
}

export interface DstInfo {
  timezone: string;
  isInDst: boolean;
  offsetMinutes: number;
  offsetFormatted: string;
  timezoneAbbr: string;
  dstStatus: string;
}

/**
 * Validates whether a given timezone string is a valid IANA timezone identifier.
 */
export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  return IANAZone.isValidZone(tz);
}

/**
 * Returns detailed Daylight Saving Time (DST) status and metadata for a given timezone and date.
 */
export function getDstInfo(timezone: string, dateIsoOrJs?: string | Date): DstInfo {
  if (!isValidIanaTimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }

  const dt = dateIsoOrJs
    ? (typeof dateIsoOrJs === 'string' ? DateTime.fromISO(dateIsoOrJs, { zone: timezone }) : DateTime.fromJSDate(dateIsoOrJs, { zone: timezone }))
    : DateTime.now().setZone(timezone);

  const isInDst = dt.isInDST;
  const offsetMinutes = dt.offset;
  const offsetFormatted = `UTC${dt.toFormat('ZZ')}`;
  const timezoneAbbr = dt.offsetNameShort || dt.toFormat('ZZZZ');
  const dstStatus = isInDst ? '☀️ Daylight Saving Time Active' : '❄️ Standard Time';

  return {
    timezone,
    isInDst,
    offsetMinutes,
    offsetFormatted,
    timezoneAbbr,
    dstStatus,
  };
}

/**
 * Parses a local date (YYYY-MM-DD) and local time (HH:mm or "7:00 PM") in a specific timezone
 * and returns the exact UTC Luxon DateTime object, properly respecting DST.
 */
export function parseLocalToUtc(dateStr: string, timeStr: string, timezone: string): DateTime {
  if (!isValidIanaTimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }

  const cleanTime = timeStr.trim();

  // Try 1: Standard ISO format Date + Time (e.g. 2026-09-28T19:00:00)
  let dtLocal = DateTime.fromISO(`${dateStr}T${cleanTime}:00`, { zone: timezone });

  // Try 2: ISO without adding :00 if cleanTime already has seconds or formatted ISO
  if (!dtLocal.isValid) {
    dtLocal = DateTime.fromISO(`${dateStr}T${cleanTime}`, { zone: timezone });
  }

  // Try 3: 12-hour format with AM/PM e.g. "7:00 PM" or "07:00 PM" or "9:30 AM"
  if (!dtLocal.isValid) {
    dtLocal = DateTime.fromFormat(`${dateStr} ${cleanTime}`, 'yyyy-MM-dd h:mm a', { zone: timezone });
  }
  if (!dtLocal.isValid) {
    dtLocal = DateTime.fromFormat(`${dateStr} ${cleanTime}`, 'yyyy-MM-dd hh:mm a', { zone: timezone });
  }
  if (!dtLocal.isValid) {
    dtLocal = DateTime.fromFormat(`${dateStr} ${cleanTime}`, 'yyyy-MM-dd H:mm', { zone: timezone });
  }
  if (!dtLocal.isValid) {
    dtLocal = DateTime.fromFormat(`${dateStr} ${cleanTime}`, 'yyyy-MM-dd HH:mm', { zone: timezone });
  }

  if (!dtLocal.isValid) {
    throw new Error(`Invalid date/time format: ${dateStr} ${timeStr} in zone ${timezone}`);
  }

  return dtLocal.toUTC();
}

/**
 * Formats a UTC DateTime or ISO string into a human-friendly display string for a given timezone.
 * Example result: "7:00 PM EDT" or "4:30 AM IST"
 */
export function formatUtcToLocalDisplay(utcIsoOrDate: string | Date, targetTimezone: string): FormattedTimeDisplay {
  if (!isValidIanaTimezone(targetTimezone)) {
    throw new Error(`Invalid IANA timezone: ${targetTimezone}`);
  }

  const dtUtc = typeof utcIsoOrDate === 'string'
    ? DateTime.fromISO(utcIsoOrDate, { zone: 'utc' })
    : DateTime.fromJSDate(utcIsoOrDate, { zone: 'utc' });

  if (!dtUtc.isValid) {
    throw new Error(`Invalid UTC date: ${utcIsoOrDate}`);
  }

  const dtLocal = dtUtc.setZone(targetTimezone);
  const localDate = dtLocal.toISODate() || '';
  const localTimeStr = dtLocal.toFormat('h:mm a');
  const localTimeHHmm = dtLocal.toFormat('HH:mm');
  const timezoneAbbr = dtLocal.offsetNameShort || dtLocal.toFormat('ZZZZ');
  const fullFormatted = `${localTimeStr} ${timezoneAbbr}`;
  const isInDst = dtLocal.isInDST;
  const dstStatus = isInDst ? '☀️ Daylight Saving Time Active' : '❄️ Standard Time';

  return {
    utcIso: dtUtc.toISO() || '',
    localDate,
    localTimeStr,
    localTimeHHmm,
    timezoneAbbr,
    fullFormatted,
    timezone: targetTimezone,
    isInDst,
    dstStatus,
  };
}

/**
 * Gets the UTC Start and End Date object for a given local date string (YYYY-MM-DD) in a specified timezone.
 */
export function getLocalDayBoundsInUtc(dateStr: string, timezone: string): { startUtc: Date; endUtc: Date } {
  if (!isValidIanaTimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }

  const startLocal = DateTime.fromISO(`${dateStr}T00:00:00.000`, { zone: timezone });
  const endLocal = DateTime.fromISO(`${dateStr}T23:59:59.999`, { zone: timezone });

  return {
    startUtc: startLocal.toUTC().toJSDate(),
    endUtc: endLocal.toUTC().toJSDate(),
  };
}

/**
 * Checks if a UTC timestamp falls within a mentor's work hours on their local day.
 */
export function isWithinMentorWorkHours(
  utcTime: Date,
  mentorTimezone: string,
  workStartHHmm: string = '09:00',
  workEndHHmm: string = '21:00'
): boolean {
  const dtMentorLocal = DateTime.fromJSDate(utcTime, { zone: 'utc' }).setZone(mentorTimezone);
  const [startHour, startMin] = workStartHHmm.split(':').map(Number);
  const [endHour, endMin] = workEndHHmm.split(':').map(Number);

  const mentorMinutesOfDay = dtMentorLocal.hour * 60 + dtMentorLocal.minute;
  const startMinutesOfDay = startHour * 60 + startMin;
  const endMinutesOfDay = endHour * 60 + endMin;

  return mentorMinutesOfDay >= startMinutesOfDay && mentorMinutesOfDay < endMinutesOfDay;
}
