import { apiClient } from '@/api/client'
import { UserProfile, UserStats } from '@/types/user.types'
import { OnboardingPayload } from '@/types/onboarding.types'
import { DEMO_USER_STATS } from '@/data/demo.dashboard'

/**
 * Profile & Onboarding API Module
 * Real backend integration:
 * - GET /api/profile
 * - POST /api/profile/onboarding
 * - PUT /api/profile
 * - GET /api/profile/stats
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
    payload: OnboardingBackendPayload | OnboardingPayload
  ): Promise<{ profile: BackendStudentProfile }> => {
    // If payload is structured OnboardingPayload, map to OnboardingBackendPayload
    const body: OnboardingBackendPayload =
      'personalInfo' in payload
        ? {
            fullName: payload.personalInfo.fullName,
            education: payload.education.degree,
            college: payload.education.institution,
            semester: 1,
            interests: payload.skills.knownSkills,
            targetCareer: payload.careerGoal.targetRole,
          }
        : payload

    const res = await apiClient.post<{ profile: BackendStudentProfile }, OnboardingBackendPayload>(
      '/profile/onboarding',
      body
    )
    return res.data
  },

  /**
   * Updates existing student profile (PUT /api/profile).
   */
  updateProfile: async (
    payload: Partial<OnboardingBackendPayload> | Partial<UserProfile>
  ): Promise<{ profile: BackendStudentProfile }> => {
    const res = await apiClient.put<{ profile: BackendStudentProfile }, typeof payload>(
      '/profile',
      payload
    )
    return res.data
  },

  /**
   * Retrieves aggregated profile stats (GET /api/profile/stats).
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      const res = await apiClient.get<UserStats>('/profile/stats')
      return res.data
    } catch {
      return DEMO_USER_STATS
    }
  },
}
