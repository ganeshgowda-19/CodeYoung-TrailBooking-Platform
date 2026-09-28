import { z } from 'zod';
import { isValidIanaTimezone } from '../utils/timezone.js';

const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const strictNameRegex = /^[a-zA-Z\s'-]+$/;

export const createBookingSchema = z.object({
  parentName: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100)
    .refine((val) => strictNameRegex.test(val.trim()), {
      message: 'Name must contain letters only (no numbers or special symbols)',
    }),
  parentEmail: z
    .string()
    .email('Please enter a valid email address')
    .refine((email) => strictEmailRegex.test(email.trim()), {
      message: 'Please enter a valid email address format (e.g. user@gmail.com)',
    })
    .refine(
      (email) => {
        const trimmed = email.trim().toLowerCase();
        const atIdx = trimmed.indexOf('@');
        if (atIdx !== -1) {
          const domain = trimmed.slice(atIdx + 1);
          if (domain.includes('gmail') && domain !== 'gmail.com') {
            return false;
          }
        }
        return true;
      },
      { message: 'Gmail address must end with @gmail.com (e.g. user@gmail.com)' }
    ),
  studentName: z.string().optional(),
  parentTimezone: z.string().refine((tz) => isValidIanaTimezone(tz), {
    message: 'Invalid IANA timezone identifier',
  }),
  // date in YYYY-MM-DD format
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  // startTime in HH:mm or "7:00 PM" / "9:30 AM" format
  startTime: z
    .string()
    .min(1, 'Start time is required')
    .refine((val) => /^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(val.trim()), {
      message: 'Start time must be in HH:mm or h:mm AM/PM format (e.g. 19:00 or 7:00 PM)',
    }),
});

export const getSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().refine((tz) => isValidIanaTimezone(tz), {
    message: 'Invalid IANA timezone identifier',
  }),
});

export const bookingReferenceParamSchema = z.object({
  bookingReference: z.string().min(4, 'Invalid booking reference'),
});

export const rescheduleBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z
    .string()
    .min(1, 'Start time is required')
    .refine((val) => /^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(val.trim()), {
      message: 'Start time must be in HH:mm or h:mm AM/PM format (e.g. 19:00 or 7:00 PM)',
    }),
  timezone: z.string().optional().refine((tz) => !tz || isValidIanaTimezone(tz), {
    message: 'Invalid IANA timezone identifier',
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type GetSlotsQueryInput = z.infer<typeof getSlotsQuerySchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
