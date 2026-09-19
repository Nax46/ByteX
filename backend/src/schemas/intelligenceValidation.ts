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

export const ResourceQueryZodSchema = z.object({
  skillId: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  type: z.enum(['ARTICLE', 'VIDEO', 'COURSE', 'DOCUMENTATION', 'BOOK', 'PRACTICE', 'QUIZ']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const ResourceCreateZodSchema = z.object({
  title: z.string().min(1, 'Resource title is required').max(200),
  slug: z.string().min(1).lowercase().regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['ARTICLE', 'VIDEO', 'COURSE', 'DOCUMENTATION', 'BOOK', 'PRACTICE', 'QUIZ']),
  provider: z.string().min(1),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  skillTag: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedDuration: z.string().min(1),
  rating: z.number().min(0).max(5).default(4.5).optional(),
  authorOrInstructor: z.string().optional(),
  isPaid: z.boolean().default(false).optional(),
  tags: z.array(z.string()).optional(),
});

export const ProjectQueryZodSchema = z.object({
  skillId: z.string().optional(),
  careerId: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const ProjectCreateZodSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200),
  slug: z.string().min(1).lowercase().regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid careerId format').optional(),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  skillsReinforced: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  technologies: z.array(z.string()).optional(),
  estimatedHours: z.number().min(1),
  githubStarterUrl: z.string().optional(),
  architectureOverview: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
});

export const RoadmapModuleZodSchema = z.object({
  moduleId: z.string().min(1),
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().min(1),
  targetLevel: z.number().min(0).max(100),
  currentLevel: z.number().nullable().optional(),
  gapMagnitude: z.number().min(0).max(100),
  priorityScore: z.number().min(0),
  prerequisites: z.array(z.string()).optional(),
  recommendedResourceIds: z.array(z.string()).optional(),
  recommendedProjectIds: z.array(z.string()).optional(),
  status: z.enum(['LOCKED', 'IN_PROGRESS', 'COMPLETED']).default('LOCKED'),
});

export const RoadmapCreateZodSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  studentProfileId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  careerId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  title: z.string().optional(),
  description: z.string().optional(),
  version: z.number().min(1).default(1),
  isCurrent: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).default('ACTIVE'),
  modules: z.array(RoadmapModuleZodSchema),
  generatedFromAssessmentAttemptId: z.string().nullable().optional(),
  generationReason: z.enum(['INITIAL', 'REASSESSMENT', 'ADAPTIVE']).default('INITIAL').optional(),
});


