import { apiClient } from '@/api/client'
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
    // Endpoint contract placeholder: POST /auth/register
    const res = await apiClient.post<AuthResponse, RegisterCredentials>('/auth/register', credentials)
    return res.data
  },

  logout: async (): Promise<void> => {
    // Endpoint contract placeholder: POST /auth/logout
    await apiClient.post<void>('/auth/logout')
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get<{ user: UserProfile } | UserProfile>('/auth/me')
    const dataAny = res.data as any
    return dataAny?.user || dataAny
  },
}
