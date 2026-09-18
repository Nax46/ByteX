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
