import { UserProfile } from './user.types'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: UserProfile
  token: string
  refreshToken?: string
  expiresIn?: number
}

export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isMockMode: boolean
  error: string | null
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  clearError: () => void
  toggleMockMode: (enabled?: boolean) => void
}
