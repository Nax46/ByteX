import { apiClient } from '../client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
  SafeAssessmentAttempt,
  AssessmentStartResponse,
  AssessmentHistoryResponse,
} from '@/types/assessment.types'

/**
 * Assessment API Module
 * Connected to Person 1 Assessment API backend routes:
 * - POST /api/assessment/start
 * - GET  /api/assessment/:attemptId
 * - POST /api/assessment/:attemptId/submit
 * - GET  /api/assessment/history?page=1&limit=10
 */
export const assessmentApi = {
  /**
   * Starts a new assessment attempt or resumes an existing IN_PROGRESS attempt.
   * POST /api/assessment/start
   */
  startAssessment: async (): Promise<AssessmentStartResponse> => {
    const res = await apiClient.post<AssessmentStartResponse>('/assessment/start')
    return res.data
  },

  /**
   * Retrieves a specific assessment attempt by ID.
   * GET /api/assessment/:attemptId
   */
  getAttempt: async (attemptId: string): Promise<SafeAssessmentAttempt> => {
    const res = await apiClient.get<{ attempt: SafeAssessmentAttempt } | SafeAssessmentAttempt>(
      `/assessment/${attemptId}`
    )
    const raw = res.data as unknown
    const attempt =
      (raw as { attempt?: SafeAssessmentAttempt })?.attempt || (raw as SafeAssessmentAttempt)
    return attempt
  },

  /**
   * Submits an active IN_PROGRESS assessment attempt.
   * POST /api/assessment/:attemptId/submit
   */
  submitAssessment: async (
    attemptId: string,
    payload?: { answers?: Array<{ questionId: string; selectedOptionId: string }> }
  ): Promise<SafeAssessmentAttempt> => {
    const res = await apiClient.post<{ attempt: SafeAssessmentAttempt } | SafeAssessmentAttempt>(
      `/assessment/${attemptId}/submit`,
      payload || { answers: [] }
    )
    const raw = res.data as unknown
    const attempt =
      (raw as { attempt?: SafeAssessmentAttempt })?.attempt || (raw as SafeAssessmentAttempt)
    return attempt
  },

  /**
   * Retrieves assessment attempt history for the authenticated user.
   * GET /api/assessment/history?page=1&limit=10
   */
  getHistory: async (page = 1, limit = 10): Promise<AssessmentHistoryResponse> => {
    const res = await apiClient.get<AssessmentHistoryResponse>(
      `/assessment/history?page=${page}&limit=${limit}`
    )
    return res.data
  },

  /**
   * Legacy question query helper
   */
  getQuestions: async (categoryId?: string): Promise<AssessmentQuestion[]> => {
    const url = categoryId ? `/assessments/questions?category=${categoryId}` : '/assessments/questions'
    const res = await apiClient.get<AssessmentQuestion[]>(url)
    return res.data
  },

  /**
   * Legacy submission helper
   */
  submitAssessmentLegacy: async (payload: AssessmentSubmission): Promise<AssessmentResult> => {
    const res = await apiClient.post<AssessmentResult, AssessmentSubmission>(
      '/assessments/submit',
      payload
    )
    return res.data
  },

  /**
   * Legacy result helpers
   */
  getLatestResult: async (): Promise<AssessmentResult> => {
    const res = await apiClient.get<AssessmentResult>('/assessments/results/latest')
    return res.data
  },

  getAllResults: async (): Promise<AssessmentResult[]> => {
    const res = await apiClient.get<AssessmentResult[]>('/assessments/results')
    return res.data
  },
}
