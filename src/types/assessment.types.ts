export type QuestionType = 'MULTIPLE_CHOICE' | 'CODE_SNIPPET' | 'SCENARIO'

export interface QuestionOptionType {
  optionId?: string
  id?: string
  text: string
}

export interface AssessmentQuestion {
  _id?: string
  id?: string
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
