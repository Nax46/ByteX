import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types'
import { UserProfile } from '@/types/user.types'
import { storageService } from '@/services/storage.service'
import { authApi } from '@/api/endpoints/auth.api'
import { MOCK_USER } from '@/mocks/user.mock'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const INITIAL_MOCK_MODE = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storageService.getUser())
  const [token, setToken] = useState<string | null>(() => storageService.getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMockMode, setIsMockMode] = useState<boolean>(INITIAL_MOCK_MODE)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Sync token state changes & listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
      storageService.clearSession()
      setError('Your session has expired. Please log in again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  // Validate existing stored session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = storageService.getToken()
      const storedUser = storageService.getUser()

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      if (isMockMode) {
        setUser(storedUser || MOCK_USER)
        setToken(storedToken)
        setIsLoading(false)
        return
      }

      try {
        const liveUser = await authApi.getCurrentUser()
        setUser(liveUser)
        storageService.setUser(liveUser)
      } catch (err: unknown) {
        console.warn('Backend session verification failed, resetting credentials:', err)
        storageService.clearSession()
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isMockMode])

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true)
    setError(null)

    if (isMockMode) {
      // Isolated development mock authentication
      await new Promise((resolve) => setTimeout(resolve, 600)) // simulate brief latency
      const mockToken = 'mock_jwt_token_development_' + Date.now()
      const mockUserProfile: UserProfile = {
        ...MOCK_USER,
        email: credentials.email,
        name: credentials.email.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()),
      }

      storageService.setToken(mockToken)
      storageService.setUser(mockUserProfile)
      setToken(mockToken)
      setUser(mockUserProfile)
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.login(credentials)
      storageService.setToken(response.token)
      storageService.setUser(response.user)
      setToken(response.token)
      setUser(response.user)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to log in. Please verify your credentials.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true)
    setError(null)

    if (isMockMode) {
      // Isolated development mock registration
      await new Promise((resolve) => setTimeout(resolve, 600))
      const mockToken = 'mock_jwt_token_development_' + Date.now()
      const mockUserProfile: UserProfile = {
        ...MOCK_USER,
        name: credentials.name,
        email: credentials.email,
      }

      storageService.setToken(mockToken)
      storageService.setUser(mockUserProfile)
      setToken(mockToken)
      setUser(mockUserProfile)
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.register(credentials)
      storageService.setToken(response.token)
      storageService.setUser(response.user)
      setToken(response.token)
      setUser(response.user)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Registration failed. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    storageService.clearSession()
    setUser(null)
    setToken(null)
    setError(null)
    if (!isMockMode) {
      authApi.logout().catch(() => {})
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (isMockMode) return
    try {
      const liveUser = await authApi.getCurrentUser()
      setUser(liveUser)
      storageService.setUser(liveUser)
    } catch {
      // Silent error on refresh
    }
  }

  const toggleMockMode = (enabled?: boolean) => {
    setIsMockMode((prev) => (enabled !== undefined ? enabled : !prev))
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isMockMode,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    toggleMockMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
