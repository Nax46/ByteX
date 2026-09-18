import { PriorityStatus, SkillImportance } from './intelligence.js';

export interface AISkillGapContext {
  skillName: string;
  skillSlug: string;
  category: string;
  currentLevel: number | null;
  targetLevel: number;
  gap: number;
  importance: SkillImportance;
  priorityScore: number;
  priorityStatus: PriorityStatus;
}

export interface AIPersonalizationContext {
  studentProfileId: string;
  userId: string;
  studentName: string;
  targetCareer: string;
  careerSlug: string;
  skillGaps: AISkillGapContext[];
  topPrioritySkill?: string;
  topPriorityGap?: number;
  topPriorityScore?: number;
  activeRoadmapVersion?: number;
  overallProgressPercent?: number;
  completedModulesCount?: number;
  totalModulesCount?: number;
  lastActiveDate?: string;
}

export interface AISkillExplanationResponse {
  skillName: string;
  currentLevel: number | null;
  targetLevel: number;
  gap: number;
  explanation: string;
  recommendedActionPlan: string[];
  keyTopicsToMaster: string[];
  isFallback: boolean;
}

export interface AIPersonalizedSummaryResponse {
  headline: string;
  summaryText: string;
  topFocusSkills: string[];
  encouragementQuote: string;
  nextBestAction: string;
  isFallback: boolean;
}

export interface AIMentorResponse {
  query: string;
  answer: string;
  suggestedFollowUpQuestions: string[];
  referencedSkillNames: string[];
  isFallback: boolean;
}

export interface IAIService {
  generateSkillExplanation(
    context: AIPersonalizationContext,
    skillSlug: string
  ): Promise<AISkillExplanationResponse>;

  generatePersonalizedSummary(
    context: AIPersonalizationContext
  ): Promise<AIPersonalizedSummaryResponse>;

  askAIMentor(
    context: AIPersonalizationContext,
    userQuery: string
  ): Promise<AIMentorResponse>;

  explainResourceRecommendation(
    skillName: string,
    resourceTitle: string,
    userGap: number
  ): Promise<string>;

  explainProjectRecommendation(
    skillName: string,
    projectTitle: string,
    userGap: number
  ): Promise<string>;
}
