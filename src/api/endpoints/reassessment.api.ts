import { apiClient } from '@/api/client'
import {
  ReassessmentSummaryResponse,
  ReassessmentSubmitResponse,
  ReassessmentSubmissionAnswer,
} from '@/types/assessment.types'

/**
 * Reassessment API Layer
 * Connects frontend to Person 2 Reassessment Engine:
 * - GET  /api/v1/intelligence/reassessment/summary
 * - POST /api/v1/intelligence/reassessment/:assessmentId/submit
 */
export const reassessmentApi = {
  /**
   * Retrieves comparative reassessment summary comparing the latest completed attempt against the previous attempt.
   * Derives student identity from req.user on backend.
   */
  getSummary: async (assessmentId?: string): Promise<ReassessmentSummaryResponse> => {
    const url = assessmentId
      ? `/v1/intelligence/reassessment/summary?assessmentId=${encodeURIComponent(assessmentId)}`
      : '/v1/intelligence/reassessment/summary'
    const res = await apiClient.get<ReassessmentSummaryResponse>(url)
    return res.data
  },

  /**
   * Submits student's reassessment answers for deterministic evaluation and persistence.
   * Returns evaluated attempt with computed skillScores and points.
   */
  submitAttempt: async (
    assessmentId: string,
    answers: ReassessmentSubmissionAnswer[]
  ): Promise<ReassessmentSubmitResponse> => {
    const res = await apiClient.post<ReassessmentSubmitResponse>(
      `/v1/intelligence/reassessment/${assessmentId}/submit`,
      { answers }
    )
    return res.data
  },
}
