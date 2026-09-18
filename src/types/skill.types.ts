export type GapPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Skill {
  id: string
  name: string
  category: string
  currentLevel: number // e.g., 1-5 or 0-100%
  targetLevel: number  // e.g., 1-5 or 0-100%
  progress: number     // 0-100%
  lastAssessed?: string
}

export interface SkillGap {
  skillId: string
  skillName: string
  category: string
  currentLevel: number
  targetLevel: number
  gap: number
  priority: GapPriority
  recommendedAction?: string
}

export interface CareerGoal {
  id: string
  name: string
  description?: string
  requiredSkills: {
    skillName: string
    targetLevel: number
  }[]
  matchPercentage?: number
}

export interface ISkillGapPrioritySnapshot {
  skillId: string
  skillName?: string
  skillSlug?: string
  currentLevel: number | null
  targetLevel: number
  gap: number
  hasEvidence: boolean
  importance: string
  weight: number
  prerequisites: string[]
  isPrerequisiteForOthers: boolean
  priority: {
    priorityScore: number
    strategyName: string
    isProvisional: boolean
    priorityStatus: string
    explanation: string
  }
}

export interface ISkillGapPriorityReadout {
  snapshots: ISkillGapPrioritySnapshot[]
  targetCareerTitle?: string
  overallReadinessScore?: number
  metSkillsCount?: number
  totalRequiredSkills?: number
}
