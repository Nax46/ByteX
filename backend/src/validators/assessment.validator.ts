import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/api-response';

export const attemptParamsSchema = z.object({
  attemptId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid assessment attempt ID format'),
});

export const historyQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : 1))
    .refine((val) => Number.isInteger(val) && val >= 1, {
      message: 'Page must be an integer greater than or equal to 1',
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : 10))
    .refine((val) => Number.isInteger(val) && val >= 1 && val <= 50, {
      message: 'Limit must be an integer between 1 and 50',
    }),
});

export type HistoryQueryInput = z.infer<typeof historyQuerySchema>;

/**
 * Validates route parameters containing attemptId.
 */
export const validateAttemptParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = attemptParamsSchema.safeParse(req.params);

  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Invalid assessment attempt ID format', errorDetails, 400);
    return;
  }

  req.params = result.data as any;
  next();
};

/**
 * Validates query parameters for assessment history.
 */
export const validateHistoryQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = historyQuerySchema.safeParse(req.query);

  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Validation failed', errorDetails, 400);
    return;
  }

  // Store parsed and validated values safely in res.locals
  res.locals.historyQuery = result.data;
  next();
};
