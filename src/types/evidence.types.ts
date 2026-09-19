export type EvidenceSourceType = 'ASSESSMENT' | 'CHALLENGE' | 'PROJECT' | 'ROADMAP_MILESTONE'

export type EvidenceVerificationStatus = 'VERIFIED' | 'COMPLETED' | 'IN_PROGRESS'

export interface SkillEvidenceItem {
  id: string
  title: string
  description: string
  skillName: string
  sourceType: EvidenceSourceType
  sourceUrl: string
  score?: number
  resultStatus: string
  verificationStatus: EvidenceVerificationStatus
  completedAt: string
  sourceId: string
  careerGoal?: string
}

export interface EvidenceSummaryStats {
  totalItems: number
  verifiedCount: number
  assessmentEvidenceCount: number
  challengeEvidenceCount: number
  projectEvidenceCount: number
  roadmapEvidenceCount: number
}
