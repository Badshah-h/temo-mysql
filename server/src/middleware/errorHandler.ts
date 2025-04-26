import { Request, Response, NextFunction } from "express";

/**
 * Error response interface
 */
export interface ErrorResponse {
  message: string;
  status: number;
  errors?: any;
  stack?: string;
}

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  status: number;
  errors?: any;

  constructor(message: string, status: number = 500, errors?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 * Catches 404 errors when no route matches
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Default error status and message
  const status = (err as AppError).status || 500;
  const message = err.message || "Something went wrong";
  const errors = (err as AppError).errors;

  // Prepare error response
  const errorResponse: ErrorResponse = {
    message,
    status,
  };

  // Add errors if available
  if (errors) {
    errorResponse.errors = errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Log error
  console.error(`[ERROR] ${status} - ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Send error response
  res.status(status).json(errorResponse);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to the error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
