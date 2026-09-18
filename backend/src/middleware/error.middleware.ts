import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown[];
  code?: number;
}

/**
 * Centralized error handling middleware.
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const errors = Array.isArray(err.errors) ? err.errors : [];

  if (err.code === 11000 || err.name === 'MongoServerError') {
    statusCode = 409;
    message = 'Email already registered';
  }

  logger.error({
    msg: 'Unhandled request error',
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: message,
  });

  // Never expose sensitive internal details or stack traces
  sendError(res, message, errors, statusCode);
};

export default errorHandler;
