import { describe, it, expect } from 'vitest';
import { parseLocalToUtc, formatUtcToLocalDisplay, isValidIanaTimezone, getDstInfo } from '../utils/timezone.js';

describe('Timezone & DST Utilities', () => {
  it('should validate IANA timezone identifiers correctly', () => {
    expect(isValidIanaTimezone('America/New_York')).toBe(true);
    expect(isValidIanaTimezone('Asia/Kolkata')).toBe(true);
    expect(isValidIanaTimezone('Europe/London')).toBe(true);
    expect(isValidIanaTimezone('Invalid/Timezone_Name')).toBe(false);
    expect(isValidIanaTimezone('')).toBe(false);
  });

  it('should inspect DST metadata and transition state accurately', () => {
    // July is Daylight Saving Time in America/New_York (EDT)
    const dstSummer = getDstInfo('America/New_York', '2026-07-15T12:00:00');
    expect(dstSummer.isInDst).toBe(true);
    expect(dstSummer.dstStatus).toContain('Daylight Saving Time Active');
    expect(dstSummer.offsetFormatted).toBe('UTC-04:00');

    // January is Standard Time in America/New_York (EST)
    const dstWinter = getDstInfo('America/New_York', '2026-01-15T12:00:00');
    expect(dstWinter.isInDst).toBe(false);
    expect(dstWinter.dstStatus).toContain('Standard Time');
    expect(dstWinter.offsetFormatted).toBe('UTC-05:00');
  });

  it('should correctly convert local time to UTC in winter (EST - UTC-5)', () => {
    // 2026-01-15 19:00 in America/New_York is EST (UTC-5)
    const utcDt = parseLocalToUtc('2026-01-15', '19:00', 'America/New_York');
    expect(utcDt.toISO()).toContain('2026-01-16T00:00:00.000Z');
  });

  it('should correctly convert local time to UTC in summer (EDT - UTC-4) handling DST automatically', () => {
    // 2026-07-15 19:00 in America/New_York is EDT (UTC-4)
    const utcDt = parseLocalToUtc('2026-07-15', '19:00', 'America/New_York');
    expect(utcDt.toISO()).toContain('2026-07-15T23:00:00.000Z');
  });

  it('should format UTC timestamp for mentor in Asia/Kolkata (IST - UTC+5:30)', () => {
    const utcDate = new Date('2026-09-28T23:00:00.000Z');
    const display = formatUtcToLocalDisplay(utcDate, 'Asia/Kolkata');

    expect(display.localTimeStr).toBe('4:30 AM');
    expect(display.fullFormatted).toContain('4:30 AM');
    expect(display.localDate).toBe('2026-09-29');
  });

  it('should format parent local time with timezone info', () => {
    const utcDate = new Date('2026-09-28T23:00:00.000Z');
    const display = formatUtcToLocalDisplay(utcDate, 'America/New_York');

    expect(display.localTimeStr).toBe('7:00 PM');
    expect(display.fullFormatted).toContain('7:00 PM');
  });
});
