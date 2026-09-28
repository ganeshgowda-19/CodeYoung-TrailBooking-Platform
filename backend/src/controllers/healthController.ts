import { Request, Response } from 'express';

export async function getHealth(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      app: 'CodeYoung API',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
}
