import { apiClient } from '@/api/client'
import { ROUTES } from '@/constants/routes'

export interface MentorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  whyItMatters?: string
  suggestedFollowUpQuestions?: string[]
  suggestedActions?: {
    label: string
    route: string
  }[]
  isFallback?: boolean
}

export interface MentorChatRequest {
  message: string
  context?: {
    currentSkill?: string
    currentMilestoneId?: string
  }
}

export interface MentorChatResponse {
  message: MentorMessage
}

export interface AISkillGapItem {
  skillName: string
  skillSlug: string
  category: string
  currentLevel: number
  targetLevel: number
  gap: number
  importance: string
  priorityScore: number
  priorityStatus: string
}

export interface AIPersonalizationContext {
  studentProfileId: string
  userId: string
  studentName: string
  targetCareer: string
  careerSlug: string
  skillGaps: AISkillGapItem[]
  topPrioritySkill?: string
  topPriorityGap?: number
  topPriorityScore?: number
  activeRoadmapVersion: number
  overallProgressPercent: number
  completedModulesCount: number
  totalModulesCount: number
}

export interface AIPersonalizedSummaryData {
  personalizedSummary: {
    headline: string
    summaryText: string
    topFocusSkills: string[]
    encouragementQuote: string
    nextBestAction: string
    isFallback?: boolean
  }
  context: AIPersonalizationContext
}

export interface BackendAIMentorResponse {
  mentorResponse: {
    query: string
    answer: string
    suggestedFollowUpQuestions?: string[]
    referencedSkillNames?: string[]
    isFallback?: boolean
  }
}

const STORAGE_KEY = 'bytex_mentor_history_v1'

/**
 * AI Mentor API Module
 * Connects directly to backend endpoint `/intelligence/ai/mentor-ask`
 * while supporting local chat persistence for student sessions.
 */
export const mentorApi = {
  getPersonalizedSummary: async (): Promise<AIPersonalizedSummaryData | null> => {
    try {
      const res = await apiClient.get<AIPersonalizedSummaryData>('/intelligence/ai/personalized-summary')
      return res.data || null
    } catch {
      return null
    }
  },

  sendMessage: async (payload: MentorChatRequest): Promise<MentorChatResponse> => {
    try {
      const res = await apiClient.post<BackendAIMentorResponse, { query: string }>(
        '/intelligence/ai/mentor-ask',
        { query: payload.message }
      )

      const backendData = res.data?.mentorResponse
      if (!backendData) {
        throw new Error('Malformed backend response structure')
      }

      // Contextually infer relevant navigation CTAs based on message query & reference skills
      const queryLower = payload.message.toLowerCase()
      const suggestedActions: { label: string; route: string }[] = []

      if (queryLower.includes('today') || queryLower.includes('next') || queryLower.includes('focus') || queryLower.includes('do now')) {
        suggestedActions.push({ label: "Today's Action", route: ROUTES.TODAY })
      }
      if (queryLower.includes('challenge') || queryLower.includes('practice') || queryLower.includes('battle') || queryLower.includes('test')) {
        suggestedActions.push({ label: 'Practical Challenges', route: ROUTES.CHALLENGES })
      }
      if (queryLower.includes('roadmap') || queryLower.includes('module') || queryLower.includes('step') || queryLower.includes('learn')) {
        suggestedActions.push({ label: 'View Roadmap', route: ROUTES.ROADMAP })
      }
      if (queryLower.includes('evidence') || queryLower.includes('proof') || queryLower.includes('demonstrate') || queryLower.includes('passport')) {
        suggestedActions.push({ label: 'Skill Evidence', route: ROUTES.SKILL_EVIDENCE })
      }
      if (queryLower.includes('gap') || queryLower.includes('bottleneck') || queryLower.includes('score')) {
        suggestedActions.push({ label: 'Skill Gap Matrix', route: ROUTES.SKILL_GAP })
      }

      // Default CTAs if none explicitly matched
      if (suggestedActions.length === 0) {
        suggestedActions.push({ label: "Today's Action", route: ROUTES.TODAY })
        suggestedActions.push({ label: 'View Roadmap', route: ROUTES.ROADMAP })
      }

      const assistantMsg: MentorMessage = {
        id: 'msg_ast_' + Date.now(),
        role: 'assistant',
        content: backendData.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUpQuestions: backendData.suggestedFollowUpQuestions || [],
        suggestedActions,
        isFallback: backendData.isFallback,
      }

      return { message: assistantMsg }
    } catch {
      // Robust Graceful Fallback if backend AI is unavailable
      const queryLower = payload.message.toLowerCase()
      let fallbackText = `I'm analyzing your SkillPath context. To achieve your target career goal, focus on addressing your highest priority skill gap in your roadmap.`

      if (queryLower.includes('today') || queryLower.includes('next')) {
        fallbackText = `Your highest priority focus today is to complete your current active roadmap module and demonstrate capability through a practical challenge.`
      } else if (queryLower.includes('gap') || queryLower.includes('bottleneck')) {
        fallbackText = `Your skill gap matrix highlights key area(s) needing practice. Recommended next step: review theory and attempt a practical challenge to submit evidence.`
      }

      const fallbackMsg: MentorMessage = {
        id: 'msg_ast_fb_' + Date.now(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUpQuestions: [
          'What should I focus on today?',
          'Why is my current skill gap important?',
          'How can I build evidence for this skill?',
        ],
        suggestedActions: [
          { label: "Today's Action", route: ROUTES.TODAY },
          { label: 'View Roadmap', route: ROUTES.ROADMAP },
        ],
        isFallback: true,
      }

      return { message: fallbackMsg }
    }
  },

  getChatHistory: async (): Promise<MentorMessage[]> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // Ignore storage parse errors
    }
    return []
  },

  saveChatHistory: (messages: MentorMessage[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
    } catch {
      // Ignore quota errors
    }
  },

  clearChatHistory: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  },
}
