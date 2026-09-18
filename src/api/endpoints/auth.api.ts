import { apiClient } from '../client'
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth.types'
import { UserProfile } from '@/types/user.types'

/**
 * Auth API Module
 * NOTE FOR BACKEND TEAM:
 * Wire finalized authentication endpoints here.
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Endpoint contract placeholder: POST /auth/login
    const res = await apiClient.post<AuthResponse, LoginCredentials>('/auth/login', credentials)
    return res.data
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Confirm-password is frontend-only and MUST NOT be sent to the backend
    const { confirmPassword: _, ...payload } = credentials
    const res = await apiClient.post<AuthResponse, typeof payload>('/auth/register', payload)
    return res.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post<void>('/auth/logout')
    } catch {
      // Local session cleanup is handled by storage service
    }
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    // Contract: GET /auth/me returns { user: SafeUser } inside response.data
    const res = await apiClient.get<{ user?: UserProfile } | UserProfile>('/auth/me')
    const userData = (res.data as { user?: UserProfile })?.user || (res.data as UserProfile)
    return userData
  },
}
