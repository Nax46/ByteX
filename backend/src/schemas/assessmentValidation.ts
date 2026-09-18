import { z } from 'zod';
import { IQuestion, StudentFacingQuestionDTO } from '../types/assessment.js';

export const assessmentTypeEnum = z.enum(['DIAGNOSTIC', 'SKILL_SPECIFIC', 'REASSESSMENT']);
export const questionDifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const attemptStatusEnum = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']);

export const QuestionOptionZodSchema = z.object({
  optionId: z.string().min(1, 'optionId is required'),
  text: z.string().min(1, 'Option text is required').trim(),
});

export const QuestionCreateZodSchema = z.object({
  skillId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillId format'),
  assessmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assessmentId format').optional(),
  text: z.string().min(1, 'Question text cannot be empty').trim(),
  options: z.array(QuestionOptionZodSchema).min(2, 'At least 2 options are required'),
  correctOptionId: z.string().min(1, 'correctOptionId is required'),
  difficulty: questionDifficultyEnum,
  points: z.number().int().min(1).default(10),
  explanation: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine((data) => data.options.some((opt) => opt.optionId === data.correctOptionId), {
  message: 'correctOptionId must match one of the optionId values in options',
  path: ['correctOptionId'],
});

export const AssessmentCreateZodSchema = z.object({
  title: z.string().min(1, 'Assessment title is required').max(100).trim(),
  slug: z.string().min(1, 'Assessment slug is required').lowercase().trim().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  type: assessmentTypeEnum,
  description: z.string().optional(),
  targetCareerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid targetCareerId format').optional(),
  targetSkillIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid targetSkillId format')).min(1, 'At least one target skill is required'),
  durationMinutes: z.number().int().min(1).default(30),
  version: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export const AssessmentAttemptAnswerZodSchema = z.object({
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid questionId format'),
  selectedOptionId: z.string().min(1, 'selectedOptionId is required'),
  timeTakenSeconds: z.number().int().min(0).optional(),
});

export const AssessmentAttemptCreateZodSchema = z.object({
  studentProfileId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid studentProfileId format'),
  assessmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assessmentId format'),
  answers: z.array(AssessmentAttemptAnswerZodSchema).default([]),
});

/**
 * Question Security Helper
 * Sanitizes a question document by stripping correctOptionId and explanation
 * before serving it to student-facing APIs.
 */
export const toStudentFacingQuestionDTO = (question: any): StudentFacingQuestionDTO => {
  const plainObj = typeof question.toObject === 'function' ? question.toObject() : question;
  return {
    _id: plainObj._id ? plainObj._id.toString() : plainObj.id,
    skillId: plainObj.skillId ? plainObj.skillId.toString() : '',
    assessmentId: plainObj.assessmentId ? plainObj.assessmentId.toString() : undefined,
    text: plainObj.text,
    options: plainObj.options.map((opt: any) => ({
      optionId: opt.optionId,
      text: opt.text,
    })),
    difficulty: plainObj.difficulty,
    points: plainObj.points,
  };
};
