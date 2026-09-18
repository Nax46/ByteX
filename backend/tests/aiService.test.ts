import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiAdapter } from '../src/services/ai/geminiAdapter.js';
import { getAIService } from '../src/services/ai/aiServiceFactory.js';
import { AIPersonalizationContext } from '../src/types/ai.js';
import {
  AISkillExplanationResponseSchema,
  AIPersonalizedSummaryResponseSchema,
  AIMentorResponseSchema,
} from '../src/schemas/aiValidation.js';

describe('P15 — AI Service Abstraction & Gemini Adapter Tests', () => {
  const mockContext: AIPersonalizationContext = {
    studentProfileId: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    studentName: 'Alice Test',
    targetCareer: 'Full Stack Developer',
    careerSlug: 'full-stack-developer',
    skillGaps: [
      {
        skillName: 'React',
        skillSlug: 'react',
        category: 'FRAMEWORK',
        currentLevel: 40,
        targetLevel: 80,
        gap: 40,
        importance: 'HIGH',
        priorityScore: 78.5,
        priorityStatus: 'CRITICAL_GAP',
      },
    ],
    topPrioritySkill: 'React',
    topPriorityGap: 40,
    topPriorityScore: 78.5,
    activeRoadmapVersion: 1,
    overallProgressPercent: 25,
    completedModulesCount: 1,
    totalModulesCount: 4,
  };

  it('Test 1 — AIServiceFactory returns valid singleton implementing IAIService', () => {
    const service = getAIService();
    expect(service).toBeDefined();
    expect(typeof service.generateSkillExplanation).toBe('function');
    expect(typeof service.generatePersonalizedSummary).toBe('function');
    expect(typeof service.askAIMentor).toBe('function');
  });

  it('Test 2 — GeminiAdapter returns safe structured fallback when API key is unconfigured', async () => {
    const adapter = new GeminiAdapter();

    const summary = await adapter.generatePersonalizedSummary(mockContext);
    expect(summary).toBeDefined();
    expect(summary.isFallback).toBe(true);
    expect(summary.headline).toContain('Full Stack Developer');
    expect(summary.topFocusSkills).toContain('React');

    const validated = AIPersonalizedSummaryResponseSchema.parse(summary);
    expect(validated.headline).toBeDefined();
  });

  it('Test 3 — GeminiAdapter generateSkillExplanation returns structured fallback adhering to Zod schema', async () => {
    const adapter = new GeminiAdapter();

    const explanation = await adapter.generateSkillExplanation(mockContext, 'react');
    expect(explanation).toBeDefined();
    expect(explanation.skillName).toBe('React');
    expect(explanation.gap).toBe(40);
    expect(explanation.recommendedActionPlan.length).toBeGreaterThan(0);

    const validated = AISkillExplanationResponseSchema.parse(explanation);
    expect(validated.skillName).toBe('React');
  });

  it('Test 4 — GeminiAdapter askAIMentor returns structured mentor answer adhering to Zod schema', async () => {
    const adapter = new GeminiAdapter();

    const mentorAns = await adapter.askAIMentor(mockContext, 'How do I master React hooks?');
    expect(mentorAns).toBeDefined();
    expect(mentorAns.query).toBe('How do I master React hooks?');
    expect(mentorAns.suggestedFollowUpQuestions.length).toBeGreaterThan(0);

    const validated = AIMentorResponseSchema.parse(mentorAns);
    expect(validated.query).toBe('How do I master React hooks?');
  });

  it('Test 5 — GeminiAdapter explainResourceRecommendation and explainProjectRecommendation string outputs', async () => {
    const adapter = new GeminiAdapter();

    const resExp = await adapter.explainResourceRecommendation('React', 'React Official Docs', 40);
    expect(resExp).toContain('React Official Docs');

    const projExp = await adapter.explainProjectRecommendation('React', 'Kanban Board Project', 40);
    expect(projExp).toContain('Kanban Board Project');
  });

  it('Test 6 — Security Check: AI outputs never contain API keys or raw tokens', async () => {
    const adapter = new GeminiAdapter();
    const summary = await adapter.generatePersonalizedSummary(mockContext);
    const jsonString = JSON.stringify(summary);

    expect(jsonString).not.toContain('GEMINI_API_KEY');
    expect(jsonString).not.toContain('JWT_SECRET');
  });
});
