/**
 * AI & Personalization Types
 * --------------------------
 * Matches Person 2's backend schemas and intelligence contracts:
 * - GET /api/v1/intelligence/ai/personalized-summary
 * - GET /api/v1/intelligence/ai/explain-skill/:skillSlug
 * - POST /api/v1/intelligence/ai/mentor-ask
 */

export interface AISkillGapContext {
  skillName: string
  skillSlug: string
  category: string
  currentLevel: number | null
  targetLevel: number
  gap: number
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  priorityScore: number
  priorityStatus: 'CRITICAL_GAP' | 'MODERATE_GAP' | 'LOW_GAP' | 'TARGET_MET' | 'NO_EVIDENCE'
}

export interface AIPersonalizationContext {
  studentProfileId: string
  userId: string
  studentName: string
  targetCareer: string
  careerSlug: string
  skillGaps: AISkillGapContext[]
  topPrioritySkill?: string
  topPriorityGap?: number
  topPriorityScore?: number
  activeRoadmapVersion?: number
  overallProgressPercent?: number
  completedModulesCount?: number
  totalModulesCount?: number
  lastActiveDate?: string
}

export interface AIPersonalizedSummary {
  headline: string
  summaryText: string
  topFocusSkills: string[]
  encouragementQuote: string
  nextBestAction: string
  isFallback: boolean
}

export interface PersonalizedSummaryResponse {
  personalizedSummary: AIPersonalizedSummary
  context: AIPersonalizationContext
}

export interface AISkillExplanation {
  skillName: string
  currentLevel: number | null
  targetLevel: number
  gap: number
  explanation: string
  recommendedActionPlan: string[]
  keyTopicsToMaster: string[]
  isFallback: boolean
}

export interface SkillExplanationResponse {
  explanation: AISkillExplanation
}

export interface AIMentorResponse {
  query: string
  answer: string
  suggestedFollowUpQuestions: string[]
  referencedSkillNames: string[]
  isFallback: boolean
}

export interface MentorQueryResponse {
  mentorResponse: AIMentorResponse
}

export interface CareerTrackRecommendation {
  id: string
  title: string
  slug: string
  alignment: number
  description: string
  existingSkills: string[]
  missingSkills: string[]
  recommendedNextStep: string
  isTargetRole: boolean
  category?: string
  topFocusSkills?: string[]
}
