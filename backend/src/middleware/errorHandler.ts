import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../services/bookingService.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    logger.warn('validation.error', { issues: formattedIssues });
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: formattedIssues || 'Invalid input data',
      },
    });
  }

  // Handle Domain Errors
  if (err instanceof DomainError) {
    logger.warn('domain.error', { code: err.code, message: err.message, statusCode: err.statusCode });
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle Unexpected 500 Server Errors
  logger.error('server.unexpected_error', { message: err.message, stack: err.stack });

  return res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred. Please try again later.',
    },
  });
}
