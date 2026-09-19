export type ChallengeDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type ChallengeCategory = 'CODING' | 'DEBUGGING' | 'API' | 'DATABASE' | 'FRONTEND' | 'SYSTEM_DESIGN'

export interface PracticalChallenge {
  id: string
  title: string
  description: string
  problemStatement: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  skillTag: string
  estimatedMinutes: number
  starterCode?: string
  expectedOutput?: string
  requirements: string[]
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface ChallengeSubmission {
  challengeId: string
  solutionCode: string
}

export interface ChallengeEvaluationResult {
  challengeId: string
  score: number
  status: 'PASSED' | 'NEEDS_WORK'
  skillsDemonstrated: string[]
  feedbackWell: string[]
  feedbackImprove: string[]
  submittedAt: string
}
