import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import {
  IAIService,
  AIPersonalizationContext,
  AISkillExplanationResponse,
  AIPersonalizedSummaryResponse,
  AIMentorResponse,
} from '../../types/ai.js';
import {
  AI_SYSTEM_INSTRUCTIONS,
  buildSkillExplanationPrompt,
  buildPersonalizedSummaryPrompt,
  buildAIMentorQueryPrompt,
} from './aiPromptTemplates.js';
import {
  AISkillExplanationResponseSchema,
  AIPersonalizedSummaryResponseSchema,
  AIMentorResponseSchema,
} from '../../schemas/aiValidation.js';

export class GeminiAdapter implements IAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-2.0-flash';
  private timeoutMs = 5000;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY.trim());
      } catch (err: any) {
        logger.warn({ error: err?.message }, '[GeminiAdapter] Failed to initialize GoogleGenerativeAI client');
        this.genAI = null;
      }
    }
  }

  /**
   * Helper method to invoke Gemini with strict timeout and fallback safety.
   */
  private async generateWithTimeout(promptText: string): Promise<string | null> {
    if (!this.genAI) {
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: AI_SYSTEM_INSTRUCTIONS,
      });

      const generatePromise = model.generateContent(promptText);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Gemini API request timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
      });

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      logger.warn({ error: err?.message }, '[GeminiAdapter] AI generation failed or timed out. Engaging fallback.');
      return null;
    }
  }

  /**
   * Extracts clean JSON from raw Gemini output string.
   */
  private extractJSON(rawText: string): any {
    let cleanText = rawText.trim();

    // Strip markdown code fences if present (e.g. ```json ... ```)
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    return JSON.parse(cleanText);
  }

  /**
   * 1. Generate Skill Explanation (Structured JSON with Zod validation)
   */
  public async generateSkillExplanation(
    context: AIPersonalizationContext,
    skillSlug: string
  ): Promise<AISkillExplanationResponse> {
    const prompt = buildSkillExplanationPrompt(context, skillSlug);
    const rawOutput = await this.generateWithTimeout(prompt);

    if (rawOutput) {
      try {
        const json = this.extractJSON(rawOutput);
        const validated = AISkillExplanationResponseSchema.parse({
          ...json,
          isFallback: false,
        });
        return validated as AISkillExplanationResponse;
      } catch (err: any) {
        logger.warn({ error: err?.message }, '[GeminiAdapter] Skill explanation JSON parse/validation failed');
      }
    }

    // Controlled Fallback
    const targetGap = context.skillGaps.find(
      (s) => s.skillSlug.toLowerCase() === skillSlug.toLowerCase()
    );

    const skillName = targetGap ? targetGap.skillName : skillSlug;
    const currentLevel = targetGap ? targetGap.currentLevel : 0;
    const targetLevel = targetGap ? targetGap.targetLevel : 80;
    const gap = targetGap ? targetGap.gap : 80;

    return {
      skillName,
      currentLevel,
      targetLevel,
      gap,
      explanation: `Mastering ${skillName} is a foundational prerequisite for your target career as a ${context.targetCareer}. Closing your ${gap}-point gap will unlock essential technical competencies required for production applications.`,
      recommendedActionPlan: [
        `Review core theoretical concepts and syntax for ${skillName}`,
        `Complete guided interactive exercises and practice labs`,
        `Build a hands-on portfolio project reinforcing ${skillName}`,
      ],
      keyTopicsToMaster: [
        `${skillName} Core Syntax & Patterns`,
        `Asynchronous Data Handling & Async Flow`,
        `Best Practices & Error Guardrails`,
      ],
      isFallback: true,
    };
  }

  /**
   * 2. Generate Personalized Summary (Structured JSON with Zod validation)
   */
  public async generatePersonalizedSummary(
    context: AIPersonalizationContext
  ): Promise<AIPersonalizedSummaryResponse> {
    const prompt = buildPersonalizedSummaryPrompt(context);
    const rawOutput = await this.generateWithTimeout(prompt);

    if (rawOutput) {
      try {
        const json = this.extractJSON(rawOutput);
        const validated = AIPersonalizedSummaryResponseSchema.parse({
          ...json,
          isFallback: false,
        });
        return validated as AIPersonalizedSummaryResponse;
      } catch (err: any) {
        logger.warn({ error: err?.message }, '[GeminiAdapter] Personalized summary JSON parse/validation failed');
      }
    }

    // Controlled Fallback
    const topSkill = context.topPrioritySkill || 'Core CS';

    return {
      headline: `Personalized ${context.targetCareer} Mastery Path`,
      summaryText: `Welcome ${context.studentName}! Your learning roadmap is tailored for ${context.targetCareer}. Focus first on closing your highest priority gap in ${topSkill}.`,
      topFocusSkills: [topSkill],
      encouragementQuote: '"The secret of getting ahead is getting started." — Mark Twain',
      nextBestAction: `Complete the practice exercises for ${topSkill} to accelerate your roadmap progress.`,
      isFallback: true,
    };
  }

  /**
   * 3. Ask AI Mentor (Structured JSON with Zod validation)
   */
  public async askAIMentor(
    context: AIPersonalizationContext,
    userQuery: string
  ): Promise<AIMentorResponse> {
    const prompt = buildAIMentorQueryPrompt(context, userQuery);
    const rawOutput = await this.generateWithTimeout(prompt);

    if (rawOutput) {
      try {
        const json = this.extractJSON(rawOutput);
        const validated = AIMentorResponseSchema.parse({
          ...json,
          isFallback: false,
        });
        return validated as AIMentorResponse;
      } catch (err: any) {
        logger.warn({ error: err?.message }, '[GeminiAdapter] AI Mentor query JSON parse/validation failed');
      }
    }

    // Controlled Fallback
    return {
      query: userQuery,
      answer: `As your ${context.targetCareer} career mentor, I recommend focusing on your active gap areas. "${userQuery}" is an important topic—start by working through the recommended resources in your custom roadmap!`,
      suggestedFollowUpQuestions: [
        `How does this skill connect to my ${context.targetCareer} roadmap?`,
        `What practice projects should I build to master this concept?`,
      ],
      referencedSkillNames: [context.topPrioritySkill || 'Software Development'],
      isFallback: true,
    };
  }

  /**
   * 4. Explain Resource Recommendation
   */
  public async explainResourceRecommendation(
    skillName: string,
    resourceTitle: string,
    userGap: number
  ): Promise<string> {
    const prompt = `Explain in 2 sentences why resource "${resourceTitle}" is ideal for a student with a ${userGap}-point gap in ${skillName}.`;
    const output = await this.generateWithTimeout(prompt);
    if (output && output.trim().length > 0) {
      return output.trim();
    }
    return `"${resourceTitle}" is specially selected to help you close your ${userGap}-point gap in ${skillName} with practical, high-yield learning materials.`;
  }

  /**
   * 5. Explain Project Recommendation
   */
  public async explainProjectRecommendation(
    skillName: string,
    projectTitle: string,
    userGap: number
  ): Promise<string> {
    const prompt = `Explain in 2 sentences why hands-on project "${projectTitle}" is ideal for practicing ${skillName} (Current Gap: ${userGap} pts).`;
    const output = await this.generateWithTimeout(prompt);
    if (output && output.trim().length > 0) {
      return output.trim();
    }
    return `Building "${projectTitle}" gives you hands-on experience applying ${skillName} concepts in a real-world project context.`;
  }
}
