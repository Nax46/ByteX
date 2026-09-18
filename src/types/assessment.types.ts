export type AssessmentStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED'

export interface SafeAssessmentAttempt {
  id: string
  userId: string
  status: AssessmentStatus
  startedAt: string
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AssessmentStartResponse {
  attempt: SafeAssessmentAttempt
  isExisting: boolean
}

export interface AssessmentAttemptResponse {
  attempt: SafeAssessmentAttempt
}

export interface AssessmentHistoryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AssessmentHistoryResponse {
  attempts: SafeAssessmentAttempt[]
  pagination: AssessmentHistoryPagination
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'CODE_SNIPPET' | 'SCENARIO'

export interface AssessmentQuestion {
  id: string
  text: string
  type: QuestionType
  options: {
    id: string
    text: string
  }[]
  codeSnippet?: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface AssessmentSubmission {
  assessmentId: string
  answers: Record<string, string> // questionId -> optionId
  timeSpentSeconds: number
}

export interface AssessmentResult {
  id: string
  assessmentId: string
  title: string
  category: string
  completedAt: string
  score: number // 0-100
  totalQuestions: number
  correctQuestions: number
  evaluatedSkills: {
    skillName: string
    demonstratedLevel: number
    delta: number
  }[]
  identifiedGaps: string[]
  recommendedRoadmapSteps: string[]
}

