import { apiClient } from '@/api/client'
import { aiApi } from './ai.api'

export interface MentorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
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
  suggestedActions?: {
    label: string
    route?: string
    skillId?: string
  }[]
}

const MENTOR_HISTORY_STORAGE_KEY = 'bytex_mentor_chat_history'

/**
 * AI Career Mentor API Module
 * ----------------------------
 * Integrates directly with Person 2's live AI backend endpoint:
 * POST /api/v1/intelligence/ai/mentor-ask
 */
export const mentorApi = {
  sendMessage: async (payload: MentorChatRequest): Promise<MentorChatResponse> => {
    try {
      const mentorAns = await aiApi.askAIMentor(payload.message)
      const assistantMsg: MentorMessage = {
        id: 'mentor_' + Date.now(),
        role: 'assistant',
        content: mentorAns.answer,
        timestamp: 'Just now',
      }

      // Persist to local session history
      try {
        const raw = localStorage.getItem(MENTOR_HISTORY_STORAGE_KEY)
        const current: MentorMessage[] = raw ? JSON.parse(raw) : []
        current.push({
          id: 'user_' + Date.now(),
          role: 'user',
          content: payload.message,
          timestamp: 'Just now',
        })
        current.push(assistantMsg)
        localStorage.setItem(MENTOR_HISTORY_STORAGE_KEY, JSON.stringify(current.slice(-30)))
      } catch {
        // Non-critical local storage error
      }

      return {
        message: assistantMsg,
        suggestedActions: mentorAns.suggestedFollowUpQuestions?.map((q) => ({
          label: q,
        })),
      }
    } catch {
      // Direct endpoint fallback
      const res = await apiClient.post<{ mentorResponse?: { answer: string; suggestedFollowUpQuestions?: string[] } }>(
        '/intelligence/ai/mentor-ask',
        { query: payload.message }
      )
      const ans = res.data?.mentorResponse?.answer || 'I am your AI Career Mentor. Focus on mastering your core priority skill gaps!'
      return {
        message: {
          id: 'mentor_' + Date.now(),
          role: 'assistant',
          content: ans,
          timestamp: 'Just now',
        },
        suggestedActions: res.data?.mentorResponse?.suggestedFollowUpQuestions?.map((q) => ({
          label: q,
        })),
      }
    }
  },

  getChatHistory: async (): Promise<MentorMessage[]> => {
    try {
      const raw = localStorage.getItem(MENTOR_HISTORY_STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch {
      // Return empty if storage unavailable
    }
    return []
  },

  clearChatHistory: (): void => {
    try {
      localStorage.removeItem(MENTOR_HISTORY_STORAGE_KEY)
    } catch {
      // Ignore
    }
  },
}

