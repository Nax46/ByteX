import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown[];
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
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = Array.isArray(err.errors) ? err.errors : [];

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
