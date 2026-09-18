export type AssessmentStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED'

export interface DashboardProfileData {
  completed: boolean
  fullName?: string
  targetCareer?: string
}

export interface DashboardOnboardingData {
  completed: boolean
}

export interface DashboardLatestAttempt {
  id: string
  status: AssessmentStatus
  startedAt: string
  submittedAt: string | null
}

export interface DashboardAssessmentData {
  hasActiveAttempt: boolean
  latestAttempt: DashboardLatestAttempt | null
}

export interface DashboardSummary {
  profile: DashboardProfileData
  onboarding: DashboardOnboardingData
  assessment: DashboardAssessmentData
}
