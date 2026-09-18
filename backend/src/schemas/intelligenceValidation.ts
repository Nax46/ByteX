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

export const roadmapModuleStatusEnum = z.enum(['LOCKED', 'IN_PROGRESS', 'COMPLETED']);
export const roadmapStatusEnum = z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']);

export const RoadmapModuleZodSchema = z.object({
  moduleId: z.string().min(1, 'moduleId is required').trim(),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  title: z.string().min(1, 'Module title is required').trim(),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Order must be at least 1'),
  targetLevel: z.number().min(0).max(100),
  currentLevel: z.number().min(0).max(100).nullable().optional(),
  gapMagnitude: z.number().min(0).max(100),
  priorityScore: z.number().min(0),
  prerequisites: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]).optional(),
  recommendedResourceIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]).optional(),
  recommendedProjectIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]).optional(),
  status: roadmapModuleStatusEnum.default('LOCKED'),
});

export const RoadmapCreateZodSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  studentProfileId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid careerId format'),
  title: z.string().optional(),
  description: z.string().optional(),
  version: z.number().int().min(1).default(1),
  isCurrent: z.boolean().default(true),
  status: roadmapStatusEnum.default('ACTIVE'),
  modules: z.array(RoadmapModuleZodSchema).default([]),
});

export const resourceTypeEnum = z.enum(['ARTICLE', 'VIDEO', 'COURSE', 'DOCUMENTATION', 'BOOK', 'PRACTICE', 'QUIZ']);
export const resourceDifficultyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const ResourceCreateZodSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  slug: z.string().min(1, 'Slug is required').lowercase().trim().regex(/^[a-z0-9-]+$/),
  description: z.string().min(1, 'Description is required').trim(),
  url: z.string().url('Must be a valid URL').trim(),
  type: resourceTypeEnum,
  provider: z.string().min(1, 'Provider is required').trim(),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  skillTag: z.string().optional(),
  difficulty: resourceDifficultyEnum,
  estimatedDuration: z.string().min(1, 'Estimated duration is required').trim(),
  rating: z.number().min(0).max(5).default(4.5).optional(),
  authorOrInstructor: z.string().optional(),
  isPaid: z.boolean().default(false).optional(),
  tags: z.array(z.string()).optional(),
});

export const ResourceQueryZodSchema = z.object({
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  skillTag: z.string().optional(),
  type: resourceTypeEnum.optional(),
  difficulty: resourceDifficultyEnum.optional(),
});

export const projectDifficultyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const ProjectCreateZodSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  slug: z.string().min(1, 'Slug is required').lowercase().trim().regex(/^[a-z0-9-]+$/),
  description: z.string().min(1, 'Description is required').trim(),
  difficulty: projectDifficultyEnum,
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  skillsReinforced: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]).optional(),
  technologies: z.array(z.string()).default([]),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1'),
  githubStarterUrl: z.string().url().optional().or(z.literal('')),
  architectureOverview: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
});

export const ProjectQueryZodSchema = z.object({
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  difficulty: projectDifficultyEnum.optional(),
});

