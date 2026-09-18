import { apiClient } from '../client'
import { UserProfile, UserStats } from '@/types/user.types'
import { OnboardingPayload } from '@/types/onboarding.types'

/**
 * Profile & Onboarding API Module
 * NOTE FOR BACKEND TEAM:
 * Update endpoint paths and payload schemas here when ready.
 */
export interface BackendStudentProfile {
  id: string
  userId: string
  fullName: string
  education?: string
  college?: string
  semester?: number
  interests: string[]
  targetCareer?: string
  createdAt?: string
  updatedAt?: string
}

export interface OnboardingBackendPayload {
  fullName: string
  education?: string
  college?: string
  semester?: number
  interests?: string[]
  targetCareer?: string
}

export const profileApi = {
  /**
   * Retrieves current student profile (GET /api/profile).
   * Returns null if user has not completed onboarding yet (404).
   */
  getProfile: async (): Promise<BackendStudentProfile | null> => {
    try {
      const res = await apiClient.get<{ profile?: BackendStudentProfile } | BackendStudentProfile>('/profile')
      const profile = (res.data as { profile?: BackendStudentProfile })?.profile || (res.data as BackendStudentProfile)
      return profile || null
    } catch (err: any) {
      if (err?.status === 404) {
        return null
      }
      throw err
    }
  },

  /**
   * Submits initial student onboarding profile (POST /api/profile/onboarding).
   */
  submitOnboarding: async (
    payload: OnboardingBackendPayload
  ): Promise<{ profile: BackendStudentProfile }> => {
    const res = await apiClient.post<{ profile: BackendStudentProfile }, OnboardingBackendPayload>(
      '/profile/onboarding',
      payload
    )
    return res.data
  },

  /**
   * Updates existing student profile (PUT /api/profile).
   */
  updateProfile: async (
    payload: Partial<OnboardingBackendPayload>
  ): Promise<{ profile: BackendStudentProfile }> => {
    const res = await apiClient.put<{ profile: BackendStudentProfile }, Partial<OnboardingBackendPayload>>(
      '/profile',
      payload
    )
    return res.data
  },

  /**
   * Retrieves aggregated profile stats (GET /api/profile/stats).
   */
  getUserStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<UserStats>('/profile/stats')
    return res.data
  },
}
