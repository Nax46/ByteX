export type LeagueTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'

export interface LeagueMember {
  id: string
  rank: number
  name: string
  avatarUrl?: string
  targetCareer: string
  readinessScore: number
  verifiedEvidenceCount: number
  completedChallengesCount: number
  projectsBuiltCount: number
  tier: LeagueTier
  isCurrentUser: boolean
}

export interface LeagueSummary {
  currentRank: number
  totalMembers: number
  percentile: number
  tier: LeagueTier
  seasonName: string
  targetCareer: string
  userReadinessScore: number
  userVerifiedEvidenceCount: number
}
