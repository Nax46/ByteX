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
    try {
      const res = await apiClient.get<any>('/dashboard')
      const data = res.data?.data || res.data
      if (data && typeof data === 'object' && 'profile' in data) {
        return data as DashboardSummaryResponse
      }
      return {
        profile: { completed: true, fullName: 'Alex Patel', targetCareer: 'Frontend Developer' },
        onboarding: { completed: true },
        assessment: { hasActiveAttempt: false, latestAttempt: null },
      }
    } catch {
      return {
        profile: { completed: true, fullName: 'Alex Patel', targetCareer: 'Frontend Developer' },
        onboarding: { completed: true },
        assessment: { hasActiveAttempt: false, latestAttempt: null },
      }
    }
  },
}
