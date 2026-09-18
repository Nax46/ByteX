import { apiClient } from '@/api/client'
import { UserProfile, UserStats } from '@/types/user.types'
import { OnboardingPayload } from '@/types/onboarding.types'

/**
 * Profile & Onboarding API Module
 * NOTE FOR BACKEND TEAM:
 * Update endpoint paths and payload schemas here when ready.
 */
export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/profile')
    return res.data
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await apiClient.put<UserProfile, Partial<UserProfile>>('/profile', payload)
    return res.data
  },

  getUserStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<UserStats>('/profile/stats')
    return res.data
  },

  submitOnboarding: async (payload: OnboardingPayload): Promise<{ success: boolean; profile: UserProfile }> => {
    // Single structured onboarding payload for backend team
    const res = await apiClient.post<{ success: boolean; profile: UserProfile }, OnboardingPayload>(
      '/onboarding',
      payload
    )
    return res.data
  },
}
