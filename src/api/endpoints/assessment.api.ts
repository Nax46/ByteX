import { apiClient } from '../client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
} from '@/types/assessment.types'
import { DEMO_ASSESSMENT_QUESTIONS, DEMO_ASSESSMENT_RESULT } from '@/data/demo.assessment'

/**
 * Assessment API Module
 * NOTE FOR BACKEND TEAM:
 * Wire finalized assessment questions and scoring evaluation endpoints here.
 *
 * DEMO FALLBACK: Returns 15 realistic frontend engineering questions when the backend
 * is unavailable. Simply remove the catch block when the backend is connected.
 */
export const assessmentApi = {
  getQuestions: async (categoryId?: string): Promise<AssessmentQuestion[]> => {
    try {
      const url = categoryId ? `/assessments/questions?category=${categoryId}` : '/assessments/questions'
      const res = await apiClient.get<AssessmentQuestion[]>(url)
      return res.data
    } catch {
      return DEMO_ASSESSMENT_QUESTIONS
    }
  },

  submitAssessment: async (payload: AssessmentSubmission): Promise<AssessmentResult> => {
    try {
      const res = await apiClient.post<AssessmentResult, AssessmentSubmission>(
        '/assessments/submit',
        payload
      )
      return res.data
    } catch {
      // Calculate a local score from the submitted answers
      const total = Object.keys(payload.answers).length
      const score = Math.min(100, Math.round((total / DEMO_ASSESSMENT_QUESTIONS.length) * 100))
      return {
        ...DEMO_ASSESSMENT_RESULT,
        id: 'res_local_' + Date.now(),
        completedAt: new Date().toISOString(),
        score,
        totalQuestions: DEMO_ASSESSMENT_QUESTIONS.length,
        correctQuestions: total,
      }
    }
  },

  getLatestResult: async (): Promise<AssessmentResult> => {
    try {
      const res = await apiClient.get<AssessmentResult>('/assessments/results/latest')
      return res.data
    } catch {
      return DEMO_ASSESSMENT_RESULT
    }
  },

  getAllResults: async (): Promise<AssessmentResult[]> => {
    try {
      const res = await apiClient.get<AssessmentResult[]>('/assessments/results')
      return res.data
    } catch {
      return [DEMO_ASSESSMENT_RESULT]
    }
  },
}
