import { z } from 'zod';

export const updateModuleProgressZodSchema = z.object({
  progressPercent: z
    .number()
    .min(0, 'progressPercent must be greater than or equal to 0')
    .max(100, 'progressPercent must be less than or equal to 100')
    .refine((val) => !isNaN(val), { message: 'progressPercent must be a valid number' }),
});

export type UpdateModuleProgressDTO = z.infer<typeof updateModuleProgressZodSchema>;
