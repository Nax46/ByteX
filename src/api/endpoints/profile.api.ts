import { apiClient } from '@/api/client'
import { UserProfile, UserStats } from '@/types/user.types'
import { OnboardingPayload } from '@/types/onboarding.types'
import { DEMO_STUDENT } from '@/data/demo.student'
import { DEMO_USER_STATS } from '@/data/demo.dashboard'

/**
 * Profile & Onboarding API Module
 * NOTE FOR BACKEND TEAM:
 * Update endpoint paths and payload schemas here when ready.
 *
 * DEMO FALLBACK: Returns demo student profile and stats when the backend is unavailable.
 * Simply remove the catch block when the backend is connected.
 */
export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const res = await apiClient.get<UserProfile>('/profile')
      return res.data
    } catch {
      return DEMO_STUDENT
    }
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const res = await apiClient.put<UserProfile, Partial<UserProfile>>('/profile', payload)
      return res.data
    } catch {
      return { ...DEMO_STUDENT, ...payload }
    }
  },

  getUserStats: async (): Promise<UserStats> => {
    try {
      const res = await apiClient.get<UserStats>('/profile/stats')
      return res.data
    } catch {
      return DEMO_USER_STATS
    }
  },

  submitOnboarding: async (payload: OnboardingPayload): Promise<{ success: boolean; profile: UserProfile }> => {
    try {
      // Single structured onboarding payload for backend team
      const res = await apiClient.post<{ success: boolean; profile: UserProfile }, OnboardingPayload>(
        '/onboarding',
        payload
      )
      return res.data
    } catch {
      // Silently succeed — navigate to dashboard regardless
      return { success: true, profile: DEMO_STUDENT }
    }
  },
}
