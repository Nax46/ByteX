import { apiClient } from '@/api/client'

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

/**
 * AI Mentor API Module
 * NOTE FOR BACKEND TEAM:
 * Secure AI calls (Gemini/LLMs) are orchestrated through the backend server.
 * Frontend sends user prompts; backend injects API keys securely and returns formatted guidance.
 */
export const mentorApi = {
  sendMessage: async (payload: MentorChatRequest): Promise<MentorChatResponse> => {
    const res = await apiClient.post<MentorChatResponse, MentorChatRequest>('/mentor/chat', payload)
    return res.data
  },

  getChatHistory: async (): Promise<MentorMessage[]> => {
    const res = await apiClient.get<MentorMessage[]>('/mentor/history')
    return res.data
  },
}
