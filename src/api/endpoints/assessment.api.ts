import { apiClient } from '@/api/client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
} from '@/types/assessment.types'

export interface StartAssessmentResponse {
  attempt: {
    id: string
    userId: string
    status: string
    startedAt: string
    submittedAt: string | null
  }
  isExisting: boolean
}

export interface ReassessmentSummaryResponse {
  summary: {
    latestAttemptId: string
    previousAttemptId: string | null
    overallPreviousScore: number
    overallCurrentScore: number
    overallChange: number
    attemptCount: number
    skillComparisons: Array<{
      skillId: string
      skillName: string
      previousScore: number | null
      currentScore: number
      change: number
      trend: 'IMPROVED' | 'DECLINED' | 'UNCHANGED' | 'NEW_EVIDENCE'
    }>
  }
}

export const assessmentApi = {
  getQuestions: async (categoryId?: string): Promise<AssessmentQuestion[]> => {
    const url = categoryId ? `/assessments/questions?category=${categoryId}` : '/assessments/questions'
    const res = await apiClient.get<AssessmentQuestion[]>(url)
    return res.data
  },

  startAssessment: async (): Promise<StartAssessmentResponse> => {
    const res = await apiClient.post<StartAssessmentResponse>('/assessment/start')
    return res.data
  },

  submitAssessment: async (attemptId: string, payload?: AssessmentSubmission): Promise<{ attempt: unknown }> => {
    const res = await apiClient.post<{ attempt: unknown }>(`/assessment/${attemptId}/submit`, payload)
    return res.data
  },

  getAttempt: async (attemptId: string): Promise<{ attempt: unknown }> => {
    const res = await apiClient.get<{ attempt: unknown }>(`/assessment/${attemptId}`)
    return res.data
  },

  getLatestResult: async (): Promise<AssessmentResult> => {
    const res = await apiClient.get<AssessmentResult>('/assessments/results/latest')
    return res.data
  },

  getAllResults: async (): Promise<AssessmentResult[]> => {
    const res = await apiClient.get<AssessmentResult[]>('/assessments/results')
    return res.data
  },

  getReassessmentSummary: async (): Promise<ReassessmentSummaryResponse> => {
    const res = await apiClient.get<ReassessmentSummaryResponse>('/v1/intelligence/reassessment/summary')
    return res.data
  },

  submitReassessment: async (
    assessmentId: string,
    answers: Array<{ questionId: string; selectedOptionId: string; timeTakenSeconds?: number }>
  ): Promise<{ attempt: unknown }> => {
    const res = await apiClient.post<{ attempt: unknown }>(`/v1/intelligence/reassessment/${assessmentId}/submit`, {
      answers,
    })
    return res.data
  },
}
