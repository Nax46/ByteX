import { apiClient } from '../client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
} from '@/types/assessment.types'

/**
 * Assessment API Module
 * NOTE FOR BACKEND TEAM:
 * Wire finalized assessment questions and scoring evaluation endpoints here.
 */
export const assessmentApi = {
  getQuestions: async (categoryId?: string): Promise<AssessmentQuestion[]> => {
    const url = categoryId ? `/assessments/questions?category=${categoryId}` : '/assessments/questions'
    const res = await apiClient.get<AssessmentQuestion[]>(url)
    return res.data
  },

  submitAssessment: async (payload: AssessmentSubmission): Promise<AssessmentResult> => {
    const res = await apiClient.post<AssessmentResult, AssessmentSubmission>(
      '/assessments/submit',
      payload
    )
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
}
