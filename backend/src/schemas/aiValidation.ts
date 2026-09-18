import { z } from 'zod';

export const AISkillExplanationResponseSchema = z.object({
  skillName: z.string().min(1),
  currentLevel: z.number().nullable(),
  targetLevel: z.number(),
  gap: z.number(),
  explanation: z.string().min(1),
  recommendedActionPlan: z.array(z.string()).default([]),
  keyTopicsToMaster: z.array(z.string()).default([]),
  isFallback: z.boolean().default(false),
});

export const AIPersonalizedSummaryResponseSchema = z.object({
  headline: z.string().min(1),
  summaryText: z.string().min(1),
  topFocusSkills: z.array(z.string()).default([]),
  encouragementQuote: z.string().min(1),
  nextBestAction: z.string().min(1),
  isFallback: z.boolean().default(false),
});

export const AIMentorResponseSchema = z.object({
  query: z.string().min(1),
  answer: z.string().min(1),
  suggestedFollowUpQuestions: z.array(z.string()).default([]),
  referencedSkillNames: z.array(z.string()).default([]),
  isFallback: z.boolean().default(false),
});

export const AIMentorQueryInputSchema = z.object({
  query: z
    .string()
    .min(1, 'Query cannot be empty')
    .max(500, 'Query cannot exceed 500 characters')
    .trim(),
});
