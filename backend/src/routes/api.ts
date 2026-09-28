import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { getHealth } from '../controllers/healthController.js';
import { getTimezones } from '../controllers/timezoneController.js';
import { getMentors, getMentorBookings } from '../controllers/mentorController.js';
import { getSlots } from '../controllers/slotController.js';
import {
  createBooking,
  getBookingByReference,
  cancelBooking,
  rescheduleBooking,
  sendParentExitAlert,
  getDevNotifications,
} from '../controllers/bookingController.js';
import {
  getAdminDashboard,
  getAdminMentorSchedule,
  adminAddMentorSlot,
  adminDeleteMentorSlot,
} from '../controllers/adminController.js';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  createBookingSchema,
  getSlotsQuerySchema,
  bookingReferenceParamSchema,
  rescheduleBookingSchema,
} from '../schemas/bookingSchema.js';

const router = Router();

// Rate limiting for booking submission (e.g., max 30 booking attempts per 15 minutes per IP)
const bookingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many booking requests from this IP. Please try again later.',
    },
  },
});

// System endpoints
router.get('/health', getHealth);
router.get('/timezones', getTimezones);
router.get('/dev/notifications', getDevNotifications);

// Mentor endpoints
router.get('/mentors', getMentors);
router.get('/mentor/:mentorId/bookings', getMentorBookings);

// Slot discovery
router.get('/slots', validateRequest({ query: getSlotsQuerySchema }), getSlots);

// Booking operations
router.post('/bookings', bookingRateLimiter, validateRequest({ body: createBookingSchema }), createBooking);
router.get('/bookings/:bookingReference', validateRequest({ params: bookingReferenceParamSchema }), getBookingByReference);
router.post('/bookings/:bookingReference/cancel', validateRequest({ params: bookingReferenceParamSchema }), cancelBooking);
router.post('/bookings/:bookingReference/reschedule', validateRequest({ params: bookingReferenceParamSchema, body: rescheduleBookingSchema }), rescheduleBooking);
router.post('/bookings/:bookingReference/parent-alert', validateRequest({ params: bookingReferenceParamSchema }), sendParentExitAlert);

// Admin dashboard & Slot management
router.get('/admin/dashboard', getAdminDashboard);
router.get('/admin/schedule', getAdminMentorSchedule);
router.post('/admin/slots', adminAddMentorSlot);
router.delete('/admin/slots/:bookingId', adminDeleteMentorSlot);

export default router;
