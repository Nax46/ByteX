import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/api-response';

export const registerSchema = z.object({
  name: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z
    .string()
    .min(1, 'Password cannot be empty'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Higher-order middleware to validate incoming request bodies against a Zod schema.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorDetails = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      sendError(res, 'Validation failed', errorDetails, 400);
      return;
    }

    req.body = result.data;
    next();
  };
};
