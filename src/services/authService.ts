/**
 * Auth Service Layer
 * ------------------
 * Decouples authentication logic from UI components and AuthContext.
 *
 * CURRENT PHASE (Frontend-First):
 * Validates against DEMO_USERS when backend API is unavailable.
 *
 * FUTURE PHASE:
 * The catch block/fallback will be retired in favor of direct live API responses
 * without changing any calling UI components or Context signatures.
 */

import { authApi } from '@/api/endpoints/auth.api'
import { DEMO_USERS } from '@/data/demo.users'
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth.types'
import { UserProfile } from '@/types/user.types'

export const authService = {
  /**
   * Authenticate user with credentials.
   * Attempts live API first; gracefully falls back to demo account authentication.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Try backend endpoint first
      return await authApi.login(credentials)
    } catch {
      // Demo Fallback Authentication
      const normalizedEmail = credentials.email.trim().toLowerCase()
      const matched = DEMO_USERS.find(
        (u) =>
          (u.email.toLowerCase() === normalizedEmail ||
            (u.profile.email.toLowerCase() === normalizedEmail)) &&
          u.password === credentials.password
      )

      if (matched) {
        return {
          user: matched.profile,
          token: `demo-jwt-${matched.profile.role}-${matched.profile.id}-${Date.now()}`,
        }
      }

      throw new Error('Invalid email or password. Please check your credentials or use the demo accounts.')
    }
  },

  /**
   * Register a new user account.
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      return await authApi.register(credentials)
    } catch {
      // Demo registration fallback
      const newUser: UserProfile = {
        id: `student_${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: 'student',
        careerGoal: 'Frontend Developer',
        createdAt: new Date().toISOString(),
      }

      return {
        user: newUser,
        token: `demo-jwt-student-${newUser.id}`,
      }
    }
  },

  /**
   * Terminate active session.
   */
  logout: async (): Promise<void> => {
    try {
      await authApi.logout()
    } catch {
      // Graceful local cleanup
    }
  },

  /**
   * Fetch current authenticated user session profile.
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      return await authApi.getCurrentUser()
    } catch {
      return null
    }
  },

  /**
   * Get demo credentials for UI demonstration convenience.
   */
  getDemoCredentials: () => {
    return DEMO_USERS.map(({ email, password, profile }) => ({
      email,
      password,
      role: profile.role || 'student',
      name: profile.name,
    }))
  },
}
