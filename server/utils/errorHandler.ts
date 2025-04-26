import { Response } from 'express';

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function handleError(res: Response, error: any) {
  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message });
  } else {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 