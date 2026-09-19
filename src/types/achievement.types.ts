export type AchievementCategory =
  | 'SKILL'
  | 'CHALLENGE'
  | 'PROJECT'
  | 'ASSESSMENT'
  | 'ROADMAP'
  | 'CAREER'

export type AchievementStatus = 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED'

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  status: AchievementStatus
  unlockedAt?: string
  progressCurrent?: number
  progressTarget?: number
  requirement: string
  evidenceId?: string
  sourceType?: 'ASSESSMENT' | 'CHALLENGE' | 'PROJECT' | 'ROADMAP_MILESTONE'
  sourceUrl?: string
  skillName?: string
}

export interface AchievementSummary {
  totalUnlocked: number
  totalInProgress: number
  totalLocked: number
  totalAchievements: number
  unlockedByCategory: Record<AchievementCategory, number>
}
