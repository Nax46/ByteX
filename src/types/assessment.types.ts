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

export interface QuestionOptionType {
  optionId?: string
  id?: string
  text: string
}

export interface AssessmentQuestion {
  _id?: string
  id?: string
  skillId?: string
  assessmentId?: string
  text?: string
  question?: string
  type?: QuestionType
  options: QuestionOptionType[]
  codeSnippet?: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  correctOptionId?: string
  explanation?: string
}

export interface AssessmentSubmission {
  assessmentId: string
  answers: Record<string, string> // questionId -> optionId
  timeSpentSeconds: number
  tabSwitches?: number
  violations?: number
  integrityStatus?: 'VERIFIED' | 'WARNING_ISSUED' | 'TERMINATED_VIOLATION'
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
  tabSwitches?: number
  violations?: number
  integrityStatus?: 'VERIFIED' | 'WARNING_ISSUED' | 'TERMINATED_VIOLATION'
}

export type ScoreTrend = 'IMPROVED' | 'DECLINED' | 'UNCHANGED' | 'NEW_EVIDENCE'

export interface ISkillScoreComparison {
  skillId: string
  skillName?: string
  skillSlug?: string
  previousScore: number | null
  currentScore: number
  change: number | null
  trend: ScoreTrend
}

export interface IReassessmentSummary {
  studentProfileId: string
  latestAttemptId: string
  previousAttemptId: string | null
  latestCompletedAt: string
  previousCompletedAt: string | null
  skillComparisons: ISkillScoreComparison[]
  overallPreviousScore: number | null
  overallCurrentScore: number
  overallChange: number | null
  attemptCount: number
}

export interface ReassessmentSummaryResponse {
  summary: IReassessmentSummary
}

export interface ReassessmentSubmissionAnswer {
  questionId: string
  selectedOptionId: string
  timeTakenSeconds?: number
}

export interface ReassessmentSubmitResponse {
  attempt: {
    _id: string
    id?: string
    studentProfileId?: string
    assessmentId?: string
    status: string
    totalEarnedPoints?: number
    totalMaxPoints?: number
    completedAt?: string
    skillScores?: Array<{
      skillId: string
      score: number
      totalQuestions: number
      correctCount: number
      earnedPoints: number
      maxPoints: number
    }>
    answers?: Array<{
      questionId: string
      selectedOptionId: string
      isCorrect?: boolean
      pointsEarned?: number
      timeTakenSeconds?: number
    }>
  }
}


