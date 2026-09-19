import { apiClient } from '@/api/client'
import {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSubmission,
} from '@/types/assessment.types'
import { DEMO_ASSESSMENT_QUESTIONS, DEMO_ASSESSMENT_RESULT } from '@/data/demo.assessment'
import { safeStorage } from '@/utils/storage'
import { ReassessmentSummaryResponse } from '@/types/intelligence.types'

const LATEST_RESULT_KEY = 'skillpath_latest_assessment_result'

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

      const qId = q.id || q._id || ''
      const userAnswer = qId ? payload.answers[qId] : undefined
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
      (payload.violations || 0) >= 3
        ? 'TERMINATED_VIOLATION'
        : (payload.violations || 0) > 0
        ? 'WARNING_ISSUED'
        : 'VERIFIED'

    const calculatedResult: AssessmentResult = {
      id: 'res_eval_' + Date.now(),
      assessmentId: payload.assessmentId || 'diag_assessment',
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
      tabSwitches: payload.tabSwitches || 0,
      violations: payload.violations || 0,
      integrityStatus,
    }

    safeStorage.setItem(LATEST_RESULT_KEY, calculatedResult)
    return calculatedResult
  },

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
