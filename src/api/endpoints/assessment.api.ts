import { apiClient } from '@/api/client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
  SafeAssessmentAttempt,
  AssessmentStartResponse,
  AssessmentHistoryResponse,
  ReassessmentSummaryResponse,
  ReassessmentSubmitResponse,
  ReassessmentSubmissionAnswer,
} from '@/types/assessment.types'
import { DEMO_ASSESSMENT_QUESTIONS, DEMO_ASSESSMENT_RESULT } from '@/data/demo.assessment'
import { safeStorage } from '@/utils/storage'
import { reassessmentApi } from './reassessment.api'

const LATEST_RESULT_KEY = 'skillpath_latest_assessment_result'

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
   * Submits an active IN_PROGRESS assessment attempt or evaluates an assessment diagnostic.
   * If called with attemptId (string), submits to POST /api/assessment/:attemptId/submit.
   * If called with AssessmentSubmission payload, evaluates diagnostic and returns AssessmentResult.
   */
  submitAssessment: (async (
    attemptIdOrPayload: string | AssessmentSubmission,
    payload?: { answers?: Array<{ questionId: string; selectedOptionId: string }> }
  ): Promise<SafeAssessmentAttempt | AssessmentResult> => {
    if (typeof attemptIdOrPayload === 'string') {
      const res = await apiClient.post<{ attempt: SafeAssessmentAttempt } | SafeAssessmentAttempt>(
        `/assessment/${attemptIdOrPayload}/submit`,
        payload || { answers: [] }
      )
      const raw = res.data as unknown
      const attempt =
        (raw as { attempt?: SafeAssessmentAttempt })?.attempt || (raw as SafeAssessmentAttempt)
      return attempt
    }

    const subPayload = attemptIdOrPayload
    try {
      const res = await apiClient.post<AssessmentResult, AssessmentSubmission>(
        '/assessments/submit',
        subPayload
      )
      if (res.data) {
        safeStorage.setItem(LATEST_RESULT_KEY, res.data)
        return res.data
      }
    } catch {
      // Fallback: evaluate locally with 100% accuracy against answer keys
    }

    const totalQuestions = DEMO_ASSESSMENT_QUESTIONS.length
    let correctCount = 0
    const categoryStats: Record<string, { total: number; correct: number }> = {}
    const missedTopics: string[] = []

    DEMO_ASSESSMENT_QUESTIONS.forEach((q) => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0 }
      }
      categoryStats[q.category].total += 1

      const userAnswer = q.id ? subPayload.answers[q.id] : undefined
      const isCorrect = userAnswer === q.correctOptionId

      if (isCorrect) {
        correctCount += 1
        categoryStats[q.category].correct += 1
      } else {
        if (q.category === 'React') {
          missedTopics.push('React component optimization & lifecycle')
        } else if (q.category === 'JavaScript') {
          missedTopics.push('Advanced JavaScript closures & asynchronous execution')
        } else if (q.category === 'HTML & CSS') {
          missedTopics.push('CSS Flexbox alignment & responsive box-sizing')
        } else if (q.category === 'Tools & Version Control') {
          missedTopics.push('Git branching & stash workflows')
        } else if (q.category === 'Problem Solving') {
          missedTopics.push('Algorithmic time complexity analysis')
        } else {
          missedTopics.push('Web platform fundamentals & browser storage')
        }
      }
    })

    const uniqueGaps = Array.from(new Set(missedTopics)).slice(0, 4)
    const exactScore = Math.round((correctCount / totalQuestions) * 100)

    const evaluatedSkills = Object.entries(categoryStats).map(([skillName, stat]) => {
      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
      const level = pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1
      const delta = pct >= 80 ? 1 : pct <= 40 ? -1 : 0
      return { skillName, demonstratedLevel: level, delta }
    })

    const integrityStatus: AssessmentResult['integrityStatus'] =
      (subPayload.violations || 0) >= 3
        ? 'TERMINATED_VIOLATION'
        : (subPayload.violations || 0) > 0
        ? 'WARNING_ISSUED'
        : 'VERIFIED'

    const calculatedResult: AssessmentResult = {
      id: 'res_eval_' + Date.now(),
      assessmentId: subPayload.assessmentId || 'diag_assessment',
      title: 'Frontend Engineering Diagnostic',
      category: 'Frontend Development',
      completedAt: new Date().toISOString(),
      score: exactScore,
      totalQuestions,
      correctQuestions: correctCount,
      evaluatedSkills,
      identifiedGaps:
        uniqueGaps.length > 0
          ? uniqueGaps
          : ['Demonstrated mastery across core concepts. Ready for advanced system design.'],
      recommendedRoadmapSteps:
        exactScore >= 80
          ? [
              'Accelerate directly to Stage 5: Fullstack Architecture & API Design',
              'Build a comprehensive portfolio project demonstrating performance optimizations',
            ]
          : [
              'Strengthen core fundamentals in identified gap areas',
              'Practice daily code challenges focused on closures and React hooks',
              'Complete targeted learning modules before retaking diagnostic',
            ],
      tabSwitches: subPayload.tabSwitches || 0,
      violations: subPayload.violations || 0,
      integrityStatus,
    }

    safeStorage.setItem(LATEST_RESULT_KEY, calculatedResult)
    return calculatedResult
  }) as {
    (
      attemptId: string,
      payload?: { answers?: Array<{ questionId: string; selectedOptionId: string }> }
    ): Promise<SafeAssessmentAttempt>
    (payload: AssessmentSubmission): Promise<AssessmentResult>
  },

  /**
   * Legacy submission helper
   */
  submitAssessmentLegacy: async (payload: AssessmentSubmission): Promise<AssessmentResult> => {
    return assessmentApi.submitAssessment(payload) as Promise<AssessmentResult>
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
    try {
      const url = categoryId ? `/assessments/questions?category=${categoryId}` : '/assessments/questions'
      const res = await apiClient.get<AssessmentQuestion[]>(url)
      return res.data
    } catch {
      return DEMO_ASSESSMENT_QUESTIONS
    }
  },

  /**
   * Legacy result helpers
   */
  getLatestResult: async (): Promise<AssessmentResult> => {
    const cached = safeStorage.getItem<AssessmentResult>(LATEST_RESULT_KEY)
    if (cached) {
      return cached
    }
    try {
      const res = await apiClient.get<AssessmentResult>('/assessments/results/latest')
      return res.data
    } catch {
      return DEMO_ASSESSMENT_RESULT
    }
  },

  getAllResults: async (): Promise<AssessmentResult[]> => {
    const latest = safeStorage.getItem<AssessmentResult>(LATEST_RESULT_KEY)
    const list = latest ? [latest, DEMO_ASSESSMENT_RESULT] : [DEMO_ASSESSMENT_RESULT]
    try {
      const res = await apiClient.get<AssessmentResult[]>('/assessments/results')
      return res.data
    } catch {
      return list
    }
  },

  getReassessmentSummary: async (assessmentId?: string): Promise<ReassessmentSummaryResponse> => {
    return reassessmentApi.getSummary(assessmentId)
  },

  submitReassessment: async (
    assessmentId: string,
    answers: ReassessmentSubmissionAnswer[]
  ): Promise<ReassessmentSubmitResponse> => {
    return reassessmentApi.submitAttempt(assessmentId, answers)
  },
}
