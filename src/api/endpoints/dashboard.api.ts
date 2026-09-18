import { apiClient } from '@/api/client'

export interface DashboardSummaryResponse {
  profile: {
    completed: boolean
    fullName?: string
    targetCareer?: string
  }
  onboarding: {
    completed: boolean
  }
  assessment: {
    hasActiveAttempt: boolean
    latestAttempt: {
      id: string
      status: string
      startedAt: string
      submittedAt: string | null
    } | null
  }
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const res = await apiClient.get<DashboardSummaryResponse>('/dashboard')
    return res.data
  },
}
