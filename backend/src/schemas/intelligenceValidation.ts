import { z } from 'zod';

export const skillCategoryEnum = z.enum(['TECHNICAL', 'SOFT', 'TOOL', 'FRAMEWORK', 'CORE_CS']);
export const skillImportanceEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const SkillCreateZodSchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty').max(100, 'Skill name too long').trim(),
  slug: z.string().min(1, 'Skill slug cannot be empty').lowercase().trim().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  category: skillCategoryEnum,
  description: z.string().optional(),
  maxLevel: z.number().int().min(1).max(100).default(100),
});

export const CareerCreateZodSchema = z.object({
  title: z.string().min(1, 'Career title cannot be empty').max(100, 'Career title too long').trim(),
  slug: z.string().min(1, 'Career slug cannot be empty').lowercase().trim().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CareerSkillCreateZodSchema = z.object({
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid careerId format'),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  requiredLevel: z.number().min(0, 'requiredLevel must be at least 0').max(100, 'requiredLevel cannot exceed 100'),
  importance: skillImportanceEnum,
  weight: z.number().min(0.0).max(1.0).default(1.0).optional(),
  prerequisites: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid prerequisite skillId format')).default([]).optional(),
});
