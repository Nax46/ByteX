import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/api-response';

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  education: z
    .string()
    .trim()
    .max(200, 'Education cannot exceed 200 characters')
    .optional(),
  college: z
    .string()
    .trim()
    .max(200, 'College cannot exceed 200 characters')
    .optional(),
  semester: z
    .number()
    .int('Semester must be an integer')
    .min(1, 'Semester must be at least 1')
    .max(20, 'Semester cannot exceed 20')
    .optional(),
  interests: z
    .array(z.string().trim().min(1, 'Interest tag cannot be empty'))
    .optional()
    .default([]),
  targetCareer: z
    .string()
    .trim()
    .max(100, 'Target career cannot exceed 100 characters')
    .optional(),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  education: z
    .string()
    .trim()
    .max(200, 'Education cannot exceed 200 characters')
    .optional(),
  college: z
    .string()
    .trim()
    .max(200, 'College cannot exceed 200 characters')
    .optional(),
  semester: z
    .number()
    .int('Semester must be an integer')
    .min(1, 'Semester must be at least 1')
    .max(20, 'Semester cannot exceed 20')
    .optional(),
  interests: z
    .array(z.string().trim().min(1, 'Interest tag cannot be empty'))
    .optional(),
  targetCareer: z
    .string()
    .trim()
    .max(100, 'Target career cannot exceed 100 characters')
    .optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validates request body against a Zod schema.
 */
export const validateProfileBody = (schema: ZodSchema) => {
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
