export type BattleCategory = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'API' | 'SYSTEM_DESIGN'

export type BattleDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type BattleStatus = 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED'

export interface SkillBattle {
  id: string
  title: string
  description: string
  problemStatement: string
  skillName: string
  category: BattleCategory
  difficulty: BattleDifficulty
  timeLimitMinutes: number
  status: BattleStatus
  opponentName: string
  opponentRole: string
  targetRole: string
  starterCode?: string
  requirements: string[]
  score?: number
  opponentScore?: number
  resultOutcome?: 'WON' | 'LOST' | 'TIED'
  feedback?: string[]
  completedAt?: string
}

export interface BattleSubmissionPayload {
  battleId: string
  solutionText: string
}

export interface BattleEvaluationResult {
  battleId: string
  score: number
  opponentScore: number
  resultOutcome: 'WON' | 'LOST' | 'TIED'
  feedback: string[]
  evidenceCreated: boolean
}
