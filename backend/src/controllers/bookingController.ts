import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService.js';
import { notificationService } from '../services/notificationService.js';

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking(req.body);

    return res.status(201).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getBookingByReference(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingReference } = req.params;
    const booking = await bookingService.getBookingByReference(bookingReference);

    return res.status(200).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingReference } = req.params;
    const booking = await bookingService.cancelBooking(bookingReference);

    return res.status(200).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function rescheduleBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingReference } = req.params;
    const booking = await bookingService.rescheduleBooking(bookingReference, req.body);

    return res.status(200).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function sendParentExitAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingReference } = req.params;
    const booking = await bookingService.getBookingByReference(bookingReference);

    notificationService.sendParentExitAlert({
      parentName: booking.parent.name,
      parentEmail: booking.parent.email,
      studentName: booking.studentName || booking.parent.name,
      mentorName: booking.mentor.name,
      bookingReference: booking.bookingReference,
      classLink: booking.classLink,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Parent alert dispatched successfully.',
        parentEmail: booking.parent.email,
      },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDevNotifications(_req: Request, res: Response) {
  const notifications = notificationService.getRecentNotifications();
  return res.status(200).json({
    success: true,
    data: notifications,
    error: null,
  });
}
