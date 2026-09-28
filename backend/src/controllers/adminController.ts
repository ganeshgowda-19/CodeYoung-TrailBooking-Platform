import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService.js';

export async function getAdminDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await bookingService.getAdminDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminMentorSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string | undefined;
    const schedule = await bookingService.getAdminMentorSchedule(date);
    return res.status(200).json({
      success: true,
      data: schedule,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function adminAddMentorSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const { mentorId, date, startTime, parentName, parentEmail, timezone } = req.body;
    const booking = await bookingService.adminAddMentorSlot({
      mentorId,
      date,
      startTime,
      parentName,
      parentEmail,
      timezone,
    });
    return res.status(201).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteMentorSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingId } = req.params;
    const result = await bookingService.adminDeleteMentorSlot(bookingId);
    return res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}
