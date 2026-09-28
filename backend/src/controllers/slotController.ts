import { Request, Response, NextFunction } from 'express';
import { slotService } from '../services/slotService.js';

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string;
    const timezone = req.query.timezone as string;

    const slots = await slotService.getAvailableSlots(date, timezone);

    return res.status(200).json({
      success: true,
      data: {
        date,
        timezone,
        totalSlots: slots.length,
        availableSlotsCount: slots.filter((s) => s.isAvailable).length,
        slots,
      },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}
