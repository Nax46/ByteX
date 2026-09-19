import { apiClient } from '@/api/client'
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth.types'
import { UserProfile } from '@/types/user.types'

/**
 * Auth API Module
 * Directly interfaces with backend Express authentication routes.
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<any, LoginCredentials>('/auth/login', credentials)
    const data = res.data?.data || res.data
    const rawUser = data?.user || data
    const rawRole = rawUser?.role ? String(rawUser.role).toLowerCase() : 'student'
    const user: UserProfile = {
      ...rawUser,
      id: rawUser?._id || rawUser?.id || `user_${Date.now()}`,
      name: rawUser?.fullName || rawUser?.name || 'Learner',
      fullName: rawUser?.fullName || rawUser?.name || 'Learner',
      email: rawUser?.email || credentials.email,
      role: (rawRole === 'admin' ? 'admin' : rawRole === 'mentor' ? 'mentor' : 'student') as 'student' | 'admin' | 'mentor',
      careerGoal: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
      targetCareer: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
    }
    return { user, token: data?.token || '' }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<any, RegisterCredentials>('/auth/register', credentials)
    const data = res.data?.data || res.data
    const rawUser = data?.user || data
    const rawRole = rawUser?.role ? String(rawUser.role).toLowerCase() : 'student'
    const user: UserProfile = {
      ...rawUser,
      id: rawUser?._id || rawUser?.id || `user_${Date.now()}`,
      name: rawUser?.fullName || rawUser?.name || credentials.name,
      fullName: rawUser?.fullName || rawUser?.name || credentials.name,
      email: rawUser?.email || credentials.email,
      role: (rawRole === 'admin' ? 'admin' : rawRole === 'mentor' ? 'mentor' : 'student') as 'student' | 'admin' | 'mentor',
      careerGoal: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
      targetCareer: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
    }
    return { user, token: data?.token || '' }
  },

  logout: async (): Promise<void> => {
    // JWT Bearer token authentication session is terminated client-side via storageService.clearSession()
    return Promise.resolve()
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get<any>('/auth/me')
    const data = res.data?.data || res.data
    const rawUser = data?.user || data
    const rawRole = rawUser?.role ? String(rawUser.role).toLowerCase() : 'student'
    return {
      ...rawUser,
      id: rawUser?._id || rawUser?.id || 'user_me',
      name: rawUser?.fullName || rawUser?.name || 'Learner',
      fullName: rawUser?.fullName || rawUser?.name || 'Learner',
      email: rawUser?.email || '',
      role: (rawRole === 'admin' ? 'admin' : rawRole === 'mentor' ? 'mentor' : 'student') as 'student' | 'admin' | 'mentor',
      careerGoal: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
      targetCareer: rawUser?.targetCareer || rawUser?.careerGoal || 'Full Stack Developer',
    }
  },
}
